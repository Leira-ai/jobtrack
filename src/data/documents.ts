import type { JobDocument } from "../types";

export const demoDocuments: readonly JobDocument[] = [
  {
    id: "document-001",
    name: "Software engineering resume",
    type: "resume",
    fileName: "resume-software-engineering.pdf",
    mimeType: "application/pdf",
    sizeBytes: 248_320,
    applicationIds: ["app-001", "app-004", "app-009", "app-012", "app-023"],
    version: 4,
    createdAt: "2026-06-01T03:00:00.000Z",
    updatedAt: "2026-08-27T06:00:00.000Z",
  },
  {
    id: "document-002",
    name: "Product and analytics resume",
    type: "resume",
    fileName: "resume-product-analytics.pdf",
    mimeType: "application/pdf",
    sizeBytes: 231_104,
    applicationIds: ["app-002", "app-008", "app-011", "app-015", "app-021"],
    version: 3,
    createdAt: "2026-06-03T03:00:00.000Z",
    updatedAt: "2026-08-19T04:30:00.000Z",
  },
  {
    id: "document-003",
    name: "General cover letter template",
    type: "cover-letter",
    fileName: "cover-letter-template.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    sizeBytes: 94_720,
    applicationIds: ["app-017", "app-018", "app-022"],
    version: 2,
    createdAt: "2026-06-04T04:00:00.000Z",
    updatedAt: "2026-08-22T02:15:00.000Z",
  },
];
