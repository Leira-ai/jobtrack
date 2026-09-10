import { utcDatePrefix } from "./planning/timezone";
import type { CalendarEvent } from "../types";

const escapeIcsText = (value: string): string =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");

const utcTimestamp = (value: string | Date): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime()))
    throw new Error(`Invalid calendar date: ${String(value)}`);
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
};

const dateOnly = (value: string): string =>
  utcDatePrefix(value).replace(/-/g, "");

const foldLine = (line: string): string => {
  const chunks: string[] = [];
  let current = "";
  let currentBytes = 0;
  for (const character of line) {
    const bytes = new TextEncoder().encode(character).length;
    if (currentBytes + bytes > 75) {
      chunks.push(current);
      current = ` ${character}`;
      currentBytes = 1 + bytes;
    } else {
      current += character;
      currentBytes += bytes;
    }
  }
  chunks.push(current);
  return chunks.join("\r\n");
};

const eventLines = (
  event: CalendarEvent,
  productDomain: string,
): readonly string[] => {
  if (Date.parse(event.endsAt) <= Date.parse(event.startsAt)) {
    throw new Error(`Event ${event.id} must end after it starts`);
  }
  const dates = event.allDay
    ? [
        `DTSTART;VALUE=DATE:${dateOnly(event.startsAt)}`,
        `DTEND;VALUE=DATE:${dateOnly(event.endsAt)}`,
      ]
    : [
        `DTSTART:${utcTimestamp(event.startsAt)}`,
        `DTEND:${utcTimestamp(event.endsAt)}`,
      ];
  return [
    "BEGIN:VEVENT",
    `UID:${escapeIcsText(event.id)}@${productDomain}`,
    `DTSTAMP:${utcTimestamp(event.updatedAt)}`,
    ...dates,
    `SUMMARY:${escapeIcsText(event.title)}`,
    ...(event.description
      ? [`DESCRIPTION:${escapeIcsText(event.description)}`]
      : []),
    ...(event.location ? [`LOCATION:${escapeIcsText(event.location)}`] : []),
    `CATEGORIES:${event.type.toUpperCase()}`,
    "END:VEVENT",
  ];
};

export function generateIcs(
  events: CalendarEvent | readonly CalendarEvent[],
  productDomain = "jobtrack.local",
): string {
  const list = Array.isArray(events) ? events : [events];
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//JobTrack//Job Search Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...list.flatMap((event) => eventLines(event, productDomain)),
    "END:VCALENDAR",
  ];
  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}

export function buildGoogleCalendarUrl(
  event: CalendarEvent,
  timezone?: string,
): string {
  if (Date.parse(event.endsAt) <= Date.parse(event.startsAt)) {
    throw new Error(`Event ${event.id} must end after it starts`);
  }
  const dates = event.allDay
    ? `${dateOnly(event.startsAt)}/${dateOnly(event.endsAt)}`
    : `${utcTimestamp(event.startsAt)}/${utcTimestamp(event.endsAt)}`;
  const parameters = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates,
  });
  if (event.description) parameters.set("details", event.description);
  if (event.location) parameters.set("location", event.location);
  if (timezone) parameters.set("ctz", timezone);
  return `https://calendar.google.com/calendar/render?${parameters.toString()}`;
}

export const generateICS = generateIcs;
export { escapeIcsText };
