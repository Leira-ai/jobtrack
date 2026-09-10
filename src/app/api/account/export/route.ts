import { NextResponse } from "next/server";

import { loadAccountExport } from "@/lib/account-export";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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

  try {
    const accountExport = await loadAccountExport(supabase, user);
    return new NextResponse(JSON.stringify(accountExport, null, 2), {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition":
          'attachment; filename="jobtrack-account-export.json"',
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Data akun belum dapat diekspor. Coba lagi." },
      { status: 500 },
    );
  }
}
