#!/usr/bin/env node
/**
 * Sole-entry hard lint for the public CMS choke-point (Phase 5, ruling A5;
 * ADR-0028; issue #523).
 *
 * Public code paths must never read Payload directly: every public content
 * read goes through the one published-content reader, which applies the
 * tenant-and-published constraint and runs `overrideAccess: false` under the
 * public-read access policy. This check fails the build on any raw Payload
 * read (`payload.find`, `findByID`, an aliased `client.find({ collection })`,
 * a `db.` escape hatch, or `overrideAccess: true`) inside a public code path
 * outside the documented allowlist.
 *
 * Scope (public code paths):
 *   - apps/admin/app/api/cms/public/   — the public CMS route handlers
 *   - apps/admin/src/cms/public/       — the public CMS server modules
 *   - apps/donor/app/(public)/         — the public site surface
 *   - apps/donor/lib/cms/              — the donor-side CMS client
 *
 * Allowlist (documented construction sites):
 *   - apps/admin/src/cms/public/published-content-reader.ts
 *       THE choke-point — the single module allowed to touch Payload's Local
 *       API for public content (#523).
 *   - apps/admin/src/cms/public/resolve-tenant.ts
 *       The host→tenant resolution seam. It reads only the `tenants`
 *       collection to resolve the request; issue #524 formalizes it into the
 *       unified host→tenant/site resolver. It may not read content.
 *
 * Staff/admin Payload reads outside these paths are unaffected.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");

export const PUBLIC_CODE_PATH_PATTERNS = [
  /^apps\/admin\/app\/api\/cms\/public\//,
  /^apps\/admin\/src\/cms\/public\//,
  /^apps\/donor\/app\/\(public\)\//,
  /^apps\/donor\/lib\/cms\//,
];

export const SOLE_ENTRY_ALLOWLIST = [
  "apps/admin/src/cms/public/published-content-reader.ts",
  "apps/admin/src/cms/public/resolve-tenant.ts",
];

const RAW_READ_PATTERNS = [
  {
    id: "payload-local-api-read",
    pattern:
      /\bpayload\s*\.\s*(find|findByID|findGlobal|findVersions|findVersionByID|count|db)\b/,
    message:
      "Raw Payload Local API read in a public code path. Public content must go through the published-content reader (apps/admin/src/cms/public/published-content-reader.ts).",
  },
  {
    id: "aliased-collection-read",
    // Reads through an aliased client (`client.find({ collection: ... })`).
    // The lookbehind only suppresses a bare `payload` receiver (covered by
    // payload-local-api-read); suffixed identifiers like `adminpayload.find`
    // or `admin_payload.find` must still match this rule.
    pattern:
      /(?<!\bpayload)\.\s*(find|findByID|count)\s*\(\s*\{[^}]*collection\s*:/s,
    message:
      "Aliased Payload collection read in a public code path. Public content must go through the published-content reader.",
  },
  {
    id: "override-access-true",
    pattern: /overrideAccess\s*:\s*true\b/,
    message:
      "`overrideAccess: true` in a public code path skips the public-read access policy. Public reads run overrideAccess: false inside the published-content reader only.",
  },
];

export function normalizeRepoPath(filePath) {
  return filePath.replace(/\\/g, "/").replace(/^\.\//, "");
}

export function isPublicCodePath(relativePath) {
  const normalized = normalizeRepoPath(relativePath);
  return PUBLIC_CODE_PATH_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function isSoleEntryAllowlisted(relativePath) {
  return SOLE_ENTRY_ALLOWLIST.includes(normalizeRepoPath(relativePath));
}

/**
 * Pure per-file checker (unit-tested): returns one violation string per
 * offending line, empty when the file is clean, allowlisted, or outside the
 * public code paths.
 */
export function collectCmsPublicSoleEntryViolationsFromSource(
  relativePath,
  source,
) {
  const normalized = normalizeRepoPath(relativePath);
  if (!isPublicCodePath(normalized) || isSoleEntryAllowlisted(normalized)) {
    return [];
  }

  const violations = [];
  const lines = source.split(/\r?\n/);

  for (const rule of RAW_READ_PATTERNS) {
    const perLinePattern = new RegExp(
      rule.pattern.source,
      rule.pattern.flags.replace("s", ""),
    );

    let matchedALine = false;
    lines.forEach((line, index) => {
      if (perLinePattern.test(line)) {
        matchedALine = true;
        violations.push(
          `${normalized}:${index + 1}: ${rule.message} [${rule.id}]`,
        );
      }
    });

    // A call whose object literal spans lines only matches against the whole
    // source; report it at the top of the file with the rule id.
    if (
      !matchedALine &&
      rule.pattern.flags.includes("s") &&
      rule.pattern.test(source)
    ) {
      violations.push(`${normalized}:1: ${rule.message} [${rule.id}]`);
    }
  }

  return violations;
}

function listPublicPathFiles() {
  const result = spawnSync(
    "git",
    [
      "ls-files",
      "--",
      "apps/admin/app/api/cms/public",
      "apps/admin/src/cms/public",
      "apps/donor/app/(public)",
      "apps/donor/lib/cms",
    ],
    { cwd: repoRoot, encoding: "utf8", stdio: "pipe" },
  );

  if (result.status !== 0) {
    console.error(result.stderr || "error: git ls-files failed");
    process.exit(result.status ?? 1);
  }

  return result.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((file) => /\.(ts|tsx|mts|cts|js|mjs|cjs)$/.test(file));
}

function main() {
  const files = listPublicPathFiles();
  const violations = [];

  for (const file of files) {
    const source = readFileSync(path.join(repoRoot, file), "utf8");
    violations.push(
      ...collectCmsPublicSoleEntryViolationsFromSource(file, source),
    );
  }

  if (violations.length > 0) {
    console.error(
      "CMS public sole-entry check failed. Public code paths must read content only through the published-content reader:",
    );
    console.error(violations.join("\n"));
    process.exit(1);
  }

  console.log(
    `CMS public sole-entry check passed: ${files.length} public-path files, no raw Payload reads outside the choke-point.`,
  );
}

const isDirectRun =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun) {
  main();
}
