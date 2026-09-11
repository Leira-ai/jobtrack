import Link from "next/link";
import {
  ArrowRight,
  DatabaseZap,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Zap,
} from "lucide-react";

const securityItems = [
  { icon: LockKeyhole, label: "Koneksi terenkripsi" },
  { icon: EyeOff, label: "Data pribadi tidak dijual" },
  { icon: DatabaseZap, label: "Kontrol atas datamu" },
] as const;

export function SecurityAndCta() {
  return (
    <>
      <section
        id="keamanan"
        className="scroll-mt-24 bg-background pb-16 sm:pb-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-ink bg-primary-strong px-6 py-10 text-white shadow-lift sm:px-10 lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16 lg:px-14 lg:py-14">
            <div
              className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-[2.5rem] bg-secondary/25 blur-[1px] [transform:rotate(12deg)]"
              aria-hidden="true"
            />
            <div className="relative mx-auto grid aspect-square max-w-[260px] place-items-center">
              <div className="absolute inset-5 rounded-full border-2 border-dashed border-accent/30" />
              <div className="absolute inset-12 rounded-full border border-white/10" />
              <div className="absolute size-36 rounded-full bg-secondary/20 blur-2xl" />
              <div className="relative grid size-28 rotate-3 place-items-center rounded-[2rem] border-2 border-ink bg-secondary text-ink shadow-lift">
                <ShieldCheck size={50} strokeWidth={2} />
              </div>
            </div>
            <div className="relative mt-8 text-center lg:mt-0 lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-white">
                <Zap size={14} /> Privasi adalah prioritas
              </p>
              <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-[-0.04em] sm:text-5xl">
                Perjalanan kariermu tetap milikmu.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
                JobTrack adalah ruang kerja personal. Data lamaranmu dipakai
                hanya untuk pengalaman yang kamu pilih — bukan dijual, bukan
                dilatih ke model.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {securityItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 px-3.5 py-3 text-left text-sm font-extrabold text-white"
                    >
                      <Icon size={18} className="shrink-0 text-white" />{" "}
                      {item.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="relative overflow-hidden border-t-2 border-slate-800 bg-slate-950 py-16 text-white sm:py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-10 [background-image:radial-gradient(#94a3b8_1.5px,transparent_1.5px)] [background-size:24px_24px]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <p className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-blue-400 shadow-card">
            Siap mulai?
          </p>
          <h2 className="mt-5 text-balance text-4xl font-extrabold tracking-[-0.05em] text-white sm:text-6xl">
            Cari kerja dengan lebih terarah.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base font-medium leading-7 text-slate-300 sm:text-lg">
            Mulai gratis, atur progresmu, dan fokus pada kesempatan yang paling
            berarti.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-blue-600 bg-blue-600 px-8 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30"
            >
              Buat akun gratis <ArrowRight size={18} />
            </Link>
            <Link
              href="/dashboard?demo=true"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-slate-700 bg-slate-900 px-8 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white shadow-card transition hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-500/20"
            >
              Jelajahi data demo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
