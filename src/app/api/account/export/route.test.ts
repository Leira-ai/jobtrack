import { beforeEach, describe, expect, it, vi } from "vitest";

const createClient = vi.fn();
const loadAccountExport = vi.fn();

vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("@/lib/account-export", () => ({ loadAccountExport }));

describe("GET /api/account/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 for an unvalidated session", async () => {
    createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
      },
    });
    const { GET } = await import("./route");

    const response = await GET();

    expect(response.status).toBe(401);
    expect(loadAccountExport).not.toHaveBeenCalled();
  });

  it("returns a versioned JSON attachment for the validated user", async () => {
    const user = { id: "session-user", email: "user@example.test" };
    const supabase = {
      auth: {
        getUser: vi.fn(async () => ({ data: { user }, error: null })),
      },
    };
    createClient.mockResolvedValue(supabase);
    loadAccountExport.mockResolvedValue({
      version: 1,
      exportedAt: "2026-09-09T00:00:00.000Z",
      account: user,
      data: {},
    });
    const { GET } = await import("./route");

    const response = await GET();

    expect(loadAccountExport).toHaveBeenCalledWith(supabase, user);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-disposition")).toContain("attachment");
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ version: 1 }),
    );
  });
});
