"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";

import { completeOnboarding } from "@/app/onboarding/actions";
import { initialOnboardingState, isValidIanaTimezone } from "@/lib/onboarding";

interface OnboardingFormProps {
  readonly initialDisplayName: string;
  readonly initialTimezone: string;
}

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50";

export function OnboardingForm({
  initialDisplayName,
  initialTimezone,
}: OnboardingFormProps) {
  const [state, formAction, pending] = useActionState(
    completeOnboarding,
    initialOnboardingState,
  );
  const displayNameRef = useRef<HTMLInputElement>(null);
  const timezoneRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialTimezone !== "UTC" || !timezoneRef.current) return;

    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (browserTimezone && isValidIanaTimezone(browserTimezone)) {
      timezoneRef.current.value = browserTimezone;
    }
  }, [initialTimezone]);

  useEffect(() => {
    if (!state.values) return;
    if (displayNameRef.current) {
      displayNameRef.current.value = state.values.displayName;
    }
    if (timezoneRef.current) {
      timezoneRef.current.value = state.values.timezone;
    }
  }, [state.values]);

  const displayNameError = state.errors?.displayName?.[0];
  const timezoneError = state.errors?.timezone?.[0];

  return (
    <form action={formAction} className="mt-8 grid gap-5" noValidate>
      <div>
        <label
          htmlFor="display_name"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Nama tampilan
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          maxLength={120}
          ref={displayNameRef}
          defaultValue={initialDisplayName}
          aria-invalid={Boolean(displayNameError)}
          aria-describedby={displayNameError ? "display-name-error" : undefined}
          disabled={pending}
          className={fieldClass}
          placeholder="Nama yang ingin ditampilkan"
        />
        {displayNameError ? (
          <p id="display-name-error" className="mt-2 text-xs text-rose-700">
            {displayNameError}
          </p>
        ) : null}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label
            htmlFor="timezone"
            className="text-sm font-semibold text-slate-700"
          >
            Zona waktu
          </label>
          <span className="text-xs text-slate-400">Format IANA</span>
        </div>
        <input
          id="timezone"
          name="timezone"
          type="text"
          autoComplete="off"
          required
          maxLength={64}
          ref={timezoneRef}
          defaultValue={initialTimezone}
          aria-invalid={Boolean(timezoneError)}
          aria-describedby={
            timezoneError ? "timezone-hint timezone-error" : "timezone-hint"
          }
          disabled={pending}
          className={fieldClass}
          placeholder="Asia/Jakarta"
        />
        <p id="timezone-hint" className="mt-2 text-xs text-slate-500">
          Contoh: Asia/Jakarta, Asia/Makassar, atau Asia/Jayapura.
        </p>
        {timezoneError ? (
          <p id="timezone-error" className="mt-1 text-xs text-rose-700">
            {timezoneError}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800"
        >
          {state.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#123c2d] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0d3023] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <LoaderCircle size={17} className="animate-spin" /> : null}
        {pending ? "Menyimpan profil..." : "Lanjut ke dashboard"}
        {!pending ? <ArrowRight size={17} /> : null}
      </button>
    </form>
  );
}
