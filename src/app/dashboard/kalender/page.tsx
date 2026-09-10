import { CalendarWorkspace } from "@/components/calendar/calendar-workspace";
import { loadPlanningPageData } from "@/lib/planning/server";

export default async function CalendarPage() {
  const data = await loadPlanningPageData();
  return (
    <CalendarWorkspace
      mode={data.mode}
      initialEvents={data.events}
      applications={data.applications}
      timezone={data.timezone}
      loadError={data.loadError}
    />
  );
}
