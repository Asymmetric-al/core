import { NextResponse } from "next/server";
import { createClient } from "@asym/database/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

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
          .single();

        if (profile?.role === "admin" || profile?.role === "staff") {
          return NextResponse.redirect(`${origin}/mc`);
        } else if (profile?.role === "missionary") {
          return NextResponse.redirect(`${origin}/donor-dashboard`);
        } else {
          return NextResponse.redirect(`${origin}/donor-dashboard`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate`);
}
