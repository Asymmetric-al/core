/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContributionDetailSheet } from "../../../../../apps/admin/app/contributions/contribution-detail-sheet";
import { boneyardContributionsFixture } from "../../../../../apps/admin/app/contributions/data";

afterEach(() => {
  cleanup();
});

describe("ContributionDetailSheet a11y", () => {
  it("exposes an accessible name on the close button and calls onClose", () => {
    const onClose = vi.fn();
    const contribution = boneyardContributionsFixture[0]!;

    render(
      <ContributionDetailSheet contribution={contribution} onClose={onClose} />,
    );

    const closeButton = screen.getByRole("button", {
      name: /close contribution details/i,
    });
    expect(closeButton).toBeTruthy();

    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
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

    render(
      <ContributionDetailSheet
        contribution={contribution}
        onClose={vi.fn()}
        actionAvailability={noStagedGiftAvailability}
      />,
    );

    expect(
      screen.getByText(/no staged gift workflow record/i),
    ).toBeTruthy();
    expect(screen.getByText(/donation is valid and shown read-only/i)).toBeTruthy();

    expect(screen.queryByRole("button", { name: /send receipt/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /approve/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /retry posting/i })).toBeNull();
  });

  it("renders available actions and blocked reasons from server availability", () => {
    const contribution = {
      ...boneyardContributionsFixture[0]!,
      stagedGiftId: "staged-1",
      stagedGiftStatus: "needs_review" as const,
      receiptSent: false,
    };

    render(
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

    expect(screen.getByRole("button", { name: /approve/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /send receipt/i })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /retry posting/i })).toBeNull();
    expect(
      screen.getByText(/no failed or blocked posting to retry/i),
    ).toBeTruthy();
  });
});

describe("ContributionDetailSheet provider proof", () => {
  it("shows role-gated provider proof with dashboard links when provided", () => {
    render(
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

    expect(screen.getByText("Provider proof")).toBeTruthy();
    expect(screen.getByText("pi_proof")).toBeTruthy();
    expect(screen.getByText("ch_proof")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /open payment in stripe/i }),
    ).toBeTruthy();
  });

  it("renders no provider proof section for unauthorized viewers", () => {
    render(
      <ContributionDetailSheet
        contribution={boneyardContributionsFixture[0]!}
        onClose={vi.fn()}
        providerProof={null}
      />,
    );

    expect(screen.queryByText("Provider proof")).toBeNull();
    expect(screen.queryByText("pi_proof")).toBeNull();
  });
});

describe("ContributionDetailSheet designation set", () => {
  it("renders every designation line equally with expandable context", () => {
    const contribution = boneyardContributionsFixture[0]!;

    render(
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

    expect(screen.getByText("Clean Water Initiative")).toBeTruthy();
    expect(screen.getByText("Martinez Family Support")).toBeTruthy();
    expect(screen.getByText("$100.00")).toBeTruthy();
    expect(screen.getByText("$150.00")).toBeTruthy();
    expect(screen.getByText(/water project/i)).toBeTruthy();
    expect(screen.getByText("John Martinez")).toBeTruthy();
    expect(screen.queryByText(/primary/i)).toBeNull();
  });

  it("warns when designation lines do not reconcile to the gift amount", () => {
    const contribution = boneyardContributionsFixture[0]!;

    render(
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

    expect(screen.getByText(/do not reconcile/i)).toBeTruthy();
  });
});
