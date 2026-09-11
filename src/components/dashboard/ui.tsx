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
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl text-left">
        {eyebrow ? (
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-900 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          {title}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-400">
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
        "min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 sm:p-5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700",
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
    <div className="mb-5 flex items-start justify-between gap-3 text-left">
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
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
      "border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300",
    teal: "border border-blue-200/70 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300",
    amber:
      "border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300",
    red: "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300",
    blue: "border border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/60 dark:text-sky-300",
    purple:
      "border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
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
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  secondary:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
  danger:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50",
  ghost:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
};

export const fieldStyles =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500";

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
      <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
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
