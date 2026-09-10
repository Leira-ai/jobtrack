// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TaskWorkspace } from "./task-workspace";
import { demoTasks } from "@/data";
import { createReminderAction } from "@/app/dashboard/reminder-actions";
import { createTaskAction } from "@/app/dashboard/planning-actions";

vi.mock("@/data", () => import("../../data"));
vi.mock("@/components/dashboard/ui", () => import("../dashboard/ui"));
vi.mock("@/components/dashboard/utils", () => import("../dashboard/utils"));
vi.mock("@/app/dashboard/planning-actions", () => ({
  createEventAction: vi.fn(),
  createTaskAction: vi.fn(),
  deleteEventAction: vi.fn(),
  deleteTaskAction: vi.fn(),
  updateEventAction: vi.fn(),
  updateTaskAction: vi.fn(),
}));
vi.mock("@/app/dashboard/reminder-actions", () => ({
  createReminderAction: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

function taskCount(label: string) {
  const labelElement = screen
    .getAllByText(label)
    .find((element) => element.tagName === "P");
  const card = labelElement?.closest("section");
  expect(card).not.toBeNull();
  return within(card as HTMLElement);
}

describe("TaskWorkspace", () => {
  it("creates, completes, and filters a task", async () => {
    const user = userEvent.setup();
    render(<TaskWorkspace initialTasks={demoTasks} />);

    expect(taskCount("Semua tugas").getByText("9")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Tugas baru" }));
    await user.type(
      screen.getByLabelText("Judul tugas"),
      "Kirim ucapan terima kasih",
    );
    await user.selectOptions(screen.getByLabelText("Prioritas"), "high");
    await user.click(screen.getByRole("button", { name: "Simpan tugas" }));

    expect(screen.getByText("Tugas baru ditambahkan.")).toBeInTheDocument();
    expect(screen.getByText("Kirim ucapan terima kasih")).toBeInTheDocument();
    expect(taskCount("Semua tugas").getByText("10")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Selesaikan Kirim ucapan terima kasih",
      }),
    );
    expect(taskCount("Selesai").getByText("3")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Selesai" }));
    expect(screen.getByText("Kirim ucapan terima kasih")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Aktif" }));
    expect(
      screen.queryByText("Kirim ucapan terima kasih"),
    ).not.toBeInTheDocument();
  }, 15_000);

  it("creates an authenticated reminder only after its task succeeds", async () => {
    const user = userEvent.setup();
    const task = {
      ...demoTasks[0],
      id: "45f21949-b26a-45cc-8d8f-c8f8cbe042a6",
      title: "Siapkan portfolio",
      dueAt: "2026-09-20T19:00:00.000Z",
    };
    vi.mocked(createTaskAction).mockResolvedValue({ ok: true, data: task });
    vi.mocked(createReminderAction).mockResolvedValue({
      ok: true,
      data: {
        id: "7861351c-f22a-4f18-a130-d8b2c6df211e",
        taskId: task.id,
        title: task.title,
        remindAt: "2026-09-20T18:00:00.000Z",
        createdAt: "2026-09-09T00:00:00.000Z",
      },
    });
    render(
      <TaskWorkspace
        mode="authenticated"
        initialTasks={[]}
        timezone="America/Los_Angeles"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Tugas baru" }));
    await user.type(screen.getByLabelText("Judul tugas"), task.title);
    await user.type(screen.getByLabelText("Tenggat"), "2026-09-20");
    await user.selectOptions(
      screen.getByLabelText("Pengingat"),
      "one-hour-before",
    );
    await user.click(screen.getByRole("button", { name: "Simpan tugas" }));

    expect(createTaskAction).toHaveBeenCalledWith(
      expect.objectContaining({ dueAt: "2026-09-20T19:00:00.000Z" }),
    );
    expect(createReminderAction).toHaveBeenCalledWith({
      taskId: task.id,
      remindAt: "2026-09-20T18:00:00.000Z",
    });
    expect(
      vi.mocked(createTaskAction).mock.invocationCallOrder[0],
    ).toBeLessThan(vi.mocked(createReminderAction).mock.invocationCallOrder[0]);
    expect(screen.getByText("Tugas baru ditambahkan.")).toBeInTheDocument();
  });
});
