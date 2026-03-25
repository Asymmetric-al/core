#!/usr/bin/env node
/**
 * Non-blocking audit: scan repo tsconfig JSON files for patterns relevant to TS 6/7 prep.
 * Does not modify files. Exits 0 always (informational only).
 *
 * Policy source: TypeScript TSConfig reference + official TS 6/7 announcements
 * (see docs/guides/typescript-6-readiness.md).
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skipDir = new Set([
  "node_modules",
  "dist",
  ".next",
  ".turbo",
  "coverage",
  ".git",
]);

/** @param {string} dir */
function* walkTsconfigs(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (skipDir.has(e.name)) continue;
      yield* walkTsconfigs(p);
    } else if (e.isFile() && /^tsconfig.*\.json$/i.test(e.name)) {
      yield p;
    }
  }
}

/** @param {string} path */
function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

const findings = {
  baseUrl: [],
  moduleResolutionNode: [],
  moduleResolutionNode10: [],
};

for (const file of walkTsconfigs(root)) {
  const rel = relative(root, file).replaceAll("\\", "/");
  if (rel.startsWith("vendor/")) continue;

  const j = readJson(file);
  if (!j?.compilerOptions) continue;
  const o = j.compilerOptions;

  if (o.baseUrl !== undefined) {
    findings.baseUrl.push(rel);
  }
  const mr = o.moduleResolution;
  if (typeof mr === "string") {
    const m = mr.toLowerCase();
    if (m === "node" || m === "node10") findings.moduleResolutionNode10.push(rel);
    if (m === "nodenext" || m === "node16") findings.moduleResolutionNode.push(rel);
  }
}

console.log("tsconfig future-readiness audit (informational)\n");
console.log("baseUrl present (avoid in new code; TS 7 removes baseUrl):");
console.log(findings.baseUrl.length ? findings.baseUrl.map((x) => `  - ${x}`).join("\n") : "  (none under repo root except vendor/)");
console.log("\nmoduleResolution node (deprecated node10 / \"node\"):");
console.log(
  findings.moduleResolutionNode10.length
    ? findings.moduleResolutionNode10.map((x) => `  - ${x}`).join("\n")
    : "  (none under repo root except vendor/)",
);
console.log("\nmoduleResolution node16/nodenext (informational):");
console.log(
  findings.moduleResolutionNode.length
    ? findings.moduleResolutionNode.map((x) => `  - ${x}`).join("\n")
    : "  (none)",
);
