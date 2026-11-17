/** #492 done criteria 9, 10: four-eyes meta-capabilities and dormant tenantOverrides (spec r1). Owned by Acceptance.
 * Amended by AL-2675 (WP2a): `platform_admin` is retired; the named-grant
 * cases use `tenant_admin`, the only named subject left.
 * Approving a widening has no holder until Phase 12 (plan 5.1). */
import { describe, expect, it } from "vitest";

import * as H from "./harness";

describe("#492 criterion 9: four-eyes cannot collapse", () => {
  it.each([["tenant_admin", [H.VIEW, H.PROPOSE], [H.APPROVE]]])(
    "criterion 9: %s holds %j and not %j",
    async (s, has, lacks) => {
      const caps = await H.resolveFor(s);
      expect(caps).toEqual(expect.arrayContaining(has));
      for (const c of lacks) expect(caps).not.toContain(c);
    },
  );

  it("criterion 9: no subject holds approve (AL-2675); member:* and staff:* hold no permissions.* atom", async () => {
    for (const s of H.SUBJECTS) {
      const caps = await H.resolveFor(s);
      expect(caps, s).not.toContain(H.APPROVE);
      if (/^(member|staff):/.test(s))
        expect(
          caps.filter((c) => H.PERMS.includes(c)),
          s,
        ).toEqual([]);
    }
  });

  it("criterion 9: propose_widening and approve_widening are distinct registry keys", async () => {
    const { CAPABILITY_REGISTRY: R } = await H.load("registry");
    const [propose, approve] = [H.PROPOSE, H.APPROVE].map((k) => R[k]);
    expect(propose).toBeDefined();
    expect(approve).toBeDefined();
    expect(propose).not.toBe(approve);
  });
});

describe("#492 criterion 10: dormant tenantOverrides", () => {
  it.each(H.SUBJECTS)(
    "criterion 10: %s — omitted = undefined = exactly the platform defaults",
    async (s) => {
      const omitted = await H.resolveFor(s);
      expect(await H.resolveFor(s, undefined)).toEqual(omitted);
      expect([...omitted]).toEqual(H.expected(s));
    },
  );

  it("criterion 10: any non-undefined value throws tenant_overrides_dormant at runtime", async () => {
    const values = [{}, null, [], 0, "", false, { [H.APPROVE]: true }];
    const c = H.ctx(H.sourceFor("tenant_admin"));
    for (const v of values)
      expect((await H.thrown(c, v)).code, JSON.stringify(v)).toBe(
        "tenant_overrides_dormant",
      );
  });

  it("criterion 10: tsc rejects tenantOverrides = {}", () => {
    const diags = H.typecheck({
      "acc492-ovr.ts": [
        'import { resolveEffectiveCapabilities as r } from "./effective-capabilities";',
        'export const ok = r({ tenantId: "t", sources: [] }, undefined);',
        'export const bad = r({ tenantId: "t", sources: [] }, {});',
      ].join("\n"),
    });
    const mine = diags
      .filter(H.inCapDir)
      .map((d) => [d.file.slice(-13), d.line]);
    expect(mine).toEqual([["acc492-ovr.ts", 3]]);
  });
});
