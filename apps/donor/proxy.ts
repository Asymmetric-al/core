import { createAuthMiddleware } from "@asym/auth/middleware";
import { resolveUserRoleFromDatabase } from "@asym/auth/resolve-user-role";

export const proxy = createAuthMiddleware({
  publicRoutes: [
    "/",
    "/about",
    "/auth/callback",
    "/faq",
    "/financials",
    "/register",
    "/forgot-password",
    "/ways-to-give",
    "/workers",
    "/sign",
    "/api/auth/demo-account",
    "/sitemap.xml",
    "/robots.txt",
    "/no-access",
    "/boneyard",
  ],
  // Checkout needs a signed-in donor, so signed-out visitors go to sign-in
  // with the gift kept in `next` and come straight back to it. They never
  // reach the payment UI or the donate API first.
  protectedRoutePrefixes: ["/donor-dashboard", "/checkout"],
  loginPath: "/login",
  redirectAuthenticatedTo: "/donor-dashboard",
  unauthorizedRedirectTo: "/",
  // The donor portal acts on the donor row (plan 5.1). Until WP3 resolves the
  // portal host, the tenant is the one of the person's one live donor
  // membership; a person with donor memberships in two tenants is refused.
  roleClass: "donor",
  allowedRoles: ["donor"],
  resolveUserRole: resolveUserRoleFromDatabase,
});

export const config = {
  matcher: [
    // Every path the app can answer runs the proxy, pages and API routes
    // alike, whatever the path ends in: a dynamic route answers
    // `/donor-dashboard/x.json` and `/api/x/y.json` too, and a request that
    // skipped the proxy would keep the headers the client sent (plan 5.1;
    // council round 1: WP2a F5 and WP2b A3). Only Next.js's own assets and
    // real static files are skipped: `/_next/*`, the public folders
    // (`/maplibre/*`, `/images/*`), and one file name at the root with a
    // static extension (`/favicon.ico`, `/icon.svg`, `/og-image.png`,
    // `/robots.txt`, `/sitemap.xml`). The public CMS pages' catch-all also
    // answers a root file name; it reads no header the proxy sets.
    "/((?!_next/|maplibre/|images/|[^/]+\\.(?:ico|svg|png|jpg|jpeg|gif|webp|webmanifest|json|txt|xml)$).*)",
  ],
};
