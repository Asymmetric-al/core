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
  allowedRoles: MISSIONARY_ALLOWED_ROLES,
  resolveUserRole: resolveUserRoleFromDatabase,
});

export function proxy(request: NextRequest) {
  return authProxy(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest|json|txt|xml)$).*)",
  ],
};
