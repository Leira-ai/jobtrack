"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Archive,
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import type {
  ApplicationPatch,
  ApplicationStatus,
  NewApplication,
} from "@/types";
import { ApplicationForm } from "./application-form";
import {
  employmentTypeLabels,
  formatDate,
  formatDateTime,
  formatSalary,
  statusLabels,
  statusOptions,
  statusStyles,
  workModeLabels,
} from "./application-config";
import { ConfirmDialog, Modal } from "./application-dialogs";
import { useApplications } from "./applications-provider";

interface ApplicationDetailProps {
  readonly applicationId: string;
}

export function ApplicationDetail({ applicationId }: ApplicationDetailProps) {
  const router = useRouter();
  const store = useApplications();
  const { isPending, mode, error } = store;
  const application = store.applications.find(
    (item) => item.id === applicationId,
  );
  const archived = Boolean(application?.archivedAt);
  const [editingApplication, setEditingApplication] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "archive" | "delete" | null
  >(null);
  const [noteContent, setNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");
  const related = useMemo(
    () => ({
      tasks: store.tasks.filter((task) => task.applicationId === applicationId),
      events: store.events.filter(
        (event) => event.applicationId === applicationId,
      ),
      documents: store.documents.filter((document) =>
        document.applicationIds.includes(applicationId),
      ),
    }),
    [applicationId, store.documents, store.events, store.tasks],
  );

  if (!application) {
    return (
      <div className="flex min-h-96 items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <BriefcaseBusiness
            aria-hidden="true"
            className="mx-auto size-10 text-slate-400"
          />
          <h1 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">
            Lamaran tidak ditemukan
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {mode === "demo"
              ? "Lamaran mungkin telah dihapus dari data demo di browser ini."
              : "Lamaran tidak tersedia atau kamu tidak memiliki akses."}
          </p>
          <Link
            className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500"
            href="/dashboard/lamaran"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Kembali ke lamaran
          </Link>
        </div>
      </div>
    );
  }

  const handleApplicationSubmit = async (
    value: NewApplication,
  ): Promise<void> => {
    try {
      const patch: ApplicationPatch = value;
      await store.updateApplication(application.id, patch);
      setEditingApplication(false);
      toast.success("Lamaran diperbarui");
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : "Lamaran gagal diperbarui",
      );
    }
  };

  const submitNote = async (): Promise<void> => {
    if (!noteContent.trim()) return;
    try {
      await store.addNote(application.id, noteContent);
      setNoteContent("");
      toast.success("Catatan ditambahkan");
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : "Catatan gagal ditambahkan",
      );
    }
  };

  const saveNote = async (): Promise<void> => {
    if (!editingNoteId || !editingNoteContent.trim()) return;
    try {
      await store.updateNote(application.id, editingNoteId, editingNoteContent);
      setEditingNoteId(null);
      setEditingNoteContent("");
      toast.success("Catatan diperbarui");
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : "Catatan gagal diperbarui",
      );
    }
  };

  return (
    <div>
      <Toaster position="top-right" richColors theme="system" />
      <div>
        {error ? (
          <div
            className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
            role="alert"
          >
            {error}
          </div>
        ) : null}
        <Link
          className="inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-slate-600 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:text-slate-400 dark:hover:text-white"
          href="/dashboard/lamaran"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Lamaran
        </Link>
        <header className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[application.status]}`}
                >
                  {statusLabels[application.status]}
                </span>
                {archived ? (
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-700">
                    Diarsipkan
                  </span>
                ) : null}
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                {application.role}
              </h1>
              <p className="mt-1 text-lg font-medium text-slate-600 dark:text-slate-300">
                {application.company}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MapPin aria-hidden="true" className="size-4" />
                  {application.location} ·{" "}
                  {workModeLabels[application.workMode]}
                </span>
                <span className="flex items-center gap-1.5">
                  <BriefcaseBusiness aria-hidden="true" className="size-4" />
                  {employmentTypeLabels[application.employmentType]}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays aria-hidden="true" className="size-4" />
                  {application.appliedAt
                    ? `Dilamar ${formatDate(application.appliedAt)}`
                    : `Disimpan ${formatDate(application.createdAt)}`}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:max-w-md lg:justify-end">
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setEditingApplication(true)}
                type="button"
              >
                <Pencil aria-hidden="true" className="size-4" />
                Ubah
              </button>
              {archived ? (
                <button
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  disabled={isPending}
                  onClick={async () => {
                    try {
                      await store.restoreApplication(application.id);
                      toast.success("Lamaran dipulihkan");
                    } catch (caught) {
                      toast.error(
                        caught instanceof Error
                          ? caught.message
                          : "Lamaran gagal dipulihkan",
                      );
                    }
                  }}
                  type="button"
                >
                  <RotateCcw aria-hidden="true" className="size-4" />
                  Pulihkan
                </button>
              ) : (
                <button
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={() => setConfirmAction("archive")}
                  type="button"
                >
                  <Archive aria-hidden="true" className="size-4" />
                  Arsipkan
                </button>
              )}
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-rose-200 px-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950"
                onClick={() => setConfirmAction("delete")}
                type="button"
              >
                <Trash2 aria-hidden="true" className="size-4" />
                Hapus
              </button>
              {application.jobUrl ? (
                <a
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-3 text-sm font-semibold text-white hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500"
                  href={application.jobUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Lihat lowongan
                  <ExternalLink aria-hidden="true" className="size-4" />
                </a>
              ) : null}
            </div>
          </div>
          <label className="mt-6 block max-w-sm text-sm font-medium text-slate-700 dark:text-slate-200">
            Perbarui status
            <select
              className="mt-1.5 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-500 dark:focus:ring-teal-950"
              disabled={isPending}
              onChange={async (event) => {
                const next = event.target.value as ApplicationStatus;
                try {
                  await store.moveApplication(
                    application.id,
                    next,
                    "Diperbarui dari detail lamaran",
                  );
                  toast.success(`Dipindahkan ke ${statusLabels[next]}`);
                } catch (caught) {
                  toast.error(
                    caught instanceof Error
                      ? caught.message
                      : "Status gagal diperbarui",
                  );
                }
              }}
              value={application.status}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.8fr)]">
          <div className="space-y-6">
            <Section title="Ringkasan">
              <dl className="grid gap-5 sm:grid-cols-2">
                <Info label="Gaji" value={formatSalary(application.salary)} />
                <Info label="Sumber" value={application.source} />
                <Info
                  label="Tenggat"
                  value={formatDate(application.deadline)}
                />
                <Info
                  label="Terakhir diperbarui"
                  value={formatDateTime(application.updatedAt)}
                />
              </dl>
              {application.description ? (
                <p className="mt-6 whitespace-pre-wrap border-t border-slate-100 pt-5 text-sm leading-6 text-slate-700 dark:border-slate-800 dark:text-slate-300">
                  {application.description}
                </p>
              ) : null}
              {application.tags.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {application.tags.map((tag) => (
                    <span
                      className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </Section>

            <Section count={application.notes.length} title="Catatan">
              <form
                className="flex flex-col gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void submitNote();
                }}
              >
                <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Tambah catatan
                  <textarea
                    className="mt-1.5 min-h-24 w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-teal-500 dark:focus:ring-teal-950"
                    onChange={(event) => setNoteContent(event.target.value)}
                    placeholder="Catat pembaruan, percakapan, atau pengingat…"
                    value={noteContent}
                  />
                </label>
                <button
                  className="inline-flex min-h-10 items-center justify-center gap-2 self-end rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-teal-600 dark:hover:bg-teal-500"
                  disabled={!noteContent.trim() || isPending}
                  type="submit"
                >
                  <Plus aria-hidden="true" className="size-4" />
                  Tambah catatan
                </button>
              </form>
              <div className="mt-6 space-y-3">
                {application.notes.map((note) =>
                  editingNoteId === note.id ? (
                    <div
                      className="rounded-xl border border-teal-200 bg-teal-50/40 p-4 dark:border-teal-900 dark:bg-teal-950/30"
                      key={note.id}
                    >
                      <label className="sr-only" htmlFor={`note-${note.id}`}>
                        Ubah catatan
                      </label>
                      <textarea
                        className="min-h-24 w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-500 dark:focus:ring-teal-950"
                        id={`note-${note.id}`}
                        onChange={(event) =>
                          setEditingNoteContent(event.target.value)
                        }
                        value={editingNoteContent}
                      />
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:text-slate-200"
                          onClick={() => setEditingNoteId(null)}
                          type="button"
                        >
                          Batal
                        </button>
                        <button
                          className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 dark:bg-teal-600"
                          disabled={!editingNoteContent.trim() || isPending}
                          onClick={() => void saveNote()}
                          type="button"
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <article
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60"
                      key={note.id}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
                        {note.content}
                      </p>
                      <footer className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>Diperbarui {formatDateTime(note.updatedAt)}</span>
                        <span className="flex gap-1">
                          <button
                            className="rounded-md px-2 py-1 font-semibold text-slate-600 hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                            onClick={() => {
                              setEditingNoteId(note.id);
                              setEditingNoteContent(note.content);
                            }}
                            type="button"
                          >
                            Ubah
                          </button>
                          <button
                            className="rounded-md px-2 py-1 font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950"
                            disabled={isPending}
                            onClick={async () => {
                              try {
                                await store.deleteNote(application.id, note.id);
                                toast.success("Catatan dihapus");
                              } catch (caught) {
                                toast.error(
                                  caught instanceof Error
                                    ? caught.message
                                    : "Catatan gagal dihapus",
                                );
                              }
                            }}
                            type="button"
                          >
                            Hapus
                          </button>
                        </span>
                      </footer>
                    </article>
                  ),
                )}
                {application.notes.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    Belum ada catatan.
                  </p>
                ) : null}
              </div>
            </Section>
          </div>
          <aside className="space-y-6">
            <Section title="Kontak">
              {application.contactName || application.contactEmail ? (
                <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                  {application.contactName ? (
                    <p className="flex items-center gap-2">
                      <UserRound
                        aria-hidden="true"
                        className="size-4 text-slate-400"
                      />
                      {application.contactName}
                    </p>
                  ) : null}
                  {application.contactEmail ? (
                    <a
                      className="flex items-center gap-2 text-teal-700 hover:underline dark:text-teal-400"
                      href={`mailto:${application.contactEmail}`}
                    >
                      <Mail aria-hidden="true" className="size-4" />
                      {application.contactEmail}
                    </a>
                  ) : null}
                </div>
              ) : (
                <EmptySummary text="Belum ada kontak" />
              )}
            </Section>
            <Section count={related.tasks.length} title="Tugas">
              {related.tasks.length ? (
                <div className="space-y-3">
                  {related.tasks.map((task) => (
                    <div className="flex gap-3 text-sm" key={task.id}>
                      {task.status === "done" ? (
                        <CheckCircle2
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-slate-600"
                        />
                      ) : (
                        <Clock3
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-amber-600"
                        />
                      )}
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {task.title}
                        </p>
                        {task.dueAt ? (
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            Tenggat {formatDate(task.dueAt)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptySummary text="Tidak ada tugas terkait" />
              )}
            </Section>
            <Section count={related.events.length} title="Acara">
              {related.events.length ? (
                <div className="space-y-3">
                  {related.events.map((event) => (
                    <div className="flex gap-3 text-sm" key={event.id}>
                      <CalendarDays
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-teal-600"
                      />
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {event.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {formatDateTime(event.startsAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptySummary text="Tidak ada acara terkait" />
              )}
            </Section>
            <Section count={related.documents.length} title="Dokumen">
              {related.documents.length ? (
                <div className="space-y-3">
                  {related.documents.map((document) => (
                    <div className="flex gap-3 text-sm" key={document.id}>
                      <FileText
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-violet-600"
                      />
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {document.name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {document.fileName} · v{document.version}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptySummary text="Tidak ada dokumen terkait" />
              )}
            </Section>
            <Section title="Analisis">
              <div className="flex gap-3">
                <Sparkles
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-violet-600"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {application.status === "interview"
                      ? "Persiapan interview disarankan"
                      : application.status === "technical_test"
                        ? "Persiapan technical test disarankan"
                        : application.status === "offer"
                          ? "Offer siap dibandingkan"
                          : application.status === "accepted"
                            ? "Offer telah diterima"
                            : "Jaga progres tetap terlihat"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {
                      related.tasks.filter((task) => task.status !== "done")
                        .length
                    }{" "}
                    tugas aktif, {related.events.length} acara terjadwal, dan{" "}
                    {application.notes.length} catatan terkait peluang ini.
                  </p>
                </div>
              </div>
            </Section>
          </aside>
        </div>

        <Section className="mt-6" title="Riwayat status">
          <ol className="relative ml-2 border-l border-slate-200 dark:border-slate-700">
            {application.statusHistory.toReversed().map((entry, index) => (
              <li className="ml-6 pb-7 last:pb-0" key={entry.id}>
                <span
                  className={`absolute -left-2 flex size-4 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900 ${index === 0 ? "bg-teal-600" : "bg-slate-300 dark:bg-slate-600"}`}
                />
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {entry.from
                      ? `${statusLabels[entry.from]} → ${statusLabels[entry.to]}`
                      : `Ditambahkan sebagai ${statusLabels[entry.to]}`}
                  </p>
                  <time className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDateTime(entry.changedAt)}
                  </time>
                </div>
                {entry.reason ? (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {translateStatusReason(entry.reason)}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </Section>
      </div>

      <Modal
        description="Perbarui detail peluang ini."
        onClose={() => setEditingApplication(false)}
        open={editingApplication}
        size="lg"
        title="Ubah lamaran"
      >
        <ApplicationForm
          application={application}
          pending={isPending}
          onCancel={() => setEditingApplication(false)}
          onSubmit={handleApplicationSubmit}
        />
      </Modal>
      <ConfirmDialog
        confirmLabel="Arsipkan lamaran"
        description="Lamaran akan dihapus dari tampilan aktif dan dapat dipulihkan nanti."
        onCancel={() => setConfirmAction(null)}
        pending={isPending}
        onConfirm={async () => {
          try {
            await store.archiveApplication(application.id);
            setConfirmAction(null);
            toast.success("Lamaran diarsipkan");
          } catch (caught) {
            toast.error(
              caught instanceof Error
                ? caught.message
                : "Lamaran gagal diarsipkan",
            );
          }
        }}
        open={confirmAction === "archive"}
        title={`Arsipkan ${application.company}?`}
      />
      <ConfirmDialog
        confirmLabel="Hapus permanen"
        description={
          mode === "demo"
            ? "Lamaran, catatan, dan riwayat status akan dihapus dari browser ini. Tindakan ini tidak dapat dibatalkan."
            : "Lamaran, catatan, dan riwayat status akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."
        }
        destructive
        onCancel={() => setConfirmAction(null)}
        pending={isPending}
        onConfirm={async () => {
          try {
            await store.deleteApplication(application.id);
            router.push("/dashboard/lamaran");
          } catch (caught) {
            toast.error(
              caught instanceof Error
                ? caught.message
                : "Lamaran gagal dihapus",
            );
          }
        }}
        open={confirmAction === "delete"}
        title={`Hapus ${application.company}?`}
      />
    </div>
  );
}

function translateStatusReason(reason: string): string {
  const translations: Record<string, string> = {
    "Added to JobTrack": "Ditambahkan ke JobTrack",
    "Demo hiring pipeline update": "Pembaruan alur rekrutmen demo",
    "Application created": "Lamaran dibuat",
    "Updated application": "Detail lamaran diperbarui",
  };
  return translations[reason] ?? reason;
}

function Section({
  title,
  count,
  className = "",
  children,
}: {
  readonly title: string;
  readonly count?: number;
  readonly className?: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6 ${className}`}
    >
      <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-950 dark:text-white">
        {title}
        {count !== undefined ? (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {count}
          </span>
        ) : null}
      </h2>
      {children}
    </section>
  );
}

function Info({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-200">
        {value}
      </dd>
    </div>
  );
}

function EmptySummary({ text }: { readonly text: string }) {
  return <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>;
}
