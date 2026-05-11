"use server";

import { ActionResponse, LearningHistoryItem, Episode } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { google } from "googleapis";
import { GoogleGenAI } from "@google/genai";
import { parsePdfBuffer, chunkText } from "@/utils/pdfParser";
import { createEvent } from "@/lib/googleCalendar";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function syncGoogleDriveFolder(driveUrl: string): Promise<ActionResponse<{ filesCount: number; folderName: string; dbFolderId: string }>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const provider_token = session?.provider_token;

    if (sessionError || authError || !user || !provider_token) {
      return { success: false, error: "Unauthorized or Google Drive token missing. Please reconnect Google." };
    }

    const match = driveUrl.match(/folders\/([a-zA-Z0-9-_]+)/);
    if (!match) return { success: false, error: "Invalid Google Drive Folder URL." };
    const folderId = match[1];

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: provider_token });
    const drive = google.drive({ version: "v3", auth });

    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`,
      fields: "files(id, name)",
    });

    const files = res.data.files;
    if (!files || files.length === 0) return { success: false, error: "No PDF files found in this folder." };

    const { data: dbFolder, error: folderError } = await supabase
      .from("learning_folders")
      .insert({
        user_id: user.id,
        drive_folder_id: folderId,
        folder_name: `Synced Folder (${files.length} files)`,
      })
      .select("id")
      .single();

    if (folderError || !dbFolder) return { success: false, error: "Failed to create folder record in DB." };

    for (const file of files) {
      if (!file.id) continue;
      try {
        const fileRes = await drive.files.get({ fileId: file.id, alt: "media" }, { responseType: "arraybuffer" });
        const text = await parsePdfBuffer(Buffer.from(fileRes.data as ArrayBuffer));
        const chunks = chunkText(text, 1000);

        for (const chunk of chunks) {
          if (!chunk.trim()) continue;
          
          const embeddingRes = await ai.models.embedContent({
            model: "gemini-embedding-2",
            contents: chunk,
            config: { outputDimensionality: 768 },
          });

          const embedding = embeddingRes.embeddings?.[0]?.values;
          if (!embedding) continue;

          await supabase.from("document_chunks").insert({
            folder_id: dbFolder.id,
            user_id: user.id,
            content: chunk,
            embedding,
            metadata: { sourceFile: file.name },
          });
        }
      } catch (e) { console.error(`Error processing file ${file.name}:`, e); }
    }

    return { success: true, data: { filesCount: files.length, folderName: "Google Drive Folder", dbFolderId: dbFolder.id } };
  } catch (err: any) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

export async function generateSKSSummary(folderId: string): Promise<ActionResponse<{ title: string; content: string }>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const queryEmb = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: "Ringkasan topik utama dan poin-poin penting.",
      config: { outputDimensionality: 768 },
    });
    
    const { data: chunks } = await supabase.rpc("match_document_chunks", {
      query_embedding: queryEmb.embeddings?.[0]?.values,
      match_threshold: 0.3,
      match_count: 15,
      p_folder_id: folderId,
    });

    const contextText = chunks?.map((c: any) => c.content).join("\n\n") || "";
    if (!contextText) return { success: false, error: "Tidak ada materi ditemukan." };

    const { data: profile } = await supabase.from('users').select('name').eq('id', (await supabase.auth.getUser()).data.user?.id).single();

    const prompt = `Gunakan materi berikut untuk membuat SKS Summary. 
Sapa user: ${profile?.name || 'Bro'}.
Materi:\n${contextText}
Kembalikan JSON dengan keys: "title" (string), "content" (markdown string).`;

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
    return { success: false, error: err.message };
  }
}

export async function generateBingeWatchPlan(folderId: string): Promise<ActionResponse<{ courseTitle: string; episodes: Episode[] }>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const queryEmb = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: "Daftar isi, topik utama, silabus.",
      config: { outputDimensionality: 768 },
    });
    
    const { data: chunks } = await supabase.rpc("match_document_chunks", {
      query_embedding: queryEmb.embeddings?.[0]?.values,
      match_threshold: 0.3,
      match_count: 10,
      p_folder_id: folderId,
    });

    const contextText = chunks?.map((c: any) => c.content).join("\n\n") || "";

    const prompt = `Buat Binge-Watch Roadmap (3-4 episode) dari materi ini.
Materi:\n${contextText}
Kembalikan JSON dengan keys: "courseTitle" (string), "episodes" (array of {id, title, description}).`;

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
    return { success: false, error: err.message };
  }
}

export async function chatWithTutor(folderId: string | null, quarterId: string, title: string, description: string, userMessage: string, history: { role: "user" | "ai"; content: string }[]): Promise<ActionResponse<string>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const queryEmb = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: userMessage,
      config: { outputDimensionality: 768 },
    });

    let context = "";
    if (folderId) {
      const { data: chunks } = await supabase.rpc("match_document_chunks", {
        query_embedding: queryEmb.embeddings?.[0]?.values,
        match_threshold: 0.3,
        match_count: 5,
        p_folder_id: folderId,
      });
      context = chunks?.map((c: any) => c.content).join("\n\n") || "";
    }

    const systemInstruction = `Kamu adalah AI Tutor DoJo. Fokus pada topik: ${title}.
Deskripsi topik: ${description}
Materi pendukung:\n${context}`;

    const contents = history.map(h => ({
      role: h.role === "ai" ? "model" : "user",
      parts: [{ text: h.content }]
    }));
    contents.push({ role: "user", parts: [{ text: userMessage }] });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const aiResponse = response.text || "";

    await supabase.from("learning_chat_history").insert({
      user_id: user.id,
      folder_id: folderId,
      quarter_id: quarterId,
      role: 'ai',
      content: aiResponse,
    });
    
    await supabase.from("learning_chat_history").insert({
      user_id: user.id,
      folder_id: folderId,
      quarter_id: quarterId,
      role: 'user',
      content: userMessage,
    });

    return { success: true, data: aiResponse };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveLearningHistory(folderId: string, title: string, type: string, content: any): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    await supabase.from("learning_history").insert({
      user_id: user.id,
      folder_id: folderId || null,
      title,
      type,
      content,
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getLearningHistory(): Promise<ActionResponse<LearningHistoryItem[]>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data } = await supabase.from("learning_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    return { success: true, data: data as LearningHistoryItem[] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteLearningHistory(id: string): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    await supabase.from("learning_history").delete().eq("id", id);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateLearningHistoryTitle(id: string, title: string): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    await supabase.from("learning_history").update({ title }).eq("id", id);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getQuarterChatHistory(folderId: string | null, quarterId: string): Promise<ActionResponse<{ role: "ai" | "user"; content: string }[]>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    let query = supabase.from("learning_chat_history").select("role, content, created_at").eq("user_id", user.id).eq("quarter_id", quarterId).order("created_at", { ascending: true });
    if (folderId) query = query.eq("folder_id", folderId);
    else query = query.is("folder_id", null);

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data: data as { role: "ai" | "user"; content: string }[] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function syncLearningPlanToCalendar(courseTitle: string, episodes: Episode[]): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user || !session?.provider_token) return { success: false, error: "Unauthorized or Google not connected." };

    const { data: profile } = await supabase.from('users').select('productive_hours').eq('id', user.id).single();
    let startHour = 9;
    if (profile?.productive_hours) {
      const match = profile.productive_hours.match(/(\d{1,2})[:.](\d{2})/);
      if (match) startHour = parseInt(match[1], 10);
      else if (profile.productive_hours.toLowerCase().includes('malam')) startHour = 19;
      else if (profile.productive_hours.toLowerCase().includes('sore')) startHour = 16;
    }

    for (let i = 0; i < episodes.length; i++) {
      const episode = episodes[i];
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + i + 1);
      scheduledDate.setHours(startHour, 0, 0, 0);
      const endDate = new Date(scheduledDate.getTime() + 60 * 60000);

      await createEvent(session.provider_token, {
        summary: `[DoJo Learning] ${courseTitle}: ${episode.title}`,
        description: `Binge-watch episode from DoJo Learning Hub.\n\n${episode.description}`,
        start: { dateTime: scheduledDate.toISOString() },
        end: { dateTime: endDate.toISOString() },
        colorId: '9',
        reminders: { useDefault: true }
      });
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
