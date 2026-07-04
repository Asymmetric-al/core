import { describe, expect, it } from "vitest";

import { buildIdentityFingerprint } from "../../src/crm/mapping/duplicates";
import { resolveGuestDonorMatch } from "../../src/public-giving";

import type { CrmIdentityFingerprint } from "../../src/crm/mapping/types";

/**
 * Public-giving WIRING — guest donor matching / entity resolution.
 *
 * Conrad 2026-07-04 §2: a guest may give without an account; behind the scenes
 * the system creates or matches the donor record primarily by normalized email.
 *  - exact/high-confidence email → attach to the existing canonical/surviving record
 *  - possible match (name/phone, different email) → merge candidate for review (never auto-merge)
 *  - low/none → create a new donor record
 * Reuses the CRM entity-resolution scorer; adds no new matching heuristics.
 */

const TENANT = "tenant-1";

function donorCandidate(
  entityId: string,
  fields: { email?: string; displayName?: string; phones?: string[] },
): CrmIdentityFingerprint {
  return buildIdentityFingerprint({
    tenantId: TENANT,
    entityType: "donor_profile",
    entityId,
    displayName: fields.displayName ?? null,
    primaryEmail: fields.email ?? null,
    phones: fields.phones ?? [],
  });
}

describe("resolveGuestDonorMatch", () => {
  it("attaches to the canonical record on an exact email match", () => {
    const candidates = [
      donorCandidate("donor-9", {
        email: "ada@example.com",
        displayName: "Ada L",
      }),
    ];
    const decision = resolveGuestDonorMatch(
      {
        tenantId: TENANT,
        email: "Ada@Example.com", // different case — normalized to match
        firstName: "Ada",
        lastName: "Lovelace",
      },
      candidates,
    );
    expect(decision.action).toBe("attach");
    expect(decision.matchedEntityId).toBe("donor-9");
  });

  it("routes a possible match (same name + phone, different email) to review, not auto-merge", () => {
    const candidates = [
      donorCandidate("donor-3", {
        email: "old@example.com",
        displayName: "Grace Hopper",
        phones: ["+15551230000"],
      }),
    ];
    const decision = resolveGuestDonorMatch(
      {
        tenantId: TENANT,
        email: "grace.new@example.com",
        firstName: "Grace",
        lastName: "Hopper",
        phone: "+1 (555) 123-0000",
      },
      candidates,
    );
    expect(decision.action).toBe("review");
    expect(decision.matchedEntityId).toBe("donor-3");
    expect(decision.score?.recommendation).toBe("merge_candidate");
  });

  it("creates a new donor when there is no meaningful overlap", () => {
    const candidates = [
      donorCandidate("donor-x", {
        email: "someone@else.com",
        displayName: "Someone Else",
      }),
    ];
    const decision = resolveGuestDonorMatch(
      { tenantId: TENANT, email: "brand.new@example.com", firstName: "Brand" },
      candidates,
    );
    expect(decision.action).toBe("create");
    expect(decision.matchedEntityId).toBeNull();
  });

  it("routes to review when two records share the same email (no single canonical record)", () => {
    const candidates = [
      donorCandidate("donor-a", { email: "dup@example.com", displayName: "A" }),
      donorCandidate("donor-b", { email: "dup@example.com", displayName: "B" }),
    ];
    const decision = resolveGuestDonorMatch(
      { tenantId: TENANT, email: "dup@example.com" },
      candidates,
    );
    expect(decision.action).toBe("review");
  });

  it("creates a new donor when there are no candidates at all", () => {
    const decision = resolveGuestDonorMatch(
      { tenantId: TENANT, email: "first@example.com" },
      [],
    );
    expect(decision.action).toBe("create");
  });

  it("never matches a candidate from a different tenant (isolation)", () => {
    const foreign = buildIdentityFingerprint({
      tenantId: "tenant-2",
      entityType: "donor_profile",
      entityId: "foreign-1",
      primaryEmail: "ada@example.com",
    });
    const decision = resolveGuestDonorMatch(
      { tenantId: TENANT, email: "ada@example.com" },
      [foreign],
    );
    expect(decision.action).toBe("create");
    expect(decision.matchedEntityId).toBeNull();
  });
});
