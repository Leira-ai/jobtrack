export function toZonedISOString(
  date: string,
  time: string,
  timeZone: string,
): string {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute);
  let instant = target;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const parts = Object.fromEntries(
      formatter
        .formatToParts(new Date(instant))
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, Number(part.value)]),
    );
    const represented = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    instant += target - represented;
  }
  return new Date(instant).toISOString();
}

export function zonedDayKey(value: string | Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function utcDatePrefix(value: string): string {
  const prefix = /^\d{4}-\d{2}-\d{2}/.exec(value)?.[0];
  if (
    !prefix ||
    new Date(`${prefix}T00:00:00.000Z`).toISOString().slice(0, 10) !== prefix
  ) {
    throw new Error(`Invalid calendar date: ${value}`);
  }
  return prefix;
}

export function eventDayKey(
  startsAt: string,
  allDay: boolean,
  timeZone: string,
): string {
  return allDay ? utcDatePrefix(startsAt) : zonedDayKey(startsAt, timeZone);
}

export type ReminderTiming =
  | "none"
  | "at-time"
  | "one-hour-before"
  | "one-day-before";

const reminderOffsets: Record<Exclude<ReminderTiming, "none">, number> = {
  "at-time": 0,
  "one-hour-before": 60 * 60 * 1000,
  "one-day-before": 24 * 60 * 60 * 1000,
};

export function reminderTime(
  referenceAt: string,
  timing: Exclude<ReminderTiming, "none">,
): string {
  const timestamp = Date.parse(referenceAt);
  if (Number.isNaN(timestamp)) {
    throw new Error(`Invalid reminder reference date: ${referenceAt}`);
  }
  return new Date(timestamp - reminderOffsets[timing]).toISOString();
}
