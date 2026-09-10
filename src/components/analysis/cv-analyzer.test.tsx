// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CvAnalyzer } from "./cv-analyzer";

vi.mock("@/components/dashboard/ui", () => import("../dashboard/ui"));
vi.mock("@/components/dashboard/utils", () => import("../dashboard/utils"));

afterEach(cleanup);

describe("CvAnalyzer", () => {
  it("requires both inputs, explains results, and resets", async () => {
    const user = userEvent.setup();
    render(<CvAnalyzer />);

    const cvInput = screen.getByLabelText("Isi CV");
    const jobInput = screen.getByLabelText("Deskripsi pekerjaan");
    const analyzeButton = screen.getByRole("button", {
      name: "Analisis sekarang",
    });
    expect(analyzeButton).toBeDisabled();
    await user.type(cvInput, "Frontend engineer React TypeScript");
    expect(analyzeButton).toBeDisabled();

    await user.click(
      screen.getByRole("button", { name: "Gunakan contoh fiktif" }),
    );
    expect((cvInput as HTMLTextAreaElement).value).toContain(
      "Frontend Engineer",
    );
    expect((jobInput as HTMLTextAreaElement).value).toContain(
      "Frontend Engineer",
    );
    expect(analyzeButton).toBeEnabled();
    await user.click(analyzeButton);

    expect(screen.getByText("Skor kecocokan CV")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Rincian skor" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Istilah cocok" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Istilah belum ditemukan" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Kecocokan keahlian")).toBeInTheDocument();
    expect(
      screen.getByText(/jangan gunakan skor untuk merangking kandidat/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Mulai ulang" }));
    expect(cvInput).toHaveValue("");
    expect(jobInput).toHaveValue("");
    expect(
      screen.getByRole("heading", { name: "Hasil akan muncul di sini" }),
    ).toBeInTheDocument();
  });
});
