"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  actionFailure,
  createDocumentSignedUrlForUser,
  deleteDocumentForUser,
  getAuthenticatedDocumentClient,
  type DocumentActionResult,
} from "@/lib/documents/service";

async function getActionClient(): Promise<
  Awaited<ReturnType<typeof getAuthenticatedDocumentClient>>
> {
  const cookieStore = await cookies();
  if (cookieStore.get("jobtrack-demo")?.value === "1") return null;
  return getAuthenticatedDocumentClient(createClient);
}

export async function getDocumentDownloadUrlAction(
  documentId: string,
): Promise<DocumentActionResult> {
  try {
    const authenticated = await getActionClient();
    if (!authenticated) return { ok: false, message: "Sesi tidak tersedia." };
    return createDocumentSignedUrlForUser(
      authenticated.supabase,
      authenticated.user.id,
      documentId,
    );
  } catch (error) {
    return actionFailure(error);
  }
}

export async function deleteDocumentAction(
  documentId: string,
): Promise<DocumentActionResult> {
  try {
    const authenticated = await getActionClient();
    if (!authenticated) return { ok: false, message: "Sesi tidak tersedia." };
    const result = await deleteDocumentForUser(
      authenticated.supabase,
      authenticated.user.id,
      documentId,
    );
    if (result.ok) revalidatePath("/dashboard/dokumen");
    return result;
  } catch (error) {
    return actionFailure(error);
  }
}
