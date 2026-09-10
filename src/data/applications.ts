import type {
  ApplicationStatus,
  EmploymentType,
  JobApplication,
  SalaryRange,
  WorkMode,
} from "../types";

interface ApplicationSeed {
  readonly company: string;
  readonly role: string;
  readonly location: string;
  readonly workMode: WorkMode;
  readonly employmentType?: EmploymentType;
  readonly status: ApplicationStatus;
  readonly source: string;
  readonly appliedAt?: string;
  readonly salary?: SalaryRange;
  readonly tags: readonly string[];
  readonly note: string;
}

const idr = (min: number, max: number): SalaryRange => ({
  min,
  max,
  currency: "IDR",
  period: "month",
});

const seeds: readonly ApplicationSeed[] = [
  {
    company: "Nusantara Labs",
    role: "Frontend Engineer",
    location: "Jakarta",
    workMode: "hybrid",
    status: "interview",
    source: "LinkedIn",
    appliedAt: "2026-06-05T03:20:00.000Z",
    salary: idr(18_000_000, 25_000_000),
    tags: ["React", "TypeScript"],
    note: "Recruiter highlighted the design-system work in the portfolio.",
  },
  {
    company: "Awan Data",
    role: "Data Analyst",
    location: "Bandung",
    workMode: "hybrid",
    status: "rejected",
    source: "Glints",
    appliedAt: "2026-06-09T02:10:00.000Z",
    salary: idr(12_000_000, 17_000_000),
    tags: ["SQL", "Python"],
    note: "Role required more marketplace analytics experience.",
  },
  {
    company: "Kapal Commerce",
    role: "Product Designer",
    location: "Jakarta",
    workMode: "onsite",
    status: "screening",
    source: "Company site",
    appliedAt: "2026-06-13T07:40:00.000Z",
    salary: idr(16_000_000, 22_000_000),
    tags: ["Figma", "Research"],
    note: "Sent the fintech case-study link to the hiring team.",
  },
  {
    company: "Pijar Health",
    role: "Backend Engineer",
    location: "Yogyakarta",
    workMode: "remote",
    status: "accepted",
    source: "Referral",
    appliedAt: "2026-06-17T01:15:00.000Z",
    salary: idr(20_000_000, 28_000_000),
    tags: ["Node.js", "PostgreSQL"],
    note: "Offer includes an equipment budget and flexible remote hours.",
  },
  {
    company: "Ruang Tumbuh",
    role: "UX Researcher",
    location: "Surabaya",
    workMode: "hybrid",
    status: "withdrawn",
    source: "Kalibrr",
    appliedAt: "2026-06-21T06:25:00.000Z",
    salary: idr(13_000_000, 18_000_000),
    tags: ["Interviews", "Usability"],
    note: "Withdrew after learning that weekly travel was mandatory.",
  },
  {
    company: "Lintas Finansial",
    role: "QA Automation Engineer",
    location: "Jakarta",
    workMode: "hybrid",
    status: "applied",
    source: "JobStreet",
    appliedAt: "2026-06-26T04:50:00.000Z",
    salary: idr(15_000_000, 21_000_000),
    tags: ["Playwright", "CI/CD"],
    note: "Tailored the resume toward end-to-end testing ownership.",
  },
  {
    company: "Teras Digital",
    role: "Full Stack Developer",
    location: "Malang",
    workMode: "remote",
    status: "technical_test",
    source: "LinkedIn",
    appliedAt: "2026-06-30T08:05:00.000Z",
    salary: idr(16_000_000, 24_000_000),
    tags: ["Next.js", "Prisma"],
    note: "Received a thoughtful rejection after the take-home exercise.",
  },
  {
    company: "Orbit Edukasi",
    role: "Product Manager",
    location: "Jakarta",
    workMode: "hybrid",
    status: "interview",
    source: "Referral",
    appliedAt: "2026-07-03T03:30:00.000Z",
    salary: idr(22_000_000, 30_000_000),
    tags: ["B2B", "Roadmaps"],
    note: "Preparing examples of prioritizing requests from school partners.",
  },
  {
    company: "Bumi Logistik",
    role: "Software Engineer",
    location: "Semarang",
    workMode: "onsite",
    status: "screening",
    source: "Tech in Asia Jobs",
    appliedAt: "2026-07-07T05:45:00.000Z",
    salary: idr(14_000_000, 20_000_000),
    tags: ["Go", "Microservices"],
    note: "Recruiter requested availability for an initial call.",
  },
  {
    company: "Saku Pintar",
    role: "Mobile Developer",
    location: "Jakarta",
    workMode: "remote",
    status: "rejected",
    source: "Glints",
    appliedAt: "2026-07-11T02:35:00.000Z",
    salary: idr(17_000_000, 24_000_000),
    tags: ["Flutter", "Dart"],
    note: "Position was filled internally before the technical round.",
  },
  {
    company: "Kreasi Rasa",
    role: "Business Intelligence Analyst",
    location: "Tangerang",
    workMode: "hybrid",
    status: "offer",
    source: "Company site",
    appliedAt: "2026-07-15T04:05:00.000Z",
    salary: idr(15_000_000, 21_000_000),
    tags: ["Tableau", "dbt"],
    note: "Asked for two days to review the compensation package.",
  },
  {
    company: "Jembatan Cloud",
    role: "DevOps Engineer",
    location: "Jakarta",
    workMode: "remote",
    status: "interview",
    source: "LinkedIn",
    appliedAt: "2026-07-18T07:10:00.000Z",
    salary: idr(23_000_000, 32_000_000),
    tags: ["Kubernetes", "AWS"],
    note: "System design round will focus on deployment reliability.",
  },
  {
    company: "Svara Media",
    role: "Content Strategist",
    location: "Bandung",
    workMode: "hybrid",
    status: "applied",
    source: "JobStreet",
    appliedAt: "2026-07-22T01:55:00.000Z",
    salary: idr(10_000_000, 15_000_000),
    tags: ["SEO", "Analytics"],
    note: "Included campaign metrics and an editorial calendar sample.",
  },
  {
    company: "Hijau Energi",
    role: "Data Engineer",
    location: "Surabaya",
    workMode: "hybrid",
    status: "screening",
    source: "Kalibrr",
    appliedAt: "2026-07-25T05:20:00.000Z",
    salary: idr(19_000_000, 27_000_000),
    tags: ["Airflow", "BigQuery"],
    note: "Recruiter confirmed the role supports relocation assistance.",
  },
  {
    company: "Pasar Lokal",
    role: "Growth Analyst",
    location: "Jakarta",
    workMode: "onsite",
    status: "rejected",
    source: "Tech in Asia Jobs",
    appliedAt: "2026-07-29T03:45:00.000Z",
    salary: idr(14_000_000, 19_000_000),
    tags: ["Experiments", "SQL"],
    note: "Hiring team selected a candidate with deeper pricing experience.",
  },
  {
    company: "Cakrawala Security",
    role: "Security Analyst",
    location: "Jakarta",
    workMode: "hybrid",
    status: "interview",
    source: "Referral",
    appliedAt: "2026-08-02T06:15:00.000Z",
    salary: idr(20_000_000, 29_000_000),
    tags: ["SIEM", "Incident response"],
    note: "Reviewing incident response scenarios before the panel.",
  },
  {
    company: "Dana Karya",
    role: "Technical Writer",
    location: "Bali",
    workMode: "remote",
    status: "applied",
    source: "LinkedIn",
    appliedAt: "2026-08-05T00:40:00.000Z",
    salary: idr(12_000_000, 18_000_000),
    tags: ["APIs", "Docs"],
    note: "Submitted API documentation and onboarding guide samples.",
  },
  {
    company: "Matahari Robotics",
    role: "Embedded Software Engineer",
    location: "Batam",
    workMode: "onsite",
    status: "screening",
    source: "Company site",
    appliedAt: "2026-08-08T04:25:00.000Z",
    salary: idr(18_000_000, 26_000_000),
    tags: ["C++", "IoT"],
    note: "Recruiter asked about willingness to relocate to Batam.",
  },
  {
    company: "Arunika Travel",
    role: "Customer Experience Lead",
    location: "Jakarta",
    workMode: "hybrid",
    status: "withdrawn",
    source: "Glints",
    appliedAt: "2026-08-12T02:05:00.000Z",
    salary: idr(15_000_000, 20_000_000),
    tags: ["Operations", "SaaS"],
    note: "Withdrew because the shift schedule did not match availability.",
  },
  {
    company: "Peta Kota",
    role: "GIS Developer",
    location: "Bandung",
    workMode: "remote",
    status: "interview",
    source: "JobStreet",
    appliedAt: "2026-08-16T05:35:00.000Z",
    salary: idr(16_000_000, 23_000_000),
    tags: ["Mapbox", "PostGIS"],
    note: "Technical discussion will cover spatial-query performance.",
  },
  {
    company: "Kopi Kolektif",
    role: "Operations Analyst",
    location: "Jakarta",
    workMode: "onsite",
    status: "applied",
    source: "Referral",
    appliedAt: "2026-08-20T03:50:00.000Z",
    salary: idr(11_000_000, 16_000_000),
    tags: ["Forecasting", "Excel"],
    note: "Referral introduced the hiring manager by email.",
  },
  {
    company: "Simpul AI",
    role: "Machine Learning Engineer",
    location: "Jakarta",
    workMode: "hybrid",
    status: "screening",
    source: "LinkedIn",
    appliedAt: "2026-08-24T01:30:00.000Z",
    salary: idr(24_000_000, 35_000_000),
    tags: ["Python", "MLOps"],
    note: "Application emphasizes model monitoring rather than model hype.",
  },
  {
    company: "Pelita Agritech",
    role: "Frontend Developer",
    location: "Bogor",
    workMode: "remote",
    status: "applied",
    source: "Kalibrr",
    appliedAt: "2026-08-29T07:00:00.000Z",
    salary: idr(14_000_000, 20_000_000),
    tags: ["Vue", "Accessibility"],
    note: "Added an accessibility audit project to the application.",
  },
  {
    company: "Titik Temu",
    role: "Design Systems Engineer",
    location: "Singapore",
    workMode: "remote",
    employmentType: "contract",
    status: "saved",
    source: "Company site",
    salary: { min: 4_500, max: 6_000, currency: "SGD", period: "month" },
    tags: ["React", "Design systems"],
    note: "Researching the team before applying in the next intake.",
  },
  {
    company: "Karya Inklusif",
    role: "Accessibility Specialist",
    location: "Jakarta",
    workMode: "hybrid",
    status: "preparing",
    source: "LinkedIn",
    salary: idr(15_000_000, 22_000_000),
    tags: ["WCAG", "Design systems"],
    note: "Tailoring the portfolio and collecting accessibility audit examples.",
  },
];

const statusPath = (
  status: ApplicationStatus,
): readonly ApplicationStatus[] => {
  if (status === "saved") return ["saved"];
  if (status === "preparing") return ["saved", "preparing"];
  if (status === "applied") return ["applied"];
  if (status === "screening") return ["applied", "screening"];
  if (status === "interview") return ["applied", "screening", "interview"];
  if (status === "technical_test")
    return ["applied", "screening", "interview", "technical_test"];
  if (status === "offer")
    return ["applied", "screening", "interview", "technical_test", "offer"];
  if (status === "accepted")
    return [
      "applied",
      "screening",
      "interview",
      "technical_test",
      "offer",
      "accepted",
    ];
  return ["applied", status];
};

const addDays = (value: string, days: number): string =>
  new Date(new Date(value).getTime() + days * 86_400_000).toISOString();

export const demoApplications: readonly JobApplication[] = seeds.map(
  (seed, index) => {
    const id = `app-${String(index + 1).padStart(3, "0")}`;
    const createdAt = seed.appliedAt ?? "2026-08-31T03:00:00.000Z";
    const path = statusPath(seed.status);
    const updatedAt = addDays(createdAt, Math.max(0, (path.length - 1) * 4));
    return {
      id,
      company: seed.company,
      role: seed.role,
      location: seed.location,
      workMode: seed.workMode,
      employmentType: seed.employmentType ?? "full-time",
      status: seed.status,
      source: seed.source,
      jobUrl: `https://jobs.example.test/${id}`,
      salary: seed.salary,
      appliedAt:
        seed.status === "saved" || seed.status === "preparing"
          ? undefined
          : seed.appliedAt,
      description: `${seed.role} opportunity at ${seed.company}, saved for this fictional demo.`,
      tags: seed.tags,
      statusHistory: path.map((to, historyIndex) => ({
        id: `${id}-history-${historyIndex + 1}`,
        from: historyIndex === 0 ? null : path[historyIndex - 1]!,
        to,
        changedAt: addDays(createdAt, historyIndex * 4),
        reason:
          historyIndex === 0
            ? "Added to JobTrack"
            : "Demo hiring pipeline update",
      })),
      notes: [
        {
          id: `${id}-note-1`,
          content: seed.note,
          createdAt: updatedAt,
          updatedAt,
        },
      ],
      createdAt,
      updatedAt,
    };
  },
);
