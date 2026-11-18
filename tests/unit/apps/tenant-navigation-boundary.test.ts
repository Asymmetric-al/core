import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * One way to build an address (plan 5.2; AL-2675). The navigation rule itself
 * is ESLint's now (`tenant-navigation/no-prefixless-navigation`, in
 * `tooling/eslint-config/tenant-navigation.mjs`; council round 1, A10), and
 * `tests/unit/scripts/tenant-navigation-lint.test.ts` proves it. What stays
 * here until A21 moves it into the same rule: signed-in page code caches
 * nothing itself; the tenant reaches a cached read only as an argument.
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
    if (entry.name === "node_modules") return [];
    if (entry.isDirectory()) return sourceFiles(child);
    return /\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)
      ? [child]
      : [];
  });
}

describe("signed-in page code", () => {
  const files = SIGNED_IN_TREES.flatMap(sourceFiles);

  it("scans the signed-in source of both apps", () => {
    expect(files).toContain("apps/admin/app/mc-shell.tsx");
    expect(files).toContain("apps/missionary/components/app-sidebar.tsx");
    expect(files.length).toBeGreaterThan(200);
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
