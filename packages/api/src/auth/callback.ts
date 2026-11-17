import { safeNextParam } from "@asym/auth/demo-login";
import { createRpcAssignmentReader } from "@asym/auth/principal";
import { parseRoleClass, ROLE_CLASS_HEADER } from "@asym/auth/request-headers";
import { routeForRole } from "@asym/auth/roles";
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
 * - Redirects to the home route of a live membership class the person holds,
 *   the app's own class first; that route takes precedence over `next`.
 *   Since AL-2675 it reads memberships, never `profiles.role`.
 */
const CLASS_PRECEDENCE = ["staff", "missionary", "donor"] as const;

/**
 * The membership class whose home the person lands on: the app's own class
 * (the `x-asym-role-class` header its proxy sets) when they hold a live row of
 * it, else their first class by precedence. `null` when they hold none or the
 * read fails, so the callback falls back to `next`.
 */
async function homeMembershipClass(
  supabase: Parameters<typeof createRpcAssignmentReader>[0],
  request: Request,
): Promise<string | null> {
  try {
    const rows =
      await createRpcAssignmentReader(supabase).listActiveAssignments();
    const held = new Set<string>(rows.map((row) => row.role));
    const surface = parseRoleClass(request.headers.get(ROLE_CLASS_HEADER));
    if (surface && held.has(surface)) return surface;
    return CLASS_PRECEDENCE.find((roleClass) => held.has(roleClass)) ?? null;
  } catch {
    return null;
  }
}

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
        const roleRoute = routeForRole(
          await homeMembershipClass(supabase, request),
        );
        if (roleRoute) {
          return callbackRedirect(`${origin}${roleRoute}`);
        }
      }

      return callbackRedirect(`${origin}${next}`);
    }
  }

  return callbackRedirect(`${origin}/login?error=Could%20not%20authenticate`);
}
