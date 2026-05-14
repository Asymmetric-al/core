import { describe, expect, it } from "vitest";

import { getTwentyObjectDefinition } from "../../../../packages/api/src/crm/schema/twenty-object-model";
import {
  buildTwentyGiftSummaryPayload,
  type StagedGiftRow,
} from "../../../../packages/api/src/giving/staged-gifts";

const requiredGiftSummaryFields = [
  "asymTenantId",
  "asymDonationId",
  "asymStagedGiftId",
  "donorId",
  "missionaryId",
  "fundId",
  "amountCents",
  "currencyCode",
  "stripePaymentIntentId",
  "stripeChargeId",
  "receiptStatus",
  "paymentStatus",
] as const;

const gift: StagedGiftRow = {
  allocationStatus: "single_allocation",
  amount: 5000,
  crmOutboundJobId: "crm-job-1",
  crmPostStatus: "queued",
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
  status: "ready_to_post",
  stripeChargeId: "ch_1",
  stripeEventId: "evt_1",
  stripePaymentIntentId: "pi_1",
  stripeRawEventId: "raw-1",
  tenantId: "tenant-1",
  twentyRecordId: null,
};

describe("Twenty giftSummaries contract", () => {
  it("treats giftSummaries as an existing provider object with the Phase 4 field inventory", () => {
    const definition = getTwentyObjectDefinition("giftSummaries");
    const fieldNames = definition.fields.map((field) => field.name).sort();

    expect(definition).toMatchObject({
      kind: "custom",
      namePlural: "giftSummaries",
      nameSingular: "giftSummary",
    });
    expect(fieldNames).toEqual([...requiredGiftSummaryFields].sort());
    expect(fieldNames).toContain("currencyCode");
    expect(fieldNames).not.toContain("currency");
  });

  it("keeps the gift summary payload aligned with the provider metadata fields", () => {
    const payload = buildTwentyGiftSummaryPayload(gift);
    const payloadKeys = Object.keys(payload).sort();

    expect(payloadKeys).toEqual([...requiredGiftSummaryFields].sort());
    expect(payload).toMatchObject({
      amountCents: 5000,
      asymDonationId: "donation-1",
      asymStagedGiftId: "staged-gift-1",
      asymTenantId: "tenant-1",
      currencyCode: "usd",
      paymentStatus: "ready_to_post",
    });
  });
});
