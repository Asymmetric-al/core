import { describe, expect, it } from "vitest";
import manifest from "../../../../docs/security/field-policies/manifest.json";
import * as census from "../../../../scripts/verify/field-policy-census.mjs";

describe("anonymous host projection", () => {
  // D-18: plan 5.4 admits the resolver's tenant ID, not all tenant IDs; the 21 November council kept C6 absolute.
  it("pins the sole same-name override", () => {
    expect(Object.keys(census.HOST_PROJECTION_FLOORS)).toEqual([
      "site_domains.tenant_id",
    ]);
    expect(census.manifestProblems(manifest)).toEqual([]);
  });
  it("rejects an adjacent public tenant ID", () => {
    const copy = structuredClone(manifest);
    copy.record_types.sites.tenant_id.category = "public";
    expect(census.manifestProblems(copy).join("\n")).toMatch(
      /FLOOR .*sites\.tenant_id/,
    );
  });
  it("rejects an obsolete exception", () => {
    const copy = structuredClone(manifest);
    copy.record_types.site_domains.tenant_id.category = "internal";
    expect(census.manifestProblems(copy).join("\n")).toMatch(
      /FLOOR .*site_domains\.tenant_id.*stale/,
    );
  });
});
