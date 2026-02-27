import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicConfig } from "./config";

/**
 * @deprecated Auth protection/redirect logic lives in `@asym/auth/middleware`.
 * This helper is retained only as a legacy cookie-refresh utility.
 */
export async function updateSession(request: NextRequest) {
  const { url, key } = getSupabasePublicConfig();
  if (!url || !key) {
    return NextResponse.next({ request });
  }

  const supabaseResponse = NextResponse.next({ request });

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
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(
              name,
              value,
              options as Record<string, unknown>,
            );
          });
        } catch {}
      },
    },
  });

  await supabase.auth.getClaims();

  return supabaseResponse;
}
