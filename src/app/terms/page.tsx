import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/landing";

export const metadata: Metadata = {
  title: "Ketentuan Layanan — JobTrack",
  description: "Ketentuan penggunaan layanan JobTrack.",
};

const sections = [
  {
    title: "Persetujuan penggunaan",
    content:
      "Dengan mengakses atau menggunakan JobTrack, kamu menyetujui ketentuan ini dan Kebijakan Privasi kami. Jika tidak menyetujuinya, kamu dapat menggunakan pratinjau publik tanpa membuat akun dan berhenti menggunakan layanan kapan saja.",
  },
  {
    title: "Akun dan keamanan",
    content:
      "Kamu bertanggung jawab menjaga kerahasiaan kredensial dan memastikan informasi akunmu akurat. Segera hubungi kami bila mencurigai akses tanpa izin. Satu akun ditujukan untuk satu pengguna kecuali dinyatakan lain.",
  },
  {
    title: "Penggunaan yang wajar",
    content:
      "Gunakan JobTrack untuk mengelola proses pencarian kerja secara sah. Kamu tidak boleh mencoba mengganggu layanan, mengakses data pengguna lain, menyisipkan perangkat lunak berbahaya, atau menggunakan layanan untuk aktivitas yang melanggar hukum.",
  },
  {
    title: "Konten milik pengguna",
    content:
      "Kamu tetap memiliki informasi dan konten yang kamu masukkan. Kamu memberi JobTrack izin terbatas untuk memproses konten tersebut hanya sejauh diperlukan untuk menyediakan fungsi layanan yang kamu gunakan.",
  },
  {
    title: "Mode demo",
    content:
      "Semua nama perusahaan, posisi, kontak, dan aktivitas pada mode demo bersifat fiktif untuk tujuan demonstrasi. Kemiripan dengan pihak nyata tidak disengaja dan data demo tidak boleh dianggap sebagai lowongan aktif.",
  },
  {
    title: "Ketersediaan layanan",
    content:
      "Kami berupaya menjaga layanan tetap andal, tetapi tidak menjamin layanan selalu tersedia tanpa gangguan. Fitur dapat diperbarui, ditangguhkan, atau dihentikan untuk pemeliharaan, keamanan, atau pengembangan produk.",
  },
  {
    title: "Batasan tanggung jawab",
    content:
      "JobTrack adalah alat produktivitas dan tidak menjamin hasil rekrutmen, tawaran kerja, atau keputusan perusahaan. Keputusan terkait lamaran, dokumen, dan komunikasi profesional tetap menjadi tanggung jawabmu.",
  },
  {
    title: "Perubahan ketentuan",
    content:
      "Ketentuan dapat diperbarui dari waktu ke waktu. Versi terbaru selalu tersedia pada halaman ini. Perubahan material akan disampaikan melalui layanan bila mekanisme pemberitahuan telah tersedia.",
  },
] as const;

export default function TermsPage() {
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
          Ketentuan Layanan
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Ketentuan sederhana untuk menjaga JobTrack tetap aman, bermanfaat, dan
          adil bagi setiap pengguna.
        </p>
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
          <h2 className="font-bold text-slate-950">Butuh penjelasan?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-900/70">
            Kirim pertanyaan ke{" "}
            <a href="mailto:halo@jobtrack.id" className="font-bold underline">
              halo@jobtrack.id
            </a>
            . Kami senang membantu.
          </p>
        </div>
      </article>
    </main>
  );
}
