"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type {
  CalendarEventInput,
  DeleteActionResult,
  EventActionResult,
  TaskActionResult,
  TaskInput,
} from "@/lib/planning/contracts";
import { PlanningRepository } from "@/lib/planning/repository";

const optionalUuid = z.union([z.literal(""), z.uuid()]).optional();
const taskSchema = z.object({
  applicationId: optionalUuid,
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).optional(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["todo", "in-progress", "done"]),
  dueAt: z.iso.datetime().optional(),
  completedAt: z.iso.datetime().optional(),
});
const eventSchema = z
  .object({
    applicationId: optionalUuid,
    title: z.string().trim().min(1).max(200),
    type: z.enum(["interview", "deadline", "follow-up", "networking", "other"]),
    startsAt: z.iso.datetime(),
    endsAt: z.iso.datetime(),
    allDay: z.boolean(),
    location: z.string().trim().max(500).optional(),
    description: z.string().trim().max(4000).optional(),
  })
  .refine((value) => Date.parse(value.endsAt) > Date.parse(value.startsAt), {
    message: "Waktu selesai harus setelah waktu mulai",
  });

async function repository(): Promise<PlanningRepository> {
  const supabase = await createClient();
  if (!supabase) throw new Error("Authentication is not configured");
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user)
    throw new Error("Sesi tidak valid. Silakan masuk lagi.");
  return new PlanningRepository(supabase);
}

const failure = (error: unknown) => ({
  ok: false as const,
  message: error instanceof Error ? error.message : "Operasi gagal",
});

function refreshPlanning(): void {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tugas");
  revalidatePath("/dashboard/kalender");
}

export async function createTaskAction(
  input: TaskInput,
): Promise<TaskActionResult> {
  try {
    const parsed = taskSchema.parse(input);
    const data = await (
      await repository()
    ).createTask({
      ...parsed,
      applicationId: parsed.applicationId || undefined,
    });
    refreshPlanning();
    return { ok: true, data };
  } catch (error) {
    return failure(error);
  }
}

export async function updateTaskAction(
  id: string,
  input: TaskInput,
): Promise<TaskActionResult> {
  try {
    const safeId = z.uuid().parse(id);
    const parsed = taskSchema.parse(input);
    const data = await (
      await repository()
    ).updateTask(safeId, {
      ...parsed,
      applicationId: parsed.applicationId || undefined,
    });
    refreshPlanning();
    return { ok: true, data };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteTaskAction(
  id: string,
): Promise<DeleteActionResult> {
  try {
    const safeId = z.uuid().parse(id);
    await (await repository()).deleteTask(safeId);
    refreshPlanning();
    return { ok: true, data: { id: safeId } };
  } catch (error) {
    return failure(error);
  }
}

export async function createEventAction(
  input: CalendarEventInput,
): Promise<EventActionResult> {
  try {
    const parsed = eventSchema.parse(input);
    const data = await (
      await repository()
    ).createEvent({
      ...parsed,
      applicationId: parsed.applicationId || undefined,
    });
    refreshPlanning();
    return { ok: true, data };
  } catch (error) {
    return failure(error);
  }
}

export async function updateEventAction(
  id: string,
  input: CalendarEventInput,
): Promise<EventActionResult> {
  try {
    const safeId = z.uuid().parse(id);
    const parsed = eventSchema.parse(input);
    const data = await (
      await repository()
    ).updateEvent(safeId, {
      ...parsed,
      applicationId: parsed.applicationId || undefined,
    });
    refreshPlanning();
    return { ok: true, data };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteEventAction(
  id: string,
): Promise<DeleteActionResult> {
  try {
    const safeId = z.uuid().parse(id);
    await (await repository()).deleteEvent(safeId);
    refreshPlanning();
    return { ok: true, data: { id: safeId } };
  } catch (error) {
    return failure(error);
  }
}
