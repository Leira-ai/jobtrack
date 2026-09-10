"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, BellRing, Check, X } from "lucide-react";
import {
  dismissReminderAction,
  markReminderReadAction,
} from "@/app/dashboard/reminder-actions";
import { buttonStyles } from "@/components/dashboard/ui";
import type { PlanningMode } from "@/lib/planning/contracts";
import {
  DEMO_REMINDER_STATE_KEY,
  deriveDemoReminders,
  readDemoReminderState,
  reminderWindow,
  type DemoReminderState,
} from "@/lib/reminders/demo";
import type { Reminder } from "@/types";

export interface ReminderCenterProps {
  readonly mode: PlanningMode;
  readonly initialReminders?: readonly Reminder[];
  readonly loadError?: string;
  readonly now?: Date;
}

export function ReminderCenter({
  mode,
  initialReminders = [],
  loadError,
  now = new Date(),
}: ReminderCenterProps) {
  const [reminders, setReminders] =
    useState<readonly Reminder[]>(initialReminders);
  const [demoState, setDemoState] = useState<DemoReminderState>(() =>
    typeof window === "undefined"
      ? { read: {}, dismissed: {} }
      : readDemoReminderState(localStorage.getItem(DEMO_REMINDER_STATE_KEY)),
  );
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(loadError ?? null);
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | "unsupported"
  >(() =>
    typeof Notification === "undefined"
      ? "unsupported"
      : Notification.permission,
  );

  useEffect(() => {
    if (mode !== "demo") return;
    let unsubscribe: (() => void) | undefined;
    void import("@/store/jobtrack-store").then(({ jobTrackStore }) => {
      const sync = () => {
        const state = jobTrackStore.getState();
        setReminders(deriveDemoReminders(state.events, state.tasks, demoState));
      };
      sync();
      unsubscribe = jobTrackStore.subscribe(sync);
    });
    return () => unsubscribe?.();
  }, [demoState, mode]);

  const visible = useMemo(
    () => reminderWindow(reminders, now),
    [now, reminders],
  );
  const unread = visible.filter((reminder) => !reminder.readAt).length;

  function persistDemo(next: DemoReminderState) {
    setDemoState(next);
    localStorage.setItem(DEMO_REMINDER_STATE_KEY, JSON.stringify(next));
  }

  async function markRead(reminder: Reminder) {
    if (reminder.readAt) return;
    setPendingId(reminder.id);
    setError(null);
    try {
      if (mode === "demo") {
        const readAt = new Date().toISOString();
        persistDemo({
          ...demoState,
          read: { ...demoState.read, [reminder.id]: readAt },
        });
        return;
      }
      const result = await markReminderReadAction(reminder.id);
      if (!result.ok) throw new Error(result.message);
      setReminders((current) =>
        current.map((item) =>
          item.id === reminder.id
            ? { ...item, readAt: result.data.readAt }
            : item,
        ),
      );
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Pengingat gagal ditandai",
      );
    } finally {
      setPendingId(null);
    }
  }

  async function dismiss(reminder: Reminder) {
    setPendingId(reminder.id);
    setError(null);
    try {
      if (mode === "demo") {
        const dismissedAt = new Date().toISOString();
        persistDemo({
          ...demoState,
          dismissed: { ...demoState.dismissed, [reminder.id]: dismissedAt },
        });
        return;
      }
      const result = await dismissReminderAction(reminder.id);
      if (!result.ok) throw new Error(result.message);
      setReminders((current) =>
        current.filter((item) => item.id !== reminder.id),
      );
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Pengingat gagal ditutup",
      );
    } finally {
      setPendingId(null);
    }
  }

  async function requestNotifications() {
    if (typeof Notification === "undefined") return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === "granted" && visible[0]) {
      new Notification("Pengingat JobTrack", {
        body: visible[0].title,
      });
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative grid size-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800"
        aria-label="Lihat pengingat"
        aria-expanded={open}
      >
        <Bell className="size-5" />
        {unread ? (
          <span className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <section
          aria-label="Pusat pengingat"
          className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between px-2 py-1">
            <div>
              <h2 className="text-sm font-semibold">Pengingat</h2>
              <p className="text-[11px] text-slate-500">
                Jatuh tempo dan 72 jam ke depan
              </p>
            </div>
            <BellRing className="size-4 text-teal-600" />
          </div>
          {notificationPermission === "default" ? (
            <button
              type="button"
              onClick={() => void requestNotifications()}
              className={`${buttonStyles.secondary} mt-3 w-full justify-center text-xs`}
            >
              Aktifkan notifikasi saat aplikasi terbuka
            </button>
          ) : null}
          {error ? (
            <p
              role="alert"
              className="mt-2 rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-200"
            >
              {error}
            </p>
          ) : null}
          <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
            {visible.length ? (
              visible.map((reminder) => {
                const due = Date.parse(reminder.remindAt) <= now.getTime();
                return (
                  <article
                    key={reminder.id}
                    className={`rounded-xl border p-3 ${reminder.readAt ? "border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950" : "border-teal-200 bg-teal-50 dark:border-teal-900 dark:bg-teal-950"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {reminder.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {due
                            ? "Sudah waktunya"
                            : new Intl.DateTimeFormat("id-ID", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }).format(new Date(reminder.remindAt))}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        {!reminder.readAt ? (
                          <button
                            type="button"
                            disabled={pendingId === reminder.id}
                            onClick={() => void markRead(reminder)}
                            className="grid size-7 place-items-center rounded-lg hover:bg-white/70"
                            aria-label={`Tandai ${reminder.title} sudah dibaca`}
                          >
                            <Check className="size-3.5" />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={pendingId === reminder.id}
                          onClick={() => void dismiss(reminder)}
                          className="grid size-7 place-items-center rounded-lg hover:bg-white/70"
                          aria-label={`Tutup ${reminder.title}`}
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500 dark:bg-slate-800">
                Tidak ada pengingat dekat.
              </p>
            )}
          </div>
          <p className="mt-3 px-2 text-[10px] leading-4 text-slate-400">
            Pengingat hanya ditampilkan di dalam aplikasi. Tidak ada pengiriman
            latar belakang atau email.
          </p>
        </section>
      ) : null}
    </div>
  );
}
