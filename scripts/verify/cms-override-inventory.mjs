#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

export const SERVICE_PORT_FILE = "apps/admin/src/cms/ports/service-port.ts";

export const INVENTORY_ALLOWLIST = Object.freeze([
  Object.freeze({
    file: "apps/admin/src/cms/document-locks.ts",
    rule: "payload-db",
    count: 1,
    reason:
      "The lock collection's access reads lock rows directly to find their documents, then filters every one through the person's own read access.",
  }),
  Object.freeze({
    file: "scripts/cms/lib/payload-qualification-body.mjs",
    rule: "override-access-true",
    count: 2,
    reason:
      "cms:qualify proves that an overrideAccess read sees what anonymous Local API calls are refused, and that a bulk delete with overrideLock false keeps a locked record whose id is not RFC 4122.",
  }),
  Object.freeze({
    file: "scripts/cms/lib/payload-qualification-body.mjs",
    rule: "payload-db",
    count: 3,
    reason:
      "cms:qualify reads current_user and the version rows through Payload's own pool, and writes a lock row as Payload's form-state does, to prove its behaviour on the pin.",
  }),
]);

export const SCAN_ROOTS = ["apps", "packages", "scripts/cms"];
const SOURCE_RE = /\.(?:ts|tsx|mts|cts|js|jsx|mjs|cjs)$/;
const SKIPPED_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  ".turbo",
  "coverage",
  ".eve",
  ".nitro",
  ".output",
  ".vercel",
]);
const TEST_NAME_RE = /\.(?:test|spec)\.[cm]?[jt]sx?$|\.d\.ts$/;

const RULE_MESSAGES = {
  "override-access-true":
    "`overrideAccess: true` outside the CMS service port. Staff calls go through the actor port; trusted writes go through apps/admin/src/cms/ports/service-port.ts.",
  "payload-db":
    "Direct `payload.db` access outside the CMS service port. Use the Local API through the actor or service port.",
};

function propertyName(node) {
  if (ts.isIdentifier(node) || ts.isPrivateIdentifier(node)) return node.text;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  return null;
}

function endsWithPayload(expression) {
  const node = ts.isNonNullExpression(expression)
    ? expression.expression
    : expression;
  if (ts.isIdentifier(node)) return node.text === "payload";
  if (ts.isPropertyAccessExpression(node)) return node.name.text === "payload";
  if (ts.isElementAccessExpression(node)) {
    return propertyName(node.argumentExpression) === "payload";
  }
  return false;
}

function isDbOfPayload(node) {
  if (ts.isPropertyAccessExpression(node)) {
    return node.name.text === "db" && endsWithPayload(node.expression);
  }
  if (ts.isElementAccessExpression(node)) {
    return (
      propertyName(node.argumentExpression) === "db" &&
      endsWithPayload(node.expression)
    );
  }
  return false;
}

export function collectOverrideInventoryFindings(relativePath, source) {
  const kind = /\.[cm]?jsx?$/.test(relativePath)
    ? ts.ScriptKind.JSX
    : relativePath.endsWith(".tsx")
      ? ts.ScriptKind.TSX
      : ts.ScriptKind.TS;
  const file = ts.createSourceFile(
    relativePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    kind,
  );
  const findings = [];
  const add = (rule, node) => {
    const { line } = file.getLineAndCharacterOfPosition(node.getStart(file));
    findings.push({ file: relativePath, line: line + 1, rule });
  };
  const visit = (node) => {
    if (
      ts.isPropertyAssignment(node) &&
      propertyName(node.name) === "overrideAccess" &&
      node.initializer.kind === ts.SyntaxKind.TrueKeyword
    ) {
      add("override-access-true", node);
    }
    if (
      (ts.isPropertyAccessExpression(node) ||
        ts.isElementAccessExpression(node)) &&
      isDbOfPayload(node.expression)
    ) {
      add("payload-db", node);
    } else if (
      isDbOfPayload(node) &&
      !(
        node.parent &&
        (ts.isPropertyAccessExpression(node.parent) ||
          ts.isElementAccessExpression(node.parent)) &&
        node.parent.expression === node
      )
    ) {
      add("payload-db", node);
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return findings;
}

export function judgeOverrideInventory(
  findings,
  { allowlist = INVENTORY_ALLOWLIST, reportStale = true } = {},
) {
  const outside = findings.filter(
    (finding) => finding.file !== SERVICE_PORT_FILE,
  );
  const grouped = new Map();
  for (const finding of outside) {
    const key = `${finding.file}\u0000${finding.rule}`;
    grouped.set(key, [...(grouped.get(key) ?? []), finding]);
  }
  const failures = [];
  for (const [key, list] of grouped) {
    const [file, rule] = key.split("\u0000");
    const entry = allowlist.find(
      (candidate) => candidate.file === file && candidate.rule === rule,
    );
    if (entry && list.length === entry.count) continue;
    for (const finding of list) {
      failures.push({
        ...finding,
        message: entry
          ? `${RULE_MESSAGES[rule]} (listed ${entry.count}, found ${list.length})`
          : RULE_MESSAGES[rule],
      });
    }
  }
  for (const entry of reportStale ? allowlist : []) {
    const count = grouped.get(`${entry.file}\u0000${entry.rule}`)?.length ?? 0;
    if (count === 0) {
      failures.push({
        file: entry.file,
        line: 0,
        rule: entry.rule,
        message:
          "Stale inventory entry: nothing to list here any more; remove it.",
      });
    }
  }
  return failures.sort(
    (a, b) => a.file.localeCompare(b.file) || a.line - b.line,
  );
}

function listSources(root) {
  const absolute = path.join(repoRoot, root);
  const out = [];
  const walk = (directory) => {
    let entries;
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRS.has(entry.name)) walk(full);
      } else if (
        entry.isFile() &&
        SOURCE_RE.test(entry.name) &&
        !TEST_NAME_RE.test(entry.name)
      ) {
        out.push(path.relative(repoRoot, full).split(path.sep).join("/"));
      }
    }
  };
  walk(absolute);
  return out;
}

export function runOverrideInventory({ roots = SCAN_ROOTS } = {}) {
  const findings = roots
    .flatMap(listSources)
    .flatMap((file) =>
      collectOverrideInventoryFindings(
        file,
        readFileSync(path.join(repoRoot, file), "utf8"),
      ),
    );
  return { findings, failures: judgeOverrideInventory(findings) };
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const { findings, failures } = runOverrideInventory();
  if (failures.length > 0) {
    for (const failure of failures) {
      process.stderr.write(
        `${failure.file}:${failure.line}: ${failure.rule}: ${failure.message}\n`,
      );
    }
    process.exitCode = 1;
  } else {
    process.stdout.write(
      `CMS override inventory: ${findings.length} sites, all in the service port or listed.\n`,
    );
  }
}
