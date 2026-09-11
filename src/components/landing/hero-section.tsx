import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  PlayCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import { DashboardPreview } from "./dashboard-preview";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background pb-14 pt-10 sm:pb-20 sm:pt-16">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-24 -top-28 size-[42rem] rounded-[3rem] border-2 border-ink/10 bg-secondary/35 blur-[0.5px] [transform:rotate(10deg)]" />
        <div className="absolute -left-28 top-40 size-[30rem] rounded-[3rem] border-2 border-ink/10 bg-secondary [transform:rotate(-8deg)]" />
        <div className="absolute inset-x-0 top-0 h-[560px] opacity-25 [background-image:radial-gradient(#0b1f14_1.25px,transparent_1.25px)] [background-size:26px_26px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      </div>
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8 lg:px-10">
        <div className="animate-jump text-left">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border-2 border-ink bg-secondary px-3.5 py-2 text-xs font-extrabold uppercase tracking-wide text-ink shadow-card sm:text-sm">
            <Zap size={16} className="shrink-0" />
            <span className="truncate">Kelola lamaran tanpa kekacauan</span>
            <span className="hidden items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-[10px] font-extrabold tracking-widest text-white sm:inline-flex">
              <Sparkles size={12} /> CEPAT
            </span>
          </div>
          <h1 className="mt-7 text-balance text-[2.55rem] font-extrabold leading-[0.95] tracking-[-0.06em] text-ink sm:text-6xl lg:text-[4.6rem]">
            Kelola setiap peluang.{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">
                Raih kerja terbaikmu.
              </span>
              <span
                className="absolute inset-x-0 bottom-1 z-0 h-3 -rotate-1 rounded-full bg-secondary"
                aria-hidden="true"
              />
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-muted sm:text-xl sm:leading-8">
            Satu ruang kerja untuk lamaran, interview, tugas, dan dokumen —
            dibuat biar kamu fokus ke langkah berikutnya, bukan spreadsheet.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-ink bg-primary-strong px-7 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50"
            >
              Mulai gratis <ArrowRight size={18} />
            </Link>
            <Link
              href="/dashboard?demo=true"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-ink bg-surface px-7 py-3.5 text-sm font-extrabold uppercase tracking-wide text-ink shadow-card transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
            >
              <PlayCircle size={18} /> Lihat demo langsung
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs font-extrabold uppercase tracking-wide text-muted sm:text-sm">
            {["Gratis untuk mulai", "Tanpa kartu kredit", "Data demo siap"].map(
              (item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-primary" />
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
