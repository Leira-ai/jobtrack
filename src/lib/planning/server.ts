import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { demoApplications, demoEvents, demoTasks } from "@/data";
import { createClient } from "@/lib/supabase/server";
import { PlanningRepository } from "./repository";
import type { ApplicationOption, PlanningMode } from "./contracts";
import type { CalendarEvent, JobTask } from "@/types";

export interface PlanningPageData {
  readonly mode: PlanningMode;
  readonly events: readonly CalendarEvent[];
  readonly tasks: readonly JobTask[];
  readonly applications: readonly ApplicationOption[];
  readonly timezone: string;
  readonly loadError?: string;
}

const demoOptions = (): readonly ApplicationOption[] =>
  demoApplications
    .filter((application) => !application.archivedAt)
    .map((application) => ({
      id: application.id,
      label: `${application.company} · ${application.role}`,
    }));

export async function loadPlanningPageData(): Promise<PlanningPageData> {
  const cookieStore = await cookies();
  if (cookieStore.get("jobtrack-demo")?.value === "1") {
    return {
      mode: "demo",
      events: demoEvents,
      tasks: demoTasks,
      applications: demoOptions(),
      timezone: "Asia/Jakarta",
    };
  }

  const supabase = await createClient();
  if (!supabase)
    redirect("/login?error=Authentication%20is%20not%20configured");
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) redirect("/login");

  try {
    const repository = new PlanningRepository(supabase);
    const [events, tasks, profile, applications, companies] = await Promise.all(
      [
        repository.listEvents(),
        repository.listTasks(),
        supabase
          .from("profiles")
          .select("timezone")
          .eq("id", auth.user.id)
          .single(),
        supabase
          .from("applications")
          .select("id, company_id, role_title")
          .is("archived_at", null)
          .order("updated_at", { ascending: false }),
        supabase.from("companies").select("id, name"),
      ],
    );
    if (profile.error) throw new Error(profile.error.message);
    if (applications.error) throw new Error(applications.error.message);
    if (companies.error) throw new Error(companies.error.message);
    const companyNames = new Map(
      (companies.data ?? []).map((company) => [company.id, company.name]),
    );
    const options = (applications.data ?? []).map((application) => ({
      id: application.id,
      label: `${companyNames.get(application.company_id ?? "") ?? "Tanpa perusahaan"} · ${application.role_title}`,
    }));
    return {
      mode: "authenticated",
      events,
      tasks,
      applications: options,
      timezone: profile.data.timezone,
    };
  } catch (error) {
    return {
      mode: "authenticated",
      events: [],
      tasks: [],
      applications: [],
      timezone: "UTC",
      loadError:
        error instanceof Error
          ? error.message
          : "Data perencanaan gagal dimuat.",
    };
  }
}
