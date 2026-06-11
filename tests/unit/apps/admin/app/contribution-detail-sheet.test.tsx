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
