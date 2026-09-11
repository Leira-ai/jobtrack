"use client";

import Link from "next/link";
import { CheckCircle2, Circle, X } from "lucide-react";
import { useState } from "react";
import type { JobApplication, JobTask } from "@/types";
import { Card } from "@/components/dashboard/ui";

const DISMISS_KEY = "jobtrack.onboarding-checklist.dismissed.v1";

export function OnboardingChecklist({
  applications,
  tasks,
  hasCvPage = true,
}: {
  readonly applications: readonly JobApplication[];
  readonly tasks: readonly JobTask[];
  readonly hasCvPage?: boolean;
}) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(DISMISS_KEY) === "1";
  });
  if (dismissed) return null;

  const steps = [
    {
      label: "Tambahkan lamaran pertama",
      done: applications.length > 0,
      href: "/dashboard/lamaran",
    },
    {
      label: "Buat tugas follow-up",
      done: tasks.length > 0,
      href: "/dashboard/tugas",
    },
    {
      label: "Cek kesiapan CV",
      done: !hasCvPage ? true : false,
      href: "/dashboard/analisis-cv",
    },
  ];
  const completed = steps.filter((step) => step.done).length;
  if (completed === steps.length) return null;

  return (
    <Card className="relative border-blue-200 bg-blue-50/60 dark:border-blue-900 dark:bg-blue-950/30">
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, "1");
          setDismissed(true);
        }}
        className="absolute right-3 top-3 rounded-lg p-1 text-slate-500 hover:bg-white/60 dark:hover:bg-slate-900/60"
        aria-label="Tutup panduan mulai"
      >
        <X className="size-4" />
      </button>
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
        Mulai cepat · {completed}/{steps.length}
      </p>
      <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
        Bangun kebiasaan pencarian kerja yang rapi
      </h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {steps.map((step) => (
          <Link
            key={step.label}
            href={step.href}
            className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            {step.done ? (
              <CheckCircle2 className="size-4 shrink-0 text-green-600" />
            ) : (
              <Circle className="size-4 shrink-0 text-blue-500" />
            )}
            {step.label}
          </Link>
        ))}
      </div>
    </Card>
  );
}
