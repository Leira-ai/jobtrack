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
      className="scroll-mt-24 bg-slate-50/70 py-16 sm:py-24 dark:bg-slate-950/60"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="lg:sticky lg:top-28 text-left">
            <p className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-blue-900 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300">
              Mulai tanpa ribet
            </p>
            <h2 className="mt-4 max-w-md text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              Dari lowongan tersimpan ke langkah nyata.
            </h2>
            <p className="mt-3 max-w-md text-base leading-7 text-slate-600 dark:text-slate-400">
              Alur 3 langkah yang membuatmu konsisten, tanpa menambah beban
              administratif.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <Check size={16} className="text-blue-600 dark:text-blue-400" />{" "}
              Siap dalam hitungan menit
            </div>
          </div>
          <ol className="grid gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.number}
                  className="relative flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-slate-300 sm:gap-6 dark:border-slate-800 dark:bg-slate-900"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
                    <Icon size={22} />
                  </span>
                  <div className="min-w-0">
                    <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-900 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
                      LANGKAH {step.number}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 ? (
                    <ArrowDown
                      className="absolute -bottom-3.5 left-9 z-10 size-4 text-blue-500"
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
