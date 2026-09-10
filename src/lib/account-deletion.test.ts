import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  deleteAccountForUser,
  hasValidRequestOrigin,
} from "./account-deletion";

type Client = SupabaseClient<Database>;

function request(origin: string, host = "jobtrack.example") {
  return new Request("https://jobtrack.example/api/account", {
    method: "DELETE",
    headers: { host, origin },
  });
}

const userId = "00000000-0000-4000-8000-000000000001";
const attemptId = "00000000-0000-4000-8000-000000000002";

type MockOptions = {
  paths?: string[];
  listError?: boolean;
  moveErrors?: boolean[];
  authError?: { status?: number } | null;
  removeError?: boolean;
};

function mockAdmin(options: MockOptions = {}) {
  const paths = options.paths ?? ["resume.pdf"];
  const list = vi.fn(async () => ({
    data: options.listError
      ? null
      : paths.map((name, index) => ({ id: `object-${index}`, name })),
    error: options.listError ? { message: "list failed" } : null,
  }));
  let moveIndex = 0;
  const move = vi.fn(async () => {
    const shouldFail = options.moveErrors?.[moveIndex] ?? false;
    moveIndex += 1;
    return {
      data: shouldFail ? null : { message: "moved" },
      error: shouldFail ? { message: "move failed" } : null,
    };
  });
  const remove = vi.fn(async () => ({
    data: options.removeError ? null : [],
    error: options.removeError ? { message: "remove failed" } : null,
  }));
  const deleteUser = vi.fn(async () => ({
    data: { user: null },
    error: options.authError ?? null,
  }));
  const admin = {
    storage: { from: vi.fn(() => ({ list, move, remove })) },
    auth: { admin: { deleteUser } },
  } as unknown as Client;
  return { admin, deleteUser, list, move, remove };
}

function quarantinePath(name: string) {
  return `.account-deletion-quarantine/${attemptId}/${userId}/${name}`;
}
describe("account deletion", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(crypto, "randomUUID").mockReturnValue(attemptId);
  });

  it("rejects missing, cross-origin, and host-mismatched origins", () => {
    expect(hasValidRequestOrigin(request("https://evil.example"))).toBe(false);
    expect(
      hasValidRequestOrigin(
        request("https://jobtrack.example", "other.example"),
      ),
    ).toBe(false);
    expect(
      hasValidRequestOrigin(
        new Request("https://jobtrack.example/api/account", {
          method: "DELETE",
          headers: { host: "jobtrack.example" },
        }),
      ),
    ).toBe(false);
    expect(hasValidRequestOrigin(request("https://jobtrack.example"))).toBe(
      true,
    );
  });

  it("halts auth deletion when storage listing fails", async () => {
    const { admin, deleteUser } = mockAdmin({ listError: true });

    const result = await deleteAccountForUser(admin, userId);

    expect(result).toEqual({
      ok: false,
      stage: "storage",
      restorationPending: false,
    });
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("rolls back completed moves and aborts before Auth on move failure", async () => {
    const { admin, deleteUser, move, remove } = mockAdmin({
      paths: ["first.pdf", "second.pdf"],
      moveErrors: [false, true, false],
    });

    const result = await deleteAccountForUser(admin, userId);

    expect(move).toHaveBeenNthCalledWith(
      1,
      `${userId}/first.pdf`,
      quarantinePath("first.pdf"),
    );
    expect(move).toHaveBeenNthCalledWith(
      2,
      `${userId}/second.pdf`,
      quarantinePath("second.pdf"),
    );
    expect(move).toHaveBeenNthCalledWith(
      3,
      quarantinePath("first.pdf"),
      `${userId}/first.pdf`,
    );
    expect(result).toEqual({
      ok: false,
      stage: "storage",
      restorationPending: false,
    });
    expect(deleteUser).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it("restores quarantined objects when Auth deletion fails", async () => {
    const { admin, deleteUser, move, remove } = mockAdmin({
      authError: { status: 503 },
    });

    const result = await deleteAccountForUser(admin, userId);

    expect(deleteUser).toHaveBeenCalledWith(userId);
    expect(move).toHaveBeenNthCalledWith(
      2,
      quarantinePath("resume.pdf"),
      `${userId}/resume.pdf`,
    );
    expect(result).toEqual({
      ok: false,
      stage: "auth",
      restorationPending: false,
    });
    expect(remove).not.toHaveBeenCalled();
  });

  it("deletes Auth only after quarantine and then cleans quarantine", async () => {
    const { admin, deleteUser, move, remove } = mockAdmin();

    const result = await deleteAccountForUser(admin, userId);

    expect(move).toHaveBeenCalledWith(
      `${userId}/resume.pdf`,
      quarantinePath("resume.pdf"),
    );
    expect(move.mock.invocationCallOrder[0]).toBeLessThan(
      deleteUser.mock.invocationCallOrder[0],
    );
    expect(deleteUser.mock.invocationCallOrder[0]).toBeLessThan(
      remove.mock.invocationCallOrder[0],
    );
    expect(remove).toHaveBeenCalledWith([quarantinePath("resume.pdf")]);
    expect(result).toEqual({
      ok: true,
      alreadyMissing: false,
      cleanupPending: false,
    });
  });

  it("reports cleanup pending after successful Auth deletion", async () => {
    const { admin, remove } = mockAdmin({ removeError: true });

    const result = await deleteAccountForUser(admin, userId);

    expect(remove).toHaveBeenCalledWith([quarantinePath("resume.pdf")]);
    expect(result).toEqual({
      ok: true,
      alreadyMissing: false,
      cleanupPending: true,
    });
  });

  it("treats a missing Auth user as success and cleans quarantine", async () => {
    const { admin, move, remove } = mockAdmin({ authError: { status: 404 } });

    const result = await deleteAccountForUser(admin, userId);

    expect(move).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith([quarantinePath("resume.pdf")]);
    expect(result).toEqual({
      ok: true,
      alreadyMissing: true,
      cleanupPending: false,
    });
  });
});
