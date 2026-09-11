import type {
  CvAnalysisInput,
  CvAnalysisResult,
  CvCheckResult,
  CvRule,
} from "../types";

const boundedRatio = (value: number): number => Math.max(0, Math.min(1, value));
const occurrences = (text: string, pattern: RegExp): number =>
  text.match(pattern)?.length ?? 0;

const STOPWORDS = new Set(
  `a an and are as at be been by can dari dalam dan dengan di for from has have ini is itu ke karena kerja of on or pada para sebagai that the their they this to untuk was were will yang you your atau agar akan antara apa apabila bagi bahwa bisa buat but dari dapat demi dia dilakukan guna hal hingga ia ialah jika juga kami kamu kepada ketika kita lebih maka maupun melalui menjadi merupakan oleh pada paling per saja sama saya sebab secara sedang seperti serta setiap sudah supaya tanpa telah tentang terhadap tersebut tetap tidak yaitu adalah ada dalam who what when where why how our us job role work bekerja pekerjaan posisi kandidat candidate kualifikasi qualification requirement requirements required prefer preferred plus serta maupun melalui termasuk memiliki mampu baik baru years year tahun`.split(
    /\s+/,
  ),
);

const SENSITIVE_TERMS = new Set(
  `name nama age usia umur gender sex male female man woman men women pria wanita lelaki laki perempuan pronoun pronouns religion agama islam muslim christian kristen catholic katolik hindu buddhist buddha race ras ethnicity ethnic etnis nationality kewarganegaraan marital married single menikah lajang family keluarga pregnancy hamil disability disabled disabilitas health kesehatan address alamat postcode zipcode suku`.split(
    /\s+/,
  ),
);

const SENSITIVE_LINE =
  /^\s*(?:full\s+name|nama\s+lengkap|name|nama|age|usia|umur|date\s+of\s+birth|dob|tanggal\s+lahir|gender|jenis\s+kelamin|sex|pronouns?|kata\s+ganti|religion|agama|race|ras|ethnicity|etnis|nationality|kewarganegaraan|marital\s+status|status\s+perkawinan|family|keluarga|pregnancy|kehamilan|disability|disabilitas|health|kesehatan|home\s+address|address|alamat)\s*[:\-]/i;

const SENSITIVE_ATTRIBUTE_EXCLUSIONS = [
  "Name and photograph / nama dan foto",
  "Age and date of birth / usia dan tanggal lahir",
  "Gender, sex, and pronouns / gender dan kata ganti",
  "Race, ethnicity, religion, and nationality / ras, etnis, agama, dan kewarganegaraan",
  "Marital, family, pregnancy, disability, and health status",
  "Home address and socioeconomic proxies",
] as const;

const SKILL_CONCEPTS = {
  javascript: ["javascript", "js"],
  typescript: ["typescript", "ts"],
  react: ["react", "reactjs", "react.js"],
  "next.js": ["next", "nextjs", "next.js"],
  "node.js": ["node", "nodejs", "node.js"],
  python: ["python"],
  java: ["java"],
  "c#": ["c#", "csharp"],
  "c++": ["c++", "cpp"],
  go: ["golang"],
  rust: ["rust"],
  php: ["php"],
  sql: ["sql"],
  postgresql: ["postgres", "postgresql"],
  mysql: ["mysql"],
  mongodb: ["mongodb", "mongo"],
  redis: ["redis"],
  aws: ["aws", "amazon web services"],
  azure: ["azure"],
  gcp: ["gcp", "google cloud"],
  docker: ["docker"],
  kubernetes: ["kubernetes", "k8s"],
  git: ["git"],
  graphql: ["graphql"],
  "rest api": ["rest api", "restful"],
  html: ["html"],
  css: ["css"],
  tailwind: ["tailwind", "tailwind css"],
  figma: ["figma"],
  excel: ["excel", "microsoft excel"],
  tableau: ["tableau"],
  powerbi: ["power bi", "powerbi"],
  tensorflow: ["tensorflow"],
  pytorch: ["pytorch"],
  playwright: ["playwright"],
  jest: ["jest"],
  // Finance & Accounting
  akuntansi: ["akuntansi", "accounting", "pembukuan", "bookkeeping"],
  perpajakan: ["pajak", "perpajakan", "taxation", "brevet"],
  "financial analysis": ["financial analysis", "analisis keuangan"],
  audit: ["audit", "auditing", "internal audit"],
  accurate: ["accurate", "accurate accounting"],
  sap: ["sap", "sap erp"],
  // Human Resources & People
  rekrutmen: ["rekrutmen", "recruitment", "talent acquisition"],
  payroll: ["payroll", "penggajian"],
  kpi: ["kpi", "key performance indicator", "performance management"],
  // Sales, Marketing & Content
  copywriting: ["copywriting", "penulisan naskah"],
  "content writing": ["content writing", "penulisan konten"],
  crm: ["crm", "customer relationship management", "salesforce", "hubspot"],
  "google ads": ["google ads", "google adwords"],
  "meta ads": ["meta ads", "facebook ads", "instagram ads"],
  "google analytics": ["google analytics", "ga4"],
  canva: ["canva"],
  // Creative & Design
  photoshop: ["photoshop", "adobe photoshop"],
  illustrator: ["illustrator", "adobe illustrator"],
  "ui/ux design": ["ui/ux", "ui design", "ux design"],
  // Operations & Logistics
  logistik: ["logistik", "logistics", "supply chain management", "scm"],
  procurement: ["procurement", "pengadaan", "purchasing"],
  // Management & Productivity
  notion: ["notion"],
  jira: ["jira"],
  trello: ["trello"],
} as const;

const DOMAIN_CONCEPTS = {
  "machine learning": ["machine learning", "pembelajaran mesin"],
  "data analysis": ["data analysis", "data analytics", "analisis data"],
  "project management": ["project management", "manajemen proyek"],
  "product management": ["product management", "manajemen produk"],
  "user experience": ["user experience", "pengalaman pengguna", "ux"],
  "user interface": ["user interface", "antarmuka pengguna", "ui"],
  "quality assurance": ["quality assurance", "jaminan kualitas"],
  "continuous delivery": [
    "continuous integration",
    "continuous delivery",
    "ci/cd",
  ],
  "cloud computing": ["cloud computing", "komputasi awan"],
  "computer science": ["computer science", "ilmu komputer", "informatika"],
  "software engineering": ["software engineering", "rekayasa perangkat lunak"],
  "web development": [
    "web development",
    "pengembangan web",
    "aplikasi web",
    "produk web",
  ],
  "mobile development": [
    "mobile development",
    "pengembangan aplikasi",
    "aplikasi mobile",
  ],
  "digital marketing": ["digital marketing", "pemasaran digital"],
  "search engine optimization": ["search engine optimization", "seo"],
  "social media": ["social media", "media sosial"],
  "business intelligence": ["business intelligence", "intelijen bisnis"],
  "customer service": ["customer service", "layanan pelanggan"],
  "problem solving": ["problem solving", "pemecahan masalah"],
  "critical thinking": ["critical thinking", "berpikir kritis"],
  "team leadership": ["team leadership", "kepemimpinan tim"],
  "cross-functional collaboration": [
    "cross functional",
    "cross-functional",
    "lintas fungsi",
    "kolaborasi lintas fungsi",
  ],
  "stakeholder management": [
    "stakeholder management",
    "manajemen pemangku kepentingan",
  ],
  agile: ["agile methodology", "agile", "scrum master", "metodologi agile"],
  "english language": ["english language", "bahasa inggris"],
  "finance & accounting": [
    "finance",
    "keuangan",
    "akuntansi",
    "accounting",
    "financial planning",
  ],
  "human resources": [
    "human resources",
    "hr",
    "manajemen sdm",
    "personalia",
    "human capital",
  ],
  "sales & business development": [
    "sales",
    "penjualan",
    "business development",
    "pengembangan bisnis",
  ],
  "supply chain & logistics": [
    "supply chain",
    "logistik",
    "rantai pasok",
    "manajemen pergudangan",
  ],
  "legal & compliance": [
    "legal",
    "hukum",
    "kepatuhan",
    "compliance",
    "perjanjian kerja",
  ],
} as const;

const ACTION_VERBS =
  /\b(?:built|created|delivered|designed|developed|drove|implemented|improved|increased|launched|led|managed|optimized|reduced|resolved|shipped|streamlined|membangun|membuat|menghasilkan|merancang|mengembangkan|mendorong|menerapkan|meningkatkan|meluncurkan|memimpin|mengelola|mengoptimalkan|mengurangi|menyelesaikan|merilis|menyederhanakan)\b/giu;

export const CV_SCORING_RULES: readonly CvRule[] = [
  {
    id: "skill-match",
    category: "match",
    label: "Kecocokan keahlian",
    weight: 35,
  },
  {
    id: "keyword-match",
    category: "match",
    label: "Kecocokan kata kunci",
    weight: 20,
  },
  {
    id: "domain-match",
    category: "match",
    label: "Kecocokan bidang",
    weight: 10,
  },
  { id: "sections", category: "structure", label: "Struktur CV", weight: 10 },
  { id: "impact", category: "impact", label: "Dampak terukur", weight: 10 },
  {
    id: "action-language",
    category: "impact",
    label: "Bahasa aktif",
    weight: 5,
  },
  {
    id: "readability",
    category: "readability",
    label: "Keterbacaan",
    weight: 5,
  },
  {
    id: "contact",
    category: "content",
    label: "Kontak profesional",
    weight: 5,
  },
];

const normalizeText = (text: string): string =>
  text.normalize("NFKC").replace(/\r\n?/g, "\n");

const scoringText = (text: string): string =>
  normalizeText(text)
    .split("\n")
    .filter((line) => !SENSITIVE_LINE.test(line))
    .join("\n");

const tokenize = (text: string): string[] =>
  scoringText(text)
    .toLocaleLowerCase("en-US")
    .match(/[\p{L}\p{N}][\p{L}\p{N}+#.-]*/gu)
    ?.map((token) => token.replace(/^[-.]+|[-.]+$/g, ""))
    .filter(
      (token) =>
        token.length >= 3 &&
        !STOPWORDS.has(token) &&
        !SENSITIVE_TERMS.has(token) &&
        !/^\d+(?:[.,]\d+)?$/.test(token),
    ) ?? [];

const includesTerm = (text: string, term: string): boolean => {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`,
    "iu",
  ).test(text);
};

const unique = <T>(items: readonly T[]): T[] => [...new Set(items)];

const extractConcepts = (
  text: string,
  concepts: Readonly<Record<string, readonly string[]>>,
): string[] => {
  const normalized = scoringText(text).toLocaleLowerCase("en-US");
  return Object.entries(concepts)
    .filter(([, aliases]) =>
      aliases.some((alias) => includesTerm(normalized, alias)),
    )
    .map(([concept]) => concept);
};

const extractSkills = (text: string): string[] =>
  extractConcepts(text, SKILL_CONCEPTS);

const extractDomainTerms = (text: string): string[] =>
  extractConcepts(text, DOMAIN_CONCEPTS);

const extractKeywords = (
  text: string,
  excluded: readonly string[],
): string[] => {
  const tokens = tokenize(text);
  const excludedTokens = new Set(
    excluded
      .flatMap((term) => tokenize(term))
      .map((term) => term.toLowerCase()),
  );
  const counts = new Map<string, { count: number; first: number }>();
  tokens.forEach((token, index) => {
    const key = token.toLowerCase();
    if (excludedTokens.has(key)) return;
    const current = counts.get(key);
    counts.set(key, {
      count: (current?.count ?? 0) + 1,
      first: current?.first ?? index,
    });
  });
  return [...counts]
    .sort(([, a], [, b]) => b.count - a.count || a.first - b.first)
    .slice(0, 15)
    .map(([term]) => term);
};

const overlap = (
  required: readonly string[],
  cvText: string,
): { matched: string[]; missing: string[]; ratio: number } => {
  const normalizedCv = scoringText(cvText).toLocaleLowerCase("en-US");
  const matched = required.filter((term) => includesTerm(normalizedCv, term));
  const missing = required.filter((term) => !matched.includes(term));
  return {
    matched,
    missing,
    ratio: required.length === 0 ? 0 : matched.length / required.length,
  };
};

const conceptOverlap = (
  required: readonly string[],
  present: readonly string[],
): { matched: string[]; missing: string[]; ratio: number } => {
  const presentConcepts = new Set(present);
  const matched = required.filter((concept) => presentConcepts.has(concept));
  return {
    matched,
    missing: required.filter((concept) => !presentConcepts.has(concept)),
    ratio: required.length === 0 ? 0 : matched.length / required.length,
  };
};

const aliasesForConcepts = (
  concepts: readonly string[],
  dictionary: Readonly<Record<string, readonly string[]>>,
): string[] => concepts.flatMap((concept) => dictionary[concept] ?? [concept]);

const makeCheck = (
  rule: CvRule,
  ratioValue: number,
  feedback: string,
): CvCheckResult => {
  const ratio = boundedRatio(ratioValue);
  return {
    ...rule,
    earned: Math.min(rule.weight, Math.round(rule.weight * ratio * 10) / 10),
    passed: ratio >= 0.75,
    feedback,
  };
};

const findRule = (id: string): CvRule => {
  const rule = CV_SCORING_RULES.find((candidate) => candidate.id === id);
  if (!rule) throw new Error(`Unknown CV scoring rule: ${id}`);
  return rule;
};

export function analyzeCv(input: CvAnalysisInput): CvAnalysisResult {
  const cvText = scoringText(input.cvText);
  const jobDescriptionText = scoringText(input.jobDescriptionText);
  const requiredSkills = extractSkills(jobDescriptionText);
  const requiredDomains = extractDomainTerms(jobDescriptionText);
  const requiredKeywords = extractKeywords(jobDescriptionText, [
    ...aliasesForConcepts(requiredSkills, SKILL_CONCEPTS),
    ...aliasesForConcepts(requiredDomains, DOMAIN_CONCEPTS),
  ]);
  const skills = conceptOverlap(requiredSkills, extractSkills(cvText));
  const domains = conceptOverlap(requiredDomains, extractDomainTerms(cvText));
  const keywords = overlap(requiredKeywords, cvText);

  const sectionPatterns = [
    /(?:^|\n)\s*(?:professional\s+)?(?:summary|profile|ringkasan|profil)\s*(?:\n|:)/imu,
    /(?:^|\n)\s*(?:(?:work|professional)\s+)?(?:experience|employment|pengalaman(?:\s+kerja)?)\s*(?:\n|:)/imu,
    /(?:^|\n)\s*(?:education|pendidikan)\s*(?:\n|:)/imu,
    /(?:^|\n)\s*(?:(?:technical|core)\s+)?(?:skills|competencies|keahlian|keterampilan|kompetensi)\s*(?:\n|:)/imu,
  ];
  const sectionCount = sectionPatterns.filter((pattern) =>
    pattern.test(cvText),
  ).length;
  const metrics = occurrences(
    cvText,
    /(?:\b\d+(?:[.,]\d+)?%|(?:[$€£]|Rp\.?\s*)\d[\d.,]*|\b\d+[kKmMbB]?\+?\s+(?:users?|customers?|projects?|hours?|days?|people|teams?|pengguna|pelanggan|proyek|jam|hari|orang|tim)\b)/gu,
  );
  const actionCount = unique(
    cvText.match(ACTION_VERBS)?.map((term) => term.toLowerCase()) ?? [],
  ).length;
  const wordCount = tokenize(cvText).length;
  const bullets = occurrences(cvText, /^\s*(?:[-•*]|\d+[.)])\s+/gmu);
  const readabilityRatio =
    wordCount >= 150 && wordCount <= 900
      ? bullets >= 4
        ? 1
        : 0.75
      : wordCount >= 75 && wordCount <= 1_100
        ? bullets >= 3
          ? 0.75
          : 0.5
        : bullets >= 3
          ? 0.5
          : 0;
  const contactCount = [
    /[\w.+-]+@[\w.-]+\.[a-z]{2,}/iu.test(cvText),
    /(?:\+?\d[\d ().-]{7,}\d)/u.test(cvText),
    /(?:https?:\/\/|linkedin\.com\/|github\.com\/|behance\.net\/|portfolio)/iu.test(
      cvText,
    ),
  ].filter(Boolean).length;

  const checks = [
    makeCheck(
      findRule("skill-match"),
      skills.ratio,
      `${skills.matched.length}/${requiredSkills.length} keahlian penting cocok.`,
    ),
    makeCheck(
      findRule("keyword-match"),
      keywords.ratio,
      `${keywords.matched.length}/${requiredKeywords.length} kata kunci pekerjaan cocok.`,
    ),
    makeCheck(
      findRule("domain-match"),
      domains.ratio,
      `${domains.matched.length}/${requiredDomains.length} istilah bidang cocok.`,
    ),
    makeCheck(
      findRule("sections"),
      sectionCount / sectionPatterns.length,
      `${sectionCount}/${sectionPatterns.length} bagian utama CV ditemukan.`,
    ),
    makeCheck(
      findRule("impact"),
      metrics / 4,
      metrics >= 4
        ? "Pencapaian didukung beberapa metrik konkret."
        : `${metrics} metrik konkret ditemukan; tambahkan persentase, skala, waktu, atau nilai.`,
    ),
    makeCheck(
      findRule("action-language"),
      actionCount / 5,
      actionCount >= 5
        ? "Pengalaman menggunakan variasi kata kerja aktif."
        : `${actionCount} variasi kata kerja aktif ditemukan.`,
    ),
    makeCheck(
      findRule("readability"),
      readabilityRatio,
      `${wordCount} kata bermakna dan ${bullets} poin terdeteksi.`,
    ),
    makeCheck(
      findRule("contact"),
      contactCount / 2,
      contactCount >= 2
        ? "Dua atau lebih jalur kontak profesional terdeteksi."
        : "Tambahkan email dan nomor telepon atau tautan profesional.",
    ),
  ];

  const matchedKeywords = unique([
    ...skills.matched,
    ...domains.matched,
    ...keywords.matched,
  ]);
  const missingKeywords = unique([
    ...skills.missing,
    ...domains.missing,
    ...keywords.missing,
  ]);
  const rawScore = checks.reduce((total, check) => total + check.earned, 0);
  return {
    score: Math.max(0, Math.min(100, Math.round(rawScore))),
    checks,
    matchedKeywords,
    missingKeywords,
    strengths: checks
      .filter((check) => check.passed)
      .map((check) => check.feedback),
    suggestions: checks
      .filter((check) => !check.passed)
      .map((check) => check.feedback),
    excludedSensitiveTraits: SENSITIVE_ATTRIBUTE_EXCLUSIONS,
    excludedSignals: SENSITIVE_ATTRIBUTE_EXCLUSIONS,
    disclaimer:
      "Analisis deterministik ini menilai kecocokan dokumen, bukan nilai kandidat. Atribut sensitif dikecualikan, hasil tidak boleh dipakai untuk merangking kandidat atau mengambil keputusan perekrutan otomatis.",
  };
}

export const analyzeCV = analyzeCv;
