// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const createClient = vi.fn();
vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("server-only", () => ({}));

const event = {
  id: "event-1",
  title: "Owner event",
  type: "interview" as const,
  startsAt: "2026-09-10T02:00:00.000Z",
  endsAt: "2026-09-10T03:00:00.000Z",
  allDay: false,
  createdAt: "2026-09-01T00:00:00.000Z",
  updatedAt: "2026-09-01T00:00:00.000Z",
};

function query(result: unknown) {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const method of ["select", "order"])
    builder[method] = vi.fn(() => builder);
  Object.defineProperty(builder, "then", {
    value: (resolve: (value: unknown) => unknown) =>
      Promise.resolve(result).then(resolve),
  });
  return builder;
}

describe("GET /api/calendar/ics", () => {
  beforeEach(() => {
    vi.resetModules();
    createClient.mockReset();
  });

  it("returns 401 without a validated user", async () => {
    createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
      },
    });
    const { GET } = await import("./route");
    const response = await GET();
    expect(response.status).toBe(401);
    expect(response.headers.get("content-type")).toContain("application/json");
  });

  it("returns owner-scoped calendar data as text/calendar", async () => {
    const rows = query({
      data: [
        {
          id: event.id,
          user_id: "user-1",
          application_id: null,
          event_type: event.type,
          title: event.title,
          starts_at: event.startsAt,
          ends_at: event.endsAt,
          all_day: false,
          location: null,
          description: null,
          created_at: event.createdAt,
          updated_at: event.updatedAt,
        },
      ],
      error: null,
    });
    const from = vi.fn(() => rows);
    createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: { id: "user-1" } },
          error: null,
        })),
      },
      from,
    });
    const { GET } = await import("./route");
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "text/calendar; charset=utf-8",
    );
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.text()).toContain("SUMMARY:Owner event");
    expect(from).toHaveBeenCalledWith("calendar_events");
  });
});
