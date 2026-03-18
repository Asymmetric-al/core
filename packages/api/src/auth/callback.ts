import { safeNextParam } from "@asym/auth/demo-login";
import { routeForProfileRole } from "@asym/auth/roles";
import { createClient } from "@asym/database/supabase/server";
import { NextResponse } from "next/server";

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
          return NextResponse.redirect(`${origin}${roleRoute}`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=Could%20not%20authenticate`,
  );
}
