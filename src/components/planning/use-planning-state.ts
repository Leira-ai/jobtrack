"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createEventAction,
  createTaskAction,
  deleteEventAction,
  deleteTaskAction,
  updateEventAction,
  updateTaskAction,
} from "@/app/dashboard/planning-actions";
import type {
  CalendarEventInput,
  PlanningMode,
  TaskInput,
} from "@/lib/planning/contracts";
import { jobTrackStore } from "@/store/jobtrack-store";
import type { CalendarEvent, JobTask } from "@/types";

interface PlanningStateOptions {
  readonly mode: PlanningMode;
  readonly initialEvents?: readonly CalendarEvent[];
  readonly initialTasks?: readonly JobTask[];
}

export function usePlanningState({
  mode,
  initialEvents = [],
  initialTasks = [],
}: PlanningStateOptions) {
  const [events, setEvents] = useState<readonly CalendarEvent[]>(initialEvents);
  const [tasks, setTasks] = useState<readonly JobTask[]>(initialTasks);
  const [demoStore, setDemoStore] = useState<
    (typeof import("@/store/jobtrack-store"))["jobTrackStore"] | null
  >(() => (mode === "demo" ? jobTrackStore : null));
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "demo") return;
    let active = true;
    let unsubscribe: (() => void) | undefined;
    void import("@/store/jobtrack-store").then(({ jobTrackStore }) => {
      if (!active) return;
      const sync = () => {
        const state = jobTrackStore.getState();
        setEvents(state.events);
        setTasks(state.tasks);
      };
      setDemoStore(jobTrackStore);
      sync();
      unsubscribe = jobTrackStore.subscribe(sync);
    });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [mode]);

  const run = useCallback(
    async <T>(id: string, operation: () => Promise<T>) => {
      setPendingId(id);
      setError(null);
      try {
        return await operation();
      } catch (caught) {
        const message =
          caught instanceof Error ? caught.message : "Operasi gagal";
        setError(message);
        throw caught;
      } finally {
        setPendingId(null);
      }
    },
    [],
  );

  const saveTask = useCallback(
    async (input: TaskInput, id?: string): Promise<JobTask> =>
      run(id ?? "new-task", async () => {
        if (mode === "demo") {
          if (!demoStore) throw new Error("Data demo belum siap");
          return id
            ? demoStore.updateTask(id, input)
            : demoStore.addTask(input);
        }
        const result = id
          ? await updateTaskAction(id, input)
          : await createTaskAction(input);
        if (!result.ok) throw new Error(result.message);
        setTasks((current) =>
          id
            ? current.map((task) => (task.id === id ? result.data : task))
            : [result.data, ...current],
        );
        return result.data;
      }),
    [demoStore, mode, run],
  );

  const removeTask = useCallback(
    async (id: string): Promise<void> =>
      run(id, async () => {
        if (mode === "demo") {
          if (!demoStore) throw new Error("Data demo belum siap");
          demoStore.deleteTask(id);
          return;
        }
        const result = await deleteTaskAction(id);
        if (!result.ok) throw new Error(result.message);
        setTasks((current) => current.filter((task) => task.id !== id));
      }),
    [demoStore, mode, run],
  );

  const saveEvent = useCallback(
    async (input: CalendarEventInput, id?: string): Promise<CalendarEvent> =>
      run(id ?? "new-event", async () => {
        if (mode === "demo") {
          if (!demoStore) throw new Error("Data demo belum siap");
          return id
            ? demoStore.updateEvent(id, input)
            : demoStore.addEvent(input);
        }
        const result = id
          ? await updateEventAction(id, input)
          : await createEventAction(input);
        if (!result.ok) throw new Error(result.message);
        setEvents((current) =>
          id
            ? current.map((event) => (event.id === id ? result.data : event))
            : [...current, result.data],
        );
        return result.data;
      }),
    [demoStore, mode, run],
  );

  const removeEvent = useCallback(
    async (id: string): Promise<void> =>
      run(id, async () => {
        if (mode === "demo") {
          if (!demoStore) throw new Error("Data demo belum siap");
          demoStore.deleteEvent(id);
          return;
        }
        const result = await deleteEventAction(id);
        if (!result.ok) throw new Error(result.message);
        setEvents((current) => current.filter((event) => event.id !== id));
      }),
    [demoStore, mode, run],
  );

  return {
    events,
    tasks,
    pendingId,
    error,
    clearError: () => setError(null),
    saveTask,
    removeTask,
    saveEvent,
    removeEvent,
  };
}
