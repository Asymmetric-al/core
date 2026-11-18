import { createAuthMiddleware } from "@asym/auth/middleware";
import { resolveUserRoleFromDatabase } from "@asym/auth/resolve-user-role";

export const proxy = createAuthMiddleware({
  publicRoutes: [
    "/auth/callback",
    "/login",
    "/register",
    "/forgot-password",
    "/ways-to-give",
    "/workers",
    "/checkout",
    "/api/auth/demo-account",
    "/api/cms/public",
    "/sitemap.xml",
    "/robots.txt",
    "/no-access",
    "/boneyard",
  ],
  protectedRoutePrefixes: ["/"],
  loginPath: "/login",
  redirectAuthenticatedTo: "/",
  unauthorizedRedirectTo: "/no-access",
  // Mission Control and Web Studio act on staff rows (plan 5.1).
  roleClass: "staff",
  allowedRoles: ["staff", "admin"],
  resolveUserRole: resolveUserRoleFromDatabase,
  // Signed-in pages live under `/<tenant>[~<sub-role>]` (plan 5.2). Sign
  // Studio (`/sign`) is one of them: it renders in the signed-in layout, so
  // it is no longer listed as public. Web Studio, the chooser, sign-in and
  // the API routes stay outside the tenant segment.
  tenantAddress: true,
});

export const config = {
  matcher: [
    // Every API path, whatever it ends in, so the proxy always fixes the
    // role class (plan 5.1): a dynamic route answers `/api/x/y.json` too.
    "/api/:path*",
    "/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest|json|txt|xml)$).*)",
  ],
};
