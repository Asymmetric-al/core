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
  typeof import("../../../../../apps/admin/app/contributions/contribution-detail-sheet").ContributionDetailSheet;
type ContributionsDataModule =
  typeof import("../../../../../apps/admin/app/contributions/data");

let ContributionDetailSheet: ContributionDetailSheetComponent;
let boneyardContributionsFixture: ContributionsDataModule["boneyardContributionsFixture"];
let testDom: ContributionTestDom | undefined;

beforeAll(async () => {
  testDom = installContributionTestDom();
  const [detailSheetModule, dataModule] = await Promise.all([
    import("../../../../../apps/admin/app/contributions/contribution-detail-sheet"),
    import("../../../../../apps/admin/app/contributions/data"),
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
  });

  it("renders available actions and blocked reasons from server availability", () => {
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

    expect(view.getByRole("button", { name: /approve/i })).toBeTruthy();
    expect(view.getByRole("button", { name: /send receipt/i })).toBeTruthy();
    expect(view.queryByRole("button", { name: /retry posting/i })).toBeNull();
    expect(
      view.getByText(/no failed or blocked posting to retry/i),
    ).toBeTruthy();
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
          refundIds: ["re_1"],
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
