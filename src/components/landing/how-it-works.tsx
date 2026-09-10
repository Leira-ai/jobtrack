import { ArrowDown, Check, ClipboardPlus, Goal, Sparkles } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardPlus,
    title: "Simpan peluang",
    description:
      "Tambahkan lowongan yang menarik beserta posisi, perusahaan, gaji, dan tautannya.",
  },
  {
    number: "02",
    icon: Goal,
    title: "Kelola prosesnya",
    description:
      "Perbarui status, susun jadwal, dan simpan catatan penting setelah setiap interaksi.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Ambil langkah berikutnya",
    description:
      "Gunakan ringkasan dan tugas untuk fokus pada tindakan yang paling berarti hari ini.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="cara-kerja"
      className="scroll-mt-24 bg-[#f3f7f2] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
              Mulai tanpa ribet
            </p>
            <h2 className="mt-4 max-w-lg text-3xl font-bold tracking-[-0.04em] text-[#10261f] sm:text-4xl">
              Dari lowongan tersimpan ke langkah nyata
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
              Alur sederhana yang membuatmu konsisten tanpa menambah pekerjaan
              administratif.
            </p>
            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-800">
              <Check size={16} /> Siap digunakan dalam hitungan menit
            </div>
          </div>
          <ol className="grid gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.number}
                  className="relative flex gap-4 rounded-2xl border border-white bg-white/85 p-5 shadow-sm sm:gap-6 sm:p-6"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#123c2d] text-white">
                    <Icon size={21} />
                  </span>
                  <div>
                    <p className="text-xs font-bold tracking-[0.16em] text-emerald-700">
                      LANGKAH {step.number}
                    </p>
                    <h3 className="mt-1.5 text-lg font-bold text-[#10261f]">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 ? (
                    <ArrowDown
                      className="absolute -bottom-4 left-9 z-10 text-emerald-500"
                      size={16}
                      aria-hidden="true"
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
