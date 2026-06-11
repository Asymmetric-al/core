/** @vitest-environment jsdom */

import { getQueryClient, QueryProvider } from "@asym/database/providers";
import { cleanup, fireEvent, render, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  contributionDetailQueryKey,
  invalidateContributionOperationQueries,
} from "../../../apps/admin/app/contributions/contribution-detail-overlay";
import {
  ContributionOperationShell,
  OPERATION_DEFINITIONS,
} from "../../../apps/admin/app/contributions/operation-shell";

/**
 * Acceptance coverage for shared query freshness and inline CRM operation
 * UX (#275). Tests assert externally visible behavior: which surfaces go
 * stale after an operation, and what staff see and can do in the inline
 * operation shell.
 */

vi.mock("@asym/database/hooks", () => ({
  ADMIN_CRM_RECORD_DETAIL_QUERY_KEY: ["admin", "crm", "records", "detail"],
  ADMIN_CRM_RECORDS_QUERY_KEY: ["admin", "crm", "records"],
  MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY: [
    "admin",
    "mission-control",
    "needs-attention",
  ],
}));

vi.mock("sonner", () => ({
  toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

const DONATION_ID = "00000000-0000-4000-8000-0000000000ff";

function makeDetail() {
  return {
    id: DONATION_ID,
    shared: {
      donationId: DONATION_ID,
      amountCents: 25_000,
      currencyCode: "USD",
      giftDate: "2026-05-01",
      donorId: "donor-1",
      donorName: "Alice Johnson",
      designationSummary: {
        fundId: "fund-1",
        fundName: "Clean Water Initiative",
        missionaryId: null,
        missionaryName: null,
        lineCount: 1,
      },
      paymentStatus: "completed",
      receiptStatus: "sent",
      crmPostStatus: "posted",
      refundState: "none",
      refundedAmountCents: 0,
      correctionState: "none",
      recurringLinkState: "none",
    },
    revision: "2026-05-01T00:00:00.000Z#0",
    stagedGift: {
      id: "staged-1",
      status: "posted",
      receiptStatus: "sent",
      crmPostStatus: "posted",
      reviewReason: null,
      twentyRecordId: null,
    },
    actionAvailability: [
      {
        actionType: "amount_correction",
        available: true,
        blockedReason: null,
        nextStep: null,
        riskLevel: "high",
      },
    ],
  };
}

let fetchDescriptor: PropertyDescriptor | undefined;

describe("acceptance: shared query freshness (ADR-CD-022)", () => {
  it("marks both surfaces stale after a contribution operation", async () => {
    const queryClient = getQueryClient();
    const seededKeys = [
      ["admin", "contributions"],
      [...contributionDetailQueryKey("00000000-0000-4000-8000-0000000000fe")],
      ["admin", "crm", "records", "detail", "record-1"],
      ["admin", "crm", "records", "grid"],
      ["admin", "mission-control", "needs-attention"],
    ];
    for (const queryKey of seededKeys) {
      queryClient.setQueryData(queryKey, { seeded: true });
    }

    // A correction submitted on either surface runs this shared freshness
    // step; afterwards the Hub, the CRM gift history, the open detail, and
    // needs-attention all refetch from database truth.
    await invalidateContributionOperationQueries(queryClient);

    for (const queryKey of seededKeys) {
      const state = queryClient.getQueryState(queryKey);
      expect(state?.isInvalidated).toBe(true);
    }
  });
});

describe("acceptance: inline operation UX (ADR-CD-033)", () => {
  beforeEach(() => {
    fetchDescriptor = Object.getOwnPropertyDescriptor(globalThis, "fetch");
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    if (fetchDescriptor) {
      Object.defineProperty(globalThis, "fetch", fetchDescriptor);
    } else {
      Reflect.deleteProperty(globalThis, "fetch");
    }
  });

  it("shows risky-operation context, requires intent, and keeps the user in place", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(async (url: string) => {
        if (String(url).includes("/actions")) {
          return {
            ok: true,
            json: async () => ({
              result: {
                auditEventId: "audit-ux-1",
                adjustmentId: "adj-1",
                approvalStatus: "applied",
                taskIds: [],
                canonicalContribution: {},
              },
            }),
          };
        }
        return { ok: true, json: async () => ({ contribution: makeDetail() }) };
      });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });
    const onClose = vi.fn();

    const view = render(
      <QueryProvider>
        <ContributionOperationShell
          open
          onClose={onClose}
          operation={OPERATION_DEFINITIONS.amount_correction!}
          donationId={DONATION_ID}
          sourceSurface="donor_crm_record"
        />
      </QueryProvider>,
    );

    // The shell is an accessible dialog named after the operation.
    const shell = await view.findByTestId("contribution-operation-shell");
    expect(
      view.getByRole("dialog", { name: "Correct gift amount" }),
    ).toBeTruthy();

    // Risky operations show the current effective values and downstream
    // effects before anything is submitted (ADR-CD-017).
    expect(await within(shell).findByText("$250.00")).toBeTruthy();
    expect(within(shell).getByText("Clean Water Initiative")).toBeTruthy();
    expect(
      within(shell).getByText(/receipts and reports/i),
    ).toBeTruthy();
    expect(
      within(shell).getByText(/receipt-affected/i),
    ).toBeTruthy();

    // Intent is explicit: amount, labeled reason, and confirmation are all
    // required before the action can run.
    const submit = within(shell).getByRole("button", {
      name: "Correct gift amount",
    });
    expect(submit).toHaveProperty("disabled", true);
    fireEvent.change(within(shell).getByLabelText("Amount (USD)"), {
      target: { value: "200" },
    });
    fireEvent.change(within(shell).getByLabelText("Reason"), {
      target: { value: "Donor reported the wrong amount" },
    });
    fireEvent.click(within(shell).getByRole("checkbox"));
    expect(submit).toHaveProperty("disabled", false);

    // Touch targets meet the 44px expectation (h-11).
    expect(submit.className).toContain("h-11");

    fireEvent.click(submit);

    // The result stays inside the shell — no navigation, no surface swap —
    // and explains what happened with the audit reference.
    const panel = await view.findByTestId("operation-result-panel");
    expect(panel.textContent).toMatch(/operation completed/i);
    expect(panel.textContent).toMatch(/audit event: audit-ux-1/i);
    expect(onClose).not.toHaveBeenCalled();

    // Closing is an explicit user choice.
    fireEvent.click(within(panel).getByRole("button", { name: "Done" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("explains blocked operations instead of offering a dead submit", async () => {
    const blockedDonationId = "00000000-0000-4000-8000-0000000000fd";
    const blockedDetail = {
      ...makeDetail(),
      id: blockedDonationId,
      actionAvailability: [
        {
          actionType: "refund",
          available: false,
          blockedReason:
            "This gift has no payment provider charge to refund against.",
          nextStep:
            "Offline gifts are corrected through adjustments rather than provider refunds.",
          riskLevel: "high",
        },
      ],
    };
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ contribution: blockedDetail }),
      }),
    });

    const view = render(
      <QueryProvider>
        <ContributionOperationShell
          open
          onClose={vi.fn()}
          operation={OPERATION_DEFINITIONS.refund!}
          donationId={blockedDonationId}
          sourceSurface="donor_crm_record"
        />
      </QueryProvider>,
    );

    expect(
      await view.findByText(/no payment provider charge to refund against/i),
    ).toBeTruthy();
    expect(
      view.getByText(/corrected through adjustments/i),
    ).toBeTruthy();
    expect(view.queryByRole("button", { name: "Refund gift" })).toBeNull();
  });
});
