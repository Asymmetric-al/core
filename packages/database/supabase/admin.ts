import { serverEnv } from "@asym/env";
import { createClient } from "@supabase/supabase-js";

import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminSupabaseClient = SupabaseClient;

type AdminClientResult =
  { client: SupabaseClient; error: null } | { client: null; error: string };

let cachedClient: SupabaseClient | null | undefined;
let cachedError: string | null = null;

const missingServiceKey = "SUPABASE_SERVICE_ROLE_KEY is not configured";
const disabledAdmin = `Admin endpoints are disabled because ${missingServiceKey}.`;

export function publicAdminClientFailure(error: string | null): string {
  if (error === disabledAdmin) return disabledAdmin;
  if (error === missingServiceKey) return missingServiceKey;
  return "Admin client unavailable";
}

export function getAdminClient(): AdminClientResult {
  if (cachedClient !== undefined) {
    return cachedClient
      ? { client: cachedClient, error: null }
      : { client: null, error: cachedError || "Admin client unavailable." };
  }

  const url = serverEnv.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = serverEnv.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    cachedClient = null;
    cachedError = "NEXT_PUBLIC_SUPABASE_URL is not set.";
    return { client: null, error: cachedError };
  }

  if (!serviceRoleKey) {
    cachedClient = null;
    cachedError = disabledAdmin;
    return { client: null, error: cachedError };
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  cachedError = null;

  return { client: cachedClient, error: null };
}

export function createAdminClient() {
  return getAdminClient().client;
}
