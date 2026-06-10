"use server";

import { checkAiLimit } from "@/lib/supabase/limiter";
import { getAiResponse } from "@/lib/ai/config";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function askDojoBot(message: string): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const limiter = await checkAiLimit();
    if (!limiter.allowed) {
      return { success: false, error: "Limit AI harian tercapai. Coba lagi besok ya!" };
    }

    // Dummy RAG boundaries context (can be improved later by the user)
    const systemInstruction = `
Kamu adalah DoJo Bot, asisten AI super cerdas, santai, dan asik yang bertugas membantu mahasiswa menggunakan aplikasi DoJo (Gamify Your Student Life).
Berikut adalah context (boundaries) tentang aplikasi DoJo:
- DoJo adalah platform manajemen tugas (to-do list) yang digabungkan dengan elemen game (XP, Level, Streak).
- Pengguna dapat membuat tugas (Task), mengatur waktu, dan mendapatkan XP jika menyelesaikannya.
- Fitur SKS Mode: Menggunakan AI untuk merangkum otomatis materi dokumen/PDF dari Google Drive pengguna ke dalam satu kanvas.
- Fitur Binge-Watch Mode: AI memecah dokumen besar menjadi quarter/bab kecil layaknya menonton Netflix.
- Terdapat fitur Pomodoro Timer, Journaling untuk mencatat mental energy, dan Leaderboard.
- JANGAN PERNAH menjawab pertanyaan di luar konteks aplikasi DoJo, produktivitas, manajemen waktu, dan belajar mahasiswa. Jika ditanya hal lain, tolak dengan halus.
- Gunakan bahasa gaul yang asik, suportif, dan beri semangat layaknya seorang mentor (bro/sis/sob) untuk mahasiswa Indonesia.
- Batasi jawabanmu agar ringkas, to the point, maksimal 2 paragraf singkat.
`;

    const prompt = `User bertanya: ${message}`;
    
    // We expect a text response, not JSON
    const result = await getAiResponse(prompt, systemInstruction, false);
    
    if (!result) {
      return { success: false, error: "Gagal mendapatkan respon dari AI." };
    }

    return { success: true, data: result };

  } catch (error: any) {
    console.error("DojoBot Error:", error);
    return { success: false, error: error.message || "Terjadi kesalahan internal" };
  }
}
