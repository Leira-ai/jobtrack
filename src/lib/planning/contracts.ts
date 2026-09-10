import type {
  CalendarEvent,
  CalendarEventType,
  JobTask,
  TaskPriority,
  TaskStatus,
} from "@/types";

export type PlanningMode = "demo" | "authenticated";

export interface ApplicationOption {
  readonly id: string;
  readonly label: string;
}

export interface TaskInput {
  readonly applicationId?: string;
  readonly title: string;
  readonly description?: string;
  readonly priority: TaskPriority;
  readonly status: TaskStatus;
  readonly dueAt?: string;
  readonly completedAt?: string;
}

export interface CalendarEventInput {
  readonly applicationId?: string;
  readonly title: string;
  readonly type: CalendarEventType;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly allDay: boolean;
  readonly location?: string;
  readonly description?: string;
}

export type ActionResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly message: string };

export type TaskActionResult = ActionResult<JobTask>;
export type EventActionResult = ActionResult<CalendarEvent>;
export type DeleteActionResult = ActionResult<{ readonly id: string }>;
