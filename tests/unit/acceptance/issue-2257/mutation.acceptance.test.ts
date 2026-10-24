/** #2257 done criteria 2, 4, 5, 8: type-level and mutation proofs (spec r2). Owned by Acceptance. */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import ts from "typescript";
import { describe, expect, it } from "vitest";

import { CONCEPTS, EXPECTED, MIG, PARITY, read } from "./harness";

const ENTRY = (id: string) =>
  new RegExp(`\\n  \\{\\n    id: "${id}",[\\s\\S]*?\\n  \\},`);
const drop = (src: string, id: string) => {
  expect(src, `${id} entry exists`).toMatch(ENTRY(id));
  return src.replace(ENTRY(id), "");
};
const tmp = (files: Record<string, string>) => {
  const dir = mkdtempSync(join(tmpdir(), "acc2257-"));
  for (const [f, s] of Object.entries(files)) writeFileSync(join(dir, f), s);
  return dir;
};

/** Diagnostics for a copy of (self-contained) concepts.ts plus a type fixture. */
function tscErrors(concepts: string, fixture = "") {
  const dir = tmp({
    "concepts.ts": concepts,
    "fixture.ts": `import type * as C from "./concepts";\n${fixture}\nexport {};\n`,
  });
  const program = ts.createProgram(
    [join(dir, "concepts.ts"), join(dir, "fixture.ts")],
    {
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      types: [],
      lib: ["lib.es2022.d.ts"],
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
    },
  );
  rmSync(dir, { recursive: true, force: true });
  return ts.getPreEmitDiagnostics(program).length;
}

/** Exit status of the permanent parity test run in a mutated mirror of the repo. */
function parity(mutate: (root: string) => void = () => {}) {
  expect(existsSync(PARITY), `${PARITY} must exist (spec In 3)`).toBe(true);
  const root = tmp({
    "vitest.config.mts": `export default { test: { include: [${JSON.stringify(PARITY)}] } };\n`,
  });
  for (const p of [MIG, "packages/api/src/crm", PARITY])
    cpSync(p, join(root, p), { recursive: true });
  symlinkSync(resolve("node_modules"), join(root, "node_modules"));
  mutate(root);
  const vitest = resolve("node_modules/vitest/vitest.mjs");
  const { status } = spawnSync(
    process.execPath,
    [vitest, "run", "--no-fsModuleCache"],
    { cwd: root },
  );
  rmSync(root, { recursive: true, force: true });
  return status;
}
const edit = (f: (s: string) => string) => (r: string) =>
  writeFileSync(join(r, CONCEPTS), f(read(join(r, CONCEPTS))));
const migration = (sql: string) => (r: string) =>
  writeFileSync(
    join(r, MIG, "29991231235959_acc2257_probe.sql"),
    `ALTER TYPE public.crm_link_entity_type ${sql};\n`,
  );
const PROBE = `{ id: "probe_extra", label: "p", owner: "asym", description: "p", linkPolicy: "direct_link", notSameAs: [] },\n]`;

describe("#2257 criteria 2, 4, 8: compile-time exhaustiveness", () => {
  it("concepts.ts type-checks, and CrmIdentityConceptId is exactly the 17 ids", () => {
    const E = EXPECTED.map((id) => JSON.stringify(id)).join(" | ");
    const eq = `[C.CrmIdentityConceptId] extends [E] ? ([E] extends [C.CrmIdentityConceptId] ? true : false) : false`;
    expect(tscErrors(read(CONCEPTS))).toBe(0);
    expect(
      tscErrors(
        read(CONCEPTS),
        `type E = ${E};\nexport const ok: ${eq} = true;`,
      ),
    ).toBe(0);
  });
  it.each(["household", "organization", "crm_person", "reconciliation_record"])(
    "removing the %s entry fails the type check (criterion 4)",
    (id) => expect(tscErrors(drop(read(CONCEPTS), id))).toBeGreaterThan(0),
  );
  it("crm-identity-concepts.test.ts is unedited (criterion 8)", () => {
    const text = read("tests/unit/packages/api/crm-identity-concepts.test.ts");
    expect(createHash("sha256").update(text).digest("hex")).toBe(
      "d937b3875de76764870f214cccd82b2b680184633bf8664f0962a255d2b7c0c9",
    );
  });
});

describe(
  "#2257 criterion 5: the parity test is mutation-proven",
  { timeout: 120_000 },
  () => {
    it("passes on the unmutated tree", () => expect(parity()).toBe(0));
    it.each<[string, (root: string) => void]>([
      [
        "an extra TS id",
        edit((s) =>
          s.replace(
            /\n\] as const satisfies/,
            `\n  ${PROBE} as const satisfies`,
          ),
        ),
      ],
      ["a missing TS id", edit((s) => drop(s, "reconciliation_record"))],
      [
        "an extra ADD VALUE migration",
        migration("ADD VALUE IF NOT EXISTS 'probe_extra'"),
      ],
      [
        "a RENAME VALUE migration",
        migration("RENAME VALUE 'crm_person' TO 'person'"),
      ],
    ])("fails on %s", (_name, mutate) => expect(parity(mutate)).not.toBe(0));
  },
);
