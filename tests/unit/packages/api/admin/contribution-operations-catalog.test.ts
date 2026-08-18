import { describe, expect, it } from "vitest";

import {
  OPERATION_CATEGORY_LABELS,
  OPERATION_DEFINITIONS,
  contributionActionTitle,
  operationDefinitionFor,
} from "../../../../../packages/api/src/admin/contribution-operations/catalog";
import {
  CONTRIBUTION_ACTION_TYPES,
  type ContributionActionType,
} from "../../../../../packages/api/src/admin/contribution-operations/types";

const EMPTY_VALUES = {
  reason: "",
  confirmed: false,
} as const;

describe("OPERATION_DEFINITIONS", () => {
  it("keeps the staff amount-correction copy and cents payload", () => {
    const definition = OPERATION_DEFINITIONS.amount_correction;

    expect(definition.title).toBe("Correct gift amount");
    expect(definition.description).toBe(
      "Records an adjustment with the corrected amount. The original donation history is preserved.",
    );
    expect(definition.category).toBe("correction");
    expect(definition.riskCopy).toBe(
      "This changes the gift's effective amount everywhere it appears, including receipts and reports. High-risk corrections may require approval.",
    );
    expect(definition.downstreamEffects).toEqual([
      "Effective amount changes in CRM, the Contributions Hub, and reports.",
      "A sent receipt becomes receipt-affected and may need an updated receipt.",
    ]);
    expect(definition.requiresReason).toBe(true);
    expect(definition.requiresConfirmation).toBe(true);
    expect(definition.fields).toEqual(["amount"]);
    expect(definition.receiptFields).toEqual(["amount"]);
    expect(
      definition.buildPayload({
        values: { ...EMPTY_VALUES, amountDollars: "10.00" },
        stagedGiftId: null,
      }),
    ).toEqual({ amount: 1000 });
  });

  it("keeps the staff fund-correction copy and nulls an empty fund id", () => {
    const definition = OPERATION_DEFINITIONS.fund_correction;

    expect(definition.title).toBe("Correct fund designation");
    expect(definition.description).toBe(
      "Moves this gift's designation to a different fund through an audited adjustment.",
    );
    expect(definition.fields).toEqual(["fundId"]);
    expect(definition.receiptFields).toEqual(["designation"]);
    expect(
      definition.buildPayload({
        values: { ...EMPTY_VALUES, fundId: "fund_9" },
        stagedGiftId: "staged_1",
      }),
    ).toEqual({ fundId: "fund_9" });
    expect(
      definition.buildPayload({
        values: { ...EMPTY_VALUES, fundId: "" },
        stagedGiftId: null,
      }),
    ).toEqual({ fundId: null });
  });

  it("keeps send-receipt copy and an empty payload", () => {
    const definition = OPERATION_DEFINITIONS.resend_receipt;

    expect(definition.title).toBe("Send receipt");
    expect(definition.description).toBe(
      "Sends the gift receipt to the donor again.",
    );
    expect(definition.category).toBe("receipt");
    expect(definition.riskCopy).toBeNull();
    expect(definition.downstreamEffects).toEqual([
      "The donor receives a receipt email.",
    ]);
    expect(definition.requiresReason).toBe(false);
    expect(definition.requiresConfirmation).toBe(false);
    expect(definition.fields).toEqual([]);
    expect(definition.receiptFields).toEqual([]);
    expect(
      definition.buildPayload({ values: { ...EMPTY_VALUES }, stagedGiftId: null }),
    ).toEqual({});
  });

  it("keeps refund copy and converts dollars to cents", () => {
    const definition = OPERATION_DEFINITIONS.refund;

    expect(definition.title).toBe("Refund gift");
    expect(definition.description).toBe(
      "Refunds the donor through the payment provider. Refunds follow tenant approval policy.",
    );
    expect(definition.category).toBe("refund");
    expect(definition.receiptFields).toEqual([]);
    expect(
      definition.buildPayload({
        values: { ...EMPTY_VALUES, amountDollars: "25.50" },
        stagedGiftId: null,
      }),
    ).toEqual({ amount: 2550 });
  });

  it("keeps CRM posting-unavailable copy for approve and retry", () => {
    expect(OPERATION_DEFINITIONS.approve_staged_gift.title).toBe(
      "CRM posting unavailable",
    );
    expect(OPERATION_DEFINITIONS.approve_staged_gift.description).toBe(
      "Recorded posting state is historical while CRM data is maintained in Asym.",
    );
    expect(OPERATION_DEFINITIONS.retry_staged_gift.title).toBe(
      "CRM posting unavailable",
    );
    expect(OPERATION_DEFINITIONS.retry_staged_gift.description).toBe(
      "Recorded posting failures are historical while CRM data is maintained in Asym.",
    );
    expect(
      OPERATION_DEFINITIONS.approve_staged_gift.buildPayload({
        values: { ...EMPTY_VALUES },
        stagedGiftId: "staged_1",
      }),
    ).toEqual({});
    expect(
      OPERATION_DEFINITIONS.retry_staged_gift.buildPayload({
        values: { ...EMPTY_VALUES },
        stagedGiftId: "staged_1",
      }),
    ).toEqual({});
  });

  it("keeps provider replay copy and an empty payload", () => {
    const definition = OPERATION_DEFINITIONS.stripe_replay;

    expect(definition.title).toBe("Replay provider webhook");
    expect(definition.description).toBe(
      "Replays the stored provider event for technical recovery. Role-gated and audited.",
    );
    expect(definition.category).toBe("provider");
    expect(definition.requiresReason).toBe(true);
    expect(definition.requiresConfirmation).toBe(true);
    expect(
      definition.buildPayload({ values: { ...EMPTY_VALUES }, stagedGiftId: null }),
    ).toEqual({});
  });

  it("returns the same definition object from operationDefinitionFor", () => {
    expect(operationDefinitionFor("refund")).toBe(OPERATION_DEFINITIONS.refund);
  });
});

describe("OPERATION_CATEGORY_LABELS", () => {
  it("keeps the staff category labels", () => {
    expect(OPERATION_CATEGORY_LABELS).toEqual({
      correction: "Correction",
      receipt: "Receipt",
      refund: "Refund",
      crm: "Historical CRM",
      provider: "Provider / Admin",
    });
  });
});

describe("contributionActionTitle", () => {
  it("covers every Contribution action type with known-good titles", () => {
    const expectedTitles: Record<ContributionActionType, string> = {
      resend_receipt: "Send receipt",
      approve_staged_gift: "CRM posting unavailable",
      retry_staged_gift: "CRM posting unavailable",
      crm_repost: "Repost to CRM",
      metadata_update: "Update metadata",
      refund: "Refund gift",
      donor_relink: "Relink donor",
      amount_correction: "Correct gift amount",
      designation_correction: "Correct designation",
      fund_correction: "Correct fund designation",
      allocation_correction: "Correct allocation",
      receipt_correction: "Correct receipt",
      statement_correction: "Correct statement",
      payment_state_correction: "Correct payment state",
      stripe_replay: "Replay provider webhook",
    };

    expect(CONTRIBUTION_ACTION_TYPES).toHaveLength(15);
    for (const actionType of CONTRIBUTION_ACTION_TYPES) {
      expect(contributionActionTitle(actionType)).toBe(expectedTitles[actionType]);
    }
  });
});
