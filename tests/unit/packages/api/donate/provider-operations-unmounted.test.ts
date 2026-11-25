import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ROOT = fileURLToPath(new URL("../../../../..", import.meta.url));
const MODULE_DIR = join(ROOT, "packages/api/src/donate/provider-operations");
const SOURCE = /\.(ts|tsx|mts|cts|js|mjs|cjs)$/;
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
  "coverage",
  ".turbo",
  ".git",
  ".vercel",
]);
const FORBIDDEN_TARGETS = [
  "provider-operations",
  "tests/fixtures/stripe-provider-fake",
];

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      out.push(...sourceFiles(join(dir, entry.name)));
    } else if (SOURCE.test(entry.name)) out.push(join(dir, entry.name));
  }
  return out;
}

function specifiers(file: string, text: string): string[] {
  const source = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const found: string[] = [];
  const visit = (node: ts.Node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    )
      found.push(node.moduleSpecifier.text);
    if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      ts.isStringLiteralLike(node.moduleReference.expression)
    )
      found.push(node.moduleReference.expression.text);
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      const dynamic = callee.kind === ts.SyntaxKind.ImportKeyword;
      const required = ts.isIdentifier(callee) && callee.text === "require";
      const [first] = node.arguments;
      if ((dynamic || required) && first) {
        found.push(
          ts.isStringLiteralLike(first)
            ? first.text
            : `<computed ${first.getText(source)}>`,
        );
      }
    }
    if (ts.isImportTypeNode(node)) {
      const arg = node.argument;
      if (ts.isLiteralTypeNode(arg) && ts.isStringLiteralLike(arg.literal))
        found.push(arg.literal.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => {
      throw new Error(
        "a test of the provider worker tried to reach the network",
      );
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("WP8a part 2 R1b: the provider worker stays unmounted (ruling Q4)", () => {
  it("D1: run.ts exports runProviderOperation; stripe-adapter.ts exports createStripePaymentAdapter and classifyStripeAnswer", async () => {
    const run =
      await import("../../../../../packages/api/src/donate/provider-operations/run");
    const adapter =
      await import("../../../../../packages/api/src/donate/provider-operations/stripe-adapter");
    expect(typeof run.runProviderOperation).toBe("function");
    expect(typeof adapter.createStripePaymentAdapter).toBe("function");
    expect(typeof adapter.classifyStripeAnswer).toBe("function");
    expect(
      readdirSync(MODULE_DIR)
        .filter((f) => SOURCE.test(f))
        .sort(),
    ).toEqual(["contract.ts", "one-send.ts", "run.ts", "stripe-adapter.ts"]);
  });

  it("D2 (guard): no JS or TS file under apps/, packages/ (outside the module), scripts/, supabase/ or tooling/ imports, re-exports, import()s or require()s the module or the fake, read with the TypeScript compiler; package exports name neither and carry no ./donate/* wildcard", () => {
    const offenders: string[] = [];
    let scanned = 0;
    for (const top of ["apps", "packages", "scripts", "supabase", "tooling"]) {
      for (const file of sourceFiles(join(ROOT, top))) {
        if (file.startsWith(`${MODULE_DIR}${sep}`)) continue;
        scanned += 1;
        const text = readFileSync(file, "utf8");
        if (!FORBIDDEN_TARGETS.some((t) => text.includes(t))) continue;
        for (const spec of specifiers(file, text))
          if (
            FORBIDDEN_TARGETS.some((t) => spec.includes(t)) ||
            spec.startsWith("<computed")
          )
            offenders.push(`${relative(ROOT, file)}: ${spec}`);
      }
    }
    expect(scanned).toBeGreaterThan(1000);
    expect(offenders).toEqual([]);
    const manifest = JSON.parse(
      readFileSync(join(ROOT, "packages/api/package.json"), "utf8"),
    ) as { exports: Record<string, string> };
    const entries = Object.entries(manifest.exports);
    expect(
      entries.filter(
        ([key, target]) =>
          key.includes("provider-operations") ||
          String(target).includes("provider-operations"),
      ),
    ).toEqual([]);
    expect(
      entries
        .map(([key]) => key)
        .filter(
          (key) =>
            key.includes("*") &&
            "./donate/provider-operations/run".startsWith(
              key.slice(0, key.indexOf("*")),
            ),
        ),
    ).toEqual([]);
  });

  it("D3 (guard): the module reaches no scheduler, environment, service-key client or workflow: no createFunction, inngest or workflows/ import, process.env, serverEnv, or any name the service-key gate tracks", () => {
    const gate = readFileSync(
      join(ROOT, "scripts/verify/service-role-client-gate.mjs"),
      "utf8",
    );
    const tracked = [
      "getAdminClient",
      "createAdminClient",
      "requireWorkflowAdminClient",
      "withPlatformOperation",
      "runDonorPortalOperation",
      "runMissionaryPortalOperation",
    ];
    expect(tracked.filter((name) => !gate.includes(`"${name}"`))).toEqual([]);
    expect(gate).toContain('["SERVICE", "ROLE", "KEY"]');
    const words = [
      ...tracked,
      "SERVICE_ROLE_KEY",
      "createFunction",
      "inngest",
      "process.env",
      "serverEnv",
    ];
    const problems: string[] = [];
    for (const file of sourceFiles(MODULE_DIR)) {
      const text = readFileSync(file, "utf8");
      const name = relative(ROOT, file);
      for (const word of words)
        if (text.includes(word)) problems.push(`${name}: ${word}`);
      for (const spec of specifiers(file, text))
        if (/(^|\/)workflows(\/|$)/.test(spec) || /inngest/.test(spec))
          problems.push(`${name}: imports ${spec}`);
    }
    expect(problems).toEqual([]);
  });
});
