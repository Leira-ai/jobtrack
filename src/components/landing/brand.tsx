import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";

interface BrandProps {
  readonly inverted?: boolean;
}

export function Brand({ inverted = false }: BrandProps) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      aria-label="JobTrack, kembali ke beranda"
    >
      <span
        className={`grid size-9 place-items-center rounded-xl shadow-sm ${inverted ? "bg-white text-slate-900" : "bg-blue-600 text-white"}`}
        aria-hidden="true"
      >
        <BriefcaseBusiness size={18} strokeWidth={2} />
      </span>
      <span
        className={`text-[15px] font-semibold tracking-tight ${inverted ? "text-white" : "text-slate-900 dark:text-white"}`}
      >
        JobTrack
      </span>
    </Link>
  );
}
