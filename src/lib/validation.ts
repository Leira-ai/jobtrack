import { preSubmissionStatuses } from "../components/applications/application-config";
import { z } from "zod";
import {
  APPLICATION_STATUSES,
  DOCUMENT_TYPES,
  EVENT_TYPES,
  TASK_PRIORITIES,
} from "../types";

const isoDateTime = z.string().datetime({ offset: true });
const optionalText = z.string().trim().max(2_000).optional();
const optionalUrl = z
  .union([z.literal(""), z.string().url()])
  .optional()
  .transform((value) => value || undefined);

export const salaryRangeSchema = z
  .object({
    min: z.number().nonnegative(),
    max: z.number().positive(),
    currency: z.enum(["IDR", "USD", "SGD", "EUR"]),
    period: z.enum(["hour", "month", "year"]),
  })
  .refine((salary) => salary.max >= salary.min, {
    message: "Maximum salary must be greater than or equal to minimum salary.",
    path: ["max"],
  });

export const applicationSchema = z
  .object({
    company: z.string().trim().min(1, "Company is required.").max(120),
    role: z.string().trim().min(1, "Role is required.").max(120),
    location: z.string().trim().min(1, "Location is required.").max(120),
    workMode: z.enum(["remote", "hybrid", "onsite"]),
    employmentType: z.enum([
      "full-time",
      "part-time",
      "contract",
      "internship",
    ]),
    status: z.enum(APPLICATION_STATUSES),
    source: z.string().trim().min(1, "Source is required.").max(120),
    jobUrl: optionalUrl,
    salary: salaryRangeSchema.optional(),
    appliedAt: isoDateTime.optional(),
    deadline: isoDateTime.optional(),
    contactName: z.string().trim().max(120).optional(),
    contactEmail: z
      .union([z.literal(""), z.string().trim().email()])
      .optional()
      .transform((value) => value || undefined),
    description: optionalText,
    tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  })
  .superRefine((application, context) => {
    if (
      !preSubmissionStatuses.includes(application.status) &&
      !application.appliedAt
    ) {
      context.addIssue({
        code: "custom",
        path: ["appliedAt"],
        message: "Applied date is required for submitted applications.",
      });
    }
    if (
      application.deadline &&
      application.appliedAt &&
      Date.parse(application.deadline) < Date.parse(application.appliedAt)
    ) {
      context.addIssue({
        code: "custom",
        path: ["deadline"],
        message: "Deadline cannot be before the applied date.",
      });
    }
  });

export const eventSchema = z
  .object({
    applicationId: z.string().trim().min(1).optional(),
    title: z.string().trim().min(1, "Title is required.").max(160),
    type: z.enum(EVENT_TYPES),
    startsAt: isoDateTime,
    endsAt: isoDateTime,
    allDay: z.boolean(),
    location: z.string().trim().max(200).optional(),
    description: optionalText,
  })
  .refine((event) => Date.parse(event.endsAt) > Date.parse(event.startsAt), {
    message: "End time must be after start time.",
    path: ["endsAt"],
  });

export const taskSchema = z
  .object({
    applicationId: z.string().trim().min(1).optional(),
    title: z.string().trim().min(1, "Title is required.").max(160),
    description: optionalText,
    priority: z.enum(TASK_PRIORITIES),
    status: z.enum(["todo", "in-progress", "done"]),
    dueAt: isoDateTime.optional(),
    completedAt: isoDateTime.optional(),
  })
  .superRefine((task, context) => {
    if (task.status === "done" && !task.completedAt) {
      context.addIssue({
        code: "custom",
        path: ["completedAt"],
        message: "Completed tasks require a completion date.",
      });
    }
    if (task.status !== "done" && task.completedAt) {
      context.addIssue({
        code: "custom",
        path: ["completedAt"],
        message: "Only completed tasks can have a completion date.",
      });
    }
  });

export const documentSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(160),
  type: z.enum(DOCUMENT_TYPES),
  fileName: z.string().trim().min(1, "File name is required.").max(255),
  mimeType: z.string().trim().min(1, "MIME type is required.").max(150),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(25 * 1024 * 1024),
  applicationIds: z.array(z.string().trim().min(1)).max(100).default([]),
  version: z.number().int().positive().default(1),
});

export type ApplicationInput = z.input<typeof applicationSchema>;
export type ValidApplicationInput = z.output<typeof applicationSchema>;
export type EventInput = z.input<typeof eventSchema>;
export type ValidEventInput = z.output<typeof eventSchema>;
export type TaskInput = z.input<typeof taskSchema>;
export type ValidTaskInput = z.output<typeof taskSchema>;
export type DocumentInput = z.input<typeof documentSchema>;
export type ValidDocumentInput = z.output<typeof documentSchema>;
