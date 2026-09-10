import type { CalendarEvent, JobTask, Reminder } from "@/types";

export const DEMO_REMINDER_STATE_KEY = "jobtrack.demo.reminders.v1";

export interface DemoReminderState {
  readonly read: Record<string, string>;
  readonly dismissed: Record<string, string>;
}

export const emptyDemoReminderState: DemoReminderState = {
  read: {},
  dismissed: {},
};

export function deriveDemoReminders(
  events: readonly CalendarEvent[],
  tasks: readonly JobTask[],
  state: DemoReminderState,
): readonly Reminder[] {
  const fromEvents = events.map((event) => ({
    id: `demo-event-${event.id}`,
    eventId: event.id,
    title: event.title,
    remindAt: event.startsAt,
    readAt: state.read[`demo-event-${event.id}`],
    dismissedAt: state.dismissed[`demo-event-${event.id}`],
    createdAt: event.createdAt,
  }));
  const fromTasks = tasks
    .filter((task) => task.status !== "done" && task.dueAt)
    .map((task) => ({
      id: `demo-task-${task.id}`,
      taskId: task.id,
      title: task.title,
      remindAt: task.dueAt!,
      readAt: state.read[`demo-task-${task.id}`],
      dismissedAt: state.dismissed[`demo-task-${task.id}`],
      createdAt: task.createdAt,
    }));
  return [...fromEvents, ...fromTasks]
    .filter((reminder) => !reminder.dismissedAt)
    .sort((left, right) => left.remindAt.localeCompare(right.remindAt));
}

export function reminderWindow(
  reminders: readonly Reminder[],
  now: Date,
  upcomingHours = 72,
): readonly Reminder[] {
  const upperBound = now.getTime() + upcomingHours * 60 * 60 * 1000;
  return reminders.filter((reminder) => {
    const timestamp = Date.parse(reminder.remindAt);
    return timestamp <= upperBound && !reminder.dismissedAt;
  });
}

export function readDemoReminderState(
  serialized: string | null,
): DemoReminderState {
  if (!serialized) return emptyDemoReminderState;
  try {
    const candidate = JSON.parse(serialized) as Partial<DemoReminderState>;
    return {
      read: candidate.read ?? {},
      dismissed: candidate.dismissed ?? {},
    };
  } catch {
    return emptyDemoReminderState;
  }
}
