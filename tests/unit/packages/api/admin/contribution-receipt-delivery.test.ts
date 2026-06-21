import { describe, expect, it } from "vitest";

import {
  computeReceiptAffectedFields,
  evaluateReceiptDeliveryOptions,
  resolveConfirmedReceiptDelivery,
  resolveTenantReceiptDeliveryPolicy,
  validateReceiptDeliverySelection,
} from "../../../../../packages/api/src/admin/contribution-operations/receipt-delivery";

const MANAGE_RECEIPTS = "contributions.manage_receipts";

describe("admin/contribution-operations/receipt-delivery", () => {
  it("resolves conservative tenant policy defaults", () => {
    const policy = resolveTenantReceiptDeliveryPolicy(null);

    expect(policy).toEqual({
      defaultChoice: "email",
      allowDefer: true,
      deferReasonRequired: true,
      requireDeliveryAction: false,
      emailCapability: MANAGE_RECEIPTS,
      pdfCapability: MANAGE_RECEIPTS,
    });
  });

  it("computes which receipt fields a correction changes", () => {
    expect(computeReceiptAffectedFields({ amountCents: 20_000 })).toEqual([
      "amount",
    ]);
    expect(
      computeReceiptAffectedFields({ fundId: "fund-2" }).includes(
        "designation",
      ),
    ).toBe(true);
    expect(
      computeReceiptAffectedFields({
        designationLines: [
          {
            id: "l1",
            amountCents: 1,
            fundId: "f",
            missionaryId: null,
            memo: null,
          },
        ],
      }),
    ).toEqual(["designation"]);
    expect(computeReceiptAffectedFields({})).toEqual([]);
  });

  it("blocks email when the donor has no address or opted out, guiding staff to PDF", () => {
    const policy = resolveTenantReceiptDeliveryPolicy(null);

    const optedOut = evaluateReceiptDeliveryOptions({
      policy,
      donor: { email: "donor@example.com", doNotEmail: true },
      actorCapabilities: [MANAGE_RECEIPTS],
    });
    const emailOption = optedOut.options.find(
      (option) => option.choice === "email",
    )!;
    expect(emailOption.available).toBe(false);
    expect(emailOption.blockedReason).toMatch(/opted out/i);
    expect(optedOut.defaultChoice).toBe("pdf");

    const noEmail = evaluateReceiptDeliveryOptions({
      policy,
      donor: { email: null, doNotEmail: false },
      actorCapabilities: [MANAGE_RECEIPTS],
    });
    expect(
      noEmail.options.find((option) => option.choice === "email")!.available,
    ).toBe(false);
    expect(noEmail.defaultChoice).toBe("pdf");

    const allowed = evaluateReceiptDeliveryOptions({
      policy,
      donor: { email: "donor@example.com", doNotEmail: false },
      actorCapabilities: [MANAGE_RECEIPTS],
    });
    expect(
      allowed.options.find((option) => option.choice === "email")!.available,
    ).toBe(true);
    expect(allowed.defaultChoice).toBe("email");
  });

  it("enforces selection rules server-side", () => {
    const policy = resolveTenantReceiptDeliveryPolicy(null);
    const donor = { email: "donor@example.com", doNotEmail: true };

    expect(() =>
      validateReceiptDeliverySelection({
        policy,
        donor,
        actorCapabilities: [MANAGE_RECEIPTS],
        selection: { choice: "email" },
      }),
    ).toThrowError(/opted out/i);

    expect(() =>
      validateReceiptDeliverySelection({
        policy,
        donor,
        actorCapabilities: [MANAGE_RECEIPTS],
        selection: { choice: "defer" },
      }),
    ).toThrowError(/reason/i);

    expect(() =>
      validateReceiptDeliverySelection({
        policy,
        donor,
        actorCapabilities: [MANAGE_RECEIPTS],
        selection: { choice: "defer", deferReason: "Donor asked us to wait" },
      }),
    ).not.toThrow();

    expect(() =>
      validateReceiptDeliverySelection({
        policy: resolveTenantReceiptDeliveryPolicy({ allow_defer: false }),
        donor,
        actorCapabilities: [MANAGE_RECEIPTS],
        selection: { choice: "defer", deferReason: "any" },
      }),
    ).toThrowError(/defer/i);

    expect(() =>
      validateReceiptDeliverySelection({
        policy,
        donor: { email: "donor@example.com", doNotEmail: false },
        actorCapabilities: [],
        selection: { choice: "email" },
      }),
    ).toThrowError(/manage_receipts/);
  });

  it("rejects defer when tenant policy requires an email or PDF action", () => {
    const policy = resolveTenantReceiptDeliveryPolicy({
      default_choice: "defer",
      allow_defer: true,
      require_delivery_action: true,
    });
    const donor = { email: "donor@example.com", doNotEmail: false };

    const evaluated = evaluateReceiptDeliveryOptions({
      policy,
      donor,
      actorCapabilities: [MANAGE_RECEIPTS],
    });

    expect(
      evaluated.options.find((option) => option.choice === "defer"),
    ).toMatchObject({
      available: false,
      blockedReason: expect.stringMatching(/requires email delivery or pdf/i),
    });
    expect(evaluated.defaultChoice).toBe("pdf");

    expect(() =>
      validateReceiptDeliverySelection({
        policy,
        donor,
        actorCapabilities: [MANAGE_RECEIPTS],
        selection: { choice: "defer", deferReason: "Handle later" },
      }),
    ).toThrowError(/requires email delivery or PDF generation/i);

    expect(() =>
      validateReceiptDeliverySelection({
        policy,
        donor,
        actorCapabilities: [MANAGE_RECEIPTS],
        selection: { choice: "pdf" },
      }),
    ).not.toThrow();
  });

  it("lets the approver confirm or change the requester proposal", () => {
    const proposal = { choice: "email" as const, deferReason: null };

    const confirmed = resolveConfirmedReceiptDelivery({
      proposal,
      approverSelection: null,
    });
    expect(confirmed.confirmed).toEqual(proposal);
    expect(confirmed.changedByApprover).toBe(false);

    const changed = resolveConfirmedReceiptDelivery({
      proposal,
      approverSelection: { choice: "pdf", deferReason: null },
    });
    expect(changed.requested).toEqual(proposal);
    expect(changed.confirmed.choice).toBe("pdf");
    expect(changed.changedByApprover).toBe(true);
  });
});
