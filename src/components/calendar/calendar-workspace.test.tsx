// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CalendarWorkspace } from "./calendar-workspace";
import { demoEvents } from "@/data";
import { createReminderAction } from "@/app/dashboard/reminder-actions";
import { createEventAction } from "@/app/dashboard/planning-actions";

vi.mock("@/data", () => import("../../data"));
vi.mock("@/lib/ics", () => import("../../lib/ics"));
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

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("CalendarWorkspace", () => {
  it("shows the selected agenda and an empty day", async () => {
    const user = userEvent.setup();
    render(<CalendarWorkspace initialEvents={demoEvents} />);

    expect(
      screen.getByRole("heading", { name: /September 2026/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("Nusantara Labs technical interview").length,
    ).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Google Meet")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Agenda bulan ini" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "11" }));
    expect(screen.getByText("Tidak ada agenda")).toBeInTheDocument();
    expect(screen.getByText("Waktu kosong untuk fokus.")).toBeInTheDocument();
  });

  it("creates an authenticated reminder only after its all-day event succeeds", async () => {
    const user = userEvent.setup();
    const createdEvent = {
      ...demoEvents[2],
      id: "1f57bc12-1f32-4cf3-b88c-c5e66f9bf31a",
      title: "Kirim jawaban offer",
      startsAt: "2026-09-14T00:00:00.000Z",
      endsAt: "2026-09-15T00:00:00.000Z",
    };
    vi.mocked(createEventAction).mockResolvedValue({
      ok: true,
      data: createdEvent,
    });
    vi.mocked(createReminderAction).mockResolvedValue({
      ok: true,
      data: {
        id: "d723ff1d-4c1a-4677-b8bb-2d0a578e8c47",
        eventId: createdEvent.id,
        title: createdEvent.title,
        remindAt: "2026-09-13T00:00:00.000Z",
        createdAt: "2026-09-09T00:00:00.000Z",
      },
    });
    render(
      <CalendarWorkspace
        mode="authenticated"
        initialEvents={[]}
        timezone="America/Los_Angeles"
        now={new Date(2026, 8, 14, 12)}
      />,
    );

    await user.click(screen.getByRole("button", { name: "14" }));
    await user.click(screen.getByRole("button", { name: "Agenda baru" }));
    await user.type(screen.getByLabelText("Judul agenda"), createdEvent.title);
    await user.click(screen.getByLabelText("Sepanjang hari"));
    await user.selectOptions(
      screen.getByLabelText("Pengingat"),
      "one-day-before",
    );
    await user.click(screen.getByRole("button", { name: "Simpan agenda" }));

    expect(createEventAction).toHaveBeenCalledWith(
      expect.objectContaining({
        startsAt: "2026-09-14T00:00:00.000Z",
        endsAt: "2026-09-15T00:00:00.000Z",
        allDay: true,
      }),
    );
    expect(createReminderAction).toHaveBeenCalledWith({
      eventId: createdEvent.id,
      remindAt: "2026-09-13T00:00:00.000Z",
    });
    expect(
      vi.mocked(createEventAction).mock.invocationCallOrder[0],
    ).toBeLessThan(vi.mocked(createReminderAction).mock.invocationCallOrder[0]);
    expect(screen.getByText("Agenda ditambahkan.")).toBeInTheDocument();
    expect(screen.getAllByText(createdEvent.title).length).toBeGreaterThan(0);
  });

  it("keeps an all-day Los Angeles event on its stored selected date when editing", async () => {
    const user = userEvent.setup();
    const allDayEvent = {
      ...demoEvents[2],
      title: "LA all-day deadline",
      startsAt: "2026-09-15T00:00:00.000Z",
      endsAt: "2026-09-16T00:00:00.000Z",
    };
    render(
      <CalendarWorkspace
        mode="authenticated"
        initialEvents={[allDayEvent]}
        timezone="America/Los_Angeles"
        now={new Date(2026, 8, 14, 12)}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /15 LA all-day deadline/ }),
    );
    expect(screen.getAllByText(allDayEvent.title).length).toBeGreaterThan(0);
    await user.click(
      screen.getByRole("button", { name: `Edit ${allDayEvent.title}` }),
    );
    expect(screen.getByLabelText("Tanggal")).toHaveValue("2026-09-15");
  });

  it("downloads the active local events as ICS and exposes Google Calendar links", async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn(() => "blob:jobtrack-agenda");
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
    render(<CalendarWorkspace initialEvents={demoEvents} />);

    const googleLink = screen.getByRole("link", { name: /Google Calendar/i });
    expect(googleLink).toHaveAttribute(
      "href",
      expect.stringMatching(
        /^https:\/\/calendar\.google\.com\/calendar\/render\?/,
      ),
    );

    await user.click(screen.getByRole("button", { name: "Unduh .ics" }));
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(anchorClick).toHaveBeenCalledOnce();
    const downloadedAnchor = anchorClick.mock.instances[0];
    expect(downloadedAnchor).toHaveAttribute("href", "blob:jobtrack-agenda");
    expect(downloadedAnchor).toHaveAttribute("download", "jobtrack-agenda.ics");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:jobtrack-agenda");
  });
});
