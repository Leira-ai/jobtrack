import {
  activeStatuses,
  interviewReachStatuses,
  offerReachStatuses,
  responseStatuses,
  submittedStatuses,
} from "../components/applications/application-config";
import type {
  ApplicationStats,
  ApplicationStatus,
  JobApplication,
} from "../types";
import { APPLICATION_STATUSES } from "../types";

const RESPONSE_STATUSES = new Set<ApplicationStatus>(responseStatuses);
const ACTIVE_STATUSES = new Set<ApplicationStatus>(activeStatuses);
const SUBMITTED_STATUSES = new Set<ApplicationStatus>(submittedStatuses);
const INTERVIEW_REACH_STATUSES = new Set<ApplicationStatus>(
  interviewReachStatuses,
);
const OFFER_REACH_STATUSES = new Set<ApplicationStatus>(offerReachStatuses);

const percent = (numerator: number, denominator: number): number =>
  denominator === 0 ? 0 : Math.round((numerator / denominator) * 10_000) / 100;

const hasReachedAny = (
  application: JobApplication,
  statuses: ReadonlySet<ApplicationStatus>,
): boolean =>
  statuses.has(application.status) ||
  application.statusHistory.some((entry) => statuses.has(entry.to));

const responseDate = (application: JobApplication): string | undefined =>
  application.statusHistory
    .filter((entry) => RESPONSE_STATUSES.has(entry.to))
    .map((entry) => entry.changedAt)
    .sort()[0];

export function calculateApplicationStats(
  applications: readonly JobApplication[],
): ApplicationStats {
  const visible = applications.filter((application) => !application.archivedAt);
  const submitted = visible.filter(
    (application) =>
      Boolean(application.appliedAt) ||
      hasReachedAny(application, SUBMITTED_STATUSES),
  );
  const responded = submitted.filter((application) =>
    hasReachedAny(application, RESPONSE_STATUSES),
  );
  const interviews = submitted.filter((application) =>
    hasReachedAny(application, INTERVIEW_REACH_STATUSES),
  ).length;
  const offers = submitted.filter((application) =>
    hasReachedAny(application, OFFER_REACH_STATUSES),
  ).length;
  const rejected = submitted.filter(
    (application) => application.status === "rejected",
  ).length;
  const responseDurations = responded.flatMap((application) => {
    const response = responseDate(application);
    if (!application.appliedAt || !response) return [];
    const duration =
      (Date.parse(response) - Date.parse(application.appliedAt)) / 86_400_000;
    return Number.isFinite(duration) && duration >= 0 ? [duration] : [];
  });
  const months = new Map<string, number>();
  submitted.forEach((application) => {
    if (!application.appliedAt) return;
    const month = application.appliedAt.slice(0, 7);
    months.set(month, (months.get(month) ?? 0) + 1);
  });

  return {
    total: visible.length,
    submitted: submitted.length,
    active: visible.filter((application) =>
      ACTIVE_STATUSES.has(application.status),
    ).length,
    interviews,
    offers,
    rejected,
    responseRate: percent(responded.length, submitted.length),
    interviewRate: percent(interviews, submitted.length),
    offerRate: percent(offers, submitted.length),
    rejectionRate: percent(rejected, submitted.length),
    averageResponseDays:
      responseDurations.length === 0
        ? null
        : Math.round(
            (responseDurations.reduce((sum, value) => sum + value, 0) /
              responseDurations.length) *
              10,
          ) / 10,
    byStatus: APPLICATION_STATUSES.map((status) => ({
      status,
      count: visible.filter((application) => application.status === status)
        .length,
    })),
    byMonth: [...months.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([month, count]) => ({ month, count })),
  };
}

export const getApplicationStats = calculateApplicationStats;
