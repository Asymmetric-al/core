import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(
                name,
                value,
                options as Record<string, unknown>,
              ),
            );
          } catch {}
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let pathname = request.nextUrl.pathname;

  // 1. Normalize Aliases (Demo Paths)
  let targetPathname = pathname;
  if (pathname === "/my" || pathname.startsWith("/my/")) {
    targetPathname = pathname.replace("/my", "/missionary-dashboard");
    if (targetPathname === "/missionary-dashboard/")
      targetPathname = "/missionary-dashboard";
  } else if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    targetPathname = pathname.replace("/admin", "/mc");
    if (targetPathname === "/mc/") targetPathname = "/mc";
  } else if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    targetPathname = pathname.replace("/dashboard", "/donor-dashboard");
    if (targetPathname === "/donor-dashboard/")
      targetPathname = "/donor-dashboard";
  }

  // 2. Subdomain Routing Logic (Conceptual)
  const hostname = request.headers.get("host") || "";
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "localhost:3000";
  const subdomain = hostname.split(".")[0];

  if (subdomain === "my" && hostname !== mainDomain) {
    if (!targetPathname.startsWith("/missionary-dashboard")) {
      targetPathname = `/missionary-dashboard${targetPathname === "/" ? "" : targetPathname}`;
    }
  }

  // 3. Auth Protection
  // Allow these routes without auth
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/auth/callback",
    "/api/auth/demo-account",
    "/about",
    "/faq",
    "/financials",
    "/ways-to-give",
    "/workers",
    "/checkout",
    "/sign",
    "/sitemap.xml",
    "/robots.txt",
  ];
  const isPublicRoute = publicRoutes.some(
    (route) =>
      targetPathname === route ||
      targetPathname.startsWith(route + "/") ||
      targetPathname.startsWith("/api/"),
  );

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // If it's a demo alias, we might want to remember where they were going
    if (targetPathname !== pathname) {
      url.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(url);
  }

  // 4. Redirect logged-in users away from login/register
  if (user && (targetPathname === "/login" || targetPathname === "/register")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const url = request.nextUrl.clone();
    if (profile?.role === "admin" || profile?.role === "staff") {
      url.pathname = "/mc";
    } else if (profile?.role === "missionary") {
      url.pathname = "/missionary-dashboard";
    } else {
      url.pathname = "/donor-dashboard";
    }
    return NextResponse.redirect(url);
  }

  // 5. Apply Rewrite if target differs from current pathname
  if (targetPathname !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = targetPathname;
    return NextResponse.rewrite(url);
  }

  return supabaseResponse;
}
