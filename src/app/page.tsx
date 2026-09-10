import type { Metadata } from "next";
import {
  FeatureSection,
  HeroSection,
  HowItWorks,
  SecurityAndCta,
  SiteFooter,
  SiteHeader,
} from "@/components/landing";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3000";

export const metadata: Metadata = {
  title: "Kelola Lamaran Kerja dengan Lebih Terarah",
  description:
    "Atur lamaran, wawancara, tugas, dan dokumen pencarian kerja dalam satu ruang kerja yang rapi.",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "JobTrack",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: appUrl,
  description:
    "Platform untuk mengelola lamaran, wawancara, tugas, dokumen, dan perkembangan pencarian kerja.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
};

export default function HomePage() {
  return (
    <div
      lang="id"
      className="min-h-screen bg-[#fbfcf8] font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-950"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <a
        href="#konten-utama"
        className="sr-only z-[100] rounded-lg bg-white px-4 py-3 font-semibold text-[#123c2d] focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Lewati ke konten utama
      </a>
      <SiteHeader />
      <main id="konten-utama">
        <HeroSection />
        <FeatureSection />
        <HowItWorks />
        <SecurityAndCta />
      </main>
      <SiteFooter />
    </div>
  );
}
