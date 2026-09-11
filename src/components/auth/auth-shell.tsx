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
      className="min-h-screen bg-background font-sans text-ink selection:bg-accent selection:text-ink"
    >
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative hidden overflow-hidden border-r-2 border-ink bg-primary-strong p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <div className="absolute -left-24 -top-24 size-96 rounded-[2.5rem] border-2 border-ink bg-accent/25 blur-[1px] [transform:rotate(10deg)]" />
            <div className="absolute -bottom-24 -right-24 size-96 rounded-[2.5rem] border-2 border-ink bg-pop/20 [transform:rotate(-8deg)]" />
            <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(#a3e635_1.25px,transparent_1.25px)] [background-size:24px_24px]" />
          </div>
          <div className="relative">
            <Brand inverted />
          </div>
          <div className="relative max-w-lg py-12">
            <p className="inline-flex items-center rounded-full border border-accent/40 bg-white/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-accent">
              Ruang kerja kariermu
            </p>
            <h2 className="mt-5 text-balance text-4xl font-extrabold leading-[1.02] tracking-[-0.05em] xl:text-5xl">
              Lebih sedikit kekacauan. Lebih banyak langkah nyata.
            </h2>
            <ul className="mt-8 grid gap-4">
              {highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-center gap-3 text-sm font-semibold text-white/85"
                >
                  <CheckCircle2 size={18} className="shrink-0 text-accent" />{" "}
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
          <figure className="relative max-w-md rounded-[1.75rem] border-2 border-ink bg-accent p-6 text-ink shadow-lift [transform:rotate(-1deg)]">
            <Quote size={20} className="text-ink" aria-hidden="true" />
            <blockquote className="mt-3 text-sm font-medium leading-6 text-ink/85">
              “Sekarang saya selalu tahu lamaran mana yang perlu ditindaklanjuti
              dan apa yang harus disiapkan untuk wawancara berikutnya.”
            </blockquote>
            <figcaption className="mt-4 text-xs font-extrabold uppercase tracking-widest text-ink/70">
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
              className="ml-auto inline-flex items-center gap-2 rounded-full border-2 border-ink/15 px-4 py-2 text-sm font-extrabold text-ink transition hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ArrowLeft size={16} /> Kembali ke beranda
            </Link>
          </div>
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
            <div>
              <h1 className="text-balance text-3xl font-extrabold tracking-[-0.045em] text-ink sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 text-sm font-medium leading-6 text-muted sm:text-base">
                {description}
              </p>
            </div>
            <div className="mt-8">{children}</div>
            {footer ? (
              <div className="mt-7 text-center text-sm font-semibold text-muted">
                {footer}
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs font-extrabold">
            <Link
              href="/privacy"
              className="rounded-full border border-ink/10 px-3 py-1.5 transition hover:border-ink hover:text-ink"
            >
              Privasi
            </Link>
            <Link
              href="/terms"
              className="rounded-full border border-ink/10 px-3 py-1.5 transition hover:border-ink hover:text-ink"
            >
              Ketentuan
            </Link>
            <a
              href="mailto:halo@jobtrack.id"
              className="rounded-full border border-ink/10 px-3 py-1.5 transition hover:border-ink hover:text-ink"
            >
              Bantuan
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
