// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  createDocumentSignedUrlForUser,
  deleteDocumentForUser,
  uploadDocumentForUser,
} from "./service";

type Client = SupabaseClient<Database>;
const userId = "11111111-1111-4111-8111-111111111111";
const documentId = "22222222-2222-4222-8222-222222222222";

function query(result: unknown) {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const method of [
    "select",
    "insert",
    "delete",
    "eq",
    "in",
    "is",
    "order",
  ]) {
    builder[method] = vi.fn(() => builder);
  }
  builder.maybeSingle = vi.fn(async () => result);
  Object.defineProperty(builder, "then", {
    value: (resolve: (value: unknown) => unknown) =>
      Promise.resolve(result).then(resolve),
  });
  return builder;
}

function uploadForm(): FormData {
  const form = new FormData();
  form.set(
    "file",
    new File(["pdf"], "resume.pdf", { type: "application/pdf" }),
  );
  form.set("name", "Resume");
  form.set("type", "resume");
  return form;
}

describe("document storage service", () => {
  beforeEach(() => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue(documentId);
  });

  it("removes the uploaded object when metadata insertion fails", async () => {
    const metadata = query({ data: null, error: { message: "insert failed" } });
    const upload = vi.fn(async () => ({ data: {}, error: null }));
    const remove = vi.fn(async () => ({ data: {}, error: null }));
    const supabase = {
      from: vi.fn(() => metadata),
      storage: { from: vi.fn(() => ({ upload, remove })) },
    } as unknown as Client;

    const result = await uploadDocumentForUser(supabase, userId, uploadForm());

    const expectedPath = `${userId}/${documentId}/file.pdf`;
    expect(upload).toHaveBeenCalledWith(
      expectedPath,
      expect.any(File),
      expect.objectContaining({
        contentType: "application/pdf",
        upsert: false,
      }),
    );
    expect(metadata.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: userId, storage_path: expectedPath }),
    );
    expect(remove).toHaveBeenCalledWith([expectedPath]);
    expect(result).toEqual(
      expect.objectContaining({
        ok: false,
        message: expect.stringContaining("telah dibersihkan"),
      }),
    );
  });

  it("creates a short-lived download URL only after owner-scoped lookup", async () => {
    const ownedDocument = query({
      data: {
        storage_path: `${userId}/${documentId}/file.pdf`,
        file_name: "resume.pdf",
      },
      error: null,
    });
    const createSignedUrl = vi.fn(async () => ({
      data: { signedUrl: "https://storage.example/signed" },
      error: null,
    }));
    const supabase = {
      from: vi.fn(() => ownedDocument),
      storage: { from: vi.fn(() => ({ createSignedUrl })) },
    } as unknown as Client;

    const result = await createDocumentSignedUrlForUser(
      supabase,
      userId,
      documentId,
    );

    expect(ownedDocument.eq).toHaveBeenNthCalledWith(1, "id", documentId);
    expect(ownedDocument.eq).toHaveBeenNthCalledWith(2, "user_id", userId);
    expect(createSignedUrl).toHaveBeenCalledWith(
      `${userId}/${documentId}/file.pdf`,
      60,
      { download: "resume.pdf" },
    );
    expect(result).toEqual({
      ok: true,
      message: "Tautan unduhan siap.",
      url: "https://storage.example/signed",
    });
  });

  it("retains metadata when Storage deletion fails", async () => {
    const lookup = query({
      data: { storage_path: `${userId}/${documentId}/file.pdf` },
      error: null,
    });
    const metadataDelete = query({ data: null, error: null });
    const from = vi
      .fn()
      .mockReturnValueOnce(lookup)
      .mockReturnValueOnce(metadataDelete);
    const remove = vi.fn(async () => ({
      data: null,
      error: { message: "storage unavailable" },
    }));
    const supabase = {
      from,
      storage: { from: vi.fn(() => ({ remove })) },
    } as unknown as Client;

    const result = await deleteDocumentForUser(supabase, userId, documentId);

    expect(result.ok).toBe(false);
    expect(result.message).toContain("Metadata dipertahankan");
    expect(from).toHaveBeenCalledTimes(1);
    expect(metadataDelete.delete).not.toHaveBeenCalled();
  });

  it("reports recovery state when metadata deletion fails after object removal", async () => {
    const lookup = query({
      data: { storage_path: `${userId}/${documentId}/file.pdf` },
      error: null,
    });
    const metadataDelete = query({
      data: null,
      error: { message: "database unavailable" },
    });
    const supabase = {
      from: vi
        .fn()
        .mockReturnValueOnce(lookup)
        .mockReturnValueOnce(metadataDelete),
      storage: {
        from: vi.fn(() => ({
          remove: vi.fn(async () => ({ data: {}, error: null })),
        })),
      },
    } as unknown as Client;

    const result = await deleteDocumentForUser(supabase, userId, documentId);

    expect(result.ok).toBe(false);
    expect(result.message).toContain(
      "File sudah dihapus, tetapi metadata gagal dihapus",
    );
  });
});
