import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JobTrack — Pelacak Lamaran Kerja",
    short_name: "JobTrack",
    description:
      "Kelola lamaran, wawancara, tugas, dan dokumen pencarian kerja dalam satu tempat.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f1f5f9",
    theme_color: "#0f2a5c",
    lang: "id",
    categories: ["productivity", "business"],
    icons: [
      {
        src: "/jobtrack-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
