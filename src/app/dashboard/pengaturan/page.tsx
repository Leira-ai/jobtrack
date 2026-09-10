import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SettingsPanel } from "@/components/settings/settings-panel";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const demoMode = cookieStore.get("jobtrack-demo")?.value === "1";

  if (demoMode) {
    return <SettingsPanel mode="demo" />;
  }

  const supabase = await createClient();
  if (!supabase) {
    redirect(
      `/login?error=${encodeURIComponent("Authentication is not configured")}`,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/pengaturan");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, timezone")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <SettingsPanel
      mode="authenticated"
      profile={{
        displayName: profile?.display_name ?? "",
        email: user.email ?? "",
        timezone: profile?.timezone ?? "UTC",
      }}
    />
  );
}
