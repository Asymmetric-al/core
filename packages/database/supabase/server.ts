import { createServerClient } from "@supabase/ssr";
import { createClient as createSessionlessClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import {
  requestScopeHeaders,
  type RequestScope,
} from "../request-scope-headers";
import { getSupabasePublicConfig } from "./config";

export type { RequestScope };

/**
 * Create a Supabase server client bound to the current request cookie store.
 *
 * `scope` is what the request acts under: the tenant and the membership row
 * the resolver selected (`requestScopeOf` in `@asym/auth/context`), never a
 * header the caller sent. Its Data API requests carry both as the
 * `x-asym-tenant` and `x-asym-assignment` headers (plan 5.4; AL-2675). The
 * database already reads `x-asym-assignment` through
 * `tenant_guard.request_assignment_id()`, in the human command lane and in
 * `authz.caller_assignment` (the member directory), which accept only a live
 * membership the caller holds. The rest of the database reads them from the
 * second release of WP2b, after which a read on the caller's token that names
 * no tenant returns nothing, so `null` is only for a client that reads no
 * tenant table: sign-in, the callback, recovery and the health probe.
 *
 * Cookie/session implication: Supabase may refresh auth cookies while handling
 * server-side auth APIs. The `setAll` bridge ensures those cookies are written
 * through when mutation is allowed in the execution context.
 */
export async function createClient(scope: RequestScope | null) {
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
    global: { headers: requestScopeHeaders(scope) },
  });
}

export function createAnonymousClient() {
  const { url, key } = getSupabasePublicConfig();
  if (!url || !key) return null;
  return createSessionlessClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
