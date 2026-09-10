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
    tint: "bg-emerald-50 text-emerald-700",
  },
  {
    icon: CalendarCheck2,
    title: "Jadwal tetap terjaga",
    description:
      "Catat wawancara, tenggat, dan follow-up agar tidak ada momen penting yang terlewat.",
    tint: "bg-blue-50 text-blue-700",
  },
  {
    icon: FileText,
    title: "Dokumen selalu siap",
    description:
      "Kelola CV, surat lamaran, dan portfolio sesuai kebutuhan setiap posisi.",
    tint: "bg-amber-50 text-amber-700",
  },
  {
    icon: BellRing,
    title: "Tindak lanjut tepat waktu",
    description:
      "Buat tugas dan pengingat sederhana untuk menjaga momentum proses rekrutmen.",
    tint: "bg-violet-50 text-violet-700",
  },
  {
    icon: BarChart3,
    title: "Progres yang terukur",
    description:
      "Pahami sumber lamaran terbaik dan lihat perkembangan pencarian kerjamu dari waktu ke waktu.",
    tint: "bg-rose-50 text-rose-700",
  },
  {
    icon: SearchCheck,
    title: "Semua detail di satu tempat",
    description:
      "Simpan kontak rekruter, catatan interview, gaji, dan tautan lowongan tanpa spreadsheet terpisah.",
    tint: "bg-cyan-50 text-cyan-700",
  },
] as const;

export function FeatureSection() {
  return (
    <section id="fitur" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
            Satu ruang kerja
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-[#10261f] sm:text-4xl">
            Semua yang kamu butuhkan untuk tetap selangkah di depan
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
            Bukan sekadar daftar lamaran. JobTrack membantu setiap langkah
            terasa lebih terencana.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="group rounded-2xl border border-slate-200/80 bg-[#fcfdfb] p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_20px_50px_-32px_rgba(16,61,44,0.45)]"
              >
                <span
                  className={`grid size-11 place-items-center rounded-xl ${feature.tint}`}
                  aria-hidden="true"
                >
                  <Icon size={21} />
                </span>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-[#10261f]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
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
