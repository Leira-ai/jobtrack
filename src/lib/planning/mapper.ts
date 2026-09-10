import type {
  CalendarEvent,
  CalendarEventType,
  JobTask,
  TaskStatus,
} from "@/types";
import type { CalendarEventInput, TaskInput } from "./contracts";

export interface CalendarEventRecord {
  readonly id: string;
  readonly user_id: string;
  readonly application_id: string | null;
  readonly event_type:
    | "interview"
    | "deadline"
    | "follow_up"
    | "networking"
    | "other";
  readonly title: string;
  readonly starts_at: string;
  readonly ends_at: string;
  readonly all_day: boolean;
  readonly location: string | null;
  readonly description: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface TaskRecord {
  readonly id: string;
  readonly user_id: string;
  readonly application_id: string | null;
  readonly title: string;
  readonly description: string | null;
  readonly priority: "low" | "medium" | "high";
  readonly status: "todo" | "in_progress" | "done";
  readonly due_at: string | null;
  readonly completed_at: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

const mapEventType = (
  type: CalendarEventRecord["event_type"],
): CalendarEventType => (type === "follow_up" ? "follow-up" : type);
const toEventType = (
  type: CalendarEventType,
): CalendarEventRecord["event_type"] =>
  type === "follow-up" ? "follow_up" : type;
const mapTaskStatus = (status: TaskRecord["status"]): TaskStatus =>
  status === "in_progress" ? "in-progress" : status;
const toTaskStatus = (status: TaskStatus): TaskRecord["status"] =>
  status === "in-progress" ? "in_progress" : status;

export const mapCalendarEventRecord = (
  record: CalendarEventRecord,
): CalendarEvent => ({
  id: record.id,
  applicationId: record.application_id ?? undefined,
  title: record.title,
  type: mapEventType(record.event_type),
  startsAt: record.starts_at,
  endsAt: record.ends_at,
  allDay: record.all_day,
  location: record.location ?? undefined,
  description: record.description ?? undefined,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
});

export const mapTaskRecord = (record: TaskRecord): JobTask => ({
  id: record.id,
  applicationId: record.application_id ?? undefined,
  title: record.title,
  description: record.description ?? undefined,
  priority: record.priority,
  status: mapTaskStatus(record.status),
  dueAt: record.due_at ?? undefined,
  completedAt: record.completed_at ?? undefined,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
});

export const toCalendarEventWrite = (input: CalendarEventInput) => ({
  application_id: input.applicationId ?? null,
  event_type: toEventType(input.type),
  title: input.title.trim(),
  starts_at: input.startsAt,
  ends_at: input.endsAt,
  all_day: input.allDay,
  location: input.location?.trim() || null,
  description: input.description?.trim() || null,
});

export const toTaskWrite = (input: TaskInput) => ({
  application_id: input.applicationId ?? null,
  title: input.title.trim(),
  description: input.description?.trim() || null,
  priority: input.priority,
  status: toTaskStatus(input.status),
  due_at: input.dueAt ?? null,
  completed_at: input.completedAt ?? null,
});
