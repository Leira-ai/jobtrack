"use client";

import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSearch,
  Lightbulb,
  LoaderCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
} from "lucide-react";
import {
  buttonStyles,
  Card,
  CardTitle,
  PageHeader,
} from "@/components/dashboard/ui";
import { analyzeCv } from "@/lib/cv-analyzer";
import {
  ACCEPTED_DOCUMENT_TYPES,
  DocumentTextError,
  extractDocumentText,
} from "@/lib/document-text";

const exampleCv = `Alya Larasati\nFrontend Engineer\n\nRINGKASAN\nFrontend engineer dengan 4 tahun pengalaman membangun produk web yang cepat dan aksesibel menggunakan React dan TypeScript.\n\nPENGALAMAN\nFrontend Engineer — Studio Digital, 2023–sekarang\n• Meningkatkan performa checkout sebesar 38% menggunakan Next.js dan optimasi gambar.\n• Memimpin pengembangan design system yang digunakan 6 tim produk.\n• Mengembangkan REST API bersama backend engineer dan merilis 12 fitur.\n• Mengurangi bug antarmuka sebesar 25% melalui pengujian Playwright.\n\nKEAHLIAN\nReact, TypeScript, Next.js, JavaScript, Tailwind CSS, Playwright, Git, REST API\n\nPENDIDIKAN\nS1 Ilmu Komputer, Universitas Contoh, 2021\n\nalya@example.com | +62 812 3456 7890 | https://github.com/example`;

const exampleJd = `Kami mencari Frontend Engineer untuk mengembangkan produk web yang aksesibel. Kandidat menguasai React, TypeScript, Next.js, JavaScript, Tailwind CSS, Git, REST API, Playwright, pengembangan web, dan pengalaman pengguna. Tanggung jawab mencakup optimasi performa, pengujian, kolaborasi lintas fungsi, serta pengembangan design system.`;

const usefulWordCount = (text: string): number =>
  text
    .trim()
    .split(/\s+/u)
    .filter((word) => word.length > 1).length;

const textareaStyles =
  "min-h-64 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500";

type InputKind = "cv" | "job";

export function CvAnalyzer() {
  const [cvText, setCvText] = useState("");
  const [jobText, setJobText] = useState("");
  const [submitted, setSubmitted] = useState<{
    cvText: string;
    jobText: string;
  } | null>(null);
  const [fileError, setFileError] = useState("");
  const [loadingFile, setLoadingFile] = useState<InputKind | null>(null);
  const [history, setHistory] = useState<
    Array<{
      id: string;
      date: string;
      score: number;
      matchedCount: number;
      missingCount: number;
    }>
  >(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("jobtrack.cv-history.v1");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const result = useMemo(
    () =>
      submitted
        ? analyzeCv({
            cvText: submitted.cvText,
            jobDescriptionText: submitted.jobText,
          })
        : null,
    [submitted],
  );

  const runAnalysis = useCallback(() => {
    setSubmitted({ cvText, jobText });
    const evaluated = analyzeCv({
      cvText,
      jobDescriptionText: jobText,
    });
    try {
      const item = {
        id: String(Date.now()),
        date: new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
        score: evaluated.score,
        matchedCount: evaluated.matchedKeywords.length,
        missingCount: evaluated.missingKeywords.length,
      };
      setHistory((prev) => {
        const next = [
          item,
          ...prev.filter((p) => p.score !== item.score || p.date !== item.date),
        ].slice(0, 5);
        localStorage.setItem("jobtrack.cv-history.v1", JSON.stringify(next));
        return next;
      });
    } catch {}
  }, [cvText, jobText]);
  const ready = usefulWordCount(cvText) >= 20 && usefulWordCount(jobText) >= 10;

  const handleFile = useCallback(
    async (kind: InputKind, event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      setFileError("");
      setLoadingFile(kind);
      try {
        const text = await extractDocumentText(file);
        if (kind === "cv") setCvText(text);
        else setJobText(text);
      } catch (error) {
        setFileError(
          error instanceof DocumentTextError
            ? error.message
            : "Berkas tidak dapat dibaca. Coba dokumen PDF atau DOCX lain.",
        );
      } finally {
        setLoadingFile(null);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setCvText("");
    setJobText("");
    setSubmitted(null);
    setFileError("");
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Kecocokan dokumen"
        title="Analisis CV dan deskripsi pekerjaan"
        description="Bandingkan CV dengan lowongan secara transparan dalam bahasa Indonesia atau Inggris."
      />
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
        <ShieldCheck className="mr-2 inline size-5" aria-hidden="true" />
        <strong>Privasi terjaga:</strong> teks dan berkas diproses hanya di
        browser, tanpa unggahan ke server. Gunakan PDF/DOCX maksimal 10 MiB dan
        hapus data pribadi yang tidak diperlukan.
      </div>
      {fileError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          <AlertCircle className="mr-2 inline size-4" aria-hidden="true" />
          {fileError}
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-2">
        <DocumentInput
          kind="cv"
          label="Isi CV"
          title="CV"
          description="Tempel teks atau ekstrak teks mentah dari PDF/DOCX."
          value={cvText}
          onChange={setCvText}
          onFile={handleFile}
          loading={loadingFile === "cv"}
        />
        <DocumentInput
          kind="job"
          label="Deskripsi pekerjaan"
          title="Deskripsi pekerjaan"
          description="Tempel persyaratan dan tanggung jawab lowongan."
          value={jobText}
          onChange={setJobText}
          onFile={handleFile}
          loading={loadingFile === "job"}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => {
            setCvText(exampleCv);
            setJobText(exampleJd);
            setSubmitted(null);
            setFileError("");
          }}
          className={buttonStyles.ghost}
        >
          <Sparkles className="size-4" aria-hidden="true" /> Gunakan contoh
          fiktif
        </button>
        <button
          type="button"
          onClick={runAnalysis}
          disabled={!ready || loadingFile !== null}
          className={buttonStyles.primary}
        >
          <FileSearch className="size-4" aria-hidden="true" /> Analisis sekarang
        </button>
      </div>
      {result ? (
        <AnalysisResult result={result} onReset={reset} />
      ) : (
        <EmptyResult />
      )}
      {history.length > 0 ? (
        <Card>
          <CardTitle
            title="Riwayat analisis lokal"
            description="Maksimal 5 analisis terakhir, hanya tersimpan di browser ini."
            action={
              <button
                type="button"
                className={buttonStyles.ghost}
                onClick={() => {
                  localStorage.removeItem("jobtrack.cv-history.v1");
                  setHistory([]);
                }}
              >
                Hapus riwayat
              </button>
            }
          />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {history.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"
              >
                <p className="text-xs text-slate-500">{item.date}</p>
                <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {item.score}
                  <span className="text-xs font-normal text-slate-400">
                    /100
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.matchedCount} cocok · {item.missingCount} kurang
                </p>
              </article>
            ))}
          </div>
        </Card>
      ) : null}
      <p className="text-center text-xs leading-5 text-slate-400">
        Ini bukan simulasi ATS dan tidak menjamin hasil rekrutmen. Jangan
        gunakan skor untuk merangking kandidat atau menggantikan penilaian
        manusia.
      </p>
    </div>
  );
}

function DocumentInput({
  kind,
  label,
  title,
  description,
  value,
  onChange,
  onFile,
  loading,
}: {
  kind: InputKind;
  label: string;
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  onFile: (kind: InputKind, event: ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
}) {
  const inputId = `${kind}-document`;
  const textareaId = `${kind}-text`;
  return (
    <Card>
      <CardTitle
        title={title}
        description={description}
        action={
          <label
            htmlFor={inputId}
            className={`${buttonStyles.secondary} cursor-pointer`}
          >
            {loading ? (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Upload className="size-4" aria-hidden="true" />
            )}
            {loading ? "Membaca..." : "Unggah"}
          </label>
        }
      />
      <input
        id={inputId}
        type="file"
        accept={ACCEPTED_DOCUMENT_TYPES}
        onChange={(event) => void onFile(kind, event)}
        disabled={loading}
        className="sr-only"
      />
      <label className="sr-only" htmlFor={textareaId}>
        {label}
      </label>
      <textarea
        id={textareaId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={textareaStyles}
        placeholder={`Tempel ${label.toLocaleLowerCase("id-ID")} di sini...`}
      />
      <p className="mt-3 text-xs text-slate-400">
        {usefulWordCount(value)} kata · konten berguna diperlukan
      </p>
    </Card>
  );
}

function downloadAnalysisSummary(result: ReturnType<typeof analyzeCv>) {
  const lines = [
    "HASIL ANALISIS KECOCOKAN CV - JOBTRACK",
    `Waktu: ${new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeStyle: "medium" }).format(new Date())}`,
    `Skor Total: ${result.score}/100`,
    "",
    "--- RINCIAN PENILAIAN ---",
    ...result.checks.map(
      (c) =>
        `• ${c.label}: ${c.earned}/${c.weight} poin (${c.passed ? "Lulus" : "Perlu ditingkatkan"})\n  ${c.feedback}`,
    ),
    "",
    "--- ISTILAH COCOK ---",
    result.matchedKeywords.length
      ? result.matchedKeywords.join(", ")
      : "Tidak ada istilah cocok",
    "",
    "--- ISTILAH YANG BELUM DITEMUKAN ---",
    result.missingKeywords.length
      ? result.missingKeywords.join(", ")
      : "Tidak ada istilah hilang",
    "",
    "--- SARAN PENYUNTINGAN ---",
    ...result.suggestions.map((s) => `• ${s}`),
    "",
    "Catatan: Hasil analisis ini bersifat indikatif dan tidak menggantikan evaluasi rekruter manusia.",
  ];

  const blob = new Blob([lines.join("\n")], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `evaluasi-cv-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function EmptyResult() {
  return (
    <Card className="min-h-56 flex-col items-center justify-center text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
        <Target className="size-7" aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-semibold">Hasil akan muncul di sini</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
        Isi CV dan deskripsi pekerjaan dengan konten yang berguna untuk melihat
        skor, kecocokan istilah, serta saran penyuntingan.
      </p>
    </Card>
  );
}

function AnalysisResult({
  result,
  onReset,
}: {
  result: ReturnType<typeof analyzeCv>;
  onReset: () => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
      <Card className="text-center">
        <p className="text-sm font-medium text-slate-500">Skor kecocokan CV</p>
        <div
          className="relative mx-auto mt-5 grid size-36 place-items-center rounded-full"
          style={{
            background: `conic-gradient(rgb(37 99 235) ${result.score}%, rgb(226 232 240) 0)`,
          }}
          aria-label={`Skor ${result.score} dari 100`}
        >
          <div className="grid size-28 place-items-center rounded-full bg-white dark:bg-slate-900">
            <div>
              <span className="text-4xl font-bold">{result.score}</span>
              <span className="text-slate-400">/100</span>
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => downloadAnalysisSummary(result)}
            className={buttonStyles.primary}
          >
            <Download className="size-4" aria-hidden="true" /> Unduh ringkasan
          </button>
          <button
            type="button"
            onClick={onReset}
            className={buttonStyles.secondary}
          >
            <RotateCcw className="size-4" aria-hidden="true" /> Mulai ulang
          </button>
        </div>
        <p className="mt-5 text-left text-xs leading-5 text-slate-500">
          {result.disclaimer}
        </p>
      </Card>
      <div className="space-y-6">
        <Card>
          <CardTitle
            title="Rincian skor"
            description="Bobot dan poin yang diperoleh; total bobot 100."
          />
          <div className="space-y-4">
            {result.checks.map((check) => (
              <div key={check.id} className="flex gap-3">
                {check.passed ? (
                  <CheckCircle2
                    className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400"
                    aria-hidden="true"
                  />
                ) : (
                  <AlertCircle
                    className="mt-0.5 size-5 shrink-0 text-amber-500"
                    aria-hidden="true"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3 text-sm font-semibold">
                    <span>{check.label}</span>
                    <span className="shrink-0">
                      {check.earned}/{check.weight}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {check.feedback}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="grid gap-6 md:grid-cols-2">
          <KeywordCard
            title="Istilah cocok"
            terms={result.matchedKeywords}
            empty="Belum ada istilah penting yang cocok."
            tone="teal"
          />
          <KeywordCard
            title="Istilah belum ditemukan"
            terms={result.missingKeywords}
            empty="Tidak ada istilah penting yang hilang."
            tone="amber"
          />
        </div>
        <Card>
          <CardTitle
            title="Kekuatan dan saran"
            description="Saran dokumen, bukan keputusan perekrutan."
          />
          <div className="grid gap-5 md:grid-cols-2">
            <ResultList
              title="Kekuatan"
              values={result.strengths}
              fallback="Belum ada sinyal kuat."
            />
            <ResultList
              title="Saran"
              values={result.suggestions}
              fallback="Pertahankan kecocokan ini dan verifikasi semua klaim."
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function KeywordCard({
  title,
  terms,
  empty,
  tone,
}: {
  title: string;
  terms: readonly string[];
  empty: string;
  tone: "teal" | "amber";
}) {
  const classes =
    tone === "teal"
      ? "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
      : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
  return (
    <Card>
      <h3 className="font-semibold">{title}</h3>
      {terms.length ? (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label={title}>
          {terms.map((term) => (
            <li
              key={term}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}
            >
              {term}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-500">{empty}</p>
      )}
    </Card>
  );
}

function ResultList({
  title,
  values,
  fallback,
}: {
  title: string;
  values: readonly string[];
  fallback: string;
}) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Lightbulb className="size-4 text-amber-500" aria-hidden="true" />
        {title}
      </h3>
      <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-500">
        {(values.length ? values : [fallback]).map((value) => (
          <li key={value}>• {value}</li>
        ))}
      </ul>
    </div>
  );
}
