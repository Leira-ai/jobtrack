import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return Response.json(
      { status: "degraded", database: "not_configured" },
      { status: 503 },
    );
  }
  const { error } = await supabase.from("profiles").select("id").limit(1);
  if (error) {
    return Response.json(
      { status: "degraded", database: "unhealthy" },
      { status: 503 },
    );
  }
  return Response.json({ status: "ok", database: "ok" }, { status: 200 });
}
