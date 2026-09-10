"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { ApplicationsRepository } from "@/lib/applications/repository";
import type {
  DashboardMode,
  DashboardProfile,
} from "@/lib/applications/contracts";
import type { JobTrackStore } from "@/store/jobtrack-store";
import type {
  ApplicationNote,
  ApplicationPatch,
  ApplicationStatus,
  CalendarEvent,
  JobApplication,
  JobDocument,
  JobTask,
  JobTrackData,
  NewApplication,
} from "@/types";

interface ApplicationsContextValue {
  readonly mode: DashboardMode;
  readonly profile?: DashboardProfile;
  readonly applications: readonly JobApplication[];
  readonly tasks: readonly JobTask[];
  readonly events: readonly CalendarEvent[];
  readonly documents: readonly JobDocument[];
  readonly archivedIds: readonly string[];
  readonly isPending: boolean;
  readonly error: string | null;
  createApplication(input: NewApplication): Promise<JobApplication>;
  updateApplication(
    id: string,
    patch: ApplicationPatch,
  ): Promise<JobApplication>;
  moveApplication(
    id: string,
    status: ApplicationStatus,
    reason?: string,
  ): Promise<JobApplication>;
  archiveApplication(id: string): Promise<JobApplication>;
  restoreApplication(id: string): Promise<JobApplication>;
  deleteApplication(id: string): Promise<void>;
  addNote(applicationId: string, content: string): Promise<ApplicationNote>;
  updateNote(
    applicationId: string,
    noteId: string,
    content: string,
  ): Promise<ApplicationNote>;
  deleteNote(applicationId: string, noteId: string): Promise<void>;
  resetDemo(): Promise<void>;
  clearError(): void;
}

const ApplicationsContext = createContext<ApplicationsContextValue | null>(
  null,
);

const emptyRelatedData = {
  tasks: [] as readonly JobTask[],
  events: [] as readonly CalendarEvent[],
  documents: [] as readonly JobDocument[],
};

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Operasi lamaran gagal";

export interface ApplicationsProviderProps {
  readonly children: ReactNode;
  readonly mode?: DashboardMode;
  readonly profile?: DashboardProfile;
  readonly initialApplications?: readonly JobApplication[];
  readonly repository?: ApplicationsRepository;
  readonly demoStore?: JobTrackStore;
}

export function ApplicationsProvider({
  children,
  mode = "demo",
  profile,
  initialApplications = [],
  repository: providedRepository,
  demoStore: providedDemoStore,
}: ApplicationsProviderProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [demoData, setDemoData] = useState<JobTrackData | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backend, setBackend] = useState<{
    readonly repository?: ApplicationsRepository;
    readonly demoStore?: JobTrackStore;
  }>(() => ({
    repository: providedRepository,
    demoStore: providedDemoStore,
  }));

  useEffect(() => {
    if (providedRepository || providedDemoStore) return;
    let active = true;
    void (async () => {
      if (mode === "authenticated") {
        const client = createClient();
        if (!client) {
          setError("Authentication is not configured");
          return;
        }
        if (active)
          setBackend({ repository: new ApplicationsRepository(client) });
        return;
      }
      const { jobTrackStore } = await import("@/store/jobtrack-store");
      if (active) setBackend({ demoStore: jobTrackStore });
    })();
    return () => {
      active = false;
    };
  }, [mode, providedDemoStore, providedRepository]);

  useEffect(() => {
    if (mode !== "demo" || !backend.demoStore) return;
    const update = (): void => setDemoData(backend.demoStore!.getState());
    update();
    return backend.demoStore.subscribe(update);
  }, [backend.demoStore, mode]);

  const runMutation = useCallback(
    async <T,>(operation: () => Promise<T> | T): Promise<T> => {
      setIsPending(true);
      setError(null);
      try {
        return await operation();
      } catch (caught) {
        const nextError = toErrorMessage(caught);
        setError(nextError);
        throw caught instanceof Error ? caught : new Error(nextError);
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  const reload = useCallback(async (): Promise<readonly JobApplication[]> => {
    if (!backend.repository) throw new Error("Backend lamaran belum siap");
    const next = await backend.repository.list();
    setApplications(next);
    return next;
  }, [backend.repository]);

  const replaceApplication = useCallback((next: JobApplication): void => {
    setApplications((current) =>
      current.some((item) => item.id === next.id)
        ? current.map((item) => (item.id === next.id ? next : item))
        : [next, ...current],
    );
  }, []);

  const createApplication = useCallback(
    (input: NewApplication): Promise<JobApplication> =>
      runMutation(async () => {
        if (mode === "demo") {
          if (!backend.demoStore) throw new Error("Data demo belum siap");
          return backend.demoStore.addApplication(input);
        }
        if (!backend.repository) throw new Error("Backend lamaran belum siap");
        const created = await backend.repository.create(input);
        replaceApplication(created);
        return created;
      }),
    [
      backend.demoStore,
      backend.repository,
      mode,
      replaceApplication,
      runMutation,
    ],
  );

  const updateApplication = useCallback(
    (id: string, patch: ApplicationPatch): Promise<JobApplication> =>
      runMutation(async () => {
        if (mode === "demo") {
          if (!backend.demoStore) throw new Error("Data demo belum siap");
          const updated = backend.demoStore.updateApplication(id, patch);
          return patch.status
            ? backend.demoStore.changeApplicationStatus(
                id,
                patch.status,
                "Detail lamaran diperbarui",
              )
            : updated;
        }
        if (!backend.repository) throw new Error("Backend lamaran belum siap");
        const updated = await backend.repository.update(id, patch);
        replaceApplication(updated);
        return updated;
      }),
    [
      backend.demoStore,
      backend.repository,
      mode,
      replaceApplication,
      runMutation,
    ],
  );

  const moveApplication = useCallback(
    (
      id: string,
      status: ApplicationStatus,
      reason?: string,
    ): Promise<JobApplication> =>
      runMutation(async () => {
        if (mode === "demo") {
          if (!backend.demoStore) throw new Error("Data demo belum siap");
          return backend.demoStore.changeApplicationStatus(id, status, reason);
        }
        if (!backend.repository) throw new Error("Backend lamaran belum siap");
        const updated = await backend.repository.changeStatus(
          id,
          status,
          reason,
        );
        replaceApplication(updated);
        return updated;
      }),
    [
      backend.demoStore,
      backend.repository,
      mode,
      replaceApplication,
      runMutation,
    ],
  );

  const setArchived = useCallback(
    (id: string, archived: boolean): Promise<JobApplication> =>
      runMutation(async () => {
        if (mode === "demo") {
          if (!backend.demoStore) throw new Error("Data demo belum siap");
          return archived
            ? backend.demoStore.archiveApplication(id)
            : backend.demoStore.restoreApplication(id);
        }
        if (!backend.repository) throw new Error("Backend lamaran belum siap");
        const updated = await backend.repository.setArchived(id, archived);
        replaceApplication(updated);
        return updated;
      }),
    [
      backend.demoStore,
      backend.repository,
      mode,
      replaceApplication,
      runMutation,
    ],
  );

  const deleteApplication = useCallback(
    (id: string): Promise<void> =>
      runMutation(async () => {
        if (mode === "demo") {
          if (!backend.demoStore) throw new Error("Data demo belum siap");
          backend.demoStore.deleteApplication(id);
          return;
        }
        if (!backend.repository) throw new Error("Backend lamaran belum siap");
        await backend.repository.delete(id);
        setApplications((current) => current.filter((item) => item.id !== id));
      }),
    [backend.demoStore, backend.repository, mode, runMutation],
  );

  const addNote = useCallback(
    (applicationId: string, content: string): Promise<ApplicationNote> =>
      runMutation(async () => {
        if (mode === "demo") {
          if (!backend.demoStore) throw new Error("Data demo belum siap");
          return backend.demoStore.addApplicationNote(applicationId, content);
        }
        if (!backend.repository) throw new Error("Backend lamaran belum siap");
        await backend.repository.addNote(applicationId, content);
        const next = await reload();
        const note = next
          .find((item) => item.id === applicationId)
          ?.notes.toReversed()
          .find((item) => item.content === content.trim());
        if (!note)
          throw new Error("Catatan tersimpan tetapi belum dapat dimuat");
        return note;
      }),
    [backend.demoStore, backend.repository, mode, reload, runMutation],
  );

  const updateNote = useCallback(
    (
      applicationId: string,
      noteId: string,
      content: string,
    ): Promise<ApplicationNote> =>
      runMutation(async () => {
        if (mode === "demo") {
          if (!backend.demoStore) throw new Error("Data demo belum siap");
          return backend.demoStore.updateApplicationNote(
            applicationId,
            noteId,
            content,
          );
        }
        if (!backend.repository) throw new Error("Backend lamaran belum siap");
        await backend.repository.updateNote(applicationId, noteId, content);
        const next = await reload();
        const note = next
          .find((item) => item.id === applicationId)
          ?.notes.find((item) => item.id === noteId);
        if (!note)
          throw new Error("Catatan tersimpan tetapi belum dapat dimuat");
        return note;
      }),
    [backend.demoStore, backend.repository, mode, reload, runMutation],
  );

  const deleteNote = useCallback(
    (applicationId: string, noteId: string): Promise<void> =>
      runMutation(async () => {
        if (mode === "demo") {
          if (!backend.demoStore) throw new Error("Data demo belum siap");
          backend.demoStore.deleteApplicationNote(applicationId, noteId);
          return;
        }
        if (!backend.repository) throw new Error("Backend lamaran belum siap");
        await backend.repository.deleteNote(applicationId, noteId);
        await reload();
      }),
    [backend.demoStore, backend.repository, mode, reload, runMutation],
  );

  const resetDemo = useCallback(
    (): Promise<void> =>
      runMutation(() => {
        if (mode !== "demo" || !backend.demoStore) {
          throw new Error("Pemulihan data hanya tersedia dalam mode demo");
        }
        backend.demoStore.reset();
      }),
    [backend.demoStore, mode, runMutation],
  );

  const visibleApplications = useMemo(
    () => (mode === "demo" ? (demoData?.applications ?? []) : applications),
    [applications, demoData?.applications, mode],
  );
  const relatedData = mode === "demo" && demoData ? demoData : emptyRelatedData;
  const archivedIds = useMemo(
    () =>
      visibleApplications
        .filter((application) => application.archivedAt)
        .map((application) => application.id),
    [visibleApplications],
  );

  const value = useMemo<ApplicationsContextValue>(
    () => ({
      mode,
      profile,
      applications: visibleApplications,
      tasks: relatedData.tasks,
      events: relatedData.events,
      documents: relatedData.documents,
      archivedIds,
      isPending,
      error,
      createApplication,
      updateApplication,
      moveApplication,
      archiveApplication: (id) => setArchived(id, true),
      restoreApplication: (id) => setArchived(id, false),
      deleteApplication,
      addNote,
      updateNote,
      deleteNote,
      resetDemo,
      clearError: () => setError(null),
    }),
    [
      addNote,
      archivedIds,
      createApplication,
      deleteApplication,
      deleteNote,
      error,
      isPending,
      mode,
      moveApplication,
      profile,
      relatedData.documents,
      relatedData.events,
      relatedData.tasks,
      resetDemo,
      setArchived,
      updateApplication,
      updateNote,
      visibleApplications,
    ],
  );

  return (
    <ApplicationsContext.Provider value={value}>
      {children}
    </ApplicationsContext.Provider>
  );
}

export function useApplications(): ApplicationsContextValue {
  const value = useContext(ApplicationsContext);
  if (!value) {
    throw new Error("useApplications must be used inside ApplicationsProvider");
  }
  return value;
}
