import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicConfig } from "./config";

/**
 * @deprecated This helper is legacy-only.
 *
 * Auth protection, redirect decisions, and path/subdomain routing must live in:
 * - app-level `proxy.ts` for app-specific rewrites/normalization
 * - `@asym/auth/middleware` (`createAuthMiddleware`) for shared auth gating
 *
 * Keep this function cookie-refresh only to avoid creating a second auth source
 * of truth.
 */
export async function updateSession(request: NextRequest) {
  const { url, key } = getSupabasePublicConfig();
  if (!url || !key) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });
  const refreshHeaders = new Headers();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }[],
        cacheHeaders: Record<string, string> = {},
      ) {
        try {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          Object.entries(cacheHeaders).forEach(([name, value]) => {
            refreshHeaders.set(name, value);
          });
          const previousCookies = supabaseResponse.cookies.getAll();
          supabaseResponse = NextResponse.next({ request });
          previousCookies.forEach((cookie) => {
            supabaseResponse.cookies.set(cookie);
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(
              name,
              value,
              options as Record<string, unknown>,
            );
          });
          refreshHeaders.forEach((value, name) => {
            supabaseResponse.headers.set(name, value);
          });
        } catch {}
      },
    },
  });

  await supabase.auth.getSession();
  return supabaseResponse;
}
