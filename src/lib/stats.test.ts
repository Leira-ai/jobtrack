import { describe, expect, it } from "vitest";
import { calculateApplicationStats } from "./stats";
import type { JobApplication } from "../types";

const application = (
  id: string,
  status: JobApplication["status"],
  appliedAt: string | undefined,
  history: JobApplication["statusHistory"],
): JobApplication =>
  ({
    id,
    company: "Example",
    role: "Engineer",
    location: "Remote",
    workMode: "remote",
    employmentType: "full-time",
    status,
    source: "Test",
    appliedAt,
    tags: [],
    history: undefined,
    statusHistory: history,
    notes: [],
    createdAt: appliedAt,
    updatedAt: history.at(-1)?.changedAt ?? appliedAt,
  }) as JobApplication;

describe("calculateApplicationStats", () => {
  it("uses submitted applications as the rate denominator and historical funnel progression", () => {
    const data = [
      application("1", "offer", "2026-01-01T00:00:00.000Z", [
        {
          id: "h1",
          from: null,
          to: "applied",
          changedAt: "2026-01-01T00:00:00.000Z",
        },
        {
          id: "h2",
          from: "applied",
          to: "screening",
          changedAt: "2026-01-03T00:00:00.000Z",
        },
        {
          id: "h3",
          from: "screening",
          to: "interview",
          changedAt: "2026-01-06T00:00:00.000Z",
        },
        {
          id: "h4",
          from: "interview",
          to: "offer",
          changedAt: "2026-01-08T00:00:00.000Z",
        },
      ]),
      application("2", "rejected", "2026-02-01T00:00:00.000Z", [
        {
          id: "h5",
          from: null,
          to: "applied",
          changedAt: "2026-02-01T00:00:00.000Z",
        },
        {
          id: "h6",
          from: "applied",
          to: "rejected",
          changedAt: "2026-02-05T00:00:00.000Z",
        },
      ]),
      application("3", "applied", "2026-02-02T00:00:00.000Z", [
        {
          id: "h7",
          from: null,
          to: "applied",
          changedAt: "2026-02-02T00:00:00.000Z",
        },
      ]),
      application("4", "saved", undefined, [
        {
          id: "h8",
          from: null,
          to: "saved",
          changedAt: "2026-02-03T00:00:00.000Z",
        },
      ]),
      {
        ...application("5", "accepted", "2026-02-04T00:00:00.000Z", [
          {
            id: "h9",
            from: null,
            to: "applied",
            changedAt: "2026-02-04T00:00:00.000Z",
          },
          {
            id: "h10",
            from: "applied",
            to: "accepted",
            changedAt: "2026-02-10T00:00:00.000Z",
          },
        ]),
        archivedAt: "2026-02-11T00:00:00.000Z",
      },
    ];

    const stats = calculateApplicationStats(data);
    expect(stats.total).toBe(4);
    expect(stats.submitted).toBe(3);
    expect(stats.responseRate).toBe(66.67);
    expect(stats.interviewRate).toBe(33.33);
    expect(stats.offerRate).toBe(33.33);
    expect(stats.averageResponseDays).toBe(3);
    expect(stats.byMonth).toEqual([
      { month: "2026-01", count: 1 },
      { month: "2026-02", count: 2 },
    ]);
  });

  it("counts technical tests and accepted applications in historical funnel reach", () => {
    const stats = calculateApplicationStats([
      application("1", "technical_test", "2026-01-01T00:00:00.000Z", [
        {
          id: "h1",
          from: "screening",
          to: "technical_test",
          changedAt: "2026-01-03T00:00:00.000Z",
        },
      ]),
      application("2", "accepted", "2026-01-02T00:00:00.000Z", [
        {
          id: "h2",
          from: "offer",
          to: "accepted",
          changedAt: "2026-01-05T00:00:00.000Z",
        },
      ]),
      application("3", "withdrawn", "2026-01-03T00:00:00.000Z", [
        {
          id: "h3",
          from: "applied",
          to: "withdrawn",
          changedAt: "2026-01-04T00:00:00.000Z",
        },
      ]),
    ]);

    expect(stats.responseRate).toBe(100);
    expect(stats.interviews).toBe(2);
    expect(stats.offers).toBe(1);
  });

  it("returns zero rates and no response average for empty input", () => {
    expect(calculateApplicationStats([])).toMatchObject({
      total: 0,
      submitted: 0,
      responseRate: 0,
      interviewRate: 0,
      offerRate: 0,
      averageResponseDays: null,
    });
  });
});
