import { describe, expect, it } from "vitest";
import {
  applicationSchema,
  documentSchema,
  eventSchema,
  taskSchema,
} from "./validation";

describe("domain validation schemas", () => {
  it("requires an applied date only for submitted applications", () => {
    expect(
      applicationSchema.safeParse({
        company: "Example",
        role: "Engineer",
        location: "Remote",
        workMode: "remote",
        employmentType: "full-time",
        status: "preparing",
        source: "Referral",
        tags: [],
      }).success,
    ).toBe(true);
    const result = applicationSchema.safeParse({
      company: "Example",
      role: "Engineer",
      location: "Remote",
      workMode: "remote",
      employmentType: "full-time",
      status: "applied",
      source: "Referral",
      tags: [],
    });
    expect(result.success).toBe(false);
  });

  it("validates event ordering and task completion consistency", () => {
    expect(
      eventSchema.safeParse({
        title: "Interview",
        type: "interview",
        startsAt: "2026-09-10T10:00:00.000Z",
        endsAt: "2026-09-10T09:00:00.000Z",
        allDay: false,
      }).success,
    ).toBe(false);
    expect(
      taskSchema.safeParse({
        title: "Prepare",
        priority: "high",
        status: "done",
      }).success,
    ).toBe(false);
  });

  it("accepts a valid document descriptor", () => {
    expect(
      documentSchema.safeParse({
        name: "Resume",
        type: "resume",
        fileName: "resume.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1200,
        applicationIds: [],
        version: 1,
      }).success,
    ).toBe(true);
  });
});
