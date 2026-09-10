import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Siapkan Profil",
  description:
    "Lengkapi nama tampilan dan zona waktu sebelum menggunakan dashboard JobTrack.",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const cookieStore = await cookies();
  if (cookieStore.get("jobtrack-demo")?.value === "1") {
    redirect("/dashboard");
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
    redirect("/login?next=/onboarding");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, timezone, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      title="Satu langkah lagi"
      description="Atur profil agar tenggat, wawancara, dan pengingat tampil sesuai zona waktumu."
    >
      <OnboardingForm
        initialDisplayName={profile?.display_name ?? ""}
        initialTimezone={profile?.timezone ?? "UTC"}
      />
    </AuthShell>
  );
}
