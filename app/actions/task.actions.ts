"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/types";
import { createEvent, deleteEvent, updateEvent } from "@/lib/googleCalendar";
import { calculateXp, calculateStreak } from "@/utils/gamification";
import { GoogleGenAI } from "@google/genai";

export async function createTask(formData: FormData): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (authError || !user) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const module_link = formData.get("module_link") as string;
    const scheduled_time = formData.get("scheduled_time") as string;
    const duration_estimate_minutes = parseInt(formData.get("duration_estimate_minutes") as string, 10);

    if (!title || !scheduled_time || isNaN(duration_estimate_minutes)) {
      return { success: false, error: "Title, Scheduled Time, and Duration are required." };
    }

    // Prepare Google Calendar Sync
    const providerToken = session?.provider_token;
    let googleEventId = null;

    if (providerToken) {
      try {
        const startDate = new Date(scheduled_time);
        const endDate = new Date(startDate.getTime() + duration_estimate_minutes * 60000);

        const gEvent = await createEvent(providerToken, {
          summary: title,
          description: description ? `${description}\n\nModule Link: ${module_link || "-"}` : `Module Link: ${module_link || "-"}`,
          start: { dateTime: startDate.toISOString() },
          end: { dateTime: endDate.toISOString() },
        });

        googleEventId = gEvent.id;
      } catch (err: any) {
        console.warn("Failed to sync to Google Calendar:", err);
        // Approach: If Google API fails, we STILL save the task to the database but without the google_event_id.
        // This ensures the user's primary workflow isn't blocked by third-party API issues.
      }
    }

    const { error: insertError } = await supabase.from("tasks").insert({
      user_id: user.id,
      title,
      description: description || null,
      module_link: module_link || null,
      scheduled_time: new Date(scheduled_time).toISOString(),
      duration_estimate_minutes,
      google_event_id: googleEventId,
      status: "pending",
    });

    if (insertError) {
      console.error("Task Insertion Error:", insertError);
      return { success: false, error: "Failed to create task." };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error creating task:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function deleteTask(taskId: string): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return { success: false, error: "Unauthorized." };

    // Fetch the task first to get the google_event_id
    const { data: task } = await supabase.from("tasks").select("google_event_id").eq("id", taskId).eq("user_id", user.id).single();

    if (task?.google_event_id && session?.provider_token) {
      try {
        await deleteEvent(session.provider_token, task.google_event_id);
      } catch (err) {
        console.warn("Failed to delete Google Event", err);
        // Approach: Proceed to delete from local DB even if Google Calendar delete fails.
      }
    }

    const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", user.id);

    if (error) return { success: false, error: "Failed to delete task." };

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Unexpected error." };
  }
}

export async function toggleTaskStatus(taskId: string, currentStatus: "pending" | "done"): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized." };

    const newStatus = currentStatus === "pending" ? "done" : "pending";

    // Fetch the task to get scheduled_time, created_at, and sub_tasks
    const { data: task } = await supabase.from("tasks").select("scheduled_time, created_at, sub_tasks").eq("id", taskId).single();

    if (!task) return { success: false, error: "Task not found" };

    const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId).eq("user_id", user.id);

    if (error) return { success: false, error: "Failed to update task." };

    // PHASE 3: GAMIFICATION CORE LOGIC
    if (newStatus === "done") {
      const { data: userData } = await supabase.from("users").select("xp, streak_count, last_active_date").eq("id", user.id).single();

      if (userData) {
        const now = new Date();
        const scheduledTime = new Date(task.scheduled_time);
        const createdAt = new Date(task.created_at);

        // 1. XP Logic (pure, testable)
        const subTasksTotal = task.sub_tasks ? task.sub_tasks.length : 0;
        const subTasksDone = task.sub_tasks ? task.sub_tasks.filter((st: any) => st.done).length : 0;
        const { earnedXp } = calculateXp(now, scheduledTime, subTasksDone, subTasksTotal);
        const newXp = userData.xp + earnedXp;

        // 2. Streak Logic (pure, testable)
        const { newStreakCount, newLastActiveDate } = calculateStreak(userData.streak_count, userData.last_active_date, now);

        await supabase.from("users").update({ xp: newXp, streak_count: newStreakCount, last_active_date: newLastActiveDate }).eq("id", user.id);
      }
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { success: false, error: "Unexpected error." };
  }
}

export async function saveSubTasks(taskId: string, subTasks: { id: string; title: string; done: boolean }[]): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized." };

    const { error } = await supabase.from("tasks").update({ sub_tasks: subTasks }).eq("id", taskId).eq("user_id", user.id);

    if (error) return { success: false, error: "Failed to save sub tasks." };

    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { success: false, error: "Unexpected error." };
  }
}

export async function updateTaskDetails(taskId: string, title: string, description: string | null): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized." };

    const { error } = await supabase.from("tasks").update({ title, description }).eq("id", taskId).eq("user_id", user.id);

    if (error) return { success: false, error: "Failed to update task details." };

    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { success: false, error: "Unexpected error." };
  }
}

export async function analyzeTaskWithAI(title: string, description: string, moduleLink: string): Promise<ActionResponse<{ summary: string; estimatedMinutes: number }>> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Analisis tugas berikut dan berikan breakdown estimasi waktu pengerjaan dalam menit, serta summary tugas yang lebih detail berdasarkan deskripsi user dan/atau link modul (anda dapat menebak konteksnya).
Judul: ${title || "Tidak ada"}
Deskripsi User: ${description || "Tidak ada"}
Link Modul: ${moduleLink || "Tidak ada"}

Kembalikan respon DALAM FORMAT JSON murni (tanpa markdown backticks) dengan keys:
- "summary": (string) Ringkasan dan breakdown langkah-langkah tugas.
- "estimatedMinutes": (number) Estimasi waktu pengerjaan dalam menit.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Kamu adalah AI asisten yang hanya merespon dalam format JSON murni.",
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    const jsonStr = response.text || "{}";
    const parsedData = JSON.parse(jsonStr);

    return { success: true, data: parsedData };
  } catch (error) {
    return { success: false, error: (error as Error).message || "Gagal analisis tugas" };
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
        scheduled_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      },
      {
        user_id: userId,
        title: "🧠 Coba AI Strategist",
        description: "Bikin task baru, lalu klik tombol 'AI Strategist' di kartunya buat liat keajaiban breakdown tugas!",
        duration_estimate_minutes: 30,
        status: 'pending',
        scheduled_time: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
      },
      {
        user_id: userId,
        title: "📚 Connect Google Drive ke Learning Hub",
        description: "Upload materi kuliah kamu ke Learning Hub dan coba mode SKS atau Binge-Watch.",
        duration_estimate_minutes: 20,
        status: 'pending',
        scheduled_time: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
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

export async function generateTaskBreakdown(title: string, description: string | null, moduleLink: string | null): Promise<string[]> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    
    let userContext = "";
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('major, interests, learning_type')
        .eq('id', user.id)
        .single();
        
      if (profile && profile.major) {
        userContext = `\nContext User:\n- Jurusan: ${profile.major}\n- Minat: ${profile.interests || 'Umum'}\n- Tipe Belajar: ${profile.learning_type === 'ngebut' ? 'Ngebut/Speedrunner' : 'Santai/Chill'}`;
      }
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const systemInstruction = `Kamu adalah DoJo Strategist, asisten produktivitas Gen-Z yang asik, objektif, dan suportif.
Tugasmu adalah memecah tugas menjadi 3-5 subtasks yang doable.
Karaktermu: Casual Gen-Z (pake bahasa gaul dikit kayak 'ngab', 'gas', 'santuy'), tapi tetap profesional dan fokus ke hasil.
Berikan afirmasi positif di awal atau akhir respon (misal: "Gaskeun ngab, lo pasti bisa!", "Chill aja, kita pecah pelan-pelan").
${userContext}`;

    const prompt = `Break down this task into 3-5 manageable subtasks.
Task Title: "${title}"
Task Description: "${description || "Tidak ada deskripsi tambahan"}"
Module Link: "${moduleLink || "Tidak ada"}"

Kembalikan respon DALAM FORMAT JSON array of strings murni (tanpa markdown backticks).
Contoh output: ["Poin 1", "Poin 2", "Poin 3"]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    const jsonStr = response.text || "[]";
    const parsedData = JSON.parse(jsonStr);
    
    if (Array.isArray(parsedData) && parsedData.length > 0) {
      return parsedData.map(item => String(item));
    }
    
    throw new Error("Format respons tidak valid");
  } catch (error) {
    console.error("Failed to generate task breakdown:", error);
    return [
      `Googling tipis-tipis cari referensi buat "${title}" 🔍`,
      `Bikin kerangka kasarnya dulu, no overthinking ✍️`,
      `Drafting isinya, yang penting kelar dulu bos 🏃♂️`,
      `Review bentar biar makin mantap ☕`,
      `Submit! You nailed it ngab! 🎉`
    ];
  }
}