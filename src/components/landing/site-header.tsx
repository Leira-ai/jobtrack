"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Brand } from "./brand";

const navigation = [
  { href: "#fitur", label: "Fitur" },
  { href: "#cara-kerja", label: "Cara kerja" },
  { href: "#keamanan", label: "Keamanan" },
] as const;

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <Brand />
        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Navigasi utama"
        >
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2.5 md:flex">
          <Link
            href="/login"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Mulai gratis
          </Link>
        </div>
        <button
          type="button"
          className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm md:hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {isOpen ? (
        <div
          id="mobile-navigation"
          className="border-t border-slate-200 bg-white px-5 py-5 md:hidden dark:border-slate-800 dark:bg-slate-950"
        >
          <nav
            className="mx-auto grid max-w-7xl gap-1"
            aria-label="Navigasi seluler"
          >
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Link
                href="/login"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm"
              >
                Mulai gratis
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
