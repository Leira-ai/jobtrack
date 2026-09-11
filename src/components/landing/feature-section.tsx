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
    tint: "border-ink bg-secondary text-ink",
  },
  {
    icon: CalendarCheck2,
    title: "Jadwal tetap terjaga",
    description:
      "Catat wawancara, tenggat, dan follow-up agar tidak ada momen penting yang terlewat.",
    tint: "border-blue-900 bg-blue-500 text-white",
  },
  {
    icon: FileText,
    title: "Dokumen selalu siap",
    description:
      "Kelola CV, surat lamaran, dan portfolio sesuai kebutuhan setiap posisi.",
    tint: "border-amber-200 bg-amber-100 text-ink",
  },
  {
    icon: BellRing,
    title: "Tindak lanjut tepat waktu",
    description:
      "Buat tugas dan pengingat sederhana untuk menjaga momentum proses rekrutmen.",
    tint: "border-indigo-200 bg-indigo-500 text-white",
  },
  {
    icon: BarChart3,
    title: "Progres yang terukur",
    description:
      "Pahami sumber lamaran terbaik dan lihat perkembangan pencarian kerjamu dari waktu ke waktu.",
    tint: "border-rose-900 bg-rose-400 text-white",
  },
  {
    icon: SearchCheck,
    title: "Semua detail di satu tempat",
    description:
      "Simpan kontak rekruter, catatan interview, gaji, dan tautan lowongan tanpa spreadsheet terpisah.",
    tint: "border-cyan-200 bg-cyan-400 text-cyan-900",
  },
] as const;

export function FeatureSection() {
  return (
    <section
      id="fitur"
      className="scroll-mt-24 border-y-2 border-ink/10 bg-surface py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="max-w-3xl">
          <p className="inline-flex items-center rounded-full border-2 border-ink bg-pop px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-ink shadow-card">
            Satu ruang kerja
          </p>
          <h2 className="mt-5 text-balance text-4xl font-extrabold tracking-[-0.045em] text-ink sm:text-5xl">
            Semua yang kamu butuhkan untuk tetap selangkah di depan.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted sm:text-lg">
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
                className="group rounded-[1.75rem] border-2 border-ink/10 bg-background p-6 shadow-card transition duration-300 hover:-translate-y-1.5 hover:border-ink hover:shadow-lift"
              >
                <span
                  className={`grid size-12 place-items-center rounded-2xl border-2 ${feature.tint}`}
                  aria-hidden="true"
                >
                  <Icon size={22} />
                </span>
                <h3 className="mt-5 text-xl font-extrabold tracking-[-0.02em] text-ink">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
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
