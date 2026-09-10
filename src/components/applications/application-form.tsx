"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  APPLICATION_STATUSES,
  type JobApplication,
  type NewApplication,
} from "../../types";
import {
  employmentTypeOptions,
  statusOptions,
  workModeOptions,
} from "./application-config";

const optionalUrl = z
  .string()
  .trim()
  .refine(
    (value) => !value || /^https?:\/\/\S+$/i.test(value),
    "Masukkan URL lengkap berawalan http(s)",
  );
const optionalEmail = z
  .string()
  .trim()
  .refine(
    (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    "Masukkan alamat email yang valid",
  );
const optionalNumber = z
  .string()
  .refine(
    (value) => !value || (Number.isFinite(Number(value)) && Number(value) >= 0),
    "Masukkan angka positif",
  );

const applicationSchema = z
  .object({
    company: z.string().trim().min(2, "Nama perusahaan wajib diisi").max(100),
    role: z.string().trim().min(2, "Posisi wajib diisi").max(100),
    location: z.string().trim().min(2, "Lokasi wajib diisi").max(100),
    workMode: z.enum(["remote", "hybrid", "onsite"]),
    employmentType: z.enum([
      "full-time",
      "part-time",
      "contract",
      "internship",
    ]),
    status: z.enum(APPLICATION_STATUSES),
    source: z.string().trim().min(2, "Sumber wajib diisi").max(100),
    jobUrl: optionalUrl,
    appliedAt: z.string(),
    deadline: z.string(),
    contactName: z.string().trim().max(100),
    contactEmail: optionalEmail,
    description: z.string().trim().max(3000),
    tags: z.string().max(300),
    salaryMin: optionalNumber,
    salaryMax: optionalNumber,
    salaryCurrency: z.enum(["IDR", "USD", "SGD", "EUR"]),
    salaryPeriod: z.enum(["hour", "month", "year"]),
  })
  .refine(
    (values) =>
      !values.salaryMin ||
      !values.salaryMax ||
      Number(values.salaryMax) >= Number(values.salaryMin),
    {
      message: "Nilai maksimum harus sama dengan atau lebih besar dari minimum",
      path: ["salaryMax"],
    },
  );

type ApplicationFormValues = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  readonly application?: JobApplication;
  readonly onCancel: () => void;
  readonly onSubmit: (value: NewApplication) => Promise<void> | void;
  readonly pending?: boolean;
}

const toDateInput = (value?: string): string =>
  value ? value.slice(0, 10) : "";

const defaults = (application?: JobApplication): ApplicationFormValues => ({
  company: application?.company ?? "",
  role: application?.role ?? "",
  location: application?.location ?? "",
  workMode: application?.workMode ?? "hybrid",
  employmentType: application?.employmentType ?? "full-time",
  status: application?.status ?? "saved",
  source: application?.source ?? "",
  jobUrl: application?.jobUrl ?? "",
  appliedAt: toDateInput(application?.appliedAt),
  deadline: toDateInput(application?.deadline),
  contactName: application?.contactName ?? "",
  contactEmail: application?.contactEmail ?? "",
  description: application?.description ?? "",
  tags: application?.tags.join(", ") ?? "",
  salaryMin: application?.salary?.min.toString() ?? "",
  salaryMax: application?.salary?.max.toString() ?? "",
  salaryCurrency: application?.salary?.currency ?? "IDR",
  salaryPeriod: application?.salary?.period ?? "month",
});

const toIsoDate = (value: string): string | undefined =>
  value ? new Date(`${value}T00:00:00`).toISOString() : undefined;

export function ApplicationForm({
  application,
  onCancel,
  onSubmit,
  pending = false,
}: ApplicationFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: defaults(application),
  });

  useEffect(() => reset(defaults(application)), [application, reset]);

  const submit = async (values: ApplicationFormValues): Promise<void> => {
    const hasSalary = values.salaryMin !== "" && values.salaryMax !== "";
    await onSubmit({
      company: values.company,
      role: values.role,
      location: values.location,
      workMode: values.workMode,
      employmentType: values.employmentType,
      status: values.status,
      source: values.source,
      jobUrl: values.jobUrl || undefined,
      appliedAt: toIsoDate(values.appliedAt),
      deadline: toIsoDate(values.deadline),
      contactName: values.contactName || undefined,
      contactEmail: values.contactEmail || undefined,
      description: values.description || undefined,
      tags: values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      salary: hasSalary
        ? {
            min: Number(values.salaryMin),
            max: Number(values.salaryMax),
            currency: values.salaryCurrency,
            period: values.salaryPeriod,
          }
        : undefined,
    });
  };

  const inputClass =
    "mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-teal-500 dark:focus:ring-teal-950";
  const labelClass = "text-sm font-medium text-slate-800 dark:text-slate-200";
  const errorClass =
    "mt-1 text-xs font-medium text-rose-600 dark:text-rose-400";

  return (
    <form className="p-5 sm:p-6" noValidate onSubmit={handleSubmit(submit)}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Perusahaan
          <span aria-hidden="true" className="text-rose-600 dark:text-rose-400">
            {" "}
            *
          </span>
          <input
            aria-invalid={Boolean(errors.company)}
            autoFocus
            className={inputClass}
            {...register("company")}
          />
          {errors.company ? (
            <span className={errorClass} role="alert">
              {errors.company.message}
            </span>
          ) : null}
        </label>
        <label className={labelClass}>
          Posisi
          <span aria-hidden="true" className="text-rose-600 dark:text-rose-400">
            {" "}
            *
          </span>
          <input
            aria-invalid={Boolean(errors.role)}
            className={inputClass}
            {...register("role")}
          />
          {errors.role ? (
            <span className={errorClass} role="alert">
              {errors.role.message}
            </span>
          ) : null}
        </label>
        <label className={labelClass}>
          Lokasi
          <span aria-hidden="true" className="text-rose-600 dark:text-rose-400">
            {" "}
            *
          </span>
          <input
            aria-invalid={Boolean(errors.location)}
            className={inputClass}
            {...register("location")}
          />
          {errors.location ? (
            <span className={errorClass} role="alert">
              {errors.location.message}
            </span>
          ) : null}
        </label>
        <label className={labelClass}>
          Sumber
          <span aria-hidden="true" className="text-rose-600 dark:text-rose-400">
            {" "}
            *
          </span>
          <input
            aria-invalid={Boolean(errors.source)}
            className={inputClass}
            placeholder="LinkedIn, referensi, situs perusahaan…"
            {...register("source")}
          />
          {errors.source ? (
            <span className={errorClass} role="alert">
              {errors.source.message}
            </span>
          ) : null}
        </label>
        <label className={labelClass}>
          Status
          <select className={inputClass} {...register("status")}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Sistem kerja
          <select className={inputClass} {...register("workMode")}>
            {workModeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Jenis pekerjaan
          <select className={inputClass} {...register("employmentType")}>
            {employmentTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          URL lowongan
          <input
            aria-invalid={Boolean(errors.jobUrl)}
            className={inputClass}
            inputMode="url"
            placeholder="https://…"
            {...register("jobUrl")}
          />
          {errors.jobUrl ? (
            <span className={errorClass} role="alert">
              {errors.jobUrl.message}
            </span>
          ) : null}
        </label>
        <label className={labelClass}>
          Tanggal melamar
          <input
            className={inputClass}
            type="date"
            {...register("appliedAt")}
          />
        </label>
        <label className={labelClass}>
          Tenggat
          <input className={inputClass} type="date" {...register("deadline")} />
        </label>
        <label className={labelClass}>
          Nama kontak
          <input className={inputClass} {...register("contactName")} />
        </label>
        <label className={labelClass}>
          Email kontak
          <input
            aria-invalid={Boolean(errors.contactEmail)}
            className={inputClass}
            inputMode="email"
            type="email"
            {...register("contactEmail")}
          />
          {errors.contactEmail ? (
            <span className={errorClass} role="alert">
              {errors.contactEmail.message}
            </span>
          ) : null}
        </label>
      </div>
      <fieldset className="mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <legend className="px-1 text-sm font-semibold text-slate-900 dark:text-white">
          Rentang gaji (opsional)
        </legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className={labelClass}>
            Minimum
            <input
              aria-invalid={Boolean(errors.salaryMin)}
              className={inputClass}
              inputMode="numeric"
              {...register("salaryMin")}
            />
            {errors.salaryMin ? (
              <span className={errorClass} role="alert">
                {errors.salaryMin.message}
              </span>
            ) : null}
          </label>
          <label className={labelClass}>
            Maksimum
            <input
              aria-invalid={Boolean(errors.salaryMax)}
              className={inputClass}
              inputMode="numeric"
              {...register("salaryMax")}
            />
            {errors.salaryMax ? (
              <span className={errorClass} role="alert">
                {errors.salaryMax.message}
              </span>
            ) : null}
          </label>
          <label className={labelClass}>
            Mata uang
            <select className={inputClass} {...register("salaryCurrency")}>
              <option>IDR</option>
              <option>USD</option>
              <option>SGD</option>
              <option>EUR</option>
            </select>
          </label>
          <label className={labelClass}>
            Periode
            <select className={inputClass} {...register("salaryPeriod")}>
              <option value="hour">Jam</option>
              <option value="month">Bulan</option>
              <option value="year">Tahun</option>
            </select>
          </label>
        </div>
      </fieldset>
      <label className={`mt-5 block ${labelClass}`}>
        Tag
        <input
          className={inputClass}
          placeholder="React, Fintech, Senior"
          {...register("tags")}
        />
        <span className="mt-1 block text-xs font-normal text-slate-500 dark:text-slate-400">
          Pisahkan tag dengan koma.
        </span>
      </label>
      <label className={`mt-5 block ${labelClass}`}>
        Deskripsi
        <textarea
          className={`${inputClass} min-h-28 resize-y`}
          {...register("description")}
        />
      </label>
      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
        <button
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          onClick={onCancel}
          type="button"
        >
          Batal
        </button>
        <button
          className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-60 dark:bg-teal-600 dark:hover:bg-teal-500"
          disabled={isSubmitting || pending}
          type="submit"
        >
          {isSubmitting || pending
            ? "Menyimpan…"
            : application
              ? "Simpan perubahan"
              : "Tambah lamaran"}
        </button>
      </div>
    </form>
  );
}
