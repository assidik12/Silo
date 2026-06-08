"use server"

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { generateJournalReflection } from "@/lib/ai/journaling";
import { ActionResponse, JournalEntry, UserProfile } from "@/types";

export async function createJournalEntry(rawText: string, overridePersona?: 'aesthetic' | 'savage' | 'mindful'): Promise<ActionResponse<JournalEntry>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // 1. Rate Limiting: Max 2 request per day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { count, error: countError } = await supabase
      .from("journal_entries")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfDay.toISOString());

    if (countError) {
      console.error("Error checking journal limits:", countError);
      return { success: false, error: "Failed to check limits" };
    }

    if (count !== null && count >= 2) {
      return { success: false, error: "Limit tercapai. Kamu hanya bisa menulis jurnal 2 kali sehari." };
    }

    // 2. Get User Profile for AI Tunneling
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("name, major, semester, ai_persona")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return { success: false, error: "Failed to fetch profile" };
    }
    
    // Apply override if provided
    if (overridePersona) {
      profile.ai_persona = overridePersona;
    }

    // 3. Generate AI Reflection
    const aiResponse = await generateJournalReflection(profile as Partial<UserProfile>, rawText);
    if (!aiResponse) {
      return { success: false, error: "AI gagal merespons, coba lagi." };
    }

    // 4. Save to Database
    const { data: newEntry, error: insertError } = await supabase
      .from("journal_entries")
      .insert({
        user_id: user.id,
        raw_text: rawText,
        ai_reflection: aiResponse.reflection,
        sentiment_score: aiResponse.sentiment_score
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving journal:", insertError);
      return { success: false, error: "Gagal menyimpan jurnal" };
    }

    return { success: true, data: newEntry as JournalEntry };
  } catch (error) {
    console.error("createJournalEntry error:", error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function getRecentSentiment(): Promise<ActionResponse<number>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("journal_entries")
      .select("sentiment_score")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) return { success: false, error: "Gagal mengambil data sentimen" };

    if (!data || data.length === 0) return { success: true, data: 5 }; // Default score is 5

    return { success: true, data: data[0].sentiment_score };
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function getJournalEntries(): Promise<ActionResponse<JournalEntry[]>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: "Gagal mengambil data jurnal" };

    return { success: true, data: data as JournalEntry[] };
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function deleteJournalEntry(id: string): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { success: false, error: "Gagal menghapus jurnal" };

    return { success: true };
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function updateJournalColor(id: string, color: string | null): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
      .from("journal_entries")
      .update({ bg_color: color })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { success: false, error: "Gagal mengubah warna" };

    return { success: true };
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}

export async function updateJournalEntry(
  id: string, 
  rawText: string, 
  enhanceWithAI: boolean, 
  overridePersona?: 'aesthetic' | 'savage' | 'mindful'
): Promise<ActionResponse<JournalEntry>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    let updateData: Partial<JournalEntry> = { raw_text: rawText };

    if (enhanceWithAI) {
      // 1. Rate Limiting check
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { count, error: countError } = await supabase
        .from("journal_entries")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id)
        .neq("id", id)
        .gte("created_at", startOfDay.toISOString());

      if (countError) return { success: false, error: "Failed to check limits" };
      
      // We allow editing, but if it uses AI, we check the limit. 
      // Note: If they created 2 today, they can't enhance. 
      // If we want to allow editing their own today's entry without limit penalty, we should be careful. 
      // For now, strict limit.
      if (count !== null && count >= 2) {
        return { success: false, error: "Limit tercapai. Kamu hanya bisa menggunakan AI 2 kali sehari." };
      }

      // 2. Get User Profile for AI Tunneling
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("name, major, semester, ai_persona")
        .eq("id", user.id)
        .single();

      if (profileError) return { success: false, error: "Failed to fetch profile" };
      
      if (overridePersona) profile.ai_persona = overridePersona;

      // 3. Generate AI Reflection
      const aiResponse = await generateJournalReflection(profile as Partial<UserProfile>, rawText);
      if (!aiResponse) return { success: false, error: "AI gagal merespons, coba lagi." };

      updateData.ai_reflection = aiResponse.reflection;
      updateData.sentiment_score = aiResponse.sentiment_score;
    }

    // 4. Update Database
    const { data: updatedEntry, error: updateError } = await supabase
      .from("journal_entries")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating journal:", updateError);
      return { success: false, error: "Gagal menyimpan jurnal" };
    }

    return { success: true, data: updatedEntry as JournalEntry };
  } catch (error) {
    console.error("updateJournalEntry error:", error);
    return { success: false, error: "Terjadi kesalahan sistem" };
  }
}
