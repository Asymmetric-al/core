/**
 * #2253 shared fixtures. Spec: Final spec r1 (issue comment 6384971691),
 * approved by Samson (6384983346); addendum 1 (6385080256) replaces §3 and §6.
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 *
 * The spec adds no migration, so no migration-text check exists here.
 */
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

export const CATALOG = "scripts/verify/tenant-rls-catalog.mjs";
export const VERIFIER = "scripts/verify/supabase-migrations.mjs";
export const GATE = "scripts/verify/service-role-client-gate.mjs";
export const ALLOWLIST = "docs/security/service-role-client-allowlist.json";
export const EXCEPTIONS = "docs/security/rls-deny-by-default-exceptions.json";
export const DOC = "docs/security/tenant-guard.md";
export const MARKER = "-- tenant-rls-catalog-gate:v1";
export const FACTORY = "@asym/database/supabase/admin";
export const KINDS = [
  "admin_client",
  "service_role_key",
  "workflow_admin_wrapper",
  "operation_admin_context",
] as const;
export type Kind = (typeof KINDS)[number];
/** Addendum 1 §6 criterion 9: sites (files) per kind at c541b84b. */
export const TOTALS: Record<Kind, [number, number]> = {
  admin_client: [81, 62],
  service_role_key: [29, 13],
  workflow_admin_wrapper: [8, 4],
  operation_admin_context: [70, 38],
};
/** Addendum 1 §3 key-name rule, verbatim. */
export const KEY_RE =
  /(?<![A-Za-z0-9_])(SUPABASE_)?SERVICE_ROLE_KEY(?![A-Za-z0-9_])/g;

export const read = (f: string) =>
  existsSync(f) ? readFileSync(f, "utf8") : "";

/** Every temp dir this suite made, so teardown removes exactly those. */
const made: string[] = [];
/** A fresh /tmp/acc2253-<prefix>* dir, tracked for {@link removeTempDirs}. */
export function tempDir(prefix = "") {
  const d = mkdtempSync(path.join(tmpdir(), `acc2253-${prefix}`));
  made.push(d);
  return d;
}
/** Teardown (afterAll): removes only the dirs this suite created. */
export function removeTempDirs() {
  for (const d of made.splice(0)) rmSync(d, { recursive: true, force: true });
}

/** Copies a repo module and every relative module it imports into `root`. */
function copyModule(rel: string, root: string, seen = new Set<string>()) {
  if (seen.has(rel) || !existsSync(rel)) return;
  seen.add(rel);
  mkdirSync(path.join(root, path.dirname(rel)), { recursive: true });
  cpSync(rel, path.join(root, rel));
  const re = /(?:from|import\(|require\()\s*["'](\.{1,2}\/[^"']+)["']/g;
  for (const m of read(rel).matchAll(re))
    copyModule(path.posix.join(path.posix.dirname(rel), m[1]!), root, seen);
}

/**
 * A throwaway repo root holding copies of `modules`, the given files, a
 * symlinked node_modules and a git index (so cwd-, import.meta- and git-based
 * root resolution all land here).
 */
export function tempRepo(modules: string[], files: Record<string, string>) {
  const root = tempDir();
  for (const m of modules) copyModule(m, root);
  for (const [f, text] of Object.entries(files)) {
    mkdirSync(path.join(root, path.dirname(f)), { recursive: true });
    writeFileSync(path.join(root, f), text);
  }
  symlinkSync(path.resolve("node_modules"), path.join(root, "node_modules"));
  writeFileSync(path.join(root, ".gitignore"), "node_modules\n.next\ndist\n");
  for (const args of [
    ["init", "-q"],
    ["add", "-A"],
  ])
    spawnSync("git", args, { cwd: root });
  return root;
}

export type Entry = {
  file: string;
  kind: string;
  count: number;
  reason?: string;
};
export const allowlist = (entries: Entry[]) =>
  JSON.stringify({
    version: 1,
    ruling: "Samson Q4, Oct 24, 2026",
    frozen_at: "c541b84b",
    entries: entries.map((e) => ({
      lines: [],
      path_ref: "U",
      follow_up: "#2263",
      reason: "acc2253 fixture",
      ...e,
    })),
  });

/** Runs the gate CLI from a temp repo with the given allowlist entries. */
export function gate(files: Record<string, string>, entries: Entry[]) {
  const root = tempRepo([GATE], { ...files, [ALLOWLIST]: allowlist(entries) });
  const r = spawnSync(process.execPath, [GATE], {
    cwd: root,
    encoding: "utf8",
  });
  return { status: r.status, out: `${r.stdout}\n${r.stderr}` };
}

/** Criterion 10: one output line names the file, the kind and each `:line`. */
export function names(
  out: string,
  file: string,
  kind: string,
  lines: number[] = [],
) {
  return out
    .split("\n")
    .some(
      (l) =>
        l.includes(file) &&
        l.includes(kind) &&
        lines.every((n) => new RegExp(`:${n}(?!\\d)`).test(l)),
    );
}
