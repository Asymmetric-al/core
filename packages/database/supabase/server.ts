import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabasePublicConfig } from "./config";

/**
 * Create a Supabase server client bound to the current request cookie store.
 *
 * Cookie/session implication: Supabase may refresh auth cookies while handling
 * server-side auth APIs. The `setAll` bridge ensures those cookies are written
 * through when mutation is allowed in the execution context.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getSupabasePublicConfig();

  if (!url || !key) {
    throw new Error(
      "Supabase client misconfigured: set NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options?: Parameters<typeof cookieStore.set>[2];
        }>,
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if proxy/middleware refreshes sessions.
        }
      },
    },
  });
}
