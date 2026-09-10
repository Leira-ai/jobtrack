"use client";

import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import type { ApplicationStatus, JobApplication } from "@/types";
import {
  formatDate,
  formatSalary,
  statusOptions,
  statusStyles,
  workModeLabels,
} from "./application-config";

interface ApplicationsTableProps {
  readonly applications: readonly JobApplication[];
  readonly onMove: (id: string, status: ApplicationStatus) => void;
}

export function ApplicationsTable({
  applications,
  onMove,
}: ApplicationsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "updatedAt", desc: true },
  ]);
  const columns = useMemo<ColumnDef<JobApplication>[]>(
    () => [
      {
        accessorKey: "role",
        header: "Posisi",
        cell: ({ row }) => (
          <div className="min-w-48">
            <Link
              className="inline-flex items-center gap-1 rounded-sm font-semibold text-slate-950 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:text-white dark:hover:text-teal-400"
              href={`/dashboard/lamaran/${row.original.id}`}
            >
              {row.original.role}
              <ExternalLink aria-hidden="true" className="size-3" />
            </Link>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {row.original.company}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "location",
        header: "Lokasi",
        cell: ({ row }) => (
          <span>
            {row.original.location} · {workModeLabels[row.original.workMode]}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <select
            aria-label={`Pindahkan ${row.original.role} ke status`}
            className={`min-h-9 rounded-lg px-2 text-xs font-semibold outline-none ring-1 ring-inset focus:ring-2 focus:ring-teal-500 ${statusStyles[row.original.status]}`}
            onChange={(event) =>
              onMove(row.original.id, event.target.value as ApplicationStatus)
            }
            value={row.original.status}
          >
            {statusOptions.map((option) => (
              <option
                className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        ),
      },
      {
        accessorKey: "appliedAt",
        header: "Tanggal dilamar",
        cell: ({ row }) =>
          row.original.appliedAt
            ? formatDate(row.original.appliedAt)
            : "Belum dilamar",
      },
      {
        id: "salary",
        header: "Gaji",
        accessorFn: (row) => row.salary?.min ?? -1,
        cell: ({ row }) => formatSalary(row.original.salary),
      },
      { accessorKey: "source", header: "Sumber" },
      {
        accessorKey: "updatedAt",
        header: "Diperbarui",
        cell: ({ row }) => formatDate(row.original.updatedAt),
      },
    ],
    [onMove],
  );
  // TanStack Table intentionally returns functions that React Compiler cannot memoize safely.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: [...applications],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">
            Daftar lamaran kerja. Aktifkan judul kolom untuk mengurutkan.
          </caption>
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      className="whitespace-nowrap border-b border-slate-200 px-4 py-3 font-semibold dark:border-slate-700"
                      key={header.id}
                      scope="col"
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          className="inline-flex items-center gap-1 rounded-sm hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:hover:text-white"
                          onClick={header.column.getToggleSortingHandler()}
                          type="button"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {sorted === "asc" ? (
                            <ArrowUp aria-hidden="true" className="size-3.5" />
                          ) : sorted === "desc" ? (
                            <ArrowDown
                              aria-hidden="true"
                              className="size-3.5"
                            />
                          ) : (
                            <ChevronsUpDown
                              aria-hidden="true"
                              className="size-3.5"
                            />
                          )}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-300">
            {table.getRowModel().rows.map((row) => (
              <tr
                className="hover:bg-slate-50 dark:hover:bg-slate-800/60"
                key={row.id}
              >
                {row.getVisibleCells().map((cell) => (
                  <td className="whitespace-nowrap px-4 py-3.5" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {applications.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <p className="font-medium text-slate-800 dark:text-slate-200">
            Tidak ada lamaran yang cocok.
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Hapus filter atau tambahkan lamaran baru.
          </p>
        </div>
      ) : null}
    </div>
  );
}
