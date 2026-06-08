"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/types";
import { createWelcomeTasks } from "./task.actions";

export async function updateUserProfile(data: {
  name: string;
  major: string;
  semester?: number;
  productive_hours: string;
  interests: string;
  learning_type: 'ngebut' | 'santai';
  bio?: string;
  ai_persona?: 'aesthetic' | 'savage' | 'mindful';
}): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Check if onboarding was already completed
    const { data: existingUser } = await supabase.from("users").select("onboarding_completed").eq("id", user.id).single();
    const isFirstTime = !existingUser?.onboarding_completed;

    const { error } = await supabase
      .from("users")
      .upsert({
        id: user.id,
        email: user.email,
        name: data.name,
        major: data.major,
        semester: data.semester || null,
        productive_hours: data.productive_hours,
        interests: data.interests,
        learning_type: data.learning_type,
        bio: data.bio || null,
        ai_persona: data.ai_persona || 'mindful',
        onboarding_completed: true
      });

    if (error) throw error;

    // Only create welcome tasks if it's the first time
    if (isFirstTime) {
      await createWelcomeTasks(user.id);
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (err: any) {
    console.error("Update Profile Error:", err);
    return { success: false, error: err.message || "Gagal update profil" };
  }
}

export async function getUserProfile(): Promise<ActionResponse<any>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single();
    if (error) throw error;

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateUserAvatar(avatarUrl: string): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("users")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id);

    if (error) throw error;

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (err: any) {
    console.error("Update Avatar Error:", err);
    return { success: false, error: err.message || "Gagal update avatar" };
  }
}
