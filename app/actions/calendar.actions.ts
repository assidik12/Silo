"use server";

import { ActionResponse } from "@/types";
import { cookies } from "next/headers";
import { getEvents } from "@/lib/google/calendar";
import { createClient } from "@/utils/supabase/server";

export async function fetchCalendarEvents(startDate: string, endDate: string): Promise<ActionResponse<any>> {
  try {
    const cookieStore = await cookies();
    let providerToken: string | null | undefined = cookieStore.get("g_provider_token")?.value;

    if (!providerToken) {
      const supabase = createClient(cookieStore);
      const { data: { session } } = await supabase.auth.getSession();
      providerToken = session?.provider_token;
    }

    if (!providerToken) {
      return { success: false, error: "Google Calendar token expired. Please log out and log in again." };
    }

    const data = await getEvents(providerToken, startDate, endDate);
    return { success: true, data: data.items };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
