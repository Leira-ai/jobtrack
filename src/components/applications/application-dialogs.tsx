"use client";

import { useEffect, useId, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  readonly open: boolean;
  readonly title: string;
  readonly description?: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
  readonly size?: "md" | "lg";
}

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  size = "md",
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={onClose}
    >
      <section
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={`max-h-[94vh] w-full overflow-y-auto rounded-t-2xl bg-white text-slate-950 shadow-2xl dark:bg-slate-900 dark:text-slate-100 sm:rounded-2xl ${size === "lg" ? "sm:max-w-4xl" : "sm:max-w-2xl"}`}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
          <div>
            <h2
              className="text-lg font-semibold text-slate-950 dark:text-white"
              id={titleId}
            >
              {title}
            </h2>
            {description ? (
              <p
                className="mt-1 text-sm text-slate-600 dark:text-slate-400"
                id={descriptionId}
              >
                {description}
              </p>
            ) : null}
          </div>
          <button
            aria-label={`Tutup ${title}`}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

interface ConfirmDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly description: string;
  readonly confirmLabel: string;
  readonly onCancel: () => void;
  readonly onConfirm: () => Promise<void> | void;
  readonly destructive?: boolean;
  readonly pending?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
  destructive = false,
  pending = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      description={description}
      onClose={onCancel}
      open={open}
      title={title}
    >
      <div className="flex flex-col-reverse gap-3 p-5 sm:flex-row sm:justify-end sm:p-6">
        <button
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          onClick={onCancel}
          type="button"
        >
          Batal
        </button>
        <button
          className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 ${destructive ? "bg-rose-600 hover:bg-rose-700 focus-visible:outline-rose-600" : "bg-slate-900 hover:bg-slate-700 focus-visible:outline-slate-900 dark:bg-teal-600 dark:hover:bg-teal-500 dark:focus-visible:outline-teal-500"}`}
          disabled={pending}
          onClick={() => void onConfirm()}
          type="button"
        >
          {pending ? "Memproses…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
