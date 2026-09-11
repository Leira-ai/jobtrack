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
      className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 dark:bg-slate-950 dark:text-slate-100"
    >
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative hidden overflow-hidden border-r border-slate-800 bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <div className="absolute -left-24 -top-24 size-96 rounded-full bg-blue-900/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 size-96 rounded-full bg-indigo-900/20 blur-3xl" />
          </div>
          <div className="relative">
            <Brand inverted />
          </div>
          <div className="relative max-w-lg py-12">
            <p className="inline-flex items-center rounded-full border border-blue-800 bg-blue-950/60 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-blue-300">
              Ruang kerja kariermu
            </p>
            <h2 className="mt-5 text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl xl:text-5xl">
              Lebih sedikit kekacauan. Lebih banyak langkah nyata.
            </h2>
            <ul className="mt-8 grid gap-4">
              {highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <CheckCircle2 size={18} className="shrink-0 text-blue-400" />{" "}
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
          <figure className="relative max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-sm">
            <Quote size={20} className="text-blue-400" aria-hidden="true" />
            <blockquote className="mt-3 text-sm leading-6 text-slate-300">
              “Sekarang saya selalu tahu lamaran mana yang perlu ditindaklanjuti
              dan apa yang harus disiapkan untuk wawancara berikutnya.”
            </blockquote>
            <figcaption className="mt-4 text-xs font-medium uppercase tracking-wider text-slate-400">
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
              className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft size={16} /> Kembali ke beranda
            </Link>
          </div>
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
            <div>
              <h1 className="text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                {title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-400">
                {description}
              </p>
            </div>
            <div className="mt-8">{children}</div>
            {footer ? (
              <div className="mt-7 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
                {footer}
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Link href="/privacy" className="hover:underline">
              Privasi
            </Link>
            <Link href="/terms" className="hover:underline">
              Ketentuan
            </Link>
            <a href="mailto:halo@jobtrack.id" className="hover:underline">
              Bantuan
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
