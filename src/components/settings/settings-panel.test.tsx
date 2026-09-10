// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LEGACY_ARCHIVED_APPLICATIONS_KEY } from "@/store/base";
import { jobTrackStore } from "@/store/jobtrack-store";
import { SettingsPanel } from "./settings-panel";

const signInWithPassword = vi.fn();
const signOut = vi.fn();
const routerReplace = vi.fn();
const routerRefresh = vi.fn();
const updateProfile = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplace, refresh: routerRefresh }),
}));

vi.mock("@/app/dashboard/pengaturan/actions", () => ({
  updateProfile: (...args: unknown[]) => updateProfile(...args),
}));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { signInWithPassword, signOut },
  }),
}));
vi.mock("@/components/dashboard/ui", () => import("../dashboard/ui"));
vi.mock("@/components/dashboard/utils", () => import("../dashboard/utils"));

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});

describe("SettingsPanel", () => {
  it("keeps demo deletion a no-op without a password or server calls", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<SettingsPanel mode="demo" />);

    await user.click(screen.getByRole("button", { name: "Hapus akun" }));
    const confirmationButton = screen.getByRole("button", {
      name: "Konfirmasi hapus",
    });
    expect(
      screen.queryByLabelText("Kata sandi saat ini"),
    ).not.toBeInTheDocument();
    expect(confirmationButton).toBeDisabled();

    await user.type(
      screen.getByPlaceholderText("HAPUS AKUN SAYA"),
      "HAPUS AKUN SAYA",
    );
    await user.click(confirmationButton);

    expect(signInWithPassword).not.toHaveBeenCalled();
    expect(updateProfile).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Mode demo: tidak ada akun atau data server yang dihapus.",
    );
  });

  it("exports the current mutated demo store", async () => {
    const user = userEvent.setup();
    const exportSpy = vi
      .spyOn(jobTrackStore, "exportData")
      .mockReturnValue('{"mutated":true}');
    const createObjectURL = vi.fn(() => "blob:jobtrack-export");
    const revokeObjectURL = vi.fn();
    const anchorClick = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });
    render(<SettingsPanel mode="demo" />);

    await user.click(screen.getByRole("button", { name: /Ekspor data/ }));

    expect(exportSpy).toHaveBeenCalledOnce();
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(anchorClick.mock.instances[0]).toHaveAttribute(
      "download",
      "jobtrack-demo-export.json",
    );
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:jobtrack-export");
  });

  it("resets demo data, archive migration state, and preferences", async () => {
    const user = userEvent.setup();
    const resetSpy = vi.spyOn(jobTrackStore, "reset");
    localStorage.setItem(LEGACY_ARCHIVED_APPLICATIONS_KEY, '["application-1"]');
    localStorage.setItem("jobtrack-theme", "dark");
    render(<SettingsPanel mode="demo" />);

    await user.click(
      screen.getByRole("button", { name: /Reset seluruh demo/ }),
    );

    expect(resetSpy).toHaveBeenCalled();
    expect(localStorage.getItem(LEGACY_ARCHIVED_APPLICATIONS_KEY)).toBeNull();
    expect(localStorage.getItem("jobtrack-theme")).toBeNull();
  });

  it("requires the exact phrase and current password before reauthentication", async () => {
    const user = userEvent.setup();
    render(
      <SettingsPanel
        mode="authenticated"
        profile={{
          displayName: "Alya",
          email: "alya@example.test",
          timezone: "Asia/Jakarta",
        }}
      />,
    );

    expect(screen.getByDisplayValue("alya@example.test")).toHaveAttribute(
      "readonly",
    );
    await user.click(screen.getByRole("button", { name: "Hapus akun" }));
    const confirmationButton = screen.getByRole("button", {
      name: "Konfirmasi hapus",
    });
    const passwordInput = screen.getByLabelText("Kata sandi saat ini");

    await user.type(
      screen.getByPlaceholderText("HAPUS AKUN SAYA"),
      "hAPUS AKUN SAYA",
    );
    await user.type(passwordInput, "password-value");
    expect(confirmationButton).toBeDisabled();
    expect(signInWithPassword).not.toHaveBeenCalled();

    await user.clear(screen.getByPlaceholderText("HAPUS AKUN SAYA"));
    await user.type(
      screen.getByPlaceholderText("HAPUS AKUN SAYA"),
      "HAPUS AKUN SAYA",
    );
    expect(confirmationButton).toBeEnabled();
    expect(signInWithPassword).not.toHaveBeenCalled();
  });
});
