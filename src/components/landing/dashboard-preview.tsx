import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  MoreHorizontal,
  Search,
} from "lucide-react";

const columns = [
  {
    label: "Dilamar",
    count: 8,
    dot: "bg-blue-500",
    cards: [
      {
        company: "N",
        companyName: "Nusantara Labs",
        role: "Frontend Engineer",
        tone: "bg-amber-100 text-amber-800",
      },
      {
        company: "L",
        companyName: "Lintas Finansial",
        role: "QA Automation",
        tone: "bg-blue-100 text-blue-700",
      },
    ],
  },
  {
    label: "Interview",
    count: 4,
    dot: "bg-indigo-500",
    cards: [
      {
        company: "O",
        companyName: "Orbit Edukasi",
        role: "Product Manager",
        tone: "bg-indigo-100 text-indigo-700",
      },
      {
        company: "J",
        companyName: "Jembatan Cloud",
        role: "DevOps Engineer",
        tone: "bg-cyan-100 text-cyan-800",
      },
    ],
  },
  {
    label: "Offer",
    count: 2,
    dot: "bg-emerald-500",
    cards: [
      {
        company: "P",
        companyName: "Pijar Health",
        role: "Backend Engineer",
        tone: "bg-slate-900 text-white",
      },
    ],
  },
] as const;

export function DashboardPreview() {
  return (
    <div
      className="relative mx-auto max-w-6xl"
      aria-label="Pratinjau dashboard JobTrack"
    >
      <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-blue-100/60 blur-2xl dark:bg-blue-950/20" />
      <div className="max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-[0_32px_80px_-36px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-300" />
            <span className="size-2.5 rounded-full bg-amber-300" />
            <span className="size-2.5 rounded-full bg-emerald-300" />
          </div>
          <div className="hidden w-56 items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500 sm:flex dark:bg-slate-800 dark:text-slate-400">
            <Search size={13} /> Cari lamaran...
          </div>
          <span className="rounded-lg bg-slate-900 px-3 py-2 text-[10px] font-semibold text-white sm:text-xs dark:bg-blue-600">
            + Lamaran baru
          </span>
        </div>
        <div className="grid lg:grid-cols-[180px_1fr]">
          <aside className="hidden border-r border-slate-100 bg-slate-50/70 p-4 lg:block dark:border-slate-800 dark:bg-slate-950/40">
            <p className="mb-4 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Ruang kerja
            </p>
            {[
              ["Ringkasan", "text-slate-500"],
              ["Lamaran", "bg-blue-100/80 text-blue-900"],
              ["Kalender", "text-slate-500"],
              ["Dokumen", "text-slate-500"],
            ].map(([label, style]) => (
              <div
                key={label}
                className={`mb-1 rounded-lg px-3 py-2.5 text-xs font-semibold ${style}`}
              >
                {label}
              </div>
            ))}
          </aside>
          <div className="min-w-0 p-4 sm:p-6">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  Selasa, 8 September
                </p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl dark:text-white">
                  Pipeline lamaran
                </h2>
              </div>
              <div className="hidden gap-2 sm:flex">
                <span className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Filter
                </span>
                <span className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Urutkan
                </span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {columns.map((column) => (
                <div
                  key={column.label}
                  className="rounded-xl bg-slate-50/80 p-2.5 sm:p-3 dark:bg-slate-800/40"
                >
                  <div className="mb-3 flex items-center justify-between px-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      <span className={`size-2 rounded-full ${column.dot}`} />{" "}
                      {column.label}
                      <span className="text-slate-400">{column.count}</span>
                    </div>
                    <MoreHorizontal size={15} className="text-slate-400" />
                  </div>
                  <div className="grid gap-2.5">
                    {column.cards.map((card) => (
                      <article
                        key={card.companyName}
                        className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="flex gap-2.5">
                          <span
                            className={`grid size-8 shrink-0 place-items-center rounded-lg text-xs font-bold ${card.tone}`}
                          >
                            {card.company}
                          </span>
                          <div className="min-w-0">
                            <h3 className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                              {card.role}
                            </h3>
                            <p className="mt-0.5 truncate text-[10px] text-slate-500 dark:text-slate-400">
                              {card.companyName}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[10px] text-slate-400 dark:border-slate-800">
                          <span className="flex items-center gap-1">
                            <CalendarDays size={11} /> 3 hari lalu
                          </span>
                          <ArrowUpRight size={12} />
                        </div>
                      </article>
                    ))}
                    {column.label === "Offer" ? (
                      <div className="flex items-center gap-2 rounded-xl border border-dashed border-blue-200 bg-blue-50/70 p-3 text-[10px] font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
                        <CheckCircle2 size={14} /> 1 tugas selesai hari ini
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
