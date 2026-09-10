import { NextResponse } from "next/server";

import {
  deleteAccountForUser,
  hasValidRequestOrigin,
} from "@/lib/account-deletion";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(request: Request) {
  if (!hasValidRequestOrigin(request)) {
    return NextResponse.json(
      { message: "Origin permintaan tidak valid." },
      { status: 403 },
    );
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      { message: "Autentikasi belum dikonfigurasi." },
      { status: 503 },
    );
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { message: "Sesi tidak tersedia." },
      { status: 401 },
    );
  }

  const recentSignIn = user.last_sign_in_at
    ? Date.parse(user.last_sign_in_at)
    : Number.NaN;
  const recentAuthenticationWindowMs = 5 * 60 * 1000;
  if (
    !Number.isFinite(recentSignIn) ||
    Date.now() - recentSignIn > recentAuthenticationWindowMs
  ) {
    return NextResponse.json(
      { message: "Autentikasi ulang diperlukan sebelum akun dapat dihapus." },
      { status: 403 },
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      {
        message:
          "Penghapusan akun belum tersedia karena SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di server.",
      },
      { status: 503 },
    );
  }

  const result = await deleteAccountForUser(admin, user.id);
  if (!result.ok && result.stage === "storage") {
    return NextResponse.json(
      {
        message: result.restorationPending
          ? "Berkas akun belum dapat diamankan sepenuhnya. Akun dipertahankan; hubungi dukungan sebelum mencoba lagi."
          : "Berkas akun belum dapat diamankan. Akun dan data dipertahankan agar penghapusan dapat dicoba lagi.",
        restorationPending: result.restorationPending,
      },
      { status: 503 },
    );
  }
  if (!result.ok) {
    return NextResponse.json(
      {
        message: result.restorationPending
          ? "Akun belum dapat dihapus dan pemulihan berkas memerlukan tindak lanjut dukungan."
          : "Akun belum dapat dihapus. Berkas telah dipulihkan; coba lagi atau hubungi dukungan.",
        restorationPending: result.restorationPending,
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      cleanupPending: result.cleanupPending,
      message: result.alreadyMissing
        ? result.cleanupPending
          ? "Akun sudah tidak tersedia. Pembersihan berkas tertunda."
          : "Akun sudah tidak tersedia."
        : result.cleanupPending
          ? "Akun berhasil dihapus. Pembersihan berkas tertunda."
          : "Akun berhasil dihapus.",
    },
    { status: 200 },
  );
}
