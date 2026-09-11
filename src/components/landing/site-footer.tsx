import Link from "next/link";
import { Brand } from "./brand";

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-ink bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto] lg:px-10">
        <div>
          <Brand inverted />
          <p className="mt-4 max-w-sm text-sm font-medium leading-6 text-white/65">
            Ruang kerja pribadi untuk mengelola pencarian kerja dengan lebih
            berani dan terarah.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-accent">
            Kelola lamaran, persiapkan peluang
          </p>
        </div>
        <nav
          className="flex flex-wrap items-start gap-2 text-sm font-extrabold"
          aria-label="Navigasi footer"
        >
          <a
            href="#fitur"
            className="rounded-full border border-white/15 px-4 py-2 transition hover:border-accent hover:text-accent"
          >
            Fitur
          </a>
          <a
            href="#cara-kerja"
            className="rounded-full border border-white/15 px-4 py-2 transition hover:border-accent hover:text-accent"
          >
            Cara kerja
          </a>
          <Link
            href="/privacy"
            className="rounded-full border border-white/15 px-4 py-2 transition hover:border-accent hover:text-accent"
          >
            Privasi
          </Link>
          <Link
            href="/terms"
            className="rounded-full border border-white/15 px-4 py-2 transition hover:border-accent hover:text-accent"
          >
            Ketentuan
          </Link>
          <a
            href="mailto:halo@jobtrack.id"
            className="rounded-full border-2 border-accent bg-accent px-4 py-2 text-ink transition hover:-translate-y-0.5"
          >
            Kontak
          </a>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs font-semibold text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>
            © {new Date().getFullYear()} JobTrack. Dibuat untuk perjalanan
            kariermu.
          </p>
          <p>Data demo sepenuhnya fiktif.</p>
        </div>
      </div>
    </footer>
  );
}
