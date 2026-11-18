import { createAuthMiddleware } from "@asym/auth/middleware";
import { resolveUserRoleFromDatabase } from "@asym/auth/resolve-user-role";

import { MISSIONARY_ALLOWED_ROLES } from "./app/access";
import { MISSIONARY_PUBLIC_ROUTES } from "./lib/route-policy";

import type { NextRequest } from "next/server";

const authProxy = createAuthMiddleware({
  // `/` is deliberately absent: it is the dashboard. `publicRoutes` is checked
  // before authentication and returns early, so listing it here would cancel
  // `protectedRoutePrefixes` below and let anonymous visitors render the
  // dashboard shell while the layout's redirect catches up on the client.
  publicRoutes: [...MISSIONARY_PUBLIC_ROUTES],
  protectedRoutePrefixes: ["/"],
  loginPath: "/login",
  redirectAuthenticatedTo: "/",
  // Not "/": with the dashboard protected, bouncing a wrong-role visitor there
  // re-enters the same failing role check and loops. `/no-access` is public and
  // terminal, matching `apps/admin/proxy.ts`.
  unauthorizedRedirectTo: "/no-access",
  // The missionary workspace acts on the missionary row (plan 5.1).
  roleClass: "missionary",
  allowedRoles: MISSIONARY_ALLOWED_ROLES,
  resolveUserRole: resolveUserRoleFromDatabase,
  // Signed-in pages live under `/<tenant>` (plan 5.2): the proxy decides the
  // person's missionary row in the address's tenant before the page shell.
  tenantAddress: true,
});

export function proxy(request: NextRequest) {
  return authProxy(request);
}

export const config = {
  matcher: [
    // Every path the app can answer runs the proxy, pages and API routes
    // alike, whatever the path ends in: a dynamic route answers
    // `/donors/x.json` and `/api/x/y.json` too, and a request that skipped
    // the proxy would keep the scope headers the client sent (plan 5.1, 5.2;
    // council round 1: WP2a F5 and WP2b A3). Only Next.js's own assets and
    // real static files are skipped: `/_next/*`, the public folders
    // (`/maplibre/*`, `/images/*`), and one file name at the root with a
    // static extension (`/favicon.ico`, `/icon.svg`, `/robots.txt`,
    // `/sitemap.xml`, the manifest, a public image). A root file name is
    // never a page here: no page route has a dynamic segment at the root.
    "/((?!_next/|maplibre/|images/|[^/]+\\.(?:ico|svg|png|jpg|jpeg|gif|webp|webmanifest|json|txt|xml)$).*)",
  ],
};
