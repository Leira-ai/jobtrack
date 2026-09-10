// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StatisticsDashboard } from "./statistics-dashboard";
import { ApplicationsProvider } from "../applications/applications-provider";
import { JobTrackStore } from "@/store/jobtrack-store";

vi.mock("@/data", () => import("../../data"));
vi.mock("@/lib/stats", () => import("../../lib/stats"));
vi.mock("@/components/dashboard/ui", () => import("../dashboard/ui"));
vi.mock("@/components/dashboard/utils", () => import("../dashboard/utils"));

afterEach(cleanup);

function expectMetric(label: string, value: string) {
  const card = screen.getByText(label).closest("section");
  expect(card).not.toBeNull();
  expect(within(card as HTMLElement).getByText(value)).toBeInTheDocument();
}

describe("StatisticsDashboard", () => {
  it("updates metrics for period and source filters without rendering NaN", async () => {
    const user = userEvent.setup();
    render(
      <ApplicationsProvider
        demoStore={new JobTrackStore({ storage: null })}
        mode="demo"
      >
        <StatisticsDashboard />
      </ApplicationsProvider>,
    );

    expectMetric("Lamaran dikirim", "23");
    expect(document.body).not.toHaveTextContent("NaN");

    await user.selectOptions(screen.getByLabelText("Periode"), "3");
    await waitFor(() => expectMetric("Lamaran dikirim", "22"));

    await user.selectOptions(screen.getByLabelText("Sumber"), "Glints");
    await waitFor(() => expectMetric("Lamaran dikirim", "3"));
    expect(document.body).not.toHaveTextContent("NaN");
    expect(
      screen.getByRole("heading", { name: "Distribusi status" }),
    ).toBeInTheDocument();
  });
});
