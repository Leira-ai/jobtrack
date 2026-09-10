import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000",
);

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "JobTrack — Kelola Lamaran Kerja",
    template: "%s | JobTrack",
  },
  description:
    "Pantau lamaran, wawancara, tindak lanjut, dokumen, dan perkembangan pencarian kerja dalam satu tempat.",
  applicationName: "JobTrack",
  alternates: { canonical: "/" },
  icons: { icon: "/jobtrack-icon.svg" },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "JobTrack",
    title: "JobTrack — Kelola lamaran, persiapkan peluang",
    description:
      "Kelola seluruh proses pencarian kerja tanpa spreadsheet yang berantakan.",
  },
  twitter: {
    card: "summary",
    title: "JobTrack — Kelola lamaran, persiapkan peluang",
    description:
      "Kelola seluruh proses pencarian kerja tanpa spreadsheet yang berantakan.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfcf8" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

const themeScript = `(() => {
  try {
    const saved = localStorage.getItem("jobtrack-theme");
    const dark = saved === "dark" || ((!saved || saved === "system") && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  } catch {}
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
