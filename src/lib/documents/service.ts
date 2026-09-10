import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { JobDocument, JobDocumentType } from "@/types";
import {
  DOCUMENT_MIME_TYPE_BY_EXTENSION,
  getFileExtension,
  validateDocumentFile,
} from "@/lib/file-validation";

export const DOCUMENTS_BUCKET = "documents";
export const SIGNED_URL_TTL_SECONDS = 60;

export interface DocumentApplicationOption {
  readonly id: string;
  readonly label: string;
}

export interface DocumentLibraryData {
  readonly documents: readonly JobDocument[];
  readonly applications: readonly DocumentApplicationOption[];
}

export interface DocumentActionResult {
  readonly ok: boolean;
  readonly message: string;
  readonly url?: string;
}

type DocumentType = Database["public"]["Enums"]["document_type"];
type DatabaseClient = SupabaseClient<Database>;

const DOCUMENT_TYPES = new Set<DocumentType>([
  "resume",
  "cover_letter",
  "portfolio",
  "certificate",
  "other",
]);
const DOCUMENT_NAME_MAX_LENGTH = 200;

function toUiDocumentType(type: DocumentType): JobDocumentType {
  return type === "cover_letter"
    ? "cover-letter"
    : type === "job_description" || type === "offer"
      ? "other"
      : type;
}

function toDatabaseDocumentType(
  value: FormDataEntryValue | null,
): DocumentType | null {
  const normalized = String(value ?? "").replace("-", "_") as DocumentType;
  return DOCUMENT_TYPES.has(normalized) ? normalized : null;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

async function removeUploadedObject(
  supabase: DatabaseClient,
  path: string,
): Promise<string | null> {
  const { error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .remove([path]);
  return error ? error.message : null;
}

export async function getAuthenticatedDocumentClient(
  createClient: () => Promise<DatabaseClient | null>,
): Promise<{ supabase: DatabaseClient; user: User } | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { supabase, user: data.user };
}

export async function listDocumentsForUser(
  supabase: DatabaseClient,
  userId: string,
): Promise<DocumentLibraryData> {
  const [documentsResult, linksResult, applicationsResult] = await Promise.all([
    supabase
      .from("documents")
      .select(
        "id, user_id, application_id, document_type, name, file_name, mime_type, size_bytes, version, created_at, updated_at",
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("document_applications")
      .select("document_id, application_id")
      .eq("user_id", userId),
    supabase
      .from("applications")
      .select("id, role_title")
      .eq("user_id", userId)
      .is("archived_at", null)
      .order("updated_at", { ascending: false }),
  ]);

  if (documentsResult.error) throw documentsResult.error;
  if (linksResult.error) throw linksResult.error;
  if (applicationsResult.error) throw applicationsResult.error;

  const linksByDocument = new Map<string, string[]>();
  for (const link of linksResult.data ?? []) {
    const ids = linksByDocument.get(link.document_id) ?? [];
    ids.push(link.application_id);
    linksByDocument.set(link.document_id, ids);
  }

  return {
    documents: (documentsResult.data ?? []).map((document) => ({
      id: document.id,
      name: document.name,
      type: toUiDocumentType(document.document_type),
      fileName: document.file_name,
      mimeType: document.mime_type ?? "application/octet-stream",
      sizeBytes: document.size_bytes ?? 0,
      applicationIds: Array.from(
        new Set([
          ...(linksByDocument.get(document.id) ?? []),
          ...(document.application_id ? [document.application_id] : []),
        ]),
      ),
      version: document.version,
      createdAt: document.created_at,
      updatedAt: document.updated_at,
    })),
    applications: (applicationsResult.data ?? []).map((application) => ({
      id: application.id,
      label: application.role_title,
    })),
  };
}

export async function uploadDocumentForUser(
  supabase: DatabaseClient,
  userId: string,
  formData: FormData,
): Promise<DocumentActionResult> {
  const file = formData.get("file");
  const name = String(formData.get("name") ?? "").trim();
  const documentType = toDatabaseDocumentType(formData.get("type"));
  const requestedApplicationIds = formData
    .getAll("applicationIds")
    .map(String)
    .filter((id, index, ids) => isUuid(id) && ids.indexOf(id) === index);

  if (!(file instanceof File))
    return { ok: false, message: "Pilih file PDF atau DOCX untuk diunggah." };
  const validation = validateDocumentFile(file);
  if (!validation.valid)
    return {
      ok: false,
      message: validation.errors.map((error) => error.message).join(" "),
    };
  if (!name || name.length > DOCUMENT_NAME_MAX_LENGTH)
    return {
      ok: false,
      message: "Nama dokumen wajib diisi dan maksimal 200 karakter.",
    };
  if (!documentType)
    return { ok: false, message: "Jenis dokumen tidak valid." };

  if (requestedApplicationIds.length) {
    const { data, error } = await supabase
      .from("applications")
      .select("id")
      .eq("user_id", userId)
      .in("id", requestedApplicationIds);
    if (error)
      return {
        ok: false,
        message: `Lamaran tidak dapat diverifikasi: ${error.message}`,
      };
    if ((data ?? []).length !== requestedApplicationIds.length)
      return {
        ok: false,
        message: "Satu atau beberapa lamaran tidak tersedia.",
      };
  }

  const documentId = crypto.randomUUID();
  const extension = getFileExtension(
    file.name,
  ) as keyof typeof DOCUMENT_MIME_TYPE_BY_EXTENSION;
  const storagePath = `${userId}/${documentId}/file.${extension}`;
  const contentType = DOCUMENT_MIME_TYPE_BY_EXTENSION[extension];
  const { error: uploadError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(storagePath, file, { contentType, upsert: false });
  if (uploadError)
    return { ok: false, message: `Unggahan gagal: ${uploadError.message}` };

  const primaryApplicationId = requestedApplicationIds[0] ?? null;
  const { error: metadataError } = await supabase.from("documents").insert({
    id: documentId,
    user_id: userId,
    application_id: primaryApplicationId,
    document_type: documentType,
    name,
    file_name: file.name,
    storage_path: storagePath,
    mime_type: contentType,
    size_bytes: file.size,
  });
  if (metadataError) {
    const cleanupError = await removeUploadedObject(supabase, storagePath);
    return {
      ok: false,
      message: cleanupError
        ? `Metadata gagal disimpan (${metadataError.message}) dan file gagal dibersihkan (${cleanupError}). Hubungi dukungan.`
        : `Metadata gagal disimpan: ${metadataError.message}. File unggahan telah dibersihkan.`,
    };
  }

  if (requestedApplicationIds.length) {
    const { error: linkError } = await supabase
      .from("document_applications")
      .insert(
        requestedApplicationIds.map((applicationId) => ({
          user_id: userId,
          document_id: documentId,
          application_id: applicationId,
        })),
      );
    if (linkError) {
      const { error: metadataCleanupError } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentId)
        .eq("user_id", userId);
      const storageCleanupError = await removeUploadedObject(
        supabase,
        storagePath,
      );
      const cleanupErrors = [metadataCleanupError?.message, storageCleanupError]
        .filter(Boolean)
        .join("; ");
      return {
        ok: false,
        message: cleanupErrors
          ? `Tautan lamaran gagal disimpan (${linkError.message}); pembersihan tidak tuntas (${cleanupErrors}). Hubungi dukungan.`
          : `Tautan lamaran gagal disimpan: ${linkError.message}. Unggahan telah dibatalkan.`,
      };
    }
  }

  return { ok: true, message: "Dokumen berhasil diunggah." };
}

export async function createDocumentSignedUrlForUser(
  supabase: DatabaseClient,
  userId: string,
  documentId: string,
): Promise<DocumentActionResult> {
  if (!isUuid(documentId))
    return { ok: false, message: "Dokumen tidak valid." };
  const { data: document, error } = await supabase
    .from("documents")
    .select("storage_path, file_name")
    .eq("id", documentId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error)
    return {
      ok: false,
      message: `Dokumen tidak dapat diverifikasi: ${error.message}`,
    };
  if (!document)
    return {
      ok: false,
      message: "Dokumen tidak ditemukan atau tidak dapat diakses.",
    };

  const { data, error: signedUrlError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(document.storage_path, SIGNED_URL_TTL_SECONDS, {
      download: document.file_name,
    });
  if (signedUrlError || !data?.signedUrl)
    return {
      ok: false,
      message: `Tautan unduhan gagal dibuat: ${signedUrlError?.message ?? "Unknown error"}`,
    };
  return { ok: true, message: "Tautan unduhan siap.", url: data.signedUrl };
}

export async function deleteDocumentForUser(
  supabase: DatabaseClient,
  userId: string,
  documentId: string,
): Promise<DocumentActionResult> {
  if (!isUuid(documentId))
    return { ok: false, message: "Dokumen tidak valid." };
  const { data: document, error } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("id", documentId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error)
    return {
      ok: false,
      message: `Dokumen tidak dapat diverifikasi: ${error.message}`,
    };
  if (!document)
    return {
      ok: false,
      message: "Dokumen tidak ditemukan atau tidak dapat diakses.",
    };

  const storageError = await removeUploadedObject(
    supabase,
    document.storage_path,
  );
  if (storageError)
    return {
      ok: false,
      message: `File belum dapat dihapus (${storageError}). Metadata dipertahankan agar penghapusan dapat dicoba lagi.`,
    };

  const { error: metadataError } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("user_id", userId);
  if (metadataError)
    return {
      ok: false,
      message: `File sudah dihapus, tetapi metadata gagal dihapus (${metadataError.message}). Muat ulang lalu coba hapus lagi atau hubungi dukungan.`,
    };
  return { ok: true, message: "Dokumen berhasil dihapus." };
}

export function actionFailure(error: unknown): DocumentActionResult {
  return {
    ok: false,
    message: `Operasi dokumen gagal: ${errorMessage(error)}`,
  };
}
