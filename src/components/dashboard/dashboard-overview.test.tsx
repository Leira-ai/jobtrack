// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DashboardOverview } from "./dashboard-overview";
import { ApplicationsProvider } from "../applications/applications-provider";
import { JobTrackStore } from "@/store/jobtrack-store";

vi.mock("@/data", () => import("../../data"));
vi.mock("@/lib/stats", () => import("../../lib/stats"));
vi.mock("@/components/dashboard/ui", () => import("./ui"));
vi.mock("@/components/dashboard/utils", () => import("./utils"));

afterEach(cleanup);

function expectMetric(label: string, value: string) {
  const labelElement = screen
    .getAllByText(label)
    .find((element) => element.tagName === "P");
  const card = labelElement?.closest("section");
  expect(card).not.toBeNull();
  expect(within(card as HTMLElement).getByText(value)).toBeInTheDocument();
}

describe("DashboardOverview", () => {
  it("renders the application metrics and dashboard summaries", () => {
    render(
      <ApplicationsProvider
        demoStore={new JobTrackStore({ storage: null })}
        mode="demo"
      >
        <DashboardOverview />
      </ApplicationsProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "Selamat datang kembali, Alya" }),
    ).toBeInTheDocument();
    expectMetric("Total lamaran", "25");
    expectMetric("Proses aktif", "17");
    expectMetric("Interview", "8");
    expectMetric("Offer", "2");

    expect(
      screen.getByRole("heading", { name: "Aktivitas lamaran" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Agenda terdekat" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Lamaran terbaru" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Fokus hari ini" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("Nusantara Labs technical interview").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: /Tambah lamaran/ }),
    ).toHaveAttribute("href", "/dashboard/lamaran");
  });
});
