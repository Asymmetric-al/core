import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { globSync } from "glob";
import {
  ScriptKind,
  ScriptTarget,
  SyntaxKind,
  createSourceFile,
  forEachChild,
  isCallExpression,
  isExportDeclaration,
  isExpressionStatement,
  isIdentifier,
  isImportDeclaration,
  isNamedExports,
  isNamedImports,
  isStringLiteral,
  isStringLiteralLike,
} from "typescript";
import { describe, expect, it } from "vitest";

import type { Node } from "typescript";

/**
 * Client code must not reach a module that needs the request (AL-2675).
 *
 * `@asym/auth/context` reads the request through `next/headers`, and
 * `server-only` marks a module that must never ship to the browser. A client
 * component that imports, at any depth, a value from either of them breaks
 * `next build`, while the development server does not notice. The WP2a sweep
 * did exactly that: `contribution-operations/permissions.ts` began to import
 * `contextCapabilities`, and a client hook reached it through the CRM row
 * actions. This walks the runtime import graph of every `"use client"` module
 * of the product apps and fails on any path to those modules.
 *
 * Type-only imports are erased and are not followed. The walk is static and
 * follows every runtime import of a reached module, so it is stricter than the
 * bundler, which drops re-exports nobody uses; a module that must stay
 * reachable from client code keeps server-only values out of its imports.
 */

const root = fileURLToPath(new URL("../../../", import.meta.url));
const APPS = ["admin", "donor", "missionary"] as const;
const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs"];
const FORBIDDEN_FILES = new Set(["packages/auth/context.ts"]);
const FORBIDDEN_SPECIFIERS = new Set(["next/headers", "server-only"]);

type PackageExports = Map<string, string>;

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function exportTarget(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const conditions = value as Record<string, unknown>;
    for (const key of ["import", "default", "require", "types"]) {
      const target = exportTarget(conditions[key]);
      if (target) return target;
    }
  }
  return null;
}

/** Workspace packages by name: their directory and export map. */
function workspacePackages(): Map<
  string,
  { dir: string; exports: PackageExports }
> {
  const packages = new Map<string, { dir: string; exports: PackageExports }>();
  for (const manifest of globSync("packages/*/package.json", { cwd: root })) {
    const dir = dirname(manifest);
    const json = readJson(join(root, manifest)) as {
      name?: string;
      exports?: Record<string, unknown> | string;
    };
    if (!json.name) continue;
    const exports: PackageExports = new Map();
    if (typeof json.exports === "string") {
      exports.set(".", json.exports);
    } else if (json.exports) {
      for (const [key, value] of Object.entries(json.exports)) {
        const target = exportTarget(value);
        if (target) exports.set(key, target);
      }
    }
    packages.set(json.name, { dir, exports });
  }
  return packages;
}

const PACKAGES = workspacePackages();

function resolveFile(base: string): string | null {
  const candidates = [
    base,
    ...SOURCE_EXTENSIONS.map((extension) => base + extension),
    ...SOURCE_EXTENSIONS.map((extension) => join(base, "index" + extension)),
  ];
  for (const candidate of candidates) {
    const absolute = join(root, candidate);
    if (
      existsSync(absolute) &&
      !absolute.endsWith("/") &&
      hasExtension(candidate)
    ) {
      return candidate.replaceAll("\\", "/");
    }
  }
  return null;
}

function hasExtension(path: string) {
  return SOURCE_EXTENSIONS.some((extension) => path.endsWith(extension));
}

function resolveWorkspaceSpecifier(specifier: string): string | null {
  const parts = specifier.split("/");
  const name = specifier.startsWith("@")
    ? parts.slice(0, 2).join("/")
    : parts[0];
  const workspace = name ? PACKAGES.get(name) : undefined;
  if (!workspace) return null;
  const subpath = "." + specifier.slice(name.length);
  const exact = workspace.exports.get(subpath);
  if (exact) return resolveFile(join(workspace.dir, exact));
  for (const [pattern, target] of workspace.exports) {
    const star = pattern.indexOf("*");
    if (star < 0) continue;
    const prefix = pattern.slice(0, star);
    const suffix = pattern.slice(star + 1);
    if (subpath.startsWith(prefix) && subpath.endsWith(suffix)) {
      const middle = subpath.slice(
        prefix.length,
        subpath.length - suffix.length,
      );
      return resolveFile(join(workspace.dir, target.replace("*", middle)));
    }
  }
  return null;
}

/** A resolved repository file, a forbidden specifier, or nothing (external). */
function resolveImport(from: string, specifier: string): string | null {
  if (FORBIDDEN_SPECIFIERS.has(specifier)) return specifier;
  if (specifier.startsWith("."))
    return resolveFile(join(dirname(from), specifier));
  if (specifier.startsWith("@/")) {
    const app = from.match(/^apps\/([^/]+)\//)?.[1];
    return app ? resolveFile(join("apps", app, specifier.slice(2))) : null;
  }
  return resolveWorkspaceSpecifier(specifier);
}

function isUseClient(text: string, path: string): boolean {
  const source = createSourceFile(
    path,
    text,
    ScriptTarget.Latest,
    false,
    scriptKind(path),
  );
  for (const statement of source.statements) {
    if (
      !isExpressionStatement(statement) ||
      !isStringLiteral(statement.expression)
    ) {
      return false;
    }
    if (statement.expression.text === "use client") return true;
  }
  return false;
}

function scriptKind(path: string) {
  return path.endsWith(".tsx") || path.endsWith(".jsx")
    ? ScriptKind.TSX
    : ScriptKind.TS;
}

/** Module specifiers a file imports at run time (type-only imports are erased). */
function runtimeSpecifiers(path: string): string[] {
  const text = readFileSync(join(root, path), "utf8");
  const source = createSourceFile(
    path,
    text,
    ScriptTarget.Latest,
    false,
    scriptKind(path),
  );
  const specifiers: string[] = [];
  const visit = (node: Node) => {
    if (
      isImportDeclaration(node) &&
      isStringLiteralLike(node.moduleSpecifier)
    ) {
      const clause = node.importClause;
      const typeOnly =
        clause?.isTypeOnly ||
        (clause &&
          !clause.name &&
          clause.namedBindings &&
          isNamedImports(clause.namedBindings) &&
          clause.namedBindings.elements.length > 0 &&
          clause.namedBindings.elements.every((element) => element.isTypeOnly));
      if (!typeOnly) specifiers.push(node.moduleSpecifier.text);
      return;
    }
    if (
      isExportDeclaration(node) &&
      node.moduleSpecifier &&
      isStringLiteralLike(node.moduleSpecifier)
    ) {
      const typeOnly =
        node.isTypeOnly ||
        (node.exportClause &&
          isNamedExports(node.exportClause) &&
          node.exportClause.elements.length > 0 &&
          node.exportClause.elements.every((element) => element.isTypeOnly));
      if (!typeOnly) specifiers.push(node.moduleSpecifier.text);
      return;
    }
    if (
      isCallExpression(node) &&
      (node.expression.kind === SyntaxKind.ImportKeyword ||
        (isIdentifier(node.expression) &&
          node.expression.text === "require")) &&
      node.arguments[0] &&
      isStringLiteralLike(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    }
    forEachChild(node, visit);
  };
  visit(source);
  return specifiers;
}

function clientEntries(): string[] {
  return APPS.flatMap((app) =>
    globSync(`apps/${app}/**/*.{ts,tsx}`, {
      cwd: root,
      nodir: true,
      ignore: [
        "**/.next/**",
        "**/node_modules/**",
        "**/*.test.*",
        "**/*.spec.*",
      ],
    }),
  )
    .map((path) => path.replaceAll("\\", "/"))
    .filter((path) => isUseClient(readFileSync(join(root, path), "utf8"), path))
    .sort();
}

/** For each forbidden module reached, the shortest path from a client entry. */
function findClientPathsToServerOnly(entries: string[]): string[][] {
  const parent = new Map<string, string | null>();
  const queue: string[] = [];
  for (const entry of entries) {
    if (!parent.has(entry)) {
      parent.set(entry, null);
      queue.push(entry);
    }
  }
  const hits: string[] = [];
  const edgesCache = new Map<string, string[]>();
  while (queue.length > 0) {
    const current = queue.shift() as string;
    if (FORBIDDEN_FILES.has(current) || FORBIDDEN_SPECIFIERS.has(current)) {
      hits.push(current);
      continue;
    }
    if (!hasExtension(current)) continue;
    let edges = edgesCache.get(current);
    if (!edges) {
      edges = runtimeSpecifiers(current)
        .map((specifier) => resolveImport(current, specifier))
        .filter((target): target is string => target !== null);
      edgesCache.set(current, edges);
    }
    for (const target of edges) {
      if (parent.has(target)) continue;
      parent.set(target, current);
      queue.push(target);
    }
  }
  return hits.map((hit) => {
    const path: string[] = [];
    for (let node: string | null = hit; node; node = parent.get(node) ?? null) {
      path.unshift(node);
    }
    return path;
  });
}

describe("client module graph (AL-2675)", () => {
  it("finds the client entries of every product app", () => {
    const entries = clientEntries();
    for (const app of APPS) {
      expect(entries.some((entry) => entry.startsWith(`apps/${app}/`))).toBe(
        true,
      );
    }
  });

  it("reaches no module that needs the request or is marked server-only", () => {
    const paths = findClientPathsToServerOnly(clientEntries());
    expect(paths.map((path) => path.join("\n  -> "))).toEqual([]);
  });

  it("keeps the CRM gift-history row actions off the request context", () => {
    // The path the sweep opened: the gift-history controller (client code)
    // reaches the contribution action table through the CRM row actions.
    const controller =
      "apps/admin/app/(app)/crm/use-gift-history-view-controller.ts";
    expect(existsSync(join(root, controller))).toBe(true);
    expect(findClientPathsToServerOnly([controller])).toEqual([]);
  });
});
