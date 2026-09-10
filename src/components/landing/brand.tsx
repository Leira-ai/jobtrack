import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";

interface BrandProps {
  readonly inverted?: boolean;
}

export function Brand({ inverted = false }: BrandProps) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-4"
      aria-label="JobTrack, kembali ke beranda"
    >
      <span
        className={`grid size-9 place-items-center rounded-xl ${
          inverted ? "bg-emerald-400 text-[#10261f]" : "bg-[#123c2d] text-white"
        }`}
        aria-hidden="true"
      >
        <BriefcaseBusiness size={18} strokeWidth={2.3} />
      </span>
      <span
        className={`text-lg font-bold tracking-[-0.04em] ${
          inverted ? "text-white" : "text-[#10261f]"
        }`}
      >
        Job
        <span className={inverted ? "text-emerald-300" : "text-emerald-600"}>
          Track
        </span>
      </span>
    </Link>
  );
}
