/** #492 done criteria 6, 7, 8, 11: one selected context, threat model, non-disclosure, determinism (spec r1). Owned by Acceptance. */
import { describe, expect, it } from "vitest";

import * as H from "./harness";

const EFF = "effective-capabilities";
const financeHat = H.assignment("staff", "finance");

describe("#492 criterion 6: multi-hat resolves only the selected context", () => {
  it.each(["donor", "missionary"])(
    "criterion 6: a selected %s assignment resolves to [] although the person also holds finance staff",
    async (role) => {
      const { resolveEffectiveCapabilities: resolve } = await H.load(EFF);
      const selected = H.assignment(role, null);
      expect(resolve(H.ctx(selected))).toEqual([]);
      // Smuggled hats (memberships, profileRole, a third argument) never elevate.
      const hats = { memberships: [financeHat], profileRole: "super_admin" };
      const args = [{ ...H.ctx(selected), ...hats }, undefined, hats];
      let out: unknown = [];
      try {
        out = Reflect.apply(resolve, undefined, args);
      } catch (e) {
        expect(H.CODES).toContain((e as { code?: string }).code);
      }
      expect(out).toEqual([]);
      expect(resolve.length).toBeLessThanOrEqual(2);
    },
  );

  it("criterion 6: two assignment sources throw multiple_assignments", async () => {
    const two = H.ctx(H.assignment("donor", null), financeHat);
    expect((await H.thrown(two)).code).toBe("multiple_assignments");
  });

  it("criterion 6: tsc rejects AuthenticatedContext, a memberships array or profileRole", () => {
    const head = [
      'import { resolveEffectiveCapabilities as r } from "./effective-capabilities";',
      'import type { AuthenticatedContext } from "../context";',
      "declare const auth: AuthenticatedContext;",
    ];
    const cases = {
      "acc492-auth.ts": "export const a = r(auth);",
      "acc492-mem.ts":
        'export const a = r({ tenantId: "t", sources: [], memberships: auth.memberships });',
      "acc492-role.ts":
        'export const a = r({ tenantId: "t", sources: [], profileRole: "admin" });',
      "acc492-ok.ts": 'export const a = r({ tenantId: "t", sources: [] });',
    };
    const diags = H.typecheck(
      Object.fromEntries(
        Object.entries(cases).map(([f, l]) => [f, [...head, l].join("\n")]),
      ),
    );
    const lines = (f: string) =>
      diags.filter((d) => d.file.endsWith(f)).map((d) => d.line);
    for (const f of Object.keys(cases))
      expect(lines(f), f).toEqual(f.endsWith("ok.ts") ? [] : [4]);
    expect(
      diags.filter(H.inCapDir).filter((d) => !d.file.includes("acc492-")),
    ).toEqual([]);
  });
});

const [A, N, F] = [H.assignment, H.named, { tenantId: H.T2 }];
const [off, gone, fin] = [{ isActive: false }, { active: false }, financeHat];
/** code -> label -> context, for forged, foreign, revoked and empty inputs. */
const BAD: Record<string, Record<string, unknown>> = {
  foreign_tenant: {
    "foreign assignment": H.ctx(A("staff", "finance", F)),
    "foreign named grant": H.ctx(N("platform_admin", F)),
    "valid named + foreign": H.ctx(N("tenant_admin"), A("donor", null, F)),
  },
  inactive_source: {
    "revoked assignment": H.ctx(A("staff", "hr", off)),
    "revoked named grant": H.ctx(N("tenant_admin", gone)),
    "valid + revoked named": H.ctx(fin, N("platform_admin", gone)),
  },
  unknown_subject: {
    "unknown role": H.ctx(A("admin", null)),
    "unknown subrole": H.ctx(A("staff", "ceo-x9")),
    "unknown named subject": H.ctx(N("super_admin")),
  },
  missing_context: {
    "empty tenant id": { tenantId: "", sources: [fin] },
    "missing tenant id": { sources: [fin] },
    "missing context": undefined,
  },
};
const CASES = Object.entries(BAD).flatMap(([code, cases]) =>
  Object.entries(cases).map(([label, c]) => [label, c, code] as const),
);

describe("#492 criterion 7: forged, foreign or revoked input throws, no partial result", () => {
  it.each(CASES)("criterion 7: %s", async (_label, c, code) => {
    expect((await H.thrown(c)).code).toBe(code);
  });

  it("criterion 7: malformed shapes (null context, non-array sources, unknown kind) throw a CapabilityResolutionError", async () => {
    for (const bad of [
      null,
      { tenantId: H.T, sources: "x" },
      H.ctx({ ...financeHat, kind: "hat" }),
    ])
      expect(H.CODES).toContain((await H.thrown(bad)).code);
  });
});

describe("#492 criterion 8: errors disclose only the code", () => {
  const SECRETS = [...H.ALL, ...H.SUBJECTS, H.T, H.T2];
  SECRETS.push(
    ...H.words("asg- grt- ceo-x9 super_admin finance donor missionary"),
  );
  it.each(CASES)("criterion 8: %s", async (_label, c, code) => {
    const err = await H.thrown(c);
    expect(err.message).toBe(code);
    const own = Object.values(err).map(String);
    for (const v of own) expect([code, err.name]).toContain(v);
    const surface = `${err.message} ${String(err)} ${JSON.stringify(err)} ${own}`;
    for (const s of SECRETS) expect(surface, `leaks ${s}`).not.toContain(s);
  });
});

describe("#492 criterion 11: determinism", () => {
  it("criterion 11: sorted, de-duplicated, frozen, order-independent and repeatable", async () => {
    const { resolveEffectiveCapabilities: resolve } = await H.load(EFF);
    const subjects = ["staff:finance", "tenant_admin", "platform_admin"];
    const sources = subjects.map(H.sourceFor);
    const out = resolve(H.ctx(...sources));
    const want = H.sorted(new Set(subjects.flatMap(H.expected)));
    expect(out).toEqual(want);
    expect(resolve(H.ctx(...[...sources].reverse()))).toEqual(out);
    expect(resolve(H.ctx(...sources))).toEqual(out);
    expect(Object.isFrozen(out)).toBe(true);
    expect(() => out.push("admin.crm.manage")).toThrow(TypeError);
  });
});
