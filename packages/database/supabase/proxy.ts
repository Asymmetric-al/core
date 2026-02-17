import { NextResponse, type NextRequest } from "next/server";

/** Path aliases only; no auth. Read-only demo has no session redirects. */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Normalize Aliases (Demo Paths)
  let targetPathname = pathname;
  if (pathname === "/my" || pathname.startsWith("/my/")) {
    targetPathname = pathname.replace("/my", "") || "/";
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
    targetPathname = targetPathname === "" ? "/" : targetPathname;
  }

  // 3. Apply Rewrite if target differs from current pathname
  if (targetPathname !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = targetPathname;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next({ request });
}
