import { describe, expect, it } from "vitest";
import { JobTrackStore } from "./jobtrack-store";
import { JOBTRACK_STORAGE_KEY, LEGACY_ARCHIVED_APPLICATIONS_KEY } from "./base";
import { MemoryStorage } from "../test";

const fixedNow = () => new Date("2026-09-08T12:00:00.000Z");
const ids = (() => {
  let value = 0;
  return () => String(++value);
})();

describe("JobTrackStore", () => {
  it("persists CRUD changes and status history to storage", () => {
    const storage = new MemoryStorage();
    const store = new JobTrackStore({ storage, now: fixedNow, createId: ids });
    const added = store.addApplication({
      company: "Fiction Co",
      role: "Engineer",
      location: "Remote",
      workMode: "remote",
      employmentType: "full-time",
      status: "saved",
      source: "Direct",
      tags: [],
    });
    store.changeApplicationStatus(added.id, "applied", "Submitted online");
    const note = store.addApplicationNote(added.id, "Follow up next week");
    store.updateApplicationNote(added.id, note.id, "Follow up Friday");

    const persisted = new JobTrackStore({
      storage,
      now: fixedNow,
      createId: ids,
    });
    const restored = persisted
      .getState()
      .applications.find((application) => application.id === added.id);
    expect(restored?.status).toBe("applied");
    expect(restored?.appliedAt).toBe("2026-09-08T12:00:00.000Z");
    expect(restored?.statusHistory.at(-1)).toMatchObject({
      from: "saved",
      to: "applied",
      reason: "Submitted online",
    });
    expect(restored?.notes[0]?.content).toBe("Follow up Friday");
    expect(storage.getItem(JOBTRACK_STORAGE_KEY)).not.toBeNull();
  });

  it("sets appliedAt only on first submission and persists archive state", () => {
    const storage = new MemoryStorage();
    const store = new JobTrackStore({ storage, now: fixedNow, createId: ids });
    const added = store.addApplication({
      company: "Fiction Co",
      role: "Engineer",
      location: "Remote",
      workMode: "remote",
      employmentType: "full-time",
      status: "preparing",
      source: "Direct",
      tags: [],
    });

    expect(added.appliedAt).toBeUndefined();
    const submitted = store.changeApplicationStatus(added.id, "technical_test");
    expect(submitted.appliedAt).toBe("2026-09-08T12:00:00.000Z");
    const movedBack = store.changeApplicationStatus(added.id, "saved");
    expect(movedBack.appliedAt).toBe(submitted.appliedAt);
    expect(store.archiveApplication(added.id).archivedAt).toBe(
      "2026-09-08T12:00:00.000Z",
    );

    const persisted = new JobTrackStore({ storage, now: fixedNow });
    expect(
      persisted.getState().applications.find((item) => item.id === added.id)
        ?.archivedAt,
    ).toBe("2026-09-08T12:00:00.000Z");
    expect(persisted.restoreApplication(added.id).archivedAt).toBeUndefined();
  });

  it("migrates wishlist statuses, history, and legacy archive IDs without loss", () => {
    const storage = new MemoryStorage();
    const legacy = {
      applications: [
        {
          ...new JobTrackStore({ storage: null }).getState().applications[0],
          id: "legacy-app",
          status: "wishlist",
          appliedAt: undefined,
          statusHistory: [
            {
              id: "legacy-history",
              from: null,
              to: "wishlist",
              changedAt: "2026-08-01T00:00:00.000Z",
            },
            {
              id: "legacy-history-2",
              from: "wishlist",
              to: "applied",
              changedAt: "2026-08-02T00:00:00.000Z",
            },
            {
              id: "legacy-history-3",
              from: "applied",
              to: "wishlist",
              changedAt: "2026-08-03T00:00:00.000Z",
            },
          ],
        },
      ],
      events: [],
      tasks: [],
      documents: [],
    };
    storage.setItem(JOBTRACK_STORAGE_KEY, JSON.stringify(legacy));
    storage.setItem(
      LEGACY_ARCHIVED_APPLICATIONS_KEY,
      JSON.stringify(["legacy-app"]),
    );

    const migrated = new JobTrackStore({ storage, now: fixedNow }).getState()
      .applications[0];
    expect(migrated?.status).toBe("saved");
    expect(
      migrated?.statusHistory.map(({ from, to }) => ({ from, to })),
    ).toEqual([
      { from: null, to: "saved" },
      { from: "saved", to: "applied" },
      { from: "applied", to: "saved" },
    ]);
    expect(migrated?.archivedAt).toBe("2026-09-08T12:00:00.000Z");
    expect(storage.getItem(LEGACY_ARCHIVED_APPLICATIONS_KEY)).toBeNull();
  });

  it("removes dangling application references and resets demo data", () => {
    const storage = new MemoryStorage();
    const store = new JobTrackStore({ storage, now: fixedNow, createId: ids });
    store.deleteApplication("app-001");
    expect(
      store.getState().events.find((event) => event.id === "event-001")
        ?.applicationId,
    ).toBeUndefined();
    expect(store.getState().documents[0]?.applicationIds).not.toContain(
      "app-001",
    );
    store.reset();
    expect(
      store
        .getState()
        .applications.some((application) => application.id === "app-001"),
    ).toBe(true);
    expect(store.getState().applications.length).toBeGreaterThanOrEqual(20);
  });

  it("recovers from invalid stored JSON", () => {
    const storage = new MemoryStorage();
    storage.setItem(JOBTRACK_STORAGE_KEY, "not-json");
    expect(
      new JobTrackStore({ storage }).getState().applications.length,
    ).toBeGreaterThanOrEqual(20);
  });
});
