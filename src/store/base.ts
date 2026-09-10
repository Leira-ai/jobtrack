import { demoData } from "../data";
import type {
  ApplicationStatus,
  JobApplication,
  JobTrackData,
  StatusHistoryEntry,
} from "../types";

export const JOBTRACK_STORAGE_KEY = "jobtrack.demo.v1";
export const LEGACY_ARCHIVED_APPLICATIONS_KEY =
  "jobtrack.demo.archived-applications.v1";

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface StoreOptions {
  readonly storage?: StorageAdapter | null;
  readonly now?: () => Date;
  readonly createId?: () => string;
  readonly storageKey?: string;
}

type Listener = () => void;
type LegacyApplicationStatus = ApplicationStatus | "wishlist";
type LegacyStatusHistoryEntry = Omit<StatusHistoryEntry, "from" | "to"> & {
  readonly from: LegacyApplicationStatus | null;
  readonly to: LegacyApplicationStatus;
};
type LegacyJobApplication = Omit<
  JobApplication,
  "status" | "statusHistory" | "archivedAt"
> & {
  readonly status: LegacyApplicationStatus;
  readonly statusHistory: readonly LegacyStatusHistoryEntry[];
  readonly archivedAt?: string;
};
type LegacyJobTrackData = Omit<JobTrackData, "applications"> & {
  readonly applications: readonly LegacyJobApplication[];
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const isStoredData = (value: unknown): value is LegacyJobTrackData => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Record<keyof JobTrackData, unknown>>;
  return (
    Array.isArray(candidate.applications) &&
    Array.isArray(candidate.events) &&
    Array.isArray(candidate.tasks) &&
    Array.isArray(candidate.documents)
  );
};

const normalizeStatus = (status: LegacyApplicationStatus): ApplicationStatus =>
  status === "wishlist" ? "saved" : status;

export const migrateStoredData = (
  data: LegacyJobTrackData,
  archivedIds: readonly string[] = [],
  archivedAt: string = new Date().toISOString(),
): JobTrackData => ({
  ...data,
  applications: data.applications.map((application) => ({
    ...application,
    status: normalizeStatus(application.status),
    archivedAt:
      application.archivedAt ??
      (archivedIds.includes(application.id) ? archivedAt : undefined),
    statusHistory: application.statusHistory.map((entry) => ({
      ...entry,
      from: entry.from === null ? null : normalizeStatus(entry.from),
      to: normalizeStatus(entry.to),
    })),
  })),
});

const parseArchivedIds = (serialized: string | null): readonly string[] => {
  if (!serialized) return [];
  try {
    const parsed: unknown = JSON.parse(serialized);
    return Array.isArray(parsed) &&
      parsed.every((item) => typeof item === "string")
      ? parsed
      : [];
  } catch {
    return [];
  }
};

const browserStorage = (): StorageAdapter | null => {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
};

const defaultId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

export class JobTrackStoreBase {
  protected state: JobTrackData;
  protected readonly storage: StorageAdapter | null;
  protected readonly storageKey: string;
  protected readonly clock: () => Date;
  protected readonly idFactory: () => string;
  private readonly listeners = new Set<Listener>();

  constructor(options: StoreOptions = {}) {
    this.storage =
      options.storage === undefined ? browserStorage() : options.storage;
    this.storageKey = options.storageKey ?? JOBTRACK_STORAGE_KEY;
    this.clock = options.now ?? (() => new Date());
    this.idFactory = options.createId ?? defaultId;
    this.state = this.load();
  }

  getState = (): JobTrackData => this.state;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  reset = (): JobTrackData => {
    this.state = clone(demoData);
    this.persist();
    this.emit();
    return this.state;
  };

  exportData = (): string => JSON.stringify(this.state, null, 2);

  protected now(): string {
    return this.clock().toISOString();
  }

  protected createId(prefix: string): string {
    return `${prefix}-${this.idFactory()}`;
  }

  protected commit(nextState: JobTrackData): JobTrackData {
    this.state = nextState;
    this.persist();
    this.emit();
    return this.state;
  }

  protected required<T extends { readonly id: string }>(
    items: readonly T[],
    id: string,
    label: string,
  ): T {
    const item = items.find((candidate) => candidate.id === id);
    if (!item) throw new Error(`${label} not found: ${id}`);
    return item;
  }

  private load(): JobTrackData {
    if (!this.storage) return clone(demoData);
    try {
      const serialized = this.storage.getItem(this.storageKey);
      const archivedIds = parseArchivedIds(
        this.storage.getItem(LEGACY_ARCHIVED_APPLICATIONS_KEY),
      );
      if (!serialized) {
        if (archivedIds.length === 0) return clone(demoData);
        const migrated = migrateStoredData(
          clone(demoData),
          archivedIds,
          this.now(),
        );
        this.storage.setItem(this.storageKey, JSON.stringify(migrated));
        this.storage.removeItem(LEGACY_ARCHIVED_APPLICATIONS_KEY);
        return migrated;
      }
      const parsed: unknown = JSON.parse(serialized);
      if (!isStoredData(parsed)) return clone(demoData);
      const migrated = migrateStoredData(parsed, archivedIds, this.now());
      this.storage.setItem(this.storageKey, JSON.stringify(migrated));
      this.storage.removeItem(LEGACY_ARCHIVED_APPLICATIONS_KEY);
      return migrated;
    } catch {
      return clone(demoData);
    }
  }

  private persist(): void {
    if (!this.storage) return;
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch {
      // Persistence is best-effort (private mode, quotas, and disabled storage).
    }
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener());
  }
}
