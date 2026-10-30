/**
 * #2303 criteria 6, 7, 10 and 11 (spec r1, issue comment 6392009852; approved
 * in 6392018376; sparse pin from 6389488653): a hole in `sources` throws
 * `missing_context`, the for…in and forEach refactors are killed, and the
 * suspension mapping is documented. Criterion 11's diff scope is opt-in
 * (#2183 pattern): ACCEPTANCE_2303_SCOPE=1 (base: git merge-base origin/develop
 * HEAD) or ACCEPTANCE_2303_BASE=<ref>. Owned by Acceptance. Implementers must
 * not edit this file to satisfy their PR.
 */
import { spawnSync } from "node:child_process";

import ts from "typescript";
import { describe, expect, it } from "vitest";

import * as H from "../issue-492/harness";

const EFF = `${H.CAP_DIR}/effective-capabilities.ts`;
const UNIT = "tests/unit/auth/capabilities/effective-capabilities.test.ts";
/** effective-capabilities.ts:114-115 at develop; §7 pins it unchanged. */
const LOOP = [
  "  for (let index = 0; index < length; index += 1)",
  "    snapshots.push(snapshotSource(sources[index]));",
].join("\n");
const MUTANTS: [string, string][] = [
  [
    "for…in",
    "  for (const index in sources)\n    snapshots.push(snapshotSource(sources[index]));",
  ],
  [
    "forEach",
    "  sources.forEach((source) => snapshots.push(snapshotSource(source)));",
  ],
];
const MAPPING =
  "A suspended assignment or grant is issued with this set to `false`, never omitted. Any inactive source fails the whole context with `inactive_source`.";
const FROZEN_SENTENCE =
  "The registry, bundle and default-bundle tables are deep-frozen at module load.";
const flat = (s: string) => s.replace(/\s+/g, " ").trim();

const fin = H.assignment("staff", "finance");
const admin = H.named("tenant_admin");
/** `length` real holes with `entries` set (H.ctx would spread holes into undefined). */
function sparse(length: number, entries: Record<number, object>) {
  const out = new Array<unknown>(length);
  for (const [i, v] of Object.entries(entries)) out[Number(i)] = v;
  for (let i = 0; i < length; i += 1)
    expect(i in out, `slot ${i} is a hole`).toBe(i in entries);
  return out;
}
const HOLES: [string, () => unknown[]][] = [
  ["a leading hole [, named]", () => sparse(2, { 1: admin })],
  [
    "a middle hole [assignment, , named]",
    () => sparse(3, { 0: fin, 2: admin }),
  ],
  ["a trailing hole [named, ]", () => sparse(2, { 0: admin })],
  [
    "a length-extended Object.assign([named], { length: 2 })",
    () => {
      const out = Object.assign([admin], { length: 2 });
      expect(1 in out, "slot 1 is a hole").toBe(false);
      return out;
    },
  ],
  ["only holes", () => sparse(3, {})],
];
const at = (sources: unknown) => ({ tenantId: H.T, sources });
type Resolve = (...args: unknown[]) => unknown;
function codeOf(resolve: Resolve, sources: unknown[]) {
  try {
    resolve(at(sources));
    return "returned a result";
  } catch (e) {
    return (e as { code?: string }).code ?? String(e);
  }
}

/** The resolver module, edited in memory and evaluated against the real sibling modules. */
async function variant(edit: (src: string) => string): Promise<Resolve> {
  const src = edit(H.read(EFF));
  const deps = new Map<string, unknown>();
  for (const [, name] of src.matchAll(/from "\.\/([\w-]+)"/g))
    deps.set(`./${name}`, await H.load(name!));
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const exports: Record<string, unknown> = {};
  const require = (id: string) => {
    if (!deps.has(id)) throw new Error(`unexpected import ${id}`);
    return deps.get(id);
  };
  new Function("exports", "require", outputText)(exports, require);
  return exports.resolveEffectiveCapabilities as Resolve;
}

describe("#2303 criterion 10: holes in sources throw missing_context", () => {
  it.each(HOLES)(
    "criterion 10: %s throws missing_context with no partial result",
    async (_label, make) => {
      expect((await H.thrown(at(make()))).code).toBe("missing_context");
    },
  );

  it("criterion 10: the dense equivalent [assignment, named] resolves to the develop result", async () => {
    const { resolveEffectiveCapabilities: resolve } = await H.load(
      "effective-capabilities",
    );
    const want = H.sorted(
      new Set([...H.expected("staff:finance"), ...H.expected("tenant_admin")]),
    );
    expect(Reflect.apply(resolve, undefined, [at([fin, admin])])).toEqual(want);
  });
});

describe("#2303 criterion 6: the hole tests kill the for…in and forEach refactors", () => {
  it("criterion 6 (§7 pin): the indexed loop is unchanged and, evaluated in memory, throws missing_context for every hole", async () => {
    expect(H.read(EFF)).toContain(LOOP);
    const resolve = await variant((s) => s);
    for (const [label, make] of HOLES)
      expect(codeOf(resolve, make()), label).toBe("missing_context");
  });

  it.each(MUTANTS)(
    "criterion 6 and 10: rewriting :114-115 as %s is killed by at least one hole case",
    async (_label, mutant) => {
      const resolve = await variant((s) => {
        expect(s, "the §7 loop must be present to mutate").toContain(LOOP);
        return s.replace(LOOP, mutant);
      });
      const survived = HOLES.filter(
        ([, make]) => codeOf(resolve, make()) === "missing_context",
      );
      expect(survived.length).toBeLessThan(HOLES.length);
    },
  );

  it("criterion 6: the Builder unit file pins [, named()] and Object.assign([named()], { length: 2 }) as missing_context", () => {
    const unit = flat(H.read(UNIT));
    expect(unit).toContain("[, named()]");
    expect(unit).toContain("Object.assign([named()], { length: 2 })");
    expect(unit).toContain("missing_context");
  });
});

describe("#2303 criterion 7: the suspension mapping is documented", () => {
  it.each([
    ["AssignmentGrantSource", "isActive"],
    ["NamedGrantSource", "active"],
  ])(
    "criterion 7: the JSDoc on %s.%s states the suspension mapping",
    (type, member) => {
      const sf = ts.createSourceFile(
        EFF,
        H.read(EFF),
        ts.ScriptTarget.Latest,
        true,
      );
      const alias = sf.statements
        .filter(ts.isTypeAliasDeclaration)
        .find((d) => d.name.text === type);
      const prop =
        alias && ts.isTypeLiteralNode(alias.type)
          ? alias.type.members.find((m) => m.name?.getText(sf) === member)
          : undefined;
      expect(prop, `${type}.${member}`).toBeDefined();
      const leading = prop
        ? sf.text.slice(prop.getFullStart(), prop.getStart(sf))
        : "";
      const doc = flat(leading.replace(/\/\*\*|\*\/|^\s*\*/gm, " "));
      expect(doc).toContain(MAPPING);
    },
  );

  it("criterion 7: registry.md § Resolver contract states the mapping and the deep-freeze sentence", () => {
    const md = H.read(H.DOC);
    const start = md.indexOf("## Resolver contract");
    expect(start, "## Resolver contract").toBeGreaterThan(-1);
    const end = md.indexOf("\n## ", start + 1);
    const section = flat(md.slice(start, end < 0 ? undefined : end)).replace(
      /`/g,
      "",
    );
    expect(section).toContain(FROZEN_SENTENCE);
    for (const s of [
      "isActive: false",
      "active: false",
      "never omitted",
      "inactive_source",
    ])
      expect(section, s).toContain(s);
  });

  it("criterion 7: one suspended source fails the whole context with inactive_source", async () => {
    const off = H.assignment("staff", "hr", { isActive: false });
    const gone = H.named("platform_admin", { active: false });
    expect((await H.thrown(H.ctx(admin, off))).code).toBe("inactive_source");
    expect((await H.thrown(H.ctx(fin, gone))).code).toBe("inactive_source");
  });
});

const BASE = process.env.ACCEPTANCE_2303_BASE?.trim() ?? "";
const ON = process.env.ACCEPTANCE_2303_SCOPE?.trim() === "1" || BASE !== "";
/** §6 declared edits (Builder + Acceptance). */
const DECLARED = `tests/fixtures/capability-registry/authenticated-context.ts
  tests/fixtures/capability-registry/tsconfig.json packages/auth/capabilities/freeze.ts
  packages/auth/capabilities/registry.ts packages/auth/capabilities/bundles.ts
  packages/auth/capabilities/effective-capabilities.ts docs/security/capability-spine/registry.md
  ${UNIT} tests/unit/acceptance/issue-2303/fixture-drift.acceptance.test.ts
  tests/unit/acceptance/issue-2303/frozen-tables.acceptance.test.ts
  tests/unit/acceptance/issue-2303/sparse-sources.acceptance.test.ts`.split(
  /\s+/,
);

describe.skipIf(!ON)(
  "#2303 opt-in (PR base; ACCEPTANCE_2303_SCOPE=1 or ACCEPTANCE_2303_BASE)",
  () => {
    it("criterion 11: only §6 paths change and tests/unit/acceptance/issue-492/** is byte-unchanged", () => {
      const git = (...args: string[]) => {
        const r = spawnSync("git", args, { encoding: "utf8" });
        expect(r.status, `git ${args.join(" ")}: ${r.stderr}`).toBe(0);
        return r.stdout.trim();
      };
      const base = BASE || git("merge-base", "origin/develop", "HEAD");
      const changed = git("diff", "--name-only", base)
        .split("\n")
        .filter(Boolean);
      expect(
        changed.filter((f) => f.startsWith("tests/unit/acceptance/issue-492/")),
      ).toEqual([]);
      expect(changed.filter((f) => !DECLARED.includes(f))).toEqual([]);
    });
  },
);
