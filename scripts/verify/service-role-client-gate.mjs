#!/usr/bin/env node
// Service-role client gate (#2253, Samson Q4 + addendum 1). Fails when code
// under apps/, packages/, scripts/ or tooling/ gains a bare service-role
// client site beyond the frozen, shrink-only allowlist in
// docs/security/service-role-client-allowlist.json. Run by test:unit and by
// `bun run verify:service-role-clients`. See docs/security/tenant-guard.md.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import ts from "typescript";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
export const ALLOWLIST_PATH =
  "docs/security/service-role-client-allowlist.json";
export const KINDS = [
  "admin_client",
  "service_role_key",
  "workflow_admin_wrapper",
  "operation_admin_context",
];
// The key name is assembled here so this file holds no site of its own and is
// scanned like any other file, with no self-exemption.
const KEY_NAME = ["SERVICE", "ROLE", "KEY"].join("_");
const KEY_RE = new RegExp(
  `(?<![A-Za-z0-9_])(SUPABASE_)?${KEY_NAME}(?![A-Za-z0-9_])`,
  "g",
);
/** The modules whose bindings are tracked, by the site kind they produce. */
const MODULES = [
  {
    kind: "admin_client",
    file: "packages/database/supabase/admin",
    alias: "@asym/database/supabase/admin",
    names: ["getAdminClient", "createAdminClient"],
  },
  {
    kind: "workflow_admin_wrapper",
    file: "packages/api/src/workflows/admin-client",
    names: ["requireWorkflowAdminClient"],
  },
  {
    kind: "operation_admin_context",
    file: "packages/api/src/shared/with-operation",
    names: ["withOperation"],
  },
];
const SCAN_ROOTS = ["apps", "packages", "scripts", "tooling"];
const SOURCE_RE = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/;
// Root tests/ only; *.test.*, *.spec.* and *.d.ts by file name; the
// directory names below at any depth.
const EXCLUDED_DIR_RE = /(^|\/)(__tests__|e2e|node_modules|\.next|dist)\//;
const EXCLUDED_NAME_RE = /\.d\.ts$|\.(test|spec)\./;
export const isExcluded = (file) =>
  file.startsWith("tests/") ||
  EXCLUDED_NAME_RE.test(path.posix.basename(file)) ||
  EXCLUDED_DIR_RE.test(file);
export const isExempt = (file) =>
  file === "packages/database/supabase/admin.ts" ||
  file.startsWith("packages/api/src/identity/");

// Frozen at develop c541b84b. Shrink-only: lower a count or delete a row in
// the same PR that removes sites. Raising or adding a row needs a new ruling;
// the unit test pins this block's SHA-256 and totals.
const CEILING_ROWS = `
apps/admin/lib/admin-access.ts admin_client 1
apps/admin/src/cms/auth/supabase-strategy.ts service_role_key 1
apps/admin/src/cms/collections/page-builders.ts admin_client 2
apps/admin/src/cms/create-from-template-endpoint.ts admin_client 2
packages/api/src/admin/comments/comment.ts admin_client 2
packages/api/src/admin/comments/index.ts admin_client 1
packages/api/src/admin/contribution-batches/route.ts operation_admin_context 2
packages/api/src/admin/contribution-operations/route.ts operation_admin_context 4
packages/api/src/admin/contributions/index.ts admin_client 1
packages/api/src/admin/contributions/offline-route.ts operation_admin_context 1
packages/api/src/admin/contributions/reconcile.ts operation_admin_context 1
packages/api/src/admin/contributions/replay.ts operation_admin_context 1
packages/api/src/admin/contributions/staged-gifts.ts operation_admin_context 4
packages/api/src/admin/contributions/summary.ts admin_client 1
packages/api/src/admin/crm/detail/index.ts operation_admin_context 1
packages/api/src/admin/crm/index.ts admin_client 1
packages/api/src/admin/crm/notes/index.ts operation_admin_context 2
packages/api/src/admin/crm/relationships/index.ts operation_admin_context 1
packages/api/src/admin/crm/reports/export.ts operation_admin_context 1
packages/api/src/admin/crm/reports/index.ts operation_admin_context 1
packages/api/src/admin/crm/table-preferences/route.ts operation_admin_context 7
packages/api/src/admin/fund-directory.ts operation_admin_context 1
packages/api/src/admin/locations/index.ts admin_client 1
packages/api/src/admin/member-care/mutations.ts admin_client 1
packages/api/src/admin/mission-control-automations/route.ts operation_admin_context 2
packages/api/src/admin/mission-control-tasks/route.ts operation_admin_context 1
packages/api/src/admin/missionary-directory.ts operation_admin_context 1
packages/api/src/admin/posts/index.ts admin_client 1
packages/api/src/admin/posts/post.ts admin_client 1
packages/api/src/admin/support-hub/adapter/supabase.ts admin_client 1
packages/api/src/admin/support-hub/inbound-retry.ts operation_admin_context 1
packages/api/src/admin/support-hub/inbound-route.ts operation_admin_context 2
packages/api/src/admin/support-hub/inbound-routes.ts operation_admin_context 2
packages/api/src/admin/support-hub/move.ts operation_admin_context 3
packages/api/src/admin/support/index.ts admin_client 1
packages/api/src/admin/support/loaders.ts admin_client 1
packages/api/src/admin/support/ticket.ts admin_client 1
packages/api/src/admin/support/tickets.ts admin_client 1
packages/api/src/admin/support/tickets.ts operation_admin_context 1
packages/api/src/admin/users.ts operation_admin_context 1
packages/api/src/admin/workflows/notification-policy.ts operation_admin_context 2
packages/api/src/admin/workflows/summaries.ts operation_admin_context 1
packages/api/src/auth/cleanup-demo-users.ts admin_client 1
packages/api/src/donate/index.ts admin_client 1
packages/api/src/donate/index.ts operation_admin_context 1
packages/api/src/donate/outbox.ts admin_client 1
packages/api/src/donations/index.ts admin_client 1
packages/api/src/donor-portal/billing.ts operation_admin_context 1
packages/api/src/donor-portal/index.ts admin_client 1
packages/api/src/donor-portal/index.ts operation_admin_context 1
packages/api/src/donor-portal/route-helpers.ts admin_client 1
packages/api/src/email/assets.ts admin_client 1
packages/api/src/email/settings-store.ts admin_client 1
packages/api/src/email/template-store.ts admin_client 1
packages/api/src/email/template-test-send.ts admin_client 1
packages/api/src/email/test-send.ts admin_client 1
packages/api/src/email/webhooks/resend.ts admin_client 1
packages/api/src/eve/admin-memory/route.ts operation_admin_context 4
packages/api/src/eve/approval-budget/route.ts operation_admin_context 2
packages/api/src/eve/engineering-monitors/route.ts operation_admin_context 1
packages/api/src/eve/governance/route.ts operation_admin_context 3
packages/api/src/eve/launch-readiness/route.ts operation_admin_context 2
packages/api/src/eve/model-policy/route.ts operation_admin_context 3
packages/api/src/eve/notifications/route.ts operation_admin_context 2
packages/api/src/eve/retention/route.ts operation_admin_context 2
packages/api/src/eve/sandbox/control.ts admin_client 3
packages/api/src/eve/sandbox/guardrails.ts service_role_key 1
packages/api/src/eve/session-ownership/route-auth.ts admin_client 2
packages/api/src/follower-requests/index.ts admin_client 1
packages/api/src/follower-requests/request.ts admin_client 2
packages/api/src/health/db.ts admin_client 1
packages/api/src/missionaries/index.ts admin_client 1
packages/api/src/missionaries/metrics.ts admin_client 1
packages/api/src/missionary-portal/donors.ts operation_admin_context 1
packages/api/src/missionary-portal/index.ts operation_admin_context 1
packages/api/src/missionary-portal/route-helpers.ts admin_client 1
packages/api/src/missionary-portal/tasks.ts operation_admin_context 2
packages/api/src/pdf-templates/store.ts admin_client 1
packages/api/src/posts/index.ts admin_client 2
packages/api/src/posts/post.ts admin_client 2
packages/api/src/posts/reaction-route-handlers.ts admin_client 1
packages/api/src/profile/index.ts admin_client 2
packages/api/src/reads/dashboard-stats.ts admin_client 2
packages/api/src/reads/donor-history.ts admin_client 2
packages/api/src/reads/member-care.ts admin_client 1
packages/api/src/reads/missionary-metrics.ts admin_client 1
packages/api/src/shared/with-operation.ts admin_client 1
packages/api/src/stripe/webhooks.ts admin_client 1
packages/api/src/workflows/admin-client.ts admin_client 1
packages/api/src/workflows/functions/dispatch-recovery-scan.ts workflow_admin_wrapper 1
packages/api/src/workflows/functions/donation-saga-recovery.ts workflow_admin_wrapper 2
packages/api/src/workflows/functions/inbound-email-processing.ts workflow_admin_wrapper 1
packages/api/src/workflows/functions/stripe-event-processing.ts workflow_admin_wrapper 4
packages/database/scripts/seed-demo-users.ts service_role_key 2
packages/env/src/schema.ts service_role_key 4
packages/eve-runtime/agent/channels/github.ts admin_client 3
packages/eve-runtime/agent/hooks/subagent-audit.ts admin_client 3
packages/eve-runtime/agent/hooks/subagent-audit.ts service_role_key 3
packages/eve-runtime/agent/tools/workflow_guard.ts admin_client 2
packages/eve-runtime/agent/tools/workflow_guard.ts service_role_key 1
packages/eve-runtime/src/github/strict-auto-merge-tool-runtime.ts admin_client 1
packages/eve-runtime/src/github/tool-runtime.ts admin_client 1
packages/eve-runtime/src/launch/watchdog.ts admin_client 1
packages/eve-runtime/src/monitors/sweep.ts admin_client 1
packages/eve-runtime/src/notifications/sweep.ts admin_client 1
packages/eve-runtime/src/specialists/runtime-policy.ts admin_client 1
packages/eve-runtime/src/specialists/runtime-policy.ts service_role_key 1
packages/eve-runtime/src/specialists/shared-context-tool.ts admin_client 1
packages/graphql/handler.ts admin_client 2
packages/lib/audit/logger.ts admin_client 1
packages/lib/monitoring/audit-scanner.ts admin_client 2
scripts/cms/lib/env.mjs service_role_key 7
scripts/cms/lib/local-data.mjs service_role_key 1
scripts/document-cutover/assess-document-cutover.ts service_role_key 2
scripts/supabase-env-smoke.mjs service_role_key 2
scripts/verify-money-units.ts service_role_key 3
scripts/verify/vercel-production-readiness.mjs service_role_key 1
`;

export const CEILING = new Map(
  CEILING_ROWS.trim()
    .split("\n")
    .map((row) => row.split(" "))
    .map(([file, kind, count]) => [`${file} ${kind}`, Number(count)]),
);
export const ceilingDigest = () =>
  createHash("sha256").update(CEILING_ROWS.trim()).digest("hex");

function moduleKind(file, specifier) {
  const target = specifier.startsWith(".")
    ? path.posix
        .join(path.posix.dirname(file), specifier)
        .replace(/\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/, "")
    : specifier;
  return MODULES.find((m) => m.file === target || m.alias === target);
}

const memberName = (node) =>
  ts.isPropertyAccessExpression(node)
    ? node.name.text
    : ts.isStringLiteralLike(node.argumentExpression)
      ? node.argumentExpression.text
      : null;
const propertyKey = (element) => {
  const key = element.propertyName ?? element.name;
  if (ts.isIdentifier(key) || ts.isStringLiteralLike(key)) return key.text;
  if (ts.isComputedPropertyName(key) && ts.isStringLiteralLike(key.expression))
    return key.expression.text;
  return null;
};
const inTypePosition = (node) => {
  for (let n = node.parent; n; n = n.parent) if (ts.isTypeNode(n)) return true;
  return false;
};
const unwrap = (node) => {
  let n = node;
  while (
    ts.isAwaitExpression(n.parent) ||
    ts.isParenthesizedExpression(n.parent)
  )
    n = n.parent;
  return n;
};

/** True when a destructuring pattern reaches supabaseAdmin (or may: rest, computed key). */
const patternTouchesAdmin = (pattern) =>
  !ts.isObjectBindingPattern(pattern) ||
  pattern.elements.some(
    (e) => e.dotDotDotToken || [null, "supabaseAdmin"].includes(propertyKey(e)),
  );

/** True when the handler context parameter `name` reaches supabaseAdmin or escapes whole. */
function contextTouchesAdmin(body, name) {
  let touched = false;
  const visit = (node) => {
    if (touched) return;
    if (ts.isIdentifier(node) && node.text === name) {
      const p = node.parent;
      if (ts.isPropertyAccessExpression(p) && p.name === node) return;
      if (ts.isPropertyAssignment(p) && p.name === node) return;
      if (
        (ts.isPropertyAccessExpression(p) || ts.isElementAccessExpression(p)) &&
        p.expression === node
      ) {
        if ([null, "supabaseAdmin"].includes(memberName(p))) touched = true;
        return;
      }
      if (ts.isVariableDeclaration(p) && p.initializer === node) {
        if (patternTouchesAdmin(p.name)) touched = true;
        return;
      }
      touched = true;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(body);
  return touched;
}

function handlerIsSite(call) {
  const handler = call.arguments[0];
  if (
    !handler ||
    !(ts.isArrowFunction(handler) || ts.isFunctionExpression(handler))
  )
    return handler ?? call;
  const param = handler.parameters[0];
  if (!param) return null;
  const touches = ts.isIdentifier(param.name)
    ? contextTouchesAdmin(handler.body, param.name.text)
    : patternTouchesAdmin(param.name);
  return touches ? handler : null;
}

/** Sites and re-exports in one file: { sites: [{ kind, line }], reexports: [{ kind, line }] }. */
export function scanSource(file, text) {
  const sites = [];
  const reexports = [];
  const lineAt = (offset) => text.slice(0, offset).split("\n").length;
  for (const match of text.matchAll(KEY_RE))
    sites.push({ kind: "service_role_key", line: lineAt(match.index) });

  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const at = (node) => lineAt(node.getStart(source));
  /** local name -> { module, namespace } */
  const bindings = new Map();
  const declarations = new Set();
  const bind = (id, module, namespace) => {
    bindings.set(id.text, { module, namespace });
    declarations.add(id);
  };
  const site = (module, node) =>
    sites.push({ kind: module.kind, line: at(node) });

  const collect = (node) => {
    if (ts.isImportDeclaration(node) && !node.importClause?.isTypeOnly) {
      const module = moduleKind(file, node.moduleSpecifier.text);
      const clause = node.importClause;
      if (module && clause) {
        if (clause.name) bind(clause.name, module, true);
        const named = clause.namedBindings;
        if (named && ts.isNamespaceImport(named))
          bind(named.name, module, true);
        else
          for (const s of named?.elements ?? [])
            if (
              !s.isTypeOnly &&
              module.names.includes((s.propertyName ?? s.name).text)
            )
              bind(s.name, module, false);
      }
    } else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      !node.isTypeOnly
    ) {
      const module = moduleKind(file, node.moduleSpecifier.text);
      const clause = node.exportClause;
      if (
        module &&
        (!clause ||
          ts.isNamespaceExport(clause) ||
          clause.elements.some((s) =>
            module.names.includes((s.propertyName ?? s.name).text),
          ))
      )
        reexports.push({ kind: module.kind, line: at(node) });
    } else if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === "require")) &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      const module = moduleKind(file, node.arguments[0].text);
      if (module) {
        const outer = unwrap(node);
        const p = outer.parent;
        if (ts.isVariableDeclaration(p) && p.initializer === outer) {
          if (ts.isIdentifier(p.name)) bind(p.name, module, true);
          else if (ts.isObjectBindingPattern(p.name))
            for (const e of p.name.elements) {
              const key = propertyKey(e);
              if (e.dotDotDotToken && ts.isIdentifier(e.name))
                bind(e.name, module, true);
              else if (key === null || !ts.isIdentifier(e.name))
                site(module, e);
              else if (module.names.includes(key)) bind(e.name, module, false);
            }
          else site(module, p);
        } else if (
          (ts.isPropertyAccessExpression(p) ||
            ts.isElementAccessExpression(p)) &&
          p.expression === outer
        ) {
          const member = memberName(p);
          if (
            member === null ||
            member === "then" ||
            module.names.includes(member)
          )
            use(module, p);
        } else site(module, outer);
      }
    }
    ts.forEachChild(node, collect);
  };

  /** A reference to a tracked function (direct, or a namespace member). */
  function use(module, node) {
    const p = unwrap(node).parent;
    const callee = unwrap(node);
    if (ts.isCallExpression(p) && p.expression === callee) {
      if (module.kind !== "operation_admin_context") site(module, node);
      else {
        const handler = handlerIsSite(p);
        if (handler) site(module, handler);
      }
    } else site(module, node);
  }

  const references = (node) => {
    if (
      ts.isIdentifier(node) &&
      bindings.has(node.text) &&
      !declarations.has(node)
    ) {
      const { module, namespace } = bindings.get(node.text);
      const p = node.parent;
      const isName =
        ((ts.isPropertyAccessExpression(p) || ts.isPropertyAssignment(p)) &&
          p.name === node) ||
        (ts.isBindingElement(p) && p.propertyName === node) ||
        ts.isImportSpecifier(p) ||
        ts.isQualifiedName(p);
      if (ts.isExportSpecifier(p)) {
        if (!p.parent.parent.moduleSpecifier)
          reexports.push({ kind: module.kind, line: at(node) });
      } else if (ts.isExportAssignment(p))
        reexports.push({ kind: module.kind, line: at(node) });
      else if (!isName && !inTypePosition(node)) {
        if (!namespace) use(module, node);
        else if (
          (ts.isPropertyAccessExpression(p) ||
            ts.isElementAccessExpression(p)) &&
          p.expression === node
        ) {
          const member = memberName(p);
          if (member === null || module.names.includes(member)) use(module, p);
        } else site(module, node);
      }
    }
    ts.forEachChild(node, references);
  };

  collect(source);
  references(source);
  return { sites, reexports };
}

/** Tracked source files under the scan roots, repo-relative, minus tests, build output and exempt paths. */
export function listScannedFiles(root = repoRoot) {
  const r = spawnSync(
    "git",
    [
      "ls-files",
      "-z",
      "--cached",
      "--others",
      "--exclude-standard",
      "--",
      ...SCAN_ROOTS,
    ],
    { cwd: root, encoding: "utf8" },
  );
  if (r.status !== 0)
    throw new Error(`git ls-files failed: ${r.stderr || r.error}`);
  return [...new Set(r.stdout.split("\0"))]
    .filter((f) => SOURCE_RE.test(f) && !isExcluded(f) && !isExempt(f))
    .filter((f) => existsSync(path.join(root, f)))
    .sort();
}

const isObject = (v) =>
  v !== null && typeof v === "object" && !Array.isArray(v);

/**
 * Pure evaluator. `found` is [{ file, kind, line }] sites plus [{ file, kind,
 * line }] reexports; `allowlist` is the parsed JSON (or an Error). Returns
 * { ok, failures: string[], totals }. Every failure names the file, the kind
 * and the real file:line of each site of that kind in that file.
 */
export function evaluateServiceRoleClientGate(
  { sites, reexports },
  allowlist,
  ceiling = CEILING,
) {
  const failures = [];
  const byKey = new Map();
  for (const s of sites) {
    const key = `${s.file} ${s.kind}`;
    byKey.set(key, [...(byKey.get(key) ?? []), s.line]);
  }
  const where = (key) => {
    const file = key.split(" ")[0];
    const lines = byKey.get(key) ?? [];
    return lines.length
      ? lines.map((l) => `${file}:${l}`).join(", ")
      : "none left";
  };
  const fail = (code, key, detail) => {
    const [file, kind] = key.split(" ");
    failures.push(`${code} ${kind} ${file}: ${detail} (sites: ${where(key)})`);
  };
  for (const r of reexports)
    failures.push(
      `REEXPORT ${r.kind} ${r.file}:${r.line}: re-exports a tracked service-role entry point; re-exports are never allowlisted, import it from its defining module instead`,
    );

  const allowed = new Map();
  if (
    allowlist instanceof Error ||
    !isObject(allowlist) ||
    !Array.isArray(allowlist.entries)
  ) {
    failures.push(
      `ALLOWLIST_MALFORMED ${ALLOWLIST_PATH}: ${allowlist instanceof Error ? allowlist.message : "expected an object with an entries array"}`,
    );
  } else {
    for (const [i, entry] of allowlist.entries.entries()) {
      const key = `${entry?.file} ${entry?.kind}`;
      const problems = [];
      if (typeof entry?.file !== "string" || !entry.file)
        problems.push("missing file");
      if (!KINDS.includes(entry?.kind))
        problems.push(`kind must be one of ${KINDS.join(", ")}`);
      if (!Number.isInteger(entry?.count) || entry.count < 1)
        problems.push("count must be a positive integer");
      if (typeof entry?.reason !== "string" || !entry.reason.trim())
        problems.push("reason must not be empty");
      if (allowed.has(key)) problems.push("duplicate (file, kind) entry");
      if (problems.length)
        fail("ALLOWLIST_MALFORMED", key, `entry ${i}: ${problems.join("; ")}`);
      if (!allowed.has(key))
        allowed.set(key, Number.isInteger(entry?.count) ? entry.count : 0);
      const cap = ceiling.get(key);
      if (cap === undefined)
        fail(
          "ALLOWLIST_GROWTH",
          key,
          "entry is not in the frozen ceiling; the allowlist is shrink-only",
        );
      else if (entry?.count > cap)
        fail(
          "ALLOWLIST_GROWTH",
          key,
          `count ${entry.count} is above the frozen ceiling ${cap}; the allowlist is shrink-only`,
        );
    }
  }

  for (const key of [...new Set([...byKey.keys(), ...allowed.keys()])].sort()) {
    const actual = byKey.get(key)?.length ?? 0;
    const listed = allowed.get(key) ?? 0;
    if (actual > listed)
      fail(
        "NEW_SITE",
        key,
        listed
          ? `${actual} sites, allowlist ${listed}; move the new site behind withTenant (packages/api/src/identity)`
          : `${actual} site(s) in a file the allowlist does not list; use withTenant (packages/api/src/identity)`,
      );
    else if (actual < listed)
      fail(
        "STALE",
        key,
        actual
          ? `allowlist ${listed}, ${actual} found; shrink the entry to ${actual}`
          : `allowlist ${listed}, none found; delete the entry`,
      );
  }

  const totals = Object.fromEntries(KINDS.map((k) => [k, 0]));
  for (const s of sites) totals[s.kind] += 1;
  return {
    ok: failures.length === 0,
    failures,
    totals,
    files: new Set(sites.map((s) => s.file)).size,
  };
}

/** Scans `root` and evaluates it against its allowlist. */
export function runServiceRoleClientGate({ root = repoRoot } = {}) {
  const found = { sites: [], reexports: [] };
  for (const file of listScannedFiles(root)) {
    const { sites, reexports } = scanSource(
      file,
      readFileSync(path.join(root, file), "utf8"),
    );
    for (const s of sites) found.sites.push({ file, ...s });
    for (const r of reexports) found.reexports.push({ file, ...r });
  }
  let allowlist;
  try {
    allowlist = JSON.parse(
      readFileSync(path.join(root, ALLOWLIST_PATH), "utf8"),
    );
  } catch (error) {
    allowlist = new Error(error.message);
  }
  return { ...evaluateServiceRoleClientGate(found, allowlist), found };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const result = runServiceRoleClientGate();
  if (!result.ok) {
    for (const failure of result.failures) console.error(failure);
    console.error(
      `error: service-role client gate failed with ${result.failures.length} problem(s). See docs/security/tenant-guard.md#ci-gates.`,
    );
    process.exit(1);
  }
  const t = result.totals;
  console.log(
    `PASS: service-role client gate: ${Object.values(t).reduce((a, n) => a + n, 0)} sites in ${result.files} files (${KINDS.map((k) => `${t[k]} ${k}`).join(", ")}), all within the frozen allowlist.`,
  );
}
