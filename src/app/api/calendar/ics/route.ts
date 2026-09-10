import { createClient } from "@/lib/supabase/server";
import { generateIcs } from "@/lib/ics";
import { PlanningRepository } from "@/lib/planning/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return Response.json(
      { message: "Authentication is not configured" },
      { status: 503 },
    );
  }
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    // RLS and the validated user session constrain this query to the owner.
    const events = await new PlanningRepository(supabase).listEvents();
    const calendar = generateIcs(events);
    return new Response(calendar, {
      status: 200,
      headers: {
        "content-type": "text/calendar; charset=utf-8",
        "content-disposition": 'attachment; filename="jobtrack-agenda.ics"',
        "cache-control": "private, no-store",
      },
    });
  } catch (caught) {
    return Response.json(
      {
        message:
          caught instanceof Error ? caught.message : "Calendar export failed",
      },
      { status: 500 },
    );
  }
}
