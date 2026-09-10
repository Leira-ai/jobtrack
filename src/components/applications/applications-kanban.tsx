"use client";

import Link from "next/link";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BriefcaseBusiness,
  CalendarDays,
  GripVertical,
  MapPin,
} from "lucide-react";
import { useState } from "react";
import type { ApplicationStatus, JobApplication } from "@/types";
import {
  formatDate,
  statusLabels,
  statusOptions,
  statusStyles,
  workModeLabels,
} from "./application-config";

interface ApplicationCardProps {
  readonly application: JobApplication;
  readonly onMove: (id: string, status: ApplicationStatus) => void;
  readonly overlay?: boolean;
}

function ApplicationCard({
  application,
  onMove,
  overlay = false,
}: ApplicationCardProps) {
  const sortable = useSortable({ id: application.id, disabled: overlay });
  const style = overlay
    ? undefined
    : {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
      };
  return (
    <article
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition dark:border-slate-700 dark:bg-slate-900 ${sortable.isDragging ? "opacity-40" : "hover:border-slate-300 hover:shadow-md dark:hover:border-slate-600"} ${overlay ? "w-72 rotate-2 shadow-xl" : ""}`}
      ref={overlay ? undefined : sortable.setNodeRef}
      style={style}
    >
      <div className="flex items-start justify-between gap-3">
        <Link
          className="min-w-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
          href={`/dashboard/lamaran/${application.id}`}
        >
          <h3 className="truncate font-semibold text-slate-950 hover:text-teal-700 dark:text-white dark:hover:text-teal-400">
            {application.role}
          </h3>
          <p className="mt-0.5 truncate text-sm font-medium text-slate-600 dark:text-slate-300">
            {application.company}
          </p>
        </Link>
        {!overlay ? (
          <button
            aria-label={`Seret lamaran ${application.role} di ${application.company}`}
            className="touch-none rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            {...sortable.attributes}
            {...sortable.listeners}
            type="button"
          >
            <GripVertical aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </div>
      <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
        <p className="flex items-center gap-1.5">
          <MapPin aria-hidden="true" className="size-3.5" />
          {application.location} · {workModeLabels[application.workMode]}
        </p>
        <p className="flex items-center gap-1.5">
          <CalendarDays aria-hidden="true" className="size-3.5" />
          {application.appliedAt
            ? `Dilamar ${formatDate(application.appliedAt)}`
            : `Tersimpan ${formatDate(application.createdAt)}`}
        </p>
      </div>
      {application.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {application.tags.slice(0, 3).map((tag) => (
            <span
              className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      {!overlay ? (
        <label className="mt-4 block border-t border-slate-100 pt-3 text-xs font-medium text-slate-600 dark:border-slate-800 dark:text-slate-300">
          Pindahkan ke
          <select
            aria-label={`Pindahkan ${application.role} ke status`}
            className="mt-1 min-h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-800 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-teal-500 dark:focus:ring-teal-950"
            onChange={(event) =>
              onMove(application.id, event.target.value as ApplicationStatus)
            }
            value={application.status}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </article>
  );
}

function KanbanColumn({
  applications,
  status,
  onMove,
}: {
  readonly applications: readonly JobApplication[];
  readonly status: ApplicationStatus;
  readonly onMove: (id: string, status: ApplicationStatus) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: status });
  return (
    <section
      aria-labelledby={`column-${status}`}
      className={`w-[82vw] max-w-80 shrink-0 rounded-2xl border p-3 sm:w-80 ${isOver ? "border-teal-400 bg-teal-50/70 dark:border-teal-600 dark:bg-teal-950/40" : "border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/70"}`}
      ref={setNodeRef}
    >
      <header className="mb-3 flex items-center justify-between px-1">
        <h2
          className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white"
          id={`column-${status}`}
        >
          <span
            className={`rounded-md px-2 py-1 ring-1 ring-inset ${statusStyles[status]}`}
          >
            {statusLabels[status]}
          </span>
        </h2>
        <span
          aria-label={`${applications.length} lamaran`}
          className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300"
        >
          {applications.length}
        </span>
      </header>
      <SortableContext
        items={applications.map((application) => application.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {applications.map((application) => (
            <ApplicationCard
              application={application}
              key={application.id}
              onMove={onMove}
            />
          ))}
          {applications.length === 0 ? (
            <div className="flex min-h-28 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              <BriefcaseBusiness aria-hidden="true" className="mb-2 size-5" />
              Letakkan lamaran di sini
            </div>
          ) : null}
        </div>
      </SortableContext>
    </section>
  );
}

const announcements: Announcements = {
  onDragStart({ active }) {
    return `Mengangkat lamaran ${String(active.id)}.`;
  },
  onDragOver({ active, over }) {
    if (!over)
      return `Lamaran ${String(active.id)} tidak berada di atas kolom mana pun.`;
    return `Lamaran ${String(active.id)} berada di atas ${statusLabels[String(over.id) as ApplicationStatus] ?? "lamaran lain"}.`;
  },
  onDragEnd({ active, over }) {
    if (!over) return `Pemindahan lamaran ${String(active.id)} dibatalkan.`;
    return `Lamaran ${String(active.id)} dipindahkan.`;
  },
  onDragCancel({ active }) {
    return `Pemindahan lamaran ${String(active.id)} dibatalkan.`;
  },
};

interface ApplicationsKanbanProps {
  readonly applications: readonly JobApplication[];
  readonly statuses: readonly ApplicationStatus[];
  readonly onMove: (id: string, status: ApplicationStatus) => void;
}

export function ApplicationsKanban({
  applications,
  statuses,
  onMove,
}: ApplicationsKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const activeApplication = applications.find(
    (application) => application.id === activeId,
  );

  const getStatus = (id: string): ApplicationStatus | undefined => {
    if (
      (statusOptions as ReadonlyArray<{ value: string }>).some(
        (option) => option.value === id,
      )
    ) {
      return id as ApplicationStatus;
    }
    return applications.find((application) => application.id === id)?.status;
  };

  const handleDragEnd = ({ active, over }: DragEndEvent): void => {
    setActiveId(null);
    if (!over) return;
    const status = getStatus(String(over.id));
    if (status) onMove(String(active.id), status);
  };

  return (
    <DndContext
      id="jobtrack-applications-kanban"
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable:
            "Untuk mengambil lamaran, tekan spasi. Gunakan tombol panah untuk memindahkan, lalu tekan spasi lagi untuk meletakkan.",
        },
      }}
      collisionDetection={closestCorners}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={handleDragEnd}
      onDragStart={({ active }: DragStartEvent) =>
        setActiveId(String(active.id))
      }
      sensors={sensors}
    >
      <p className="sr-only" id="kanban-instructions">
        Seret kartu antarkolom, atau gunakan pilihan Pindahkan ke pada setiap
        kartu.
      </p>
      <div
        aria-describedby="kanban-instructions"
        className="flex snap-x gap-4 overflow-x-auto pb-4"
        role="region"
      >
        {statuses.map((status) => (
          <KanbanColumn
            applications={applications.filter(
              (application) => application.status === status,
            )}
            key={status}
            onMove={onMove}
            status={status}
          />
        ))}
      </div>
      <DragOverlay>
        {activeApplication ? (
          <ApplicationCard
            application={activeApplication}
            onMove={onMove}
            overlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
