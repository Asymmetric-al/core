import { describe, expect, it } from "vitest";

import {
  assertCanDecideCorrectionRequest,
  canDecideCorrectionRequest,
  resolveCorrectionApprovalPolicy,
} from "../../../../../packages/api/src/admin/contribution-operations/approval-policy";
import {
  buildReceiptSnapshotContent,
  computeReceiptAffectedFields,
  evaluateReceiptDeliveryOptions,
  parseReceiptSnapshotContent,
  resolveConfirmedReceiptDelivery,
  resolveTenantReceiptDeliveryPolicy,
  validateReceiptDeliverySelection,
  type ReceiptSnapshotContentV1,
  type ReceiptSnapshotSourceDetail,
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

  it("returns no default choice when every delivery option is unavailable", () => {
    const policy = resolveTenantReceiptDeliveryPolicy({
      default_choice: "defer",
      allow_defer: true,
      require_delivery_action: true,
    });

    const evaluated = evaluateReceiptDeliveryOptions({
      policy,
      donor: { email: null, doNotEmail: false },
      actorCapabilities: [],
    });

    expect(evaluated.options).toEqual([
      {
        choice: "email",
        available: false,
        blockedReason: "The donor has no email address on file.",
      },
      {
        choice: "pdf",
        available: false,
        blockedReason:
          "Generating updated receipt PDFs requires contributions.manage_receipts.",
      },
      {
        choice: "defer",
        available: false,
        blockedReason: expect.stringMatching(
          /requires email delivery or pdf generation/i,
        ),
      },
    ]);
    expect(evaluated.defaultChoice).toBeNull();
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

function snapshotSourceDetail(): ReceiptSnapshotSourceDetail {
  return {
    shared: {
      donationId: "donation-1",
      donorName: "Jordan Donor",
      giftDate: "2026-05-01",
      currencyCode: "USD",
    },
    effective: {
      amountCents: 20_000,
      fundId: "fund-1",
      missionaryId: "missionary-1",
      paymentStatus: "completed",
    },
    designations: {
      lines: [
        {
          id: "line-1",
          amountCents: 12_000,
          fundId: "fund-1",
          fundName: "Clean Water Initiative",
          missionaryId: "missionary-1",
          missionaryName: "Riley Worker",
          memo: "Well repair",
        },
        {
          id: "line-2",
          amountCents: 8_000,
          fundId: null,
          fundName: "General Fund",
          missionaryId: null,
          missionaryName: null,
          memo: null,
        },
      ],
    },
  };
}

describe("receipt snapshot content (V1)", () => {
  it("captures versioned, self-contained render input with every designation line", () => {
    const content = buildReceiptSnapshotContent({
      detail: snapshotSourceDetail(),
      affectedFields: ["amount", "designation"],
      adjustmentId: "adj-1",
      now: new Date("2026-06-01T12:00:00.000Z"),
    });

    expect(content).toEqual({
      version: 1,
      donationId: "donation-1",
      donorName: "Jordan Donor",
      giftDate: "2026-05-01",
      currencyCode: "USD",
      effective: {
        amountCents: 20_000,
        fundId: "fund-1",
        missionaryId: "missionary-1",
        paymentStatus: "completed",
      },
      designationLines: [
        {
          id: "line-1",
          amountCents: 12_000,
          fundId: "fund-1",
          fundName: "Clean Water Initiative",
          missionaryId: "missionary-1",
          missionaryName: "Riley Worker",
          memo: "Well repair",
        },
        {
          id: "line-2",
          amountCents: 8_000,
          fundId: null,
          fundName: "General Fund",
          missionaryId: null,
          missionaryName: null,
          memo: null,
        },
      ],
      affectedFields: ["amount", "designation"],
      adjustmentId: "adj-1",
      generatedAt: "2026-06-01T12:00:00.000Z",
    });
  });

  it("round-trips built content through JSON storage and the parser", () => {
    const content = buildReceiptSnapshotContent({
      detail: snapshotSourceDetail(),
      affectedFields: ["amount"],
      adjustmentId: "adj-1",
      now: new Date("2026-06-01T12:00:00.000Z"),
    });

    const parsed = parseReceiptSnapshotContent(
      JSON.parse(JSON.stringify(content)),
    );

    expect(parsed).toEqual(content);
  });

  it("returns null for legacy bare snapshots that predate versioning", () => {
    const legacy = {
      effective: {
        amountCents: 20_000,
        fundId: null,
        missionaryId: null,
        paymentStatus: "completed",
      },
      designationLines: [],
    };

    expect(parseReceiptSnapshotContent(legacy)).toBeNull();
    expect(parseReceiptSnapshotContent(null)).toBeNull();
    expect(parseReceiptSnapshotContent("v1")).toBeNull();
    expect(parseReceiptSnapshotContent({ version: 2 })).toBeNull();
  });

  it("rejects snapshots missing financial truth but tolerates cosmetic gaps", () => {
    const valid = JSON.parse(
      JSON.stringify(
        buildReceiptSnapshotContent({
          detail: snapshotSourceDetail(),
          affectedFields: ["amount"],
          adjustmentId: null,
          now: new Date("2026-06-01T12:00:00.000Z"),
        }),
      ),
    ) as Record<string, unknown>;

    expect(
      parseReceiptSnapshotContent({ ...valid, donationId: "" }),
    ).toBeNull();
    expect(
      parseReceiptSnapshotContent({ ...valid, effective: { fundId: "f" } }),
    ).toBeNull();
    expect(
      parseReceiptSnapshotContent({
        ...valid,
        designationLines: [{ fundName: "No amount" }],
      }),
    ).toBeNull();

    const tolerant = parseReceiptSnapshotContent({
      ...valid,
      donorName: undefined,
      currencyCode: undefined,
      affectedFields: "amount",
      designationLines: [{ amountCents: 20_000 }],
    });
    expect(tolerant).toMatchObject({
      donorName: "Unknown donor",
      currencyCode: "USD",
      affectedFields: [],
      designationLines: [
        {
          id: "line-1",
          amountCents: 20_000,
          fundName: "General Fund",
          missionaryName: null,
          memo: null,
        },
      ],
    });
  });

  it("rejects negative or fractional cents in stored receipt snapshots", () => {
    const valid = JSON.parse(
      JSON.stringify(
        buildReceiptSnapshotContent({
          detail: snapshotSourceDetail(),
          affectedFields: ["amount"],
          adjustmentId: null,
          now: new Date("2026-06-01T12:00:00.000Z"),
        }),
      ),
    ) as ReceiptSnapshotContentV1;

    expect(
      parseReceiptSnapshotContent({
        ...valid,
        effective: { ...valid.effective, amountCents: -1 },
      }),
    ).toBeNull();
    expect(
      parseReceiptSnapshotContent({
        ...valid,
        effective: { ...valid.effective, amountCents: 99.9 },
      }),
    ).toBeNull();
    expect(
      parseReceiptSnapshotContent({
        ...valid,
        designationLines: [{ ...valid.designationLines[0], amountCents: -500 }],
      }),
    ).toBeNull();
    expect(
      parseReceiptSnapshotContent({
        ...valid,
        designationLines: [
          { ...valid.designationLines[0], amountCents: 12_000.5 },
        ],
      }),
    ).toBeNull();
  });
});

describe("canDecideCorrectionRequest", () => {
  const APPROVE = "contributions.approve_corrections";

  it("stays in parity with assertCanDecideCorrectionRequest", () => {
    const separationPolicy = resolveCorrectionApprovalPolicy(null);
    const oneApproverPolicy = resolveCorrectionApprovalPolicy({
      ownership_mode: "one_approver",
    });

    const cases = [
      {
        policy: separationPolicy,
        request: { requestedByProfileId: "profile-1" },
        deciderProfileId: "profile-2",
        deciderCapabilities: [APPROVE],
      },
      {
        policy: separationPolicy,
        request: { requestedByProfileId: "profile-1" },
        deciderProfileId: "profile-1",
        deciderCapabilities: [APPROVE],
      },
      {
        policy: separationPolicy,
        request: { requestedByProfileId: "profile-1" },
        deciderProfileId: "profile-2",
        deciderCapabilities: [],
      },
      {
        policy: separationPolicy,
        request: { requestedByProfileId: null },
        deciderProfileId: "profile-1",
        deciderCapabilities: [APPROVE],
      },
      {
        policy: separationPolicy,
        request: { requestedByProfileId: "profile-1" },
        deciderProfileId: null,
        deciderCapabilities: [APPROVE],
      },
      {
        policy: oneApproverPolicy,
        request: { requestedByProfileId: "profile-1" },
        deciderProfileId: "profile-1",
        deciderCapabilities: [APPROVE],
      },
    ];

    for (const input of cases) {
      let assertionAllows = true;
      try {
        assertCanDecideCorrectionRequest(input);
      } catch {
        assertionAllows = false;
      }

      expect(canDecideCorrectionRequest(input)).toBe(assertionAllows);
    }
  });

  it("blocks self-approval only under separation of duties", () => {
    const selfDecision = {
      request: { requestedByProfileId: "profile-1" },
      deciderProfileId: "profile-1",
      deciderCapabilities: [APPROVE],
    };

    expect(
      canDecideCorrectionRequest({
        ...selfDecision,
        policy: resolveCorrectionApprovalPolicy(null),
      }),
    ).toBe(false);
    expect(
      canDecideCorrectionRequest({
        ...selfDecision,
        policy: resolveCorrectionApprovalPolicy({
          ownership_mode: "one_approver",
        }),
      }),
    ).toBe(true);
  });
});
