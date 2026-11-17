import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * One way to build an address (plan 5.2; AL-2675). The signed-in pages of
 * Mission Control and the missionary workspace render under
 * `/<tenant>[~<sub-role>]`, so every link, router call, redirect and
 * active-navigation test in them goes through the tenant helpers, never the
 * Next.js originals, which know nothing of the prefix:
 *
 * - `next/link` -> `TenantLink` (`@asym/auth/tenant-navigation`)
 * - `useRouter` -> `useTenantRouter`
 * - `usePathname` -> `useRoutePathname`
 * - `redirect`, `permanentRedirect` -> `redirectInTenant`,
 *   `permanentRedirectInTenant` (`@asym/auth/tenant-server`)
 *
 * Pages outside the tenant segment (sign-in, the chooser, Web Studio, the
 * API routes) keep the originals. Signed-in page code also caches nothing
 * itself: the tenant reaches a cached read only as an argument.
 */

const root = fileURLToPath(new URL("../../../", import.meta.url));

/** Signed-in source, relative to the repository root. */
const SIGNED_IN_TREES = [
  "apps/admin/app/(app)",
  "apps/admin/app/mc-shell.tsx",
  "apps/admin/app/eve",
  "apps/admin/components",
  "apps/admin/features",
  "apps/admin/lib",
  "apps/missionary/app",
  "apps/missionary/components",
  "apps/missionary/features",
  "apps/missionary/lib",
  "packages/missionary",
];

/** Outside the tenant segment, or redirecting only to pages that are. */
const OUTSIDE_THE_SEGMENT = new Set([
  // Redirects to sign-in, `/no-access` and the chooser only.
  "apps/admin/lib/admin-access.ts",
  "apps/missionary/app/layout.tsx",
  // Sign-in, the chooser and the other account screens.
  "apps/missionary/app/(auth)",
  "apps/missionary/app/auth",
  "apps/missionary/app/api",
  "apps/missionary/app/choose-organization",
  "apps/missionary/app/forgot-password",
  "apps/missionary/app/no-access",
  "apps/missionary/app/register",
  "apps/missionary/app/boneyard",
  "apps/missionary/app/global-not-found.tsx",
  "apps/missionary/app/global-error.tsx",
]);

const BANNED: ReadonlyArray<[RegExp, string]> = [
  [/from\s+["']next\/link["']/, "next/link: use TenantLink"],
  [
    /import\s*\{[^}]*\buseRouter\b[^}]*\}\s*from\s*["']next\/navigation["']/,
    "useRouter: use useTenantRouter",
  ],
  [
    /import\s*\{[^}]*\busePathname\b[^}]*\}\s*from\s*["']next\/navigation["']/,
    "usePathname: use useRoutePathname",
  ],
  [
    /import\s*\{[^}]*\b(?:permanentRedirect|redirect)\b[^}]*\}\s*from\s*["']next\/navigation["']/,
    "redirect: use redirectInTenant",
  ],
];

function sourceFiles(relative: string): string[] {
  const absolute = path.join(root, relative);
  let entries;
  try {
    entries = readdirSync(absolute, { withFileTypes: true });
  } catch {
    return /\.(ts|tsx)$/.test(relative) ? [relative] : [];
  }
  return entries.flatMap((entry) => {
    const child = path.posix.join(relative, entry.name);
    if (entry.name === "node_modules" || OUTSIDE_THE_SEGMENT.has(child)) {
      return [];
    }
    if (entry.isDirectory()) return sourceFiles(child);
    return /\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)
      ? [child]
      : [];
  });
}

describe("signed-in pages build addresses through the tenant helpers", () => {
  const files = SIGNED_IN_TREES.flatMap(sourceFiles);

  it("scans the signed-in source of both apps", () => {
    expect(files).toContain("apps/admin/app/mc-shell.tsx");
    expect(files).toContain("apps/missionary/components/app-sidebar.tsx");
    expect(files.length).toBeGreaterThan(200);
  });

  it("imports no Next.js navigation API that drops the tenant prefix", () => {
    const offenders = files.flatMap((file) => {
      const source = readFileSync(path.join(root, file), "utf8");
      return BANNED.filter(([pattern]) => pattern.test(source)).map(
        ([, rule]) => `${file} (${rule})`,
      );
    });
    expect(offenders).toEqual([]);
  });

  it("caches nothing in signed-in page code, where only params could key it", () => {
    // Under the rewrite a page's params hold the route's parameters and no
    // tenant, so a cache keyed on them would be shared by every tenant. The
    // tenant reaches a `'use cache'` read only as an explicit argument, in
    // the read functions under packages/api/src/reads (TP5, section 6).
    const cached = files.filter((file) =>
      /^\s*["']use cache(?::[^"']*)?["']/m.test(
        readFileSync(path.join(root, file), "utf8"),
      ),
    );
    expect(cached).toEqual([]);
  });
});
