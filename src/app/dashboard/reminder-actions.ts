"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  ReminderRepository,
  type ReminderInput,
} from "@/lib/reminders/repository";
import type { Reminder } from "@/types";

export type ReminderActionResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly message: string };

const inputSchema = z
  .object({
    eventId: z.uuid().optional(),
    taskId: z.uuid().optional(),
    remindAt: z.iso.datetime(),
  })
  .refine(
    (input) =>
      Number(Boolean(input.eventId)) + Number(Boolean(input.taskId)) === 1,
    {
      message: "Pilih tepat satu agenda atau tugas",
    },
  );

async function repository(): Promise<ReminderRepository> {
  const supabase = await createClient();
  if (!supabase) throw new Error("Authentication is not configured");
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user)
    throw new Error("Sesi tidak valid. Silakan masuk lagi.");
  return new ReminderRepository(supabase, data.user.id);
}

const fail = (error: unknown) => ({
  ok: false as const,
  message: error instanceof Error ? error.message : "Operasi pengingat gagal",
});

export async function createReminderAction(
  input: ReminderInput,
): Promise<ReminderActionResult<Reminder>> {
  try {
    const parsed = inputSchema.parse(input) as ReminderInput;
    const data = await (await repository()).create(parsed);
    revalidatePath("/dashboard", "layout");
    return { ok: true, data };
  } catch (error) {
    return fail(error);
  }
}

export async function markReminderReadAction(
  id: string,
): Promise<ReminderActionResult<{ readonly readAt: string }>> {
  try {
    const readAt = await (await repository()).markRead(z.uuid().parse(id));
    revalidatePath("/dashboard", "layout");
    return { ok: true, data: { readAt } };
  } catch (error) {
    return fail(error);
  }
}

export async function dismissReminderAction(
  id: string,
): Promise<ReminderActionResult<{ readonly dismissedAt: string }>> {
  try {
    const dismissedAt = await (await repository()).dismiss(z.uuid().parse(id));
    revalidatePath("/dashboard", "layout");
    return { ok: true, data: { dismissedAt } };
  } catch (error) {
    return fail(error);
  }
}
