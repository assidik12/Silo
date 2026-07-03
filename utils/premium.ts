import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export interface PremiumStatus {
  isPremium: boolean;
  expiresAt: string | null;
}

/**
 * Check if the current user has active premium status.
 * Auto-downgrades if premium has expired.
 */
export async function checkPremiumStatus(userId: string): Promise<PremiumStatus> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: user, error } = await supabase
    .from("users")
    .select("is_premium, premium_expires_at")
    .eq("id", userId)
    .single();

  if (error || !user) {
    return { isPremium: false, expiresAt: null };
  }

  // Auto-downgrade if expired
  if (user.is_premium && user.premium_expires_at) {
    const expiryDate = new Date(user.premium_expires_at);
    if (expiryDate < new Date()) {
      await supabase
        .from("users")
        .update({ is_premium: false, premium_expires_at: null })
        .eq("id", userId);
      return { isPremium: false, expiresAt: null };
    }
  }

  return {
    isPremium: user.is_premium ?? false,
    expiresAt: user.premium_expires_at ?? null,
  };
}
