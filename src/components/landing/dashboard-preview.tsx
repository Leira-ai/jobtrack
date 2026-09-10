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
    dot: "bg-violet-500",
    cards: [
      {
        company: "O",
        companyName: "Orbit Edukasi",
        role: "Product Manager",
        tone: "bg-violet-100 text-violet-700",
      },
      {
        company: "J",
        companyName: "Jembatan Cloud",
        role: "DevOps Engineer",
        tone: "bg-cyan-100 text-cyan-700",
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
        tone: "bg-emerald-100 text-emerald-700",
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
      <div className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-emerald-200/35 blur-2xl" />
      <div className="max-w-full overflow-hidden rounded-[1.5rem] border border-[#123c2d]/12 bg-white text-left shadow-[0_30px_80px_-35px_rgba(18,60,45,0.38)] sm:rounded-[2rem]">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-rose-300" />
            <span className="size-2.5 rounded-full bg-amber-300" />
            <span className="size-2.5 rounded-full bg-emerald-300" />
          </div>
          <div className="hidden w-56 items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-400 sm:flex">
            <Search size={13} /> Cari lamaran...
          </div>
          <span className="rounded-lg bg-[#123c2d] px-3 py-2 text-[10px] font-bold text-white sm:text-xs">
            + Lamaran baru
          </span>
        </div>
        <div className="grid lg:grid-cols-[180px_1fr]">
          <aside className="hidden border-r border-slate-100 bg-[#fbfcf9] p-4 lg:block">
            <p className="mb-5 px-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Ruang kerja
            </p>
            {[
              ["Ringkasan", "text-slate-500"],
              ["Lamaran", "bg-emerald-100 text-[#123c2d]"],
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
                <p className="text-xs font-semibold text-emerald-700">
                  Selasa, 8 September
                </p>
                <h2 className="mt-1 text-lg font-bold tracking-tight text-[#10261f] sm:text-xl">
                  Pipeline lamaran
                </h2>
              </div>
              <div className="hidden gap-2 sm:flex">
                <span className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500">
                  Filter
                </span>
                <span className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500">
                  Urutkan
                </span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {columns.map((column) => (
                <div
                  key={column.label}
                  className="rounded-xl bg-slate-50/80 p-2.5 sm:p-3"
                >
                  <div className="mb-3 flex items-center justify-between px-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
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
                        className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm"
                      >
                        <div className="flex gap-2.5">
                          <span
                            className={`grid size-8 shrink-0 place-items-center rounded-lg text-xs font-bold ${card.tone}`}
                          >
                            {card.company}
                          </span>
                          <div className="min-w-0">
                            <h3 className="truncate text-xs font-bold text-slate-800">
                              {card.role}
                            </h3>
                            <p className="mt-0.5 truncate text-[10px] text-slate-500">
                              {card.companyName}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <CalendarDays size={11} /> 3 hari lalu
                          </span>
                          <ArrowUpRight size={12} />
                        </div>
                      </article>
                    ))}
                    {column.label === "Offer" ? (
                      <div className="flex items-center gap-2 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 p-3 text-[10px] font-semibold text-emerald-700">
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
