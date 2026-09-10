import type { JobApplication } from "@/types";

export type DashboardMode = "demo" | "authenticated";

export interface DashboardProfile {
  readonly displayName: string;
  readonly email: string;
  readonly initials: string;
}

export interface DashboardApplicationData {
  readonly applications: readonly JobApplication[];
  readonly profile: DashboardProfile;
}
