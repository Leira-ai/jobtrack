// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ReminderCenter } from "./reminder-center";

describe("ReminderCenter", () => {
  it("shows due reminders and persists demo read and dismiss state", async () => {
    localStorage.setItem(
      "jobtrack.demo.v1",
      JSON.stringify({
        applications: [],
        events: [],
        tasks: [
          {
            id: "task-1",
            title: "Kirim tindak lanjut",
            priority: "medium",
            status: "todo",
            dueAt: "2026-09-09T09:00:00.000Z",
            createdAt: "2026-09-08T00:00:00.000Z",
            updatedAt: "2026-09-08T00:00:00.000Z",
          },
        ],
        documents: [],
      }),
    );
    const user = userEvent.setup();
    render(
      <ReminderCenter mode="demo" now={new Date("2026-09-09T10:00:00.000Z")} />,
    );
    await waitFor(() =>
      expect(screen.getByLabelText("Lihat pengingat")).toHaveTextContent("1"),
    );
    await user.click(screen.getByRole("button", { name: "Lihat pengingat" }));
    expect(screen.getByText("Kirim tindak lanjut")).toBeInTheDocument();
    expect(screen.getByText("Sudah waktunya")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Tandai Kirim tindak lanjut sudah dibaca",
      }),
    );
    expect(localStorage.getItem("jobtrack.demo.reminders.v1")).toContain(
      "demo-task-task-1",
    );
    await user.click(
      screen.getByRole("button", { name: "Tutup Kirim tindak lanjut" }),
    );
    expect(screen.queryByText("Kirim tindak lanjut")).not.toBeInTheDocument();
  });
});
