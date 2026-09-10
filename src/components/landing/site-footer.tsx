import Link from "next/link";
import { Brand } from "./brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0d2d22] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto] lg:px-10">
        <div>
          <Brand inverted />
          <p className="mt-4 max-w-sm text-sm leading-6 text-emerald-50/65">
            Ruang kerja pribadi untuk mengelola pencarian kerja dengan lebih
            terarah dan tenang.
          </p>
        </div>
        <nav
          className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-emerald-50/70"
          aria-label="Navigasi footer"
        >
          <a href="#fitur" className="transition hover:text-white">
            Fitur
          </a>
          <a href="#cara-kerja" className="transition hover:text-white">
            Cara kerja
          </a>
          <Link href="/privacy" className="transition hover:text-white">
            Privasi
          </Link>
          <Link href="/terms" className="transition hover:text-white">
            Ketentuan
          </Link>
          <a
            href="mailto:halo@jobtrack.id"
            className="transition hover:text-white"
          >
            Kontak
          </a>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-emerald-50/50 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
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
