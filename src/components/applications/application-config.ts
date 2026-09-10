import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  type EmploymentType,
  type WorkMode,
} from "../../types";

export const statusLabels: Record<ApplicationStatus, string> = {
  saved: "Tersimpan",
  preparing: "Disiapkan",
  applied: "Dilamar",
  screening: "Screening",
  interview: "Interview",
  technical_test: "Technical Test",
  offer: "Offer",
  accepted: "Diterima",
  rejected: "Ditolak",
  withdrawn: "Ditarik",
};

export const statusStyles: Record<ApplicationStatus, string> = {
  saved:
    "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700",
  preparing:
    "bg-cyan-50 text-cyan-700 ring-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:ring-cyan-900",
  applied:
    "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-900",
  screening:
    "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:ring-violet-900",
  interview:
    "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900",
  technical_test:
    "bg-orange-50 text-orange-800 ring-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:ring-orange-900",
  offer:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900",
  accepted:
    "bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:ring-teal-900",
  rejected:
    "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-900",
  withdrawn:
    "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700",
};

export const statusOptions = APPLICATION_STATUSES.map((value) => ({
  value,
  label: statusLabels[value],
}));

export const workModeLabels: Record<WorkMode, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "Kantor",
};

export const workModeOptions: ReadonlyArray<{
  value: WorkMode;
  label: string;
}> = [
  { value: "remote", label: workModeLabels.remote },
  { value: "hybrid", label: workModeLabels.hybrid },
  { value: "onsite", label: workModeLabels.onsite },
];

export const employmentTypeLabels: Record<EmploymentType, string> = {
  "full-time": "Penuh waktu",
  "part-time": "Paruh waktu",
  contract: "Kontrak",
  internship: "Magang",
};

export const employmentTypeOptions: ReadonlyArray<{
  value: EmploymentType;
  label: string;
}> = [
  { value: "full-time", label: employmentTypeLabels["full-time"] },
  { value: "part-time", label: employmentTypeLabels["part-time"] },
  { value: "contract", label: employmentTypeLabels.contract },
  { value: "internship", label: employmentTypeLabels.internship },
];

export const preSubmissionStatuses: readonly ApplicationStatus[] = [
  "saved",
  "preparing",
];

export const activeStatuses: readonly ApplicationStatus[] = [
  "applied",
  "screening",
  "interview",
  "technical_test",
  "offer",
];

export const submittedStatuses: readonly ApplicationStatus[] = [
  ...activeStatuses,
  "accepted",
  "rejected",
  "withdrawn",
];

export const terminalStatuses: readonly ApplicationStatus[] = [
  "accepted",
  "rejected",
  "withdrawn",
];

export const responseStatuses: readonly ApplicationStatus[] = [
  "screening",
  "interview",
  "technical_test",
  "offer",
  "accepted",
  "rejected",
  "withdrawn",
];

export const interviewReachStatuses: readonly ApplicationStatus[] = [
  "interview",
  "technical_test",
  "offer",
  "accepted",
];

export const offerReachStatuses: readonly ApplicationStatus[] = [
  "offer",
  "accepted",
];

export type StatusTone = "slate" | "teal" | "amber" | "red" | "blue" | "purple";

export const statusTones: Record<ApplicationStatus, StatusTone> = {
  saved: "slate",
  preparing: "blue",
  applied: "blue",
  screening: "purple",
  interview: "amber",
  technical_test: "amber",
  offer: "teal",
  accepted: "teal",
  rejected: "red",
  withdrawn: "slate",
};

export const isSubmittedStatus = (status: ApplicationStatus): boolean =>
  submittedStatuses.includes(status);

export const formatDate = (value?: string): string => {
  if (!value) return "Belum diatur";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

export const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const salaryPeriodLabels: Record<string, string> = {
  hour: "jam",
  month: "bulan",
  year: "tahun",
};

export const formatSalary = (
  salary:
    | { min: number; max: number; currency: string; period: string }
    | undefined,
): string => {
  if (!salary) return "Gaji tidak dicantumkan";
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: salary.currency,
    notation: salary.currency === "IDR" ? "compact" : "standard",
    maximumFractionDigits: 0,
  });
  return `${formatter.format(salary.min)} – ${formatter.format(salary.max)} / ${salaryPeriodLabels[salary.period] ?? salary.period}`;
};
