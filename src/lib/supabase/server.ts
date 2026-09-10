import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import type { Database } from "./database.types";
import { getSupabasePublicEnv } from "./env";

/**
 * Creates a request-scoped typed Supabase client. Returns null if Supabase has
 * not been configured so static pages and CI builds can render safely.
 */
export async function createClient(): Promise<SupabaseClient<Database> | null> {
  const env = getSupabasePublicEnv();

  if (!env) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot write cookies. src/proxy.ts refreshes
          // sessions and persists cookies before rendering.
        }
      },
    },
  });
}
