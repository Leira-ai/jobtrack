// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { JobTrackStore } from "@/store/jobtrack-store";
import { ApplicationsDashboard } from "./applications-dashboard";
import { ApplicationsProvider } from "./applications-provider";

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("ApplicationsDashboard", () => {
  it("filters applications and reports an empty result", async () => {
    const user = userEvent.setup();
    render(
      <ApplicationsProvider
        demoStore={new JobTrackStore({ storage: null })}
        mode="demo"
      >
        <ApplicationsDashboard />
      </ApplicationsProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Tabel" }));
    await user.type(
      screen.getByRole("searchbox", { name: "Cari lamaran" }),
      "perusahaan yang tidak ada",
    );

    expect(
      await screen.findByText("Tidak ada lamaran yang cocok."),
    ).toBeTruthy();
    expect(
      screen.getByText(
        (_, element) => element?.textContent === "0 lamaran aktif",
      ),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Hapus filter" })).toBeTruthy();
  });
});
