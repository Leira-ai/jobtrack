import Link from "next/link";
import { ArrowLeft, CheckCircle2, Quote } from "lucide-react";
import type { ReactNode } from "react";
import { Brand } from "@/components/landing";

interface AuthShellProps {
  readonly children: ReactNode;
  readonly title: string;
  readonly description: string;
  readonly footer?: ReactNode;
}

const highlights = [
  "Pantau semua lamaran dalam satu pipeline",
  "Jaga jadwal wawancara dan follow-up",
  "Gunakan data demo tanpa membuat akun",
] as const;

export function AuthShell({
  children,
  title,
  description,
  footer,
}: AuthShellProps) {
  return (
    <main
      lang="id"
      className="min-h-screen bg-[#f7f9f5] font-sans text-slate-900 selection:bg-emerald-200"
    >
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative hidden overflow-hidden bg-[#0f3226] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <div className="absolute -left-32 -top-24 size-96 rounded-full bg-emerald-400/12 blur-3xl" />
            <div className="absolute -bottom-32 -right-24 size-96 rounded-full bg-amber-200/8 blur-3xl" />
            <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(#d1fae5_1px,transparent_1px)] [background-size:24px_24px]" />
          </div>
          <div className="relative">
            <Brand inverted />
          </div>
          <div className="relative max-w-lg py-12">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">
              Ruang kerja kariermu
            </p>
            <h2 className="mt-5 text-4xl font-bold leading-tight tracking-[-0.045em] xl:text-5xl">
              Lebih sedikit kekacauan. Lebih banyak langkah nyata.
            </h2>
            <ul className="mt-8 grid gap-4">
              {highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-center gap-3 text-sm text-emerald-50/80"
                >
                  <CheckCircle2
                    size={18}
                    className="shrink-0 text-emerald-300"
                  />{" "}
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
          <figure className="relative max-w-md rounded-2xl border border-white/10 bg-white/7 p-6 backdrop-blur-sm">
            <Quote size={20} className="text-emerald-300" aria-hidden="true" />
            <blockquote className="mt-3 text-sm leading-6 text-emerald-50/85">
              “Sekarang saya selalu tahu lamaran mana yang perlu ditindaklanjuti
              dan apa yang harus disiapkan untuk wawancara berikutnya.”
            </blockquote>
            <figcaption className="mt-4 text-xs font-semibold text-emerald-200">
              Pengalaman pengguna demo JobTrack
            </figcaption>
          </figure>
        </aside>
        <section className="flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:px-12 xl:px-20">
          <div className="flex items-center justify-between">
            <div className="lg:hidden">
              <Brand />
            </div>
            <Link
              href="/"
              className="ml-auto inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-500 transition hover:text-[#123c2d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <ArrowLeft size={16} /> Kembali ke beranda
            </Link>
          </div>
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
            <div>
              <h1 className="text-3xl font-bold tracking-[-0.04em] text-[#10261f] sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                {description}
              </p>
            </div>
            <div className="mt-8">{children}</div>
            {footer ? (
              <div className="mt-7 text-center text-sm text-slate-600">
                {footer}
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-slate-400">
            <Link href="/privacy" className="hover:text-slate-600">
              Privasi
            </Link>
            <Link href="/terms" className="hover:text-slate-600">
              Ketentuan
            </Link>
            <a href="mailto:halo@jobtrack.id" className="hover:text-slate-600">
              Bantuan
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
