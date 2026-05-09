"use server";

import { ActionResponse } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { google } from "googleapis";
import { GoogleGenAI } from "@google/genai";
import { parsePdfBuffer, chunkText } from "@/utils/pdfParser";

export async function syncGoogleDriveFolder(driveUrl: string): Promise<ActionResponse<{ filesCount: number; folderName: string; dbFolderId: string }>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    const provider_token = cookieStore.get("g_provider_token")?.value;

    if (sessionError || authError || !user || !provider_token) {
      return { success: false, error: "Unauthorized or Google Drive token missing. Please reconnect Google." };
    }

    // Extract Folder ID from URL (e.g. https://drive.google.com/drive/folders/ABC)
    const match = driveUrl.match(/folders\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      return { success: false, error: "Invalid Google Drive Folder URL." };
    }
    const folderId = match[1];

    // Initialize Google Drive API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: provider_token });
    const drive = google.drive({ version: "v3", auth });

    // Fetch PDF files in folder
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`,
      fields: "files(id, name)",
    });

    const files = res.data.files;
    if (!files || files.length === 0) {
      return { success: false, error: "No PDF files found in this folder." };
    }

    // Insert into learning_folders
    const { data: dbFolder, error: folderError } = await supabase
      .from("learning_folders")
      .insert({
        user_id: session?.user.id,
        drive_folder_id: folderId,
        folder_name: `Synced Folder (${files.length} files)`,
      })
      .select("id")
      .single();

    if (folderError || !dbFolder) {
      console.error(folderError);
      return { success: false, error: "Failed to create folder record in DB." };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Process each PDF
    for (const file of files) {
      if (!file.id) continue;

      try {
        const fileRes = await drive.files.get({ fileId: file.id, alt: "media" }, { responseType: "arraybuffer" });

        const text = await parsePdfBuffer(Buffer.from(fileRes.data as ArrayBuffer));
        const chunks = chunkText(text, 1000);

        for (const chunk of chunks) {
          if (!chunk.trim()) continue;

          // Generate embedding
          const embeddingRes = await ai.models.embedContent({
            model: "gemini-embedding-2",
            contents: chunk,
            config: { outputDimensionality: 768 },
          });

          const embedding = embeddingRes.embeddings?.[0]?.values;
          if (!embedding) continue;

          // Save to Supabase
          const { error: insertError } = await supabase.from("document_chunks").insert({
            folder_id: dbFolder.id,
            user_id: user.id,
            content: chunk,
            embedding,
            metadata: { sourceFile: file.name },
          });

          if (insertError) {
            console.error("Gagal insert ke DB:", insertError);
          }
        }
      } catch (err) {
        console.warn(`Failed to process file ${file.name}:`, err);
        // Continue processing other files even if one fails
      }
    }

    return {
      success: true,
      data: { filesCount: files.length, folderName: `Synced Folder (${files.length} files)`, dbFolderId: dbFolder.id },
    };
  } catch (err: unknown) {
    console.error("Error syncing GDrive:", err);
    return { success: false, error: (err as Error).message || "Failed to sync Drive folder" };
  }
}

export async function generateSKSSummary(folderId: string): Promise<ActionResponse<{ title: string; content: string }>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Generate embedding for the retrieval query
    const queryEmb = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: "Rangkuman intisari, konsep utama, dan definisi penting untuk persiapan ujian SKS.",
      config: { outputDimensionality: 768 },
    });

    // Similarity search in Supabase
    const { data: chunks, error } = await supabase.rpc("match_document_chunks", {
      query_embedding: queryEmb.embeddings?.[0]?.values,
      match_threshold: 0.3, // Lower threshold to get more context
      match_count: 15,
      p_folder_id: folderId,
    });

    if (error) {
      console.error(error);
      return { success: false, error: "Database vector search failed." };
    }

    const contextText = chunks?.map((c: any) => c.content).join("\n\n") || "";

    if (!contextText) {
      return { success: false, error: "Tidak ada materi yang ditemukan." };
    }

    const prompt = `Gunakan materi berikut untuk membuat SKS Summary (Rangkuman Ujian Kebut Semalam). 
Buat seringkas dan sejelas mungkin dengan poin-poin penting. Gunakan gaya bahasa Gen Z tapi tetap profesional.
Kembalikan respon DALAM FORMAT JSON murni (tanpa markdown backticks) dengan dua kunci:
- "title": (string) Judul keren untuk rangkuman ini (maks 6 kata).
- "content": (string) Isi rangkuman materi dalam format Markdown.

Materi:\n${contextText}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const jsonStr = response.text || "{}";
    const parsedData = JSON.parse(jsonStr.replace(/```json\n?|```/g, "").trim());

    return { success: true, data: parsedData };
  } catch (err: unknown) {
    console.error(err);
    return { success: false, error: (err as Error).message || "Gagal generate SKS summary" };
  }
}

export async function generateBingeWatchPlan(folderId: string): Promise<ActionResponse<{ courseTitle: string; episodes: any[] }>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Broad search to get an overview for planning
    const queryEmb = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: "Daftar isi, topik utama, silabus, dan ringkasan per bab.",
      config: { outputDimensionality: 768 },
    });

    const { data: chunks } = await supabase.rpc("match_document_chunks", {
      query_embedding: queryEmb.embeddings?.[0]?.values,
      match_threshold: 0.3,
      match_count: 10,
      p_folder_id: folderId,
    });

    const contextText = chunks?.map((c: any) => c.content).join("\n\n") || "";

    const prompt = `Berdasarkan cuplikan materi berikut, buatkan "Binge-Watch Roadmap" yang membagi materi menjadi 3-4 "Quarter" atau "Episode" pembelajaran. 
Kembalikan respon DALAM FORMAT JSON murni (tanpa markdown backticks) dengan dua kunci:
- "courseTitle": (string) Judul keren untuk roadmap ini (maks 6 kata).
- "episodes": (array of object) dimana setiap objek memiliki keys: id (string), title (string), description (string).

Materi:\n${contextText}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const jsonStr = response.text || "{}";
    // Attempt to parse JSON safely
    const parsedData = JSON.parse(jsonStr.replace(/```json\n?|```/g, "").trim());

    return { success: true, data: parsedData };
  } catch (err: unknown) {
    console.error(err);
    return { success: false, error: (err as Error).message || "Gagal generate Binge Watch Plan" };
  }
}

export async function saveLearningHistory(folderId: string, title: string, type: string, content: string | Record<string, unknown>): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("learning_history").insert({
      user_id: user.id,
      folder_id: folderId,
      title,
      type,
      content: typeof content === "string" ? content : JSON.stringify(content),
    });

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { success: false, error: err.message || "Gagal menyimpan history" };
    }
    return { success: false, error: "Gagal menyimpan history" };
  }
}

export async function getLearningHistory(): Promise<ActionResponse<any[]>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase.from("learning_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unknown error" };
  }
}

export async function deleteLearningHistory(id: string): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("learning_history").delete().eq("id", id).eq("user_id", user.id);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal menghapus history" };
  }
}

export async function updateLearningHistoryTitle(id: string, title: string): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("learning_history").update({ title }).eq("id", id).eq("user_id", user.id);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal mengubah judul" };
  }
}

export async function chatWithTutor(folderId: string | null, quarterId: string, quarterTitle: string, quarterDescription: string, userMessage: string, history: { role: "ai" | "user"; content: string }[]): Promise<ActionResponse<string>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Save User message immediately if not pure history-loading
    if (userMessage.trim() !== "") {
      const { error: insertUserError } = await supabase.from("learning_chat_history").insert({
        user_id: user.id,
        folder_id: folderId,
        quarter_id: quarterId,
        role: "user",
        content: userMessage,
      });
      if (insertUserError) {
        console.error("Failed to insert user chat history:", insertUserError);
      }
    }

    // RAG Search context
    let contextStr = "";
    if (folderId && userMessage.trim() !== "") {
      try {
        const embeddingRes = await ai.models.embedContent({
          model: "gemini-embedding-2",
          contents: userMessage,
          config: { outputDimensionality: 768 },
        });
        const queryEmbedding = embeddingRes.embeddings?.[0]?.values;

        if (queryEmbedding) {
          const { data: chunks } = await supabase.rpc("match_document_chunks", {
            query_embedding: queryEmbedding,
            match_threshold: 0.7,
            match_count: 3,
            p_folder_id: folderId,
          });

          if (chunks && chunks.length > 0) {
            contextStr = "REFERENSI MATERI TERKAIT (DARI FILE PDF USER):\n" + chunks.map((c: { content: string }) => c.content).join("\n---\n");
          }
        }
      } catch (err) {
        console.warn("RAG Match failed, continuing without context", err);
      }
    }

    const systemInstruction = `Kamu adalah DoJo Tutor, asisten AI Gen-Z yang santuy, asik, suportif, dan sangat afirmatif. 
Tugasmu adalah ngebantu user belajar materi dari quarter ini: "${quarterTitle}" (${quarterDescription}).
${contextStr ? `\nGunakan referensi ini untuk menjawab jika relevan dengan pertanyaan:\n${contextStr}\n` : ""}
Aturan gaya bahasa:
- Pake bahasa gaul lu/gw atau lo/gue (tergantung selera) yang natural, tapi tetap mendidik dan gampang dimengerti.
- Sering kasih apresiasi, validasi, dan afirmasi positif (misal: "Mantap banget pertanyaannya!", "Lo pasti bisa paham ini!").
- Jangan jawab kaku kayak robot, pake emoji secukupnya.
- Berikan penjelasan step-by-step jika rumit.
- Jika pesan user adalah "Gue siap belajar materi ini", beri sapaan hangat yang asik, kasih overview singkat banget apa yang bakal dipelajari di quarter ini berdasarkan deskripsi yang diberikan, dan ajak/tanya kesiapan mereka buat diskusi.`;

    const contents = history.map((msg) => ({
      role: msg.role === "ai" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    if (userMessage.trim() !== "") {
      contents.push({
        role: "user",
        parts: [{ text: userMessage }],
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const textRes = response.text || "";

    // Save AI response
    const { error: insertAiError } = await supabase.from("learning_chat_history").insert({
      user_id: user.id,
      folder_id: folderId,
      quarter_id: quarterId,
      role: "ai",
      content: textRes,
    });
    if (insertAiError) {
      console.error("Failed to insert AI chat history:", insertAiError);
    }

    return { success: true, data: textRes };
  } catch (error: unknown) {
    console.error("Chat Error:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message || "Failed to generate chat response." };
    }
    return { success: false, error: "Failed to generate chat response." };
  }
}

export async function getQuarterChatHistory(folderId: string | null, quarterId: string): Promise<ActionResponse<{ role: "ai" | "user"; content: string }[]>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    let query = supabase.from("learning_chat_history").select("role, content, created_at").eq("user_id", user.id).eq("quarter_id", quarterId).order("created_at", { ascending: true });

    if (folderId) {
      query = query.eq("folder_id", folderId);
    } else {
      query = query.is("folder_id", null);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data: data as { role: "ai" | "user"; content: string }[] };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unknown error" };
  }
}
