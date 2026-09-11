import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm, AuthShell, DemoAccess } from "@/components/auth";

export const metadata: Metadata = {
  title: "Buat Akun — JobTrack",
  description:
    "Buat akun JobTrack gratis dan mulai kelola setiap peluang kerja.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Mulai perjalananmu"
      description="Buat akun gratis dan ubah pencarian kerja menjadi proses yang lebih terarah."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-bold text-slate-800 hover:underline"
          >
            Masuk
          </Link>
        </>
      }
    >
      <AuthForm mode="register" />
      <DemoAccess />
    </AuthShell>
  );
}
