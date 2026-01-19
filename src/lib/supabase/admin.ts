import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

type AdminClientResult =
  | { client: SupabaseClient; error: null }
  | { client: null; error: string };

let cachedClient: SupabaseClient | null | undefined;
let cachedError: string | null = null;

export function getAdminClient(): AdminClientResult {
  if (cachedClient !== undefined) {
    return cachedClient
      ? { client: cachedClient, error: null }
      : { client: null, error: cachedError || "Admin client unavailable." };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    cachedClient = null;
    cachedError = "NEXT_PUBLIC_SUPABASE_URL is not set.";
    return { client: null, error: cachedError };
  }

  if (!serviceRoleKey) {
    cachedClient = null;
    cachedError =
      "Admin endpoints are disabled because SUPABASE_SERVICE_ROLE_KEY is not configured.";
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
