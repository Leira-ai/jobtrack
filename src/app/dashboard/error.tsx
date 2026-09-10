"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { buttonStyles } from "@/components/dashboard/ui";

export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="flex min-h-[65vh] items-center justify-center">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950">
          <AlertTriangle className="size-7" />
        </span>
        <h1 className="mt-5 text-2xl font-bold">
          Dashboard belum dapat dimuat
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Terjadi kendala sementara. Coba muat ulang bagian ini tanpa kehilangan
          navigasimu.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-xs text-slate-400">
            Kode: {error.digest}
          </p>
        ) : null}
        <button
          type="button"
          onClick={retry}
          className={`${buttonStyles.primary} mt-6`}
        >
          <RotateCcw className="size-4" /> Coba lagi
        </button>
      </div>
    </div>
  );
}
