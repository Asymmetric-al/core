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
 *   - app-local imports reachable from those entry paths
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

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

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

const PAYLOAD_READ_METHODS = new Set([
  "find",
  "findByID",
  "findGlobal",
  "findVersions",
  "findVersionByID",
  "count",
]);

const ALIASED_READ_METHODS = new Set(["find", "findByID", "count"]);

const RULE_MESSAGES = {
  "payload-local-api-read":
    "Raw Payload Local API read in a public code path. Public content must go through the published-content reader (apps/admin/src/cms/public/published-content-reader.ts).",
  "aliased-collection-read":
    "Aliased Payload collection read in a public code path. Public content must go through the published-content reader.",
  "override-access-true":
    "`overrideAccess: true` in a public code path skips the public-read access policy. Public reads run overrideAccess: false inside the published-content reader only.",
};

const CODE_EXTENSIONS = [".ts", ".tsx", ".mts", ".cts", ".js", ".mjs", ".cjs"];

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

function propertyNameText(name) {
  if (
    ts.isIdentifier(name) ||
    ts.isStringLiteral(name) ||
    ts.isNumericLiteral(name)
  ) {
    return name.text;
  }

  return null;
}

function accessedProperty(expression) {
  if (ts.isPropertyAccessExpression(expression)) {
    return { receiver: expression.expression, name: expression.name.text };
  }

  if (
    ts.isElementAccessExpression(expression) &&
    expression.argumentExpression &&
    ts.isStringLiteral(expression.argumentExpression)
  ) {
    return {
      receiver: expression.expression,
      name: expression.argumentExpression.text,
    };
  }

  return null;
}

function isPayloadReceiver(expression) {
  if (ts.isIdentifier(expression)) {
    return expression.text === "payload";
  }

  const property = accessedProperty(expression);
  return property?.name === "payload";
}

function objectHasCollectionProperty(expression) {
  if (!ts.isObjectLiteralExpression(expression)) {
    return false;
  }

  return expression.properties.some((property) => {
    if (
      !ts.isPropertyAssignment(property) &&
      !ts.isShorthandPropertyAssignment(property)
    ) {
      return false;
    }

    return propertyNameText(property.name) === "collection";
  });
}

function collectIdentifierInitializers(sourceFile) {
  const initializers = new Map();

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer
    ) {
      initializers.set(node.name.text, node.initializer);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return initializers;
}

function isCallbackArgument(argument, identifierInitializers) {
  if (ts.isArrowFunction(argument) || ts.isFunctionExpression(argument)) {
    return true;
  }

  if (!ts.isIdentifier(argument)) {
    return false;
  }

  const initializer = identifierInitializers.get(argument.text);
  return Boolean(
    initializer &&
    (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer)),
  );
}

function shouldFlagAliasedRead(call, identifierInitializers) {
  const firstArgument = call.arguments[0];
  if (!firstArgument) {
    return false;
  }

  if (objectHasCollectionProperty(firstArgument)) {
    return true;
  }

  if (ts.isObjectLiteralExpression(firstArgument)) {
    return false;
  }

  return !isCallbackArgument(firstArgument, identifierInitializers);
}

function collectRawReadViolations(relativePath, source) {
  const normalized = normalizeRepoPath(relativePath);
  const sourceFile = ts.createSourceFile(
    normalized,
    source,
    ts.ScriptTarget.Latest,
    true,
  );
  const identifierInitializers = collectIdentifierInitializers(sourceFile);
  const violations = [];
  const seen = new Set();

  function addViolation(node, id) {
    const line =
      sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line +
      1;
    const key = `${id}:${line}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    violations.push(`${normalized}:${line}: ${RULE_MESSAGES[id]} [${id}]`);
  }

  function visit(node) {
    if (ts.isCallExpression(node)) {
      const property = accessedProperty(node.expression);
      if (property && PAYLOAD_READ_METHODS.has(property.name)) {
        if (isPayloadReceiver(property.receiver)) {
          addViolation(node, "payload-local-api-read");
        } else if (
          ALIASED_READ_METHODS.has(property.name) &&
          shouldFlagAliasedRead(node, identifierInitializers)
        ) {
          addViolation(node, "aliased-collection-read");
        }
      }
    }

    const property = accessedProperty(node);
    if (property?.name === "db" && isPayloadReceiver(property.receiver)) {
      addViolation(node, "payload-local-api-read");
    }

    if (
      ts.isPropertyAssignment(node) &&
      propertyNameText(node.name) === "overrideAccess" &&
      node.initializer.kind === ts.SyntaxKind.TrueKeyword
    ) {
      addViolation(node, "override-access-true");
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return violations;
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

  return collectRawReadViolations(normalized, source);
}

function collectModuleSpecifiers(sourceFile) {
  const specifiers = [];

  for (const statement of sourceFile.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      !statement.importClause?.isTypeOnly &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      specifiers.push(statement.moduleSpecifier.text);
    }

    if (
      ts.isExportDeclaration(statement) &&
      !statement.isTypeOnly &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      specifiers.push(statement.moduleSpecifier.text);
    }
  }

  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0]) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === "require"))
    ) {
      specifiers.push(node.arguments[0].text);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return specifiers;
}

function appRootForFile(relativePath) {
  if (relativePath.startsWith("apps/admin/")) {
    return "apps/admin";
  }

  if (relativePath.startsWith("apps/donor/")) {
    return "apps/donor";
  }

  return null;
}

function resolveAppLocalImport(importer, specifier, availableFiles) {
  const appRoot = appRootForFile(importer);
  if (!appRoot) {
    return null;
  }

  let unresolvedPath;
  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    unresolvedPath = path.posix.join(path.posix.dirname(importer), specifier);
  } else if (specifier.startsWith("@/")) {
    unresolvedPath = path.posix.join(appRoot, specifier.slice(2));
  } else {
    return null;
  }

  const normalized = path.posix.normalize(unresolvedPath);
  if (!normalized.startsWith(`${appRoot}/`)) {
    return null;
  }

  const candidates = [normalized];
  const extension = path.posix.extname(normalized);
  if (CODE_EXTENSIONS.includes(extension)) {
    const withoutExtension = normalized.slice(0, -extension.length);
    for (const codeExtension of CODE_EXTENSIONS) {
      candidates.push(`${withoutExtension}${codeExtension}`);
    }
  } else {
    for (const codeExtension of CODE_EXTENSIONS) {
      candidates.push(`${normalized}${codeExtension}`);
      candidates.push(`${normalized}/index${codeExtension}`);
    }
  }

  return candidates.find((candidate) => availableFiles.has(candidate)) ?? null;
}

export function collectCmsPublicSoleEntryViolationsFromSources(
  entryFiles,
  sources,
) {
  const normalizedSources = new Map(
    [...sources].map(([file, source]) => [normalizeRepoPath(file), source]),
  );
  const availableFiles = new Set(normalizedSources.keys());
  const queue = entryFiles.map(normalizeRepoPath);
  const visited = new Set();
  const violations = [];

  while (queue.length > 0) {
    const file = queue.shift();
    if (visited.has(file)) {
      continue;
    }

    visited.add(file);
    const source = normalizedSources.get(file);
    if (source === undefined) {
      continue;
    }

    if (!isSoleEntryAllowlisted(file)) {
      violations.push(...collectRawReadViolations(file, source));
    }

    const sourceFile = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
    );
    for (const specifier of collectModuleSpecifiers(sourceFile)) {
      const importedFile = resolveAppLocalImport(
        file,
        specifier,
        availableFiles,
      );
      if (importedFile && !visited.has(importedFile)) {
        queue.push(importedFile);
      }
    }
  }

  return violations;
}

function listAppCodeFiles() {
  const result = spawnSync(
    "git",
    ["ls-files", "--", "apps/admin", "apps/donor"],
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
  const files = listAppCodeFiles();
  const sources = new Map(
    files.map((file) => [
      file,
      readFileSync(path.join(repoRoot, file), "utf8"),
    ]),
  );
  const publicEntryFiles = files.filter(isPublicCodePath);
  const violations = collectCmsPublicSoleEntryViolationsFromSources(
    publicEntryFiles,
    sources,
  );

  if (violations.length > 0) {
    console.error(
      "CMS public sole-entry check failed. Public code paths must read content only through the published-content reader:",
    );
    console.error(violations.join("\n"));
    process.exit(1);
  }

  console.log(
    `CMS public sole-entry check passed: ${publicEntryFiles.length} public-path files and their app-local imports, no raw Payload reads outside the choke-point.`,
  );
}

const isDirectRun =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun) {
  main();
}
