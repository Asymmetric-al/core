import { describe, expect, it } from "vitest";

import {
  buildIdentityFingerprint,
  scoreDuplicateCandidate,
} from "../../../../packages/api/src/crm/mapping/duplicates";

describe("CRM duplicate rules", () => {
  it("scores exact email plus phone as a high-confidence link candidate", () => {
    const result = scoreDuplicateCandidate(
      buildIdentityFingerprint({
        tenantId: "tenant-1",
        entityType: "donor_profile",
        entityId: "donor-1",
        displayName: "Ada Lovelace",
        primaryEmail: "Ada@Example.com",
        phones: ["555-123-4567"],
      }),
      buildIdentityFingerprint({
        tenantId: "tenant-1",
        entityType: "crm_person",
        entityId: "twenty-person-1",
        displayName: "Ada Lovelace",
        primaryEmail: "ada@example.com",
        phones: ["+1 (555) 123-4567"],
      }),
    );

    expect(result).toMatchObject({
      confidence: "high",
      recommendation: "link_candidate",
    });
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.reasons).toEqual(
      expect.arrayContaining(["email_exact", "phone_exact", "name_exact"]),
    );
  });

  it("keeps low-confidence matches as merge candidates, not automatic links", () => {
    const result = scoreDuplicateCandidate(
      buildIdentityFingerprint({
        tenantId: "tenant-1",
        entityType: "donor_profile",
        entityId: "donor-1",
        displayName: "Ada Lovelace",
        organizationName: "Analytical Engine Society",
      }),
      buildIdentityFingerprint({
        tenantId: "tenant-1",
        entityType: "crm_person",
        entityId: "twenty-person-2",
        displayName: "Ada Lovelace",
        organizationName: "Analytical Engine Society",
      }),
    );

    expect(result).toMatchObject({
      confidence: "low",
      recommendation: "merge_candidate",
    });
    expect(result.score).toBeLessThan(65);
  });

  it("blocks cross-tenant duplicate scoring", () => {
    const result = scoreDuplicateCandidate(
      buildIdentityFingerprint({
        tenantId: "tenant-1",
        entityType: "donor_profile",
        entityId: "donor-1",
        primaryEmail: "ada@example.com",
      }),
      buildIdentityFingerprint({
        tenantId: "tenant-2",
        entityType: "crm_person",
        entityId: "twenty-person-1",
        primaryEmail: "ada@example.com",
      }),
    );

    expect(result).toEqual({
      confidence: "none",
      recommendation: "ignore",
      reasons: ["tenant_mismatch"],
      score: 0,
    });
  });
});
