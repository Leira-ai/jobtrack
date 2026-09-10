"use server";

import { revalidatePath } from "next/cache";

import { onboardingSchema, type OnboardingInput } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/server";

export type ProfileActionState = {
  readonly ok: boolean;
  readonly message: string;
  readonly errors?: {
    readonly displayName?: string[];
    readonly timezone?: string[];
  };
  readonly values?: OnboardingInput;
};

export async function updateProfile(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const values = {
    displayName: String(formData.get("display_name") ?? ""),
    timezone: String(formData.get("timezone") ?? ""),
  };
  const validated = onboardingSchema.safeParse(values);

  if (!validated.success) {
    const errors = validated.error.flatten().fieldErrors;
    return {
      ok: false,
      message: "Periksa kembali data profilmu.",
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
      ok: false,
      message: "Autentikasi belum dikonfigurasi.",
      values: validated.data,
    };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return {
      ok: false,
      message: "Sesi berakhir. Masuk kembali untuk menyimpan profil.",
      values: validated.data,
    };
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: validated.data.displayName,
      timezone: validated.data.timezone,
      onboarding_completed: true,
    },
    { onConflict: "id" },
  );

  if (error) {
    return {
      ok: false,
      message: "Profil belum dapat disimpan. Coba lagi.",
      values: validated.data,
    };
  }

  revalidatePath("/dashboard/pengaturan");
  return {
    ok: true,
    message: "Profil berhasil disimpan.",
    values: validated.data,
  };
}
