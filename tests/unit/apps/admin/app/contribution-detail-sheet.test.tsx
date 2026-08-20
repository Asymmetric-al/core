import { cleanup, fireEvent, render } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  flushContributionTestDomEffects,
  installContributionTestDom,
  restoreContributionTestDom,
  type ContributionTestDom,
} from "./contribution-test-dom";

type ContributionDetailSheetComponent =
  typeof import("../../../../../apps/admin/app/(app)/contributions/contribution-detail-sheet").ContributionDetailSheet;
type ContributionsDataModule =
  typeof import("../../../../../apps/admin/app/(app)/contributions/data");

let ContributionDetailSheet: ContributionDetailSheetComponent;
let boneyardContributionsFixture: ContributionsDataModule["boneyardContributionsFixture"];
let testDom: ContributionTestDom | undefined;

beforeAll(async () => {
  testDom = installContributionTestDom();
  const [detailSheetModule, dataModule] = await Promise.all([
    import("../../../../../apps/admin/app/(app)/contributions/contribution-detail-sheet"),
    import("../../../../../apps/admin/app/(app)/contributions/data"),
  ]);
  ContributionDetailSheet = detailSheetModule.ContributionDetailSheet;
  boneyardContributionsFixture = dataModule.boneyardContributionsFixture;
});

afterEach(async () => {
  cleanup();
  await flushContributionTestDomEffects();
});

afterAll(() => {
  restoreContributionTestDom(testDom);
  testDom = undefined;
});

describe("ContributionDetailSheet a11y", () => {
  it("exposes an accessible name on the close button and calls onClose", () => {
    const onClose = vi.fn();
    const contribution = boneyardContributionsFixture[0]!;

    const view = render(
      <ContributionDetailSheet contribution={contribution} onClose={onClose} />,
    );

    const closeButton = view.getByRole("button", {
      name: /close contribution details/i,
    });
    expect(closeButton).toBeTruthy();

    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("ContributionDetailSheet loading and error states", () => {
  it("keeps the sheet open while contribution details are loading", () => {
    const view = render(
      <ContributionDetailSheet
        contribution={null}
        isOpen
        isLoading
        onClose={vi.fn()}
      />,
    );

    expect(view.getByRole("status").textContent).toMatch(
      /loading contribution details/i,
    );
    expect(
      view.getByRole("button", { name: /close contribution details/i }),
    ).toBeTruthy();
  });

  it("renders inline fetch failures with retry instead of unmounting", () => {
    const onRetry = vi.fn();

    const view = render(
      <ContributionDetailSheet
        contribution={null}
        isOpen
        errorMessage="Could not load contribution detail."
        onClose={vi.fn()}
        onRetry={onRetry}
      />,
    );

    expect(view.getByText("Could not load contribution detail.")).toBeTruthy();

    fireEvent.click(view.getByRole("button", { name: /retry/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("ContributionDetailSheet read-only gifts without staged gifts", () => {
  const noStagedGiftAvailability = [
    {
      actionType: "approve_staged_gift" as const,
      available: false,
      blockedReason:
        "This gift has no staged gift workflow record, so finance workflow actions are unavailable.",
      nextStep:
        "The donation is valid and shown read-only. Import or create a staged gift to run finance workflow actions for it.",
      riskLevel: "low" as const,
    },
    {
      actionType: "retry_staged_gift" as const,
      available: false,
      blockedReason:
        "This gift has no staged gift workflow record, so finance workflow actions are unavailable.",
      nextStep:
        "The donation is valid and shown read-only. Import or create a staged gift to run finance workflow actions for it.",
      riskLevel: "low" as const,
    },
    {
      actionType: "resend_receipt" as const,
      available: false,
      blockedReason:
        "This gift has no staged gift workflow record, so finance workflow actions are unavailable.",
      nextStep:
        "The donation is valid and shown read-only. Import or create a staged gift to run finance workflow actions for it.",
      riskLevel: "low" as const,
    },
  ];

  it("explains blocked workflow actions without implying the donation is invalid", () => {
    const contribution = {
      ...boneyardContributionsFixture[0]!,
      stagedGiftId: null,
      stagedGiftStatus: null,
      receiptSent: false,
    };

    const view = render(
      <ContributionDetailSheet
        contribution={contribution}
        onClose={vi.fn()}
        actionAvailability={noStagedGiftAvailability}
      />,
    );

    expect(view.getByText(/no staged gift workflow record/i)).toBeTruthy();
    expect(
      view.getByText(/donation is valid and shown read-only/i),
    ).toBeTruthy();

    expect(view.queryByRole("button", { name: /send receipt/i })).toBeNull();
    expect(view.queryByRole("button", { name: /approve/i })).toBeNull();
    expect(view.queryByRole("button", { name: /retry posting/i })).toBeNull();

    // Financial truth, donor context, and designations still render fully:
    // a missing staged gift never degrades the read-only detail (#258).
    expect(view.getAllByText(/\$250\.00/).length).toBeGreaterThan(0);
    expect(view.getAllByText("Sarah Mitchell").length).toBeGreaterThan(0);
    expect(view.getAllByText(/general fund/i).length).toBeGreaterThan(0);
    expect(view.queryByText(/invalid|missing donation|not found/i)).toBeNull();
  });

  it("fails closed on stale posting availability while preserving safe actions", () => {
    const contribution = {
      ...boneyardContributionsFixture[0]!,
      stagedGiftId: "staged-1",
      stagedGiftStatus: "needs_review" as const,
      receiptSent: false,
    };

    const view = render(
      <ContributionDetailSheet
        contribution={contribution}
        onClose={vi.fn()}
        actionAvailability={[
          {
            actionType: "approve_staged_gift",
            available: true,
            blockedReason: null,
            nextStep: null,
            riskLevel: "low",
          },
          {
            actionType: "retry_staged_gift",
            available: false,
            blockedReason: "There is no failed or blocked posting to retry.",
            nextStep:
              "Retry becomes available when staged gift processing or CRM posting fails.",
            riskLevel: "low",
          },
          {
            actionType: "resend_receipt",
            available: true,
            blockedReason: null,
            nextStep: null,
            riskLevel: "low",
          },
        ]}
      />,
    );

    expect(view.queryByRole("button", { name: /approve/i })).toBeNull();
    expect(view.getByRole("button", { name: /send receipt/i })).toBeTruthy();
    expect(view.queryByRole("button", { name: /retry posting/i })).toBeNull();
    expect(
      view.getAllByText(/no longer an active product workflow/i).length,
    ).toBeGreaterThan(0);
    expect(
      view.getAllByText(/historical evidence.*maintained in Asym/i).length,
    ).toBeGreaterThan(0);
  });
});

describe("ContributionDetailSheet refund entry point", () => {
  const availableRefundEntry = {
    actionType: "refund" as const,
    available: true,
    blockedReason: null,
    nextStep: null,
    riskLevel: "high" as const,
  };
  const blockedRefundEntry = {
    actionType: "refund" as const,
    available: false,
    blockedReason:
      "This gift has no payment provider charge to refund against.",
    nextStep:
      "Offline gifts are corrected through adjustments rather than provider refunds.",
    riskLevel: "high" as const,
  };

  it("enables Refund gift and reports the contribution id when refund is available", () => {
    const onRefund = vi.fn();
    const contribution = boneyardContributionsFixture[0]!;

    const view = render(
      <ContributionDetailSheet
        contribution={contribution}
        onClose={vi.fn()}
        actionAvailability={[availableRefundEntry]}
        onRefund={onRefund}
      />,
    );

    const refundButton = view.getByRole("button", { name: /refund gift/i });
    expect(refundButton).toHaveProperty("disabled", false);

    fireEvent.click(refundButton);
    expect(onRefund).toHaveBeenCalledWith(contribution.id);
  });

  it("renders a blocked refund disabled with the server reason inline", () => {
    const onRefund = vi.fn();

    const view = render(
      <ContributionDetailSheet
        contribution={boneyardContributionsFixture[0]!}
        onClose={vi.fn()}
        actionAvailability={[blockedRefundEntry]}
        onRefund={onRefund}
      />,
    );

    const refundButton = view.getByRole("button", { name: /refund gift/i });
    expect(refundButton).toHaveProperty("disabled", true);

    expect(
      view.getByText(/no payment provider charge to refund against/i),
    ).toBeTruthy();
    expect(
      view.getByText(/corrected through adjustments rather than provider/i),
    ).toBeTruthy();

    fireEvent.click(refundButton);
    expect(onRefund).not.toHaveBeenCalled();
  });

  it("renders no refund affordance without an onRefund handler or refund entry", () => {
    const withoutHandler = render(
      <ContributionDetailSheet
        contribution={boneyardContributionsFixture[0]!}
        onClose={vi.fn()}
        actionAvailability={[availableRefundEntry]}
      />,
    );
    expect(
      withoutHandler.queryByRole("button", { name: /refund gift/i }),
    ).toBeNull();
    cleanup();

    const withoutEntry = render(
      <ContributionDetailSheet
        contribution={boneyardContributionsFixture[0]!}
        onClose={vi.fn()}
        actionAvailability={[]}
        onRefund={vi.fn()}
      />,
    );
    expect(
      withoutEntry.queryByRole("button", { name: /refund gift/i }),
    ).toBeNull();
  });
});

describe("ContributionDetailSheet provider proof", () => {
  it("shows role-gated provider proof with dashboard links when provided", () => {
    const view = render(
      <ContributionDetailSheet
        contribution={boneyardContributionsFixture[0]!}
        onClose={vi.fn()}
        providerProof={{
          paymentIntentId: "pi_proof",
          chargeId: "ch_proof",
          refundIds: ["re_1", "re_2"],
          replayContext: null,
          dashboardUrls: {
            paymentIntent: "https://dashboard.stripe.com/payments/pi_proof",
            charge: "https://dashboard.stripe.com/charges/ch_proof",
          },
        }}
      />,
    );

    expect(view.getByText("Provider proof")).toBeTruthy();
    expect(view.getByText("pi_proof")).toBeTruthy();
    expect(view.getByText("ch_proof")).toBeTruthy();
    expect(view.getByText("Refund IDs")).toBeTruthy();
    expect(view.getByText("re_1, re_2")).toBeTruthy();
    expect(
      view.getByRole("link", { name: /open payment in stripe/i }),
    ).toBeTruthy();
  });

  it("renders no provider proof section for unauthorized viewers", () => {
    const view = render(
      <ContributionDetailSheet
        contribution={boneyardContributionsFixture[0]!}
        onClose={vi.fn()}
        providerProof={null}
      />,
    );

    expect(view.queryByText("Provider proof")).toBeNull();
    expect(view.queryByText("pi_proof")).toBeNull();
  });
});

describe("ContributionDetailSheet recurring agreement context", () => {
  const linkedAgreement = {
    id: "pledge-1",
    status: "active",
    frequency: "monthly",
    amountCents: 5_000,
    currencyCode: "USD",
    fundName: "Monthly Support",
    missionaryName: "John Martinez",
    nextExpectedGiftAt: "2026-07-15T12:00:00.000Z",
    stripeSubscriptionId: "sub_agreement",
    linkedGiftCount: 6,
    lastLinkedGiftAt: "2026-06-15T12:00:00.000Z",
  };

  it("renders the linked agreement card with terms, designation, and gift history", () => {
    const view = render(
      <ContributionDetailSheet
        contribution={boneyardContributionsFixture[0]!}
        onClose={vi.fn()}
        recurring={{
          isRecurring: true,
          interval: "month",
          pledgeId: "pledge-1",
          agreement: linkedAgreement,
          providerRecurrenceWithoutAgreement: false,
        }}
      />,
    );

    expect(view.getByText("Recurring giving")).toBeTruthy();
    expect(view.getByText(/\$50\.00 monthly/)).toBeTruthy();
    expect(
      view.getByText(
        /Monthly Support · John Martinez · active · Next expected/,
      ),
    ).toBeTruthy();
    expect(
      view.getByText(/Gifts under this agreement: 6 · Last gift/),
    ).toBeTruthy();
    expect(view.getByText(/sub_agreement/)).toBeTruthy();
    expect(
      view.queryByText(/no internal recurring agreement is linked/i),
    ).toBeNull();
  });

  it("warns about provider-only recurrence without an internal agreement", () => {
    const view = render(
      <ContributionDetailSheet
        contribution={boneyardContributionsFixture[0]!}
        onClose={vi.fn()}
        recurring={{
          isRecurring: true,
          interval: "month",
          pledgeId: null,
          agreement: null,
          providerRecurrenceWithoutAgreement: true,
        }}
      />,
    );

    expect(view.getByText("Recurring giving")).toBeTruthy();
    expect(
      view.getByText(/no internal recurring agreement is linked/i),
    ).toBeTruthy();
    expect(view.queryByText(/Gifts under this agreement/)).toBeNull();
  });

  it("renders no recurring section for one-time gifts without recurrence", () => {
    const view = render(
      <ContributionDetailSheet
        contribution={boneyardContributionsFixture[0]!}
        onClose={vi.fn()}
        recurring={{
          isRecurring: false,
          interval: null,
          pledgeId: null,
          agreement: null,
          providerRecurrenceWithoutAgreement: false,
        }}
      />,
    );

    expect(view.queryByText("Recurring giving")).toBeNull();
    expect(view.queryByText(/Gifts under this agreement/)).toBeNull();
  });

  it("shows agreement context for a one-time gift linked to a recurring agreement", () => {
    const view = render(
      <ContributionDetailSheet
        contribution={boneyardContributionsFixture[0]!}
        onClose={vi.fn()}
        recurring={{
          isRecurring: false,
          interval: null,
          pledgeId: "pledge-1",
          agreement: linkedAgreement,
          providerRecurrenceWithoutAgreement: false,
        }}
      />,
    );

    expect(view.getByText("Recurring giving")).toBeTruthy();
    expect(
      view.getByText(/This gift is linked to a recurring agreement/),
    ).toBeTruthy();
    expect(
      view.getByText(/Gifts under this agreement: 6 · Last gift/),
    ).toBeTruthy();
  });
});

describe("ContributionDetailSheet designation set", () => {
  it("renders every designation line equally with expandable context", () => {
    const contribution = boneyardContributionsFixture[0]!;

    const view = render(
      <ContributionDetailSheet
        contribution={contribution}
        onClose={vi.fn()}
        designations={{
          lines: [
            {
              id: "alloc-1",
              amountCents: 10_000,
              currencyCode: "USD",
              fundId: "fund-1",
              fundName: "Clean Water Initiative",
              fundType: "project",
              missionaryId: null,
              missionaryName: null,
              memo: "water project",
              restriction: null,
              correctionState: "none",
            },
            {
              id: "alloc-2",
              amountCents: 15_000,
              currencyCode: "USD",
              fundId: "fund-2",
              fundName: "Martinez Family Support",
              fundType: "missionary",
              missionaryId: "missionary-1",
              missionaryName: "John Martinez",
              memo: null,
              restriction: null,
              correctionState: "none",
            },
          ],
          totalAmountCents: 25_000,
          reconcilesToGiftAmount: true,
          issues: [],
        }}
      />,
    );

    expect(view.getByText("Clean Water Initiative")).toBeTruthy();
    expect(view.getByText("Martinez Family Support")).toBeTruthy();
    expect(view.getByText("$100.00")).toBeTruthy();
    expect(view.getByText("$150.00")).toBeTruthy();
    expect(view.getByText(/water project/i)).toBeTruthy();
    expect(view.getByText("John Martinez")).toBeTruthy();
    expect(view.queryByText(/primary/i)).toBeNull();
  });

  it("warns when designation lines do not reconcile to the gift amount", () => {
    const contribution = boneyardContributionsFixture[0]!;

    const view = render(
      <ContributionDetailSheet
        contribution={contribution}
        onClose={vi.fn()}
        designations={{
          lines: [
            {
              id: "alloc-1",
              amountCents: 10_000,
              currencyCode: "USD",
              fundId: "fund-1",
              fundName: "Clean Water Initiative",
              fundType: "project",
              missionaryId: null,
              missionaryName: null,
              memo: null,
              restriction: null,
              correctionState: "none",
            },
          ],
          totalAmountCents: 10_000,
          reconcilesToGiftAmount: false,
          issues: [
            "Designation lines total 10000 and do not reconcile to the effective gift amount 25000.",
          ],
        }}
      />,
    );

    expect(view.getByText(/do not reconcile/i)).toBeTruthy();
  });
});

describe("ContributionDetailSheet CRM post state (ADR-CD-012)", () => {
  const retryAvailableAvailability = [
    {
      actionType: "retry_staged_gift" as const,
      available: true,
      blockedReason: null,
      nextStep: null,
      riskLevel: "low" as const,
    },
  ];

  const contributionWithStagedGift = () => ({
    ...boneyardContributionsFixture[0]!,
    stagedGiftId: "staged-1",
    stagedGiftStatus: "posted" as const,
    crmPostStatus: "failed" as const,
  });

  it("renders parent and child post state with per-line errors", () => {
    const view = render(
      <ContributionDetailSheet
        contribution={contributionWithStagedGift()}
        onClose={vi.fn()}
        crmPostState={{
          parent: {
            status: "posted",
            twentyRecordId: "twenty-parent-1",
            lastError: null,
          },
          designationRecords: [
            {
              allocationId: "alloc-1",
              status: "posted",
              twentyRecordId: "twenty-child-1",
              lastError: null,
            },
            {
              allocationId: "alloc-2",
              status: "failed",
              twentyRecordId: null,
              lastError: "Twenty rejected the designation record.",
            },
          ],
          failedScopes: [{ scope: "designation", allocationId: "alloc-2" }],
          adapterLimitation: null,
        }}
      />,
    );

    expect(view.getByText("Historical CRM posting")).toBeTruthy();
    expect(view.getByText("Parent gift record")).toBeTruthy();
    expect(view.getByText("twenty-parent-1")).toBeTruthy();
    expect(view.getAllByText("Posted").length).toBe(2);
    expect(view.getByText("Failed")).toBeTruthy();
    expect(view.getByText("Designation alloc-2")).toBeTruthy();
    expect(view.getByText(/rejected the designation record/i)).toBeTruthy();
  });

  it("labels child records with the matching designation fund name", () => {
    const view = render(
      <ContributionDetailSheet
        contribution={contributionWithStagedGift()}
        onClose={vi.fn()}
        designations={{
          lines: [
            {
              id: "alloc-2",
              amountCents: 15_000,
              currencyCode: "USD",
              fundId: "fund-2",
              fundName: "Martinez Family Support",
              fundType: "missionary",
              missionaryId: "missionary-1",
              missionaryName: "John Martinez",
              memo: null,
              restriction: null,
              correctionState: "none",
            },
          ],
          totalAmountCents: 15_000,
          reconcilesToGiftAmount: true,
          issues: [],
        }}
        crmPostState={{
          parent: {
            status: "posted",
            twentyRecordId: null,
            lastError: null,
          },
          designationRecords: [
            {
              allocationId: "alloc-2",
              status: "failed",
              twentyRecordId: null,
              lastError: "Twenty rejected the designation record.",
            },
          ],
          failedScopes: [{ scope: "designation", allocationId: "alloc-2" }],
          adapterLimitation: null,
        }}
      />,
    );

    expect(view.getAllByText("Martinez Family Support").length).toBe(2);
    expect(view.queryByText("Designation alloc-2")).toBeNull();
  });

  it("surfaces the adapter limitation as an informational note", () => {
    const view = render(
      <ContributionDetailSheet
        contribution={contributionWithStagedGift()}
        onClose={vi.fn()}
        crmPostState={{
          parent: {
            status: "posted",
            twentyRecordId: "twenty-parent-1",
            lastError: null,
          },
          designationRecords: [],
          failedScopes: [],
          adapterLimitation:
            "The historical CRM posting record represents this gift as a single parent record and has no child record for each designation line.",
        }}
      />,
    );

    expect(view.getByText(/single parent record/i)).toBeTruthy();
    expect(
      view.queryByRole("button", { name: /retry parent record/i }),
    ).toBeNull();
    expect(view.queryByRole("button", { name: /retry this line/i })).toBeNull();
  });

  it("does not offer designation retry while the current route adapter rejects it", () => {
    const onRetryCrmPost = vi.fn();
    const contribution = contributionWithStagedGift();

    const view = render(
      <ContributionDetailSheet
        contribution={contribution}
        onClose={vi.fn()}
        actionAvailability={retryAvailableAvailability}
        onRetryCrmPost={onRetryCrmPost}
        crmPostState={{
          parent: {
            status: "posted",
            twentyRecordId: "twenty-parent-1",
            lastError: null,
          },
          designationRecords: [
            {
              allocationId: "alloc-2",
              status: "failed",
              twentyRecordId: null,
              lastError: "Twenty rejected the designation record.",
            },
          ],
          failedScopes: [{ scope: "designation", allocationId: "alloc-2" }],
          adapterLimitation: null,
        }}
      />,
    );

    expect(
      view.queryByRole("button", { name: /retry parent record/i }),
    ).toBeNull();

    expect(view.queryByRole("button", { name: /retry this line/i })).toBeNull();
    expect(view.queryByRole("button", { name: /^retry posting$/i })).toBeNull();
    expect(onRetryCrmPost).not.toHaveBeenCalled();
    expect(view.getByText(/rejected the designation record/i)).toBeTruthy();
  });

  it("keeps an independently failed staged gift read-only", () => {
    const contribution = {
      ...contributionWithStagedGift(),
      stagedGiftStatus: "failed" as const,
    };

    const view = render(
      <ContributionDetailSheet
        contribution={contribution}
        onClose={vi.fn()}
        actionAvailability={retryAvailableAvailability}
        onRetryStagedGift={vi.fn()}
        crmPostState={{
          parent: {
            status: "posted",
            twentyRecordId: "twenty-parent-1",
            lastError: null,
          },
          designationRecords: [
            {
              allocationId: "alloc-2",
              status: "failed",
              twentyRecordId: null,
              lastError: "Twenty rejected the designation record.",
            },
          ],
          failedScopes: [{ scope: "designation", allocationId: "alloc-2" }],
          adapterLimitation: null,
        }}
      />,
    );

    expect(view.queryByRole("button", { name: /^retry posting$/i })).toBeNull();
    expect(
      view.getAllByText(/no longer an active product workflow/i).length,
    ).toBeGreaterThan(0);
  });

  it("does not invoke a retired scoped parent retry", () => {
    const onRetryCrmPost = vi.fn();
    const contribution = {
      ...contributionWithStagedGift(),
      stagedGiftStatus: "ready_to_post" as const,
    };

    const view = render(
      <ContributionDetailSheet
        contribution={contribution}
        onClose={vi.fn()}
        actionAvailability={retryAvailableAvailability}
        onRetryCrmPost={onRetryCrmPost}
        crmPostState={{
          parent: {
            status: "failed",
            twentyRecordId: null,
            lastError: "Twenty timed out while creating the gift record.",
          },
          designationRecords: [
            {
              allocationId: "alloc-2",
              status: "failed",
              twentyRecordId: null,
              lastError: "Twenty rejected the designation record.",
            },
          ],
          failedScopes: [
            { scope: "parent" },
            { scope: "designation", allocationId: "alloc-2" },
          ],
          adapterLimitation: null,
        }}
      />,
    );

    expect(view.getByText(/timed out while creating/i)).toBeTruthy();
    expect(view.queryByRole("button", { name: /retry this line/i })).toBeNull();
    expect(
      view.getAllByText(/no longer an active product workflow/i).length,
    ).toBeGreaterThan(0);
    expect(
      view.getAllByText(/historical evidence.*maintained in Asym/i).length,
    ).toBeGreaterThan(0);

    expect(
      view.queryByRole("button", { name: /retry parent record/i }),
    ).toBeNull();
    expect(view.queryByRole("button", { name: /^retry posting$/i })).toBeNull();
    expect(onRetryCrmPost).not.toHaveBeenCalled();
  });

  it("hides posted parent retry even when availability is stale", () => {
    const onRetryCrmPost = vi.fn();

    const view = render(
      <ContributionDetailSheet
        contribution={contributionWithStagedGift()}
        onClose={vi.fn()}
        actionAvailability={retryAvailableAvailability}
        onRetryCrmPost={onRetryCrmPost}
        onRetryStagedGift={vi.fn()}
        crmPostState={{
          parent: {
            status: "failed",
            twentyRecordId: null,
            lastError: "Twenty timed out while creating the gift record.",
          },
          designationRecords: [],
          failedScopes: [{ scope: "parent" }],
          adapterLimitation: null,
        }}
      />,
    );

    expect(
      view.queryByRole("button", { name: /retry parent record/i }),
    ).toBeNull();
    expect(view.queryByRole("button", { name: /^retry posting$/i })).toBeNull();
    expect(onRetryCrmPost).not.toHaveBeenCalled();
  });

  it("hides scoped retry buttons when the retry action is not available", () => {
    const onRetryCrmPost = vi.fn();

    const view = render(
      <ContributionDetailSheet
        contribution={contributionWithStagedGift()}
        onClose={vi.fn()}
        actionAvailability={[
          {
            actionType: "retry_staged_gift" as const,
            available: false,
            blockedReason: "You do not have permission to retry CRM posting.",
            nextStep: null,
            riskLevel: "low" as const,
          },
        ]}
        onRetryCrmPost={onRetryCrmPost}
        crmPostState={{
          parent: {
            status: "failed",
            twentyRecordId: null,
            lastError: "Twenty timed out while creating the gift record.",
          },
          designationRecords: [
            {
              allocationId: "alloc-2",
              status: "failed",
              twentyRecordId: null,
              lastError: "Twenty rejected the designation record.",
            },
          ],
          failedScopes: [
            { scope: "parent" },
            { scope: "designation", allocationId: "alloc-2" },
          ],
          adapterLimitation: null,
        }}
      />,
    );

    expect(
      view.queryByRole("button", { name: /retry parent record/i }),
    ).toBeNull();
    expect(view.queryByRole("button", { name: /retry this line/i })).toBeNull();
    expect(view.getByText(/timed out while creating/i)).toBeTruthy();
  });

  it("keeps the scalar CRM post-status field when no CRM post state is provided", () => {
    const contribution = {
      ...boneyardContributionsFixture[0]!,
      crmPostStatus: "not_required" as const,
    };

    const view = render(
      <ContributionDetailSheet
        contribution={contribution}
        onClose={vi.fn()}
        crmPostState={null}
      />,
    );

    expect(view.queryByText("Historical CRM posting")).toBeNull();
    expect(view.queryByText("Twenty")).toBeNull();
    expect(view.getByText("CRM post status")).toBeTruthy();
    expect(view.getByText("not required")).toBeTruthy();
  });

  it("renders no CRM section when the post state carries no signal", () => {
    const view = render(
      <ContributionDetailSheet
        contribution={boneyardContributionsFixture[0]!}
        onClose={vi.fn()}
        crmPostState={{
          parent: { status: null, twentyRecordId: null, lastError: null },
          designationRecords: [],
          failedScopes: [],
          adapterLimitation: null,
        }}
      />,
    );

    expect(view.queryByText("Historical CRM posting")).toBeNull();
    expect(view.queryByText("Parent gift record")).toBeNull();
  });
});
