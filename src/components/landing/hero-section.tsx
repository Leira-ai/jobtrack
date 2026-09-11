import Link from "next/link";
import { ArrowRight, CheckCircle2, PlayCircle, Sparkles } from "lucide-react";
import { DashboardPreview } from "./dashboard-preview";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-50/60 pb-16 pt-12 sm:pb-24 sm:pt-16 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-24 -top-28 size-[38rem] rounded-full bg-blue-100/50 blur-3xl dark:bg-blue-950/20" />
        <div className="absolute -left-28 top-40 size-[28rem] rounded-full bg-indigo-100/40 blur-3xl dark:bg-indigo-950/15" />
      </div>
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:px-10">
        <div className="text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3.5 py-1.5 text-xs font-semibold text-blue-900 shadow-sm sm:text-sm dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200">
            <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
            <span>Kelola lamaran tanpa kekacauan</span>
          </div>
          <h1 className="mt-6 text-balance text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-[4rem] dark:text-white">
            Kelola setiap peluang.{" "}
            <span className="text-blue-600 dark:text-blue-400">
              Raih kerja terbaikmu.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-slate-600 sm:text-lg sm:leading-8 dark:text-slate-400">
            Satu ruang kerja untuk lamaran, interview, tugas, dan dokumen —
            dibuat agar kamu fokus ke langkah berikutnya, bukan spreadsheet.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Mulai gratis <ArrowRight size={17} />
            </Link>
            <Link
              href="/dashboard?demo=true"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <PlayCircle size={17} /> Lihat demo langsung
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
            {["Gratis untuk mulai", "Tanpa kartu kredit", "Data demo siap"].map(
              (item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2
                    size={16}
                    className="text-blue-600 dark:text-blue-400"
                  />
                  {item}
                </span>
              ),
            )}
          </div>
        </div>
        <div className="min-w-0">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
