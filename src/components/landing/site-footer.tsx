import Link from "next/link";
import { Brand } from "./brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto] lg:px-10">
        <div>
          <Brand inverted />
          <p className="mt-4 max-w-sm text-sm font-medium leading-6 text-slate-400">
            Ruang kerja pribadi untuk mengelola pencarian kerja dengan lebih
            terarah dan tenang.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-300">
            Kelola lamaran, persiapkan peluang
          </p>
        </div>
        <nav
          className="flex flex-wrap items-start gap-2 text-sm font-semibold"
          aria-label="Navigasi footer"
        >
          <a
            href="#fitur"
            className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-slate-300 transition hover:border-slate-600 hover:text-white"
          >
            Fitur
          </a>
          <a
            href="#cara-kerja"
            className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-slate-300 transition hover:border-slate-600 hover:text-white"
          >
            Cara kerja
          </a>
          <Link
            href="/privacy"
            className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-slate-300 transition hover:border-slate-600 hover:text-white"
          >
            Privasi
          </Link>
          <Link
            href="/terms"
            className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-slate-300 transition hover:border-slate-600 hover:text-white"
          >
            Ketentuan
          </Link>
          <a
            href="mailto:halo@jobtrack.id"
            className="rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-white shadow-sm transition hover:bg-blue-500"
          >
            Kontak
          </a>
        </nav>
      </div>
      <div className="border-t border-slate-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs font-medium text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
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
