// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
  extractDocumentText,
  MAX_DOCUMENT_SIZE_BYTES,
  validateDocumentFile,
  type DocumentFileLike,
} from "./document-text";

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const fileLike = (
  name: string,
  type: string,
  data: Uint8Array,
): DocumentFileLike => ({
  name,
  type,
  size: data.byteLength,
  arrayBuffer: async () => data.slice().buffer,
});

const textEncoder = new TextEncoder();
const crcTable = Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = (crc & 1) !== 0 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return crc >>> 0;
});

const crc32 = (data: Uint8Array): number => {
  let crc = 0xffffffff;
  for (const byte of data) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

const concat = (...arrays: Uint8Array[]): Uint8Array => {
  const result = new Uint8Array(
    arrays.reduce((sum, value) => sum + value.length, 0),
  );
  let offset = 0;
  for (const value of arrays) {
    result.set(value, offset);
    offset += value.length;
  }
  return result;
};

const zip = (entries: Record<string, string>): Uint8Array => {
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;
  const view = (size: number): [Uint8Array, DataView] => {
    const bytes = new Uint8Array(size);
    return [bytes, new DataView(bytes.buffer)];
  };
  for (const [name, contents] of Object.entries(entries)) {
    const nameBytes = textEncoder.encode(name);
    const data = textEncoder.encode(contents);
    const checksum = crc32(data);
    const [local, localView] = view(30);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint32(14, checksum, true);
    localView.setUint32(18, data.length, true);
    localView.setUint32(22, data.length, true);
    localView.setUint16(26, nameBytes.length, true);
    locals.push(local, nameBytes, data);
    const [central, centralView] = view(46);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint32(16, checksum, true);
    centralView.setUint32(20, data.length, true);
    centralView.setUint32(24, data.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint32(42, offset, true);
    centrals.push(central, nameBytes);
    offset += local.length + nameBytes.length + data.length;
  }
  const localData = concat(...locals);
  const centralData = concat(...centrals);
  const [end, endView] = view(22);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, Object.keys(entries).length, true);
  endView.setUint16(10, Object.keys(entries).length, true);
  endView.setUint32(12, centralData.length, true);
  endView.setUint32(16, localData.length, true);
  return concat(localData, centralData, end);
};

const minimalDocx = zip({
  "[Content_Types].xml": `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`,
  "_rels/.rels": `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
  "word/document.xml": `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>React TypeScript frontend engineer</w:t></w:r></w:p><w:p><w:r><w:t>Built accessible products</w:t></w:r></w:p></w:body></w:document>`,
});

const minimalPdf = (text: string): Uint8Array => {
  const stream = `BT /F1 12 Tf 72 720 Td (${text}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = objects.map((object, index) => {
    const offset = pdf.length;
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    return offset;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return textEncoder.encode(pdf);
};

describe("document text extraction", () => {
  it("accepts only matching PDF and DOCX files up to 10 MiB", () => {
    expect(
      validateDocumentFile(
        fileLike("cv.PDF", "application/pdf", new Uint8Array([1])),
      ),
    ).toBe("pdf");
    expect(
      validateDocumentFile(fileLike("cv.docx", DOCX_MIME, new Uint8Array([1]))),
    ).toBe("docx");
    expect(() =>
      validateDocumentFile(
        fileLike("cv.exe", "application/pdf", new Uint8Array([1])),
      ),
    ).toThrow("Format tidak didukung");
    expect(() =>
      validateDocumentFile({
        ...fileLike("cv.pdf", "application/pdf", new Uint8Array([1])),
        size: MAX_DOCUMENT_SIZE_BYTES + 1,
      }),
    ).toThrow("10 MiB");
  });

  it("extracts raw text from a minimal real DOCX fixture", async () => {
    const text = await extractDocumentText(
      fileLike("cv.docx", DOCX_MIME, minimalDocx),
    );
    expect(text).toContain("React TypeScript frontend engineer");
    expect(text).not.toContain("<w:");
  });

  it("extracts text from a minimal real PDF fixture", async () => {
    const text = await extractDocumentText(
      fileLike(
        "cv.pdf",
        "application/pdf",
        minimalPdf("React TypeScript frontend engineer"),
      ),
    );
    expect(text).toContain("React TypeScript frontend engineer");
  });

  it("reports textless PDFs with an OCR-specific error", async () => {
    await expect(
      extractDocumentText(
        fileLike("scan.pdf", "application/pdf", minimalPdf("")),
      ),
    ).rejects.toMatchObject({
      code: "empty",
      message: expect.stringContaining("OCR"),
    });
  });

  it("reports malformed documents explicitly", async () => {
    await expect(
      extractDocumentText(
        fileLike("cv.docx", DOCX_MIME, textEncoder.encode("not a zip")),
      ),
    ).rejects.toMatchObject({ code: "malformed" });
  });
});
