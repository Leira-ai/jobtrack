// @vitest-environment node

import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const migrationUrl = new URL(
  "../../../supabase/migrations/20260909010000_reminders.sql",
  import.meta.url,
);

describe("reminder migration", () => {
  it("enforces owner-composite references, RLS, and active due indexing", async () => {
    const sql = await readFile(migrationUrl, "utf8");
    expect(sql).toMatch(/num_nonnulls\(event_id, task_id\) = 1/);
    expect(sql).toMatch(
      /foreign key \(user_id, event_id\)[\s\S]*references public\.calendar_events\(user_id, id\)/,
    );
    expect(sql).toMatch(
      /foreign key \(user_id, task_id\)[\s\S]*references public\.tasks\(user_id, id\)/,
    );
    expect(sql).toContain(
      "alter table public.reminders enable row level security",
    );
    for (const operation of ["select", "insert", "update", "delete"]) {
      expect(sql).toContain(`reminders_${operation}_own`);
    }
    expect(sql).toMatch(
      /reminders_user_active_due_idx[\s\S]*\(user_id, remind_at\)[\s\S]*where dismissed_at is null/,
    );
  });
});
