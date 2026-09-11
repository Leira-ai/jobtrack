import { describe, expect, it } from "vitest";
import { canCreateWithinLimit, PLANS } from "./plans";

describe("billing plan limits", () => {
  it("limits free usage and keeps paid plans unlimited", () => {
    expect(canCreateWithinLimit("free", "applications", 14)).toBe(true);
    expect(canCreateWithinLimit("free", "applications", 15)).toBe(false);
    expect(canCreateWithinLimit("free", "documents", 2)).toBe(false);
    expect(canCreateWithinLimit("pro", "applications", 1000)).toBe(true);
    expect(canCreateWithinLimit("lifetime", "cvAnalysesPerMonth", 1000)).toBe(
      true,
    );
    expect(PLANS.pro.priceIdrMonthly).toBe(39_000);
  });
});
