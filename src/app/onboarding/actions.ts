"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { onboardingSchema, type OnboardingActionState } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/server";

export async function completeOnboarding(
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const values = {
    displayName: String(formData.get("display_name") ?? ""),
    timezone: String(formData.get("timezone") ?? ""),
  };
  const validatedFields = onboardingSchema.safeParse(values);

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    return {
      message: "Periksa kembali data yang kamu masukkan.",
      errors: {
        displayName: errors.displayName,
        timezone: errors.timezone,
      },
      values,
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return {
      message:
        "Autentikasi belum dikonfigurasi. Muat ulang halaman atau gunakan mode demo.",
      values,
    };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login?next=/onboarding");
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: validatedFields.data.displayName,
      timezone: validatedFields.data.timezone,
      onboarding_completed: true,
    },
    { onConflict: "id" },
  );

  if (error) {
    return {
      message: "Profil belum dapat disimpan. Coba lagi beberapa saat lagi.",
      values,
    };
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}
