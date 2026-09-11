import Link from "next/link";
import { FlaskConical } from "lucide-react";

export function DemoAccess() {
  return (
    <div className="mt-6 border-t border-slate-200 pt-6">
      <Link
        href="/dashboard?demo=true"
        className="group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left transition hover:border-slate-300 hover:bg-slate-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary500"
      >
        <span className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-white text-slate-700 shadow-sm">
            <FlaskConical size={18} />
          </span>
          <span>
            <span className="block text-sm font-bold text-slate-950">
              Coba dashboard demo
            </span>
            <span className="block text-xs text-slate-800/70">
              Tanpa akun, dengan data contoh siap pakai
            </span>
          </span>
        </span>
        <span
          className="text-lg text-slate-700 transition group-hover:translate-x-0.5"
          aria-hidden="true"
        >
          →
        </span>
      </Link>
    </div>
  );
}
