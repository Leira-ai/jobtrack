import { describe, expect, it } from "vitest";
import type { ApplicationRecord } from "./mapper";
import {
  mapApplicationRecord,
  toApplicationInsert,
  toApplicationUpdate,
} from "./mapper";

const record: ApplicationRecord = {
  id: "application-1",
  user_id: "user-1",
  company_id: "company-1",
  role_title: "Frontend Engineer",
  status: "interview",
  employment_type: "temporary",
  workplace_type: "unspecified",
  location: null,
  job_url: "https://example.test/job",
  source: null,
  salary_min: 10,
  salary_max: 20,
  salary_currency: "IDR",
  salary_period: "month",
  applied_at: "2026-09-01T00:00:00.000Z",
  deadline_at: null,
  archived_at: null,
  job_description: "Build accessible products",
  tags: ["React"],
  notes: null,
  created_at: "2026-08-30T00:00:00.000Z",
  updated_at: "2026-09-02T00:00:00.000Z",
  companies: { name: "Normalized Company" },
  application_status_history: [
    {
      id: 2,
      user_id: "user-1",
      application_id: "application-1",
      from_status: "applied",
      to_status: "interview",
      changed_at: "2026-09-02T00:00:00.000Z",
      note: "Interview scheduled",
    },
    {
      id: 1,
      user_id: "user-1",
      application_id: "application-1",
      from_status: null,
      to_status: "applied",
      changed_at: "2026-09-01T00:00:00.000Z",
      note: null,
    },
  ],
  activities: [
    {
      id: "email-1",
      user_id: "user-1",
      application_id: "application-1",
      contact_id: null,
      interview_id: null,
      activity_type: "email",
      title: "Email",
      body: "Not a note",
      occurred_at: "2026-09-01T00:00:00.000Z",
      completed_at: null,
      created_at: "2026-09-01T00:00:00.000Z",
      updated_at: "2026-09-01T00:00:00.000Z",
    },
    {
      id: "note-1",
      user_id: "user-1",
      application_id: "application-1",
      contact_id: null,
      interview_id: null,
      activity_type: "note",
      title: "Fallback title",
      body: "A real note",
      occurred_at: "2026-09-02T00:00:00.000Z",
      completed_at: null,
      created_at: "2026-09-02T00:00:00.000Z",
      updated_at: "2026-09-03T00:00:00.000Z",
    },
  ],
};

describe("application mapper", () => {
  it("maps normalized records and supported domain fallbacks", () => {
    const application = mapApplicationRecord(record);

    expect(application.company).toBe("Normalized Company");
    expect(application.employmentType).toBe("contract");
    expect(application.workMode).toBe("onsite");
    expect(application.location).toBe("Lokasi belum ditentukan");
    expect(application.salary).toEqual({
      min: 10,
      max: 20,
      currency: "IDR",
      period: "month",
    });
    expect(application.notes).toHaveLength(1);
    expect(application.notes[0]?.content).toBe("A real note");
    expect(application.statusHistory.map((item) => item.id)).toEqual([
      "1",
      "2",
    ]);
  });

  it("maps domain writes without accepting an owner id", () => {
    const input = {
      company: "Normalized Company",
      role: "Engineer",
      location: "Jakarta",
      workMode: "remote" as const,
      employmentType: "part-time" as const,
      status: "saved" as const,
      source: "Referral",
      tags: ["TypeScript"],
    };

    expect(toApplicationInsert(input, "company-1")).toMatchObject({
      company_id: "company-1",
      role_title: "Engineer",
      employment_type: "part_time",
      workplace_type: "remote",
    });
    expect(toApplicationInsert(input, "company-1")).not.toHaveProperty(
      "user_id",
    );
    expect(toApplicationUpdate({ company: "Renamed" }, "company-2")).toEqual(
      expect.objectContaining({ company_id: "company-2" }),
    );
  });
});
