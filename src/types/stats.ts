export interface StatusCount {
  readonly status: import("./domain").ApplicationStatus;
  readonly count: number;
}

export interface MonthlyApplicationCount {
  readonly month: string;
  readonly count: number;
}

export interface ApplicationStats {
  readonly total: number;
  readonly submitted: number;
  readonly active: number;
  readonly interviews: number;
  readonly offers: number;
  readonly rejected: number;
  readonly responseRate: number;
  readonly interviewRate: number;
  readonly offerRate: number;
  readonly rejectionRate: number;
  readonly averageResponseDays: number | null;
  readonly byStatus: readonly StatusCount[];
  readonly byMonth: readonly MonthlyApplicationCount[];
}
