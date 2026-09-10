import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm, AuthShell, DemoAccess } from "@/components/auth";

export const metadata: Metadata = {
  title: "Kata Sandi Baru — JobTrack",
  description: "Atur kata sandi baru untuk akun JobTrack.",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Buat kata sandi baru"
      description="Pilih kata sandi yang kuat dan belum pernah kamu gunakan untuk akun ini."
      footer={
        <>
          Tautan sudah kedaluwarsa?{" "}
          <Link
            href="/forgot-password"
            className="font-bold text-emerald-800 hover:underline"
          >
            Minta tautan baru
          </Link>
        </>
      }
    >
      <AuthForm mode="reset" />
      <DemoAccess />
    </AuthShell>
  );
}
