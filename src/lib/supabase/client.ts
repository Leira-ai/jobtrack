"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import { getSupabasePublicEnv } from "./env";

let client: SupabaseClient<Database> | undefined;

/**
 * Returns a typed browser client, or null when public Supabase variables are
 * intentionally absent (for example during an unconfigured preview build).
 */
export function createClient(): SupabaseClient<Database> | null {
  const env = getSupabasePublicEnv();

  if (!env) {
    return null;
  }

  client ??= createBrowserClient<Database>(env.url, env.anonKey);
  return client;
}
