export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_DOCUMENT_TYPES =
  ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type DocumentKind = "pdf" | "docx";

export class DocumentTextError extends Error {
  constructor(
    public readonly code:
      | "unsupported"
      | "too-large"
      | "empty"
      | "encrypted"
      | "malformed"
      | "browser-only",
    message: string,
  ) {
    super(message);
    this.name = "DocumentTextError";
  }
}

export interface DocumentFileLike {
  readonly name: string;
  readonly size: number;
  readonly type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
}

const extension = (name: string): string =>
  name.slice(name.lastIndexOf(".")).toLocaleLowerCase("en-US");

export function validateDocumentFile(file: DocumentFileLike): DocumentKind {
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    throw new DocumentTextError(
      "too-large",
      "Berkas terlalu besar. Ukuran maksimal adalah 10 MiB.",
    );
  }
  if (file.size <= 0) {
    throw new DocumentTextError(
      "empty",
      "Berkas kosong tidak dapat dianalisis.",
    );
  }

  const ext = extension(file.name);
  if (ext === ".pdf" && (!file.type || file.type === "application/pdf")) {
    return "pdf";
  }
  if (
    ext === ".docx" &&
    (!file.type ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
  ) {
    return "docx";
  }
  throw new DocumentTextError(
    "unsupported",
    "Format tidak didukung. Pilih berkas PDF atau DOCX tanpa makro.",
  );
}

const usefulText = (value: string): string =>
  value
    .normalize("NFKC")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim();

const extractPdfText = async (data: ArrayBuffer): Promise<string> => {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  if (typeof Worker !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
  }
  const task = pdfjs.getDocument({
    data: new Uint8Array(data),
    isEvalSupported: false,
    useWorkerFetch: false,
  });
  let passwordRequired = false;
  task.onPassword = () => {
    passwordRequired = true;
    void task.destroy();
  };
  try {
    const document = await task.promise;
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(
        content.items
          .filter(
            (item): item is typeof item & { str: string } => "str" in item,
          )
          .map((item) => item.str)
          .join(" "),
      );
      page.cleanup();
    }
    return usefulText(pages.join("\n\n"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const name = error instanceof Error ? error.name : "";
    if (passwordRequired || /password|encrypted/i.test(`${name} ${message}`)) {
      throw new DocumentTextError(
        "encrypted",
        "PDF dilindungi kata sandi atau terenkripsi. Buka proteksi sebelum mengunggah.",
      );
    }
    throw new DocumentTextError(
      "malformed",
      "PDF rusak atau tidak dapat dibaca. Coba simpan ulang dokumen tersebut.",
    );
  } finally {
    void task.destroy();
  }
};

const extractDocxText = async (data: ArrayBuffer): Promise<string> => {
  try {
    // @ts-expect-error Mammoth does not publish types for its browser bundle.
    const mammoth = (await import("mammoth/mammoth.browser.js")) as {
      default: {
        extractRawText(input: {
          arrayBuffer: ArrayBuffer;
        }): Promise<{ value: string }>;
      };
    };
    const result = await mammoth.default.extractRawText({ arrayBuffer: data });
    return usefulText(result.value);
  } catch {
    throw new DocumentTextError(
      "malformed",
      "DOCX rusak atau tidak dapat dibaca. Pilih dokumen Word tanpa makro.",
    );
  }
};

export async function extractDocumentText(
  file: DocumentFileLike,
): Promise<string> {
  if (typeof window === "undefined") {
    throw new DocumentTextError(
      "browser-only",
      "Ekstraksi dokumen hanya tersedia di browser.",
    );
  }
  const kind = validateDocumentFile(file);
  const data = await file.arrayBuffer();
  const text =
    kind === "pdf" ? await extractPdfText(data) : await extractDocxText(data);
  if (text.replace(/\s/g, "").length < 10) {
    throw new DocumentTextError(
      "empty",
      kind === "pdf"
        ? "Tidak ada teks yang dapat dibaca. PDF pindaian memerlukan OCR terlebih dahulu."
        : "Tidak ada teks yang dapat dibaca dalam DOCX ini.",
    );
  }
  return text;
}
