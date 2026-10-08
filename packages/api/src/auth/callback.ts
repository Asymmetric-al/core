import { safeNextParam } from "@asym/auth/demo-login";
import { routeForProfileRole } from "@asym/auth/roles";
import { createClient } from "@asym/database/supabase/server";
import { NextResponse } from "next/server";

function callbackRedirect(url: string) {
  // The server cookie store persists the exchange, but cannot apply the SSR
  // SDK's response headers. Keep every callback outcome private, including
  // redirects that carry newly issued or cleared auth cookies.
  return NextResponse.redirect(url, {
    headers: {
      "Cache-Control":
        "private, no-cache, no-store, must-revalidate, max-age=0",
      Expires: "0",
      Pragma: "no-cache",
    },
  });
}

/**
 * PKCE-ready auth callback route handler.
 *
 * Security and routing implications:
 * - Exchanges Supabase auth codes server-side (never in the browser).
 * - Sanitizes `next` to prevent open redirects.
 * - Redirects to role-mapped home route when available.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextParam(searchParams.get("next")) ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        const roleRoute = routeForProfileRole(profile?.role);
        if (roleRoute) {
          return callbackRedirect(`${origin}${roleRoute}`);
        }
      }

      return callbackRedirect(`${origin}${next}`);
    }
  }

  return callbackRedirect(`${origin}/login?error=Could%20not%20authenticate`);
}
