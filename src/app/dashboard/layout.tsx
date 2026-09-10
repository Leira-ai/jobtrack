import { cookies } from "next/headers";
import { ApplicationsProvider } from "@/components/applications/applications-provider";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { DashboardProfile } from "@/lib/applications/contracts";
import { loadAuthenticatedDashboardData } from "@/lib/applications/server";
import { loadReminderCenterData } from "@/lib/reminders/server";

const demoProfile: DashboardProfile = {
  displayName: "Alya Larasati",
  email: "demo@jobtrack.test",
  initials: "AL",
};

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const cookieStore = await cookies();
  const mode =
    cookieStore.get("jobtrack-demo")?.value === "1" ? "demo" : "authenticated";
  const [data, reminderData] = await Promise.all([
    mode === "authenticated"
      ? loadAuthenticatedDashboardData()
      : Promise.resolve({ applications: [], profile: demoProfile }),
    loadReminderCenterData(),
  ]);

  return (
    <ApplicationsProvider
      initialApplications={data.applications}
      mode={mode}
      profile={data.profile}
    >
      <DashboardShell
        mode={mode}
        profile={data.profile}
        reminders={reminderData.reminders}
        reminderLoadError={reminderData.loadError}
      >
        {children}
      </DashboardShell>
    </ApplicationsProvider>
  );
}
