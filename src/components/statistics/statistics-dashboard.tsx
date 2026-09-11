"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  CalendarRange,
  Clock3,
  MessagesSquare,
  Trophy,
} from "lucide-react";
import { statusLabels } from "@/components/applications/application-config";
import { useApplications } from "@/components/applications/applications-provider";
import { calculateApplicationStats } from "@/lib/stats";
import {
  Card,
  CardTitle,
  fieldStyles,
  PageHeader,
} from "@/components/dashboard/ui";

const colors = [
  "bg-slate-300",
  "bg-cyan-400",
  "bg-blue-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-orange-500",
  "bg-slate-500",
  "bg-teal-600",
  "bg-red-400",
  "bg-slate-500",
];

interface StatisticsDashboardProps {
  readonly referenceDate?: Date;
}

export function StatisticsDashboard({
  referenceDate,
}: StatisticsDashboardProps = {}) {
  const { applications, mode } = useApplications();
  const [period, setPeriod] = useState("6");
  const [source, setSource] = useState("all");
  const filtered = useMemo(() => {
    const baseDate =
      referenceDate ??
      (mode === "demo" ? new Date("2026-09-08T00:00:00Z") : new Date());
    const cutoff = new Date(baseDate);
    cutoff.setMonth(cutoff.getMonth() - Number(period));
    return applications.filter(
      (application) =>
        !application.archivedAt &&
        (source === "all" || application.source === source) &&
        (!application.appliedAt || new Date(application.appliedAt) >= cutoff),
    );
  }, [applications, mode, period, referenceDate, source]);
  const stats = calculateApplicationStats(filtered);
  const sources = [...new Set(applications.map((item) => item.source))];
  const maxMonthly = Math.max(1, ...stats.byMonth.map((item) => item.count));
  const statusTotal = Math.max(
    1,
    stats.byStatus.reduce((sum, item) => sum + item.count, 0),
  );
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Insight pencarian"
        title="Statistik"
        description="Pahami pola pencarian kerja dan fokuskan energi pada strategi yang paling efektif."
        actions={
          <>
            <label className="sr-only" htmlFor="period">
              Periode
            </label>
            <select
              id="period"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className={`${fieldStyles} w-auto min-w-40`}
            >
              <option value="3">3 bulan</option>
              <option value="6">6 bulan</option>
              <option value="12">12 bulan</option>
            </select>
            <label className="sr-only" htmlFor="source">
              Sumber
            </label>
            <select
              id="source"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              className={`${fieldStyles} w-auto min-w-40`}
            >
              <option value="all">Semua sumber</option>
              {sources.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </>
        }
      />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Lamaran dikirim",
            value: stats.submitted,
            suffix: "",
            icon: Activity,
            note: "Dalam periode terpilih",
          },
          {
            label: "Tingkat respons",
            value: stats.responseRate,
            suffix: "%",
            icon: MessagesSquare,
            note: "Respons dari rekruter",
          },
          {
            label: "Tingkat wawancara",
            value: stats.interviewRate,
            suffix: "%",
            icon: CalendarRange,
            note: `${stats.interviews} proses mencapai interview`,
          },
          {
            label: "Rata-rata respons",
            value: stats.averageResponseDays ?? 0,
            suffix: " hari",
            icon: Clock3,
            note: "Sejak lamaran dikirim",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="p-4 sm:p-5">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-3 text-3xl font-bold">
                    {item.value}
                    {item.suffix}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">{item.note}</p>
                </div>
                <Icon className="size-5 text-teal-600" />
              </div>
            </Card>
          );
        })}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <Card>
          <CardTitle
            title="Tren lamaran"
            description="Jumlah lamaran per bulan"
          />
          <div className="flex h-72 items-end gap-3 border-b border-slate-200 px-2 pt-8 dark:border-slate-700 sm:gap-6">
            {stats.byMonth.length ? (
              stats.byMonth.map((item) => (
                <div
                  key={item.month}
                  className="flex h-full flex-1 flex-col justify-end"
                >
                  <div className="mb-2 text-center text-xs font-semibold">
                    {item.count}
                  </div>
                  <div
                    className="mx-auto w-full max-w-16 rounded-t-xl bg-teal-600 transition hover:bg-teal-500"
                    style={{
                      height: `${Math.max(10, (item.count / maxMonthly) * 86)}%`,
                    }}
                  />
                  <p className="py-3 text-center text-xs capitalize text-slate-400">
                    {new Intl.DateTimeFormat("id-ID", {
                      month: "short",
                    }).format(new Date(`${item.month}-01`))}
                  </p>
                </div>
              ))
            ) : (
              <p className="m-auto text-sm text-slate-500">
                Tidak ada data pada filter ini.
              </p>
            )}
          </div>
        </Card>
        <Card>
          <CardTitle
            title="Distribusi status"
            description="Posisi lamaran saat ini"
          />
          <div className="space-y-4">
            {stats.byStatus
              .filter((item) => item.count)
              .map((item, index) => (
                <div key={item.status}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium">
                      {statusLabels[item.status]}
                    </span>
                    <span className="text-slate-500">
                      {item.count} ·{" "}
                      {Math.round((item.count / statusTotal) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${colors[index % colors.length]}`}
                      style={{ width: `${(item.count / statusTotal) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle
            title="Kinerja sumber lamaran"
            description="Sumber dengan volume terbesar"
          />
          <div className="space-y-3">
            {sources.map((item) => {
              const count = filtered.filter(
                (app) => app.source === item,
              ).length;
              return count ? (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/50"
                >
                  <span className="text-sm font-medium">{item}</span>
                  <span className="text-sm font-bold">{count}</span>
                </div>
              ) : null;
            })}
          </div>
        </Card>
        <Card className="bg-slate-950 text-white dark:bg-teal-950">
          <div className="flex gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-500/20 text-teal-300">
              <Trophy className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">Insight periode ini</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {stats.interviewRate >= 20
                  ? "Rasio wawancaramu berada di jalur yang baik. Pertahankan personalisasi CV dan tindak lanjut yang konsisten."
                  : "Coba prioritaskan kualitas lamaran: sesuaikan ringkasan CV dan tonjolkan pencapaian yang relevan untuk setiap peran."}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/5 p-3">
                  <p className="text-xs text-slate-400">Tingkat offer</p>
                  <p className="mt-1 text-xl font-bold text-teal-300">
                    {stats.offerRate}%
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <p className="text-xs text-slate-400">Proses aktif</p>
                  <p className="mt-1 text-xl font-bold text-teal-300">
                    {stats.active}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
