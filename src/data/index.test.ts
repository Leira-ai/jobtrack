import { describe, expect, it } from "vitest";
import { APPLICATION_STATUSES } from "../types";
import {
  demoApplications,
  demoDocuments,
  demoEvents,
  demoTasks,
} from "./index";

describe("demo data", () => {
  it("provides a realistic connected three-month dataset", () => {
    expect(demoApplications.length).toBeGreaterThanOrEqual(24);
    expect(demoEvents.length).toBeGreaterThanOrEqual(4);
    expect(demoTasks.length).toBeGreaterThanOrEqual(8);
    expect(demoDocuments.length).toBeGreaterThanOrEqual(3);
    const months = new Set(
      demoApplications.flatMap(
        (application) => application.appliedAt?.slice(0, 7) ?? [],
      ),
    );
    expect(months).toEqual(new Set(["2026-06", "2026-07", "2026-08"]));
    expect(new Set(demoApplications.map(({ status }) => status))).toEqual(
      new Set(APPLICATION_STATUSES),
    );
    expect(
      demoApplications.every(
        (application) =>
          application.statusHistory.length > 0 && application.notes.length > 0,
      ),
    ).toBe(true);
  });
});
