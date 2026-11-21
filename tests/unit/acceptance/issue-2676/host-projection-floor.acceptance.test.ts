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
  it("rejects the override once its column leaves a manifest that keeps the table", () => {
    const copy = structuredClone(manifest);
    delete (copy.record_types.site_domains as Record<string, unknown>)
      .tenant_id;
    expect(census.manifestProblems(copy).join("\n")).toMatch(
      /FLOOR .*site_domains\.tenant_id.*stale/,
    );
  });
  // The gate is also run on a manifest aligned to a historical oracle that
  // predates the Site tables (#2254, criterion 9): the override is inert
  // there, so the repository's own manifest is pinned to carry it here.
  it("holds the repository's manifest to the reviewed column, and leaves a manifest without Sites alone", () => {
    expect(manifest.record_types.site_domains.tenant_id.category).toBe(
      "public",
    );
    const copy = structuredClone(manifest) as {
      record_types: Record<string, unknown>;
    };
    delete copy.record_types.site_domains;
    expect(
      census
        .manifestProblems(copy as typeof manifest)
        .filter((problem: string) => problem.startsWith("FLOOR")),
    ).toEqual([]);
  });
});
