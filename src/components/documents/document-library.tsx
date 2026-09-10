"use client";

import {
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  File,
  FileText,
  Link2,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import {
  deleteDocumentAction,
  getDocumentDownloadUrlAction,
} from "@/app/dashboard/dokumen/actions";
import type {
  DocumentActionResult,
  DocumentApplicationOption,
} from "@/lib/documents/service";
import { validateDocumentFile } from "@/lib/file-validation";
import type { JobDocument, JobDocumentType } from "@/types";
import {
  Badge,
  buttonStyles,
  Card,
  EmptyState,
  fieldStyles,
  PageHeader,
} from "@/components/dashboard/ui";
import { cn, formatBytes, formatDate } from "@/components/dashboard/utils";

const typeLabel: Record<JobDocumentType, string> = {
  resume: "CV",
  "cover-letter": "Surat lamaran",
  portfolio: "Portofolio",
  certificate: "Sertifikat",
  other: "Lainnya",
};

type LibraryMode = "demo" | "authenticated";

interface DocumentLibraryProps {
  readonly mode?: LibraryMode;
  readonly initialDocuments?: readonly JobDocument[];
  readonly applications?: readonly DocumentApplicationOption[];
  readonly loadError?: string;
}

export function DocumentLibrary({
  mode = "demo",
  initialDocuments = [],
  applications = [],
  loadError,
}: DocumentLibraryProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState<JobDocument[]>([
    ...initialDocuments,
  ]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<globalThis.File | null>(null);
  const [type, setType] = useState<JobDocumentType>("resume");
  const [name, setName] = useState("");
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<
    string[]
  >([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const visible = documents.filter(
    (document) =>
      document.name.toLowerCase().includes(query.toLowerCase()) ||
      document.fileName.toLowerCase().includes(query.toLowerCase()),
  );

  function selectFile(selected: globalThis.File | undefined) {
    if (!selected) return;
    const validation = validateDocumentFile(selected);
    if (!validation.valid) {
      setError(validation.errors.map((item) => item.message).join(" "));
      setFile(null);
      return;
    }
    setError("");
    setFile(selected);
    setName(selected.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
  }

  function resetUpload() {
    setUploadOpen(false);
    setFile(null);
    setName("");
    setError("");
    setType("resume");
    setSelectedApplicationIds([]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function createDemoDocument() {
    if (!file || !name.trim()) return;
    const now = new Date().toISOString();
    setDocuments((current) => [
      {
        id: `doc-demo-${Date.now()}`,
        name: name.trim(),
        type,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        applicationIds: selectedApplicationIds,
        version: 1,
        createdAt: now,
        updatedAt: now,
      },
      ...current,
    ]);
    setNotice("Dokumen ditambahkan ke metadata demo lokal.");
    resetUpload();
  }

  function submitUpload() {
    if (!file || !name.trim()) return;
    if (mode === "demo") {
      createDemoDocument();
      return;
    }
    const formData = new FormData();
    formData.set("file", file);
    formData.set("name", name.trim());
    formData.set("type", type);
    selectedApplicationIds.forEach((id) =>
      formData.append("applicationIds", id),
    );
    setError("");
    setNotice("");
    startTransition(async () => {
      try {
        const response = await fetch("/dashboard/dokumen/upload", {
          method: "POST",
          body: formData,
        });
        const result = (await response.json()) as DocumentActionResult;
        if (!response.ok || !result.ok) {
          setError(result.message);
          return;
        }
        setNotice(result.message);
        resetUpload();
        router.refresh();
      } catch {
        setError("Unggahan gagal karena masalah jaringan. Coba lagi.");
      }
    });
  }

  function downloadDocument(document: JobDocument) {
    if (mode === "demo") {
      setNotice(
        "Mode demo hanya menyimpan metadata; tidak ada file untuk diunduh.",
      );
      return;
    }
    setActiveDocumentId(document.id);
    setError("");
    startTransition(async () => {
      const result = await getDocumentDownloadUrlAction(document.id);
      setActiveDocumentId(null);
      if (!result.ok || !result.url) {
        setError(result.message);
        return;
      }
      window.location.assign(result.url);
    });
  }

  function deleteDocument(document: JobDocument) {
    if (
      !window.confirm(
        `Hapus dokumen “${document.name}”? Tindakan ini tidak dapat dibatalkan.`,
      )
    )
      return;
    if (mode === "demo") {
      setDocuments((current) =>
        current.filter((item) => item.id !== document.id),
      );
      setNotice("Metadata dokumen demo dihapus secara lokal.");
      return;
    }
    setActiveDocumentId(document.id);
    setError("");
    setNotice("");
    startTransition(async () => {
      const result = await deleteDocumentAction(document.id);
      setActiveDocumentId(null);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setDocuments((current) =>
        current.filter((item) => item.id !== document.id),
      );
      setNotice(result.message);
      router.refresh();
    });
  }

  function toggleApplication(applicationId: string) {
    setSelectedApplicationIds((current) =>
      current.includes(applicationId)
        ? current.filter((id) => id !== applicationId)
        : [...current, applicationId],
    );
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    selectFile(event.dataTransfer.files[0]);
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pustaka karier"
        title="Dokumen"
        description={
          mode === "demo"
            ? "Kelola metadata contoh secara lokal tanpa mengirim file ke server."
            : "Simpan dokumen pribadi di Storage dan hubungkan ke lamaran Anda."
        }
        actions={
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className={buttonStyles.primary}
          >
            <UploadCloud className="size-4" /> Unggah dokumen
          </button>
        }
      />
      {loadError || (error && !uploadOpen) ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200"
        >
          {error || `Data dokumen gagal dimuat: ${loadError}`}
        </p>
      ) : null}
      {notice ? (
        <p
          role="status"
          className="rounded-xl bg-teal-50 p-3 text-sm text-teal-800 dark:bg-teal-950 dark:text-teal-200"
        >
          {notice}
        </p>
      ) : null}
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Total dokumen", value: documents.length },
          {
            label: "Versi CV",
            value: documents.filter((item) => item.type === "resume").length,
          },
          {
            label: "Terhubung ke lamaran",
            value: new Set(documents.flatMap((item) => item.applicationIds))
              .size,
          },
        ].map((item) => (
          <Card key={item.label} className="p-4">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-bold">{item.value}</p>
          </Card>
        ))}
      </section>
      <Card className="p-0">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Semua dokumen</h2>
            <p className="mt-1 text-xs text-slate-500">
              PDF atau DOCX hingga 10 MiB
            </p>
          </div>
          <label className="relative sm:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <span className="sr-only">Cari dokumen</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari dokumen..."
              className={`${fieldStyles} pl-9`}
            />
          </label>
        </div>
        {visible.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400 dark:bg-slate-950/50">
                <tr>
                  <th className="px-5 py-3 font-semibold">Dokumen</th>
                  <th className="px-5 py-3 font-semibold">Jenis</th>
                  <th className="px-5 py-3 font-semibold">Ukuran</th>
                  <th className="px-5 py-3 font-semibold">Terakhir diubah</th>
                  <th className="px-5 py-3 font-semibold">Lamaran</th>
                  <th className="px-5 py-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {visible.map((document) => (
                  <tr
                    key={document.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950">
                          <FileText className="size-5" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold">
                            {document.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {document.fileName} · v{document.version}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge>{typeLabel[document.type]}</Badge>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {formatBytes(document.sizeBytes)}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {formatDate(document.updatedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                        <Link2 className="size-3.5" />
                        {document.applicationIds.length}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => downloadDocument(document)}
                          disabled={
                            isPending && activeDocumentId === document.id
                          }
                          className={buttonStyles.ghost}
                          aria-label={`Unduh ${document.name}`}
                        >
                          <Download className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteDocument(document)}
                          disabled={
                            isPending && activeDocumentId === document.id
                          }
                          className={cn(buttonStyles.ghost, "text-red-600")}
                          aria-label={`Hapus ${document.name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<File className="size-6" />}
            title="Dokumen tidak ditemukan"
            description="Coba kata pencarian lain atau unggah dokumen baru."
          />
        )}
      </Card>
      {uploadOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-document-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 id="upload-document-title" className="text-lg font-bold">
                  Unggah dokumen
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {mode === "demo"
                    ? "Mode demo hanya menambahkan metadata lokal; isi file tidak disimpan."
                    : "File disimpan secara privat dan hanya dapat diakses oleh akun Anda."}
                </p>
              </div>
              <button
                type="button"
                onClick={resetUpload}
                className={buttonStyles.ghost}
                aria-label="Tutup"
              >
                <X className="size-5" />
              </button>
            </div>
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "mt-5 cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/20",
                error
                  ? "border-red-300"
                  : file
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-950/30"
                    : "border-slate-200 dark:border-slate-700",
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={onChange}
              />
              {file ? (
                <>
                  <FileText className="mx-auto size-9 text-teal-600" />
                  <p className="mt-3 text-sm font-semibold">{file.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatBytes(file.size)} · valid
                  </p>
                </>
              ) : (
                <>
                  <UploadCloud className="mx-auto size-9 text-slate-400" />
                  <p className="mt-3 text-sm font-semibold">
                    Tarik file ke sini atau klik untuk memilih
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    PDF atau DOCX · maksimal 10 MiB
                  </p>
                </>
              )}
            </div>
            {error ? (
              <p role="alert" className="mt-2 text-sm text-red-600">
                {error}
              </p>
            ) : null}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Nama dokumen
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={200}
                  className={`${fieldStyles} mt-2`}
                  placeholder="Contoh: CV Frontend 2026"
                />
              </label>
              <label className="text-sm font-medium">
                Jenis
                <select
                  value={type}
                  onChange={(event) =>
                    setType(event.target.value as JobDocumentType)
                  }
                  className={`${fieldStyles} mt-2`}
                >
                  {Object.entries(typeLabel).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {applications.length ? (
              <fieldset className="mt-5">
                <legend className="text-sm font-medium">
                  Hubungkan ke lamaran (opsional)
                </legend>
                <div className="mt-2 max-h-36 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                  {applications.map((application) => (
                    <label
                      key={application.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedApplicationIds.includes(
                          application.id,
                        )}
                        onChange={() => toggleApplication(application.id)}
                        className="size-4 accent-teal-700"
                      />
                      <span>{application.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={resetUpload}
                disabled={isPending}
                className={buttonStyles.secondary}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={submitUpload}
                disabled={isPending || !file || !name.trim()}
                className={buttonStyles.primary}
              >
                {isPending ? "Mengunggah..." : "Tambahkan ke pustaka"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
