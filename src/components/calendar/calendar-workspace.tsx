"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { id } from "date-fns/locale";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { createReminderAction } from "@/app/dashboard/reminder-actions";
import type {
  ApplicationOption,
  CalendarEventInput,
  PlanningMode,
} from "@/lib/planning/contracts";
import type { CalendarEvent, CalendarEventType } from "@/types";
import { buildGoogleCalendarUrl, generateIcs } from "@/lib/ics";
import {
  eventDayKey,
  reminderTime,
  toZonedISOString,
  type ReminderTiming,
} from "@/lib/planning/timezone";
import {
  Badge,
  buttonStyles,
  Card,
  CardTitle,
  fieldStyles,
  PageHeader,
} from "@/components/dashboard/ui";
import { cn } from "@/components/dashboard/utils";
import { usePlanningState } from "@/components/planning/use-planning-state";

const typeLabel = {
  interview: "Wawancara",
  deadline: "Tenggat",
  "follow-up": "Tindak lanjut",
  networking: "Networking",
  other: "Lainnya",
};
const typeColor = {
  interview: "bg-violet-500",
  deadline: "bg-red-500",
  "follow-up": "bg-blue-500",
  networking: "bg-teal-500",
  other: "bg-slate-400",
};
const typeTone = {
  interview: "purple",
  deadline: "red",
  "follow-up": "blue",
  networking: "teal",
  other: "slate",
} as const;

interface CalendarWorkspaceProps {
  readonly mode?: PlanningMode;
  readonly initialEvents?: readonly CalendarEvent[];
  readonly applications?: readonly ApplicationOption[];
  readonly timezone?: string;
  readonly loadError?: string;
  readonly now?: Date;
}

interface EventFormState {
  readonly title: string;
  readonly type: CalendarEventType;
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly allDay: boolean;
  readonly location: string;
  readonly description: string;
  readonly applicationId: string;
  readonly reminder: ReminderTiming;
}

const emptyForm = (date: Date): EventFormState => ({
  title: "",
  type: "other",
  date: format(date, "yyyy-MM-dd"),
  startTime: "09:00",
  endTime: "10:00",
  allDay: false,
  location: "",
  description: "",
  applicationId: "",
  reminder: "none",
});
const eventTime = (event: CalendarEvent, timeZone: string) => {
  if (event.allDay) return "Sepanjang hari";
  const formatter = new Intl.DateTimeFormat("id-ID", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formatter.format(new Date(event.startsAt))}–${formatter.format(new Date(event.endsAt))}`;
};

export function CalendarWorkspace({
  mode = "demo",
  initialEvents = [],
  applications = [],
  timezone = "Asia/Jakarta",
  loadError,
  now = new Date(),
}: CalendarWorkspaceProps) {
  const initialDate = useMemo(() => {
    if (mode === "demo" && initialEvents.length) {
      const firstEvent = initialEvents[0];
      const dayKey = eventDayKey(
        firstEvent.startsAt,
        firstEvent.allDay,
        timezone,
      );
      return new Date(`${dayKey}T12:00:00`);
    }
    return now;
  }, [initialEvents, mode, now, timezone]);
  const { events, pendingId, error, clearError, saveEvent, removeEvent } =
    usePlanningState({ mode, initialEvents });
  const [month, setMonth] = useState(initialDate);
  const [selected, setSelected] = useState(initialDate);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<EventFormState>(() =>
    emptyForm(initialDate),
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const calendarDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
      }),
    [month],
  );
  const selectedEvents = events.filter(
    (event) =>
      eventDayKey(event.startsAt, event.allDay, timezone) ===
      format(selected, "yyyy-MM-dd"),
  );
  const agendaEvents = [...events]
    .filter((event) =>
      eventDayKey(event.startsAt, event.allDay, timezone).startsWith(
        format(month, "yyyy-MM"),
      ),
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2400);
  }
  function downloadCalendar() {
    const blob = new Blob([generateIcs(events)], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "jobtrack-agenda.ics";
    anchor.click();
    URL.revokeObjectURL(url);
  }
  function openCreate() {
    clearError();
    setSubmitError(null);
    setEditing(null);
    setForm(emptyForm(selected));
    setFormOpen(true);
  }
  function openEdit(event: CalendarEvent) {
    clearError();
    setSubmitError(null);
    setEditing(event);
    const time = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    setForm({
      title: event.title,
      type: event.type,
      date: eventDayKey(event.startsAt, event.allDay, timezone),
      startTime: time.format(new Date(event.startsAt)),
      endTime: time.format(new Date(event.endsAt)),
      allDay: event.allDay,
      location: event.location ?? "",
      description: event.description ?? "",
      applicationId: event.applicationId ?? "",
      reminder: "none",
    });
    setFormOpen(true);
  }
  async function submitEvent(submit: FormEvent) {
    submit.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    const startsAt = form.allDay
      ? new Date(`${form.date}T00:00:00.000Z`).toISOString()
      : toZonedISOString(form.date, form.startTime, timezone);
    const endsAt = form.allDay
      ? new Date(`${form.date}T00:00:00.000Z`).toISOString()
      : toZonedISOString(form.date, form.endTime, timezone);
    const input: CalendarEventInput = {
      title: form.title,
      type: form.type,
      startsAt,
      endsAt: form.allDay
        ? new Date(Date.parse(endsAt) + 86_400_000).toISOString()
        : endsAt,
      allDay: form.allDay,
      location: form.location || undefined,
      description: form.description || undefined,
      applicationId: form.applicationId || undefined,
    };
    try {
      const savedEvent = await saveEvent(input, editing?.id);
      if (mode === "authenticated" && form.reminder !== "none") {
        if (!editing) setEditing(savedEvent);
        const result = await createReminderAction({
          eventId: savedEvent.id,
          remindAt: reminderTime(startsAt, form.reminder),
        });
        if (!result.ok) {
          throw new Error(
            `Agenda tersimpan, tetapi pengingat gagal: ${result.message}`,
          );
        }
      }
      setFormOpen(false);
      flash(editing ? "Agenda diperbarui." : "Agenda ditambahkan.");
    } catch (caught) {
      if (caught instanceof Error) setSubmitError(caught.message);
    } finally {
      setSubmitting(false);
    }
  }
  async function deleteEvent(event: CalendarEvent) {
    if (!window.confirm(`Hapus agenda “${event.title}”?`)) return;
    try {
      await removeEvent(event.id);
      flash("Agenda dihapus.");
    } catch {
      /* mutation error is visible */
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Perencanaan"
        title="Kalender"
        description="Satukan jadwal wawancara, tenggat, dan tindak lanjut dalam satu agenda."
        actions={
          <>
            <button
              type="button"
              onClick={openCreate}
              className={buttonStyles.secondary}
            >
              <Plus className="size-4" /> Agenda baru
            </button>
            <button
              type="button"
              onClick={downloadCalendar}
              className={buttonStyles.primary}
            >
              <Download className="size-4" /> Unduh .ics
            </button>
          </>
        }
      />
      {loadError || error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {error ?? loadError}
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800 sm:p-5">
            <div>
              <h2 className="text-lg font-semibold capitalize">
                {format(month, "MMMM yyyy", { locale: id })}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Pilih tanggal untuk melihat agenda
              </p>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setMonth(subMonths(month, 1))}
                className={buttonStyles.ghost}
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMonth(now);
                  setSelected(now);
                }}
                className={buttonStyles.ghost}
              >
                Hari ini
              </button>
              <button
                type="button"
                onClick={() => setMonth(addMonths(month, 1))}
                className={buttonStyles.ghost}
                aria-label="Bulan berikutnya"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50">
            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
              <div
                key={day}
                className="py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day) => {
              const dayEvents = events.filter(
                (event) =>
                  eventDayKey(event.startsAt, event.allDay, timezone) ===
                  format(day, "yyyy-MM-dd"),
              );
              const active = isSameDay(day, selected);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setSelected(day)}
                  className={cn(
                    "min-h-20 border-b border-r border-slate-100 p-2 text-left transition hover:bg-slate-50 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-800 dark:hover:bg-slate-800/60 sm:min-h-28 sm:p-3",
                    !isSameMonth(day, month) &&
                      "bg-slate-50/60 text-slate-300 dark:bg-slate-950/50 dark:text-slate-600",
                    active &&
                      "bg-teal-50 ring-1 ring-inset ring-teal-500 dark:bg-teal-950/50",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-full text-xs font-semibold",
                      isSameDay(day, now) &&
                        "bg-slate-900 text-white dark:bg-white dark:text-slate-950",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="mt-2 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div key={event.id} className="flex items-center gap-1">
                        <span
                          className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            typeColor[event.type],
                          )}
                        />
                        <span className="hidden truncate text-[10px] font-medium text-slate-600 dark:text-slate-300 sm:block">
                          {event.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardTitle
              title={format(selected, "EEEE, d MMMM", { locale: id })}
              description={
                selectedEvents.length
                  ? `${selectedEvents.length} agenda`
                  : "Tidak ada agenda"
              }
            />
            {selectedEvents.length ? (
              <div className="space-y-3">
                {selectedEvents.map((event) => (
                  <article
                    key={event.id}
                    className="rounded-xl border border-slate-100 p-4 dark:border-slate-800"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Badge tone={typeTone[event.type]}>
                        {typeLabel[event.type]}
                      </Badge>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(event)}
                          className={buttonStyles.ghost}
                          aria-label={`Edit ${event.title}`}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          disabled={pendingId === event.id}
                          onClick={() => void deleteEvent(event)}
                          className={buttonStyles.ghost}
                          aria-label={`Hapus ${event.title}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="mt-3 font-semibold leading-6">
                      {event.title}
                    </h3>
                    <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <Clock3 className="size-3.5" />
                      {eventTime(event, timezone)}
                    </p>
                    {event.location ? (
                      <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="size-3.5" />
                        {event.location}
                      </p>
                    ) : null}
                    {event.description ? (
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {event.description}
                      </p>
                    ) : null}
                    <a
                      href={buildGoogleCalendarUrl(event, timezone)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline dark:text-teal-400"
                    >
                      Google Calendar <ExternalLink className="size-3" />
                    </a>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 py-8 text-center dark:bg-slate-800/50">
                <CalendarDays className="mx-auto size-6 text-slate-400" />
                <p className="mt-2 text-sm text-slate-500">
                  Waktu kosong untuk fokus.
                </p>
              </div>
            )}
          </Card>
          <Card>
            <CardTitle
              title="Agenda bulan ini"
              description={format(month, "MMMM yyyy", { locale: id })}
            />
            {agendaEvents.length ? (
              <div className="space-y-4">
                {agendaEvents.map((event) => (
                  <button
                    type="button"
                    onClick={() => {
                      const dayKey = eventDayKey(
                        event.startsAt,
                        event.allDay,
                        timezone,
                      );
                      const eventDate = new Date(`${dayKey}T12:00:00`);
                      setMonth(eventDate);
                      setSelected(eventDate);
                    }}
                    key={event.id}
                    className="flex w-full gap-3 text-left"
                  >
                    <div className="w-9 shrink-0 text-center">
                      <p className="text-lg font-bold">
                        {Number(
                          eventDayKey(
                            event.startsAt,
                            event.allDay,
                            timezone,
                          ).slice(8, 10),
                        )}
                      </p>
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        {new Intl.DateTimeFormat("id-ID", {
                          month: "short",
                          timeZone: "UTC",
                        }).format(
                          new Date(
                            `${eventDayKey(event.startsAt, event.allDay, timezone)}T00:00:00.000Z`,
                          ),
                        )}
                      </p>
                    </div>
                    <div className="min-w-0 border-l border-slate-200 pl-3 dark:border-slate-700">
                      <p className="truncate text-sm font-medium">
                        {event.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {typeLabel[event.type]}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Belum ada agenda bulan ini.
              </p>
            )}
          </Card>
        </div>
      </div>
      {formOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={submitEvent}
            aria-label={editing ? "Edit agenda" : "Buat agenda baru"}
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  {editing ? "Edit agenda" : "Buat agenda baru"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Waktu ditampilkan dalam {timezone}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className={buttonStyles.ghost}
                aria-label="Tutup"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium">
                Judul agenda
                <input
                  autoFocus
                  required
                  maxLength={200}
                  value={form.title}
                  onChange={(change) =>
                    setForm({ ...form, title: change.target.value })
                  }
                  className={`${fieldStyles} mt-2`}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                  Jenis
                  <select
                    value={form.type}
                    onChange={(change) =>
                      setForm({
                        ...form,
                        type: change.target.value as CalendarEventType,
                      })
                    }
                    className={`${fieldStyles} mt-2`}
                  >
                    {Object.entries(typeLabel).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium">
                  Tanggal
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(change) =>
                      setForm({ ...form, date: change.target.value })
                    }
                    className={`${fieldStyles} mt-2`}
                  />
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.allDay}
                  onChange={(change) =>
                    setForm({ ...form, allDay: change.target.checked })
                  }
                />{" "}
                Sepanjang hari
              </label>
              {!form.allDay ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium">
                    Mulai
                    <input
                      required
                      type="time"
                      value={form.startTime}
                      onChange={(change) =>
                        setForm({ ...form, startTime: change.target.value })
                      }
                      className={`${fieldStyles} mt-2`}
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    Selesai
                    <input
                      required
                      type="time"
                      value={form.endTime}
                      onChange={(change) =>
                        setForm({ ...form, endTime: change.target.value })
                      }
                      className={`${fieldStyles} mt-2`}
                    />
                  </label>
                </div>
              ) : null}
              <label className="block text-sm font-medium">
                Lokasi
                <input
                  maxLength={500}
                  value={form.location}
                  onChange={(change) =>
                    setForm({ ...form, location: change.target.value })
                  }
                  className={`${fieldStyles} mt-2`}
                />
              </label>
              <label className="block text-sm font-medium">
                Deskripsi
                <textarea
                  maxLength={4000}
                  value={form.description}
                  onChange={(change) =>
                    setForm({ ...form, description: change.target.value })
                  }
                  className={`${fieldStyles} mt-2 min-h-20`}
                />
              </label>
              <label className="block text-sm font-medium">
                Lamaran terkait
                <select
                  value={form.applicationId}
                  onChange={(change) =>
                    setForm({ ...form, applicationId: change.target.value })
                  }
                  className={`${fieldStyles} mt-2`}
                >
                  <option value="">Tanpa lamaran</option>
                  {applications.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium">
                Pengingat
                <select
                  value={form.reminder}
                  disabled={mode === "demo"}
                  onChange={(change) =>
                    setForm({
                      ...form,
                      reminder: change.target.value as ReminderTiming,
                    })
                  }
                  className={`${fieldStyles} mt-2`}
                >
                  <option value="none">Tanpa pengingat</option>
                  <option value="at-time">Saat agenda dimulai</option>
                  {!form.allDay ? (
                    <option value="one-hour-before">1 jam sebelumnya</option>
                  ) : null}
                  <option value="one-day-before">1 hari sebelumnya</option>
                </select>
                {mode === "demo" ? (
                  <span className="mt-2 block text-xs font-normal text-slate-500">
                    Mode demo membuat pengingat otomatis dari jadwal.
                  </span>
                ) : null}
              </label>
              {error || submitError ? (
                <p role="alert" className="text-sm text-red-600">
                  {submitError ?? error}
                </p>
              ) : null}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className={buttonStyles.secondary}
              >
                Batal
              </button>
              <button disabled={submitting} className={buttonStyles.primary}>
                {submitting ? "Menyimpan..." : "Simpan agenda"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
      {notice ? (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-xl"
        >
          {notice}
        </div>
      ) : null}
    </div>
  );
}
