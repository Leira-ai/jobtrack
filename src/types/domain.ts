export const APPLICATION_STATUSES = [
  "saved",
  "preparing",
  "applied",
  "screening",
  "interview",
  "technical_test",
  "offer",
  "accepted",
  "rejected",
  "withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export type WorkMode = "remote" | "hybrid" | "onsite";
export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship";
export type Currency = "IDR" | "USD" | "SGD" | "EUR";

export interface SalaryRange {
  readonly min: number;
  readonly max: number;
  readonly currency: Currency;
  readonly period: "hour" | "month" | "year";
}

export interface StatusHistoryEntry {
  readonly id: string;
  readonly from: ApplicationStatus | null;
  readonly to: ApplicationStatus;
  readonly changedAt: string;
  readonly reason?: string;
}

export interface ApplicationNote {
  readonly id: string;
  readonly content: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface JobApplication {
  readonly id: string;
  readonly company: string;
  readonly role: string;
  readonly location: string;
  readonly workMode: WorkMode;
  readonly employmentType: EmploymentType;
  readonly status: ApplicationStatus;
  readonly source: string;
  readonly jobUrl?: string;
  readonly salary?: SalaryRange;
  readonly appliedAt?: string;
  readonly archivedAt?: string;
  readonly deadline?: string;
  readonly contactName?: string;
  readonly contactEmail?: string;
  readonly description?: string;
  readonly tags: readonly string[];
  readonly statusHistory: readonly StatusHistoryEntry[];
  readonly notes: readonly ApplicationNote[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export const EVENT_TYPES = [
  "interview",
  "deadline",
  "follow-up",
  "networking",
  "other",
] as const;
export type CalendarEventType = (typeof EVENT_TYPES)[number];

export interface CalendarEvent {
  readonly id: string;
  readonly applicationId?: string;
  readonly title: string;
  readonly type: CalendarEventType;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly allDay: boolean;
  readonly location?: string;
  readonly description?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskStatus = "todo" | "in-progress" | "done";

export interface JobTask {
  readonly id: string;
  readonly applicationId?: string;
  readonly title: string;
  readonly description?: string;
  readonly priority: TaskPriority;
  readonly status: TaskStatus;
  readonly dueAt?: string;
  readonly completedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export const DOCUMENT_TYPES = [
  "resume",
  "cover-letter",
  "portfolio",
  "certificate",
  "other",
] as const;
export type JobDocumentType = (typeof DOCUMENT_TYPES)[number];

export interface JobDocument {
  readonly id: string;
  readonly name: string;
  readonly type: JobDocumentType;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly applicationIds: readonly string[];
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Reminder {
  readonly id: string;
  readonly eventId?: string;
  readonly taskId?: string;
  readonly title: string;
  readonly remindAt: string;
  readonly readAt?: string;
  readonly dismissedAt?: string;
  readonly createdAt: string;
}

export interface JobTrackData {
  readonly applications: readonly JobApplication[];
  readonly events: readonly CalendarEvent[];
  readonly tasks: readonly JobTask[];
  readonly documents: readonly JobDocument[];
}

export type Application = JobApplication;
export type Event = CalendarEvent;
export type Task = JobTask;
export type Document = JobDocument;
export type NewApplication = Omit<
  JobApplication,
  "id" | "statusHistory" | "notes" | "createdAt" | "updatedAt"
> & {
  readonly notes?: readonly ApplicationNote[];
};
export type ApplicationPatch = Partial<
  Omit<JobApplication, "id" | "statusHistory" | "notes" | "createdAt">
>;
export type NewEvent = Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">;
export type EventPatch = Partial<Omit<CalendarEvent, "id" | "createdAt">>;
export type NewTask = Omit<JobTask, "id" | "createdAt" | "updatedAt">;
export type TaskPatch = Partial<Omit<JobTask, "id" | "createdAt">>;
export type NewDocument = Omit<JobDocument, "id" | "createdAt" | "updatedAt">;
export type DocumentPatch = Partial<Omit<JobDocument, "id" | "createdAt">>;
