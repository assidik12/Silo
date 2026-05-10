"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/types";

export async function sendFeedback(data: {
  type: 'general' | 'ai_breakdown' | 'ai_tutor' | 'milestone';
  category?: 'idea' | 'bug' | 'love' | 'rating' | 'tone';
  message?: string;
  rating?: number;
  metadata?: Record<string, any>;
}): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase.from("feedback").insert({
      user_id: user.id,
      type: data.type,
      category: data.category,
      message: data.message,
      rating: data.rating,
      metadata: data.metadata || {},
    });

    if (error) throw error;

    revalidatePath("/dashboard/feedback");
    return { success: true };
  } catch (err: any) {
    console.error("Feedback Error:", err);
    return { success: false, error: err.message || "Gagal mengirim feedback" };
  }
}

export async function checkTaskMilestone(): Promise<{ shouldShow: boolean }> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { shouldShow: false };

    // Count completed tasks
    const { count, error } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "done");

    if (error) throw error;

    // Check if user already gave milestone feedback
    const { data: feedbackExists } = await supabase
      .from("feedback")
      .select("id")
      .eq("user_id", user.id)
      .eq("type", "milestone")
      .single();

    // Trigger on exactly 5 completed tasks if no feedback exists yet
    const shouldShow = (count || 0) >= 5 && !feedbackExists;

    return { shouldShow };
  } catch {
    return { shouldShow: false };
  }
}
