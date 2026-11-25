import { describe, expect, it } from "vitest";

import manifest from "../../../../docs/security/field-policies/manifest.json";
import * as census from "../../../../scripts/verify/field-policy-census.mjs";

describe("anonymous host projection", () => {
  it("pins the two same-name overrides (D-18: AL-2676: ruling WP3b part 2 Q1 adds donor_portal_hosts.primary_domain, public over an internal floor)", () => {
    expect(census.HOST_PROJECTION_FLOORS).toEqual({
      "site_domains.tenant_id": { category: "public", floor: "internal" },
      "donor_portal_hosts.primary_domain": {
        category: "public",
        floor: "internal",
      },
    });
    expect(manifest.record_types.donor_portal_hosts.primary_domain).toEqual({
      type: "text",
      nullable: true,
      category: "public",
      mission_control: "v--",
      donor: "---",
      missionary: "---",
      public: "v--",
      export: "---",
    });
    expect(census.manifestProblems(manifest)).toEqual([]);
  });
  it("rejects an obsolete donor_portal_hosts.primary_domain exception", () => {
    const copy = structuredClone(manifest);
    copy.record_types.donor_portal_hosts.primary_domain.category = "internal";
    expect(census.manifestProblems(copy).join("\n")).toMatch(
      /FLOOR .*donor_portal_hosts\.primary_domain.*stale/,
    );
  });
  it("rejects a public sites.primary_domain: the floor would become public", () => {
    const copy = structuredClone(manifest);
    copy.record_types.sites.primary_domain.category = "public";
    expect(census.manifestProblems(copy).join("\n")).toMatch(
      /FLOOR .*donor_portal_hosts\.primary_domain.*stale/,
    );
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
