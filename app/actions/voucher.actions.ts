"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";

interface RedeemResult {
  premium_expires_at: string;
  duration_days: number;
}

export async function redeemVoucher(code: string): Promise<ActionResponse<RedeemResult>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // 1. Find voucher
    const { data: voucher, error: voucherError } = await supabase
      .from("voucher_codes")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .eq("is_active", true)
      .single();

    if (voucherError || !voucher) {
      return { success: false, error: "Kode voucher tidak valid atau sudah tidak aktif." };
    }

    // 2. Check max_uses
    if (voucher.current_uses >= voucher.max_uses) {
      return { success: false, error: "Kode voucher sudah mencapai batas penggunaan." };
    }

    // 3. Check if user already redeemed this voucher
    const { data: existingRedemption } = await supabase
      .from("voucher_redemptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("voucher_code_id", voucher.id)
      .single();

    if (existingRedemption) {
      return { success: false, error: "Kamu sudah pernah menggunakan kode voucher ini." };
    }

    // 4. Calculate new expiry (extend if already premium)
    const { data: currentUser } = await supabase
      .from("users")
      .select("is_premium, premium_expires_at, xp")
      .eq("id", user.id)
      .single();

    let newExpiry: Date;
    if (currentUser?.is_premium && currentUser?.premium_expires_at) {
      // Extend from current expiry
      newExpiry = new Date(currentUser.premium_expires_at);
      newExpiry.setDate(newExpiry.getDate() + voucher.duration_days);
    } else {
      // Start from now
      newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + voucher.duration_days);
    }

    const currentXp = currentUser?.xp || 0;
    const newXp = currentXp + 500; // Bonus 500 XP

    // 5. Activate premium
    const { error: updateError } = await supabase
      .from("users")
      .update({
        is_premium: true,
        premium_expires_at: newExpiry.toISOString(),
        xp: newXp
      })
      .eq("id", user.id);

    if (updateError) {
      return { success: false, error: "Gagal mengaktifkan premium." };
    }

    // 6. Record redemption
    await supabase.from("voucher_redemptions").insert({
      user_id: user.id,
      voucher_code_id: voucher.id,
    });

    // 7. Increment current_uses
    await supabase
      .from("voucher_codes")
      .update({ current_uses: voucher.current_uses + 1 })
      .eq("id", voucher.id);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");

    return {
      success: true,
      data: {
        premium_expires_at: newExpiry.toISOString(),
        duration_days: voucher.duration_days,
      },
    };
  } catch (error) {
    console.error("redeemVoucher error:", error);
    return { success: false, error: "Terjadi kesalahan sistem." };
  }
}
