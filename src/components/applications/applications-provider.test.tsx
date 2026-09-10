// @vitest-environment jsdom

import { act, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { demoApplications } from "@/data";
import { JobTrackStore } from "@/store/jobtrack-store";
import { ApplicationsProvider, useApplications } from "./applications-provider";

const input = {
  company: "Example Labs",
  role: "Engineer",
  location: "Jakarta",
  workMode: "remote" as const,
  employmentType: "full-time" as const,
  status: "saved" as const,
  source: "Referral",
  tags: [],
};

type ContextValue = ReturnType<typeof useApplications>;

function Capture({
  onValue,
}: {
  readonly onValue: (value: ContextValue) => void;
}) {
  const value = useApplications();
  useEffect(() => onValue(value), [onValue, value]);
  return (
    <span>
      {value.mode}:{value.applications.length}
    </span>
  );
}

describe("ApplicationsProvider", () => {
  it("keeps authenticated initial data isolated from the demo store", async () => {
    const demoStore = new JobTrackStore({ storage: null });
    const repository = {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      changeStatus: vi.fn(),
      setArchived: vi.fn(),
      delete: vi.fn(),
      addNote: vi.fn(),
      updateNote: vi.fn(),
      deleteNote: vi.fn(),
    };
    let context: ContextValue | undefined;

    render(
      <ApplicationsProvider
        initialApplications={[]}
        mode="authenticated"
        repository={repository as never}
        demoStore={demoStore}
      >
        <Capture
          onValue={(value) => {
            context = value;
          }}
        />
      </ApplicationsProvider>,
    );

    expect(screen.getByText("authenticated:0")).toBeInTheDocument();
    await expect(context?.resetDemo()).rejects.toThrow(
      "Pemulihan data hanya tersedia dalam mode demo",
    );
    expect(repository.list).not.toHaveBeenCalled();
  });

  it("runs authenticated mutations and surfaces errors without false state", async () => {
    const created = { ...demoApplications[0]!, id: "authenticated-1" };
    const note = {
      ...created.notes[0]!,
      id: "authenticated-note",
      content: "Note",
    };
    const withNote = { ...created, notes: [note] };
    const updatedNote = { ...note, content: "Updated" };
    const list = vi
      .fn()
      .mockResolvedValueOnce([withNote])
      .mockResolvedValueOnce([{ ...created, notes: [updatedNote] }])
      .mockResolvedValueOnce([created]);
    const repository = {
      list,
      create: vi.fn(async () => created),
      update: vi.fn(async () => created),
      changeStatus: vi.fn(async () => ({
        ...created,
        status: "interview" as const,
      })),
      setArchived: vi.fn(async () => ({
        ...created,
        archivedAt: "2026-09-09T00:00:00.000Z",
      })),
      delete: vi.fn(async () => undefined),
      addNote: vi.fn(async () => undefined),
      updateNote: vi.fn(async () => undefined),
      deleteNote: vi.fn(async () => undefined),
    };
    let context: ContextValue | undefined;
    render(
      <ApplicationsProvider
        mode="authenticated"
        repository={repository as never}
      >
        <Capture
          onValue={(value) => {
            context = value;
          }}
        />
      </ApplicationsProvider>,
    );

    await act(async () => {
      await context!.createApplication(input);
    });
    expect(screen.getByText("authenticated:1")).toBeInTheDocument();

    await act(async () => {
      await context!.moveApplication(created.id, "interview", "Scheduled");
      await context!.archiveApplication(created.id);
      await context!.addNote(created.id, "Note");
      await context!.updateNote(created.id, note.id, "Updated");
      await context!.deleteNote(created.id, note.id);
      await context!.deleteApplication(created.id);
    });
    expect(repository.changeStatus).toHaveBeenCalled();
    expect(repository.setArchived).toHaveBeenCalled();
    expect(repository.addNote).toHaveBeenCalled();
    expect(repository.delete).toHaveBeenCalled();
    expect(screen.getByText("authenticated:0")).toBeInTheDocument();

    repository.create.mockRejectedValueOnce(new Error("Create failed"));
    await act(async () => {
      await expect(context!.createApplication(input)).rejects.toThrow(
        "Create failed",
      );
    });
    await waitFor(() => expect(context?.error).toBe("Create failed"));
    expect(screen.getByText("authenticated:0")).toBeInTheDocument();
  });

  it("uses the synchronous local store only in demo mode", async () => {
    const demoStore = new JobTrackStore({ storage: null });
    let context: ContextValue | undefined;
    render(
      <ApplicationsProvider mode="demo" demoStore={demoStore}>
        <Capture
          onValue={(value) => {
            context = value;
          }}
        />
      </ApplicationsProvider>,
    );

    await waitFor(() =>
      expect(context?.applications.length).toBeGreaterThan(0),
    );
    const count = context!.applications.length;
    await act(async () => {
      await context!.createApplication(input);
    });
    expect(context!.applications).toHaveLength(count + 1);
    await act(async () => {
      await context!.resetDemo();
    });
    expect(context!.applications).toHaveLength(demoApplications.length);
  });
});
