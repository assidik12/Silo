import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getAiResponse } from "./config";
import Groq from "groq-sdk";
import crypto from "crypto";

// Inisialisasi Groq Client (Akan undefined jika GROQ_API_KEY tidak di-set)
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

/**
 * Helper to generate a hash for deterministic caching
 */
function generateContextHash(prompt: string, systemInstruction: string): string {
  return crypto.createHash("sha256").update(systemInstruction + prompt).digest("hex");
}

/**
 * 1. Deterministic Content Generator (Dengan Caching)
 * Ideal untuk: Ringkasan materi kuliah, soal latihan per topik, penjelasan konsep.
 * Menggunakan Gemini sebagai provider utama.
 */
export async function generateDeterministicContent(
  prompt: string,
  systemInstruction: string,
  isJson: boolean = true
): Promise<string | null> {
  const contextHash = generateContextHash(prompt, systemInstruction);
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Check Cache
  const { data: cached } = await supabase
    .from("ai_cache")
    .select("response, created_at")
    .eq("context_hash", contextHash)
    // Optional: Only use cache if newer than 7 days
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .single();

  if (cached?.response) {
    console.log("⚡ AI Cache Hit!");
    return cached.response;
  }

  // 2. Cache Miss -> Call Gemini
  console.log("☁️ AI Cache Miss. Generating with Gemini...");
  const response = await getAiResponse(prompt, systemInstruction, isJson);

  if (response) {
    // 3. Save to Cache asynchronously or await it
    await supabase.from("ai_cache").insert({
      context_hash: contextHash,
      response: response
    });
  }

  return response;
}

/**
 * 2. Conversational / Fast Content Generator (Tanpa Caching)
 * Ideal untuk: Neko AI Assistant (NekoBot) dan Task Breakdown (butuh inference super cepat).
 * Menggunakan Groq (Llama 3) sebagai provider utama, fallback ke Gemini jika Groq down/tidak ada key.
 */
export async function generateFastResponse(
  prompt: string,
  systemInstruction: string,
  isJson: boolean = false
): Promise<string | null> {
  // Gunakan Groq jika tersedia (sangat cepat untuk chat/breakdown)
  if (groq) {
    try {
      console.log("🤖 Generating with Groq (Llama 3)...");
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
        ],
        model: "llama-3.1-8b-instant", // Model yang diizinkan di GroqCloud Anda
        temperature: 0.7,
        response_format: isJson ? { type: "json_object" } : { type: "text" },
      });
      
      const responseText = chatCompletion.choices[0]?.message?.content || null;
      if (responseText) return responseText;
    } catch (err: any) {
      console.error("Groq Error, falling back to Gemini:", err.message);
    }
  }

  // Fallback ke Gemini jika Groq tidak tersedia atau gagal
  console.log("🤖 Generating with Gemini (Fast Response Fallback)...");
  return getAiResponse(prompt, systemInstruction, isJson);
}

// Export fungsionalitas lama agar tetap backward compatible jika dibutuhkan (di guardrails, dsb)
export { getAiResponse, getEmbedding } from "./config";
