import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm, AuthShell, DemoAccess } from "@/components/auth";

export const metadata: Metadata = {
  title: "Masuk — JobTrack",
  description: "Masuk ke JobTrack untuk melanjutkan pencarian kerjamu.",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Selamat datang kembali"
      description="Masuk untuk melanjutkan progres dan melihat langkah berikutnya."
      footer={
        <>
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-bold text-emerald-800 hover:underline"
          >
            Daftar gratis
          </Link>
        </>
      }
    >
      <div className="mb-2 flex justify-end">
        <Link
          href="/forgot-password"
          className="rounded-md text-xs font-semibold text-emerald-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          Lupa kata sandi?
        </Link>
      </div>
      <AuthForm mode="login" />
      <DemoAccess />
    </AuthShell>
  );
}
