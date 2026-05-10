"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/types";
import { createWelcomeTasks } from "./task.actions";

export async function updateUserProfile(data: {
  name: string;
  major: string;
  productive_hours: string;
  interests: string;
  learning_type: 'ngebut' | 'santai';
}): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("users")
      .update({
        name: data.name,
        major: data.major,
        productive_hours: data.productive_hours,
        interests: data.interests,
        learning_type: data.learning_type,
        onboarding_completed: true
      })
      .eq("id", user.id);

    if (error) throw error;

    // Create welcome tasks for the new user
    await createWelcomeTasks(user.id);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("Update Profile Error:", err);
    return { success: false, error: err.message || "Gagal update profil" };
  }
}
