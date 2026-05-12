import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

/**
 * AI Rate Limiter for DoJo
 * Default: 10 requests per day per user
 */
const DAILY_LIMIT = 10;

export async function checkAiLimit(): Promise<{ allowed: boolean; remaining: number; resetAt?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { allowed: false, remaining: 0 };

  // Fetch current usage
  const { data: userData, error } = await supabase
    .from("users")
    .select("ai_usage_count, last_ai_reset_at")
    .eq("id", user.id)
    .single();

  if (error || !userData) {
    // If record doesn't exist, allow first time
    return { allowed: true, remaining: DAILY_LIMIT };
  }

  const now = new Date();
  const lastReset = userData.last_ai_reset_at ? new Date(userData.last_ai_reset_at) : new Date(0);
  
  // Check if it's a new day (UTC based)
  const isNewDay = now.getUTCDate() !== lastReset.getUTCDate() || 
                    now.getUTCMonth() !== lastReset.getUTCMonth() || 
                    now.getUTCFullYear() !== lastReset.getUTCFullYear();

  if (isNewDay) {
    // Reset counter for new day
    await supabase
      .from("users")
      .update({ ai_usage_count: 1, last_ai_reset_at: now.toISOString() })
      .eq("id", user.id);
    
    return { allowed: true, remaining: DAILY_LIMIT - 1 };
  }

  if (userData.ai_usage_count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  // Increment counter
  await supabase
    .from("users")
    .update({ ai_usage_count: userData.ai_usage_count + 1 })
    .eq("id", user.id);

  return { allowed: true, remaining: DAILY_LIMIT - (userData.ai_usage_count + 1) };
}
