"use server";

import { ActionResponse, LearningHistoryItem, Episode } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { google } from "googleapis";
import { getEmbedding, aiClient } from "@/lib/ai/config";
import { generateDeterministicContent, generateFastResponse } from "@/lib/ai";
import { parsePdfBuffer, chunkText } from "@/utils/pdfParser";
import { createEvent } from "@/lib/google/calendar";
import { validateQueryWithGuardrails } from "@/lib/ai/guardrails";

export async function syncGoogleDriveFolder(driveUrl: string): Promise<ActionResponse<{ filesCount: number; folderName: string; dbFolderId: string }>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    const provider_token = cookieStore.get("g_provider_token")?.value;

    if (!user || !provider_token) {
      return { success: false, error: "Unauthorized or Google Drive token missing. Please reconnect Google." };
    }

    let folderId = driveUrl;
    if (driveUrl.includes('folders/')) {
      const match = driveUrl.match(/folders\/([a-zA-Z0-9-_]+)/);
      if (match) folderId = match[1];
      else return { success: false, error: "Invalid Google Drive Folder URL." };
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: provider_token });
    const drive = google.drive({ version: "v3", auth });

    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`,
      fields: "files(id, name)",
    });

    const files = res.data.files;
    if (!files || files.length === 0) return { success: false, error: "No PDF files found in this folder." };

    // 1. CEK APAKAH FOLDER SUDAH ADA (Hemat Kuota: Jangan duplikasi folder)
    let { data: dbFolder } = await supabase
      .from("learning_folders")
      .select("id")
      .eq("user_id", user.id)
      .eq("drive_folder_id", folderId)
      .single();

    if (!dbFolder) {
      const { data: newFolder, error: folderError } = await supabase
        .from("learning_folders")
        .insert({
          user_id: user.id,
          drive_folder_id: folderId,
          folder_name: `Synced Folder (${files.length} files)`,
        })
        .select("id")
        .single();
      
      if (folderError || !newFolder) return { success: false, error: "Failed to create folder record in DB." };
      dbFolder = newFolder;
    }

    // 2. AMBIL LIST FILE YANG SUDAH PERNAH DI-EMBED (Hemat Kuota: Skip if Synced)
    const { data: existingChunks } = await supabase
      .from("document_chunks")
      .select("metadata->sourceFile")
      .eq("folder_id", dbFolder.id);
    
    const syncedFiles = new Set(existingChunks?.map(c => (c as any).sourceFile) || []);

    let newFilesProcessed = 0;

    for (const file of files) {
      if (!file.id || !file.name) continue;

      // SKIP JIKA FILE SUDAH ADA DI DATABASE
      if (syncedFiles.has(file.name)) {
        console.log(`⏭️ Skipping ${file.name} (Already synced)`);
        continue;
      }

      try {
        console.log(`📄 Processing new file: ${file.name}`);
        const fileRes = await drive.files.get({ fileId: file.id, alt: "media" }, { responseType: "arraybuffer" });
        const text = await parsePdfBuffer(Buffer.from(fileRes.data as ArrayBuffer));
        
        if (!text) continue;

        const chunks = chunkText(text, 1000);
        for (const chunk of chunks) {
          if (!chunk.trim()) continue;
          
          const embedding = await getEmbedding(chunk);
          if (!embedding) continue;

          await supabase.from("document_chunks").insert({
            folder_id: dbFolder!.id,
            user_id: user.id,
            content: chunk,
            embedding,
            metadata: { sourceFile: file.name },
          });
        }
        newFilesProcessed++;
      } catch (e: any) { 
        console.error(`Error processing file ${file.name}:`, e.message); 
      }
    }

    return { 
      success: true, 
      data: { 
        filesCount: files.length, 
        folderName: "Google Drive Folder", 
        dbFolderId: dbFolder.id 
      } 
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Sisa fungsi (generateSKSSummary, dll) tetap sama sesuai referensi work
export async function generateSKSSummary(folderId: string): Promise<ActionResponse<{ title: string; content: string }>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const embedding = await getEmbedding("Rangkuman intisari, konsep utama, dan definisi penting untuk persiapan ujian SKS.");
    if (!embedding) return { success: false, error: "Gagal memproses embedding materi." };
    
    const { data: chunks, error: rpcError } = await supabase.rpc("match_document_chunks", {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 15,
      p_folder_id: folderId,
    });

    if (rpcError) throw rpcError;

    const contextText = chunks?.map((c: any) => c.content).join("\n\n") || "";
    if (!contextText) return { success: false, error: "Tidak ada materi yang ditemukan." };

    const { data: profile } = await supabase.from('users').select('name, major, interests, learning_type').eq('id', (await supabase.auth.getUser()).data.user?.id).single();
    const userContext = profile ? `\nContext User:\n- Jurusan: ${profile.major}\n- Minat: ${profile.interests || 'Umum'}\n- Tipe Belajar: ${profile.learning_type === 'ngebut' ? 'Ngebut/Speedrunner' : 'Santai/Chill'}` : "";

    const prompt = `Gunakan materi berikut untuk membuat SKS Summary (Rangkuman Ujian Kebut Semalam).
Sapa user terlebih dahulu dengan gaya bahasa Gen Z dengan menyebut nama user ${profile?.name || 'Bro/Sis'}.
Buat sepadat, sejelas, dan serinci mungkin dengan poin-poin penting.
Kembalikan respon DALAM FORMAT JSON murni (tanpa markdown backticks) dengan dua kunci:
"title": (string) Judul keren untuk rangkuman ini (maks 6 kata).
"content": (string) Isi rangkuman materi dalam format Markdown. 

${userContext}
Materi:\n${contextText}`;

    const result = await generateDeterministicContent(prompt, "Kamu adalah AI asisten yang hanya merespon dalam format JSON murni.");
    if (!result) return { success: false, error: "Gagal memproses analisis AI." };

    const parsedData = JSON.parse(result);
    return { success: true, data: parsedData };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function generateBingeWatchPlan(folderId: string): Promise<ActionResponse<{ courseTitle: string; episodes: Episode[] }>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const embedding = await getEmbedding("Daftar isi, topik utama, silabus, dan ringkasan per bab.");
    if (!embedding) return { success: false, error: "Gagal memproses embedding." };
    
    const { data: chunks } = await supabase.rpc("match_document_chunks", {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 10,
      p_folder_id: folderId,
    });

    const contextText = chunks?.map((c: any) => c.content).join("\n\n") || "";

    const { data: profile } = await supabase.from('users').select('major, interests, learning_type').eq('id', (await supabase.auth.getUser()).data.user?.id).single();
    const userContext = profile ? `\nContext User:\n- Jurusan: ${profile.major}\n- Minat: ${profile.interests || 'Umum'}\n- Tipe Belajar: ${profile.learning_type === 'ngebut' ? 'Ngebut/Speedrunner' : 'Santai/Chill'}` : "";

    const prompt = `Berdasarkan cuplikan materi berikut, buatkan "Binge-Watch Roadmap" yang membagi materi menjadi 3-4 "Quarter" atau "Episode" pembelajaran. 
Kembalikan respon DALAM FORMAT JSON murni (tanpa markdown backticks) dengan dua kunci:
- "courseTitle": (string) Judul keren untuk roadmap ini (maks 6 kata).
- "episodes": (array of object) dimana setiap objek memiliki keys: id (string), title (string), description (string).

${userContext}
Materi:\n${contextText}`;

    const result = await generateDeterministicContent(prompt, "Kamu adalah AI asisten yang hanya merespon dalam format JSON murni.");
    if (!result) return { success: false, error: "Gagal memproses roadmap AI." };

    const parsedData = JSON.parse(result);
    return { success: true, data: parsedData };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function chatWithTutor(folderId: string | null, quarterId: string, quarterTitle: string, quarterDescription: string, userMessage: string, history: { role: "ai" | "user"; content: string }[]): Promise<ActionResponse<string>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const guardrailResult = await validateQueryWithGuardrails(userMessage, folderId);
    if (!guardrailResult.allowed) {
      await supabase.from("learning_chat_history").insert([
        { user_id: user.id, folder_id: folderId, quarter_id: quarterId, role: 'user', content: userMessage },
        { user_id: user.id, folder_id: folderId, quarter_id: quarterId, role: 'ai', content: guardrailResult.fallbackMessage }
      ]);
      return { success: true, data: guardrailResult.fallbackMessage! };
    }
    const contextStr = guardrailResult.contextStr || "";

    const { data: profile } = await supabase.from('users').select('major, interests, learning_type').eq('id', user.id).single();
    const userContext = profile ? `\nContext User:\n- Jurusan: ${profile.major}\n- Minat: ${profile.interests || 'Umum'}\n- Tipe Belajar: ${profile.learning_type === 'ngebut' ? 'Ngebut/Speedrunner' : 'Santai/Chill'}` : "";

    const systemInstruction = `Kamu adalah Neko, maskot kucing AI pintar dari Silo yang santuy, asik, suportif, dan sangat afirmatif. 
Tugasmu adalah menemani dan ngebantu user belajar materi dari quarter ini: "${quarterTitle}" (${quarterDescription}).
${contextStr ? `\nGunakan referensi ini untuk menjawab jika relevan dengan pertanyaan:\n${contextStr}\n` : ""}
${userContext}
Aturan gaya bahasa:
- Pake bahasa gaul lo/gue yang natural, layaknya teman belajar (atau kucing peliharaan yang cerdas), tetap mendidik dan objektif.
- Sering kasih apresiasi, validasi, dan afirmasi positif biar user nggak gampang nyerah. Boleh selipkan gaya kucing lucu sesekali.
- Jika pesan user adalah "Gue siap belajar materi ini", beri sapaan hangat yang asik dari Neko, kasih overview singkat banget apa yang bakal dipelajari di quarter ini.`;

    const historyStr = history.slice(-4).map(h => `${h.role === 'ai' ? 'Neko' : 'User'}: ${h.content}`).join("\n");
    const fullPrompt = historyStr 
      ? `Histori Chat Sebelumnya:\n${historyStr}\n\nUser: ${userMessage}\nNeko:`
      : `User: ${userMessage}\nNeko:`;

    const result = await generateFastResponse(fullPrompt, systemInstruction, false);
    if (!result) return { success: false, error: "Gagal memproses chat AI." };

    await supabase.from("learning_chat_history").insert([
      { user_id: user.id, folder_id: folderId, quarter_id: quarterId, role: 'user', content: userMessage },
      { user_id: user.id, folder_id: folderId, quarter_id: quarterId, role: 'ai', content: result }
    ]);

    return { success: true, data: result };
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
      content: typeof content === "string" ? content : JSON.stringify(content),
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
    if (!user) return { success: false, error: "Unauthorized" };

    const provider_token = cookieStore.get("g_provider_token")?.value;
    if (!provider_token) return { success: false, error: "Google Calendar not connected." };

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

      await createEvent(provider_token, {
        summary: `[Silo Learning] ${courseTitle}: ${episode.title}`,
        description: `Binge-watch episode from Silo Learning Hub.\n\n${episode.description}`,
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
