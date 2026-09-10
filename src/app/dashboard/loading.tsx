export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-8" aria-label="Memuat dashboard">
      <div className="space-y-3">
        <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-9 w-80 max-w-full rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-5 w-[32rem] max-w-full rounded bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <div className="h-96 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
        <div className="h-96 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
      </div>
    </div>
  );
}
