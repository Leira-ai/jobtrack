"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  Archive,
  BriefcaseBusiness,
  Columns3,
  List,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Target,
  Trophy,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { calculateApplicationStats } from "@/lib/stats";
import {
  APPLICATION_STATUSES,
  type ApplicationPatch,
  type ApplicationStatus,
  type JobApplication,
  type NewApplication,
  type WorkMode,
} from "@/types";
import { ApplicationForm } from "./application-form";
import { ApplicationsKanban } from "./applications-kanban";
import { ApplicationsTable } from "./applications-table";
import {
  statusLabels,
  statusOptions,
  workModeOptions,
} from "./application-config";
import { Modal } from "./application-dialogs";
import { useApplications } from "./applications-provider";

type ViewMode = "kanban" | "table";
type SortKey = "updated-desc" | "applied-desc" | "company-asc";

export function ApplicationsDashboard() {
  const {
    applications,
    archivedIds,
    mode,
    isPending,
    error,
    createApplication,
    updateApplication,
    moveApplication,
    restoreApplication,
    resetDemo,
  } = useApplications();
  const [view, setView] = useState<ViewMode>("kanban");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ApplicationStatus | "all">("all");
  const [workMode, setWorkMode] = useState<WorkMode | "all">("all");
  const [sort, setSort] = useState<SortKey>("updated-desc");
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<JobApplication | undefined>();
  const importRef = useRef<HTMLInputElement>(null);

  const visibleApplications = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return applications
      .filter(
        (application) => showArchived === archivedIds.includes(application.id),
      )
      .filter(
        (application) => status === "all" || application.status === status,
      )
      .filter(
        (application) =>
          workMode === "all" || application.workMode === workMode,
      )
      .filter(
        (application) =>
          !query ||
          [
            application.company,
            application.role,
            application.location,
            application.source,
            ...application.tags,
          ].some((value) => value.toLocaleLowerCase().includes(query)),
      )
      .toSorted((a, b) => {
        if (sort === "company-asc") return a.company.localeCompare(b.company);
        if (sort === "applied-desc")
          return (b.appliedAt ?? b.createdAt).localeCompare(
            a.appliedAt ?? a.createdAt,
          );
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [applications, archivedIds, search, showArchived, sort, status, workMode]);

  const applicationStats = useMemo(
    () => calculateApplicationStats(applications),
    [applications],
  );
  const stats = {
    active: applicationStats.active,
    interviews: applicationStats.interviews,
    offers: applicationStats.offers,
    archived: archivedIds.length,
  };

  const clearFilters = (): void => {
    setSearch("");
    setStatus("all");
    setWorkMode("all");
    setSort("updated-desc");
  };
  const handleMove = useCallback(
    async (id: string, nextStatus: ApplicationStatus): Promise<void> => {
      try {
        await moveApplication(id, nextStatus, "Dipindahkan dari papan lamaran");
        toast.success(`Dipindahkan ke ${statusLabels[nextStatus]}`);
      } catch (caught) {
        toast.error(
          caught instanceof Error ? caught.message : "Status gagal diperbarui",
        );
      }
    },
    [moveApplication],
  );

  const handleSubmit = async (value: NewApplication): Promise<void> => {
    try {
      if (editing) {
        const patch: ApplicationPatch = value;
        await updateApplication(editing.id, patch);
        toast.success("Lamaran diperbarui");
      } else {
        await createApplication(value);
        toast.success("Lamaran ditambahkan");
      }
      setFormOpen(false);
      setEditing(undefined);
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : "Lamaran gagal disimpan",
      );
    }
  };

  const importCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("CSV terlalu besar. Maksimal 2 MiB.");
      return;
    }
    const text = await file.text();
    const lines = text.split(/\r?\n/u).filter((line) => line.trim());
    if (lines.length < 2) {
      toast.error("CSV harus memiliki header dan minimal satu baris data.");
      return;
    }
    const parseRow = (line: string): string[] => {
      const values: string[] = [];
      let current = "";
      let quoted = false;
      for (const char of line) {
        if (char === '"') quoted = !quoted;
        else if (char === "," && !quoted) {
          values.push(current.trim());
          current = "";
        } else current += char;
      }
      values.push(current.trim());
      return values.map((value) => value.replace(/^"|"$/g, ""));
    };
    const headers = parseRow(lines[0]).map((header) => header.toLowerCase());
    const indexOf = (...names: string[]) =>
      names.map((name) => headers.indexOf(name)).find((index) => index >= 0) ??
      -1;
    const companyIndex = indexOf("company", "perusahaan", "company name");
    const roleIndex = indexOf("role", "posisi", "role title", "job title");
    if (companyIndex < 0 || roleIndex < 0) {
      toast.error(
        "CSV wajib memiliki kolom company/perusahaan dan role/posisi.",
      );
      return;
    }
    let imported = 0;
    for (const line of lines.slice(1).slice(0, 100)) {
      const values = parseRow(line);
      const company = values[companyIndex]?.trim();
      const role = values[roleIndex]?.trim();
      if (!company || !role) continue;
      try {
        await createApplication({
          company,
          role,
          location:
            values[indexOf("location", "lokasi")]?.trim() || "Tidak disebutkan",
          workMode: "remote",
          employmentType: "full-time",
          status: "saved",
          source: values[indexOf("source", "sumber")]?.trim() || "Import CSV",
          jobUrl:
            values[indexOf("job url", "url", "link")]?.trim() || undefined,
          tags: [],
        });
        imported += 1;
      } catch {
        // Continue importing valid rows; final toast reports count.
      }
    }
    toast.success(`${imported} lamaran berhasil diimpor dari CSV.`);
  };

  const statuses = status === "all" ? APPLICATION_STATUSES : [status];
  const filtersActive = Boolean(
    search || status !== "all" || workMode !== "all" || sort !== "updated-desc",
  );

  return (
    <div className="space-y-6">
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
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-400">
              Peluang karier{mode === "demo" ? " · Mode demo" : ""}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Lamaran
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
              Pantau setiap peluang dari tersimpan hingga keputusan akhir.
              {mode === "demo"
                ? " Perubahan tersimpan di browser ini."
                : " Perubahan disimpan aman ke ruang kerjamu."}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {mode === "demo" ? (
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                disabled={isPending}
                onClick={async () => {
                  try {
                    await resetDemo();
                    toast.success("Data demo dipulihkan");
                  } catch (caught) {
                    toast.error(
                      caught instanceof Error
                        ? caught.message
                        : "Data demo gagal dipulihkan",
                    );
                  }
                }}
                type="button"
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                Pulihkan demo
              </button>
            ) : null}
            <input
              ref={importRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(event) => void importCsv(event)}
            />
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              onClick={() => importRef.current?.click()}
            >
              Import CSV
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500"
              onClick={() => {
                setEditing(undefined);
                setFormOpen(true);
              }}
              type="button"
            >
              <Plus aria-hidden="true" className="size-4" />
              Tambah lamaran
            </button>
          </div>
        </header>

        <section
          aria-label="Ringkasan lamaran"
          className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          {[
            {
              label: "Aktif",
              value: stats.active,
              icon: BriefcaseBusiness,
              style:
                "text-teal-700 bg-teal-50 dark:bg-teal-950 dark:text-teal-300",
            },
            {
              label: "Interview",
              value: stats.interviews,
              icon: Target,
              style:
                "text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-300",
            },
            {
              label: "Offer",
              value: stats.offers,
              icon: Trophy,
              style:
                "text-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-slate-300",
            },
            {
              label: "Diarsipkan",
              value: stats.archived,
              icon: Archive,
              style:
                "text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
            },
          ].map(({ label, value, icon: Icon, style }) => (
            <div
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              key={label}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {label}
                </p>
                <span className={`rounded-lg p-2 ${style}`}>
                  <Icon aria-hidden="true" className="size-4" />
                </span>
              </div>
              <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
                {value}
              </p>
            </div>
          ))}
        </section>

        <section
          aria-label="Kontrol lamaran"
          className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-4"
        >
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <label className="relative flex-1">
              <span className="sr-only">Cari lamaran</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400"
              />
              <input
                className="min-h-10 w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-teal-500 dark:focus:ring-teal-950"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari perusahaan, posisi, lokasi, sumber, atau tag…"
                type="search"
                value={search}
              />
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:flex">
              <label>
                <span className="sr-only">Filter status</span>
                <select
                  className="min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-teal-500 dark:focus:ring-teal-950"
                  onChange={(event) =>
                    setStatus(event.target.value as ApplicationStatus | "all")
                  }
                  value={status}
                >
                  <option value="all">Semua status</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="sr-only">Filter sistem kerja</span>
                <select
                  className="min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-teal-500 dark:focus:ring-teal-950"
                  onChange={(event) =>
                    setWorkMode(event.target.value as WorkMode | "all")
                  }
                  value={workMode}
                >
                  <option value="all">Semua sistem kerja</option>
                  {workModeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="sr-only">Urutkan lamaran</span>
                <select
                  className="min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-teal-500 dark:focus:ring-teal-950"
                  onChange={(event) => setSort(event.target.value as SortKey)}
                  value={sort}
                >
                  <option value="updated-desc">Terakhir diperbarui</option>
                  <option value="applied-desc">Terbaru dilamar</option>
                  <option value="company-asc">Perusahaan A–Z</option>
                </select>
              </label>
              <button
                aria-pressed={showArchived}
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold ${showArchived ? "border-slate-900 bg-slate-900 text-white dark:border-teal-600 dark:bg-teal-600" : "border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"}`}
                onClick={() => setShowArchived((value) => !value)}
                type="button"
              >
                <Archive aria-hidden="true" className="size-4" />
                {showArchived ? "Diarsipkan" : "Arsip"}
              </button>
            </div>
            <div
              className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800"
              role="group"
              aria-label="Pilihan tampilan"
            >
              <button
                aria-pressed={view === "kanban"}
                className={`inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold sm:flex-none ${view === "kanban" ? "bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
                onClick={() => setView("kanban")}
                type="button"
              >
                <Columns3 aria-hidden="true" className="size-4" />
                Kanban
              </button>
              <button
                aria-pressed={view === "table"}
                className={`inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold sm:flex-none ${view === "table" ? "bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
                onClick={() => setView("table")}
                type="button"
              >
                <List aria-hidden="true" className="size-4" />
                Tabel
              </button>
            </div>
          </div>
        </section>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p
            aria-live="polite"
            className="text-sm text-slate-600 dark:text-slate-400"
          >
            <strong className="text-slate-900 dark:text-white">
              {visibleApplications.length}
            </strong>{" "}
            lamaran {showArchived ? "diarsipkan" : "aktif"}
          </p>
          {filtersActive ? (
            <button
              className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
              onClick={clearFilters}
              type="button"
            >
              <SlidersHorizontal aria-hidden="true" className="size-4" />
              Hapus filter
            </button>
          ) : null}
        </div>
        <div className="mt-4">
          {showArchived && visibleApplications.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {visibleApplications.map((application) => (
                <button
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  disabled={isPending}
                  key={application.id}
                  onClick={async () => {
                    try {
                      await restoreApplication(application.id);
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
                  Pulihkan {application.company}
                </button>
              ))}
            </div>
          ) : null}
          {view === "kanban" ? (
            <ApplicationsKanban
              applications={visibleApplications}
              onMove={handleMove}
              statuses={statuses}
            />
          ) : (
            <ApplicationsTable
              applications={visibleApplications}
              onMove={handleMove}
            />
          )}
        </div>
      </div>
      <Modal
        description="Catat peluang sekarang; semua kolom dapat diubah nanti."
        onClose={() => {
          setFormOpen(false);
          setEditing(undefined);
        }}
        open={formOpen}
        size="lg"
        title={editing ? "Ubah lamaran" : "Tambah lamaran"}
      >
        <ApplicationForm
          application={editing}
          pending={isPending}
          onCancel={() => {
            setFormOpen(false);
            setEditing(undefined);
          }}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
