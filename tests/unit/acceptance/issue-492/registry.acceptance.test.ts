/** #492 done criteria 1, 2, 3, 12: registry, bundles, default subjects, seeding rows (spec r1). Owned by Acceptance. */
import { existsSync } from "node:fs";

import ts from "typescript";
import { describe, expect, it } from "vitest";

import * as H from "./harness";

const FIXTURES = "tests/fixtures/capability-registry/tsconfig.json";

describe("#492 criterion 1: CAPABILITY_REGISTRY", () => {
  it("criterion 1: has exactly the 18 keys, each matching CAPABILITY_KEY_PATTERN", async () => {
    const { CAPABILITY_REGISTRY, CAPABILITY_KEY_PATTERN } =
      await H.load("registry");
    expect(H.sorted(Object.keys(CAPABILITY_REGISTRY))).toEqual(H.sorted(H.ALL));
    expect(String(CAPABILITY_KEY_PATTERN)).toBe(
      String(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/),
    );
    for (const key of H.ALL) expect(key).toMatch(CAPABILITY_KEY_PATTERN);
    expect("automation:manage").not.toMatch(CAPABILITY_KEY_PATTERN);
  });

  it("criterion 1: every entry has non-empty label, description, domain and source 'code'", async () => {
    const { CAPABILITY_REGISTRY } = await H.load("registry");
    for (const [key, meta] of Object.entries<Record<string, unknown>>(
      CAPABILITY_REGISTRY,
    )) {
      for (const f of ["label", "description", "domain"])
        expect(String(meta[f] ?? "").trim(), `${key}.${f}`).not.toBe("");
      expect(meta.source, key).toBe("code");
    }
  });

  it("criterion 1: a non-registry string in a Capability slot fails tsc with TS2322/TS2345 at the fixture lines", () => {
    expect(existsSync(`${H.CAP_DIR}/registry.ts`), "registry.ts").toBe(true);
    const diags = H.typecheck({
      "acc492-c1.ts": [
        'import type { Capability } from "./registry";',
        'export const ok: Capability = "permissions.view";',
        'export const bad: Capability = "admin.crm.delete";',
        "export const take = (c: Capability) => c;",
        'export const call = take("finance:manage_contributions");',
      ].join("\n"),
    });
    const mine = diags.filter((d) => d.file.endsWith("acc492-c1.ts"));
    expect(mine.map((d) => [d.line, d.code])).toEqual([
      [3, 2322],
      [5, 2345],
    ]);
    expect(
      diags.filter(H.inCapDir),
      "capability sources compile clean",
    ).toEqual(mine);
  });

  it("criterion 1: the Builder's committed tsc fixture project fails only with TS2322/TS2345-class errors in its own files", () => {
    expect(existsSync(FIXTURES), `${FIXTURES} (spec §6)`).toBe(true);
    const host = { ...ts.sys, onUnRecoverableConfigFileDiagnostic() {} };
    const cfg = ts.getParsedCommandLineOfConfigFile(FIXTURES, {}, host)!;
    const program = ts.createProgram(cfg.fileNames, cfg.options);
    const diags = ts.getPreEmitDiagnostics(program);
    expect(diags.some((d) => [2322, 2345].includes(d.code))).toBe(true);
    const where = diags.map((d) => d.file?.fileName ?? `TS${d.code}`);
    for (const f of where) expect(f).toContain(FIXTURES.replace(/[^/]+$/, ""));
  });
});

describe("#492 criterion 2: bundles", () => {
  it("criterion 2: every bundle member is a registry key; listed bundles match the incumbent tiers", async () => {
    const { CAPABILITY_REGISTRY } = await H.load("registry");
    const { CAPABILITY_BUNDLES } = await H.load("bundles");
    for (const [name, members] of Object.entries<string[]>(CAPABILITY_BUNDLES))
      for (const m of members)
        expect(Object.keys(CAPABILITY_REGISTRY), name).toContain(m);
    for (const [name, members] of Object.entries(H.BUNDLES))
      expect(H.sorted(CAPABILITY_BUNDLES[name]), name).toEqual(
        H.sorted(members),
      );
  });

  it("criterion 2: both chains are strict subsets", async () => {
    const { CAPABILITY_BUNDLES: B } = await H.load("bundles");
    const chains = [
      ["donor_care", "finance_staff", "finance_approver", "contribution_admin"],
      ["permissions_viewer", "permissions_proposer", "permissions_approver"],
    ];
    for (const chain of chains)
      for (const [i, name] of chain.slice(1).entries()) {
        const [lo, hi]: string[][] = [B[chain[i]!], B[name]];
        const strict = lo.every((c) => hi.includes(c)) && hi.length > lo.length;
        expect(strict, `${chain[i]} ⊂ ${name}`).toBe(true);
      }
  });

  it("criterion 2: a non-registry bundle member fails tsc in bundles.ts (compile-time satisfies)", () => {
    const src = H.read(`${H.CAP_DIR}/bundles.ts`);
    const literal = H.ALL.find((k) => src.includes(`"${k}"`));
    expect(literal, "bundles.ts names registry keys as literals").toBeDefined();
    const bad = (b: string) => b.replace(`"${literal}"`, '"admin.crm.erase"');
    const errors = H.errorsAfter(`${H.CAP_DIR}/bundles.ts`, bad);
    expect(errors.filter((d) => d.file.endsWith("bundles.ts"))).not.toEqual([]);
  });
});

describe("#492 criterion 3: ROLE_DEFAULT_BUNDLES", () => {
  it("criterion 3: covers exactly every GrantSubjectKey with the spec's default bundles", async () => {
    const { ROLE_DEFAULT_BUNDLES } = await H.load("bundles");
    expect(H.sorted(Object.keys(ROLE_DEFAULT_BUNDLES))).toEqual(
      H.sorted(H.SUBJECTS),
    );
    for (const s of H.SUBJECTS)
      expect(H.sorted(ROLE_DEFAULT_BUNDLES[s]), s).toEqual(
        H.sorted(H.DEFAULTS[s]!),
      );
  });

  it("criterion 3: adding a StaffSubrole member without an entry fails tsc in the capability files", () => {
    expect(existsSync(`${H.CAP_DIR}/bundles.ts`), "bundles.ts").toBe(true);
    const db = "packages/database/types/database.ts";
    const add = (src: string) =>
      src.replace(/type StaffSubrole =/, '$& "chaplain" |');
    expect(H.errorsAfter(db, add)).not.toEqual([]);
  });
});

describe("#492 criterion 12: capabilityRegistryRows()", () => {
  it("criterion 12: 18 capability rows mirror the registry, sorted by key", async () => {
    const { CAPABILITY_REGISTRY } = await H.load("registry");
    const { capabilityRegistryRows } = await H.load("rows");
    const { capabilities } = capabilityRegistryRows();
    expect(capabilities).toHaveLength(18);
    expect(capabilities.map((r: { key: string }) => r.key)).toEqual(
      H.sorted(H.ALL),
    );
    for (const row of capabilities) {
      const { label, description, domain, source } =
        CAPABILITY_REGISTRY[row.key];
      expect(row).toEqual({ key: row.key, label, description, domain, source });
    }
  });

  it("criterion 12: roleGrants flatten the defaults, FK-shaped, unique, sorted, deterministic", async () => {
    const { capabilityRegistryRows } = await H.load("rows");
    const first = capabilityRegistryRows();
    const keys = new Set(first.capabilities.map((r: { key: string }) => r.key));
    const pairs = first.roleGrants.map((g: Record<string, string>) => {
      expect(H.sorted(Object.keys(g))).toEqual(["capability", "subject"]);
      expect(keys.has(g.capability), g.capability).toBe(true);
      return g;
    });
    // Pin (Samson, 6388725367): sorted by subject, then capability.
    const want = H.sorted(H.SUBJECTS).flatMap((subject) =>
      H.expected(subject).map((capability) => ({ subject, capability })),
    );
    expect(pairs, "unique, sorted by subject then capability").toEqual(want);
    expect(capabilityRegistryRows()).toEqual(first);
  });
});
