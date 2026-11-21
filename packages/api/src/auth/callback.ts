import { safeNextParam } from "@asym/auth/demo-login";
import { createRpcAssignmentReader } from "@asym/auth/principal";
import { parseRoleClass, ROLE_CLASS_HEADER } from "@asym/auth/request-headers";
import { routeForRole } from "@asym/auth/roles";
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

/**
 * PKCE-ready auth callback route handler.
 *
 * Security and routing implications:
 * - Exchanges Supabase auth codes server-side (never in the browser).
 * - Sanitizes `next` to prevent open redirects; every redirect is a relative
 *   path, so it stays on the host the browser used.
 * - Redirects to the home route of a live membership class the person holds,
 *   the app's own class first; that route takes precedence over `next`.
 *   Since AL-2675 it reads memberships, never `profiles.role`.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextParam(searchParams.get("next")) ?? "/";

  if (code) {
    // Auth and the person's own rows in every tenant: no tenant is chosen yet.
    const supabase = await createClient(null);
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
          return callbackRedirect(roleRoute);
        }
      }

      return callbackRedirect(next);
    }
  }

  return callbackRedirect("/login?error=Could%20not%20authenticate");
}
