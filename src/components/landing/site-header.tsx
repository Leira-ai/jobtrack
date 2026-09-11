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
    <header className="sticky top-0 z-50 border-b-2 border-ink/10 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <Brand />
        <nav
          className="hidden items-center gap-1.5 md:flex"
          aria-label="Navigasi utama"
        >
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full border border-transparent px-3.5 py-2 text-sm font-extrabold text-muted transition hover:border-ink/15 hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-full border-2 border-ink/15 bg-surface px-5 py-2.5 text-sm font-extrabold text-ink transition hover:border-ink/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="rounded-full border-2 border-ink bg-ink px-6 py-2.5 text-sm font-extrabold uppercase tracking-wide text-white shadow-card transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Mulai gratis
          </Link>
        </div>
        <button
          type="button"
          className="grid size-11 place-items-center rounded-2xl border-2 border-ink bg-surface text-ink shadow-card md:hidden"
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
          className="border-t-2 border-ink/10 bg-surface px-5 py-5 md:hidden"
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
                className="rounded-2xl border-2 border-transparent px-3 py-3 text-sm font-extrabold text-ink hover:border-ink/10 hover:bg-background"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-3 border-t-2 border-ink/10 pt-4">
              <Link
                href="/login"
                className="rounded-2xl border-2 border-ink/15 bg-surface px-4 py-3 text-center text-sm font-extrabold text-ink"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-2xl border-2 border-ink bg-secondary px-4 py-3 text-center text-sm font-extrabold uppercase tracking-wide text-ink shadow-card"
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
