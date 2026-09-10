import type { SupabaseClient } from "@supabase/supabase-js";

import { DOCUMENTS_BUCKET } from "@/lib/documents/service";
import type { Database } from "@/lib/supabase/database.types";

const LIST_PAGE_SIZE = 100;
const REMOVE_BATCH_SIZE = 100;
const QUARANTINE_ROOT = ".account-deletion-quarantine";

type AdminClient = SupabaseClient<Database>;

type QuarantinedObject = {
  readonly originalPath: string;
  readonly quarantinePath: string;
};

export type AccountDeletionResult =
  | {
      readonly ok: true;
      readonly alreadyMissing: boolean;
      readonly cleanupPending: boolean;
    }
  | {
      readonly ok: false;
      readonly stage: "storage" | "auth";
      readonly restorationPending: boolean;
    };

function chunks<T>(items: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

export async function listUserDocumentPaths(
  admin: AdminClient,
  userId: string,
): Promise<string[]> {
  const bucket = admin.storage.from(DOCUMENTS_BUCKET);
  const paths: string[] = [];

  async function visit(relativePath: string): Promise<void> {
    let offset = 0;
    while (true) {
      const path = relativePath ? `${userId}/${relativePath}` : userId;
      const { data, error } = await bucket.list(path, {
        limit: LIST_PAGE_SIZE,
        offset,
        sortBy: { column: "name", order: "asc" },
      });
      if (error) throw error;
      const entries = data ?? [];
      for (const entry of entries) {
        const child = relativePath
          ? `${relativePath}/${entry.name}`
          : entry.name;
        if (entry.id) paths.push(`${userId}/${child}`);
        else await visit(child);
      }
      if (entries.length < LIST_PAGE_SIZE) break;
      offset += LIST_PAGE_SIZE;
    }
  }

  await visit("");
  return paths;
}

async function restoreQuarantinedObjects(
  admin: AdminClient,
  moved: readonly QuarantinedObject[],
): Promise<boolean> {
  const bucket = admin.storage.from(DOCUMENTS_BUCKET);
  let restorationPending = false;
  for (const object of [...moved].reverse()) {
    try {
      const { error } = await bucket.move(
        object.quarantinePath,
        object.originalPath,
      );
      if (error) restorationPending = true;
    } catch {
      restorationPending = true;
    }
  }
  return restorationPending;
}

async function quarantineUserObjects(
  admin: AdminClient,
  userId: string,
  attemptId: string,
): Promise<
  | { readonly ok: true; readonly moved: readonly QuarantinedObject[] }
  | { readonly ok: false; readonly restorationPending: boolean }
> {
  let paths: string[];
  try {
    paths = await listUserDocumentPaths(admin, userId);
  } catch {
    return { ok: false, restorationPending: false };
  }

  const bucket = admin.storage.from(DOCUMENTS_BUCKET);
  const moved: QuarantinedObject[] = [];
  for (const originalPath of paths) {
    const quarantinePath = `${QUARANTINE_ROOT}/${attemptId}/${originalPath}`;
    try {
      const { error } = await bucket.move(originalPath, quarantinePath);
      if (error) {
        return {
          ok: false,
          restorationPending: await restoreQuarantinedObjects(admin, moved),
        };
      }
      moved.push({ originalPath, quarantinePath });
    } catch {
      return {
        ok: false,
        restorationPending: await restoreQuarantinedObjects(admin, moved),
      };
    }
  }
  return { ok: true, moved };
}

async function removeQuarantinedObjects(
  admin: AdminClient,
  moved: readonly QuarantinedObject[],
): Promise<boolean> {
  const bucket = admin.storage.from(DOCUMENTS_BUCKET);
  try {
    for (const batch of chunks(
      moved.map(({ quarantinePath }) => quarantinePath),
      REMOVE_BATCH_SIZE,
    )) {
      const { error } = await bucket.remove(batch);
      if (error) return true;
    }
  } catch {
    return true;
  }
  return false;
}

export async function deleteAccountForUser(
  admin: AdminClient,
  userId: string,
): Promise<AccountDeletionResult> {
  const quarantine = await quarantineUserObjects(
    admin,
    userId,
    crypto.randomUUID(),
  );
  if (!quarantine.ok) {
    return {
      ok: false,
      stage: "storage",
      restorationPending: quarantine.restorationPending,
    };
  }

  let authError: { status?: number } | null;
  try {
    ({ error: authError } = await admin.auth.admin.deleteUser(userId));
  } catch {
    authError = {};
  }
  const alreadyMissing = authError?.status === 404;
  if (authError && !alreadyMissing) {
    return {
      ok: false,
      stage: "auth",
      restorationPending: await restoreQuarantinedObjects(
        admin,
        quarantine.moved,
      ),
    };
  }

  return {
    ok: true,
    alreadyMissing,
    cleanupPending: await removeQuarantinedObjects(admin, quarantine.moved),
  };
}

export function hasValidRequestOrigin(request: Request): boolean {
  const originHeader = request.headers.get("origin");
  const hostHeader = request.headers.get("host");
  if (!originHeader || !hostHeader) return false;

  try {
    const origin = new URL(originHeader);
    const forwardedHost = request.headers
      .get("x-forwarded-host")
      ?.split(",")[0]
      ?.trim();
    const expectedHost = forwardedHost || hostHeader;
    const forwardedProto = request.headers
      .get("x-forwarded-proto")
      ?.split(",")[0];
    const requestProtocol =
      forwardedProto?.trim() || new URL(request.url).protocol.slice(0, -1);
    return (
      (origin.protocol === "https:" || origin.protocol === "http:") &&
      origin.host === expectedHost &&
      origin.protocol === `${requestProtocol}:`
    );
  } catch {
    return false;
  }
}
