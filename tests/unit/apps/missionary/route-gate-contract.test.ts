import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  isMissionaryRoleGatePublicPath,
  MISSIONARY_PUBLIC_ROUTES,
} from "../../../../apps/missionary/lib/route-policy";

/**
 * Source-text guards for the missionary app's edge gate.
 *
 * Every signed-in route in this app lives under the tenant in the page
 * address, and the edge decides membership in that tenant before the page
 * shell; `app/layout.tsx` repeats the gate behind it. The behaviour is
 * covered in `tests/unit/auth/middleware.test.ts` and
 * `middleware-tenant-address.test.ts`; these assertions cover the config
 * that decides whether the behaviour is reached at all.
 */
const proxySource = readFileSync(
  fileURLToPath(
    new URL("../../../../apps/missionary/proxy.ts", import.meta.url),
  ),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, "");

describe("missionary edge gate", () => {
  it("retains the proxy's existing public routes exactly", () => {
    expect(MISSIONARY_PUBLIC_ROUTES).toEqual([
      "/about",
      "/auth/callback",
      "/faq",
      "/financials",
      "/register",
      "/forgot-password",
      "/ways-to-give",
      "/workers",
      "/checkout",
      "/sign",
      "/api/auth/demo-account",
      "/sitemap.xml",
      "/robots.txt",
      "/no-access",
      "/boneyard",
    ]);
  });

  it.each([
    ["/login", true],
    ["/login/recovery", true],
    ["/register", true],
    ["/auth/callback", true],
    ["/forgot-password", true],
    ["/no-access", true],
    ["/choose-organization", true],
    ["/api/example", true],
    ["/boneyard/capture", true],
    ["/", false],
    ["/donors", false],
    ["/settings", false],
    ["/login-history", false],
    ["/about", false],
    ["/checkout", false],
    ["/boneyard", false],
  ] as const)(
    "retains the role gate's existing early return for %s",
    (path, expected) => {
      expect(isMissionaryRoleGatePublicPath(path)).toBe(expected);
    },
  );

  it("does not list the dashboard home as public", () => {
    // `packages/auth/middleware.ts` checks publicRoutes before authentication
    // and returns early, so an entry here silently cancels every check below it
    // -- an anonymous GET / would answer 200 with the dashboard frame.
    expect(proxySource).toMatch(
      /publicRoutes:\s*\[\.\.\.MISSIONARY_PUBLIC_ROUTES\]/,
    );
    expect(MISSIONARY_PUBLIC_ROUTES).not.toContain("/");
  });

  it("protects every route and enforces a role", () => {
    expect(proxySource).toMatch(/protectedRoutePrefixes:\s*\["\/"\]/);
    expect(proxySource).toMatch(/tenantAddress:\s*true/);
    expect(proxySource).toMatch(/allowedRoles:\s*MISSIONARY_ALLOWED_ROLES/);
    expect(proxySource).toMatch(
      /resolveUserRole:\s*resolveUserRoleFromDatabase/,
    );
  });

  it("bounces a rejected visitor somewhere terminal", () => {
    // With "/" protected, `unauthorizedRedirectTo: "/"` re-enters the failing
    // role check on every hop and ends in ERR_TOO_MANY_REDIRECTS.
    expect(proxySource).toMatch(/unauthorizedRedirectTo:\s*"\/no-access"/);
    expect(MISSIONARY_PUBLIC_ROUTES).toContain("/no-access");
  });
});
