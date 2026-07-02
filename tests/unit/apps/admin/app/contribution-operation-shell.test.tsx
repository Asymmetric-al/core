/** @vitest-environment jsdom */

import { QueryProvider } from "@asym/database/providers";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ContributionOperationShell,
  OPERATION_DEFINITIONS,
} from "../../../../../apps/admin/app/contributions/operation-shell";

vi.mock("@asym/database/hooks", () => ({
  ADMIN_CRM_RECORD_DETAIL_QUERY_KEY: ["admin", "crm", "records", "detail"],
  ADMIN_CRM_RECORDS_QUERY_KEY: ["admin", "crm", "records"],
  MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY: [
    "admin",
    "mission-control",
    "needs-attention",
  ],
}));

/**
 * Compat shim for the AL-265 split: the shell imports
 * `isFailedProviderOutcomeStatus` from the shared operations package, whose
 * export lands with the server-side refund work. Until then, mirror the
 * spec'd failed provider-outcome statuses; once the real export exists this
 * mock passes it straight through.
 */
vi.mock("@asym/api/admin/contribution-operations", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  const fallbackIsFailedProviderOutcomeStatus = (status: string) =>
    status === "failed" ||
    status === "local_update_failed" ||
    status === "canceled" ||
    status === "requires_action";
  return {
    ...actual,
    isFailedProviderOutcomeStatus:
      typeof actual.isFailedProviderOutcomeStatus === "function"
        ? actual.isFailedProviderOutcomeStatus
        : fallbackIsFailedProviderOutcomeStatus,
  };
});

vi.mock("sonner", () => ({
  toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

const DONATION_ID = "00000000-0000-4000-8000-0000000000aa";

function makeDetail(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: DONATION_ID,
    shared: {
      donationId: DONATION_ID,
      amountCents: 25_000,
      currencyCode: "USD",
      giftDate: "2026-05-01",
      donorId: "donor-1",
      donorName: "Shell Donor",
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
    // Original donation truth — refund math must use this basis, never the
    // adjusted effective amount in shared.amountCents (#265).
    original: {
      amountCents: 25_000,
      fundId: "fund-1",
      missionaryId: null,
      paymentStatus: "completed",
    },
    corrections: [],
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
      {
        actionType: "refund",
        available: false,
        blockedReason:
          "This gift has no payment provider charge to refund against.",
        nextStep:
          "Offline gifts are corrected through adjustments rather than provider refunds.",
        riskLevel: "high",
      },
      {
        actionType: "resend_receipt",
        available: true,
        blockedReason: null,
        nextStep: null,
        riskLevel: "low",
      },
    ],
    ...overrides,
  };
}

/**
 * A $250.00 gift with $50.00 already refunded and refund available, so the
 * remaining refundable amount is $200.00. Each test uses a unique donation id
 * because the shared QueryProvider caches detail responses by donation id.
 */
function makeRefundableDetail(
  donationId: string,
  overrides: {
    /** Effective (adjusted) amount shown as "Current amount". */
    effectiveAmountCents?: number;
    corrections?: Array<{ id: string; correctionType: string; status: string }>;
  } = {},
) {
  const detail = makeDetail();
  return {
    ...detail,
    id: donationId,
    shared: {
      ...detail.shared,
      donationId,
      amountCents: overrides.effectiveAmountCents ?? detail.shared.amountCents,
      refundState: "partially_refunded",
      refundedAmountCents: 5_000,
    },
    corrections: overrides.corrections ?? [],
    actionAvailability: [
      {
        actionType: "refund",
        available: true,
        blockedReason: null,
        nextStep: null,
        riskLevel: "high",
      },
    ],
  };
}

function fetchMockForShell(
  actionResult: Record<string, unknown>,
  detail = makeDetail(),
) {
  return vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
    if (typeof url === "string" && url.includes("/actions")) {
      return {
        ok: true,
        json: async () => ({ result: actionResult }),
        init,
      };
    }
    return {
      ok: true,
      json: async () => ({ contribution: detail }),
    };
  });
}

let fetchDescriptor: PropertyDescriptor | undefined;

describe("ContributionOperationShell", () => {
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

  it("shows current values, requires reason and confirmation, and submits the shared contract", async () => {
    const fetchMock = fetchMockForShell({
      auditEventId: "audit-1",
      adjustmentId: "adj-1",
      approvalStatus: "applied",
      taskIds: [],
      canonicalContribution: {},
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });
    const onRowRefresh = vi.fn();

    const view = render(
      <QueryProvider>
        <ContributionOperationShell
          open
          onClose={vi.fn()}
          operation={OPERATION_DEFINITIONS.amount_correction!}
          donationId={DONATION_ID}
          sourceSurface="donor_crm_record"
          onRowRefresh={onRowRefresh}
        />
      </QueryProvider>,
    );

    // Risky operation shows current effective values before submission.
    expect(await view.findByText("$250.00")).toBeTruthy();
    expect(view.getByText("Clean Water Initiative")).toBeTruthy();
    expect(
      view.getByText(/high-risk corrections may require approval/i),
    ).toBeTruthy();

    const submit = view.getByRole("button", { name: "Correct gift amount" });
    expect(submit).toHaveProperty("disabled", true);
    const amountInput = view.getByLabelText("Amount (USD)");
    expect(amountInput.getAttribute("aria-invalid")).toBe("true");
    expect(view.getByText("Enter a valid amount.")).toBeTruthy();

    fireEvent.change(amountInput, {
      target: { value: "200" },
    });
    fireEvent.change(view.getByLabelText("Reason"), {
      target: { value: "Donor reported the wrong amount" },
    });
    fireEvent.click(view.getByRole("checkbox"));

    expect(submit).toHaveProperty("disabled", false);
    expect(amountInput.getAttribute("aria-invalid")).toBe("false");
    fireEvent.click(submit);

    // The result panel stays inside the shell (no navigation away).
    expect(await view.findByTestId("operation-result-panel")).toBeTruthy();
    expect(view.getByText(/operation completed/i)).toBeTruthy();
    expect(view.getByText(/audit event: audit-1/i)).toBeTruthy();
    expect(onRowRefresh).toHaveBeenCalled();

    const actionCall = fetchMock.mock.calls.find(([url]) =>
      String(url).includes("/actions"),
    );
    const body = JSON.parse((actionCall![1] as RequestInit).body as string);
    expect(body).toMatchObject({
      actionType: "amount_correction",
      contributionId: DONATION_ID,
      sourceSurface: "donor_crm_record",
      reason: "Donor reported the wrong amount",
      expectedRevision: "2026-05-01T00:00:00.000Z#0",
      payload: { amount: 20_000 },
    });
    expect(typeof body.idempotencyKey).toBe("string");
    expect(body.idempotencyKey.length).toBeGreaterThan(10);
  });

  it("labels amount fields with the loaded contribution currency", async () => {
    const donationId = "00000000-0000-4000-8000-0000000000bb";
    const detail = makeDetail();
    const fetchMock = fetchMockForShell(
      {
        auditEventId: "audit-1",
        approvalStatus: "applied",
        taskIds: [],
        canonicalContribution: {},
      },
      {
        ...detail,
        id: donationId,
        shared: {
          ...detail.shared,
          donationId,
          currencyCode: "GBP",
        },
      },
    );
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = render(
      <QueryProvider>
        <ContributionOperationShell
          open
          onClose={vi.fn()}
          operation={OPERATION_DEFINITIONS.amount_correction!}
          donationId={donationId}
          sourceSurface="donor_crm_record"
        />
      </QueryProvider>,
    );

    expect(await view.findByLabelText("Amount (GBP)")).toBeTruthy();
    expect(view.queryByLabelText("Amount (USD)")).toBeNull();
  });

  it("keeps staged gift ids at the shared request root for staged gift actions", async () => {
    const fetchMock = fetchMockForShell({
      auditEventId: "audit-1",
      approvalStatus: "applied",
      receiptOutcome: { status: "sent" },
      taskIds: [],
      canonicalContribution: {},
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = render(
      <QueryProvider>
        <ContributionOperationShell
          open
          onClose={vi.fn()}
          operation={OPERATION_DEFINITIONS.resend_receipt!}
          donationId={DONATION_ID}
          sourceSurface="donor_crm_record"
        />
      </QueryProvider>,
    );

    await view.findByText("$250.00");
    fireEvent.click(view.getByRole("button", { name: "Send receipt" }));

    await view.findByTestId("operation-result-panel");
    const actionCall = fetchMock.mock.calls.find(([url]) =>
      String(url).includes("/actions"),
    );
    const body = JSON.parse((actionCall![1] as RequestInit).body as string);
    expect(body.stagedGiftId).toBe("staged-1");
    expect(body.payload).toEqual({});
  });

  it("renders the server-computed blocked state instead of a submit form", async () => {
    const fetchMock = fetchMockForShell({});
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = render(
      <QueryProvider>
        <ContributionOperationShell
          open
          onClose={vi.fn()}
          operation={OPERATION_DEFINITIONS.refund!}
          donationId={DONATION_ID}
          sourceSurface="donor_crm_record"
        />
      </QueryProvider>,
    );

    expect(
      await view.findByText(/no payment provider charge to refund against/i),
    ).toBeTruthy();
    expect(
      view.getByText(/offline gifts are corrected through adjustments/i),
    ).toBeTruthy();
    expect(view.queryByRole("button", { name: "Refund gift" })).toBeNull();
  });

  it("fails closed when server availability omits the requested action", async () => {
    const donationId = "00000000-0000-4000-8000-0000000000cc";
    const detail = makeDetail();
    const fetchMock = fetchMockForShell(
      {},
      {
        ...detail,
        id: donationId,
        shared: {
          ...detail.shared,
          donationId,
        },
        actionAvailability: [
          {
            actionType: "refund",
            available: true,
            blockedReason: null,
            nextStep: null,
            riskLevel: "high",
          },
        ],
      },
    );
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = render(
      <QueryProvider>
        <ContributionOperationShell
          open
          onClose={vi.fn()}
          operation={OPERATION_DEFINITIONS.amount_correction!}
          donationId={donationId}
          sourceSurface="donor_crm_record"
        />
      </QueryProvider>,
    );

    expect(
      await view.findByText(/not available for the current gift/i),
    ).toBeTruthy();
    expect(
      view.queryByRole("button", { name: "Correct gift amount" }),
    ).toBeNull();
    expect(
      fetchMock.mock.calls.some(([url]) => String(url).includes("/actions")),
    ).toBe(false);
  });

  it("preserves entered form state on failure and offers retry", async () => {
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (String(url).includes("/actions")) {
        return {
          ok: false,
          json: async () => ({ error: "The operation failed upstream." }),
        };
      }
      return { ok: true, json: async () => ({ contribution: makeDetail() }) };
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = render(
      <QueryProvider>
        <ContributionOperationShell
          open
          onClose={vi.fn()}
          operation={OPERATION_DEFINITIONS.amount_correction!}
          donationId={DONATION_ID}
          sourceSurface="donor_crm_record"
        />
      </QueryProvider>,
    );

    await view.findByText("$250.00");
    fireEvent.change(view.getByLabelText("Amount (USD)"), {
      target: { value: "150" },
    });
    fireEvent.change(view.getByLabelText("Reason"), {
      target: { value: "fix" },
    });
    fireEvent.click(view.getByRole("checkbox"));
    fireEvent.click(view.getByRole("button", { name: "Correct gift amount" }));

    expect(await view.findByRole("alert")).toBeTruthy();
    expect(view.getByText(/failed upstream/i)).toBeTruthy();

    // Entered values survive the failure for safe recovery.
    const amountInput = view.getByLabelText("Amount (USD)") as HTMLInputElement;
    expect(amountInput.value).toBe("150");
    expect(view.getByRole("button", { name: "Retry" })).toBeTruthy();

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.filter(([url]) =>
          String(url).includes("/actions"),
        ),
      ).toHaveLength(1);
    });
  });

  function renderRefundShell(
    donationId: string,
    actionResult: Record<string, unknown>,
    detail: ReturnType<typeof makeRefundableDetail> = makeRefundableDetail(
      donationId,
    ),
  ) {
    const fetchMock = fetchMockForShell(actionResult, detail);
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = render(
      <QueryProvider>
        <ContributionOperationShell
          open
          onClose={vi.fn()}
          operation={OPERATION_DEFINITIONS.refund!}
          donationId={donationId}
          sourceSurface="contribution_hub"
        />
      </QueryProvider>,
    );

    return { fetchMock, view };
  }

  async function submitRefund(
    view: ReturnType<typeof render>,
    amountDollars?: string,
  ) {
    // Wait for detail to load (context rows render from detail truth).
    await view.findByText("Refunded so far");
    if (amountDollars !== undefined) {
      fireEvent.change(view.getByLabelText("Amount (USD)"), {
        target: { value: amountDollars },
      });
    }
    fireEvent.change(view.getByLabelText("Reason"), {
      target: { value: "Donor requested a refund" },
    });
    fireEvent.click(view.getByRole("checkbox"));
    fireEvent.click(view.getByRole("button", { name: "Refund gift" }));
    await view.findByTestId("operation-result-panel");
  }

  it("shows refund context rows and prefills the full remaining amount", async () => {
    const { view } = renderRefundShell(
      "00000000-0000-4000-8000-0000000000d1",
      {},
    );

    expect(await view.findByText("Refunded so far")).toBeTruthy();
    expect(view.getByText("Original charged amount")).toBeTruthy();
    expect(view.getByText("$50.00")).toBeTruthy();
    expect(view.getByText("Remaining refundable")).toBeTruthy();
    expect(view.getByText("$200.00")).toBeTruthy();

    // Full refund is the default; staff lower the amount for a partial.
    const amountInput = view.getByLabelText("Amount (USD)") as HTMLInputElement;
    await waitFor(() => {
      expect(amountInput.value).toBe("200.00");
    });
    expect(
      view.getByText("Enter a lower amount for a partial refund."),
    ).toBeTruthy();
    // The prefilled full amount is already valid; only reason/confirmation
    // remain outstanding.
    expect(amountInput.getAttribute("aria-invalid")).toBe("false");
    expect(view.queryByText("Enter a valid amount.")).toBeNull();
  });

  it("rejects refund amounts above the remaining refundable amount", async () => {
    const { view } = renderRefundShell(
      "00000000-0000-4000-8000-0000000000d2",
      {},
    );

    await view.findByText("Refunded so far");
    const amountInput = view.getByLabelText("Amount (USD)");
    fireEvent.change(amountInput, { target: { value: "250" } });

    expect(view.getByText("Enter an amount up to $200.00.")).toBeTruthy();
    expect(amountInput.getAttribute("aria-invalid")).toBe("true");
    expect(view.getByRole("button", { name: "Refund gift" })).toHaveProperty(
      "disabled",
      true,
    );
  });

  it("keeps the original-basis refund figures when a correction raised the effective amount", async () => {
    const donationId = "00000000-0000-4000-8000-0000000000e1";
    // Original $250.00 charge, $50.00 refunded, amount-corrected UP to an
    // effective $300.00. The provider can never refund more than it charged,
    // so the prefill, the cap, and the context rows must stay on the
    // original basis ($200.00 remaining) — the server enforces the same.
    const { view } = renderRefundShell(
      donationId,
      {},
      makeRefundableDetail(donationId, { effectiveAmountCents: 30_000 }),
    );

    expect(await view.findByText("Original charged amount")).toBeTruthy();
    expect(view.getByText("$250.00")).toBeTruthy();
    expect(view.getByText("$300.00")).toBeTruthy();
    expect(view.getByText("$200.00")).toBeTruthy();

    const amountInput = view.getByLabelText("Amount (USD)") as HTMLInputElement;
    await waitFor(() => {
      expect(amountInput.value).toBe("200.00");
    });

    fireEvent.change(amountInput, { target: { value: "250" } });
    expect(view.getByText("Enter an amount up to $200.00.")).toBeTruthy();
  });

  it("allows the full original-basis refund when a correction lowered the effective amount", async () => {
    const donationId = "00000000-0000-4000-8000-0000000000e2";
    // Original $250.00 charge, $50.00 refunded, amount-corrected DOWN to an
    // effective $100.00. The server permits refunding the remaining $200.00
    // of the original charge; the effective basis would wrongly cap staff
    // at $50.00.
    const { view } = renderRefundShell(
      donationId,
      {},
      makeRefundableDetail(donationId, { effectiveAmountCents: 10_000 }),
    );

    expect(await view.findByText("Original charged amount")).toBeTruthy();
    expect(view.getByText("$250.00")).toBeTruthy();
    expect(view.getByText("$100.00")).toBeTruthy();
    expect(view.getByText("$200.00")).toBeTruthy();

    const amountInput = view.getByLabelText("Amount (USD)") as HTMLInputElement;
    await waitFor(() => {
      expect(amountInput.value).toBe("200.00");
    });
    expect(amountInput.getAttribute("aria-invalid")).toBe("false");
    expect(view.queryByText(/enter an amount up to/i)).toBeNull();
  });

  it("blocks a second refund while a pending refund correction awaits provider confirmation", async () => {
    const donationId = "00000000-0000-4000-8000-0000000000e3";
    const { view } = renderRefundShell(
      donationId,
      {},
      makeRefundableDetail(donationId, {
        corrections: [
          { id: "corr-1", correctionType: "refund", status: "pending" },
        ],
      }),
    );

    await view.findByText("Refunded so far");
    expect(
      view.getByText(/a refund is pending provider confirmation/i),
    ).toBeTruthy();

    // Even a fully valid form stays blocked while the provider has not
    // confirmed the in-flight refund (server live check stays authoritative).
    fireEvent.change(view.getByLabelText("Reason"), {
      target: { value: "Donor requested a refund" },
    });
    fireEvent.click(view.getByRole("checkbox"));
    expect(view.getByRole("button", { name: "Refund gift" })).toHaveProperty(
      "disabled",
      true,
    );
  });

  it("does not block refunds for applied or failed refund corrections", async () => {
    const donationId = "00000000-0000-4000-8000-0000000000e4";
    const { view } = renderRefundShell(
      donationId,
      {},
      makeRefundableDetail(donationId, {
        corrections: [
          { id: "corr-1", correctionType: "refund", status: "applied" },
          { id: "corr-2", correctionType: "refund", status: "failed" },
          {
            id: "corr-3",
            correctionType: "amount_correction",
            status: "pending",
          },
        ],
      }),
    );

    await view.findByText("Refunded so far");
    expect(
      view.queryByText(/a refund is pending provider confirmation/i),
    ).toBeNull();
  });

  it("frames local_update_failed honestly: the Stripe refund succeeded and must not be resubmitted", async () => {
    const { view } = renderRefundShell("00000000-0000-4000-8000-0000000000e5", {
      auditEventId: "audit-refund-5",
      approvalStatus: "applied",
      taskIds: [],
      canonicalContribution: {},
      providerOutcome: {
        provider: "stripe",
        status: "local_update_failed",
        referenceId: "re_local_1",
        errorCode: "local_update_failed",
        errorMessage:
          "The Stripe refund succeeded but no local donation record matched the refunded charge. Reconcile the gift against the provider reference.",
      },
    });

    await submitRefund(view);

    // The failure headline would be a lie here — the provider refund DID
    // complete — and it invites the duplicate submission this state exists
    // to prevent (#265).
    expect(view.queryByText(/operation completed/i)).toBeNull();
    expect(
      view.queryByText("The provider refund did not complete."),
    ).toBeNull();
    const alert = view.getByRole("alert");
    expect(alert.textContent).toContain("The Stripe refund succeeded");
    expect(alert.textContent).toContain("Do not submit the refund again");
    expect(view.getByText(/provider reference: re_local_1/i)).toBeTruthy();
    expect(
      view.getByText(/provider error code: local_update_failed/i),
    ).toBeTruthy();
  });

  it("submits partial refund amounts as integer cents through the shared contract", async () => {
    const donationId = "00000000-0000-4000-8000-0000000000d3";
    const { fetchMock, view } = renderRefundShell(donationId, {
      auditEventId: "audit-refund-1",
      approvalStatus: "applied",
      taskIds: [],
      canonicalContribution: {},
      providerOutcome: {
        provider: "stripe",
        status: "succeeded",
        referenceId: "re_123",
      },
    });

    await submitRefund(view, "150.25");

    const actionCall = fetchMock.mock.calls.find(([url]) =>
      String(url).includes("/actions"),
    );
    const body = JSON.parse((actionCall![1] as RequestInit).body as string);
    expect(body).toMatchObject({
      actionType: "refund",
      contributionId: donationId,
      sourceSurface: "contribution_hub",
      payload: { amount: 15_025 },
    });
    expect(Number.isInteger(body.payload.amount)).toBe(true);
  });

  it("shows an honest failure panel when the provider refund fails", async () => {
    const { view } = renderRefundShell("00000000-0000-4000-8000-0000000000d4", {
      auditEventId: "audit-refund-2",
      approvalStatus: "applied",
      taskIds: [],
      canonicalContribution: {},
      providerOutcome: {
        provider: "stripe",
        status: "failed",
        referenceId: null,
        errorCode: "charge_already_refunded",
        errorMessage: null,
      },
    });

    await submitRefund(view);

    expect(view.queryByText(/operation completed/i)).toBeNull();
    const alert = view.getByRole("alert");
    expect(alert.textContent).toContain(
      "The provider refund did not complete.",
    );
    expect(
      view.getByText(/provider error code: charge_already_refunded/i),
    ).toBeTruthy();
    // Audit trail ids stay visible for follow-up.
    expect(view.getByText(/audit event: audit-refund-2/i)).toBeTruthy();
  });

  it("frames a pending provider refund as awaiting confirmation, never completed", async () => {
    const { view } = renderRefundShell("00000000-0000-4000-8000-0000000000d5", {
      auditEventId: "audit-refund-3",
      approvalStatus: "applied",
      taskIds: [],
      canonicalContribution: {},
      providerOutcome: {
        provider: "stripe",
        status: "pending",
        referenceId: "re_pending_1",
      },
    });

    await submitRefund(view);

    expect(view.queryByText(/operation completed/i)).toBeNull();
    expect(
      view.getByText(
        "Stripe accepted the refund; the final state will update when the provider confirms.",
      ),
    ).toBeTruthy();
    expect(view.getByText(/provider reference: re_pending_1/i)).toBeTruthy();
  });

  it("shows success with the provider reference when the refund succeeds", async () => {
    const { view } = renderRefundShell("00000000-0000-4000-8000-0000000000d6", {
      auditEventId: "audit-refund-4",
      approvalStatus: "applied",
      taskIds: [],
      canonicalContribution: {},
      providerOutcome: {
        provider: "stripe",
        status: "succeeded",
        referenceId: "re_123",
      },
    });

    await submitRefund(view);

    expect(view.getByText(/operation completed/i)).toBeTruthy();
    expect(view.getByText(/provider reference: re_123/i)).toBeTruthy();
    expect(view.queryByRole("alert")).toBeNull();
  });

  it("frames failed provider outcomes generically for non-refund operations", async () => {
    const donationId = "00000000-0000-4000-8000-0000000000d7";
    const detail = makeDetail();
    const fetchMock = fetchMockForShell(
      {
        auditEventId: "audit-replay-1",
        approvalStatus: "applied",
        taskIds: [],
        canonicalContribution: {},
        providerOutcome: {
          provider: "stripe",
          status: "failed",
          referenceId: null,
          errorCode: "event_not_found",
        },
      },
      {
        ...detail,
        id: donationId,
        shared: {
          ...detail.shared,
          donationId,
        },
        actionAvailability: [
          {
            actionType: "stripe_replay",
            available: true,
            blockedReason: null,
            nextStep: null,
            riskLevel: "high",
          },
        ],
      },
    );
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = render(
      <QueryProvider>
        <ContributionOperationShell
          open
          onClose={vi.fn()}
          operation={OPERATION_DEFINITIONS.stripe_replay!}
          donationId={donationId}
          sourceSurface="contribution_hub"
        />
      </QueryProvider>,
    );

    await view.findByText("$250.00");
    fireEvent.change(view.getByLabelText("Reason"), {
      target: { value: "Recover missed provider event" },
    });
    fireEvent.click(view.getByRole("checkbox"));
    fireEvent.click(
      view.getByRole("button", { name: "Replay provider webhook" }),
    );

    await view.findByTestId("operation-result-panel");
    expect(view.queryByText(/operation completed/i)).toBeNull();
    expect(view.getByRole("alert").textContent).toContain(
      "The provider operation did not complete.",
    );
    expect(
      view.getByText(/provider error code: event_not_found/i),
    ).toBeTruthy();
  });
});
