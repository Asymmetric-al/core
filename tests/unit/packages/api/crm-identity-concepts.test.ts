import { describe, expect, it } from "vitest";

import {
  CRM_IDENTITY_CONCEPTS,
  getCrmIdentityConcept,
} from "../../../../packages/api/src/crm/identity/concepts";

describe("CRM identity concepts", () => {
  it("defines the required identity concepts without collapsing them", () => {
    const conceptIds = CRM_IDENTITY_CONCEPTS.map((concept) => concept.id);

    expect(conceptIds).toEqual(
      expect.arrayContaining([
        "supabase_auth_user",
        "asym_profile",
        "tenant_membership",
        "crm_person",
        "donor_profile",
        "missionary_profile",
        "cms_public_entity",
        "stripe_customer",
        "fund_or_project",
        "pledge_or_relationship_commitment",
        "payment_record",
        "receipt_record",
        "refund_record",
        "statement_record",
        "reconciliation_record",
      ]),
    );
    expect(new Set(conceptIds).size).toBe(conceptIds.length);
  });

  it("keeps auth users, profiles, donors, missionaries, and CRM people distinct", () => {
    expect(getCrmIdentityConcept("supabase_auth_user").notSameAs).toContain(
      "crm_person",
    );
    expect(getCrmIdentityConcept("asym_profile").notSameAs).toContain(
      "crm_person",
    );
    expect(getCrmIdentityConcept("donor_profile").notSameAs).toContain(
      "crm_person",
    );
    expect(getCrmIdentityConcept("missionary_profile").notSameAs).toContain(
      "crm_person",
    );
  });

  it("keeps Stripe and money execution records out of the CRM person identity", () => {
    expect(getCrmIdentityConcept("stripe_customer").notSameAs).toContain(
      "donor_profile",
    );
    expect(getCrmIdentityConcept("payment_record").linkPolicy).toBe(
      "summary_only",
    );
    expect(getCrmIdentityConcept("receipt_record").linkPolicy).toBe(
      "no_crm_identity_link",
    );
  });
});
