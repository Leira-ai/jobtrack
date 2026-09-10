import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  actionFailure,
  getAuthenticatedDocumentClient,
  uploadDocumentForUser,
} from "@/lib/documents/service";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get("jobtrack-demo")?.value === "1") {
    return NextResponse.json(
      { ok: false, message: "Unggahan server dinonaktifkan dalam mode demo." },
      { status: 403 },
    );
  }

  try {
    const authenticated = await getAuthenticatedDocumentClient(createClient);
    if (!authenticated) {
      return NextResponse.json(
        { ok: false, message: "Sesi tidak tersedia." },
        { status: 401 },
      );
    }

    const result = await uploadDocumentForUser(
      authenticated.supabase,
      authenticated.user.id,
      await request.formData(),
    );
    if (result.ok) revalidatePath("/dashboard/dokumen");
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(actionFailure(error), { status: 500 });
  }
}
