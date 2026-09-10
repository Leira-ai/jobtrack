import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/lib/supabase/database.types";

export const ACCOUNT_EXPORT_VERSION = 1;

const PRIVATE_EXPORT_KEYS = new Set(["extracted_text", "storage_path"]);

function isPrivateExportKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return (
    PRIVATE_EXPORT_KEYS.has(normalized) ||
    normalized.includes("password") ||
    normalized.includes("secret") ||
    normalized.includes("signed_url") ||
    normalized.includes("signedurl") ||
    normalized.includes("token")
  );
}

type ExportClient = SupabaseClient<Database>;
type QueryResult = { data: unknown; error: { message: string } | null };

export type AccountExport = {
  readonly version: number;
  readonly exportedAt: string;
  readonly account: { readonly id: string; readonly email: string | null };
  readonly data: Record<string, Json>;
};

export function sanitizeExportValue(value: unknown): Json {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (Array.isArray(value)) return value.map(sanitizeExportValue);
  if (typeof value !== "object") return null;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !isPrivateExportKey(key))
      .map(([key, item]) => [key, sanitizeExportValue(item)]),
  );
}

const EXPORT_PAGE_SIZE = 500;

type ExportQuery = {
  range(from: number, to: number): PromiseLike<QueryResult>;
};

async function requireRows(table: string, query: ExportQuery): Promise<Json> {
  const rows: unknown[] = [];
  for (let from = 0; ; from += EXPORT_PAGE_SIZE) {
    const result = await query.range(from, from + EXPORT_PAGE_SIZE - 1);
    if (result.error) throw new Error(`${table}: ${result.error.message}`);
    const page = Array.isArray(result.data) ? result.data : [];
    rows.push(...page);
    if (page.length < EXPORT_PAGE_SIZE) break;
  }
  return sanitizeExportValue(rows);
}

export async function loadAccountExport(
  supabase: ExportClient,
  user: { readonly id: string; readonly email?: string },
  exportedAt = new Date().toISOString(),
): Promise<AccountExport> {
  const [
    profile,
    companies,
    applications,
    applicationStatusHistory,
    contacts,
    interviews,
    calendarEvents,
    tasks,
    reminders,
    documents,
    documentApplications,
    activities,
  ] = await Promise.all([
    requireRows(
      "profiles",
      supabase
        .from("profiles")
        .select(
          "id, display_name, avatar_url, timezone, onboarding_completed, created_at, updated_at",
        )
        .eq("id", user.id),
    ),
    requireRows(
      "companies",
      supabase.from("companies").select("*").eq("user_id", user.id),
    ),
    requireRows(
      "applications",
      supabase.from("applications").select("*").eq("user_id", user.id),
    ),
    requireRows(
      "application_status_history",
      supabase
        .from("application_status_history")
        .select("*")
        .eq("user_id", user.id),
    ),
    requireRows(
      "contacts",
      supabase.from("contacts").select("*").eq("user_id", user.id),
    ),
    requireRows(
      "interviews",
      supabase.from("interviews").select("*").eq("user_id", user.id),
    ),
    requireRows(
      "calendar_events",
      supabase.from("calendar_events").select("*").eq("user_id", user.id),
    ),
    requireRows(
      "tasks",
      supabase.from("tasks").select("*").eq("user_id", user.id),
    ),
    requireRows(
      "reminders",
      supabase.from("reminders").select("*").eq("user_id", user.id),
    ),
    requireRows(
      "documents",
      supabase
        .from("documents")
        .select(
          "id, user_id, application_id, document_type, name, file_name, mime_type, size_bytes, version, created_at, updated_at",
        )
        .eq("user_id", user.id),
    ),
    requireRows(
      "document_applications",
      supabase
        .from("document_applications")
        .select("user_id, document_id, application_id, created_at")
        .eq("user_id", user.id),
    ),
    requireRows(
      "activities",
      supabase.from("activities").select("*").eq("user_id", user.id),
    ),
  ]);

  return {
    version: ACCOUNT_EXPORT_VERSION,
    exportedAt,
    account: { id: user.id, email: user.email ?? null },
    data: {
      profile,
      companies,
      applications,
      applicationStatusHistory,
      contacts,
      interviews,
      calendarEvents,
      tasks,
      reminders,
      documents,
      documentApplications,
      activities,
    },
  };
}
