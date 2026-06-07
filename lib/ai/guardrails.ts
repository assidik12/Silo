import { createClient } from "@/utils/supabase/server";
import { getEmbedding } from "@/lib/ai/config";
import { cookies } from "next/headers";

const FALLBACK_MESSAGES = [
  "SKS Mode khusus buat nugas ngab, kalau mau curhat mending pindah ke Journal Mode yak 😌",
  "Waduh, pertanyaan lo melenceng jauh dari materi nih. Fokus belajar dulu yuk! 📚",
  "Sorry bro, gue cuma bisa jawab yang nyambung sama materi SKS. Coba tanya yang lain deh. 😅",
  "Yee si kocak, ini kan lagi SKS Mode. Nanyanya yang bener dong! 🤨",
  "Bro, materi lu nggak ada hubungannya sama ini deh. Yuk balik ke topik! 🚀"
];

export function getGenZFallbackMessage(): string {
  const randomIndex = Math.floor(Math.random() * FALLBACK_MESSAGES.length);
  return FALLBACK_MESSAGES[randomIndex];
}

/**
 * Validates user query against document vectors (RAG).
 * Implements P1 Vector Guardrails & Smart Query Detection.
 * Returns { allowed: true, contextStr } if allowed.
 * Returns { allowed: false, fallbackMessage } if rejected.
 */
export async function validateQueryWithGuardrails(
  userQuery: string, 
  folderId: string | null
): Promise<{ allowed: boolean; contextStr?: string; fallbackMessage?: string }> {
  // Pass-through if no specific folder context or empty query
  if (!folderId || userQuery.trim() === "") {
    return { allowed: true, contextStr: "" };
  }

  // Allow affirmative prompts about being ready to study
  const readyPrompts = ["gue siap belajar materi ini", "siap belajar", "mulai belajar"];
  if (readyPrompts.some(p => userQuery.toLowerCase().includes(p))) {
    return { allowed: true, contextStr: "" };
  }

  try {
    const embedding = await getEmbedding(userQuery);
    if (!embedding) {
      return { allowed: false, fallbackMessage: "Sistem AI kita lagi capek ngab. Coba refresh ya." };
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Use 0.35 as threshold for guardrails (P1 requirement)
    const { data: chunks, error } = await supabase.rpc("match_document_chunks", {
      query_embedding: embedding,
      match_threshold: 0.35, 
      match_count: 3,
      p_folder_id: folderId,
    });

    if (error) {
      console.error("Supabase RPC Error during vector guardrails:", error);
      return { allowed: true, contextStr: "" }; // Fail open if DB issue
    }

    // If similarity < 0.35, no chunks are returned -> Block Query
    if (!chunks || chunks.length === 0) {
      return { 
        allowed: false, 
        fallbackMessage: getGenZFallbackMessage() 
      };
    }

    const contextStr = "REFERENSI MATERI TERKAIT (DARI FILE PDF USER):\n" + chunks.map((c: any) => c.content).join("\n---\n");
    return { allowed: true, contextStr };

  } catch (error) {
    console.error("Vector guardrails error:", error);
    return { allowed: true, contextStr: "" }; // Fail open
  }
}
