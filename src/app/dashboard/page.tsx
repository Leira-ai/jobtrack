import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { loadPlanningPageData } from "@/lib/planning/server";

export default async function DashboardPage() {
  const planning = await loadPlanningPageData();
  return (
    <DashboardOverview
      initialEvents={planning.events}
      initialTasks={planning.tasks}
      timezone={planning.timezone}
    />
  );
}
