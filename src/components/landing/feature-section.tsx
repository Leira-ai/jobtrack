import {
  BarChart3,
  BellRing,
  CalendarCheck2,
  FileText,
  KanbanSquare,
  SearchCheck,
} from "lucide-react";

const features = [
  {
    icon: KanbanSquare,
    title: "Pipeline yang jelas",
    description:
      "Pindahkan lamaran dari tersimpan hingga keputusan akhir dalam satu papan yang mudah dipindai.",
    tint: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  },
  {
    icon: CalendarCheck2,
    title: "Jadwal tetap terjaga",
    description:
      "Catat wawancara, tenggat, dan follow-up agar tidak ada momen penting yang terlewat.",
    tint: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
  },
  {
    icon: FileText,
    title: "Dokumen selalu siap",
    description:
      "Kelola CV, surat lamaran, dan portfolio sesuai kebutuhan setiap posisi.",
    tint: "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  },
  {
    icon: BellRing,
    title: "Tindak lanjut tepat waktu",
    description:
      "Buat tugas dan pengingat sederhana untuk menjaga momentum proses rekrutmen.",
    tint: "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  },
  {
    icon: BarChart3,
    title: "Progres yang terukur",
    description:
      "Pahami sumber lamaran terbaik dan lihat perkembangan pencarian kerjamu dari waktu ke waktu.",
    tint: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  },
  {
    icon: SearchCheck,
    title: "Semua detail di satu tempat",
    description:
      "Simpan kontak rekruter, catatan interview, gaji, dan tautan lowongan tanpa spreadsheet terpisah.",
    tint: "bg-cyan-50 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300",
  },
] as const;

export function FeatureSection() {
  return (
    <section
      id="fitur"
      className="scroll-mt-24 border-y border-slate-200 bg-white py-16 sm:py-24 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="max-w-2xl text-left">
          <p className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-blue-900 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300">
            Satu ruang kerja
          </p>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Semua yang kamu butuhkan untuk tetap selangkah di depan.
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-400">
            Bukan sekadar daftar lamaran. Setiap kartu dibuat scannable, setiap
            status langsung terbaca.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="group rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 shadow-sm transition hover:border-slate-300 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700 dark:hover:bg-slate-900"
              >
                <span
                  className={`grid size-11 place-items-center rounded-xl ${feature.tint}`}
                  aria-hidden="true"
                >
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
