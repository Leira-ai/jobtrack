import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { ApplicationsRepository } from "./repository";

const applicationRecord = {
  id: "application-1",
  user_id: "user-1",
  company_id: "company-1",
  role_title: "Engineer",
  status: "saved",
  employment_type: "full_time",
  workplace_type: "remote",
  location: "Jakarta",
  job_url: null,
  source: "Referral",
  salary_min: null,
  salary_max: null,
  salary_currency: null,
  salary_period: null,
  applied_at: null,
  deadline_at: null,
  archived_at: null,
  job_description: null,
  tags: [],
  notes: null,
  created_at: "2026-09-01T00:00:00.000Z",
  updated_at: "2026-09-01T00:00:00.000Z",
  companies: { name: "Example Labs" },
  application_status_history: [],
  activities: [],
};

interface Result {
  readonly data: unknown;
  readonly error: { readonly message: string } | null;
}

const query = (result: Result) => {
  const value: Record<string, unknown> = {};
  for (const method of [
    "select",
    "insert",
    "update",
    "delete",
    "eq",
    "ilike",
    "limit",
    "range",
  ]) {
    value[method] = vi.fn(() => value);
  }
  value.order = vi.fn(() => value);
  value.range = vi.fn(async () => result);
  value.single = vi.fn(async () => result);
  value.maybeSingle = vi.fn(async () => result);
  value.then = (resolve: (result: Result) => unknown) =>
    Promise.resolve(result).then(resolve);
  return value;
};

const client = (
  queues: Partial<
    Record<
      "applications" | "companies" | "activities",
      ReturnType<typeof query>[]
    >
  >,
  rpcResult: Result = { data: applicationRecord, error: null },
) => {
  const from = vi.fn((table: "applications" | "companies" | "activities") => {
    const next = queues[table]?.shift();
    if (!next) throw new Error(`Unexpected ${table} query`);
    return next;
  });
  const rpc = vi.fn(async () => rpcResult);
  return {
    supabase: { from, rpc } as unknown as SupabaseClient<Database>,
    from,
    rpc,
  };
};

const input = {
  company: "Example Labs",
  role: "Engineer",
  location: "Jakarta",
  workMode: "remote" as const,
  employmentType: "full-time" as const,
  status: "saved" as const,
  source: "Referral",
  tags: [],
};

describe("ApplicationsRepository", () => {
  it("lists mapped applications", async () => {
    const list = query({ data: [applicationRecord], error: null });
    const mocked = client({ applications: [list] });

    const applications = await new ApplicationsRepository(
      mocked.supabase,
    ).list();

    expect(applications[0]?.company).toBe("Example Labs");
    expect(list.order).toHaveBeenCalledWith("updated_at", { ascending: false });
    expect(list.range).toHaveBeenCalledWith(0, 199);
  });

  it("finds a company, creates an application, and reloads authoritative data", async () => {
    const findCompany = query({ data: { id: "company-1" }, error: null });
    const insertApplication = query({
      data: { id: "application-1" },
      error: null,
    });
    const fetchApplication = query({ data: applicationRecord, error: null });
    const mocked = client({
      companies: [findCompany],
      applications: [insertApplication, fetchApplication],
    });

    const created = await new ApplicationsRepository(mocked.supabase).create(
      input,
    );

    expect(created.id).toBe("application-1");
    expect(insertApplication.insert).toHaveBeenCalledWith(
      expect.not.objectContaining({ user_id: expect.anything() }),
    );
  });

  it("uses status and archive RPCs", async () => {
    const statusFetch = query({ data: applicationRecord, error: null });
    const archiveFetch = query({
      data: { ...applicationRecord, archived_at: "2026-09-02T00:00:00.000Z" },
      error: null,
    });
    const mocked = client({ applications: [statusFetch, archiveFetch] });
    const repository = new ApplicationsRepository(mocked.supabase);

    await repository.changeStatus("application-1", "interview", "Scheduled");
    await repository.setArchived("application-1", true);

    expect(mocked.rpc).toHaveBeenNthCalledWith(1, "change_application_status", {
      application_id: "application-1",
      new_status: "interview",
      change_note: "Scheduled",
    });
    expect(mocked.rpc).toHaveBeenNthCalledWith(2, "set_application_archived", {
      application_id: "application-1",
      archived: true,
    });
  });

  it("creates, updates, and deletes notes through activities", async () => {
    const add = query({ data: null, error: null });
    const update = query({ data: null, error: null });
    const remove = query({ data: null, error: null });
    const mocked = client({ activities: [add, update, remove] });
    const repository = new ApplicationsRepository(mocked.supabase);

    await repository.addNote("application-1", " Follow up ");
    await repository.updateNote("application-1", "note-1", "Updated");
    await repository.deleteNote("application-1", "note-1");

    expect(add.insert).toHaveBeenCalledWith(
      expect.objectContaining({ activity_type: "note", body: "Follow up" }),
    );
    expect(update.eq).toHaveBeenCalledWith("activity_type", "note");
    expect(remove.eq).toHaveBeenCalledWith("activity_type", "note");
  });

  it("deletes through the RLS-backed applications table", async () => {
    const remove = query({ data: null, error: null });
    const mocked = client({ applications: [remove] });

    await new ApplicationsRepository(mocked.supabase).delete("application-1");

    expect(remove.delete).toHaveBeenCalledOnce();
    expect(remove.eq).toHaveBeenCalledWith("id", "application-1");
  });

  it("propagates Supabase errors", async () => {
    const list = query({ data: null, error: { message: "RLS denied" } });
    const mocked = client({ applications: [list] });

    await expect(
      new ApplicationsRepository(mocked.supabase).list(),
    ).rejects.toThrow("RLS denied");
  });
});
