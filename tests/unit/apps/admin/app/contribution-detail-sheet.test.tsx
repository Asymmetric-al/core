import * as localeFormat from "@asym/lib/hooks/use-locale-format";
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react";
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

function detailFieldValue(
  view: ReturnType<typeof render>,
  label: string,
): string {
  const term = view.getAllByText(label).find((node) => node.tagName === "DT");
  if (!term) {
    throw new Error(`No detail field labelled ${label}`);
  }
  return term.nextElementSibling?.textContent ?? "";
}

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

describe("ContributionDetailSheet gift calendar date", () => {
  it.each(["UTC", "America/Los_Angeles", "Asia/Bangkok"])(
    "keeps the gift day when the visitor formats dates in %s",
    (timeZone) => {
      const formatters = localeFormat.createLocaleFormatters(
        { locale: "en-US", timeZone },
        true,
      );
      const formatSpy = vi
        .spyOn(localeFormat, "useLocaleFormat")
        .mockReturnValue(formatters);
      try {
        const contribution = {
          ...boneyardContributionsFixture[0]!,
          date: "2026-07-01",
        };
        const view = render(
          <ContributionDetailSheet
            contribution={contribution}
            onClose={vi.fn()}
          />,
        );

        expect(view.getByText("Wed, Jul 1, 2026")).toBeTruthy();
        expect(view.queryByText("Tue, Jun 30, 2026")).toBeNull();
      } finally {
        formatSpy.mockRestore();
      }
    },
  );
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

describe("ContributionDetailSheet stale detail after a failed refresh", () => {
  it("keeps the last loaded gift and says it could not refresh, with retry", () => {
    const onRetry = vi.fn();
    const contribution = boneyardContributionsFixture[0]!;

    const view = render(
      <ContributionDetailSheet
        contribution={contribution}
        isOpen
        errorMessage="Could not load contribution detail."
        onClose={vi.fn()}
        onRetry={onRetry}
      />,
    );

    const notice = view.getByRole("alert");
    expect(notice.textContent).toMatch(/couldn.t refresh this contribution/i);
    expect(notice.textContent).toMatch(/last loaded details/i);
    fireEvent.click(within(notice).getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows no stale notice when the detail loaded cleanly", () => {
    const view = render(
      <ContributionDetailSheet
        contribution={boneyardContributionsFixture[0]!}
        isOpen
        onClose={vi.fn()}
      />,
    );

    expect(view.queryByText(/couldn.t refresh/i)).toBeNull();
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

describe("ContributionDetailSheet honest presentation", () => {
  it("copies the gift ID when a gift has no transaction ID, and says so", () => {
    const contribution = {
      ...boneyardContributionsFixture[0]!,
      transactionId: null,
    };

    const view = render(
      <ContributionDetailSheet contribution={contribution} onClose={vi.fn()} />,
    );

    expect(
      view.queryByRole("button", { name: "Copy transaction ID" }),
    ).toBeNull();
    expect(view.getByRole("button", { name: "Copy gift ID" })).toBeTruthy();
    // The internal gift id never stands in for a processor reference.
    expect(detailFieldValue(view, "Transaction ID")).toBe("Unavailable");
    expect(view.queryByText(contribution.id)).toBeNull();
  });

  it.each([
    ["failed", "Failed"],
    ["not_sent", "Not sent"],
    ["pending", "Queued"],
    ["sent", "Sent"],
  ] as const)(
    "shows a %s receipt as %s, not a sent/pending boolean",
    (receiptStatus, label) => {
      const base = boneyardContributionsFixture[0]!;
      const contribution = {
        ...base,
        receiptSent: receiptStatus === "sent",
        shared: { ...base.shared, receiptStatus },
      };

      const view = render(
        <ContributionDetailSheet
          contribution={contribution}
          onClose={vi.fn()}
        />,
      );

      expect(detailFieldValue(view, "Receipt")).toBe(label);
    },
  );

  it("translates staged-gift review codes into staff wording", () => {
    const contribution = {
      ...boneyardContributionsFixture[0]!,
      stagedGiftReviewReason: "donor_match_missing,allocation_missing",
    };

    const view = render(
      <ContributionDetailSheet contribution={contribution} onClose={vi.fn()} />,
    );

    expect(
      view.getByText("No matching donor record, No fund or missionary chosen"),
    ).toBeTruthy();
    expect(view.queryByText(/donor_match_missing/)).toBeNull();
  });

  it("passes a free-text staff review note through unchanged", () => {
    const contribution = {
      ...boneyardContributionsFixture[0]!,
      stagedGiftReviewReason: "Check the cheque scan",
    };

    const view = render(
      <ContributionDetailSheet contribution={contribution} onClose={vi.fn()} />,
    );

    expect(view.getByText("Check the cheque scan")).toBeTruthy();
  });

  it("names the fund without printing its internal fund id", () => {
    const fundUuid = "a5cbf3d4-5798-4ed6-999f-103e02890c84";
    const contribution = {
      ...boneyardContributionsFixture[0]!,
      fundCode: fundUuid,
      fundName: "General Fund",
    };

    const view = render(
      <ContributionDetailSheet contribution={contribution} onClose={vi.fn()} />,
    );

    expect(view.getByText("General Fund")).toBeTruthy();
    expect(view.queryByText(fundUuid)).toBeNull();
  });

  it("shows how much of a partially refunded gift went back to the donor", () => {
    const base = boneyardContributionsFixture[0]!;
    const contribution = {
      ...base,
      shared: { ...base.shared, refundedAmountCents: 5000 },
    };

    const view = render(
      <ContributionDetailSheet contribution={contribution} onClose={vi.fn()} />,
    );

    expect(view.getByText("Refunded $50.00")).toBeTruthy();
    view.rerender(
      <ContributionDetailSheet contribution={base} onClose={vi.fn()} />,
    );
    expect(view.queryByText(/^Refunded \$/)).toBeNull();
  });

  it("states a reason shared by both retired CRM posting actions once", () => {
    const contribution = {
      ...boneyardContributionsFixture[0]!,
      stagedGiftId: "staged-1",
      stagedGiftStatus: "failed" as const,
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
            available: true,
            blockedReason: null,
            nextStep: null,
            riskLevel: "low",
          },
        ]}
      />,
    );

    expect(
      view.getAllByText(/no longer an active product workflow/i),
    ).toHaveLength(1);
    expect(
      view.getByText("CRM approval/posting · CRM posting retry"),
    ).toBeTruthy();
  });

  it("folds the retired CRM posting reasons into a one-line disclosure after the working actions", () => {
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
            available: true,
            blockedReason: null,
            nextStep: null,
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

    const actions = view.getByRole("region", { name: "Actions" });
    expect(
      within(actions).getByRole("button", { name: /send receipt/i }),
    ).toBeTruthy();
    // One short, collapsed line instead of a block of retired-workflow copy.
    // The shared Collapsible: a real button that reports its state, with
    // the panel kept in the page (hidden until found) for find-in-page.
    const trigger = within(actions).getByRole("button", {
      name: "CRM posting is retired; posting state is shown for history only.",
    });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    const disclosure = trigger.closest('[data-slot="collapsible"]');
    expect(disclosure).toBeTruthy();
    expect(disclosure!.querySelector("details")).toBeNull();
    // The full reason, next step and affected actions stay one click away.
    const reason = within(actions).getByText(
      /no longer an active product workflow/i,
    );
    expect(disclosure!.contains(reason)).toBe(true);
    expect(
      disclosure!.contains(
        within(actions).getByText("CRM approval/posting · CRM posting retry"),
      ),
    ).toBe(true);
    expect(
      disclosure!.contains(
        within(actions).getByText(/historical evidence.*maintained in Asym/i),
      ),
    ).toBe(true);
  });

  it("explains retired CRM posting inside Historical CRM posting when that history exists", () => {
    const contribution = {
      ...boneyardContributionsFixture[0]!,
      stagedGiftId: "staged-1",
      stagedGiftStatus: "failed" as const,
      crmPostStatus: "failed" as const,
    };

    const view = render(
      <ContributionDetailSheet
        contribution={contribution}
        onClose={vi.fn()}
        actionAvailability={[
          {
            actionType: "retry_staged_gift",
            available: true,
            blockedReason: null,
            nextStep: null,
            riskLevel: "low",
          },
        ]}
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

    const actions = view.getByRole("region", { name: "Actions" });
    const history = view.getByRole("region", {
      name: "Historical CRM posting",
    });
    expect(
      within(actions).queryByText(/no longer an active product workflow/i),
    ).toBeNull();
    expect(
      within(history).getByText(
        "CRM posting is retired; posting state is shown for history only.",
      ),
    ).toBeTruthy();
    expect(
      within(history).getAllByText(/no longer an active product workflow/i),
    ).toHaveLength(1);
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
    // A blocked action that renders keeps its reason inline beside it.
    const actions = view.getByRole("region", { name: "Actions" });
    const refundReason = within(actions).getByText(
      /no payment provider charge to refund against/i,
    );
    expect(refundReason.closest('[data-slot="collapsible"]')).toBeNull();

    fireEvent.click(refundButton);
    expect(onRefund).not.toHaveBeenCalled();
  });

  it("does not make blocked refund focusable while another action is pending", () => {
    const view = render(
      <ContributionDetailSheet
        contribution={boneyardContributionsFixture[0]!}
        onClose={vi.fn()}
        actionAvailability={[blockedRefundEntry]}
        onRefund={vi.fn()}
        isActionPending
      />,
    );

    const refundButton = view.getByRole("button", { name: /refund gift/i });
    expect(refundButton).toHaveProperty("disabled", true);
    expect(refundButton.getAttribute("tabindex")).not.toBe("0");
  });

  it("does not make a missing-staged-gift receipt action focusable while another action is pending", () => {
    const contribution = {
      ...boneyardContributionsFixture[0]!,
      stagedGiftId: null,
      receiptSent: false,
    };

    const view = render(
      <ContributionDetailSheet
        contribution={contribution}
        onClose={vi.fn()}
        onSendReceipt={vi.fn()}
        isActionPending
      />,
    );

    const receiptButton = view.getByRole("button", { name: /send receipt/i });
    expect(receiptButton).toHaveProperty("disabled", true);
    expect(receiptButton.getAttribute("tabindex")).not.toBe("0");
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

describe("ContributionDetailSheet pending action focus", () => {
  const receiptEntry = {
    actionType: "resend_receipt" as const,
    available: true,
    blockedReason: null,
    nextStep: null,
    riskLevel: "low" as const,
  };
  const refundEntry = {
    actionType: "refund" as const,
    available: true,
    blockedReason: null,
    nextStep: null,
    riskLevel: "high" as const,
  };

  it("keeps only the receipt initiator focusable and blocks repeat or peer activation", () => {
    const contribution = {
      ...boneyardContributionsFixture[0]!,
      stagedGiftId: "staged-receipt",
      receiptSent: false,
    };
    const onSendReceipt = vi.fn();
    const onRefund = vi.fn();
    const props = {
      contribution,
      onClose: vi.fn(),
      actionAvailability: [receiptEntry, refundEntry],
      onSendReceipt,
      onRefund,
    };
    const view = render(<ContributionDetailSheet {...props} />);
    const receipt = view.getByRole("button", { name: "Send receipt" });
    const refund = view.getByRole("button", { name: "Refund gift" });
    receipt.focus();
    fireEvent.click(receipt);
    expect(onSendReceipt).toHaveBeenCalledExactlyOnceWith(
      "staged-receipt",
      contribution.id,
    );

    view.rerender(
      <ContributionDetailSheet
        {...props}
        isActionPending
        pendingAction={{
          actionType: "resend_receipt",
          contributionId: contribution.id,
          stagedGiftId: "staged-receipt",
        }}
      />,
    );

    expect(document.activeElement).toBe(receipt);
    expect(receipt).toHaveProperty("disabled", false);
    expect(receipt.getAttribute("aria-disabled")).toBe("true");
    expect(refund).toHaveProperty("disabled", true);
    fireEvent.click(receipt);
    fireEvent.click(refund);
    expect(onSendReceipt).toHaveBeenCalledTimes(1);
    expect(onRefund).not.toHaveBeenCalled();

    view.rerender(<ContributionDetailSheet {...props} />);
    expect(receipt.getAttribute("aria-disabled")).not.toBe("true");
    expect(refund).toHaveProperty("disabled", false);
    fireEvent.click(receipt);
    expect(onSendReceipt).toHaveBeenCalledTimes(2);
  });

  it("names a repeat send Resend receipt and confirms before resending", async () => {
    const contribution = {
      ...boneyardContributionsFixture[0]!,
      stagedGiftId: "staged-sent",
      receiptSent: true,
    };
    const onSendReceipt = vi.fn();
    const view = render(
      <ContributionDetailSheet
        contribution={contribution}
        onClose={vi.fn()}
        actionAvailability={[receiptEntry]}
        onSendReceipt={onSendReceipt}
      />,
    );

    expect(view.queryByRole("button", { name: "Send receipt" })).toBeNull();
    fireEvent.click(view.getByRole("button", { name: "Resend receipt" }));
    expect(onSendReceipt).not.toHaveBeenCalled();

    const dialog = await view.findByRole("alertdialog");
    expect(within(dialog).getByText("Resend receipt?")).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(onSendReceipt).not.toHaveBeenCalled();
    await waitFor(() => expect(view.queryByRole("alertdialog")).toBeNull());

    fireEvent.click(view.getByRole("button", { name: "Resend receipt" }));
    const reopened = await view.findByRole("alertdialog");
    fireEvent.click(
      within(reopened).getByRole("button", { name: "Resend receipt" }),
    );
    expect(onSendReceipt).toHaveBeenCalledExactlyOnceWith(
      "staged-sent",
      contribution.id,
    );
  });

  it("keeps readiness-blocked receipt and refund controls natively disabled during another action", () => {
    const onSendReceipt = vi.fn();
    const onRefund = vi.fn();
    const contribution = {
      ...boneyardContributionsFixture[0]!,
      stagedGiftId: null,
      receiptSent: false,
    };
    const view = render(
      <ContributionDetailSheet
        contribution={contribution}
        onClose={vi.fn()}
        onSendReceipt={onSendReceipt}
        onRefund={onRefund}
        isActionPending
      />,
    );
    const receipt = view.getByRole("button", { name: "Send receipt" });
    expect(receipt).toHaveProperty("disabled", true);
    fireEvent.click(receipt);
    expect(onSendReceipt).not.toHaveBeenCalled();

    view.rerender(
      <ContributionDetailSheet
        contribution={contribution}
        onClose={vi.fn()}
        onRefund={onRefund}
        actionAvailability={[{ ...refundEntry, available: false }]}
        isActionPending
      />,
    );
    const refund = view.getByRole("button", { name: "Refund gift" });
    expect(refund).toHaveProperty("disabled", true);
    fireEvent.click(refund);
    expect(onRefund).not.toHaveBeenCalled();
  });

  it("does not retain another gift's pending receipt as a focusable action", () => {
    const contribution = {
      ...boneyardContributionsFixture[0]!,
      stagedGiftId: "staged-current",
      receiptSent: false,
    };
    const view = render(
      <ContributionDetailSheet
        contribution={contribution}
        onClose={vi.fn()}
        onSendReceipt={vi.fn()}
        actionAvailability={[receiptEntry]}
        isActionPending
        pendingAction={{
          actionType: "resend_receipt",
          contributionId: "previous-contribution",
          stagedGiftId: "staged-current",
        }}
      />,
    );

    expect(view.getByRole("button", { name: "Send receipt" })).toHaveProperty(
      "disabled",
      true,
    );
  });
  it("does not retain a stale staged-gift action on the current contribution", () => {
    const contribution = {
      ...boneyardContributionsFixture[0]!,
      stagedGiftId: "staged-current",
      receiptSent: false,
    };
    const onSendReceipt = vi.fn();
    const view = render(
      <ContributionDetailSheet
        contribution={contribution}
        onClose={vi.fn()}
        onSendReceipt={onSendReceipt}
        actionAvailability={[receiptEntry]}
        isActionPending
        pendingAction={{
          actionType: "resend_receipt",
          contributionId: contribution.id,
          stagedGiftId: "staged-previous",
        }}
      />,
    );

    const receipt = view.getByRole("button", { name: "Send receipt" });
    expect(receipt).toHaveProperty("disabled", true);
    fireEvent.click(receipt);
    expect(onSendReceipt).not.toHaveBeenCalled();
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

    const proofTrigger = view.getByRole("button", { name: "Provider proof" });
    expect(proofTrigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(proofTrigger);
    expect(proofTrigger.getAttribute("aria-expanded")).toBe("true");
    expect(view.getByText("pi_proof")).toBeTruthy();
    expect(view.getByText("ch_proof")).toBeTruthy();
    expect(view.getByText("Refund IDs")).toBeTruthy();
    expect(view.getByText("re_1, re_2")).toBeTruthy();
    // Both dashboard links open a new tab and say so to screen readers.
    expect(
      view.getByRole("link", {
        name: /^open payment in stripe\s*\(opens in a new tab\)$/i,
      }),
    ).toBeTruthy();
    expect(
      view.getByRole("link", {
        name: /^open charge in stripe\s*\(opens in a new tab\)$/i,
      }),
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
        /Monthly Support · John Martinez · Active · Next expected/,
      ),
    ).toBeTruthy();
    expect(
      view.getByText(/Gifts under this agreement: 6 · Last gift/),
    ).toBeTruthy();
    expect(
      view.getByText("Subscription reference: sub_agreement"),
    ).toBeTruthy();
    expect(view.queryByText(/Stripe evidence/)).toBeNull();
    expect(
      view.queryByText(/no internal recurring agreement is linked/i),
    ).toBeNull();
  });

  function renderAgreement(overrides: {
    fundName?: string | null;
    missionaryName?: string | null;
    status?: string | null;
    frequency?: string | null;
    nextExpectedGiftAt?: string | null;
  }) {
    return render(
      <ContributionDetailSheet
        contribution={boneyardContributionsFixture[0]!}
        onClose={vi.fn()}
        recurring={{
          isRecurring: true,
          interval: "month",
          pledgeId: "pledge-1",
          agreement: {
            ...linkedAgreement,
            nextExpectedGiftAt: null,
            ...overrides,
          },
          providerRecurrenceWithoutAgreement: false,
        }}
      />,
    );
  }

  it("never invents a fund for an agreement without one", () => {
    const view = renderAgreement({ fundName: null });

    // The whole line is exactly these values: no invented "General Fund".
    expect(view.getByText("John Martinez · Active")).toBeTruthy();
  });

  it("says the status is unknown instead of inventing active", () => {
    const view = renderAgreement({ status: null });

    expect(
      view.getByText("Monthly Support · John Martinez · Status unknown"),
    ).toBeTruthy();
    expect(view.queryByText(/active/i)).toBeNull();
  });

  it.each([
    ["past_due", "Past due"],
    ["cancelled", "Canceled"],
    ["canceled", "Canceled"],
    ["on_hold", "On hold"],
  ])("labels a stored %s status as %s", (status, label) => {
    const view = renderAgreement({ status });

    expect(
      view.getByText(`Monthly Support · John Martinez · ${label}`),
    ).toBeTruthy();
  });

  it("says when the agreement has no recorded frequency", () => {
    const view = renderAgreement({ frequency: null });

    expect(view.getByText("$50.00 · frequency not recorded")).toBeTruthy();
    expect(view.queryByText(/\$50\.00 recurring/)).toBeNull();
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

  it("offers a disclosure only on designation lines that have context to show", () => {
    const contribution = boneyardContributionsFixture[0]!;
    const line = {
      currencyCode: "USD",
      missionaryId: null,
      missionaryName: null,
      memo: null,
      restriction: null,
      correctionState: "none" as const,
    };

    const view = render(
      <ContributionDetailSheet
        contribution={contribution}
        onClose={vi.fn()}
        designations={{
          lines: [
            {
              ...line,
              id: "alloc-1",
              amountCents: 10_000,
              fundId: "fund-1",
              fundName: "Disaster Relief Fund",
              fundType: "general",
              memo: "for the flood response",
            },
            {
              ...line,
              id: "alloc-2",
              amountCents: 15_000,
              fundId: "fund-2",
              fundName: "Clean Water Initiative",
              fundType: "project",
            },
          ],
          totalAmountCents: 25_000,
          reconcilesToGiftAmount: true,
          issues: [],
        }}
      />,
    );

    const withContext = view.getByText("Disaster Relief Fund");
    const lineTrigger = withContext.closest("button");
    expect(lineTrigger).not.toBeNull();
    expect(lineTrigger!.getAttribute("aria-expanded")).toBe("false");
    // A line with nothing to expand is a plain row: no toggle for keyboard
    // or screen-reader users to press to no effect.
    const withoutContext = view.getByText("Clean Water Initiative");
    expect(withoutContext.closest("button")).toBeNull();
    expect(withoutContext.closest('[data-slot="collapsible"]')).toBeNull();

    // Both rows share one geometry: fund name, amount and chevron (or its
    // spacer) sit on the first line, never centred against the fund type.
    const plainRow = withoutContext.closest("li")!.firstElementChild!;
    for (const row of [lineTrigger!, plainRow]) {
      const classes = row.className.split(" ");
      expect(classes).toContain("items-start");
      expect(classes).not.toContain("items-center");
    }
    const chevron = lineTrigger!.querySelector(":scope > svg");
    expect(chevron).not.toBeNull();
    expect(lineTrigger!.className.split(" ")).toContain("[&>svg]:mt-0.5");
    // Only some lines open, so the list says what the arrow is for.
    expect(
      view.getByText(
        "Lines with an arrow open who they support and any donor memo or restriction.",
      ),
    ).toBeTruthy();
  });

  it("needs no arrow note when every designation line is plain", () => {
    const view = render(
      <ContributionDetailSheet
        contribution={boneyardContributionsFixture[0]!}
        onClose={vi.fn()}
        designations={{
          lines: [
            {
              id: "alloc-1",
              amountCents: 10_000,
              currencyCode: "USD",
              fundId: "fund-1",
              fundName: "Disaster Relief Fund",
              fundType: "general",
              missionaryId: null,
              missionaryName: null,
              memo: null,
              restriction: null,
              correctionState: "none",
            },
          ],
          totalAmountCents: 10_000,
          reconcilesToGiftAmount: true,
          issues: [],
        }}
      />,
    );
    expect(view.queryByText(/Lines with an arrow/)).toBeNull();
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

  it("renders parent and child post state with per-line errors", async () => {
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
    // Scope to the CRM section: the gift's own staged review status also
    // reads "Posted" in the details grid.
    const crmSection = within(
      view.getByRole("region", { name: "Historical CRM posting" }),
    );
    const rows = crmSection.getAllByRole("listitem");
    expect(rows[0]?.textContent).toMatch(/Parent gift record/);
    expect(crmSection.getAllByText("Posted").length).toBe(2);
    expect(crmSection.getByText("Failed")).toBeTruthy();
    expect(view.getByText("Designation alloc-2")).toBeTruthy();
    expect(view.getByText(/rejected the designation record/i)).toBeTruthy();

    // Retired record IDs are audit detail: folded away, not on each row.
    expect(rows.some((row) => row.textContent?.includes("twenty-"))).toBe(
      false,
    );
    const trigger = crmSection.getByRole("button", {
      name: "Historical record IDs",
    });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(crmSection.getByText("twenty-parent-1")).toBeTruthy();
    expect(crmSection.getByText("twenty-child-1")).toBeTruthy();
    expect(
      await crmSection.findByRole("button", {
        name: "Copy parent gift record ID",
      }),
    ).toBeTruthy();
    expect(
      crmSection.getByRole("button", {
        name: "Copy Designation alloc-1 record ID",
      }),
    ).toBeTruthy();
  });

  it("copies a historical record ID and says when the copy fails", async () => {
    const { toast } = await import("sonner");
    const success = vi.spyOn(toast, "success").mockImplementation(() => "");
    const failure = vi.spyOn(toast, "error").mockImplementation(() => "");
    const clipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    const writeText = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    try {
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
            adapterLimitation: null,
          }}
        />,
      );
      fireEvent.click(
        view.getByRole("button", { name: "Historical record IDs" }),
      );
      const copy = await view.findByRole("button", {
        name: "Copy parent gift record ID",
      });
      fireEvent.click(copy);
      await waitFor(() =>
        expect(success).toHaveBeenCalledWith("Record ID copied"),
      );
      expect(writeText).toHaveBeenCalledWith("twenty-parent-1");
      fireEvent.click(copy);
      await waitFor(() =>
        expect(failure).toHaveBeenCalledWith("Could not copy to clipboard"),
      );
    } finally {
      success.mockRestore();
      failure.mockRestore();
      if (clipboard) Object.defineProperty(navigator, "clipboard", clipboard);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  });

  it("offers no record ID disclosure when the history has no IDs", () => {
    const view = render(
      <ContributionDetailSheet
        contribution={contributionWithStagedGift()}
        onClose={vi.fn()}
        crmPostState={{
          parent: { status: "failed", twentyRecordId: null, lastError: "x" },
          designationRecords: [],
          failedScopes: [],
          adapterLimitation: null,
        }}
      />,
    );
    expect(
      view.queryByRole("button", { name: "Historical record IDs" }),
    ).toBeNull();
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

    const limitation = view.getByText(/single parent record/i);
    // History, not an alarm: no live alert region, and the limitation sits
    // in the one "CRM posting is retired" note instead of a second callout.
    const history = view.getByRole("region", {
      name: "Historical CRM posting",
    });
    expect(within(history).queryAllByRole("alert")).toHaveLength(0);
    const note = limitation.closest("[data-slot='crm-history-note']");
    expect(note).not.toBeNull();
    expect(note!.textContent).toContain(
      "CRM posting is retired; posting state is shown for history only.",
    );
    expect(
      history.querySelectorAll("[data-slot='crm-history-note']"),
    ).toHaveLength(1);
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
    expect(view.getByText("Not required")).toBeTruthy();
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
