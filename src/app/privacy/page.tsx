import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/landing";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — JobTrack",
  description:
    "Pelajari cara JobTrack menangani dan melindungi data pribadimu.",
};

const sections = [
  {
    title: "Informasi yang kami kelola",
    content:
      "Saat layanan autentikasi aktif, JobTrack dapat mengelola nama, alamat email, serta data yang kamu masukkan seperti lamaran, jadwal, catatan, tugas, dan referensi dokumen. Mode demo menggunakan data fiktif dan tidak memerlukan akun.",
  },
  {
    title: "Cara informasi digunakan",
    content:
      "Informasi digunakan untuk menyediakan fitur yang kamu pilih, mempertahankan sesi akun, menampilkan progres pencarian kerja, dan menjaga fungsi layanan. JobTrack tidak menjual data pribadimu untuk periklanan.",
  },
  {
    title: "Penyimpanan dan keamanan",
    content:
      "Kredensial autentikasi dikelola melalui penyedia autentikasi yang dikonfigurasi pada lingkungan aplikasi. Kami menerapkan koneksi terenkripsi dan membatasi akses data sesuai kebutuhan layanan, namun tidak ada sistem digital yang sepenuhnya bebas risiko.",
  },
  {
    title: "Kendali atas data",
    content:
      "Kamu dapat meminta koreksi atau penghapusan informasi akun dengan menghubungi kami. Beberapa data dapat disimpan sementara bila diperlukan untuk keamanan, pencegahan penyalahgunaan, atau kewajiban hukum.",
  },
  {
    title: "Cookie dan sesi",
    content:
      "JobTrack dapat menggunakan cookie esensial untuk mempertahankan sesi masuk dan preferensi dasar. Cookie ini diperlukan agar fungsi akun bekerja dan tidak digunakan untuk iklan lintas situs.",
  },
  {
    title: "Perubahan kebijakan",
    content:
      "Kami dapat memperbarui kebijakan ini saat fitur atau praktik layanan berubah. Tanggal pembaruan akan ditampilkan pada halaman ini. Penggunaan layanan setelah perubahan berarti kamu telah membaca versi terbaru.",
  },
] as const;

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Kebijakan Privasi"
      intro="Privasi bukan catatan kaki. Halaman ini menjelaskan secara ringkas data apa yang dikelola JobTrack dan pilihan yang kamu miliki."
      sections={sections}
    />
  );
}

function LegalPage({
  title,
  intro,
  sections,
}: {
  readonly title: string;
  readonly intro: string;
  readonly sections: readonly { title: string; content: string }[];
}) {
  return (
    <main
      lang="id"
      className="min-h-screen bg-background font-sans text-slate-900"
    >
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Brand />
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={16} /> Beranda
          </Link>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-700">
          Informasi legal
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-ink sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">{intro}</p>
        <p className="mt-4 text-sm text-slate-400">
          Terakhir diperbarui: 8 September 2026
        </p>
        <div className="mt-12 grid gap-9">
          {sections.map((section, index) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold text-ink">
                <span className="mr-2 text-slate-600">
                  {String(index + 1).padStart(2, "0")}.
                </span>
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                {section.content}
              </p>
            </section>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="font-bold text-slate-950">
            Ada pertanyaan tentang privasi?
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-900/70">
            Hubungi kami melalui{" "}
            <a href="mailto:halo@jobtrack.id" className="font-bold underline">
              halo@jobtrack.id
            </a>
            . Kami akan membantu menjelaskan pilihan yang tersedia.
          </p>
        </div>
      </article>
    </main>
  );
}
