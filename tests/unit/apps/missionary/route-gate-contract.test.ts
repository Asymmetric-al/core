import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Source-text guards for the missionary app's edge gate.
 *
 * Every route in this app is staff-facing, and `app/layout.tsx` renders
 * `{children}` beside its role gate rather than behind it, so the shell is
 * generated before that gate can redirect. That trade is only safe while the
 * edge turns the wrong visitor away first. The behaviour is covered in
 * `tests/unit/auth/middleware.test.ts`; these assertions cover the config that
 * decides whether the behaviour is reached at all.
 */
const proxySource = readFileSync(
  fileURLToPath(
    new URL("../../../../apps/missionary/proxy.ts", import.meta.url),
  ),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, "");

const publicRoutes = proxySource.match(/publicRoutes:\s*\[([\s\S]*?)\]/)?.[1];

describe("missionary edge gate", () => {
  it("does not list the dashboard home as public", () => {
    // `packages/auth/middleware.ts` checks publicRoutes before authentication
    // and returns early, so an entry here silently cancels every check below it
    // -- an anonymous GET / would answer 200 with the dashboard frame.
    expect(publicRoutes).toBeTruthy();
    expect(publicRoutes).not.toMatch(/^\s*"\/",/m);
  });

  it("protects every route and enforces a role", () => {
    expect(proxySource).toMatch(/protectedRoutePrefixes:\s*\["\/"\]/);
    expect(proxySource).toMatch(/allowedRoles:\s*MISSIONARY_ALLOWED_ROLES/);
    expect(proxySource).toMatch(
      /resolveUserRole:\s*resolveUserRoleFromDatabase/,
    );
  });

  it("bounces a rejected visitor somewhere terminal", () => {
    // With "/" protected, `unauthorizedRedirectTo: "/"` re-enters the failing
    // role check on every hop and ends in ERR_TOO_MANY_REDIRECTS.
    expect(proxySource).toMatch(/unauthorizedRedirectTo:\s*"\/no-access"/);
    expect(publicRoutes).toMatch(/"\/no-access"/);
  });
});
