"use client";

import { CheckCircle2, LockKeyhole } from "lucide-react";
import { PLANS } from "@/lib/billing/plans";
import type { SubscriptionTier } from "@/types";
import { Card, CardTitle, buttonStyles } from "@/components/dashboard/ui";

export function SubscriptionCard({
  tier = "free",
}: {
  readonly tier?: SubscriptionTier;
}) {
  const plan = PLANS[tier];
  return (
    <Card>
      <CardTitle
        title="Paket JobTrack"
        description="Billing gateway akan tersedia setelah konfigurasi pembayaran produksi selesai."
      />
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Paket saat ini
            </p>
            <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {plan.name}
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {tier === "free"
                ? "Cocok untuk mulai merapikan pencarian kerja."
                : "Fitur Pro aktif berdasarkan subscription server."}
            </p>
          </div>
          <LockKeyhole className="size-5 text-blue-600 dark:text-blue-400" />
        </div>
        <ul className="mt-4 grid gap-2 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-3">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-blue-600" />
            {plan.limits.applications ?? "Tanpa batas"} lamaran
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-blue-600" />
            {plan.limits.documents ?? "Tanpa batas"} dokumen
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-blue-600" />
            {plan.limits.cvAnalysesPerMonth ?? "Tanpa batas"} analisis/bulan
          </li>
        </ul>
      </div>
      <button
        type="button"
        className={`${buttonStyles.secondary} mt-4`}
        disabled
      >
        Pilihan paket segera tersedia
      </button>
    </Card>
  );
}
