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

export const SERVICE_PORT_CALLERS = Object.freeze([
  "apps/admin/src/cms/auth/supabase-strategy.ts",
  "apps/admin/src/cms/tenancy/page-rules.ts",
  "apps/admin/src/cms/tenancy/reference-guard.ts",
  "apps/admin/src/cms/tenancy/tenant-scoped.ts",
  "scripts/cms/lib/cms-fixtures.mjs",
  "scripts/cms/verify-local.mjs",
]);

const SERVICE_PORT_SPECIFIER =
  /(?:^|\/)ports\/service-port(?:\.[cm]?[jt]sx?)?$/;
const OVERRIDE_KEY = "overrideAccess";
const LOCAL_API_METHODS = new Set([
  "count",
  "countGlobalVersions",
  "countVersions",
  "create",
  "delete",
  "duplicate",
  "find",
  "findByID",
  "findDistinct",
  "findGlobal",
  "findGlobalVersionByID",
  "findGlobalVersions",
  "findVersionByID",
  "findVersions",
  "forgotPassword",
  "login",
  "resetPassword",
  "restoreGlobalVersion",
  "restoreVersion",
  "unlock",
  "update",
  "updateGlobal",
  "verifyEmail",
]);

const RULE_MESSAGES = {
  "override-access-true":
    "`overrideAccess: true` outside the CMS service port. Staff calls go through the actor port; trusted writes go through apps/admin/src/cms/ports/service-port.ts.",
  "override-access-value":
    "`overrideAccess` outside the CMS service port takes the literal `false`. Any other value, the shorthand or an assignment of the key hides what the call does.",
  "override-access-computed-key":
    "A computed key in the options of a Payload Local API call: the gate cannot tell whether it names overrideAccess. Write the key out.",
  "override-access-spread":
    "A spread of an object this file gives `overrideAccess`. Write the key in the call itself, as the literal `false`.",
  "service-port-import":
    "Only the modules in SERVICE_PORT_CALLERS import the CMS service port, and none re-exports it. Staff code goes through the actor port.",
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

function unwrap(node) {
  let current = node;
  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isNonNullExpression(current) ||
    ts.isTypeAssertionExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function foldKey(expression) {
  const node = unwrap(expression);
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  if (
    ts.isBinaryExpression(node) &&
    node.operatorToken.kind === ts.SyntaxKind.PlusToken
  ) {
    const left = foldKey(node.left);
    const right = foldKey(node.right);
    return left === null || right === null ? null : left + right;
  }
  if (ts.isTemplateExpression(node)) {
    let text = node.head.text;
    for (const span of node.templateSpans) {
      const part = foldKey(span.expression);
      if (part === null) return null;
      text += part + span.literal.text;
    }
    return text;
  }
  return null;
}

function keyName(name) {
  return ts.isComputedPropertyName(name)
    ? foldKey(name.expression)
    : propertyName(name);
}

function accessedKey(node) {
  if (ts.isPropertyAccessExpression(node)) return node.name.text;
  if (ts.isElementAccessExpression(node)) {
    return foldKey(node.argumentExpression);
  }
  return null;
}

function overrideValueRule(initializer) {
  const value = unwrap(initializer);
  if (value.kind === ts.SyntaxKind.FalseKeyword) return null;
  if (value.kind === ts.SyntaxKind.TrueKeyword) return "override-access-true";
  return "override-access-value";
}

function isLocalApiArgument(objectLiteral) {
  let node = objectLiteral;
  while (
    node.parent &&
    (ts.isParenthesizedExpression(node.parent) ||
      ts.isAsExpression(node.parent) ||
      ts.isSatisfiesExpression(node.parent) ||
      ts.isTypeAssertionExpression(node.parent))
  ) {
    node = node.parent;
  }
  const call = node.parent;
  if (!call || !ts.isCallExpression(call) || !call.arguments.includes(node)) {
    return false;
  }
  const method = accessedKey(unwrap(call.expression));
  return method !== null && LOCAL_API_METHODS.has(method);
}

function isAssignment(node) {
  if (!ts.isBinaryExpression(node)) return false;
  const kind = node.operatorToken.kind;
  return (
    kind === ts.SyntaxKind.EqualsToken ||
    kind === ts.SyntaxKind.BarBarEqualsToken ||
    kind === ts.SyntaxKind.AmpersandAmpersandEqualsToken ||
    kind === ts.SyntaxKind.QuestionQuestionEqualsToken
  );
}

function isServicePortSpecifier(node) {
  return (
    node !== undefined &&
    (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
    SERVICE_PORT_SPECIFIER.test(node.text)
  );
}

function isTypeOnlyImport(node) {
  const clause = node.importClause;
  if (!clause) return false;
  if (clause.isTypeOnly) return true;
  const bindings = clause.namedBindings;
  return (
    clause.name === undefined &&
    bindings !== undefined &&
    ts.isNamedImports(bindings) &&
    bindings.elements.length > 0 &&
    bindings.elements.every((element) => element.isTypeOnly)
  );
}

function objectGivesOverride(node) {
  const value = unwrap(node);
  return (
    ts.isObjectLiteralExpression(value) &&
    value.properties.some(
      (property) =>
        property.name !== undefined && keyName(property.name) === OVERRIDE_KEY,
    )
  );
}

function namesGivenOverride(file) {
  const names = new Set();
  const visit = (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      objectGivesOverride(node.initializer)
    ) {
      names.add(node.name.text);
    }
    if (isAssignment(node)) {
      const target = unwrap(node.left);
      if (
        (ts.isPropertyAccessExpression(target) ||
          ts.isElementAccessExpression(target)) &&
        accessedKey(target) === OVERRIDE_KEY &&
        ts.isIdentifier(unwrap(target.expression))
      ) {
        names.add(unwrap(target.expression).text);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return names;
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
  const add = (rule, node, extra = {}) => {
    const { line } = file.getLineAndCharacterOfPosition(node.getStart(file));
    findings.push({ file: relativePath, line: line + 1, rule, ...extra });
  };
  const givers = namesGivenOverride(file);
  const visit = (node) => {
    if (ts.isPropertyAssignment(node)) {
      const name = keyName(node.name);
      if (name === OVERRIDE_KEY) {
        const rule = overrideValueRule(node.initializer);
        if (rule) add(rule, node);
      } else if (
        name === null &&
        ts.isComputedPropertyName(node.name) &&
        isLocalApiArgument(node.parent)
      ) {
        add("override-access-computed-key", node);
      }
    }
    if (
      ts.isShorthandPropertyAssignment(node) &&
      node.name.text === OVERRIDE_KEY
    ) {
      add("override-access-value", node);
    }
    if (
      ts.isSpreadAssignment(node) &&
      ts.isIdentifier(unwrap(node.expression)) &&
      givers.has(unwrap(node.expression).text)
    ) {
      add("override-access-spread", node);
    }
    if (isAssignment(node)) {
      const target = unwrap(node.left);
      if (
        (ts.isPropertyAccessExpression(target) ||
          ts.isElementAccessExpression(target)) &&
        accessedKey(target) === OVERRIDE_KEY &&
        unwrap(node.right).kind !== ts.SyntaxKind.FalseKeyword
      ) {
        add("override-access-value", node);
      }
    }
    if (
      ts.isImportDeclaration(node) &&
      isServicePortSpecifier(node.moduleSpecifier) &&
      !isTypeOnlyImport(node)
    ) {
      add("service-port-import", node);
    }
    if (
      ts.isExportDeclaration(node) &&
      isServicePortSpecifier(node.moduleSpecifier) &&
      !node.isTypeOnly
    ) {
      add("service-port-import", node, { reexport: true });
    }
    if (
      ts.isImportEqualsDeclaration(node) &&
      !node.isTypeOnly &&
      ts.isExternalModuleReference(node.moduleReference) &&
      isServicePortSpecifier(node.moduleReference.expression)
    ) {
      add("service-port-import", node);
    }
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === "require")) &&
      isServicePortSpecifier(node.arguments[0])
    ) {
      add("service-port-import", node);
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
  {
    allowlist = INVENTORY_ALLOWLIST,
    callers = SERVICE_PORT_CALLERS,
    reportStale = true,
  } = {},
) {
  const listedCaller = (finding) =>
    finding.rule === "service-port-import" &&
    !finding.reexport &&
    callers.includes(finding.file);
  const outside = findings.filter(
    (finding) => finding.file !== SERVICE_PORT_FILE && !listedCaller(finding),
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
  for (const file of reportStale ? callers : []) {
    const imports = findings.some(
      (finding) =>
        finding.file === file && finding.rule === "service-port-import",
    );
    if (!imports) {
      failures.push({
        file,
        line: 0,
        rule: "service-port-import",
        message:
          "Stale service-port caller: this module no longer imports the port; remove it from SERVICE_PORT_CALLERS.",
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
    for (const finding of findings) {
      process.stdout.write(
        `${finding.file}:${finding.line}: ${finding.rule}\n`,
      );
    }
    process.stdout.write(
      `CMS override inventory: ${findings.length} sites, all in the service port or listed.\n`,
    );
  }
}
