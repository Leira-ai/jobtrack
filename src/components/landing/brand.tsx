import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";

interface BrandProps {
  readonly inverted?: boolean;
}

export function Brand({ inverted = false }: BrandProps) {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2.5 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
      aria-label="JobTrack, kembali ke beranda"
    >
      <span
        className={`grid size-10 rotate-3 place-items-center rounded-2xl border-2 transition duration-300 group-hover:rotate-6 group-hover:-translate-y-0.5 ${
          inverted
            ? "border-ink bg-secondary text-ink shadow-lift"
            : "border-ink bg-primary-strong text-white shadow-card"
        }`}
        aria-hidden="true"
      >
        <BriefcaseBusiness size={19} strokeWidth={2.4} />
      </span>
      <span
        className={`text-xl font-extrabold tracking-[-0.05em] ${inverted ? "text-white" : "text-ink"}`}
      >
        Job
        <span className={inverted ? "text-white" : "text-primary"}>Track</span>
      </span>
    </Link>
  );
}
