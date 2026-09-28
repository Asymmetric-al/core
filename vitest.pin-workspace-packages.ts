import fs from "node:fs";
import path from "node:path";

import type { Plugin } from "vitest/config";

/**
 * Pin `@asym/*` workspace packages to this checkout.
 *
 * Worktrees often symlink the root `node_modules` at another clone while
 * `bun install` creates per-package `node_modules/@asym/*` links into the
 * worktree. `vi.mock("@asym/...")` then patches a different copy than the
 * source under test imports. Resolving those specifiers here makes the mock
 * and the importer share one module id.
 */

const WORKSPACE_GROUPS = ["apps", "packages", "tooling"] as const;
const FILE_EXTENSIONS = [".ts", ".tsx", ".js", ".mjs", ".jsx"] as const;
const INDEX_FILES = ["index.ts", "index.tsx", "index.js", "index.mjs"] as const;

export interface WorkspacePackage {
  name: string;
  dir: string;
  hasExports: boolean;
}

function readJson(filePath: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<
    string,
    unknown
  >;
}

export function discoverWorkspacePackages(rootDir: string): WorkspacePackage[] {
  const packages: WorkspacePackage[] = [];

  for (const group of WORKSPACE_GROUPS) {
    const groupDir = path.join(rootDir, group);
    if (!fs.existsSync(groupDir)) continue;

    for (const entry of fs.readdirSync(groupDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const dir = path.join(groupDir, entry.name);
      const pkgPath = path.join(dir, "package.json");
      if (!fs.existsSync(pkgPath)) continue;

      const pkg = readJson(pkgPath);
      if (typeof pkg.name !== "string" || !pkg.name.startsWith("@asym/")) {
        continue;
      }

      packages.push({
        name: pkg.name,
        dir,
        hasExports: Object.hasOwn(pkg, "exports"),
      });
    }
  }

  return packages.toSorted(
    (left, right) => right.name.length - left.name.length,
  );
}

export function resolveExistingModule(base: string): string | null {
  if (fs.existsSync(base)) {
    const stat = fs.statSync(base);
    if (stat.isFile()) return base;
    if (stat.isDirectory()) {
      for (const indexFile of INDEX_FILES) {
        const candidate = path.join(base, indexFile);
        if (fs.existsSync(candidate)) return candidate;
      }
    }
  }

  for (const ext of FILE_EXTENSIONS) {
    const candidate = `${base}${ext}`;
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

export function findWorkspacePackage(
  packages: WorkspacePackage[],
  source: string,
): { pkg: WorkspacePackage; subpath: string } | undefined {
  const pkg = packages.find(
    (candidate) =>
      source === candidate.name || source.startsWith(`${candidate.name}/`),
  );
  if (!pkg) return undefined;
  const subpath = source === pkg.name ? "" : source.slice(pkg.name.length + 1);
  return { pkg, subpath };
}

export function pinWorkspacePackages(rootDir: string): Plugin {
  const packages = discoverWorkspacePackages(rootDir);

  return {
    name: "core:pin-workspace-packages-to-checkout",
    enforce: "pre",
    async resolveId(source, _importer, options) {
      if (!source.startsWith("@asym/")) return null;
      const match = findWorkspacePackage(packages, source);
      if (!match) return null;
      if (match.pkg.hasExports) {
        // Package self-reference anchors Vite's export/condition resolution to
        // this checkout even when node_modules points at another worktree.
        const resolved = await this.resolve(
          source,
          path.join(match.pkg.dir, "package.json"),
          {
            ...options,
            skipSelf: true,
          },
        );
        if (!resolved) {
          throw new Error(
            `Cannot resolve declared workspace export: ${source}`,
          );
        }
        return resolved;
      }
      const base =
        match.subpath.length === 0
          ? match.pkg.dir
          : path.join(match.pkg.dir, match.subpath);
      return resolveExistingModule(base);
    },
  };
}
