"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Check,
  Database,
  Download,
  LoaderCircle,
  Moon,
  Palette,
  RotateCcw,
  Sun,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  updateProfile,
  type ProfileActionState,
} from "@/app/dashboard/pengaturan/actions";
import {
  buttonStyles,
  Card,
  CardTitle,
  fieldStyles,
  PageHeader,
} from "@/components/dashboard/ui";
import { cn } from "@/components/dashboard/utils";
import { createClient } from "@/lib/supabase/client";
import {
  JOBTRACK_STORAGE_KEY,
  LEGACY_ARCHIVED_APPLICATIONS_KEY,
} from "@/store/base";
import { jobTrackStore } from "@/store/jobtrack-store";

type Theme = "light" | "dark" | "system";
type Profile = {
  readonly displayName: string;
  readonly email: string;
  readonly timezone: string;
};
type SettingsPanelProps =
  | { readonly mode: "demo"; readonly profile?: never }
  | { readonly mode: "authenticated"; readonly profile: Profile };

const DELETE_CONFIRMATION = "HAPUS AKUN SAYA";
const DEMO_PROFILE: Profile = {
  displayName: "Alya Larasati",
  email: "alya@example.test",
  timezone: "Asia/Jakarta",
};

const initialProfileState: ProfileActionState = { ok: false, message: "" };

function downloadJson(content: string, fileName: string): void {
  const url = URL.createObjectURL(
    new Blob([content], { type: "application/json" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function applyTheme(theme: Theme): void {
  const prefersDark =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", dark);
}

export function SettingsPanel({ mode, profile }: SettingsPanelProps) {
  const router = useRouter();
  const initialProfile = profile ?? DEMO_PROFILE;
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("jobtrack-theme") as Theme | null) ?? "system";
  });
  const [demoProfile, setDemoProfile] = useState(initialProfile);
  const [saved, setSaved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfile,
    initialProfileState,
  );
  const currentProfile = mode === "demo" ? demoProfile : initialProfile;

  function changeTheme(next: Theme) {
    setTheme(next);
    localStorage.setItem("jobtrack-theme", next);
    applyTheme(next);
  }

  function saveDemoProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  async function exportData() {
    if (mode === "demo") {
      downloadJson(jobTrackStore.exportData(), "jobtrack-demo-export.json");
      return;
    }

    try {
      const response = await fetch("/api/account/export", {
        method: "GET",
        credentials: "same-origin",
      });
      if (!response.ok) {
        setNotice("Data belum dapat diekspor. Coba masuk kembali.");
        return;
      }
      downloadJson(await response.text(), "jobtrack-account-export.json");
    } catch {
      setNotice("Data belum dapat diekspor. Periksa koneksi lalu coba lagi.");
    }
  }

  function resetDemo() {
    if (mode !== "demo") return;
    jobTrackStore.reset();
    localStorage.removeItem(LEGACY_ARCHIVED_APPLICATIONS_KEY);
    localStorage.removeItem(JOBTRACK_STORAGE_KEY);
    jobTrackStore.reset();
    localStorage.removeItem("jobtrack-theme");
    setTheme("system");
    applyTheme("system");
    setDemoProfile(DEMO_PROFILE);
    setNotice("Data dan preferensi demo telah direset.");
    window.setTimeout(() => setNotice(""), 2200);
  }

  function closeConfirmation() {
    setConfirmOpen(false);
    setConfirmation("");
    setPassword("");
  }

  async function deleteAccount() {
    if (confirmation !== DELETE_CONFIRMATION) return;
    if (mode === "demo") {
      setNotice("Mode demo: tidak ada akun atau data server yang dihapus.");
      closeConfirmation();
      return;
    }
    if (!password) return;

    setDeleting(true);
    setNotice("");
    try {
      const supabase = createClient();
      if (!supabase) {
        setNotice("Autentikasi belum dikonfigurasi.");
        return;
      }
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
      });
      if (reauthError) {
        setNotice("Kata sandi tidak valid. Akun tidak dihapus.");
        return;
      }

      const response = await fetch("/api/account", {
        method: "DELETE",
        credentials: "same-origin",
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      if (!response.ok) {
        setNotice(
          result?.message ??
            "Akun belum dapat dihapus. Data dipertahankan agar dapat dicoba lagi.",
        );
        return;
      }

      await supabase.auth.signOut();
      router.replace("/login?accountDeleted=1");
      router.refresh();
    } catch {
      setNotice("Akun belum dapat dihapus. Periksa koneksi lalu coba lagi.");
    } finally {
      setDeleting(false);
      setPassword("");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Preferensi"
        title="Pengaturan"
        description="Atur profil, tampilan, dan kontrol data JobTrack-mu."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div className="space-y-6">
          <Card>
            <CardTitle
              title="Profil"
              description="Informasi yang digunakan untuk personalisasi ruang kerja."
            />
            <form
              action={mode === "authenticated" ? profileAction : undefined}
              onSubmit={mode === "demo" ? saveDemoProfile : undefined}
              className="flex flex-col gap-5 sm:flex-row"
            >
              <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-teal-100 text-xl font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-200">
                {(currentProfile.displayName || "JT")
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="grid flex-1 gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium">
                  Nama tampilan
                  <input
                    name="display_name"
                    defaultValue={currentProfile.displayName}
                    onChange={
                      mode === "demo"
                        ? (event) =>
                            setDemoProfile((value) => ({
                              ...value,
                              displayName: event.target.value,
                            }))
                        : undefined
                    }
                    required
                    minLength={2}
                    maxLength={120}
                    disabled={profilePending}
                    className={`${fieldStyles} mt-2`}
                  />
                </label>
                <label className="text-sm font-medium">
                  Email
                  <input
                    type="email"
                    value={currentProfile.email}
                    readOnly
                    aria-readonly="true"
                    className={`${fieldStyles} mt-2 bg-slate-50 text-slate-500 dark:bg-slate-800`}
                  />
                </label>
                <label className="text-sm font-medium sm:col-span-2">
                  Zona waktu
                  <input
                    name="timezone"
                    defaultValue={currentProfile.timezone}
                    onChange={
                      mode === "demo"
                        ? (event) =>
                            setDemoProfile((value) => ({
                              ...value,
                              timezone: event.target.value,
                            }))
                        : undefined
                    }
                    required
                    maxLength={64}
                    disabled={profilePending}
                    className={`${fieldStyles} mt-2`}
                    placeholder="Asia/Jakarta"
                  />
                </label>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={profilePending}
                    className={buttonStyles.primary}
                  >
                    {profilePending ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : saved || profileState.ok ? (
                      <Check className="size-4" />
                    ) : (
                      <UserRound className="size-4" />
                    )}
                    {profilePending
                      ? "Menyimpan..."
                      : saved || profileState.ok
                        ? "Tersimpan"
                        : "Simpan profil"}
                  </button>
                  {mode === "authenticated" && profileState.message ? (
                    <p
                      role={profileState.ok ? "status" : "alert"}
                      className={cn(
                        "mt-2 text-xs",
                        profileState.ok ? "text-teal-700" : "text-red-700",
                      )}
                    >
                      {profileState.message}
                    </p>
                  ) : null}
                </div>
              </div>
            </form>
          </Card>
          <Card>
            <CardTitle
              title="Tampilan"
              description="Pilih tema yang nyaman untuk aktivitasmu."
            />
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  { value: "light", label: "Terang", icon: Sun },
                  { value: "dark", label: "Gelap", icon: Moon },
                  { value: "system", label: "Sistem", icon: Palette },
                ] as const
              ).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => changeTheme(item.value)}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl border p-4 text-left transition",
                      theme === item.value
                        ? "border-teal-600 bg-teal-50 text-teal-900 dark:bg-teal-950 dark:text-teal-100"
                        : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800",
                    )}
                  >
                    <Icon className="size-5" />
                    <span className="text-sm font-semibold">{item.label}</span>
                    {theme === item.value ? (
                      <Check className="ml-auto size-4 text-teal-600" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </Card>
          <Card>
            <CardTitle
              title="Data dan cadangan"
              description={
                mode === "demo"
                  ? "Ekspor salinan data atau kembalikan demo ke kondisi awal."
                  : "Unduh salinan aman data akunmu."
              }
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={exportData}
                className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <Download className="mt-0.5 size-5 text-teal-600" />
                <span>
                  <strong className="block text-sm">Ekspor data</strong>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {mode === "demo"
                      ? "Unduh kondisi data demo saat ini dalam format JSON."
                      : "Unduh metadata dan data akun tanpa berkas atau rahasia."}
                  </span>
                </span>
              </button>
              {mode === "demo" ? (
                <button
                  type="button"
                  onClick={resetDemo}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <RotateCcw className="mt-0.5 size-5 text-amber-600" />
                  <span>
                    <strong className="block text-sm">
                      Reset seluruh demo
                    </strong>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      Pulihkan data, arsip, profil, dan tema bawaan.
                    </span>
                  </span>
                </button>
              ) : null}
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardTitle
              title="Status penyimpanan"
              description="Mode data saat ini."
            />
            <div
              className={cn(
                "flex items-start gap-3 rounded-xl p-4",
                mode === "authenticated"
                  ? "bg-teal-50 text-teal-900 dark:bg-teal-950 dark:text-teal-100"
                  : "bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
              )}
            >
              <Database className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">
                  {mode === "authenticated"
                    ? "Akun Supabase"
                    : "Mode demo lokal"}
                </p>
                <p className="mt-1 text-xs leading-5 opacity-80">
                  {mode === "authenticated"
                    ? "Perubahan profil dan kontrol akun diproses melalui server yang terautentikasi."
                    : "Tidak ada server action atau endpoint akun yang dipanggil oleh kontrol demo."}
                </p>
              </div>
            </div>
          </Card>
          <Card className="border-red-200 dark:border-red-900">
            <CardTitle
              title="Zona berbahaya"
              description="Tindakan berikut memerlukan konfirmasi eksplisit."
            />
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className={buttonStyles.danger}
            >
              <Trash2 className="size-4" /> Hapus akun
            </button>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              {mode === "demo"
                ? "Mode demo tidak memiliki akun server untuk dihapus."
                : "Semua data dan berkas akun akan dihapus permanen setelah autentikasi ulang."}
            </p>
          </Card>
        </div>
      </div>
      {confirmOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900"
          >
            <span className="grid size-12 place-items-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950">
              <AlertTriangle className="size-6" />
            </span>
            <h2 id="delete-title" className="mt-4 text-xl font-bold">
              Konfirmasi penghapusan akun
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Ketik <strong>{DELETE_CONFIRMATION}</strong>
              {mode === "authenticated"
                ? " dan masukkan kata sandi saat ini. Kata sandi hanya dikirim langsung ke Supabase Auth untuk autentikasi ulang."
                : " untuk mengonfirmasi simulasi mode demo."}
            </p>
            <label className="mt-4 block text-sm font-medium">
              Frasa konfirmasi
              <input
                autoFocus
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                className={`${fieldStyles} mt-2`}
                placeholder={DELETE_CONFIRMATION}
                autoComplete="off"
                disabled={deleting}
              />
            </label>
            {mode === "authenticated" ? (
              <label className="mt-4 block text-sm font-medium">
                Kata sandi saat ini
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={`${fieldStyles} mt-2`}
                  autoComplete="current-password"
                  required
                  disabled={deleting}
                />
              </label>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeConfirmation}
                disabled={deleting}
                className={buttonStyles.secondary}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={deleteAccount}
                disabled={
                  deleting ||
                  confirmation !== DELETE_CONFIRMATION ||
                  (mode === "authenticated" && !password)
                }
                className={buttonStyles.danger}
              >
                {deleting ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : null}
                {deleting ? "Menghapus..." : "Konfirmasi hapus"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {notice ? (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl bg-slate-950 px-4 py-3 text-sm text-white shadow-xl"
        >
          {notice}
        </div>
      ) : null}
    </div>
  );
}
