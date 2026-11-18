import { safeNextParam } from "@asym/auth/demo-login";
import { routeForProfileRole } from "@asym/auth/roles";
import { createClient } from "@asym/database/supabase/server";
import { NextResponse } from "next/server";

/**
 * A private 307 to a path on the same host.
 *
 * The Location is relative, so the browser resolves it against the address
 * it requested and stays on that host. Session cookies belong to one host,
 * and `request.url` cannot be trusted to name it: the Next dev server reports
 * a request to 127.0.0.1 as localhost, and an absolute redirect built from it
 * left a just-confirmed person signed out on the other host.
 */
export function callbackRedirect(path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error("callbackRedirect takes a same-host path");
  }
  // The server cookie store persists the exchange, but cannot apply the SSR
  // SDK's response headers. Keep every callback outcome private, including
  // redirects that carry newly issued or cleared auth cookies.
  return new NextResponse(null, {
    status: 307,
    headers: {
      Location: path,
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
 * - Redirects to the role-mapped home route when the profile has one; that
 *   route takes precedence over `next`.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
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
          return callbackRedirect(roleRoute);
        }
      }

      return callbackRedirect(next);
    }
  }

  return callbackRedirect("/login?error=Could%20not%20authenticate");
}
