import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm, AuthShell, DemoAccess } from "@/components/auth";

export const metadata: Metadata = {
  title: "Pulihkan Kata Sandi — JobTrack",
  description: "Minta tautan aman untuk mengatur ulang kata sandi JobTrack.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Pulihkan kata sandi"
      description="Masukkan email akunmu. Kami akan mengirim tautan untuk membuat kata sandi baru."
      footer={
        <>
          Sudah ingat kata sandimu?{" "}
          <Link
            href="/login"
            className="font-bold text-slate-800 hover:underline"
          >
            Kembali masuk
          </Link>
        </>
      }
    >
      <AuthForm mode="forgot" />
      <DemoAccess />
    </AuthShell>
  );
}
