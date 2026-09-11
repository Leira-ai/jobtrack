"use client";

import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  Mail,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const configMessage =
  "Autentikasi belum dikonfigurasi pada lingkungan ini. Kamu tetap bisa menjelajahi seluruh fitur melalui mode demo.";

type AuthMode = "login" | "register" | "forgot" | "reset";

interface AuthFormProps {
  readonly mode: AuthMode;
}

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500";

const modeCopy = {
  login: { button: "Masuk ke JobTrack", loading: "Memproses..." },
  register: { button: "Buat akun gratis", loading: "Membuat akun..." },
  forgot: { button: "Kirim tautan pemulihan", loading: "Mengirim..." },
  reset: { button: "Simpan kata sandi baru", loading: "Menyimpan..." },
} as const;

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success" | "info";
    text: string;
  } | null>(
    isSupabaseConfigured() ? null : { type: "info", text: configMessage },
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const supabase = createClient();

    if (!supabase) {
      setMessage({ type: "info", text: configMessage });
      setIsLoading(false);
      return;
    }

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard?demo=false");
        router.refresh();
      }
      if (mode === "register") {
        const fullName = String(form.get("fullName") ?? "").trim();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        if (data.session) {
          router.push("/onboarding");
          router.refresh();
        } else {
          setMessage({
            type: "success",
            text: "Akun berhasil dibuat. Periksa emailmu untuk mengonfirmasi akun sebelum masuk.",
          });
        }
      }
      if (mode === "forgot") {
        const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo,
        });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Tautan pemulihan sudah dikirim. Periksa kotak masuk dan folder spam emailmu.",
        });
      }
      if (mode === "reset") {
        const confirmation = String(form.get("confirmation") ?? "");
        if (password !== confirmation)
          throw new Error("Konfirmasi kata sandi belum sama.");
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Kata sandi berhasil diperbarui. Kamu akan diarahkan ke halaman masuk.",
        });
        window.setTimeout(() => router.push("/login"), 1200);
      }
    } catch (error) {
      const fallback =
        "Terjadi kendala. Periksa data yang kamu masukkan lalu coba lagi.";
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? translateAuthError(error.message, fallback)
            : fallback,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
      {mode === "register" ? (
        <Field label="Nama lengkap" htmlFor="fullName">
          <div className="relative">
            <UserRound
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              size={17}
            />
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              placeholder="Nama lengkapmu"
              className={`${fieldClass} pl-10`}
            />
          </div>
        </Field>
      ) : null}
      {mode !== "reset" ? (
        <Field label="Email" htmlFor="email">
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              size={17}
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="nama@email.com"
              className={`${fieldClass} pl-10`}
            />
          </div>
        </Field>
      ) : null}
      {mode === "login" || mode === "register" || mode === "reset" ? (
        <Field
          label={mode === "reset" ? "Kata sandi baru" : "Kata sandi"}
          htmlFor="password"
          hint={mode !== "login" ? "Minimal 8 karakter" : undefined}
        >
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              required
              minLength={8}
              placeholder="Minimal 8 karakter"
              className={`${fieldClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-white"
              aria-label={
                showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
              }
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </Field>
      ) : null}
      {mode === "reset" ? (
        <Field label="Ulangi kata sandi baru" htmlFor="confirmation">
          <input
            id="confirmation"
            name="confirmation"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="Ketik ulang kata sandi"
            className={fieldClass}
          />
        </Field>
      ) : null}
      {mode === "register" ? (
        <label className="flex items-start gap-3 text-xs leading-5 text-slate-500">
          <input
            name="terms"
            type="checkbox"
            required
            className="mt-0.5 size-4 rounded border-ink/30 accent-[#1d4ed8]"
          />
          <span>
            Saya menyetujui{" "}
            <a
              href="/terms"
              className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Ketentuan Layanan
            </a>{" "}
            dan{" "}
            <a
              href="/privacy"
              className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Kebijakan Privasi
            </a>
            .
          </span>
        </label>
      ) : null}
      {message ? <StatusMessage {...message} /> : null}
      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50"
      >
        {isLoading ? <LoaderCircle size={17} className="animate-spin" /> : null}
        {isLoading ? modeCopy[mode].loading : modeCopy[mode].button}
      </button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  readonly label: string;
  readonly htmlFor: string;
  readonly hint?: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label
          htmlFor={htmlFor}
          className="text-sm font-semibold text-slate-900 dark:text-white"
        >
          {label}
        </label>
        {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function StatusMessage({
  type,
  text,
}: {
  readonly type: "error" | "success" | "info";
  readonly text: string;
}) {
  const style =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
      : type === "success"
        ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200"
        : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200";
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-xs leading-5 ${style}`}
    >
      <Icon size={17} className="mt-0.5 shrink-0" />
      {text}
    </div>
  );
}

function translateAuthError(message: string, fallback: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials"))
    return "Email atau kata sandi tidak sesuai.";
  if (normalized.includes("user already registered"))
    return "Email ini sudah terdaftar. Silakan masuk ke akunmu.";
  if (normalized.includes("password should be"))
    return "Kata sandi harus terdiri dari minimal 8 karakter.";
  if (normalized.includes("email rate limit"))
    return "Terlalu banyak permintaan email. Tunggu sebentar lalu coba lagi.";
  if (normalized.includes("same password"))
    return "Gunakan kata sandi baru yang berbeda dari sebelumnya.";
  return message || fallback;
}
