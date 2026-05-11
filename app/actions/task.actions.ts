"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ActionResponse, Task } from "@/types";
import { calculateXp, calculateStreak } from "@/lib/gamification";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getTasks(): Promise<Task[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("scheduled_time", { ascending: true });
    
  return (data as Task[]) || [];
}

export async function createTask(formData: FormData): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const scheduled_time = formData.get("scheduled_time") as string;
    const duration_estimate_minutes = parseInt(formData.get("duration_estimate_minutes") as string);
    const module_link = formData.get("module_link") as string;

    const { error } = await supabase.from("tasks").insert({
      user_id: user.id,
      title,
      description,
      scheduled_time,
      duration_estimate_minutes,
      module_link,
      status: 'pending'
    });

    if (error) throw error;

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("Create Task Error:", err);
    return { success: false, error: err.message || "Gagal membuat tugas" };
  }
}

export async function deleteTask(taskId: string): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", user.id);
    if (error) throw error;

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: (err as Error).message };
  }
}

export async function toggleTaskStatus(taskId: string, currentStatus: string): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const newStatus = currentStatus === 'done' ? 'pending' : 'done';
    
    const { data: task } = await supabase.from("tasks").select("scheduled_time, created_at, sub_tasks").eq("id", taskId).single();
    if (!task) return { success: false, error: "Task not found" };

    const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId).eq("user_id", user.id);
    if (error) throw error;

    if (newStatus === "done") {
      const { data: userData } = await supabase.from("users").select("xp, streak_count, last_active_date").eq("id", user.id).single();
      if (userData) {
        const now = new Date();
        const subTasksTotal = task.sub_tasks ? task.sub_tasks.length : 0;
        const subTasksDone = task.sub_tasks ? task.sub_tasks.filter((st: any) => st.done).length : 0;
        
        const { earnedXp } = calculateXp(now, new Date(task.scheduled_time), subTasksDone, subTasksTotal);
        const { newStreakCount, newLastActiveDate } = calculateStreak(userData.streak_count, userData.last_active_date, now);

        await supabase.from("users").update({ 
          xp: userData.xp + earnedXp, 
          streak_count: newStreakCount, 
          last_active_date: newLastActiveDate 
        }).eq("id", user.id);
      }
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: (err as Error).message };
  }
}

export async function updateTaskDetails(taskId: string, title: string, description: string | null): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase.from("tasks").update({ title, description }).eq("id", taskId).eq("user_id", user.id);
    if (error) throw error;

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: (err as Error).message };
  }
}

export async function saveSubTasks(taskId: string, subTasks: any[]): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase.from("tasks").update({ sub_tasks: subTasks }).eq("id", taskId).eq("user_id", user.id);
    if (error) throw error;

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: (err as Error).message };
  }
}

export async function analyzeTaskWithAI(title: string, description: string, moduleLink: string): Promise<ActionResponse<{ summary: string; estimatedMinutes: number }>> {
  try {
    const prompt = `Analisis tugas berikut dan berikan breakdown estimasi waktu pengerjaan dalam menit, serta summary tugas yang lebih detail.
Judul: ${title}
Deskripsi: ${description}
Link: ${moduleLink}

Kembalikan respon JSON dengan keys: "summary" (string), "estimatedMinutes" (number).`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Kamu adalah AI asisten yang hanya merespon dalam format JSON murni.",
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    return { success: true, data: parsedData };
  } catch (err: any) {
    console.error("AI Analysis Error:", err);
    return { success: false, error: err.message || "Gagal analisis AI" };
  }
}

export async function generateTaskBreakdown(title: string, description: string | null, moduleLink: string | null): Promise<ActionResponse<string[]>> {
  try {
    const prompt = `Break down this task into 3-5 manageable subtasks.
Task Title: "${title}"
Task Description: "${description || "Tidak ada deskripsi tambahan"}"
Module Link: "${moduleLink || "Tidak ada"}"

Kembalikan respon JSON array of strings murni. Contoh: ["Langkah 1", "Langkah 2"]`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Kamu adalah AI asisten yang hanya merespon dalam format JSON murni.",
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    const parsedData = JSON.parse(response.text || "[]");
    return { success: true, data: parsedData };
  } catch (err: any) {
    console.error("AI Breakdown Error:", err);
    return { success: false, error: err.message || "Gagal breakdown AI" };
  }
}

export async function createWelcomeTasks(userId: string): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const welcomeTasks = [
      {
        user_id: userId,
        title: "👋 Eksplor DoJo Dashboard",
        description: "Lihat statistik XP, Streak, dan grafik produktivitas mingguan kamu di sini.",
        duration_estimate_minutes: 15,
        status: 'pending',
        scheduled_time: new Date(Date.now() + 3600000).toISOString(),
      },
      {
        user_id: userId,
        title: "🧠 Coba AI Strategist",
        description: "Bikin task baru, lalu klik tombol 'AI Strategist' di kartunya buat liat keajaiban breakdown tugas!",
        duration_estimate_minutes: 30,
        status: 'pending',
        scheduled_time: new Date(Date.now() + 7200000).toISOString(),
      },
      {
        user_id: userId,
        title: "📚 Connect Google Drive ke Learning Hub",
        description: "Upload materi kuliah kamu ke Learning Hub dan coba mode SKS atau Binge-Watch.",
        duration_estimate_minutes: 20,
        status: 'pending',
        scheduled_time: new Date(Date.now() + 86400000).toISOString(),
      }
    ];

    const { error } = await supabase.from('tasks').insert(welcomeTasks);
    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    console.error("Welcome Tasks Error:", err);
    return { success: false, error: err.message };
  }
}