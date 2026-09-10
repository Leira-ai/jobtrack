import { isSubmittedStatus } from "../components/applications/application-config";
import type {
  ApplicationNote,
  ApplicationPatch,
  ApplicationStatus,
  DocumentPatch,
  EventPatch,
  JobApplication,
  JobDocument,
  JobTask,
  NewApplication,
  NewDocument,
  NewEvent,
  NewTask,
  StatusHistoryEntry,
  TaskPatch,
  CalendarEvent,
} from "../types";
import { JobTrackStoreBase, type StoreOptions } from "./base";

export class JobTrackStore extends JobTrackStoreBase {
  constructor(options: StoreOptions = {}) {
    super(options);
  }

  addApplication(input: NewApplication): JobApplication {
    const timestamp = this.now();
    const application: JobApplication = {
      ...input,
      appliedAt:
        isSubmittedStatus(input.status) && !input.appliedAt
          ? timestamp
          : input.appliedAt,
      id: this.createId("app"),
      notes: input.notes ?? [],
      statusHistory: [
        {
          id: this.createId("history"),
          from: null,
          to: input.status,
          changedAt: timestamp,
          reason: "Application created",
        },
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.commit({
      ...this.state,
      applications: [...this.state.applications, application],
    });
    return application;
  }

  updateApplication(id: string, patch: ApplicationPatch): JobApplication {
    const current = this.required(this.state.applications, id, "Application");
    const safePatch = { ...patch };
    delete safePatch.status;
    const updated: JobApplication = {
      ...current,
      ...safePatch,
      id,
      updatedAt: this.now(),
    };
    this.commit({
      ...this.state,
      applications: this.state.applications.map((application) =>
        application.id === id ? updated : application,
      ),
    });
    return updated;
  }

  deleteApplication(id: string): void {
    this.required(this.state.applications, id, "Application");
    this.commit({
      applications: this.state.applications.filter(
        (application) => application.id !== id,
      ),
      events: this.state.events.map((event) =>
        event.applicationId === id
          ? { ...event, applicationId: undefined }
          : event,
      ),
      tasks: this.state.tasks.map((task) =>
        task.applicationId === id
          ? { ...task, applicationId: undefined }
          : task,
      ),
      documents: this.state.documents.map((document) => ({
        ...document,
        applicationIds: document.applicationIds.filter(
          (applicationId) => applicationId !== id,
        ),
      })),
    });
  }

  changeApplicationStatus(
    id: string,
    status: ApplicationStatus,
    reason?: string,
  ): JobApplication {
    const current = this.required(this.state.applications, id, "Application");
    if (current.status === status) return current;
    const timestamp = this.now();
    const historyEntry: StatusHistoryEntry = {
      id: this.createId("history"),
      from: current.status,
      to: status,
      changedAt: timestamp,
      reason,
    };
    const updated: JobApplication = {
      ...current,
      status,
      appliedAt:
        isSubmittedStatus(status) && !current.appliedAt
          ? timestamp
          : current.appliedAt,
      statusHistory: [...current.statusHistory, historyEntry],
      updatedAt: timestamp,
    };
    this.commit({
      ...this.state,
      applications: this.state.applications.map((application) =>
        application.id === id ? updated : application,
      ),
    });
    return updated;
  }

  archiveApplication(id: string): JobApplication {
    const current = this.required(this.state.applications, id, "Application");
    if (current.archivedAt) return current;
    return this.updateApplication(id, { archivedAt: this.now() });
  }

  restoreApplication(id: string): JobApplication {
    const current = this.required(this.state.applications, id, "Application");
    if (!current.archivedAt) return current;
    return this.updateApplication(id, { archivedAt: undefined });
  }

  addApplicationNote(applicationId: string, content: string): ApplicationNote {
    const current = this.required(
      this.state.applications,
      applicationId,
      "Application",
    );
    const normalized = content.trim();
    if (!normalized) throw new Error("Note content cannot be empty");
    const timestamp = this.now();
    const note: ApplicationNote = {
      id: this.createId("note"),
      content: normalized,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const updated = {
      ...current,
      notes: [...current.notes, note],
      updatedAt: timestamp,
    };
    this.commit({
      ...this.state,
      applications: this.state.applications.map((application) =>
        application.id === applicationId ? updated : application,
      ),
    });
    return note;
  }

  updateApplicationNote(
    applicationId: string,
    noteId: string,
    content: string,
  ): ApplicationNote {
    const current = this.required(
      this.state.applications,
      applicationId,
      "Application",
    );
    const existing = this.required(current.notes, noteId, "Note");
    const normalized = content.trim();
    if (!normalized) throw new Error("Note content cannot be empty");
    const updatedNote = {
      ...existing,
      content: normalized,
      updatedAt: this.now(),
    };
    const updated = {
      ...current,
      notes: current.notes.map((note) =>
        note.id === noteId ? updatedNote : note,
      ),
      updatedAt: updatedNote.updatedAt,
    };
    this.commit({
      ...this.state,
      applications: this.state.applications.map((application) =>
        application.id === applicationId ? updated : application,
      ),
    });
    return updatedNote;
  }

  deleteApplicationNote(applicationId: string, noteId: string): void {
    const current = this.required(
      this.state.applications,
      applicationId,
      "Application",
    );
    this.required(current.notes, noteId, "Note");
    const updated = {
      ...current,
      notes: current.notes.filter((note) => note.id !== noteId),
      updatedAt: this.now(),
    };
    this.commit({
      ...this.state,
      applications: this.state.applications.map((application) =>
        application.id === applicationId ? updated : application,
      ),
    });
  }

  addEvent(input: NewEvent): CalendarEvent {
    this.assertApplicationReference(input.applicationId);
    const timestamp = this.now();
    const event: CalendarEvent = {
      ...input,
      id: this.createId("event"),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.commit({ ...this.state, events: [...this.state.events, event] });
    return event;
  }

  updateEvent(id: string, patch: EventPatch): CalendarEvent {
    const current = this.required(this.state.events, id, "Event");
    this.assertApplicationReference(patch.applicationId);
    const updated = { ...current, ...patch, id, updatedAt: this.now() };
    this.commit({
      ...this.state,
      events: this.state.events.map((event) =>
        event.id === id ? updated : event,
      ),
    });
    return updated;
  }

  deleteEvent(id: string): void {
    this.required(this.state.events, id, "Event");
    this.commit({
      ...this.state,
      events: this.state.events.filter((event) => event.id !== id),
    });
  }

  addTask(input: NewTask): JobTask {
    this.assertApplicationReference(input.applicationId);
    const timestamp = this.now();
    const task: JobTask = {
      ...input,
      id: this.createId("task"),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.commit({ ...this.state, tasks: [...this.state.tasks, task] });
    return task;
  }

  updateTask(id: string, patch: TaskPatch): JobTask {
    const current = this.required(this.state.tasks, id, "Task");
    this.assertApplicationReference(patch.applicationId);
    const updated = { ...current, ...patch, id, updatedAt: this.now() };
    this.commit({
      ...this.state,
      tasks: this.state.tasks.map((task) => (task.id === id ? updated : task)),
    });
    return updated;
  }

  deleteTask(id: string): void {
    this.required(this.state.tasks, id, "Task");
    this.commit({
      ...this.state,
      tasks: this.state.tasks.filter((task) => task.id !== id),
    });
  }

  addDocument(input: NewDocument): JobDocument {
    input.applicationIds.forEach((id) => this.assertApplicationReference(id));
    const timestamp = this.now();
    const document: JobDocument = {
      ...input,
      id: this.createId("document"),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.commit({
      ...this.state,
      documents: [...this.state.documents, document],
    });
    return document;
  }

  updateDocument(id: string, patch: DocumentPatch): JobDocument {
    const current = this.required(this.state.documents, id, "Document");
    patch.applicationIds?.forEach((applicationId) =>
      this.assertApplicationReference(applicationId),
    );
    const updated = { ...current, ...patch, id, updatedAt: this.now() };
    this.commit({
      ...this.state,
      documents: this.state.documents.map((document) =>
        document.id === id ? updated : document,
      ),
    });
    return updated;
  }

  deleteDocument(id: string): void {
    this.required(this.state.documents, id, "Document");
    this.commit({
      ...this.state,
      documents: this.state.documents.filter((document) => document.id !== id),
    });
  }

  private assertApplicationReference(applicationId: string | undefined): void {
    if (applicationId)
      this.required(this.state.applications, applicationId, "Application");
  }
}

export const jobTrackStore = new JobTrackStore();
