import {
  admitExemptRequest,
  admitFromFront,
  asStampedRequest,
  frontRefusal,
  MISSIONARY_EXEMPT_PATHS,
  rebaseLocation,
  withoutFrontHeaders,
} from "@asym/auth/front";
import { createAuthMiddleware } from "@asym/auth/middleware";
import { resolveUserRoleFromDatabase } from "@asym/auth/resolve-user-role";
import {
  APP_BASE_PATHS,
  isServeUnderPathsEnabled,
} from "@asym/database/document-reload";

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

export async function proxy(request: NextRequest) {
  if (!isServeUnderPathsEnabled()) {
    return authProxy(withoutFrontHeaders(request));
  }
  const admission = await admitFromFront(request, {
    prefix: APP_BASE_PATHS.missionary,
    key: process.env.FRONT_STAMP_KEY,
    previousKey: process.env.FRONT_STAMP_KEY_PREVIOUS,
    exempt: MISSIONARY_EXEMPT_PATHS,
  });
  if (admission.kind === "refused") return frontRefusal();
  if (admission.kind === "exempt") {
    return admitExemptRequest(request, admission.pathname, "missionary");
  }
  const response = await authProxy(asStampedRequest(request, admission.origin));
  return rebaseLocation(response, request.nextUrl.origin, admission.origin);
}

export const config = {
  matcher: [
    "/",
    // Every path the app can answer runs the proxy, pages and API routes
    // alike, whatever the path ends in: a dynamic route answers
    // `/donors/x.json` and `/api/x/y.json` too, and a request that skipped
    // the proxy would keep the scope headers the client sent (plan 5.1, 5.2;
    // council round 1: WP2a F5 and WP2b A3). Exactly these paths answer
    // without it (council round 2, AR7):
    // - `/_next/*`: Next.js's own assets;
    // - one file name at the root with a static extension: the app icon
    //   (`/icon.svg`), the manifest (`/manifest.webmanifest`), and the
    //   global not-found page for any other (`/favicon.ico`, `/x.json`): no
    //   page route has a dynamic segment at the root.
    // The workspace has no public folder. None of them renders a layout or
    // reads a header the proxy sets.
    "/((?!_next/|[^/]+\\.(?:ico|svg|png|jpg|jpeg|gif|webp|webmanifest|json|txt|xml)$).*)",
  ],
};
