// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DocumentLibrary } from "./document-library";

const mocks = vi.hoisted(() => ({
  getDocumentDownloadUrlAction: vi.fn(),
  deleteDocumentAction: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));
vi.mock("@/app/dashboard/dokumen/actions", () => ({
  getDocumentDownloadUrlAction: mocks.getDocumentDownloadUrlAction,
  deleteDocumentAction: mocks.deleteDocumentAction,
}));

vi.mock("@/data", () => import("../../data"));
vi.mock("@/lib/file-validation", () => import("../../lib/file-validation"));
vi.mock("@/components/dashboard/ui", () => import("../dashboard/ui"));
vi.mock("@/components/dashboard/utils", () => import("../dashboard/utils"));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("DocumentLibrary", () => {
  it("rejects an unsupported upload and keeps submission disabled", async () => {
    const user = userEvent.setup();
    const { container } = render(<DocumentLibrary />);

    await user.click(screen.getByRole("button", { name: "Unggah dokumen" }));
    const input =
      container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();
    const invalidFile = new File(["not a document"], "payload.exe", {
      type: "application/x-msdownload",
    });
    fireEvent.change(input as HTMLInputElement, {
      target: { files: [invalidFile] },
    });

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("File extension .exe is not supported.");
    expect(alert).toHaveTextContent(
      "File type application/x-msdownload is not supported.",
    );
    expect(
      screen.getByRole("button", { name: "Tambahkan ke pustaka" }),
    ).toBeDisabled();
    expect(screen.queryByText("payload.exe · valid")).not.toBeInTheDocument();
  });

  it("keeps demo upload metadata local and never calls the server", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { container } = render(
      <DocumentLibrary mode="demo" initialDocuments={[]} />,
    );

    await user.click(screen.getByRole("button", { name: "Unggah dokumen" }));
    const input =
      container.querySelector<HTMLInputElement>('input[type="file"]');
    fireEvent.change(input as HTMLInputElement, {
      target: {
        files: [
          new File(["pdf"], "private-resume.pdf", {
            type: "application/pdf",
          }),
        ],
      },
    });
    await user.click(
      screen.getByRole("button", { name: "Tambahkan ke pustaka" }),
    );

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.getByText("private resume")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("metadata demo lokal");
  });

  it("does not request a signed URL when downloading demo metadata", async () => {
    const user = userEvent.setup();
    render(
      <DocumentLibrary
        mode="demo"
        initialDocuments={[
          {
            id: "demo-document",
            name: "Demo resume",
            type: "resume",
            fileName: "resume.pdf",
            mimeType: "application/pdf",
            sizeBytes: 100,
            applicationIds: [],
            version: 1,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Unduh Demo resume" }));

    expect(mocks.getDocumentDownloadUrlAction).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("tidak ada file");
  });
});
