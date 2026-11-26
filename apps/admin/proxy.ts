import {
  admitExemptRequest,
  admitFromFront,
  asStampedRequest,
  frontNotFound,
  frontRefusal,
  rebaseLocation,
  STAFF_EXEMPT_PATHS,
  STAFF_READ_ONLY_EXEMPT_PREFIXES,
  withoutFrontHeaders,
} from "@asym/auth/front";
import { answerAdmittedRedirect } from "@asym/auth/legacy-redirects";
import { createAuthMiddleware } from "@asym/auth/middleware";
import { resolveUserRoleFromDatabase } from "@asym/auth/resolve-user-role";
import {
  lookUpVerifiedName,
  verifiedNameUnavailable,
} from "@asym/auth/verified-name";
import {
  APP_BASE_PATHS,
  isServeUnderPathsEnabled,
} from "@asym/database/document-reload";

import { legacyRedirects } from "./lib/legacy-redirects";
import { readWebStudioTenantCookie } from "./src/cms/web-studio-tenant-cookie";

import type { NextRequest } from "next/server";

const authProxy = createAuthMiddleware({
  // Each lies outside the tenant segment (OUTSIDE_TENANT_SEGMENT_ROOTS, the
  // one list; the proxy refuses to build otherwise). Mission Control has no
  // giving, worker or checkout pages, and the matcher never runs on a root
  // file such as /robots.txt, so those entries went (council round 1, A13).
  publicRoutes: [
    "/auth/callback",
    "/login",
    "/register",
    "/forgot-password",
    "/invite",
    "/api/auth/demo-account",
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
  // Web Studio's organization travels in its own signed cookie, scoped to
  // `/web-studio`; Payload's REST routes under `/web-studio/api` only have
  // their session refreshed (plan 5.2, "One stated exception: Web Studio").
  webStudio: { readCookie: readWebStudioTenantCookie },
});

export async function proxy(request: NextRequest) {
  if (!isServeUnderPathsEnabled()) {
    return authProxy(withoutFrontHeaders(request));
  }
  const admission = await admitFromFront(request, {
    prefix: APP_BASE_PATHS.admin,
    key: process.env.FRONT_STAMP_KEY,
    previousKey: process.env.FRONT_STAMP_KEY_PREVIOUS,
    exempt: STAFF_EXEMPT_PATHS,
    readOnlyPrefixes: STAFF_READ_ONLY_EXEMPT_PREFIXES,
  });
  if (admission.kind === "refused") return frontRefusal();
  if (admission.kind === "exempt") {
    return admitExemptRequest(request, admission.pathname, "staff");
  }
  const name = await lookUpVerifiedName(
    new URL(admission.origin).host,
    "staff",
  );
  if (name.kind === "refused") return frontNotFound();
  if (name.kind === "unavailable") return verifiedNameUnavailable();
  const response =
    answerAdmittedRedirect(request, legacyRedirects) ??
    (await authProxy(asStampedRequest(request, admission.origin), {
      nameTenantId: name.tenantId,
      nameGeneration: name.generation,
    }));
  return rebaseLocation(response, request.nextUrl.origin, admission.origin);
}

export const config = {
  matcher: [
    "/",
    // Every path the app can answer runs the proxy, pages and API routes
    // alike, whatever the path ends in: a dynamic route answers
    // `/contributions/x.json` and `/api/x/y.json` too, and a request that
    // skipped the proxy would keep the scope headers the client sent (plan
    // 5.1, 5.2; council round 1: WP2a F5 and WP2b A3). Exactly these paths
    // answer without it (council round 2, AR7):
    // - `/_next/*`: Next.js's own assets;
    // - `/maplibre/*`: the files of `public/maplibre`, the app's one public
    //   folder, and the global not-found page for any other path there;
    // - one file name at the root with a static extension: the app icon
    //   (`/icon.svg`), and the global not-found page for any other
    //   (`/favicon.ico`, `/robots.txt`, `/x.json`): no page route has a
    //   dynamic segment at the root.
    // None of them renders a layout or reads a header the proxy sets.
    "/((?!_next/|maplibre/|[^/]+\\.(?:ico|svg|png|jpg|jpeg|gif|webp|webmanifest|json|txt|xml)$).*)",
  ],
};
