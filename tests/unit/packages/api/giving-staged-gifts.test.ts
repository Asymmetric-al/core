import { describe, expect, it } from "vitest";

import {
  buildTwentyGiftSummaryPayload,
  canTransitionStagedGift,
  type StagedGiftRow,
} from "../../../../packages/api/src/giving/staged-gifts";

const gift: StagedGiftRow = {
  allocationStatus: "single_allocation",
  amount: 12345,
  crmOutboundJobId: null,
  crmPostStatus: "not_required",
  currency: "usd",
  donationId: "donation-1",
  donorId: "donor-1",
  donorMatchStatus: "matched",
  fundId: "fund-1",
  id: "staged-gift-1",
  metadata: {},
  missionaryId: "missionary-1",
  receiptStatus: "pending",
  reviewReason: null,
  status: "received",
  stripeChargeId: "ch_1",
  stripeEventId: "evt_1",
  stripePaymentIntentId: "pi_1",
  stripeRawEventId: "raw-1",
  tenantId: "tenant-1",
  twentyRecordId: null,
};

describe("giving staged gift helpers", () => {
  it("allows review-safe transitions and blocks terminal churn", () => {
    expect(canTransitionStagedGift("received", "ready_to_post")).toBe(true);
    expect(canTransitionStagedGift("ready_to_post", "posted")).toBe(true);
    expect(canTransitionStagedGift("posted", "ready_to_post")).toBe(false);
    expect(canTransitionStagedGift("voided", "ready_to_post")).toBe(false);
  });

  it("builds a summary-only Twenty payload without moving payment truth to CRM", () => {
    expect(buildTwentyGiftSummaryPayload(gift)).toEqual({
      amountCents: 12345,
      asymDonationId: "donation-1",
      asymStagedGiftId: "staged-gift-1",
      asymTenantId: "tenant-1",
      currency: "usd",
      donorId: "donor-1",
      fundId: "fund-1",
      missionaryId: "missionary-1",
      paymentStatus: "received",
      receiptStatus: "pending",
      stripeChargeId: "ch_1",
      stripePaymentIntentId: "pi_1",
    });
  });
});
