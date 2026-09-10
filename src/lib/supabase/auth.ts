import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "./server";

export const DEFAULT_SIGN_IN_PATH = "/login";
export const DEFAULT_AUTHENTICATED_PATH = "/onboarding";

export function safeInternalPath(
  value: string | null,
  fallback: string,
): string {
  if (
    !value?.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback;
  }

  try {
    const decoded = decodeURIComponent(value);
    if (decoded.includes("\\") || decoded.startsWith("//")) return fallback;
    const origin = "https://jobtrack.invalid";
    const resolved = new URL(value, origin);
    return resolved.origin === origin
      ? `${resolved.pathname}${resolved.search}${resolved.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}

/** Require a validated user in a Server Component, action, or route. */
export async function requireUser(redirectTo = DEFAULT_SIGN_IN_PATH) {
  const supabase = await createClient();

  if (!supabase) {
    redirect(
      `${DEFAULT_SIGN_IN_PATH}?error=${encodeURIComponent("Authentication is not configured")}`,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}

/**
 * Handles both OAuth/PKCE `code` callbacks and email OTP token hashes.
 * A route can delegate its GET handler directly to this helper.
 */
export async function handleAuthCallback(request: NextRequest) {
  const url = new URL(request.url);
  const nextPath = safeInternalPath(
    url.searchParams.get("next"),
    DEFAULT_AUTHENTICATED_PATH,
  );
  const supabase = await createClient();

  if (!supabase) {
    const loginUrl = new URL(DEFAULT_SIGN_IN_PATH, url.origin);
    loginUrl.searchParams.set("error", "Authentication is not configured");
    return NextResponse.redirect(loginUrl);
  }

  let error: Error | null = null;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    }));
  } else {
    error = new Error("The authentication callback is missing a valid token");
  }

  if (error) {
    const loginUrl = new URL(DEFAULT_SIGN_IN_PATH, url.origin);
    loginUrl.searchParams.set("error", error.message);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(nextPath, url.origin));
}
