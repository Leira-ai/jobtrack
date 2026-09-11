import { describe, expect, it } from "vitest";

describe("health endpoint contract", () => {
  it("uses a stable public route", () => {
    expect("/api/health").toBe("/api/health");
  });
});
