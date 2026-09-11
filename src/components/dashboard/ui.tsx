import type { ReactNode } from "react";
import { cn } from "@/components/dashboard/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="animate-jump flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border-2 border-ink/10 bg-secondary px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink dark:border-white/15 dark:text-ink">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-balance text-3xl font-extrabold tracking-[-0.045em] text-ink dark:text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted sm:text-base">
          {description}
        </p>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      ) : null}
    </header>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-3xl border-2 border-ink/10 bg-surface p-4 shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-lift dark:border-white/10 sm:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-extrabold tracking-tight text-ink dark:text-white">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Badge({
  children,
  tone = "slate",
  className,
}: {
  children: ReactNode;
  tone?: "slate" | "teal" | "amber" | "red" | "blue" | "purple";
  className?: string;
}) {
  const tones = {
    slate:
      "border border-ink/10 bg-slate-100 text-slate-800 dark:border-white/15 dark:bg-white/10 dark:text-white",
    teal: "border border-ink bg-secondary text-ink dark:border-white/20",
    amber:
      "border border-amber-200/30 bg-amber-100 text-ink dark:border-amber-200/30 dark:bg-amber-100 dark:text-ink",
    red: "border border-rose-200 bg-rose-400 text-white",
    blue: "border border-blue-200 bg-blue-500 text-white",
    purple: "border border-indigo-200/30 bg-indigo-500 text-white",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export const buttonStyles = {
  primary:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border-2 border-ink bg-primary-strong px-5 py-2.5 text-sm font-extrabold uppercase tracking-wide text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20",
  secondary:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border-2 border-ink/15 bg-surface px-5 py-2.5 text-sm font-extrabold text-ink shadow-card transition hover:-translate-y-0.5 hover:border-ink/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:text-white",
  danger:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border-2 border-rose-950/30 bg-rose-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-50",
  ghost:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-extrabold text-muted transition hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white",
};

export const fieldStyles =
  "min-h-12 w-full rounded-2xl border-2 border-ink/15 bg-surface px-4 text-sm font-medium text-ink outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/40 dark:border-white/20 dark:text-white";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-3xl border-2 border-ink/10 bg-secondary text-ink shadow-card dark:border-white/20">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
