import { describe, expect, it } from "vitest";
import { safeInternalPath } from "./auth";

describe("safeInternalPath", () => {
  it("keeps local paths and their query string", () => {
    expect(safeInternalPath("/dashboard?tab=tasks", "/onboarding")).toBe(
      "/dashboard?tab=tasks",
    );
  });

  it.each([
    "//evil.example",
    "/\\evil.example",
    "/%5Cevil.example",
    "https://evil.example",
  ])("rejects unsafe redirect target %s", (target) => {
    expect(safeInternalPath(target, "/onboarding")).toBe("/onboarding");
  });
});
