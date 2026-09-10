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
    <header className="sticky top-0 z-50 border-b border-[#10261f]/8 bg-[#fbfcf8]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Brand />
        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Navigasi utama"
        >
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md text-sm font-medium text-slate-600 transition-colors hover:text-[#123c2d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#123c2d] transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-[#123c2d] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d3023] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            Mulai gratis
          </Link>
        </div>
        <button
          type="button"
          className="grid size-10 place-items-center rounded-xl border border-slate-200 text-[#123c2d] md:hidden"
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
          className="border-t border-slate-200 bg-white px-5 py-5 md:hidden"
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
                className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-emerald-50"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <Link
                href="/login"
                className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-[#123c2d]"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-[#123c2d] px-4 py-3 text-center text-sm font-semibold text-white"
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
