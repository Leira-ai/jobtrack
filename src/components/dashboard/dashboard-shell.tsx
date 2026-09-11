"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  CheckSquare2,
  ChevronLeft,
  CircleUserRound,
  FileSearch,
  Files,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  X,
} from "lucide-react";
import { ReminderCenter } from "@/components/reminders";
import { createClient } from "@/lib/supabase/client";
import type {
  DashboardMode,
  DashboardProfile,
} from "@/lib/applications/contracts";
import type { Reminder } from "@/types";
import { cn } from "@/components/dashboard/utils";

const navigation = [
  { label: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
  { label: "Lamaran", href: "/dashboard/lamaran", icon: BriefcaseBusiness },
  { label: "Kalender", href: "/dashboard/kalender", icon: CalendarDays },
  { label: "Tugas", href: "/dashboard/tugas", icon: CheckSquare2 },
  { label: "Analisis CV", href: "/dashboard/analisis-cv", icon: FileSearch },
  { label: "Statistik", href: "/dashboard/statistik", icon: BarChart3 },
  { label: "Dokumen", href: "/dashboard/dokumen", icon: Files },
  { label: "Pengaturan", href: "/dashboard/pengaturan", icon: Settings },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      aria-label="JobTrack, ke ringkasan"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
        <BriefcaseBusiness className="size-5" />
      </span>
      {!compact ? (
        <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
          JobTrack
        </span>
      ) : null}
    </Link>
  );
}

function NavLinks({
  compact = false,
  onNavigate,
}: {
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1" aria-label="Navigasi utama">
      {navigation.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/dashboard"
            ? pathname === item.href
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={compact ? item.label : undefined}
            className={cn(
              "group flex min-h-10 items-center rounded-xl text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              compact ? "justify-center px-2" : "gap-3 px-3",
              active
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
            )}
          >
            <Icon
              className={cn(
                "size-5 shrink-0",
                active
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-400 dark:text-slate-500",
              )}
            />
            {!compact ? <span>{item.label}</span> : null}
            {!compact && active ? (
              <span className="ml-auto size-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function ThemeButton() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("jobtrack-theme");
    return stored
      ? stored === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("jobtrack-theme", next ? "dark" : "light");
  }
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      aria-label={dark ? "Gunakan tema terang" : "Gunakan tema gelap"}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

export function DashboardShell({
  children,
  mode,
  profile,
  reminders,
  reminderLoadError,
}: {
  readonly children: ReactNode;
  readonly mode: DashboardMode;
  readonly profile: DashboardProfile;
  readonly reminders: readonly Reminder[];
  readonly reminderLoadError?: string;
}) {
  const router = useRouter();
  const demoMode = mode === "demo";
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async (): Promise<void> => {
    setLoggingOut(true);
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    document.cookie = "jobtrack-demo=; path=/; max-age=0; SameSite=Lax;";
    router.replace("/login?demo=false");
    router.refresh();
  };
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r border-slate-200 bg-white transition-[width] duration-200 dark:border-slate-800 dark:bg-slate-900 lg:flex lg:flex-col",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-slate-100 px-5 dark:border-slate-800",
            collapsed && "justify-center px-2",
          )}
        >
          <Logo compact={collapsed} />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavLinks compact={collapsed} />
        </div>
        {!collapsed && demoMode ? (
          <div className="mx-3 mb-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 dark:border-amber-900/60 dark:bg-amber-950/40">
            <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-900 dark:bg-amber-900/80 dark:text-amber-200">
              Mode demo
            </span>
            <p className="mt-2 text-xs leading-5 text-amber-800 dark:text-amber-300">
              Data di dashboard ini bersifat contoh dan tersimpan sementara.
            </p>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="m-3 flex min-h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
        >
          <ChevronLeft
            className={cn(
              "size-4 transition-transform",
              collapsed && "rotate-180",
            )}
          />
          {!collapsed ? "Ciutkan" : null}
        </button>
      </aside>

      <div
        className={cn(
          "transition-[padding] duration-200",
          collapsed ? "lg:pl-20" : "lg:pl-64",
        )}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Buka navigasi"
            >
              <Menu className="size-5" />
            </button>
            <Logo />
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Ruang kerja pencarian karier
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {demoMode ? (
              <span className="hidden rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 sm:inline-flex">
                Demo
              </span>
            ) : null}
            <ThemeButton />
            {demoMode ? (
              <Link
                href="/login?demo=false"
                className="hidden min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:inline-flex dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <CircleUserRound
                  aria-hidden="true"
                  className="size-4 text-slate-400"
                />
                Masuk ke akun
              </Link>
            ) : null}
            <ReminderCenter
              mode={mode}
              initialReminders={reminders}
              loadError={reminderLoadError}
            />
            <div className="relative ml-1">
              <button
                type="button"
                className="grid size-9 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:bg-blue-600"
                aria-label={`Buka menu profil ${profile.displayName}`}
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((value) => !value)}
              >
                {profile.initials}
              </button>
              {profileOpen ? (
                <div className="absolute right-0 top-12 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  <p className="truncate px-2 text-sm font-semibold text-slate-900 dark:text-white">
                    {profile.displayName}
                  </p>
                  <p className="truncate px-2 pt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {profile.email}
                  </p>
                  {!demoMode ? (
                    <button
                      type="button"
                      className="mt-3 flex min-h-10 w-full items-center gap-2 rounded-xl px-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60 dark:text-rose-300 dark:hover:bg-rose-950"
                      disabled={loggingOut}
                      onClick={() => void logout()}
                    >
                      <LogOut aria-hidden="true" className="size-4" />
                      {loggingOut ? "Keluar…" : "Keluar"}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1480px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-label="Tutup navigasi"
          />
          <aside className="relative flex h-full w-[min(86vw,320px)] flex-col border-r border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="grid size-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Tutup navigasi"
              >
                <X className="size-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setMenuOpen(false)} />
            {demoMode ? (
              <div className="mt-auto space-y-3 pt-4">
                <Link
                  href="/login?demo=false"
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm"
                >
                  <CircleUserRound aria-hidden="true" className="size-4" />
                  Masuk ke akun
                </Link>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                  <strong>Mode demo.</strong> Perubahan tidak dikirim ke server.
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
