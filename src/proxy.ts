import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/supabase/database.types";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/onboarding",
  "/applications",
  "/companies",
  "/contacts",
  "/documents",
  "/interviews",
  "/settings",
] as const;
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"] as const;

function matchesRoute(pathname: string, routes: readonly string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const env = getSupabasePublicEnv();
  const requestedDemo = request.nextUrl.searchParams.get("demo") === "true";
  const leavingDemo = request.nextUrl.searchParams.get("demo") === "false";
  const demoMode =
    !leavingDemo &&
    (requestedDemo || request.cookies.get("jobtrack-demo")?.value === "1");

  if (requestedDemo) {
    response.cookies.set("jobtrack-demo", "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  if (leavingDemo) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete("demo");
    const cleanResponse = NextResponse.redirect(cleanUrl);
    for (const path of ["/", "/dashboard"]) {
      cleanResponse.cookies.set("jobtrack-demo", "", {
        httpOnly: true,
        sameSite: "lax",
        secure: request.nextUrl.protocol === "https:",
        path,
        maxAge: 0,
      });
    }
    return cleanResponse;
  }

  // Missing env is a valid state for static previews and CI. Non-demo
  // protected pages still redirect instead of bypassing authentication.
  if (!env) {
    if (demoMode && matchesRoute(request.nextUrl.pathname, PROTECTED_ROUTES)) {
      return response;
    }
    if (matchesRoute(request.nextUrl.pathname, PROTECTED_ROUTES)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      loginUrl.searchParams.set("error", "Authentication is not configured");
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  const supabase = createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser validates the token with Supabase Auth; do not use getSession here.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname, search } = request.nextUrl;

  // If user is authenticated, prioritize their real account unless demo is explicitly requested (?demo=true)
  const effectiveDemoMode = user ? requestedDemo : demoMode;

  // Demo mode is intentionally isolated in browser storage and never reads or
  // mutates an authenticated user's Supabase records.
  if (effectiveDemoMode && matchesRoute(pathname, PROTECTED_ROUTES)) {
    return response;
  }

  if (!user && matchesRoute(pathname, PROTECTED_ROUTES)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (
    user &&
    (matchesRoute(pathname, PROTECTED_ROUTES) ||
      matchesRoute(pathname, AUTH_ROUTES))
  ) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();
    const needsOnboarding =
      profileError !== null || profile?.onboarding_completed !== true;

    if (matchesRoute(pathname, AUTH_ROUTES)) {
      return NextResponse.redirect(
        new URL(needsOnboarding ? "/onboarding" : "/dashboard", request.url),
      );
    }

    if (pathname === "/onboarding" && !needsOnboarding) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (
      needsOnboarding &&
      pathname !== "/onboarding" &&
      matchesRoute(pathname, PROTECTED_ROUTES)
    ) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
