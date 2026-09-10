import { z } from "zod";

const timezoneSchema = z
  .string()
  .trim()
  .min(1, "Pilih zona waktu.")
  .max(64, "Zona waktu terlalu panjang.")
  .refine(isValidIanaTimezone, "Gunakan zona waktu IANA yang valid.");

export const onboardingSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Nama tampilan minimal 2 karakter.")
    .max(120, "Nama tampilan maksimal 120 karakter."),
  timezone: timezoneSchema,
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export type OnboardingActionState = {
  message: string;
  errors?: {
    displayName?: string[];
    timezone?: string[];
  };
  values?: OnboardingInput;
};

export const initialOnboardingState: OnboardingActionState = { message: "" };

export function isValidIanaTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}
