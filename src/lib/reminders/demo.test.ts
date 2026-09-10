import { describe, expect, it } from "vitest";
import {
  deriveDemoReminders,
  emptyDemoReminderState,
  reminderWindow,
} from "./demo";
import { demoEvents, demoTasks } from "@/data";

describe("demo reminders", () => {
  it("derives event and active task reminders and keeps dismissal state", () => {
    const reminders = deriveDemoReminders(
      demoEvents,
      demoTasks,
      emptyDemoReminderState,
    );
    expect(reminders.some((item) => item.eventId === "event-001")).toBe(true);
    expect(reminders.some((item) => item.taskId === "task-001")).toBe(true);
    expect(reminders.some((item) => item.taskId === "task-007")).toBe(false);

    const dismissed = deriveDemoReminders(demoEvents, demoTasks, {
      read: {},
      dismissed: { "demo-event-event-001": "2026-09-08T00:00:00.000Z" },
    });
    expect(dismissed.some((item) => item.eventId === "event-001")).toBe(false);
  });

  it("returns due and upcoming reminders within the foreground window", () => {
    const reminders = deriveDemoReminders(
      demoEvents,
      demoTasks,
      emptyDemoReminderState,
    );
    const visible = reminderWindow(
      reminders,
      new Date("2026-09-08T12:00:00.000Z"),
      72,
    );
    expect(visible.some((item) => item.eventId === "event-001")).toBe(true);
    expect(visible.some((item) => item.eventId === "event-005")).toBe(false);
  });
});
