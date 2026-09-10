import Link from "next/link";
import { ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";
import { DashboardPreview } from "./dashboard-preview";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#fbfcf8] pb-20 pt-16 sm:pb-28 sm:pt-24">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-32 top-0 size-[32rem] rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="absolute -left-40 top-52 size-[24rem] rounded-full bg-amber-50 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-[500px] opacity-30 [background-image:radial-gradient(#8bb9a4_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      </div>
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="max-w-full overflow-hidden rounded-full border border-emerald-200 bg-emerald-50/90 px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-sm sm:inline-flex sm:items-center sm:gap-2 sm:text-sm">
            <span className="mr-2 inline-block size-2 rounded-full bg-emerald-500 align-middle shadow-[0_0_0_4px_rgba(16,185,129,0.13)] sm:mr-0" />
            <span className="align-middle">
              Pencarian kerja, tanpa kekacauan spreadsheet
            </span>
          </div>
          <h1 className="mt-7 text-balance text-4xl font-bold leading-[1.08] tracking-[-0.055em] text-[#10261f] sm:text-6xl lg:text-7xl">
            Kelola setiap peluang.{" "}
            <span className="text-emerald-600">Raih pekerjaan terbaikmu.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-slate-600 sm:text-xl sm:leading-8">
            JobTrack menyatukan lamaran, jadwal wawancara, tugas, dan dokumen
            dalam satu ruang kerja yang rapi—agar kamu bisa fokus pada langkah
            berikutnya.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#123c2d] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-950/10 transition hover:-translate-y-0.5 hover:bg-[#0d3023] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              Mulai gratis <ArrowRight size={17} />
            </Link>
            <Link
              href="/dashboard?demo=true"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-[#123c2d] shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <PlayCircle size={17} /> Lihat demo langsung
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500 sm:text-sm">
            {[
              "Gratis untuk memulai",
              "Tanpa kartu kredit",
              "Data demo siap pakai",
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-600" />
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-14 sm:mt-20">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
