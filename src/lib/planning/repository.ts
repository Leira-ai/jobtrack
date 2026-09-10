import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { CalendarEvent, JobTask } from "@/types";
import type { CalendarEventInput, TaskInput } from "./contracts";
import {
  mapCalendarEventRecord,
  mapTaskRecord,
  toCalendarEventWrite,
  toTaskWrite,
  type CalendarEventRecord,
  type TaskRecord,
} from "./mapper";

export type PlanningSupabase = SupabaseClient<Database>;

const errorMessage = (
  error: { readonly message: string } | null,
  fallback: string,
) => error?.message ?? fallback;

export class PlanningRepository {
  constructor(private readonly supabase: PlanningSupabase) {}

  async listEvents(): Promise<readonly CalendarEvent[]> {
    const { data, error } = await this.supabase
      .from("calendar_events")
      .select("*")
      .order("starts_at", { ascending: true });
    if (error) throw new Error(errorMessage(error, "Agenda gagal dimuat"));
    return ((data ?? []) as CalendarEventRecord[]).map(mapCalendarEventRecord);
  }

  async createEvent(input: CalendarEventInput): Promise<CalendarEvent> {
    const { data, error } = await this.supabase
      .from("calendar_events")
      .insert(toCalendarEventWrite(input))
      .select("*")
      .single();
    if (error || !data)
      throw new Error(errorMessage(error, "Agenda gagal ditambahkan"));
    return mapCalendarEventRecord(data as CalendarEventRecord);
  }

  async updateEvent(
    id: string,
    input: CalendarEventInput,
  ): Promise<CalendarEvent> {
    const { data, error } = await this.supabase
      .from("calendar_events")
      .update(toCalendarEventWrite(input))
      .eq("id", id)
      .select("*")
      .single();
    if (error || !data)
      throw new Error(errorMessage(error, "Agenda gagal diperbarui"));
    return mapCalendarEventRecord(data as CalendarEventRecord);
  }

  async deleteEvent(id: string): Promise<void> {
    const { data, error } = await this.supabase
      .from("calendar_events")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(errorMessage(error, "Agenda gagal dihapus"));
    if (!data)
      throw new Error("Agenda tidak ditemukan atau tidak dapat diakses");
  }

  async listTasks(): Promise<readonly JobTask[]> {
    const { data, error } = await this.supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(errorMessage(error, "Tugas gagal dimuat"));
    return ((data ?? []) as TaskRecord[]).map(mapTaskRecord);
  }

  async createTask(input: TaskInput): Promise<JobTask> {
    const { data, error } = await this.supabase
      .from("tasks")
      .insert(toTaskWrite(input))
      .select("*")
      .single();
    if (error || !data)
      throw new Error(errorMessage(error, "Tugas gagal ditambahkan"));
    return mapTaskRecord(data as TaskRecord);
  }

  async updateTask(id: string, input: TaskInput): Promise<JobTask> {
    const { data, error } = await this.supabase
      .from("tasks")
      .update(toTaskWrite(input))
      .eq("id", id)
      .select("*")
      .single();
    if (error || !data)
      throw new Error(errorMessage(error, "Tugas gagal diperbarui"));
    return mapTaskRecord(data as TaskRecord);
  }

  async deleteTask(id: string): Promise<void> {
    const { data, error } = await this.supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(errorMessage(error, "Tugas gagal dihapus"));
    if (!data)
      throw new Error("Tugas tidak ditemukan atau tidak dapat diakses");
  }
}
