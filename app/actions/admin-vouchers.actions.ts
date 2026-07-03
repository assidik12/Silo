"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getVouchers() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data, error } = await supabase
    .from("voucher_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching vouchers:", error);
    return [];
  }
  return data;
}

export async function createVoucher(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const lecturerName = formData.get("lecturerName") as string;
  const lecturerEmail = formData.get("lecturerEmail") as string;
  const maxUses = parseInt(formData.get("maxUses") as string);
  const code = formData.get("code") as string;

  if (!lecturerName || !lecturerEmail || !maxUses || !code) {
    throw new Error("Semua field wajib diisi.");
  }

  // Ensure unique code
  const { data: existingCode } = await supabase
    .from("voucher_codes")
    .select("id")
    .eq("code", code)
    .single();

  if (existingCode) {
    throw new Error("Kode voucher sudah ada.");
  }

  const { error } = await supabase.from("voucher_codes").insert({
    code,
    lecturer_name: lecturerName,
    lecturer_email: lecturerEmail,
    max_uses: maxUses,
    duration_days: 30, // Default 30 days
  });

  if (error) {
    console.error("Error creating voucher:", error);
    throw new Error("Gagal membuat voucher.");
  }

  revalidatePath("/admin/vouchers");
}

export async function getPremiumUsers() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, is_premium, premium_expires_at, signup_source")
    .eq("is_premium", true)
    .order("premium_expires_at", { ascending: false });

  if (error) {
    console.error("Error fetching premium users:", error);
    return [];
  }

  return data;
}
