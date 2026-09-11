import { ArrowDown, Check, ClipboardPlus, Goal, Sparkles } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardPlus,
    title: "Simpan peluang",
    description:
      "Tambahkan lowongan yang menarik beserta posisi, perusahaan, gaji, dan tautannya.",
    chip: "border-ink bg-accent text-ink",
  },
  {
    number: "02",
    icon: Goal,
    title: "Kelola prosesnya",
    description:
      "Perbarui status, susun jadwal, dan simpan catatan penting setelah setiap interaksi.",
    chip: "border-amber-900 bg-amber-300 text-amber-950",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Ambil langkah berikutnya",
    description:
      "Gunakan ringkasan dan tugas untuk fokus pada tindakan yang paling berarti hari ini.",
    chip: "border-violet-900 bg-violet-600 text-white",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="cara-kerja"
      className="scroll-mt-24 bg-background py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="inline-flex items-center rounded-full border-2 border-ink bg-surface px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-ink shadow-card">
              Mulai tanpa ribet
            </p>
            <h2 className="mt-5 max-w-md text-balance text-4xl font-extrabold tracking-[-0.045em] text-ink sm:text-5xl">
              Dari lowongan tersimpan ke langkah nyata.
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-muted">
              Alur 3 langkah yang bikin kamu konsisten, tanpa nambah kerjaan
              administratif.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border-2 border-ink bg-accent px-4 py-2.5 text-sm font-extrabold text-ink shadow-card">
              <Check size={16} /> Siap dalam hitungan menit
            </div>
          </div>
          <ol className="grid gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.number}
                  className="relative flex gap-4 rounded-[1.75rem] border-2 border-ink/10 bg-surface p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:border-ink hover:shadow-lift sm:gap-6 sm:p-7"
                >
                  <span className="grid size-14 shrink-0 place-items-center rounded-3xl border-2 border-ink bg-primary-strong text-accent">
                    <Icon size={24} />
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`inline-flex rounded-full border-2 px-3 py-1 text-[11px] font-extrabold tracking-[0.16em] ${step.chip}`}
                    >
                      LANGKAH {step.number}
                    </p>
                    <h3 className="mt-2 text-xl font-extrabold tracking-tight text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-muted">
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 ? (
                    <ArrowDown
                      className="absolute -bottom-4 left-10 z-10 rounded-full border-2 border-ink bg-accent p-0.5 text-ink"
                      size={18}
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
