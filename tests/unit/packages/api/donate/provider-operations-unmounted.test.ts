import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ROOT = fileURLToPath(new URL("../../../../..", import.meta.url));
const MODULE_DIR = join(ROOT, "packages/api/src/donate/provider-operations");
const SOURCE = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/;
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
const FORBIDDEN_TARGETS = ["provider-operations", "stripe-provider-fake"];

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

function forbiddenSpecifiers(file: string, text: string): string[] {
  if (!FORBIDDEN_TARGETS.some((t) => text.includes(t))) return [];
  return specifiers(file, text).filter(
    (spec) =>
      FORBIDDEN_TARGETS.some((t) => spec.includes(t)) ||
      spec.startsWith("<computed"),
  );
}

function targetStrings(target: unknown): string[] {
  if (typeof target === "string") return [target];
  if (Array.isArray(target)) return target.flatMap(targetStrings);
  if (target && typeof target === "object")
    return Object.values(target).flatMap(targetStrings);
  return [];
}

function exportsProblems(exportsField: unknown): string[] {
  const entries =
    exportsField && typeof exportsField === "object"
      ? Object.entries(exportsField)
      : [[".", exportsField] as const];
  const problems: string[] = [];
  for (const [key, target] of entries) {
    if (
      key.includes("provider-operations") ||
      JSON.stringify(target ?? null).includes("provider-operations")
    )
      problems.push(`names the module: ${key}`);
    if (
      key.includes("*") &&
      "./donate/provider-operations/run".startsWith(
        key.slice(0, key.indexOf("*")),
      )
    )
      problems.push(`a wildcard reaches the module: ${key}`);
    if (
      targetStrings(target).some(
        (pattern) =>
          pattern.includes("*") &&
          "./src/donate/provider-operations/run.ts".startsWith(
            pattern.slice(0, pattern.indexOf("*")),
          ),
      )
    )
      problems.push(`a wildcard target reaches the module: ${key}`);
  }
  return problems;
}

const API_SRC = join(ROOT, "packages/api/src");
const CLIENT_MODULES = [
  "@asym/database/supabase/admin",
  "database/supabase/admin",
  "workflows/admin-client",
  "shared/with-operation",
  "donor-portal/route-helpers",
  "missionary-portal/route-helpers",
];
const CLIENT_NAMES = [
  "getAdminClient",
  "createAdminClient",
  "requireWorkflowAdminClient",
  "withPlatformOperation",
  "runDonorPortalOperation",
  "runMissionaryPortalOperation",
  "SERVICE_ROLE_KEY",
];

function localModule(from: string, spec: string): string | null {
  const base = resolve(dirname(from), spec);
  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    join(base, "index.ts"),
  ])
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  return null;
}

function moduleReach(): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  const queue: [string, string][] = sourceFiles(MODULE_DIR).map((file) => [
    file,
    relative(API_SRC, file),
  ]);
  while (queue.length) {
    const [file, chain] = queue.shift()!;
    if (seen.has(file)) continue;
    seen.add(file);
    const text = readFileSync(file, "utf8");
    if (text.includes("process.env")) problems.push(`${chain}: process.env`);
    for (const name of CLIENT_NAMES)
      if (text.includes(name)) problems.push(`${chain}: ${name}`);
    for (const spec of specifiers(file, text)) {
      if (spec === "@asym/env" || spec.startsWith("@asym/env/"))
        problems.push(`${chain} -> ${spec}`);
      if (CLIENT_MODULES.some((m) => spec.includes(m)))
        problems.push(`${chain} -> ${spec}`);
      if (!spec.startsWith(".")) continue;
      const target = localModule(file, spec);
      if (!target) problems.push(`${chain} -> ${spec}: not resolved`);
      else if (target.startsWith(`${API_SRC}${sep}`))
        queue.push([target, `${chain} -> ${relative(API_SRC, target)}`]);
    }
  }
  return problems;
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
        for (const spec of forbiddenSpecifiers(
          file,
          readFileSync(file, "utf8"),
        ))
          offenders.push(`${relative(ROOT, file)}: ${spec}`);
      }
    }
    expect(scanned).toBeGreaterThan(1000);
    expect(offenders).toEqual([]);
    const manifest = JSON.parse(
      readFileSync(join(ROOT, "packages/api/package.json"), "utf8"),
    ) as { exports: unknown };
    expect(exportsProblems(manifest.exports)).toEqual([]);
  });

  it("D2 (self-check, review finding 5): the scanner flags every way a source can reach the module or the fake, a .jsx file included, and none that only names them; the exports check reads a conditional target and a wildcard", () => {
    const sources: [string, string][] = [
      ["a.ts", 'import { run } from "../donate/provider-operations/run";'],
      ["b.ts", 'export * from "@asym/api/donate/provider-operations";'],
      ["c.mts", 'export { a } from "./provider-operations/contract";'],
      [
        "d.js",
        'const m = await import("./provider-operations/stripe-adapter");',
      ],
      [
        "e.cjs",
        'const f = require("../../tests/fixtures/stripe-provider-fake");',
      ],
      ["f.ts", 'import type { T } from "@fixtures/stripe-provider-fake";'],
      ["g.cts", 'import fake = require("./stripe-provider-fake");'],
      ["h.ts", "type T = import('./provider-operations/run').RpcResponse;"],
      [
        "i.jsx",
        'import { x } from "./stripe-provider-fake.js";\nexport const C = () => <div>{x}</div>;',
      ],
      [
        "j.ts",
        'const where = "provider-operations";\nexport const m = await import(where);',
      ],
    ];
    const flagged = sources.map(([file, text]) =>
      forbiddenSpecifiers(join(ROOT, file), text).length > 0 ? file : "",
    );
    expect(flagged).toEqual(sources.map(([file]) => file));
    expect(
      forbiddenSpecifiers(
        join(ROOT, "k.ts"),
        '// provider-operations\nexport const doc = "stripe-provider-fake";',
      ),
    ).toEqual([]);
    expect(
      exportsProblems({
        "./run": {
          import: {
            types: "./x.d.ts",
            default: "./src/donate/provider-operations/run.ts",
          },
        },
        "./donate/*": "./src/donate/*.ts",
        "./*": { default: "./src/*.ts" },
      }),
    ).toEqual([
      "names the module: ./run",
      "a wildcard reaches the module: ./donate/*",
      "a wildcard target reaches the module: ./donate/*",
      "a wildcard reaches the module: ./*",
      "a wildcard target reaches the module: ./*",
    ]);
  });

  it("T8 (bot round): a wildcard export whose target can resolve into the worker's directory is flagged whatever its public key; an unrelated wildcard target is valid", () => {
    expect(
      exportsProblems({
        "./lib/*": "./src/donate/*.ts",
        "./kit/*": { import: { default: "./src/*" } },
        "./crm/*": "./src/crm/*.ts",
        "./donate": "./src/donate/index.ts",
      }),
    ).toEqual([
      "a wildcard target reaches the module: ./lib/*",
      "a wildcard target reaches the module: ./kit/*",
    ]);
  });

  it("D3 (bot round, B1): following every import of the module's four files inside packages/api/src, nothing reaches @asym/env, process.env or an admin or service-key client", () => {
    expect(moduleReach()).toEqual([]);
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
