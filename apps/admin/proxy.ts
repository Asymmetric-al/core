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
    // Every path the app can answer runs the proxy, pages and API routes
    // alike, whatever the path ends in: a dynamic route answers
    // `/contributions/x.json` and `/api/x/y.json` too, and a request that
    // skipped the proxy would keep the scope headers the client sent (plan
    // 5.1, 5.2; council round 1: WP2a F5 and WP2b A3). Only Next.js's own
    // assets and real static files are skipped: `/_next/*`, the public
    // folders (`/maplibre/*`, `/images/*`), and one file name at the root
    // with a static extension (`/favicon.ico`, `/icon.svg`, `/robots.txt`,
    // `/sitemap.xml`, a manifest, a public image). A root file name is never
    // a page here: no page route has a dynamic segment at the root.
    "/((?!_next/|maplibre/|images/|[^/]+\\.(?:ico|svg|png|jpg|jpeg|gif|webp|webmanifest|json|txt|xml)$).*)",
  ],
};
