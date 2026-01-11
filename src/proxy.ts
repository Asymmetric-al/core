import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Subdomain rewrite logic
  // membercare.tenanturl.org -> /mc/care
  if (hostname.startsWith("membercare.")) {
    if (!url.pathname.startsWith("/mc/care")) {
      const newPath = `/mc/care${url.pathname === "/" ? "" : url.pathname}`;
      return NextResponse.rewrite(new URL(newPath, request.url));
    }
  }

  return await updateSession(request);
}

export default proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest|json)$).*)",
  ],
};
