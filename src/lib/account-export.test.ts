import { describe, expect, it, vi } from "vitest";

import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { loadAccountExport, sanitizeExportValue } from "./account-export";

type Client = SupabaseClient<Database>;

function query(data: unknown) {
  const builder = {
    select: vi.fn(),
    eq: vi.fn(),
    range: vi.fn(),
  };
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.range.mockResolvedValue({
    data,
    error: null,
  });
  return builder;
}

describe("account export", () => {
  it("sanitizes private document and credential fields recursively", () => {
    expect(
      sanitizeExportValue({
        id: "document-1",
        storage_path: "user/document/file.pdf",
        extracted_text: "private CV text",
        signedUrl: "https://signed.example",
        nested: { token: "secret", safe: "kept" },
      }),
    ).toEqual({ id: "document-1", nested: { safe: "kept" } });
  });

  it("owner-scopes every table query and excludes sensitive document columns", async () => {
    const userId = "11111111-1111-4111-8111-111111111111";
    const builders = Array.from({ length: 12 }, () => query([]));
    const queue = [...builders];
    const from = vi.fn((table: string) => {
      void table;
      return queue.shift();
    });
    const supabase = { from } as unknown as Client;

    const result = await loadAccountExport(
      supabase,
      { id: userId, email: "user@example.test" },
      "2026-09-09T00:00:00.000Z",
    );

    expect(result.version).toBe(1);
    expect(result.exportedAt).toBe("2026-09-09T00:00:00.000Z");
    expect(result.data.documents).toEqual([]);
    for (const builder of builders) {
      expect(builder.eq).toHaveBeenCalledWith(expect.any(String), userId);
      expect(builder.range).toHaveBeenCalledWith(0, 499);
    }
    const calls = from.mock.calls;
    expect(calls.map(([table]) => table)).toEqual([
      "profiles",
      "companies",
      "applications",
      "application_status_history",
      "contacts",
      "interviews",
      "calendar_events",
      "tasks",
      "reminders",
      "documents",
      "document_applications",
      "activities",
    ]);
  });
});
