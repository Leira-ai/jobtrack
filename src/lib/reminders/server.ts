import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReminderRepository } from "./repository";
import type { PlanningMode } from "@/lib/planning/contracts";
import type { Reminder } from "@/types";

export interface ReminderCenterData {
  readonly mode: PlanningMode;
  readonly reminders: readonly Reminder[];
  readonly loadError?: string;
}

export async function loadReminderCenterData(): Promise<ReminderCenterData> {
  const cookieStore = await cookies();
  if (cookieStore.get("jobtrack-demo")?.value === "1") {
    return { mode: "demo", reminders: [] };
  }
  const supabase = await createClient();
  if (!supabase)
    redirect("/login?error=Authentication%20is%20not%20configured");
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");
  try {
    return {
      mode: "authenticated",
      reminders: await new ReminderRepository(supabase, data.user.id).list(),
    };
  } catch (caught) {
    return {
      mode: "authenticated",
      reminders: [],
      loadError:
        caught instanceof Error ? caught.message : "Pengingat gagal dimuat.",
    };
  }
}
