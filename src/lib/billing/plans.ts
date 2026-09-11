import type { SubscriptionTier } from "@/types";

export interface PlanLimits {
  readonly applications: number | null;
  readonly documents: number | null;
  readonly cvAnalysesPerMonth: number | null;
}

export interface PlanDefinition {
  readonly tier: SubscriptionTier;
  readonly name: string;
  readonly priceIdrMonthly: number;
  readonly priceIdrYearly: number | null;
  readonly limits: PlanLimits;
}

export const PLANS: Record<SubscriptionTier, PlanDefinition> = {
  free: {
    tier: "free",
    name: "Gratis",
    priceIdrMonthly: 0,
    priceIdrYearly: null,
    limits: { applications: 15, documents: 2, cvAnalysesPerMonth: 3 },
  },
  pro: {
    tier: "pro",
    name: "Pro",
    priceIdrMonthly: 39_000,
    priceIdrYearly: 299_000,
    limits: { applications: null, documents: null, cvAnalysesPerMonth: null },
  },
  lifetime: {
    tier: "lifetime",
    name: "Lifetime",
    priceIdrMonthly: 199_000,
    priceIdrYearly: null,
    limits: { applications: null, documents: null, cvAnalysesPerMonth: null },
  },
};

export function canCreateWithinLimit(
  tier: SubscriptionTier,
  resource: keyof PlanLimits,
  currentUsage: number,
): boolean {
  const limit = PLANS[tier].limits[resource];
  return limit === null || currentUsage < limit;
}
