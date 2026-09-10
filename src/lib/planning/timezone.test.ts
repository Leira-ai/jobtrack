import { describe, expect, it } from "vitest";
import {
  eventDayKey,
  reminderTime,
  toZonedISOString,
  zonedDayKey,
} from "./timezone";

describe("planning timezone helpers", () => {
  it("converts a profile-local wall time to the correct UTC instant", () => {
    expect(toZonedISOString("2026-09-10", "09:00", "Asia/Jakarta")).toBe(
      "2026-09-10T02:00:00.000Z",
    );
    expect(toZonedISOString("2026-09-10", "09:00", "America/New_York")).toBe(
      "2026-09-10T13:00:00.000Z",
    );
  });

  it("groups instants by date in the requested profile timezone", () => {
    expect(zonedDayKey("2026-09-09T18:30:00.000Z", "Asia/Jakarta")).toBe(
      "2026-09-10",
    );
  });

  it("keeps all-day dates on their stored UTC date across timezones", () => {
    const startsAt = "2026-09-14T00:00:00.000Z";
    expect(eventDayKey(startsAt, true, "America/Los_Angeles")).toBe(
      "2026-09-14",
    );
    expect(eventDayKey(startsAt, true, "Asia/Jakarta")).toBe("2026-09-14");
    expect(eventDayKey(startsAt, false, "America/Los_Angeles")).toBe(
      "2026-09-13",
    );
  });

  it("calculates reminder offsets from the referenced instant", () => {
    expect(reminderTime("2026-09-10T16:00:00.000Z", "at-time")).toBe(
      "2026-09-10T16:00:00.000Z",
    );
    expect(reminderTime("2026-09-10T16:00:00.000Z", "one-hour-before")).toBe(
      "2026-09-10T15:00:00.000Z",
    );
    expect(reminderTime("2026-09-10T16:00:00.000Z", "one-day-before")).toBe(
      "2026-09-09T16:00:00.000Z",
    );
  });
});
