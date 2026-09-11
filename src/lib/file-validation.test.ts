import { describe, expect, it } from "vitest";
import {
  DEFAULT_MAX_FILE_SIZE_BYTES,
  getFileExtension,
  sanitizeFileName,
  validateDocumentFile,
  validateDocumentHeader,
} from "./file-validation";

describe("file validation", () => {
  it("accepts a PDF within the default size limit", () => {
    expect(
      validateDocumentFile({
        name: "resume.PDF",
        size: 1000,
        type: "application/pdf",
      }),
    ).toEqual({ valid: true, errors: [] });
    expect(getFileExtension("resume.PDF")).toBe("pdf");
  });

  it("rejects legacy DOC files and files larger than 10 MiB", () => {
    const doc = validateDocumentFile({
      name: "resume.doc",
      size: 1000,
      type: "application/msword",
    });
    const oversized = validateDocumentFile({
      name: "resume.pdf",
      size: DEFAULT_MAX_FILE_SIZE_BYTES + 1,
      type: "application/pdf",
    });

    expect(DEFAULT_MAX_FILE_SIZE_BYTES).toBe(10 * 1024 * 1024);
    expect(doc.errors.map((error) => error.code)).toEqual([
      "unsupported-extension",
      "unsupported-mime",
    ]);
    expect(oversized.errors.map((error) => error.code)).toEqual(["too-large"]);
  });

  it("requires MIME and extension to identify the same supported format", () => {
    expect(
      validateDocumentFile({
        name: "resume.pdf",
        size: 1000,
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }).errors.map((error) => error.code),
    ).toEqual(["unsupported-mime"]);
    expect(
      validateDocumentFile({ name: "resume.pdf", size: 1000, type: "" })
        .errors[0]?.code,
    ).toBe("unsupported-mime");
  });

  it("reports every relevant validation problem", () => {
    const result = validateDocumentFile({
      name: "script.exe",
      size: 11 * 1024 * 1024,
      type: "application/x-msdownload",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.map((error) => error.code)).toEqual([
      "too-large",
      "unsupported-extension",
      "unsupported-mime",
    ]);
  });

  it("sanitizes file names to prevent injection", () => {
    expect(sanitizeFileName("my resume (1) <v2>?.pdf")).toBe(
      "my_resume__1___v2__.pdf",
    );
  });

  it("validates magic bytes for PDF and DOCX", () => {
    const validPdf = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    const validDocx = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
    const invalidHeader = new Uint8Array([0x00, 0x01, 0x02, 0x03]);

    expect(validateDocumentHeader(validPdf, "pdf")).toBe(true);
    expect(validateDocumentHeader(invalidHeader, "pdf")).toBe(false);
    expect(validateDocumentHeader(validDocx, "docx")).toBe(true);
    expect(validateDocumentHeader(invalidHeader, "docx")).toBe(false);
  });
});
