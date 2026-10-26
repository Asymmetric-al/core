/**
 * #2303 criteria 4, 5 and 9 (spec r1, issue comment 6392009852; approved in
 * 6392018376): CAPABILITY_REGISTRY, CAPABILITY_BUNDLES, ROLE_DEFAULT_BUNDLES,
 * UNSPECIALIZED_ASSIGNMENT_BUNDLES and NAMED_SUBJECTS are deep-frozen at module
 * load. The two private maps are checked from source (OQ3). Owned by
 * Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { createHash } from "node:crypto";

import ts from "typescript";
import { describe, expect, it, vi } from "vitest";

import * as H from "../issue-492/harness";

/** sha256 of JSON.stringify(capabilityRegistryRows()) at develop 88eefbd9 (18 capabilities, 71 grants). */
const ROWS_SHA =
  "33cad873dfc95994e65d030bc75d6102600b3e65d4dea4745901a9a4a8409b71";
const UNIT = "tests/unit/auth/capabilities/effective-capabilities.test.ts";
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const file = (m: string) => `${H.CAP_DIR}/${m}.ts`;
/** Table -> [module, the `as const satisfies` type text kept inside the call, if any]. */
const FIVE: Record<string, [string, string?]> = {
  CAPABILITY_REGISTRY: ["registry", "Record<string, CapabilityMeta>"],
  CAPABILITY_BUNDLES: ["bundles", "Record<string, readonly Capability[]>"],
  ROLE_DEFAULT_BUNDLES: ["bundles"],
  UNSPECIALIZED_ASSIGNMENT_BUNDLES: ["effective-capabilities"],
  NAMED_SUBJECTS: ["effective-capabilities"],
};
const EXPORTED = [
  "CAPABILITY_REGISTRY",
  "CAPABILITY_BUNDLES",
  "ROLE_DEFAULT_BUNDLES",
];

/** Paths of every object or array node under `value` that is not frozen. */
function unfrozen(
  value: unknown,
  path: string,
  seen = new Set<object>(),
): string[] {
  if (typeof value !== "object" || value === null || seen.has(value)) return [];
  seen.add(value);
  const own: string[] = Reflect.ownKeys(value).flatMap((k) =>
    unfrozen(
      (value as Record<PropertyKey, unknown>)[k],
      `${path}.${String(k)}`,
      seen,
    ),
  );
  return Object.isFrozen(value) ? own : [path, ...own];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- tables are imported lazily while #2303 is unbuilt; writes are deliberate -- TODO(#2303)
type Tables = Record<"REG" | "B" | "RDB", any> & {
  resolve: (...args: unknown[]) => unknown;
};
/** A fresh module graph, so a write that succeeds cannot leak into another case. */
async function fresh(): Promise<Tables> {
  vi.resetModules();
  const registry = await H.load("registry");
  const bundles = await H.load("bundles");
  const eff = await H.load("effective-capabilities");
  return {
    REG: registry.CAPABILITY_REGISTRY,
    B: bundles.CAPABILITY_BUNDLES,
    RDB: bundles.ROLE_DEFAULT_BUNDLES,
    resolve: eff.resolveEffectiveCapabilities,
  };
}

/** Every default subject plus the private unspecialized-staff row. */
const PROBES: [string, object][] = [
  ...H.SUBJECTS.map((s): [string, object] => [s, H.sourceFor(s)]),
  ["staff, no subrole", H.assignment("staff", null)],
];
const WANT = Object.fromEntries([
  ...H.SUBJECTS.map((s) => [s, H.expected(s)]),
  ["staff, no subrole", H.sorted(H.BUNDLES.donor_care!)],
]);
function resolutions(resolve: Tables["resolve"]) {
  return Object.fromEntries(
    PROBES.map(([label, source]) => {
      try {
        return [label, resolve(H.ctx(source))];
      } catch (e) {
        return [label, (e as { code?: string }).code];
      }
    }),
  );
}

/** Initializer of the top-level `const name` in `module`, and that file's imports. */
function declaration(module: string, name: string) {
  const sf = ts.createSourceFile(
    file(module),
    H.read(file(module)),
    ts.ScriptTarget.Latest,
    true,
  );
  const init = sf.statements
    .filter(ts.isVariableStatement)
    .flatMap((s) => [...s.declarationList.declarations])
    .find((d) => ts.isIdentifier(d.name) && d.name.text === name)?.initializer;
  const fromFreeze = sf.statements
    .filter(ts.isImportDeclaration)
    .filter((d) => (d.moduleSpecifier as ts.StringLiteral).text === "./freeze")
    .flatMap((d) => {
      const b = d.importClause?.namedBindings;
      return b && ts.isNamedImports(b)
        ? b.elements.map((e) => e.name.text)
        : [];
    });
  return { sf, init, fromFreeze };
}

describe("#2303 criterion 4: all five tables are wrapped by deepFreeze at declaration", () => {
  it("criterion 4: freeze.ts deepFreeze freezes plain objects and arrays at every depth over Reflect.ownKeys and returns the same reference", async () => {
    const { deepFreeze } = await H.load("freeze");
    const key = Symbol("hidden");
    const value = { a: [{ b: [1, { c: { d: "x" } }] }], [key]: { e: [[]] } };
    expect(deepFreeze(value)).toBe(value);
    expect(unfrozen(value, "value")).toEqual([]);
    const done = Object.freeze({ f: 1 });
    expect(deepFreeze(done)).toBe(done);
  });

  it.each(Object.entries(FIVE))(
    "criterion 4 and 9: the %s initializer is a deepFreeze( call imported from ./freeze",
    (name, [module, satisfied]) => {
      const { sf, init, fromFreeze } = declaration(module, name);
      expect(init, `${name} in ${file(module)}`).toBeDefined();
      expect(fromFreeze, `${file(module)} imports deepFreeze`).toContain(
        "deepFreeze",
      );
      const call = init && ts.isCallExpression(init) ? init : undefined;
      expect(call?.expression.getText(sf), `${name} initializer`).toBe(
        "deepFreeze",
      );
      expect(call?.arguments).toHaveLength(1);
      if (!satisfied || !call) return;
      const arg = call.arguments[0]!;
      expect(ts.isSatisfiesExpression(arg), "as const satisfies kept").toBe(
        true,
      );
      if (!ts.isSatisfiesExpression(arg)) return;
      expect(arg.type.getText(sf)).toBe(satisfied);
      expect(
        ts.isAsExpression(arg.expression) && arg.expression.type.getText(sf),
      ).toBe("const");
    },
  );

  it("criterion 4: the capability files compile clean and Capability, BundleKey and GrantSubjectKey are unchanged", () => {
    const union = (xs: string[]) =>
      xs.map((x) => JSON.stringify(x)).join(" | ");
    const probe = [
      'import type { Capability } from "./registry";',
      'import type { BundleKey, GrantSubjectKey } from "./bundles";',
      "type Eq<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;",
      `export const c: Eq<Capability, ${union(H.ALL)}> = true;`,
      `export const b: Eq<BundleKey, ${union(Object.keys(H.BUNDLES))}> = true;`,
      `export const s: Eq<GrantSubjectKey, ${union(H.SUBJECTS)}> = true;`,
    ].join("\n");
    const diags = H.typecheck({ "acc2303-types.ts": probe });
    expect(diags.filter(H.inCapDir)).toEqual([]);
  });
});

describe("#2303 criterion 5: freezing changes no output", () => {
  it("criterion 5: every ROLE_DEFAULT_BUNDLES subject resolves as on develop and capabilityRegistryRows() is byte-identical to develop", async () => {
    const { ROLE_DEFAULT_BUNDLES } = await H.load("bundles");
    expect(H.sorted(Object.keys(ROLE_DEFAULT_BUNDLES))).toEqual(
      H.sorted(H.SUBJECTS),
    );
    for (const s of H.SUBJECTS)
      expect(await H.resolveFor(s), s).toEqual(H.expected(s));
    const { capabilityRegistryRows } = await H.load("rows");
    expect(sha256(JSON.stringify(capabilityRegistryRows()))).toBe(ROWS_SHA);
  });

  it("criterion 5: the Builder unit file carries the §2.4 freeze tests", () => {
    const unit = H.read(UNIT);
    for (const name of EXPORTED) expect(unit, name).toContain(name);
    expect(unit).toMatch(/Object\.isFrozen\(/);
    expect(unit).toMatch(/toThrow\(TypeError\)/);
    expect(unit).toMatch(/capabilityRegistryRows\(\)/);
  });
});

describe("#2303 criterion 9: the exported tables are deep-frozen at module load", () => {
  it.each(EXPORTED)(
    "criterion 9: a recursive walk finds every object and array node of %s frozen",
    async (name) => {
      const t = await fresh();
      const table = {
        CAPABILITY_REGISTRY: t.REG,
        CAPABILITY_BUNDLES: t.B,
        ROLE_DEFAULT_BUNDLES: t.RDB,
      }[name];
      expect(Object.keys(table ?? {}).length).toBeGreaterThan(0);
      expect(unfrozen(table, name)).toEqual([]);
    },
  );

  const MUTATIONS: [string, (t: Tables) => unknown][] = [
    [
      "write a nested registry field",
      (t) => (t.REG["contributions.view_detail"].label = "x"),
    ],
    [
      "add a registry key",
      (t) => (t.REG["admin.root"] = t.REG["permissions.view"]),
    ],
    ["delete a registry key", (t) => delete t.REG["permissions.view"]],
    ["push a capability into a bundle", (t) => t.B.donor_care.push(H.APPROVE)],
    ["overwrite a bundle element", (t) => (t.B.staff_base[0] = H.APPROVE)],
    ["add a bundle", (t) => (t.B.root = [H.APPROVE])],
    [
      "reassign a subject's bundles",
      (t) => (t.RDB["member:donor"] = ["contribution_admin"]),
    ],
    [
      "push a bundle into a subject",
      (t) => t.RDB["member:missionary"].push("contribution_admin"),
    ],
    ["delete a subject", (t) => delete t.RDB.tenant_admin],
    ["truncate a subject's bundles", (t) => (t.RDB.platform_admin.length = 0)],
  ];
  it.each(MUTATIONS)(
    "criterion 9: a strict-mode attempt to %s throws TypeError and leaves tables and resolution unchanged",
    async (_label, mutate) => {
      const strict = (function (this: unknown) {
        return this === undefined;
      })();
      expect(strict, "test code runs in strict mode").toBe(true);
      const t = await fresh();
      const before = JSON.stringify([t.REG, t.B, t.RDB]);
      expect(() => mutate(t)).toThrow(TypeError);
      expect(JSON.stringify([t.REG, t.B, t.RDB])).toBe(before);
      expect(resolutions(t.resolve)).toEqual(WANT);
    },
  );
});
