import { describe, expect, it } from "vitest";
import { buildGoogleCalendarUrl, generateIcs } from "./ics";
import type { CalendarEvent } from "../types";

const event: CalendarEvent = {
  id: "event-1",
  title: "Interview, round 2",
  type: "interview",
  startsAt: "2026-09-10T02:00:00.000Z",
  endsAt: "2026-09-10T03:00:00.000Z",
  allDay: false,
  location: "Room A; online",
  description: "Prepare\nquestions",
  createdAt: "2026-09-01T00:00:00.000Z",
  updatedAt: "2026-09-02T00:00:00.000Z",
};

describe("generateIcs", () => {
  it("emits an RFC 5545 calendar with escaped text and CRLF lines", () => {
    const output = generateIcs(event);
    expect(output).toContain("BEGIN:VCALENDAR\r\n");
    expect(output).toContain("SUMMARY:Interview\\, round 2");
    expect(output).toContain("LOCATION:Room A\\; online");
    expect(output).toContain("DESCRIPTION:Prepare\\nquestions");
    expect(output).toContain("DTSTART:20260910T020000Z");
    expect(output.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });

  it("rejects zero-duration events", () => {
    expect(() => generateIcs({ ...event, endsAt: event.startsAt })).toThrow(
      "must end after",
    );
  });

  it("builds an encoded Google Calendar URL with UTC dates and details", () => {
    const url = new URL(buildGoogleCalendarUrl(event, "Asia/Jakarta"));
    expect(url.origin).toBe("https://calendar.google.com");
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
    expect(url.searchParams.get("text")).toBe("Interview, round 2");
    expect(url.searchParams.get("dates")).toBe(
      "20260910T020000Z/20260910T030000Z",
    );
    expect(url.searchParams.get("details")).toBe("Prepare\nquestions");
    expect(url.searchParams.get("location")).toBe("Room A; online");
    expect(url.searchParams.get("ctz")).toBe("Asia/Jakarta");
  });

  it("uses stored UTC date prefixes for all-day calendar exports", () => {
    const allDayEvent = {
      ...event,
      allDay: true,
      startsAt: "2026-09-14T00:00:00.000Z",
      endsAt: "2026-09-15T00:00:00.000Z",
    };
    const url = new URL(
      buildGoogleCalendarUrl(allDayEvent, "America/Los_Angeles"),
    );
    expect(url.searchParams.get("dates")).toBe("20260914/20260915");
    expect(generateIcs(allDayEvent)).toContain(
      "DTSTART;VALUE=DATE:20260914\r\nDTEND;VALUE=DATE:20260915",
    );
  });
});
