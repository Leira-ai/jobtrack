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
        tone: "bg-amber-100 text-ink",
      },
      {
        company: "L",
        companyName: "Lintas Finansial",
        role: "QA Automation",
        tone: "bg-blue-500 text-white",
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
        tone: "bg-indigo-500 text-white",
      },
      {
        company: "J",
        companyName: "Jembatan Cloud",
        role: "DevOps Engineer",
        tone: "bg-cyan-400 text-cyan-900",
      },
    ],
  },
  {
    label: "Offer",
    count: 2,
    dot: "bg-slate-600",
    cards: [
      {
        company: "P",
        companyName: "Pijar Health",
        role: "Backend Engineer",
        tone: "bg-primary-strong text-white",
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
      <div
        className="absolute -inset-3 rounded-[2.5rem] border-2 border-ink bg-secondary [transform:rotate(2deg)]"
        aria-hidden="true"
      />
      <div className="relative max-w-full overflow-hidden rounded-[2rem] border-2 border-ink bg-surface text-left shadow-lift [transform:rotate(-1deg)]">
        <div className="flex items-center justify-between gap-3 border-b-2 border-ink/10 bg-primary-strong px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full border border-ink bg-pop" />
            <span className="size-3 rounded-full border border-ink bg-secondary" />
            <span className="size-3 rounded-full border border-ink bg-white" />
          </div>
          <div className="hidden min-w-0 flex-1 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 sm:flex sm:max-w-xs">
            <Search size={13} /> Cari lamaran...
          </div>
          <span className="rounded-full border-2 border-ink bg-secondary px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-ink sm:text-xs">
            + Lamaran baru
          </span>
        </div>
        <div className="grid lg:grid-cols-[180px_1fr]">
          <aside className="hidden border-r-2 border-ink/10 bg-background p-4 lg:block">
            <p className="mb-5 rounded-full bg-ink px-3 py-1 text-center text-[10px] font-extrabold uppercase tracking-[0.18em] text-white">
              Ruang kerja
            </p>
            {[
              ["Ringkasan", "text-muted"],
              [
                "Lamaran",
                "border-2 border-ink bg-secondary text-ink shadow-card",
              ],
              ["Kalender", "text-muted"],
              ["Dokumen", "text-muted"],
            ].map(([label, style]) => (
              <div
                key={label}
                className={`mb-1 rounded-2xl px-3 py-2.5 text-xs font-extrabold ${style}`}
              >
                {label}
              </div>
            ))}
          </aside>
          <div className="min-w-0 p-4 sm:p-6">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-amber-800">
                  Selasa, 8 September
                </p>
                <h2 className="mt-2 text-xl font-extrabold tracking-[-0.035em] text-ink sm:text-2xl">
                  Pipeline lamaran
                </h2>
              </div>
              <div className="hidden gap-2 sm:flex">
                <span className="rounded-full border-2 border-ink/15 bg-surface px-3 py-2 text-xs font-extrabold text-muted">
                  Filter
                </span>
                <span className="rounded-full border-2 border-ink/15 bg-surface px-3 py-2 text-xs font-extrabold text-muted">
                  Urutkan
                </span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {columns.map((column) => (
                <div
                  key={column.label}
                  className="rounded-3xl border-2 border-ink/10 bg-background p-2.5 sm:p-3"
                >
                  <div className="mb-3 flex items-center justify-between px-1">
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-ink">
                      <span
                        className={`size-2.5 rounded-full border border-ink ${column.dot}`}
                      />{" "}
                      {column.label}
                      <span className="rounded-full bg-ink px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                        {column.count}
                      </span>
                    </div>
                    <MoreHorizontal size={15} className="text-muted" />
                  </div>
                  <div className="grid gap-2.5">
                    {column.cards.map((card) => (
                      <article
                        key={card.companyName}
                        className="rounded-2xl border-2 border-ink/10 bg-surface p-3 shadow-card transition hover:-translate-y-0.5"
                      >
                        <div className="flex gap-2.5">
                          <span
                            className={`grid size-9 shrink-0 place-items-center rounded-2xl border border-ink/20 text-xs font-extrabold ${card.tone}`}
                          >
                            {card.company}
                          </span>
                          <div className="min-w-0">
                            <h3 className="truncate text-xs font-extrabold text-ink">
                              {card.role}
                            </h3>
                            <p className="mt-0.5 truncate text-[10px] font-semibold text-muted">
                              {card.companyName}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t-2 border-ink/10 pt-2.5 text-[10px] font-semibold text-muted">
                          <span className="flex items-center gap-1">
                            <CalendarDays size={11} /> 3 hari lalu
                          </span>
                          <ArrowUpRight size={12} />
                        </div>
                      </article>
                    ))}
                    {column.label === "Offer" ? (
                      <div className="flex items-center gap-2 rounded-2xl border-2 border-ink bg-secondary p-3 text-[10px] font-extrabold uppercase tracking-wide text-ink">
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
