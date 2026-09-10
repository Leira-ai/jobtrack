import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApplicationsRepository } from "./repository";
import type { DashboardApplicationData, DashboardProfile } from "./contracts";

const initials = (displayName: string, email: string): string => {
  const source = displayName.trim() || email.split("@")[0] || "JT";
  return source
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toLocaleUpperCase("id-ID");
};

export function toDashboardProfile(
  user: User,
  displayName: string | null,
): DashboardProfile {
  const email = user.email ?? "Email tidak tersedia";
  const metadataName =
    typeof user.user_metadata.display_name === "string"
      ? user.user_metadata.display_name
      : typeof user.user_metadata.full_name === "string"
        ? user.user_metadata.full_name
        : "";
  const resolvedName = displayName?.trim() || metadataName.trim() || email;
  return {
    displayName: resolvedName,
    email,
    initials: initials(resolvedName, email),
  };
}

export async function loadAuthenticatedDashboardData(): Promise<DashboardApplicationData> {
  const supabase = await createClient();
  if (!supabase) {
    redirect(
      `/login?error=${encodeURIComponent("Authentication is not configured")}`,
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");

  const [{ data: profile, error: profileError }, applications] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single(),
      new ApplicationsRepository(supabase).list(),
    ]);
  if (profileError) throw new Error(profileError.message);

  return {
    applications,
    profile: toDashboardProfile(user, profile.display_name),
  };
}
