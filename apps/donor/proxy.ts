import {
  frontNotFound,
  routeToDashboard,
  withoutFrontHeaders,
} from "@asym/auth/front";
import { createAuthMiddleware } from "@asym/auth/middleware";
import { resolveUserRoleFromDatabase } from "@asym/auth/resolve-user-role";
import {
  lookUpVerifiedNameSurfaces,
  verifiedNameUnavailable,
} from "@asym/auth/verified-name";
import { isServeUnderPathsEnabled } from "@asym/database/document-reload";

import {
  classifyDonorPath,
  isDonorExemptPath,
  normalizeDonorPath,
} from "./lib/route-policy";

import type { NextRequest } from "next/server";

const authProxy = createAuthMiddleware({
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

export async function proxy(request: NextRequest) {
  if (!isServeUnderPathsEnabled()) {
    return authProxy(withoutFrontHeaders(request));
  }
  const routed = await routeToDashboard(request, process.env);
  if (routed) return routed;

  const cleaned = withoutFrontHeaders(request, { stripForwardedHost: true });
  const normalized = normalizeDonorPath(request.nextUrl.pathname);
  if (normalized === null) return frontNotFound();
  if (isDonorExemptPath(normalized)) return authProxy(cleaned);

  const host = request.headers.get("host")?.trim();
  if (!host) return frontNotFound();

  const lookup = await lookUpVerifiedNameSurfaces(host, [
    "donor_account",
    "website",
  ]);
  if (lookup.kind === "unavailable") return verifiedNameUnavailable();

  const pathClass = classifyDonorPath(normalized);
  const { donor_account: account, website } = lookup.decisions;
  const admitted =
    pathClass === "account"
      ? account
      : pathClass === "website"
        ? website
        : account.kind === "admitted"
          ? account
          : website;

  if (admitted.kind !== "admitted") return frontNotFound();
  return authProxy(cleaned, { nameTenantId: admitted.tenantId });
}

export const config = {
  matcher: [
    // Every path the app can answer runs the proxy, pages and API routes
    // alike, whatever the path ends in: a dynamic route answers
    // `/donor-dashboard/x.json` and `/api/x/y.json` too, and a request that
    // skipped the proxy would keep the headers the client sent (plan 5.1;
    // council round 1: WP2a F5 and WP2b A3). Exactly these paths answer
    // without it (council round 2, AR7):
    // - `/_next/*`: Next.js's own assets;
    // - `/maplibre/*`: the files of `public/maplibre`; any other path there
    //   is answered by the public CMS pages' catch-all,
    //   `(public)/(solid)/[...cmsSlug]`;
    // - one file name at the root with a static extension: the app icon
    //   (`/icon.svg`), `public/og-image.png`, and the same catch-all for any
    //   other (`/favicon.ico`, `/robots.txt`, `/x.json`).
    // There the headers are the client's, and nothing reads them: the
    // catch-all reads only the host (`lib/cms/client.ts`), and nothing under
    // `(public)` reads a header the proxy sets.
    "/((?!_next/|maplibre/|[^/]+\\.(?:ico|svg|png|jpg|jpeg|gif|webp|webmanifest|json|txt|xml)$).*)",
  ],
};
