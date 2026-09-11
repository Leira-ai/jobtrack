"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Clock3,
  FileSearch,
  Plus,
  TrendingUp,
} from "lucide-react";
import type { CalendarEvent, JobTask } from "@/types";
import { demoEvents, demoTasks } from "@/data";
import {
  statusLabels,
  statusTones,
} from "@/components/applications/application-config";
import { useApplications } from "@/components/applications/applications-provider";
import { calculateApplicationStats } from "@/lib/stats";
import {
  Badge,
  buttonStyles,
  Card,
  CardTitle,
  PageHeader,
} from "@/components/dashboard/ui";
import { formatDate } from "@/components/dashboard/utils";

interface DashboardOverviewProps {
  readonly initialEvents?: readonly CalendarEvent[];
  readonly initialTasks?: readonly JobTask[];
  readonly timezone?: string;
}

export function DashboardOverview({
  initialEvents,
  initialTasks,
  timezone = "Asia/Jakarta",
}: DashboardOverviewProps = {}) {
  const { applications, mode, profile } = useApplications();
  const stats = calculateApplicationStats(applications);
  const activeTasks = (initialTasks ?? (mode === "demo" ? demoTasks : []))
    .filter((task) => task.status !== "done")
    .slice(0, 4);
  const displayEvents = (
    initialEvents ?? (mode === "demo" ? demoEvents : [])
  ).slice(0, 4);
  const recentApps = [...applications]
    .filter((application) => !application.archivedAt)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 5);
  const submittedCount = stats.submitted;
  const activityPeriod = `${stats.byMonth.length} bulan terakhir`;
  const todayFormatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow={todayFormatted}
        title={`Selamat datang kembali, ${profile?.displayName.split(" ")[0] ?? "Alya"}`}
        description="Pantau proses rekrutmenmu. Jaga momentum, satu langkah pada satu waktu."
        actions={
          <Link href="/dashboard/lamaran" className={buttonStyles.primary}>
            <Plus className="size-4" /> Tambah lamaran
          </Link>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total lamaran",
            value: stats.total,
            hint: "+5 bulan ini",
            icon: TrendingUp,
            tone: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
          },
          {
            label: "Proses aktif",
            value: stats.active,
            hint: "Perlu dipantau",
            icon: CircleDot,
            tone: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
          },
          {
            label: "Interview",
            value: stats.interviews,
            hint: `${stats.interviewRate}% dari ${submittedCount} lamaran terkirim`,
            icon: CalendarDays,
            tone: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
          },
          {
            label: "Offer",
            value: stats.offers,
            hint: `${stats.offerRate}% dari ${submittedCount} lamaran terkirim`,
            icon: CheckCircle2,
            tone: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-3 text-3xl font-bold tracking-tight">
                    {item.value}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">{item.hint}</p>
                </div>
                <span
                  className={`grid size-10 place-items-center rounded-xl ${item.tone}`}
                >
                  <Icon className="size-5" />
                </span>
              </div>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <Card>
          <CardTitle
            title="Aktivitas lamaran"
            description={activityPeriod}
            action={
              <Link
                href="/dashboard/statistik"
                className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Lihat statistik
              </Link>
            }
          />
          <div className="flex h-60 items-end gap-3 pt-6 sm:gap-5">
            {stats.byMonth.map((month) => {
              const height = Math.max(
                18,
                (month.count /
                  Math.max(...stats.byMonth.map((item) => item.count))) *
                  100,
              );
              return (
                <div
                  key={month.month}
                  className="flex h-full flex-1 flex-col justify-end gap-2 text-center"
                >
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {month.count}
                  </span>
                  <div
                    className="group relative mx-auto w-full max-w-12 rounded-t-lg bg-blue-600 transition hover:bg-blue-500"
                    style={{ height: `${height}%` }}
                    title={`${month.count} lamaran`}
                  />
                  <span className="text-xs text-slate-400">
                    {new Intl.DateTimeFormat("id-ID", {
                      month: "short",
                    }).format(new Date(`${month.month}-01`))}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <CardTitle
            title="Agenda terdekat"
            description="Jangan lewatkan momen penting"
            action={
              <Link
                href="/dashboard/kalender"
                className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Buka kalender
              </Link>
            }
          />
          <div className="space-y-3">
            {displayEvents.map((event) => (
              <div
                key={event.id}
                className="flex gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800"
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-center dark:bg-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    {new Intl.DateTimeFormat("id-ID", {
                      month: "short",
                    }).format(new Date(event.startsAt))}
                  </span>
                  <span className="-mt-2 text-sm font-bold">
                    {new Date(event.startsAt).getDate()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-5 sm:truncate">
                    {event.title}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <Clock3 className="size-3" />{" "}
                    {event.allDay
                      ? "Sepanjang hari"
                      : new Intl.DateTimeFormat("id-ID", {
                          timeZone: timezone,
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(event.startsAt))}{" "}
                    · {event.location ?? "Tanpa lokasi"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <Card>
          <CardTitle
            title="Lamaran terbaru"
            description="Perkembangan proses rekrutmenmu"
            action={
              <Link
                href="/dashboard/lamaran"
                className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Lihat semua
              </Link>
            }
          />
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentApps.map((application) => (
              <div
                key={application.id}
                className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-xs font-bold text-white dark:bg-slate-700">
                  {application.company
                    .split(" ")
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-5 sm:truncate">
                    {application.role}
                  </p>
                  <p className="text-xs leading-5 text-slate-500 sm:truncate">
                    {application.company} ·{" "}
                    {formatDate(application.updatedAt, {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <Badge tone={statusTones[application.status]}>
                  {statusLabels[application.status]}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle
            title="Fokus hari ini"
            description={`${activeTasks.length} tugas berikutnya`}
            action={
              <Link
                href="/dashboard/tugas"
                className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Kelola
              </Link>
            }
          />
          <div className="space-y-3">
            {activeTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3">
                <span className="mt-0.5 size-5 shrink-0 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-5">{task.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {task.dueAt
                      ? formatDate(task.dueAt, {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })
                      : "Tanpa tenggat"}
                  </p>
                </div>
                <span
                  className={`mt-1 size-2 rounded-full ${task.priority === "high" ? "bg-red-500" : task.priority === "medium" ? "bg-amber-500" : "bg-slate-300"}`}
                />
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/analisis-cv"
            className="mt-6 flex items-center justify-between rounded-xl bg-teal-50 p-4 text-teal-900 transition hover:bg-teal-100 dark:bg-teal-950 dark:text-teal-100"
          >
            <span className="flex items-center gap-3 text-sm font-semibold">
              <FileSearch className="size-5" /> Periksa kesiapan CV
            </span>
            <ArrowUpRight className="size-4" />
          </Link>
        </Card>
      </section>
    </div>
  );
}
