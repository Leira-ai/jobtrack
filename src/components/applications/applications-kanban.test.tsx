// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { demoApplications } from "@/data";
import { ApplicationsKanban } from "./applications-kanban";
import { ApplicationsTable } from "./applications-table";

afterEach(cleanup);

describe("ApplicationsKanban", () => {
  it("offers an accessible status select as an alternative to dragging", async () => {
    const user = userEvent.setup();
    const application = demoApplications[0]!;
    const onMove = vi.fn();

    render(
      <ApplicationsKanban
        applications={[application]}
        onMove={onMove}
        statuses={[application.status, "offer"]}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: `Seret lamaran ${application.role} di ${application.company}`,
      }),
    ).toBeTruthy();
    const statusSelect = screen.getByRole("combobox", {
      name: `Pindahkan ${application.role} ke status`,
    });
    await user.selectOptions(statusSelect, "offer");

    expect(onMove).toHaveBeenCalledWith(application.id, "offer");
  });
});

describe("ApplicationsTable", () => {
  it("shows a concise empty state", () => {
    render(<ApplicationsTable applications={[]} onMove={() => undefined} />);

    expect(screen.getByText("Tidak ada lamaran yang cocok.")).toBeTruthy();
    expect(
      screen.getByText("Hapus filter atau tambahkan lamaran baru."),
    ).toBeTruthy();
  });
});
