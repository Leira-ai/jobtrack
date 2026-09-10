import Link from "next/link";
import {
  ArrowRight,
  DatabaseZap,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

const securityItems = [
  { icon: LockKeyhole, label: "Koneksi terenkripsi" },
  { icon: EyeOff, label: "Data pribadi tidak dijual" },
  { icon: DatabaseZap, label: "Kontrol atas datamu" },
] as const;

export function SecurityAndCta() {
  return (
    <>
      <section id="keamanan" className="scroll-mt-24 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="overflow-hidden rounded-[2rem] bg-[#102f24] px-6 py-10 text-white sm:px-10 lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16 lg:px-14 lg:py-14">
            <div className="relative mx-auto grid aspect-square max-w-[260px] place-items-center">
              <div className="absolute inset-5 rounded-full border border-emerald-200/10" />
              <div className="absolute inset-12 rounded-full border border-emerald-200/15" />
              <div className="absolute size-36 rounded-full bg-emerald-300/10 blur-2xl" />
              <div className="relative grid size-24 place-items-center rounded-[2rem] border border-emerald-200/20 bg-white/10 shadow-2xl backdrop-blur">
                <ShieldCheck
                  size={45}
                  className="text-emerald-300"
                  strokeWidth={1.6}
                />
              </div>
            </div>
            <div className="mt-8 text-center lg:mt-0 lg:text-left">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">
                Privasi adalah prioritas
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
                Perjalanan kariermu tetap milikmu
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-50/70">
                JobTrack dirancang sebagai ruang kerja personal. Informasi
                lamaranmu digunakan hanya untuk menghadirkan pengalaman yang
                kamu pilih.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {securityItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-2.5 rounded-xl bg-white/7 px-3 py-3 text-left text-sm font-semibold text-emerald-50/85"
                    >
                      <Icon size={17} className="shrink-0 text-emerald-300" />{" "}
                      {item.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-[#e7f4e9] py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
            Siap mulai?
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-[#10261f] sm:text-5xl">
            Cari kerja dengan lebih tenang dan terarah.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Mulai gratis, atur progresmu, dan fokus pada kesempatan yang paling
            berarti.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#123c2d] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-950/10 transition hover:-translate-y-0.5 hover:bg-[#0d3023] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              Buat akun gratis <ArrowRight size={17} />
            </Link>
            <Link
              href="/dashboard?demo=true"
              className="inline-flex items-center justify-center rounded-xl border border-emerald-900/15 bg-white/70 px-6 py-3.5 text-sm font-bold text-[#123c2d] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              Jelajahi data demo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
