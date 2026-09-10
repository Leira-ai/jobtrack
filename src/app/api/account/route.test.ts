import { beforeEach, describe, expect, it, vi } from "vitest";

const createClient = vi.fn();
const createAdminClient = vi.fn();
const deleteAccountForUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient }));
vi.mock("@/lib/account-deletion", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/lib/account-deletion")>();
  return { ...original, deleteAccountForUser };
});

function authenticatedClient() {
  return {
    auth: {
      getUser: vi.fn(async () => ({
        data: {
          user: {
            id: "session-user",
            last_sign_in_at: new Date().toISOString(),
          },
        },
        error: null,
      })),
    },
  };
}

function validRequest() {
  return new Request("https://jobtrack.example/api/account", {
    method: "DELETE",
    headers: {
      host: "jobtrack.example",
      origin: "https://jobtrack.example",
    },
  });
}

describe("DELETE /api/account", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 503 and does not delete when the admin key client is absent", async () => {
    createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({
          data: {
            user: {
              id: "session-user",
              last_sign_in_at: new Date().toISOString(),
            },
          },
          error: null,
        })),
      },
    });
    createAdminClient.mockReturnValue(null);
    const { DELETE } = await import("./route");

    const response = await DELETE(validRequest());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        message: expect.stringContaining("SUPABASE_SERVICE_ROLE_KEY"),
      }),
    );
    expect(deleteAccountForUser).not.toHaveBeenCalled();
  });

  it("requires a recent server-verified sign-in", async () => {
    createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({
          data: {
            user: {
              id: "session-user",
              last_sign_in_at: "2026-01-01T00:00:00.000Z",
            },
          },
          error: null,
        })),
      },
    });
    const { DELETE } = await import("./route");

    const response = await DELETE(validRequest());

    expect(response.status).toBe(403);
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("returns a successful cleanup-pending state without exposing paths", async () => {
    createClient.mockResolvedValue(authenticatedClient());
    createAdminClient.mockReturnValue({ admin: true });
    deleteAccountForUser.mockResolvedValue({
      ok: true,
      alreadyMissing: false,
      cleanupPending: true,
    });
    const { DELETE } = await import("./route");

    const response = await DELETE(validRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      cleanupPending: true,
      message: "Akun berhasil dihapus. Pembersihan berkas tertunda.",
    });
    expect(JSON.stringify(body)).not.toContain("quarantine");
    expect(JSON.stringify(body)).not.toContain("session-user/");
  });

  it("reports a restored Auth failure without exposing paths", async () => {
    createClient.mockResolvedValue(authenticatedClient());
    createAdminClient.mockReturnValue({ admin: true });
    deleteAccountForUser.mockResolvedValue({
      ok: false,
      stage: "auth",
      restorationPending: false,
    });
    const { DELETE } = await import("./route");

    const response = await DELETE(validRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      message:
        "Akun belum dapat dihapus. Berkas telah dipulihkan; coba lagi atau hubungi dukungan.",
      restorationPending: false,
    });
    expect(JSON.stringify(body)).not.toContain("quarantine");
  });

  it("reports an already-missing account honestly", async () => {
    createClient.mockResolvedValue(authenticatedClient());
    createAdminClient.mockReturnValue({ admin: true });
    deleteAccountForUser.mockResolvedValue({
      ok: true,
      alreadyMissing: true,
      cleanupPending: false,
    });
    const { DELETE } = await import("./route");

    const response = await DELETE(validRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      cleanupPending: false,
      message: "Akun sudah tidak tersedia.",
    });
  });

  it("rejects a cross-origin request before session or admin access", async () => {
    const { DELETE } = await import("./route");
    const response = await DELETE(
      new Request("https://jobtrack.example/api/account", {
        method: "DELETE",
        headers: { host: "jobtrack.example", origin: "https://evil.example" },
      }),
    );

    expect(response.status).toBe(403);
    expect(createClient).not.toHaveBeenCalled();
    expect(createAdminClient).not.toHaveBeenCalled();
  });
});
