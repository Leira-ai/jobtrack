import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JobTrack — Pelacak Lamaran Kerja",
    short_name: "JobTrack",
    description:
      "Kelola lamaran, wawancara, tugas, dan dokumen pencarian kerja dalam satu tempat.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfcf8",
    theme_color: "#123c2d",
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
