import { describe, expect, it } from "vitest";

import { isValidIanaTimezone, onboardingSchema } from "./onboarding";

describe("onboardingSchema", () => {
  it("trims and accepts a valid profile", () => {
    expect(
      onboardingSchema.parse({
        displayName: "  Ayu Lestari  ",
        timezone: "  Asia/Jakarta  ",
      }),
    ).toEqual({
      displayName: "Ayu Lestari",
      timezone: "Asia/Jakarta",
    });
  });

  it.each(["A", "", "a".repeat(121)])(
    "rejects invalid display name %j",
    (displayName) => {
      expect(
        onboardingSchema.safeParse({ displayName, timezone: "UTC" }).success,
      ).toBe(false);
    },
  );

  it("rejects a non-IANA timezone", () => {
    const result = onboardingSchema.safeParse({
      displayName: "Ayu Lestari",
      timezone: "Jakarta Time",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.timezone).toContain(
        "Gunakan zona waktu IANA yang valid.",
      );
    }
  });
});

describe("isValidIanaTimezone", () => {
  it("accepts supported IANA zones and rejects invalid identifiers", () => {
    expect(isValidIanaTimezone("UTC")).toBe(true);
    expect(isValidIanaTimezone("Asia/Jayapura")).toBe(true);
    expect(isValidIanaTimezone("Not/AZone")).toBe(false);
  });
});
