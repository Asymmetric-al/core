import { describe, expect, it } from "vitest";

import {
  mapDonorToTwentyPersonDraft,
  mapPledgeToTwentyRelationshipCommitmentDraft,
} from "../../../../packages/api/src/crm/mapping/transforms";

import type { Donor, DonorPledge } from "@asym/database/types";

const donor = {
  id: "donor-1",
  tenant_id: "tenant-1",
  profile_id: "profile-1",
  missionary_id: "missionary-1",
  name: " Ada   Lovelace ",
  email: " ADA@Example.COM ",
  phone: "(555) 123-4567",
  mobile: null,
  work_phone: null,
  preferred_contact: "email",
  avatar_url: null,
  location: "London",
  type: "individual",
  status: "active",
  giving_preferences: {},
  total_given: 250_00,
  first_gift_date: "2026-01-01",
  last_gift_date: "2026-02-01",
  last_gift_amount: 50_00,
  gift_count: 5,
  frequency: "monthly",
  joined_date: "2026-01-01",
  tags: ["partner"],
  score: 92,
  address: { city: "London" },
  work_address: null,
  website: null,
  organization: "Analytical Engine Society",
  title: "Patron",
  birthday: null,
  anniversary: null,
  spouse: null,
  notes: "Important relationship note",
  do_not_contact: false,
  do_not_email: false,
  receipt_email_frequency: "annual",
  default_update_frequency: "monthly",
  preferred_language: "en",
  has_active_pledge: true,
  stripe_customer_id: "cus_123",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-02-01T00:00:00.000Z",
} satisfies Donor;

const pledge = {
  id: "pledge-1",
  tenant_id: "tenant-1",
  donor_id: "donor-1",
  missionary_id: "missionary-1",
  fund_id: "fund-1",
  amount: 100_00,
  currency: "usd",
  frequency: "monthly",
  status: "active",
  start_date: "2026-01-01",
  end_date: null,
  next_payment_date: "2026-06-01",
  stripe_subscription_id: "sub_123",
  billing_day_of_month: 15,
  billing_timezone: "America/Los_Angeles",
  stripe_payment_method_id: "pm_123",
  retry_count: 1,
  last_charge_at: "2026-04-01T00:00:00.000Z",
  last_charge_attempt: "2026-04-01T00:00:00.000Z",
  failed_charge_count: 0,
  pause_reason: null,
  paused_at: null,
  next_charge_at: "2026-06-01T00:00:00.000Z",
  total_paid: 300_00,
  total_expected: 1200_00,
  payments_completed: 3,
  payments_remaining: 9,
  payment_method: "card",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-02-01T00:00:00.000Z",
} satisfies DonorPledge;

describe("CRM import transforms", () => {
  it("maps donor profiles into Twenty people without collapsing identities", () => {
    const draft = mapDonorToTwentyPersonDraft(donor);

    expect(draft).toMatchObject({
      objectName: "people",
      source: {
        entityType: "donor_profile",
        entityId: "donor-1",
        tenantId: "tenant-1",
      },
      fields: {
        name: {
          firstName: "Ada",
          lastName: "Lovelace",
        },
        primaryEmail: "ada@example.com",
        primaryPhone: "+15551234567",
        organizationName: "Analytical Engine Society",
      },
    });
    expect(draft.relatedLinks).toEqual(
      expect.arrayContaining([
        {
          entityType: "asym_profile",
          entityId: "profile-1",
          relationship: "profile_for_donor",
        },
        {
          entityType: "stripe_customer",
          entityId: "cus_123",
          relationship: "billing_customer_for_donor",
        },
      ]),
    );
    expect(JSON.stringify(draft.fields)).not.toContain("total_given");
    expect(JSON.stringify(draft.fields)).not.toContain("stripe_customer_id");
  });

  it("maps pledges as relationship commitments instead of payment execution truth", () => {
    const draft = mapPledgeToTwentyRelationshipCommitmentDraft(pledge);

    expect(draft).toMatchObject({
      objectName: "relationshipCommitments",
      source: {
        entityType: "pledge_or_relationship_commitment",
        entityId: "pledge-1",
        tenantId: "tenant-1",
      },
      fields: {
        asymPledgeId: "pledge-1",
        commitmentAmountCents: 100_00,
        currency: "USD",
        frequency: "monthly",
        commitmentStatus: "active",
      },
    });
    expect(JSON.stringify(draft.fields)).not.toContain("sub_123");
    expect(JSON.stringify(draft.fields)).not.toContain("pm_123");
    expect(JSON.stringify(draft.fields)).not.toContain("total_paid");
    expect(JSON.stringify(draft.fields)).not.toContain("retry_count");
  });
});
