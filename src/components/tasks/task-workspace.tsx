"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  Check,
  CheckCircle2,
  Circle,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { createReminderAction } from "@/app/dashboard/reminder-actions";
import type {
  ApplicationOption,
  PlanningMode,
  TaskInput,
} from "@/lib/planning/contracts";
import {
  reminderTime,
  toZonedISOString,
  type ReminderTiming,
} from "@/lib/planning/timezone";
import type { JobTask, TaskPriority } from "@/types";
import {
  Badge,
  buttonStyles,
  Card,
  EmptyState,
  fieldStyles,
  PageHeader,
} from "@/components/dashboard/ui";
import { cn, formatDate } from "@/components/dashboard/utils";
import { usePlanningState } from "@/components/planning/use-planning-state";

type FilterValue = "all" | "active" | "done";
const priorityLabel = { low: "Rendah", medium: "Sedang", high: "Tinggi" };
const priorityTone = { low: "slate", medium: "amber", high: "red" } as const;

interface TaskWorkspaceProps {
  readonly mode?: PlanningMode;
  readonly initialTasks?: readonly JobTask[];
  readonly applications?: readonly ApplicationOption[];
  readonly timezone?: string;
  readonly loadError?: string;
}

interface TaskFormState {
  readonly title: string;
  readonly description: string;
  readonly priority: TaskPriority;
  readonly dueAt: string;
  readonly applicationId: string;
  readonly reminder: ReminderTiming;
}

const emptyForm: TaskFormState = {
  title: "",
  description: "",
  priority: "medium",
  dueAt: "",
  applicationId: "",
  reminder: "none",
};

const taskInput = (task: JobTask, status = task.status): TaskInput => ({
  applicationId: task.applicationId,
  title: task.title,
  description: task.description,
  priority: task.priority,
  status,
  dueAt: task.dueAt,
  completedAt:
    status === "done"
      ? (task.completedAt ?? new Date().toISOString())
      : undefined,
});

export function TaskWorkspace({
  mode = "demo",
  initialTasks = [],
  applications = [],
  timezone,
  loadError,
}: TaskWorkspaceProps) {
  const { tasks, pendingId, error, clearError, saveTask, removeTask } =
    usePlanningState({ mode, initialTasks });
  const [filter, setFilter] = useState<FilterValue>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<JobTask | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState<TaskFormState>(emptyForm);
  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const matchesFilter =
          filter === "all" ||
          (filter === "active"
            ? task.status !== "done"
            : task.status === "done");
        return (
          matchesFilter &&
          task.title.toLowerCase().includes(query.toLowerCase())
        );
      }),
    [filter, query, tasks],
  );
  const completed = tasks.filter((task) => task.status === "done").length;

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 4000);
  }

  function openCreate() {
    clearError();
    setSubmitError(null);
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(task: JobTask) {
    clearError();
    setSubmitError(null);
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      dueAt: task.dueAt ? task.dueAt.slice(0, 10) : "",
      applicationId: task.applicationId ?? "",
      reminder: "none",
    });
    setFormOpen(true);
  }

  async function toggleTask(task: JobTask) {
    const status = task.status === "done" ? "todo" : "done";
    try {
      await saveTask(taskInput(task, status), task.id);
      flash(
        status === "done" ? "Tugas diselesaikan." : "Tugas dibuka kembali.",
      );
    } catch {
      // The hook exposes the persisted operation error without false success.
    }
  }

  async function submitTask(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    const dueAt = form.dueAt
      ? toZonedISOString(form.dueAt, "12:00", timezone ?? "UTC")
      : undefined;
    const input: TaskInput = {
      applicationId: form.applicationId || undefined,
      title: form.title,
      description: form.description || undefined,
      priority: form.priority,
      status: editing?.status ?? "todo",
      dueAt,
      completedAt: editing?.completedAt,
    };
    try {
      const savedTask = await saveTask(input, editing?.id);
      if (mode === "authenticated" && form.reminder !== "none" && dueAt) {
        if (!editing) setEditing(savedTask);
        const result = await createReminderAction({
          taskId: savedTask.id,
          remindAt: reminderTime(dueAt, form.reminder),
        });
        if (!result.ok) {
          throw new Error(
            `Tugas tersimpan, tetapi pengingat gagal: ${result.message}`,
          );
        }
      }
      setFormOpen(false);
      flash(editing ? "Tugas diperbarui." : "Tugas baru ditambahkan.");
    } catch (caught) {
      if (caught instanceof Error) setSubmitError(caught.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteTask(task: JobTask) {
    if (!window.confirm(`Hapus tugas “${task.title}”?`)) return;
    try {
      await removeTask(task.id);
      flash("Tugas dihapus.");
    } catch {
      // The visible error is supplied by the mutation hook.
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Produktivitas"
        title="Tugas"
        description="Ubah proses pencarian kerja menjadi langkah kecil yang jelas dan terukur."
        actions={
          <button
            type="button"
            onClick={openCreate}
            className={buttonStyles.primary}
          >
            <Plus className="size-4" /> Tugas baru
          </button>
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
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Semua tugas", value: tasks.length },
          { label: "Belum selesai", value: tasks.length - completed },
          { label: "Selesai", value: completed },
        ].map((item) => (
          <Card key={item.label} className="p-4">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-bold">{item.value}</p>
          </Card>
        ))}
      </section>
      <Card className="p-0">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {(["all", "active", "done"] as FilterValue[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={cn(
                  "rounded-lg px-3 py-2 text-xs font-semibold transition",
                  filter === value
                    ? "bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-500",
                )}
              >
                <Filter className="mr-1 inline size-3" />
                {value === "all"
                  ? "Semua"
                  : value === "active"
                    ? "Aktif"
                    : "Selesai"}
              </button>
            ))}
          </div>
          <label className="relative block sm:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <span className="sr-only">Cari tugas</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari tugas..."
              className={`${fieldStyles} pl-9`}
            />
          </label>
        </div>
        {visibleTasks.length ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {visibleTasks.map((task) => (
              <article
                key={task.id}
                className="flex items-start gap-3 p-4 sm:p-5"
              >
                <button
                  type="button"
                  disabled={pendingId === task.id}
                  onClick={() => void toggleTask(task)}
                  className={cn(
                    "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:opacity-50",
                    task.status === "done"
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-slate-300 text-transparent hover:border-teal-600 dark:border-slate-600",
                  )}
                  aria-label={
                    task.status === "done"
                      ? `Tandai ${task.title} belum selesai`
                      : `Selesaikan ${task.title}`
                  }
                >
                  <Check className="size-3.5" />
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "font-medium",
                      task.status === "done" && "text-slate-400 line-through",
                    )}
                  >
                    {task.title}
                  </p>
                  {task.description ? (
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {task.description}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone={priorityTone[task.priority]}>
                      {priorityLabel[task.priority]}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {task.dueAt
                        ? `Tenggat ${formatDate(task.dueAt, undefined, timezone)}`
                        : "Tanpa tenggat"}
                    </span>
                    {task.applicationId ? (
                      <span className="text-xs text-slate-400">
                        {
                          applications.find(
                            (option) => option.id === task.applicationId,
                          )?.label
                        }
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(task)}
                    className={buttonStyles.ghost}
                    aria-label={`Edit ${task.title}`}
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={pendingId === task.id}
                    onClick={() => void deleteTask(task)}
                    className={buttonStyles.ghost}
                    aria-label={`Hapus ${task.title}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<CheckCircle2 className="size-6" />}
            title="Tidak ada tugas yang cocok"
            description="Ubah filter atau buat tugas baru untuk menjaga progresmu."
          />
        )}
      </Card>

      {formOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={submitTask}
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900"
            aria-label={editing ? "Edit tugas" : "Buat tugas baru"}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  {editing ? "Edit tugas" : "Buat tugas baru"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Tambahkan langkah yang bisa langsung dikerjakan.
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
                Judul tugas
                <input
                  autoFocus
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  className={`${fieldStyles} mt-2`}
                  placeholder="Contoh: Latihan wawancara"
                  required
                  maxLength={200}
                />
              </label>
              <label className="block text-sm font-medium">
                Deskripsi
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  className={`${fieldStyles} mt-2 min-h-20`}
                  maxLength={4000}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                  Prioritas
                  <select
                    value={form.priority}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        priority: event.target.value as TaskPriority,
                      })
                    }
                    className={`${fieldStyles} mt-2`}
                  >
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Tinggi</option>
                  </select>
                </label>
                <label className="block text-sm font-medium">
                  Tenggat
                  <input
                    type="date"
                    value={form.dueAt}
                    onChange={(event) =>
                      setForm({ ...form, dueAt: event.target.value })
                    }
                    className={`${fieldStyles} mt-2`}
                  />
                </label>
              </div>
              <label className="block text-sm font-medium">
                Lamaran terkait
                <select
                  value={form.applicationId}
                  onChange={(event) =>
                    setForm({ ...form, applicationId: event.target.value })
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
                  disabled={mode === "demo" || !form.dueAt}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      reminder: event.target.value as ReminderTiming,
                    })
                  }
                  className={`${fieldStyles} mt-2`}
                >
                  <option value="none">Tanpa pengingat</option>
                  <option value="at-time">Saat jatuh tempo</option>
                  <option value="one-hour-before">1 jam sebelumnya</option>
                  <option value="one-day-before">1 hari sebelumnya</option>
                </select>
                {mode === "demo" ? (
                  <span className="mt-2 block text-xs font-normal text-slate-500">
                    Mode demo membuat pengingat otomatis dari tenggat.
                  </span>
                ) : !form.dueAt ? (
                  <span className="mt-2 block text-xs font-normal text-slate-500">
                    Isi tenggat untuk menjadwalkan pengingat.
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
                {submitting ? "Menyimpan..." : "Simpan tugas"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
      {notice ? (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-xl"
        >
          <Circle className="size-4 fill-teal-400 text-teal-400" />
          {notice}
        </div>
      ) : null}
    </div>
  );
}
