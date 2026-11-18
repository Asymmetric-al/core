import { existsSync } from "node:fs";
import path from "node:path";

import { compile, match } from "next/dist/compiled/path-to-regexp";
import { describe, expect, it } from "vitest";

import { legacyRedirects } from "../../../../apps/missionary/lib/legacy-redirects";

/**
 * Council round 1, A11: the retired update pages answer a real 308 again.
 * Under the tenant address they had become pages that redirected while
 * streaming, with status 200. `next.config.ts` serves these before the proxy
 * runs, with the tenant in the address or without it.
 */

const TENANT = "00000000-0000-0000-0000-000000000001";

/** Where Next.js sends `pathname`, by the first redirect whose source matches. */
function redirectFor(pathname: string) {
  for (const redirect of legacyRedirects) {
    const matched = match<Record<string, string>>(redirect.source)(pathname);
    if (matched) {
      return {
        to: compile(redirect.destination)(matched.params),
        permanent: redirect.permanent,
      };
    }
  }
  return null;
}

describe("the missionary workspace's retired addresses", () => {
  it.each([
    ["/ministry-updates", "/feed"],
    ["/email-studio", "/feed"],
    [`/${TENANT}/ministry-updates`, `/${TENANT}/feed`],
    [`/${TENANT}/email-studio`, `/${TENANT}/feed`],
    [`/${TENANT.toUpperCase()}/email-studio`, `/${TENANT.toUpperCase()}/feed`],
  ])("sends %s to %s with a permanent redirect", (from, to) => {
    expect(redirectFor(from)).toEqual({ to, permanent: true });
  });

  it.each([
    "/feed",
    `/${TENANT}/feed`,
    `/${TENANT}/ministry-updates/x`,
    "/not-a-tenant/ministry-updates",
    `/${TENANT}0/email-studio`,
    "/ministry-updates-old",
  ])("leaves %s alone", (pathname) => {
    expect(redirectFor(pathname)).toBeNull();
  });

  it("no longer has pages that redirect while streaming", () => {
    for (const page of ["ministry-updates", "email-studio"]) {
      expect(
        existsSync(
          path.join(process.cwd(), "apps/missionary/app", page, "page.tsx"),
        ),
      ).toBe(false);
    }
  });
});
