import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import type { Database } from "@/lib/supabase/database.types";
import { PlanningRepository } from "./repository";

function query(result: unknown) {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const method of [
    "select",
    "insert",
    "update",
    "delete",
    "eq",
    "order",
  ]) {
    builder[method] = vi.fn(() => builder);
  }
  builder.single = vi.fn(async () => result);
  builder.maybeSingle = vi.fn(async () => result);
  Object.defineProperty(builder, "then", {
    value: (resolve: (value: unknown) => unknown) =>
      Promise.resolve(result).then(resolve),
  });
  return builder;
}

const record = {
  id: "11111111-1111-4111-8111-111111111111",
  user_id: "22222222-2222-4222-8222-222222222222",
  application_id: null,
  title: "Prepare interview",
  description: null,
  priority: "high" as const,
  status: "todo" as const,
  due_at: null,
  completed_at: null,
  created_at: "2026-09-01T00:00:00.000Z",
  updated_at: "2026-09-01T00:00:00.000Z",
};

describe("PlanningRepository task CRUD", () => {
  it("maps a successful insert and fails instead of reporting false success", async () => {
    const success = query({ data: record, error: null });
    const repository = new PlanningRepository({
      from: vi.fn(() => success),
    } as unknown as SupabaseClient<Database>);
    await expect(
      repository.createTask({
        title: "Prepare interview",
        priority: "high",
        status: "todo",
      }),
    ).resolves.toMatchObject({ title: "Prepare interview", status: "todo" });
    expect(success.insert).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Prepare interview", status: "todo" }),
    );

    const failure = query({ data: null, error: { message: "RLS denied" } });
    const denied = new PlanningRepository({
      from: vi.fn(() => failure),
    } as unknown as SupabaseClient<Database>);
    await expect(
      denied.createTask({ title: "Denied", priority: "low", status: "todo" }),
    ).rejects.toThrow("RLS denied");
  });

  it("requires a returned owner row before a delete succeeds", async () => {
    const missing = query({ data: null, error: null });
    const repository = new PlanningRepository({
      from: vi.fn(() => missing),
    } as unknown as SupabaseClient<Database>);
    await expect(repository.deleteTask(record.id)).rejects.toThrow(
      "tidak ditemukan",
    );
    expect(missing.eq).toHaveBeenCalledWith("id", record.id);
  });
});
