import { TaskWorkspace } from "@/components/tasks/task-workspace";
import { loadPlanningPageData } from "@/lib/planning/server";

export default async function TasksPage() {
  const data = await loadPlanningPageData();
  return (
    <TaskWorkspace
      mode={data.mode}
      initialTasks={data.tasks}
      applications={data.applications}
      timezone={data.timezone}
      loadError={data.loadError}
    />
  );
}
