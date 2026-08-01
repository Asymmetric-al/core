import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Structural boundary guards for the public-content contract package
 * (Phase 5 #522, ADR-0027):
 *
 * - the package is server-only (the entrypoint carries the `server-only`
 *   poison import, so a client-bundle import fails the Next.js build);
 * - dependencies point inward — the package never imports Payload,
 *   `@payloadcms/*`, or any app code (also enforced by the scoped
 *   `no-restricted-imports` rule in `packages/api/eslint.config.mjs`, the
 *   config CI's per-package lint actually resolves; the root
 *   `eslint.config.mjs` carries a mirror for root-cwd runs);
 * - no `party_type` field exists anywhere in the package (Phase 9 C2
 *   amendment: the hint is `party_kind`, org routing via `org_type`).
 */

const packageDir = path.dirname(
  fileURLToPath(new URL("../../src/cms/public/index.ts", import.meta.url)),
);

function readPackageSources(): Array<{ file: string; source: string }> {
  // Recursive so a future subdirectory (or .tsx/.mts module) cannot slip
  // beneath the guard.
  return readdirSync(packageDir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(ts|tsx|mts|cts)$/.test(entry.name))
    .map((entry) => {
      const absolutePath = path.join(entry.parentPath, entry.name);
      return {
        file: path.relative(packageDir, absolutePath),
        source: readFileSync(absolutePath, "utf8"),
      };
    });
}

describe("public-content contract package boundary", () => {
  const sources = readPackageSources();

  it("has source modules to guard", () => {
    expect(sources.length).toBeGreaterThanOrEqual(6);
  });

  it("marks the entrypoint server-only", () => {
    const index = sources.find(({ file }) => file === "index.ts");

    expect(index).toBeDefined();
    expect(index?.source).toContain('import "server-only";');
  });

  it("never imports Payload or app code from inside the package", () => {
    const forbiddenImportPatterns = [
      // Static, dynamic, and require forms of Payload imports:
      /from\s+["']payload["']/,
      /from\s+["']payload\//,
      /from\s+["']@payloadcms\//,
      /import\s*\(\s*["'](payload["']|payload\/|@payloadcms\/)/,
      /require\s*\(\s*["'](payload["']|payload\/|@payloadcms\/)/,
      // App code by path or by workspace package name:
      /from\s+["'][^"']*apps\/(admin|donor|missionary)\//,
      /import\s*\(\s*["'][^"']*apps\//,
      /require\s*\(\s*["'][^"']*apps\//,
      /from\s+["']@asym\/admin/,
      /from\s+["']@asym\/donor/,
      /from\s+["']@asym\/missionary-app/,
    ];

    for (const { file, source } of sources) {
      for (const pattern of forbiddenImportPatterns) {
        expect(pattern.test(source), `${file} must not match ${pattern}`).toBe(
          false,
        );
      }
    }
  });

  it("contains no party_type field anywhere (party_kind + org_type only)", () => {
    for (const { file, source } of sources) {
      // Comments may explain the rule; code may not carry the field.
      const codeOnly = source
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^\s*\/\/.*$/gm, "");

      expect(
        /party_type|partyType/.test(codeOnly),
        `${file} must not reference party_type in code`,
      ).toBe(false);
    }
  });

  it("is exported as @asym/api/cms/public with the server-only dependency", () => {
    const packageJsonPath = path.join(packageDir, "../../../package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
      exports?: Record<string, string>;
      dependencies?: Record<string, string>;
    };

    expect(packageJson.exports?.["./cms/public"]).toBe(
      "./src/cms/public/index.ts",
    );
    expect(packageJson.dependencies?.["server-only"]).toBeDefined();
  });
});
