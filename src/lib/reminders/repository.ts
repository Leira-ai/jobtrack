import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { Reminder } from "@/types";

export type ReminderSupabase = SupabaseClient<Database>;
export type ReminderReference =
  | { readonly eventId: string; readonly taskId?: never }
  | { readonly eventId?: never; readonly taskId: string };
export type ReminderInput = ReminderReference & { readonly remindAt: string };

type ReminderRow = Database["public"]["Tables"]["reminders"]["Row"];

const message = (
  error: { readonly message: string } | null,
  fallback: string,
) => error?.message ?? fallback;

export class ReminderRepository {
  constructor(
    private readonly supabase: ReminderSupabase,
    private readonly userId: string,
  ) {}

  async list(): Promise<readonly Reminder[]> {
    const [{ data: rows, error }, { data: events }, { data: tasks }] =
      await Promise.all([
        this.supabase
          .from("reminders")
          .select("*")
          .eq("user_id", this.userId)
          .is("dismissed_at", null)
          .order("remind_at", { ascending: true }),
        this.supabase.from("calendar_events").select("id, title"),
        this.supabase.from("tasks").select("id, title"),
      ]);
    if (error) throw new Error(message(error, "Pengingat gagal dimuat"));
    const titles = new Map<string, string>();
    events?.forEach((event) => titles.set(`event:${event.id}`, event.title));
    tasks?.forEach((task) => titles.set(`task:${task.id}`, task.title));
    return ((rows ?? []) as ReminderRow[]).map((row) => ({
      id: row.id,
      eventId: row.event_id ?? undefined,
      taskId: row.task_id ?? undefined,
      title:
        titles.get(
          row.event_id ? `event:${row.event_id}` : `task:${row.task_id}`,
        ) ?? "Pengingat",
      remindAt: row.remind_at,
      readAt: row.read_at ?? undefined,
      dismissedAt: row.dismissed_at ?? undefined,
      createdAt: row.created_at,
    }));
  }

  async create(input: ReminderInput): Promise<Reminder> {
    const { data, error } = await this.supabase
      .from("reminders")
      .insert({
        user_id: this.userId,
        event_id: input.eventId ?? null,
        task_id: input.taskId ?? null,
        remind_at: input.remindAt,
      })
      .select("*")
      .single();
    if (error || !data)
      throw new Error(message(error, "Pengingat gagal ditambahkan"));
    const title = await this.referenceTitle(data.event_id, data.task_id);
    return {
      id: data.id,
      eventId: data.event_id ?? undefined,
      taskId: data.task_id ?? undefined,
      title,
      remindAt: data.remind_at,
      readAt: data.read_at ?? undefined,
      dismissedAt: data.dismissed_at ?? undefined,
      createdAt: data.created_at,
    };
  }

  async markRead(id: string): Promise<string> {
    const timestamp = new Date().toISOString();
    const { data, error } = await this.supabase
      .from("reminders")
      .update({ read_at: timestamp })
      .eq("id", id)
      .eq("user_id", this.userId)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(message(error, "Pengingat gagal ditandai"));
    if (!data)
      throw new Error("Pengingat tidak ditemukan atau tidak dapat diakses");
    return timestamp;
  }

  async dismiss(id: string): Promise<string> {
    const timestamp = new Date().toISOString();
    const { data, error } = await this.supabase
      .from("reminders")
      .update({ dismissed_at: timestamp })
      .eq("id", id)
      .eq("user_id", this.userId)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(message(error, "Pengingat gagal ditutup"));
    if (!data)
      throw new Error("Pengingat tidak ditemukan atau tidak dapat diakses");
    return timestamp;
  }

  private async referenceTitle(
    eventId: string | null,
    taskId: string | null,
  ): Promise<string> {
    const table = eventId ? "calendar_events" : "tasks";
    const id = eventId ?? taskId;
    const { data } = await this.supabase
      .from(table)
      .select("title")
      .eq("id", id!)
      .maybeSingle();
    return data?.title ?? "Pengingat";
  }
}
