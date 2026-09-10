import type { Database } from "@/lib/supabase/database.types";
import type {
  ApplicationPatch,
  ApplicationStatus,
  EmploymentType,
  JobApplication,
  NewApplication,
  SalaryRange,
  WorkMode,
} from "@/types";

type Tables = Database["public"]["Tables"];
export type ApplicationRow = Tables["applications"]["Row"];
export type ApplicationInsert = Tables["applications"]["Insert"];
export type ApplicationUpdate = Tables["applications"]["Update"];
export type CompanyRow = Tables["companies"]["Row"];
export type StatusHistoryRow = Tables["application_status_history"]["Row"];
export type ActivityRow = Tables["activities"]["Row"];

export interface ApplicationRecord extends ApplicationRow {
  readonly companies: Pick<CompanyRow, "name"> | null;
  readonly application_status_history: readonly StatusHistoryRow[];
  readonly activities: readonly ActivityRow[];
}

const employmentToDomain = (
  value: ApplicationRow["employment_type"],
): EmploymentType => {
  switch (value) {
    case "part_time":
      return "part-time";
    case "contract":
    case "temporary":
    case "freelance":
      return "contract";
    case "internship":
      return "internship";
    default:
      return "full-time";
  }
};

const employmentToDatabase = (
  value: EmploymentType,
): NonNullable<ApplicationRow["employment_type"]> => {
  switch (value) {
    case "part-time":
      return "part_time";
    case "contract":
      return "contract";
    case "internship":
      return "internship";
    default:
      return "full_time";
  }
};

const workModeToDomain = (value: ApplicationRow["workplace_type"]): WorkMode =>
  value === "unspecified" ? "onsite" : value;

const validCurrency = (
  value: string | null,
): SalaryRange["currency"] | undefined =>
  value === "IDR" || value === "USD" || value === "SGD" || value === "EUR"
    ? value
    : undefined;

const mapSalary = (row: ApplicationRow): SalaryRange | undefined => {
  const currency = validCurrency(row.salary_currency);
  if (
    row.salary_min === null ||
    row.salary_max === null ||
    !currency ||
    row.salary_period === null
  ) {
    return undefined;
  }
  return {
    min: Number(row.salary_min),
    max: Number(row.salary_max),
    currency,
    period: row.salary_period,
  };
};

export function mapApplicationRecord(row: ApplicationRecord): JobApplication {
  return {
    id: row.id,
    company: row.companies?.name ?? "Perusahaan belum ditentukan",
    role: row.role_title,
    location: row.location ?? "Lokasi belum ditentukan",
    workMode: workModeToDomain(row.workplace_type),
    employmentType: employmentToDomain(row.employment_type),
    status: row.status,
    source: row.source ?? "Tidak dicantumkan",
    jobUrl: row.job_url ?? undefined,
    salary: mapSalary(row),
    appliedAt: row.applied_at ?? undefined,
    archivedAt: row.archived_at ?? undefined,
    deadline: row.deadline_at ?? undefined,
    description: row.job_description ?? undefined,
    tags: row.tags,
    statusHistory: row.application_status_history
      .map((history) => ({
        id: String(history.id),
        from: history.from_status,
        to: history.to_status,
        changedAt: history.changed_at,
        reason: history.note ?? undefined,
      }))
      .toSorted((left, right) => left.changedAt.localeCompare(right.changedAt)),
    notes: row.activities
      .filter((activity) => activity.activity_type === "note")
      .map((activity) => ({
        id: activity.id,
        content: activity.body ?? activity.title,
        createdAt: activity.created_at,
        updatedAt: activity.updated_at,
      }))
      .toSorted((left, right) => left.createdAt.localeCompare(right.createdAt)),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const hasOwn = (value: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(value, key);

const applicationWriteFields = (input: NewApplication | ApplicationPatch) => {
  const update: ApplicationUpdate = {};
  if (hasOwn(input, "role") && input.role !== undefined)
    update.role_title = input.role;
  if (hasOwn(input, "employmentType") && input.employmentType !== undefined)
    update.employment_type = employmentToDatabase(input.employmentType);
  if (hasOwn(input, "workMode") && input.workMode !== undefined)
    update.workplace_type = input.workMode;
  if (hasOwn(input, "location")) update.location = input.location ?? null;
  if (hasOwn(input, "jobUrl")) update.job_url = input.jobUrl ?? null;
  if (hasOwn(input, "source")) update.source = input.source ?? null;
  if (hasOwn(input, "salary")) {
    update.salary_min = input.salary?.min ?? null;
    update.salary_max = input.salary?.max ?? null;
    update.salary_currency = input.salary?.currency ?? null;
    update.salary_period = input.salary?.period ?? null;
  }
  if (hasOwn(input, "appliedAt")) update.applied_at = input.appliedAt ?? null;
  if (hasOwn(input, "deadline")) update.deadline_at = input.deadline ?? null;
  if (hasOwn(input, "description"))
    update.job_description = input.description ?? null;
  if (hasOwn(input, "tags")) update.tags = input.tags ? [...input.tags] : [];
  return update;
};

export function toApplicationInsert(
  input: NewApplication,
  companyId: string,
): ApplicationInsert {
  return {
    ...applicationWriteFields(input),
    company_id: companyId,
    role_title: input.role,
    status: input.status,
    employment_type: employmentToDatabase(input.employmentType),
    workplace_type: input.workMode,
    location: input.location,
    source: input.source,
    salary_min: input.salary?.min ?? null,
    salary_max: input.salary?.max ?? null,
    salary_currency: input.salary?.currency ?? null,
    salary_period: input.salary?.period ?? null,
    applied_at: input.appliedAt ?? null,
    deadline_at: input.deadline ?? null,
    job_description: input.description ?? null,
    tags: [...input.tags],
  };
}

export function toApplicationUpdate(
  patch: ApplicationPatch,
  companyId?: string,
): ApplicationUpdate {
  const update = applicationWriteFields(patch);
  return {
    ...update,
    ...(companyId ? { company_id: companyId } : {}),
  };
}

export const isStatus = (value: string): value is ApplicationStatus =>
  [
    "saved",
    "preparing",
    "applied",
    "screening",
    "interview",
    "technical_test",
    "offer",
    "accepted",
    "rejected",
    "withdrawn",
  ].includes(value);
