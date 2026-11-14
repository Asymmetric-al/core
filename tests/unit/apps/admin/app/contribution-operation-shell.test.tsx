/** @vitest-environment jsdom */

import { OPERATION_DEFINITIONS } from "@asym/api/admin/contribution-operations/catalog";
import { getQueryClient, QueryProvider } from "@asym/database/providers";
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { contributionDetailQueryKey } from "../../../../../apps/admin/app/(app)/contributions/contribution-detail-query";
import { ContributionOperationShell } from "../../../../../apps/admin/app/(app)/contributions/operation-shell";
import { useAdminContributions } from "../../../../../apps/admin/app/(app)/contributions/use-admin-contributions";

import type { CrmPostFailedScope } from "@asym/api/admin/contribution-operations";

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

function makeReceiptDelivery(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    options: [
      {
        choice: "email",
        available: false,
        blockedReason: "The donor has no email address on file.",
      },
      { choice: "pdf", available: true, blockedReason: null },
      { choice: "defer", available: true, blockedReason: null },
    ],
    defaultChoice: "pdf",
    deferReasonRequired: true,
    requireDeliveryAction: false,
    donor: { email: null, doNotEmail: false },
    ...overrides,
  };
}

function makeStalePostingDetail(input: {
  actionType: "approve_staged_gift" | "retry_staged_gift";
  donationId: string;
  failedScopes: CrmPostFailedScope[];
  stagedGiftStatus: "failed" | "ready_to_post" | "posted";
}) {
  const detail = makeDetail();
  return {
    ...detail,
    id: input.donationId,
    shared: { ...detail.shared, donationId: input.donationId },
    stagedGift: {
      ...detail.stagedGift,
      status: input.stagedGiftStatus,
    },
    actionAvailability: [
      {
        actionType: input.actionType,
        available: true,
        blockedReason: null,
        nextStep: null,
        riskLevel: "medium",
      },
    ],
    crm: {
      parent: {
        status: input.failedScopes.some((scope) => scope.scope === "parent")
          ? "failed"
          : "posted",
        twentyRecordId: "crm-parent-1",
        lastError: null,
      },
      designationRecords: input.failedScopes
        .filter((scope) => scope.scope === "designation")
        .map((scope) => ({
          allocationId: scope.allocationId,
          status: "failed",
          twentyRecordId: null,
          lastError: "The designation post failed.",
        })),
      failedScopes: input.failedScopes,
      adapterLimitation: null,
    },
  };
}

const STALE_POSTING_CASES = (
  ["approve_staged_gift", "retry_staged_gift"] as const
).flatMap((actionType, actionIndex) =>
  (["failed", "ready_to_post", "posted"] as const).flatMap(
    (stagedGiftStatus, statusIndex) =>
      (
        [
          { name: "no failed scope", failedScopes: [] },
          {
            name: "a parent failure",
            failedScopes: [{ scope: "parent" as const }],
          },
          {
            name: "a designation failure",
            failedScopes: [
              {
                scope: "designation" as const,
                allocationId: `00000000-0000-4000-8000-${String(
                  actionIndex * 100 + statusIndex * 10 + 1,
                ).padStart(12, "0")}`,
              },
            ],
          },
          {
            name: "mixed parent and designation failures",
            failedScopes: [
              { scope: "parent" as const },
              {
                scope: "designation" as const,
                allocationId: `00000000-0000-4000-8000-${String(
                  actionIndex * 100 + statusIndex * 10 + 2,
                ).padStart(12, "0")}`,
              },
            ],
          },
        ] satisfies Array<{
          name: string;
          failedScopes: CrmPostFailedScope[];
        }>
      ).map((scopeCase, scopeIndex) => ({
        ...scopeCase,
        actionType,
        stagedGiftStatus,
        donationId: `00000000-0000-4000-8000-${String(
          actionIndex * 100 + statusIndex * 10 + scopeIndex + 1000,
        ).padStart(12, "0")}`,
      })),
  ),
);

/**
 * Detail payload with the AL-263 receipt delivery block. Each test uses a
 * unique donation id because the shared QueryProvider caches detail per id.
 */
function makeReceiptDeliveryDetail(donationId: string) {
  const detail = makeDetail({ receiptDelivery: makeReceiptDelivery() });
  return {
    ...detail,
    id: donationId,
    shared: { ...detail.shared, donationId },
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

function HubAmountProbe() {
  const contributionsQuery = useAdminContributions();
  const amountCents = contributionsQuery.data?.[0]?.amountCents;

  return <p>Hub amount: {amountCents ?? "loading"}</p>;
}

describe("ContributionOperationShell", () => {
  beforeEach(() => {
    fetchDescriptor = Object.getOwnPropertyDescriptor(globalThis, "fetch");
  });

  afterEach(() => {
    cleanup();
    getQueryClient().clear();
    vi.restoreAllMocks();
    vi.clearAllMocks();
    if (fetchDescriptor) {
      Object.defineProperty(globalThis, "fetch", fetchDescriptor);
    } else {
      Reflect.deleteProperty(globalThis, "fetch");
    }
  });

  it("names a queued receipt with the shared label in the current-values summary", async () => {
    const detail = makeDetail();
    const fetchMock = fetchMockForShell(
      {},
      {
        ...detail,
        id: "00000000-0000-4000-8000-0000000000b1",
        shared: {
          ...detail.shared,
          donationId: "00000000-0000-4000-8000-0000000000b1",
          receiptStatus: "pending",
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
          donationId="00000000-0000-4000-8000-0000000000b1"
          sourceSurface="donor_crm_record"
        />
      </QueryProvider>,
    );

    await view.findByText("$250.00", {}, { timeout: 10_000 });
    expect(
      view.getByRole("group", { name: "Gift operation details" }),
    ).toBeTruthy();
    const receiptTerm = view
      .getAllByText("Receipt")
      .find((node) => node.tagName === "DT");
    // Same wording as the Hub and CRM: a pending receipt is "Queued".
    expect(receiptTerm?.nextElementSibling?.textContent).toBe("Queued");
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
    expect(
      await view.findByText("$250.00", {}, { timeout: 10_000 }),
    ).toBeTruthy();
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
    // Without a host-provided handler the optional secondary action never
    // renders — the shell never redirects on its own (ADR-CD-033).
    expect(
      view.queryByRole("button", { name: "View full contribution detail" }),
    ).toBeNull();
    // A result without a receipt outcome renders no receipt line.
    expect(view.queryByText(/receipt:/i)).toBeNull();

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

  it("keeps a successful operation successful when post-submit refresh fails", async () => {
    const fetchMock = fetchMockForShell({
      auditEventId: "audit-refresh-warning",
      adjustmentId: "adj-refresh-warning",
      approvalStatus: "pending_approval",
      taskIds: [],
      canonicalContribution: {},
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });
    const invalidationError = new Error("shared invalidation failed");
    const rowRefreshError = new Error("CRM refetch failed");
    let rejectInvalidation: (reason?: unknown) => void = () => undefined;
    const invalidation = new Promise<void>((_resolve, reject) => {
      rejectInvalidation = reject;
    });
    let rejectRowRefresh: (reason?: unknown) => void = () => undefined;
    const rowRefresh = new Promise<void>((_resolve, reject) => {
      rejectRowRefresh = reject;
    });
    const invalidateQueries = vi
      .spyOn(getQueryClient(), "invalidateQueries")
      .mockReturnValueOnce(invalidation);
    const onRowRefresh = vi.fn().mockReturnValue(rowRefresh);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

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

    await view.findByText("$250.00");
    fireEvent.change(view.getByLabelText("Amount (USD)"), {
      target: { value: "200" },
    });
    fireEvent.change(view.getByLabelText("Reason"), {
      target: { value: "correct shared amount" },
    });
    fireEvent.click(view.getByRole("checkbox"));
    fireEvent.click(view.getByRole("button", { name: "Correct gift amount" }));

    expect(
      await view.findByText("Correction request submitted for approval."),
    ).toBeTruthy();
    expect(invalidateQueries).toHaveBeenCalled();
    expect(onRowRefresh).toHaveBeenCalledOnce();
    expect(view.queryByText(/displayed gift data may be stale/i)).toBeNull();

    await act(async () => {
      rejectInvalidation(invalidationError);
      rejectRowRefresh(rowRefreshError);
      await Promise.resolve();
    });

    const warning = await view.findByRole("alert");
    expect(warning.textContent).toMatch(/the submission succeeded/i);
    expect(warning.textContent).toMatch(/displayed gift data may be stale/i);
    expect(warning.textContent).toMatch(/will retry loading current values/i);
    expect(view.queryByRole("button", { name: "Retry" })).toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      "Contribution operation succeeded, but refresh failed.",
      [invalidationError, rowRefreshError],
    );
  });

  it("does not apply late refresh failures to a newer result", async () => {
    const actionResults = [
      {
        auditEventId: "audit-late-refresh-a",
        adjustmentId: "adj-late-refresh-a",
        approvalStatus: "applied",
        taskIds: [],
        canonicalContribution: {},
      },
      {
        auditEventId: "audit-late-refresh-b",
        adjustmentId: "adj-late-refresh-b",
        approvalStatus: "applied",
        taskIds: [],
        canonicalContribution: {},
      },
    ];
    let actionIndex = 0;
    const detail = makeDetail();
    const fetchMock = vi
      .fn()
      .mockImplementation(async (url: string, init?: RequestInit) => {
        if (url.includes("/actions")) {
          const result = actionResults[actionIndex++]!;
          return {
            ok: true,
            json: async () => ({ result }),
            init,
          };
        }
        return {
          ok: true,
          json: async () => ({ contribution: detail }),
        };
      });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });
    const invalidationError = new Error("late shared invalidation failure");
    const rowRefreshError = new Error("late CRM refetch failure");
    let rejectInvalidation: (reason?: unknown) => void = () => undefined;
    const invalidation = new Promise<void>((_resolve, reject) => {
      rejectInvalidation = reject;
    });
    let rejectRowRefresh: (reason?: unknown) => void = () => undefined;
    const rowRefresh = new Promise<void>((_resolve, reject) => {
      rejectRowRefresh = reject;
    });
    vi.spyOn(getQueryClient(), "invalidateQueries").mockReturnValueOnce(
      invalidation,
    );
    const onRowRefresh = vi
      .fn()
      .mockReturnValueOnce(rowRefresh)
      .mockResolvedValue(undefined);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const shell = (open: boolean) => (
      <QueryProvider>
        <ContributionOperationShell
          open={open}
          onClose={vi.fn()}
          operation={OPERATION_DEFINITIONS.amount_correction!}
          donationId={DONATION_ID}
          sourceSurface="donor_crm_record"
          onRowRefresh={onRowRefresh}
        />
      </QueryProvider>
    );
    const view = render(shell(true));

    await view.findByText("$250.00");
    fireEvent.change(view.getByLabelText("Amount (USD)"), {
      target: { value: "200" },
    });
    fireEvent.change(view.getByLabelText("Reason"), {
      target: { value: "correct shared amount" },
    });
    fireEvent.click(view.getByRole("checkbox"));
    fireEvent.click(view.getByRole("button", { name: "Correct gift amount" }));

    expect(await view.findByText("Operation completed.")).toBeTruthy();
    expect(onRowRefresh).toHaveBeenCalledOnce();

    view.rerender(shell(false));
    view.rerender(shell(true));
    expect(await view.findByText("$250.00")).toBeTruthy();
    expect(view.queryByText("Operation completed.")).toBeNull();

    fireEvent.change(view.getByLabelText("Amount (USD)"), {
      target: { value: "210" },
    });
    fireEvent.change(view.getByLabelText("Reason"), {
      target: { value: "submit a newer correction" },
    });
    fireEvent.click(view.getByRole("checkbox"));
    fireEvent.click(view.getByRole("button", { name: "Correct gift amount" }));

    await waitFor(() => {
      expect(view.getByTestId("operation-result-panel").textContent).toContain(
        "audit-late-refresh-b",
      );
      expect(onRowRefresh).toHaveBeenCalledTimes(2);
    });
    expect(view.queryByText(/displayed gift data may be stale/i)).toBeNull();

    await act(async () => {
      rejectInvalidation(invalidationError);
      rejectRowRefresh(rowRefreshError);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        "Contribution operation succeeded, but refresh failed.",
        [invalidationError, rowRefreshError],
      );
    });
    expect(view.queryByText(/displayed gift data may be stale/i)).toBeNull();
    expect(view.getByTestId("operation-result-panel").textContent).toContain(
      "audit-late-refresh-b",
    );
  });

  it("names the donor and gift the operation acts on", async () => {
    const fetchMock = fetchMockForShell(
      {
        auditEventId: "audit-1",
        approvalStatus: "applied",
        taskIds: [],
        canonicalContribution: {},
      },
      makeDetail(),
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
          operation={OPERATION_DEFINITIONS.refund!}
          donationId={DONATION_ID}
          sourceSurface="contribution_hub"
        />
      </QueryProvider>,
    );

    const identity = await view.findByTestId("operation-gift-identity");
    expect(identity.textContent).toContain("Shell Donor");
    expect(identity.textContent).toMatch(/May 1, 2026|1 May 2026/);
  });

  it("marks a refund's cannot-be-undone warning as destructive", async () => {
    const fetchMock = fetchMockForShell(
      {
        auditEventId: "audit-1",
        approvalStatus: "applied",
        taskIds: [],
        canonicalContribution: {},
      },
      makeDetail({
        actionAvailability: [
          {
            actionType: "refund",
            available: true,
            blockedReason: null,
            nextStep: null,
            riskLevel: "high",
          },
        ],
      }),
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
          operation={OPERATION_DEFINITIONS.refund!}
          donationId={DONATION_ID}
          sourceSurface="contribution_hub"
        />
      </QueryProvider>,
    );

    const notes = await view.findAllByRole("note");
    const risk = notes.find((note) =>
      note.textContent?.includes("cannot be undone"),
    );
    expect(risk).toBeTruthy();
    expect(risk!.className).toContain("border-destructive");
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
      receiptOutcome: { status: "emailed" },
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

    await view.findByText("$250.00", {}, { timeout: 10_000 });
    // The gift's receipt was already sent, so the dialog says what it does:
    // a resend, as the gift row's button does.
    expect(view.getByRole("heading", { name: "Resend receipt" })).toBeTruthy();
    expect(
      view.getByText("Sends the gift receipt to the donor again."),
    ).toBeTruthy();
    const sendReceipt = view.getByRole("button", { name: "Resend receipt" });
    await waitFor(() =>
      expect((sendReceipt as HTMLButtonElement).disabled).toBe(false),
    );
    fireEvent.click(sendReceipt);

    await view.findByTestId("operation-result-panel");
    // The receipt outcome from the shared result renders as a result line.
    expect(view.getByText("Receipt: Emailed to the donor")).toBeTruthy();
    const actionCall = fetchMock.mock.calls.find(([url]) =>
      String(url).includes("/actions"),
    );
    const body = JSON.parse((actionCall![1] as RequestInit).body as string);
    expect(body.stagedGiftId).toBe("staged-1");
    expect(body.payload).toEqual({});
  });

  it.each(STALE_POSTING_CASES)(
    "blocks stale $actionType availability for $stagedGiftStatus with $name",
    async ({ actionType, donationId, failedScopes, stagedGiftStatus }) => {
      const fetchMock = fetchMockForShell(
        {},
        makeStalePostingDetail({
          actionType,
          donationId,
          failedScopes,
          stagedGiftStatus,
        }),
      );
      Object.defineProperty(globalThis, "fetch", {
        configurable: true,
        value: fetchMock,
      });
      const onOpenFullDetail = vi.fn();

      const view = render(
        <QueryProvider>
          <ContributionOperationShell
            open
            onClose={vi.fn()}
            operation={OPERATION_DEFINITIONS[actionType]}
            donationId={donationId}
            sourceSurface="donor_crm_record"
            onOpenFullDetail={onOpenFullDetail}
          />
        </QueryProvider>,
      );

      expect(
        await view.findByText(
          /no longer an active product workflow/i,
          {},
          { timeout: 10_000 },
        ),
      ).toBeTruthy();
      expect(
        view.getByText(/historical evidence.*current CRM data.*Asym/i),
      ).toBeTruthy();
      expect(
        view.queryByRole("button", { name: "CRM posting unavailable" }),
      ).toBeNull();

      fireEvent.click(
        view.getByRole("button", { name: "View full contribution detail" }),
      );

      expect(onOpenFullDetail).toHaveBeenCalledWith(donationId);
      expect(
        fetchMock.mock.calls.some(([url]) => String(url).includes("/actions")),
      ).toBe(false);
    },
  );

  it("omits the receipt result line when the outcome is not required", async () => {
    const fetchMock = fetchMockForShell({
      auditEventId: "audit-2",
      approvalStatus: "applied",
      receiptOutcome: { status: "not_required" },
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

    await view.findByText("$250.00", {}, { timeout: 10_000 });
    const sendReceipt = view.getByRole("button", { name: "Resend receipt" });
    await waitFor(() =>
      expect((sendReceipt as HTMLButtonElement).disabled).toBe(false),
    );
    fireEvent.click(sendReceipt);

    await view.findByTestId("operation-result-panel");
    expect(view.getByText(/audit event: audit-2/i)).toBeTruthy();
    // A "not required" outcome is noise, so the panel suppresses the line.
    expect(view.queryByText(/receipt:/i)).toBeNull();
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
      await view.findByText(
        /no payment provider charge to refund against/i,
        {},
        { timeout: 10_000 },
      ),
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
      await view.findByText(
        /not available for the current gift/i,
        {},
        { timeout: 10_000 },
      ),
    ).toBeTruthy();
    expect(
      view.queryByRole("button", { name: "Correct gift amount" }),
    ).toBeNull();
    expect(
      fetchMock.mock.calls.some(([url]) => String(url).includes("/actions")),
    ).toBe(false);
  });

  it("keeps the operation blocked when current gift detail fails to load", async () => {
    const donationId = "00000000-0000-4000-8000-0000000000dd";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Current gift detail could not be loaded." }),
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });
    getQueryClient().setQueryDefaults(
      ["admin", "contribution-detail", donationId],
      { retry: false },
    );

    const view = render(
      <QueryProvider>
        <ContributionOperationShell
          open
          onClose={vi.fn()}
          operation={OPERATION_DEFINITIONS.resend_receipt!}
          donationId={donationId}
          sourceSurface="donor_crm_record"
        />
      </QueryProvider>,
    );

    expect(
      await view.findByText(/current gift detail could not be loaded/i),
    ).toBeTruthy();
    expect(
      view.queryByRole("button", { name: /^(Re)?send receipt$/i }),
    ).toBeNull();
    expect(
      fetchMock.mock.calls.some(([url]) => String(url).includes("/actions")),
    ).toBe(false);
  });

  it("keeps the operation blocked when the contribution id cannot load detail", () => {
    const fetchMock = vi.fn();
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
          donationId="invalid-contribution-id"
          sourceSurface="donor_crm_record"
        />
      </QueryProvider>,
    );

    expect(view.getByText(/current gift detail is unavailable/i)).toBeTruthy();
    expect(view.queryByLabelText("Amount (USD)")).toBeNull();
    expect(
      view.queryByRole("button", { name: "Correct gift amount" }),
    ).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
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

    await view.findByText("$250.00", {}, { timeout: 10_000 });
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

  it("protects and reloads a draft after a background revision refresh", async () => {
    const donationId = "00000000-0000-4000-8000-0000000000ab";
    const initialDetail = makeDetail({
      id: donationId,
      revision: "2026-05-01T00:00:00.000Z#0",
    });
    initialDetail.shared = {
      ...initialDetail.shared,
      donationId,
      amountCents: 25_000,
    };
    const refreshedDetail = {
      ...initialDetail,
      revision: "2026-05-02T00:00:00.000Z#1",
      shared: {
        ...initialDetail.shared,
        amountCents: 30_000,
      },
    };
    let detailFetchCount = 0;
    const fetchMock = vi
      .fn()
      .mockImplementation(async (url: string, init?: RequestInit) => {
        if (String(url).includes("/actions")) {
          return {
            ok: true,
            init,
            json: async () => ({
              result: {
                auditEventId: "audit-stale-recovery",
                approvalStatus: "applied",
                taskIds: [],
                canonicalContribution: {},
              },
            }),
          };
        }
        detailFetchCount += 1;
        return {
          ok: true,
          json: async () => ({
            contribution:
              detailFetchCount === 1 ? initialDetail : refreshedDetail,
          }),
        };
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
          donationId={donationId}
          sourceSurface="donor_crm_record"
        />
      </QueryProvider>,
    );

    expect(await view.findByText("$250.00")).toBeTruthy();
    fireEvent.change(view.getByLabelText("Amount (USD)"), {
      target: { value: "150" },
    });
    fireEvent.change(view.getByLabelText("Reason"), {
      target: { value: "fix" },
    });
    fireEvent.click(view.getByRole("checkbox"));

    act(() => {
      getQueryClient().setQueryData(
        contributionDetailQueryKey(donationId),
        refreshedDetail,
      );
    });
    expect(await view.findByText("$300.00")).toBeTruthy();
    expect(
      (view.getByLabelText("Amount (USD)") as HTMLInputElement).value,
    ).toBe("150");
    expect(
      await view.findByText(/gift changed while you were editing/i),
    ).toBeTruthy();
    expect(
      view.getByRole("button", { name: "Reload latest gift" }),
    ).toBeTruthy();
    expect(view.getByRole("button", { name: "Discard draft" })).toBeTruthy();
    expect(
      fetchMock.mock.calls.filter(([url]) => String(url).includes("/actions")),
    ).toHaveLength(0);

    fireEvent.click(view.getByRole("button", { name: "Reload latest gift" }));
    await waitFor(() => {
      expect(
        view.queryByText(/gift changed while you were editing/i),
      ).toBeNull();
    });
    expect(view.getByText("$300.00")).toBeTruthy();
    expect(
      (view.getByLabelText("Amount (USD)") as HTMLInputElement).value,
    ).toBe("");
    expect((view.getByLabelText("Reason") as HTMLTextAreaElement).value).toBe(
      "",
    );
    expect(
      (view.getByRole("checkbox") as HTMLButtonElement).getAttribute(
        "data-checked",
      ),
    ).toBeNull();

    fireEvent.change(view.getByLabelText("Amount (USD)"), {
      target: { value: "200" },
    });
    fireEvent.change(view.getByLabelText("Reason"), {
      target: { value: "reviewed latest detail" },
    });
    fireEvent.click(view.getByRole("checkbox"));
    fireEvent.click(view.getByRole("button", { name: "Correct gift amount" }));

    await view.findByText("Operation completed.");
    const actionCalls = fetchMock.mock.calls.filter(([url]) =>
      String(url).includes("/actions"),
    );
    expect(actionCalls).toHaveLength(1);
    const retryBody = JSON.parse(
      (actionCalls[0]![1] as RequestInit).body as string,
    );
    expect(retryBody.expectedRevision).toBe("2026-05-02T00:00:00.000Z#1");
  });

  it("preserves a draft and offers recovery when the server rejects a stale save", async () => {
    const donationId = "00000000-0000-4000-8000-0000000000ac";
    const detail = makeDetail({
      id: donationId,
      revision: "2026-05-01T00:00:00.000Z#0",
    });
    const onClose = vi.fn();
    const fetchMock = vi
      .fn()
      .mockImplementation(async (url: string, init?: RequestInit) => {
        if (String(url).includes("/actions")) {
          return {
            ok: false,
            status: 409,
            init,
            json: async () => ({
              error:
                "This gift changed since you loaded it. Reload the latest detail, review the changes, and submit the correction again.",
            }),
          };
        }
        return {
          ok: true,
          json: async () => ({ contribution: detail }),
        };
      });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = render(
      <QueryProvider>
        <ContributionOperationShell
          open
          onClose={onClose}
          operation={OPERATION_DEFINITIONS.amount_correction!}
          donationId={donationId}
          sourceSurface="donor_crm_record"
        />
      </QueryProvider>,
    );

    await view.findByText("$250.00");
    fireEvent.change(view.getByLabelText("Amount (USD)"), {
      target: { value: "150" },
    });
    fireEvent.change(view.getByLabelText("Reason"), {
      target: { value: "fix stale gift" },
    });
    fireEvent.click(view.getByRole("checkbox"));
    fireEvent.click(view.getByRole("button", { name: "Correct gift amount" }));

    expect(await view.findByText(/changed since you loaded/i)).toBeTruthy();
    expect(
      (view.getByLabelText("Amount (USD)") as HTMLInputElement).value,
    ).toBe("150");
    expect(
      view.getByRole("button", { name: "Reload latest gift" }),
    ).toBeTruthy();
    fireEvent.click(view.getByRole("button", { name: "Discard draft" }));
    expect(onClose).toHaveBeenCalledOnce();

    const actionCall = fetchMock.mock.calls.find(([url]) =>
      String(url).includes("/actions"),
    );
    const body = JSON.parse((actionCall![1] as RequestInit).body as string);
    expect(body.expectedRevision).toBe("2026-05-01T00:00:00.000Z#0");
  });

  it("refreshes an active Hub consumer after a CRM operation succeeds", async () => {
    const donationId = "00000000-0000-4000-8000-0000000000ad";
    const detail = makeDetail({ id: donationId });
    detail.shared = { ...detail.shared, donationId };
    let hubFetchCount = 0;
    const fetchMock = vi
      .fn()
      .mockImplementation(async (url: string, init?: RequestInit) => {
        // The hub list loads page by page (`?limit=100&after=…`).
        if (
          new URL(url, "http://localhost").pathname ===
          "/api/admin/contributions"
        ) {
          hubFetchCount += 1;
          return {
            ok: true,
            json: async () => ({
              rows: [
                {
                  id: donationId,
                  amountCents: hubFetchCount === 1 ? 25_000 : 20_000,
                },
              ],
            }),
          };
        }
        if (url.includes("/actions")) {
          return {
            ok: true,
            init,
            json: async () => ({
              result: {
                auditEventId: "audit-cross-surface",
                approvalStatus: "applied",
                taskIds: [],
                canonicalContribution: {},
              },
            }),
          };
        }
        return {
          ok: true,
          json: async () => ({ contribution: detail }),
        };
      });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = render(
      <QueryProvider>
        <HubAmountProbe />
        <ContributionOperationShell
          open
          onClose={vi.fn()}
          operation={OPERATION_DEFINITIONS.amount_correction!}
          donationId={donationId}
          sourceSurface="donor_crm_record"
        />
      </QueryProvider>,
    );

    expect(await view.findByText("Hub amount: 25000")).toBeTruthy();
    await view.findByText("$250.00");
    fireEvent.change(view.getByLabelText("Amount (USD)"), {
      target: { value: "200" },
    });
    fireEvent.change(view.getByLabelText("Reason"), {
      target: { value: "correct shared amount" },
    });
    fireEvent.click(view.getByRole("checkbox"));
    fireEvent.click(view.getByRole("button", { name: "Correct gift amount" }));

    expect(await view.findByText("Operation completed.")).toBeTruthy();
    expect(await view.findByText("Hub amount: 20000")).toBeTruthy();
    expect(hubFetchCount).toBeGreaterThanOrEqual(2);
  });

  it("renders receipt delivery options with inline blocked reasons", async () => {
    const donationId = "00000000-0000-4000-8000-0000000000dd";
    const fetchMock = fetchMockForShell(
      {
        auditEventId: "audit-1",
        approvalStatus: "applied",
        taskIds: [],
        canonicalContribution: {},
      },
      makeReceiptDeliveryDetail(donationId),
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
      await view.findByText(
        /this correction changes receipt fields: amount/i,
        {},
        { timeout: 10_000 },
      ),
    ).toBeTruthy();

    const emailRadio = view.getByRole("radio", {
      name: /send updated receipt by email/i,
    });
    const pdfRadio = view.getByRole("radio", {
      name: /generate updated receipt pdf/i,
    });
    const deferRadio = view.getByRole("radio", {
      name: /don't send now \(defer with reason\)/i,
    });

    // The blocked option stays visible with its reason inline beneath it.
    expect(
      view.getByText("The donor has no email address on file."),
    ).toBeTruthy();

    // No choice is pre-selected: delivery is an explicit human decision
    // (a silently pre-filled default must never email a donor untouched).
    expect(pdfRadio.getAttribute("aria-checked")).toBe("false");
    expect(deferRadio.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(pdfRadio);
    expect(pdfRadio.getAttribute("aria-checked")).toBe("true");

    // Clicking the blocked option does not select it.
    fireEvent.click(emailRadio);
    expect(emailRadio.getAttribute("aria-checked")).toBe("false");
    expect(pdfRadio.getAttribute("aria-checked")).toBe("true");
  });

  it("submits no receipt delivery when the field is left untouched", async () => {
    const donationId = "00000000-0000-4000-8000-0000000000ef";
    const fetchMock = fetchMockForShell(
      {
        auditEventId: "audit-9",
        adjustmentId: "adj-9",
        approvalStatus: "applied",
        taskIds: [],
        canonicalContribution: {},
      },
      makeReceiptDeliveryDetail(donationId),
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

    await view.findByText(
      /this correction changes receipt fields: amount/i,
      {},
      { timeout: 10_000 },
    );
    fireEvent.change(view.getByLabelText("Amount (USD)"), {
      target: { value: "150" },
    });
    fireEvent.change(view.getByLabelText("Reason"), {
      target: { value: "Donor reported the wrong amount" },
    });
    fireEvent.click(view.getByRole("checkbox"));
    fireEvent.click(view.getByRole("button", { name: "Correct gift amount" }));

    await view.findByTestId("operation-result-panel");

    // Regression (#263 verification): an untouched delivery field must not
    // ride along in the payload — the server records deferred-by-omission
    // and no donor email is ever triggered by a silent default.
    const actionCall = fetchMock.mock.calls.find(([url]) =>
      String(url).includes("/actions"),
    );
    const body = JSON.parse((actionCall![1] as RequestInit).body as string);
    expect(body.payload.receiptDelivery).toBeUndefined();
  });

  it("requires a defer reason and submits the receipt delivery selection", async () => {
    const donationId = "00000000-0000-4000-8000-0000000000ee";
    const fetchMock = fetchMockForShell(
      {
        auditEventId: "audit-2",
        adjustmentId: "adj-1",
        approvalStatus: "applied",
        taskIds: [],
        canonicalContribution: {},
      },
      makeReceiptDeliveryDetail(donationId),
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

    await view.findByText(
      /this correction changes receipt fields: amount/i,
      {},
      { timeout: 10_000 },
    );
    fireEvent.change(view.getByLabelText("Amount (USD)"), {
      target: { value: "200" },
    });
    fireEvent.change(view.getByLabelText("Reason"), {
      target: { value: "Donor reported the wrong amount" },
    });
    fireEvent.click(view.getByRole("checkbox"));

    // Defer requires a reason while the tenant policy demands one.
    fireEvent.click(view.getByRole("radio", { name: /don't send now/i }));
    const submit = view.getByRole("button", { name: "Correct gift amount" });
    expect(submit).toHaveProperty("disabled", true);
    expect(
      view.getByText(
        /a reason is required when deferring the updated receipt/i,
      ),
    ).toBeTruthy();

    fireEvent.change(view.getByLabelText("Defer reason"), {
      target: { value: "Donor asked us to wait" },
    });
    expect(submit).toHaveProperty("disabled", false);
    fireEvent.click(submit);

    await view.findByTestId("operation-result-panel");
    const actionCall = fetchMock.mock.calls.find(([url]) =>
      String(url).includes("/actions"),
    );
    const body = JSON.parse((actionCall![1] as RequestInit).body as string);
    expect(body.payload).toMatchObject({
      amount: 20_000,
      receiptDelivery: {
        choice: "defer",
        deferReason: "Donor asked us to wait",
      },
    });
  });

  it("shows a PDF download link when the result generated an updated receipt", async () => {
    const donationId = "00000000-0000-4000-8000-0000000000ff";
    const fetchMock = fetchMockForShell(
      {
        auditEventId: "audit-3",
        adjustmentId: "adj-2",
        approvalStatus: "applied",
        receiptOutcome: {
          status: "pdf_generated",
          reason: null,
          snapshotId: "snap-9",
          affectedFields: ["amount"],
          requested: { choice: "pdf", deferReason: null },
          confirmed: { choice: "pdf", deferReason: null },
        },
        taskIds: [],
        canonicalContribution: {},
      },
      makeReceiptDeliveryDetail(donationId),
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

    await view.findByText(
      /this correction changes receipt fields: amount/i,
      {},
      { timeout: 10_000 },
    );
    fireEvent.change(view.getByLabelText("Amount (USD)"), {
      target: { value: "200" },
    });
    fireEvent.change(view.getByLabelText("Reason"), {
      target: { value: "Donor reported the wrong amount" },
    });
    fireEvent.click(view.getByRole("checkbox"));
    // Explicitly choose PDF; it is submitted with the correction payload.
    fireEvent.click(
      view.getByRole("radio", { name: /generate updated receipt pdf/i }),
    );
    fireEvent.click(view.getByRole("button", { name: "Correct gift amount" }));

    await view.findByTestId("operation-result-panel");
    expect(view.getByText(/receipt: pdf generated/i)).toBeTruthy();
    const link = view.getByRole("link", {
      name: /download updated receipt pdf/i,
    });
    expect(link.getAttribute("href")).toBe(
      "/api/admin/contribution-operations/receipt-snapshots/snap-9/pdf",
    );

    const actionCall = fetchMock.mock.calls.find(([url]) =>
      String(url).includes("/actions"),
    );
    const body = JSON.parse((actionCall![1] as RequestInit).body as string);
    expect(body.payload.receiptDelivery).toEqual({
      choice: "pdf",
      deferReason: null,
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

  it("holds reason and confirmation errors until the staffer interacts, explaining the disabled submit", async () => {
    const { view } = renderRefundShell(
      "00000000-0000-4000-8000-0000000000d9",
      {},
    );

    await view.findByText("Refunded so far");
    const submit = view.getByRole("button", { name: "Refund gift" });
    expect(submit).toHaveProperty("disabled", true);
    // A fresh form is not an error: no red messages before any input.
    expect(
      view.queryByText("A reason is required for this operation."),
    ).toBeNull();
    expect(view.queryByText("Confirm the change to continue.")).toBeNull();
    expect(
      view.getByText("Add a reason and confirm the change to submit."),
    ).toBeTruthy();

    // Leaving the reason empty after visiting it shows the field error.
    const reason = view.getByLabelText("Reason");
    fireEvent.blur(reason);
    expect(
      view.getByText("A reason is required for this operation."),
    ).toBeTruthy();
    expect(reason.getAttribute("aria-invalid")).toBe("true");

    fireEvent.change(reason, { target: { value: "Donor asked for a refund" } });
    expect(view.getByText("Confirm the change to submit.")).toBeTruthy();
    const confirm = view.getByRole("checkbox");
    fireEvent.click(confirm);
    expect(submit).toHaveProperty("disabled", false);
    // Unchecking after checking is a real omission and is flagged inline.
    fireEvent.click(confirm);
    expect(view.getByText("Confirm the change to continue.")).toBeTruthy();
  });

  it("keeps the form in place, disabled, while the operation submits", async () => {
    const donationId = "00000000-0000-4000-8000-0000000000b2";
    const detail = makeReceiptDeliveryDetail(donationId);
    // The action request never settles, so the shell stays submitting.
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("/actions")) {
        return new Promise(() => {});
      }
      return { ok: true, json: async () => ({ contribution: detail }) };
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
          donationId={donationId}
          sourceSurface="donor_crm_record"
        />
      </QueryProvider>,
    );

    await view.findByText("$250.00", {}, { timeout: 10_000 });
    const amountInput = view.getByLabelText("Amount (USD)");
    fireEvent.change(amountInput, { target: { value: "200" } });
    fireEvent.change(view.getByLabelText("Reason"), {
      target: { value: "Donor reported the wrong amount" },
    });
    fireEvent.click(
      view.getByRole("radio", { name: /send updated receipt by email/i }),
    );
    fireEvent.click(view.getByRole("checkbox"));
    const submit = view.getByRole("button", { name: "Correct gift amount" });
    submit.focus();
    fireEvent.click(submit);

    await waitFor(() => expect(submit.getAttribute("aria-busy")).toBe("true"));
    const actionCalls = () =>
      fetchMock.mock.calls.filter(([url]) => String(url).includes("/actions"))
        .length;
    expect(actionCalls()).toBe(1);

    // The submit stays mounted and focused, says what it is doing, and
    // cannot fire again.
    expect(document.activeElement).toBe(submit);
    expect(submit.textContent).toContain("Submitting…");
    expect(submit.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(submit);
    expect(actionCalls()).toBe(1);

    // The draft stays readable but every field is disabled, including the
    // Base UI controls a native fieldset does not reach.
    expect(amountInput.isConnected).toBe(true);
    expect(amountInput.matches(":disabled")).toBe(true);
    expect(view.getByLabelText("Reason").matches(":disabled")).toBe(true);
    expect(view.getByRole("checkbox").hasAttribute("data-disabled")).toBe(true);
    for (const radio of view.getAllByRole("radio")) {
      expect(radio.hasAttribute("data-disabled")).toBe(true);
    }
    expect(view.getByRole("button", { name: "Cancel" })).toHaveProperty(
      "disabled",
      true,
    );

    // Progress is announced through the pinned row's live hint, and the
    // row is still the draft's last child.
    const row = submit.closest('[data-slot="operation-form-actions"]');
    expect(row?.querySelector('[aria-live="polite"]')?.textContent).toBe(
      "Submitting…",
    );
    expect(row?.nextElementSibling).toBeNull();
  });

  it("keeps the refund submit row pinned to the bottom of the scrolling dialog", async () => {
    const { view } = renderRefundShell(
      "00000000-0000-4000-8000-0000000000da",
      {},
    );

    await view.findByText("Refunded so far");
    const submit = view.getByRole("button", { name: "Refund gift" });
    // The row holding Cancel and the submit (and why it is disabled) stays
    // in view while a phone scrolls the long refund form above it.
    const row = submit.closest('[data-slot="operation-form-actions"]');
    expect(row).toBeTruthy();
    expect(row!.className.split(" ")).toEqual(
      expect.arrayContaining(["sticky", "-bottom-6", "bg-background"]),
    );
    expect(row!.textContent).toContain("Cancel");
    // It is the last thing in the dialog's scrolling content.
    expect(row!.nextElementSibling).toBeNull();
    // A field scrolled into view by keyboard focus must stop above the
    // pinned row, not under it (WCAG 2.4.11): every field before the row
    // keeps a bottom scroll margin of the row's height. The row itself is
    // left out, so focusing Cancel or the submit does not scroll.
    const draft = row!.parentElement;
    expect(draft!.className.split(" ")).toEqual(
      expect.arrayContaining([
        "[&>:not([data-slot=operation-form-actions])_*]:scroll-mb-48",
        "sm:[&>:not([data-slot=operation-form-actions])_*]:scroll-mb-28",
      ]),
    );
  });

  it("scrolls the focused field clear of the pinned row after focus moves and when the dialog resizes", async () => {
    // A field focused at one size can end up
    // under the pinned row after a rotation, a narrower window or a phone
    // keyboard shrinks the dialog; the browser's own focus scroll can also
    // stop it under the row.
    const observers: Array<{
      callback: ResizeObserverCallback;
      targets: Element[];
    }> = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        private entry: {
          callback: ResizeObserverCallback;
          targets: Element[];
        };
        constructor(callback: ResizeObserverCallback) {
          this.entry = { callback, targets: [] };
          observers.push(this.entry);
        }
        observe(target: Element) {
          this.entry.targets.push(target);
        }
        unobserve() {}
        disconnect() {}
      },
    );
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
    try {
      const { view } = renderRefundShell(
        "00000000-0000-4000-8000-0000000000db",
        {},
      );
      await view.findByText("Refunded so far");
      const dialog = view.getByTestId("contribution-operation-shell");
      const observer = observers.find((entry) =>
        entry.targets.includes(dialog),
      );
      expect(observer).toBeTruthy();

      const rect = (top: number, bottom: number) =>
        ({
          top,
          bottom,
          left: 0,
          right: 300,
          width: 300,
          height: bottom - top,
        }) as DOMRect;
      const row = dialog.querySelector<HTMLElement>(
        '[data-slot="operation-form-actions"]',
      )!;
      dialog.getBoundingClientRect = () => rect(0, 800);
      row.getBoundingClientRect = () => rect(640, 800);
      const popupScrollIntoView = vi.fn();
      dialog.scrollIntoView = popupScrollIntoView;
      dialog.focus({ preventScroll: true });
      observer!.callback([], {} as ResizeObserver);
      expect(popupScrollIntoView).not.toHaveBeenCalled();
      const amount = view.getByLabelText(/^Amount/) as HTMLInputElement;
      const scrollIntoView = vi.fn();
      amount.scrollIntoView = scrollIntoView;

      // Clear of the row: nothing moves.
      amount.getBoundingClientRect = () => rect(300, 340);
      amount.focus();
      frames.splice(0).forEach((frame) => frame(0));
      observer!.callback([], {} as ResizeObserver);
      expect(scrollIntoView).not.toHaveBeenCalled();

      // Under the row after the dialog resized: it is revealed. The field's
      // bottom scroll margin (the row's height) stops it above the row.
      amount.getBoundingClientRect = () => rect(650, 690);
      observer!.callback([], {} as ResizeObserver);
      expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });

      // Under the row after focus moved there: revealed once focus settles.
      scrollIntoView.mockClear();
      const reason = view.getByLabelText("Reason") as HTMLTextAreaElement;
      reason.scrollIntoView = scrollIntoView;
      reason.getBoundingClientRect = () => rect(700, 760);
      reason.focus();
      expect(scrollIntoView).not.toHaveBeenCalled();
      frames.splice(0).forEach((frame) => frame(0));
      expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });

      // Focus on the row's own buttons never scrolls the form.
      scrollIntoView.mockClear();
      const cancel = view.getByRole("button", { name: "Cancel" });
      cancel.scrollIntoView = scrollIntoView;
      cancel.getBoundingClientRect = () => rect(700, 740);
      cancel.focus();
      frames.splice(0).forEach((frame) => frame(0));
      expect(scrollIntoView).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("pins the title, donor line and close button flush with the padded dialog top", async () => {
    const { view } = renderRefundShell(
      "00000000-0000-4000-8000-0000000000dc",
      {},
    );
    await view.findByText("Refunded so far");
    const dialog = view.getByTestId("contribution-operation-shell");
    const header = dialog.querySelector<HTMLElement>(
      '[data-slot="operation-dialog-header"]',
    );
    expect(header).toBeTruthy();
    // Revealing a focused field on a phone scrolls the form, never the
    // header, whose gift identity says whose money this is.
    expect(header!.className.split(" ")).toEqual(
      expect.arrayContaining([
        "sticky",
        "-top-6",
        "-mt-6",
        "-mx-6",
        "bg-background",
      ]),
    );
    expect(dialog.classList.contains("p-6")).toBe(true);
    expect(dialog.classList.contains("p-0")).toBe(false);
    const title = view.getByRole("heading", { name: "Refund gift" });
    const identity = view.getByTestId("operation-gift-identity");
    // One Close: the dialog's own would scroll away with the form.
    const closes = within(dialog).getAllByRole("button", { name: "Close" });
    expect(closes).toHaveLength(1);
    for (const element of [title, identity, closes[0]!]) {
      expect(header!.contains(element)).toBe(true);
    }
    expect(header!.contains(view.getByLabelText(/^Amount/))).toBe(false);
  });

  it.each([false, true])(
    "opens a fieldless resend at the top with non-scrolling popup focus (cached detail: %s)",
    async (cached) => {
      const donationId = cached
        ? "00000000-0000-4000-8000-0000000000d1"
        : "00000000-0000-4000-8000-0000000000d2";
      const detail = makeDetail({ id: donationId });
      if (cached) {
        getQueryClient().setQueryData(
          contributionDetailQueryKey(donationId),
          detail,
        );
      }
      Object.defineProperty(globalThis, "fetch", {
        configurable: true,
        value: fetchMockForShell({}, detail),
      });
      // jsdom has no native focus scrolling. Model the browser's scroll
      // when Base UI focuses a child without preventScroll, which used to
      // leave the summary behind the pinned header before any staff input.
      const nativeFocus = HTMLElement.prototype.focus;
      const focus = vi
        .spyOn(HTMLElement.prototype, "focus")
        .mockImplementation(function (
          this: HTMLElement,
          options?: FocusOptions,
        ) {
          nativeFocus.call(this, options);
          const dialog = this.closest<HTMLElement>(
            '[data-testid="contribution-operation-shell"]',
          );
          if (dialog && !options?.preventScroll) {
            dialog.scrollTop = 24;
          }
        });
      const view = render(
        <QueryProvider>
          <ContributionOperationShell
            open
            onClose={vi.fn()}
            operation={OPERATION_DEFINITIONS.resend_receipt!}
            donationId={donationId}
            sourceSurface="donor_crm_record"
          />
        </QueryProvider>,
      );
      await view.findByText("$250.00");
      const dialog = view.getByTestId("contribution-operation-shell");
      await waitFor(() => expect(document.activeElement).toBe(dialog));
      expect(
        focus.mock.calls.some(
          ([options], index) =>
            focus.mock.contexts[index] === dialog &&
            options?.preventScroll === true,
        ),
      ).toBe(true);
      expect(dialog.scrollTop).toBe(0);
      expect(
        (
          view.getByRole("button", {
            name: "Resend receipt",
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(false);
    },
  );

  it("opens a refund on the popup without jumping past the gift summary to Amount", async () => {
    const { view } = renderRefundShell(
      "00000000-0000-4000-8000-0000000000df",
      {},
    );
    await view.findByText("Refunded so far");
    const dialog = view.getByTestId("contribution-operation-shell");
    await waitFor(() => expect(document.activeElement === dialog).toBe(true));
  });

  it("does not snap a staffer who scrolled away back to the focused field on resize", async () => {
    const observers: Array<{
      callback: ResizeObserverCallback;
      targets: Element[];
    }> = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        private entry: {
          callback: ResizeObserverCallback;
          targets: Element[];
        };
        constructor(callback: ResizeObserverCallback) {
          this.entry = { callback, targets: [] };
          observers.push(this.entry);
        }
        observe(target: Element) {
          this.entry.targets.push(target);
        }
        unobserve() {}
        disconnect() {}
      },
    );
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
    try {
      const { view } = renderRefundShell(
        "00000000-0000-4000-8000-0000000000dd",
        {},
      );
      await view.findByText("Refunded so far");
      const dialog = view.getByTestId("contribution-operation-shell");
      const observer = observers.find((entry) =>
        entry.targets.includes(dialog),
      );
      expect(observer).toBeTruthy();
      const rect = (top: number, bottom: number) =>
        ({
          top,
          bottom,
          left: 0,
          right: 300,
          width: 300,
          height: bottom - top,
        }) as DOMRect;
      const row = dialog.querySelector<HTMLElement>(
        '[data-slot="operation-form-actions"]',
      )!;
      dialog.getBoundingClientRect = () => rect(0, 800);
      row.getBoundingClientRect = () => rect(640, 800);
      const amount = view.getByLabelText(/^Amount/) as HTMLInputElement;
      const scrollIntoView = vi.fn();
      amount.scrollIntoView = scrollIntoView;
      amount.getBoundingClientRect = () => rect(300, 340);
      amount.focus();
      frames.splice(0).forEach((frame) => frame(0));

      // The staffer scrolls up to re-read the summary; Amount keeps focus
      // and ends up below the row. A later resize must leave them there.
      fireEvent.wheel(dialog, { deltaY: -200 });
      amount.getBoundingClientRect = () => rect(900, 940);
      observer!.callback([], {} as ResizeObserver);
      expect(scrollIntoView).not.toHaveBeenCalled();

      // Moving focus again is a new request to see the field.
      const reason = view.getByLabelText("Reason") as HTMLTextAreaElement;
      reason.scrollIntoView = scrollIntoView;
      reason.getBoundingClientRect = () => rect(700, 760);
      reason.focus();
      frames.splice(0).forEach((frame) => frame(0));
      expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("scrolls a focused field out from under the pinned header", async () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
    try {
      const { view } = renderRefundShell(
        "00000000-0000-4000-8000-0000000000de",
        {},
      );
      await view.findByText("Refunded so far");
      const dialog = view.getByTestId("contribution-operation-shell");
      const rect = (top: number, bottom: number) =>
        ({
          top,
          bottom,
          left: 0,
          right: 300,
          width: 300,
          height: bottom - top,
        }) as DOMRect;
      const header = dialog.querySelector<HTMLElement>(
        '[data-slot="operation-dialog-header"]',
      )!;
      const row = dialog.querySelector<HTMLElement>(
        '[data-slot="operation-form-actions"]',
      )!;
      dialog.getBoundingClientRect = () => rect(0, 800);
      header.getBoundingClientRect = () => rect(0, 120);
      row.getBoundingClientRect = () => rect(640, 800);
      dialog.scrollTop = 400;
      const amount = view.getByLabelText(/^Amount/) as HTMLInputElement;
      const scrollIntoView = vi.fn();
      amount.scrollIntoView = scrollIntoView;
      // Half hidden under the header (it ends at 120).
      amount.getBoundingClientRect = () => rect(100, 140);
      amount.focus();
      frames.splice(0).forEach((frame) => frame(0));

      // Scrolled up by the covered part plus a small gap; scrollIntoView
      // would have stopped it under the header.
      expect(dialog.scrollTop).toBe(372);
      expect(scrollIntoView).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("refunds exactly the cents typed, with or without a dollar sign", async () => {
    const { fetchMock, view } = renderRefundShell(
      "00000000-0000-4000-8000-0000000000e1",
      {},
    );
    await submitRefund(view, "$150.10");
    const actionCall = fetchMock.mock.calls.find(([url]) =>
      String(url).includes("/actions"),
    );
    const body = JSON.parse((actionCall![1] as RequestInit).body as string);
    expect(body.payload).toMatchObject({ amount: 15_010 });
  });

  it("refuses amount text that is not one whole amount instead of reading part of it", async () => {
    const { view } = renderRefundShell(
      "00000000-0000-4000-8000-0000000000e2",
      {},
    );
    await view.findByText("Refunded so far");
    const amountInput = view.getByLabelText("Amount (USD)");
    for (const text of ["60abc", "1,00", "0.005"]) {
      fireEvent.change(amountInput, { target: { value: text } });
      expect(view.getByText("Enter a valid amount.")).toBeTruthy();
      expect(amountInput.getAttribute("aria-invalid")).toBe("true");
    }
    // A whole amount within the refundable $200.00 is accepted.
    fireEvent.change(amountInput, { target: { value: "$100.00" } });
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

  describe("destination fund picker", () => {
    const TENANT_ID = "00000000-0000-4000-8000-0000000000e1";

    function fundCorrectionDetail(donationId: string) {
      const baseDetail = makeDetail({
        actionAvailability: [
          {
            actionType: "fund_correction",
            available: true,
            blockedReason: null,
            nextStep: null,
            riskLevel: "high",
          },
        ],
      });
      return {
        ...baseDetail,
        id: donationId,
        tenantId: TENANT_ID,
        shared: { ...baseDetail.shared, donationId },
      };
    }

    function fundFetchMock(
      detail: ReturnType<typeof fundCorrectionDetail>,
      fundsResponse: (url: URL) => { ok: boolean; body: unknown },
    ) {
      return vi
        .fn()
        .mockImplementation(async (url: string, init?: RequestInit) => {
          const href = String(url);
          if (href.startsWith("/api/admin/funds")) {
            const result = fundsResponse(new URL(href, "http://admin.test"));
            return {
              ok: result.ok,
              status: result.ok ? 200 : 500,
              json: async () => result.body,
              text: async () => JSON.stringify(result.body),
              headers: new Headers({ "content-type": "application/json" }),
            };
          }
          if (href.includes("/actions")) {
            return {
              ok: true,
              json: async () => ({
                result: {
                  auditEventId: "audit-fund",
                  adjustmentId: "adj-fund",
                  approvalStatus: "applied",
                  taskIds: [],
                  canonicalContribution: {},
                },
              }),
              init,
            };
          }
          return { ok: true, json: async () => ({ contribution: detail }) };
        });
    }

    function renderFundShell(donationId: string) {
      return render(
        <QueryProvider>
          <ContributionOperationShell
            open
            onClose={vi.fn()}
            operation={OPERATION_DEFINITIONS.fund_correction!}
            donationId={donationId}
            sourceSurface="donor_crm_record"
          />
        </QueryProvider>,
      );
    }

    it.each([false, true])(
      "opens a fund correction at the summary without focusing Reason (cached detail: %s)",
      async (cached) => {
        const donationId = cached
          ? "00000000-0000-4000-8000-000000000fa1"
          : "00000000-0000-4000-8000-000000000fa2";
        const detail = {
          ...fundCorrectionDetail(donationId),
          receiptDelivery: makeReceiptDelivery(),
        };
        if (cached) {
          getQueryClient().setQueryData(
            contributionDetailQueryKey(donationId),
            detail,
          );
        }
        const baseFetch = fundFetchMock(detail, () => ({
          ok: true,
          body: {
            funds: [
              {
                id: "fund-2",
                name: "Martinez Family Support",
                tenant_id: TENANT_ID,
              },
            ],
          },
        }));
        let releaseDetail!: () => void;
        const detailReady = new Promise<void>((resolveDetail) => {
          releaseDetail = resolveDetail;
        });
        const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
          if (url === "/api/admin/contribution-operations/" + donationId) {
            await detailReady;
          }
          return baseFetch(url, init);
        });
        Object.defineProperty(globalThis, "fetch", {
          configurable: true,
          value: fetchMock,
        });
        const nativeFocus = HTMLElement.prototype.focus;
        const focus = vi
          .spyOn(HTMLElement.prototype, "focus")
          .mockImplementation(function (
            this: HTMLElement,
            options?: FocusOptions,
          ) {
            nativeFocus.call(this, options);
            const dialog = this.closest<HTMLElement>(
              '[data-testid="contribution-operation-shell"]',
            );
            if (dialog && this.matches("textarea") && !options?.preventScroll) {
              dialog.scrollTop = 439;
            }
          });
        const view = renderFundShell(donationId);
        const dialog = view.getByTestId("contribution-operation-shell");
        try {
          if (!cached) {
            await waitFor(() => expect(document.activeElement).toBe(dialog));
            expect(view.queryByText("Current amount")).toBeNull();
          }
          releaseDetail();
          await view.findByText("Current amount");
          await view.findByRole("combobox", { name: "Destination fund" });
          await waitFor(() => expect(document.activeElement).toBe(dialog));
          expect(dialog.scrollTop).toBe(0);
          expect(
            focus.mock.calls.some(
              ([options], index) =>
                focus.mock.contexts[index] === dialog &&
                options?.preventScroll === true,
            ),
          ).toBe(true);
          expect(
            fetchMock.mock.calls.some(([url]) => url.includes("/actions")),
          ).toBe(false);
        } finally {
          releaseDetail();
        }
      },
    );

    it("chooses the destination fund by name from the gift's own funds and submits its id", async () => {
      const donationId = "00000000-0000-4000-8000-0000000000f1";
      const detail = fundCorrectionDetail(donationId);
      const fetchMock = fundFetchMock(detail, () => ({
        ok: true,
        body: {
          funds: [
            {
              id: "fund-1",
              name: "Clean Water Initiative",
              tenant_id: TENANT_ID,
            },
            {
              id: "fund-2",
              name: "Martinez Family Support",
              tenant_id: TENANT_ID,
            },
            {
              id: "fund-9",
              name: "Another Organization Fund",
              tenant_id: "00000000-0000-4000-8000-0000000000e2",
            },
          ],
        },
      }));
      Object.defineProperty(globalThis, "fetch", {
        configurable: true,
        value: fetchMock,
      });

      const view = renderFundShell(donationId);

      const picker = await view.findByRole(
        "combobox",
        { name: "Destination fund" },
        { timeout: 10_000 },
      );
      await waitFor(() =>
        expect(picker.textContent).toContain("Choose a fund"),
      );
      // The directory is asked for this gift's organization only.
      const fundsCall = fetchMock.mock.calls.find(([url]) =>
        String(url).startsWith("/api/admin/funds"),
      );
      const fundsUrl = new URL(String(fundsCall![0]), "http://admin.test");
      expect(fundsUrl.searchParams.get("tenantId")).toBe(TENANT_ID);

      fireEvent.click(picker);
      const search = await view.findByRole("combobox", {
        name: "Search funds",
      });
      // The gift's current fund and other organizations' funds are never
      // offered.
      expect(
        view.queryByRole("option", { name: "Clean Water Initiative" }),
      ).toBeNull();
      expect(
        view.queryByRole("option", { name: "Another Organization Fund" }),
      ).toBeNull();
      fireEvent.change(search, { target: { value: "Martinez" } });
      await view.findByRole("option", { name: "Martinez Family Support" });
      fireEvent.keyDown(search, { key: "ArrowDown" });
      fireEvent.keyDown(search, { key: "Enter" });
      await waitFor(() =>
        expect(picker.textContent).toContain("Martinez Family Support"),
      );

      fireEvent.change(view.getByLabelText("Reason"), {
        target: { value: "Donor asked to support the Martinez family" },
      });
      fireEvent.click(view.getByRole("checkbox"));
      fireEvent.click(
        view.getByRole("button", { name: "Correct fund designation" }),
      );

      await view.findByTestId("operation-result-panel");
      const actionCall = fetchMock.mock.calls.find(([url]) =>
        String(url).includes("/actions"),
      );
      const body = JSON.parse((actionCall![1] as RequestInit).body as string);
      expect(body.actionType).toBe("fund_correction");
      expect(body.payload).toEqual({ fundId: "fund-2" });
    });

    it("pages through the whole directory so funds past the first page can be chosen", async () => {
      const donationId = "00000000-0000-4000-8000-0000000000f2";
      const detail = fundCorrectionDetail(donationId);
      const fetchMock = fundFetchMock(detail, (url) => {
        const offset = Number(url.searchParams.get("offset") ?? "0");
        const limit = Number(url.searchParams.get("limit"));
        const funds =
          offset === 0
            ? Array.from({ length: limit }, (_, index) => ({
                id: `fund-page-${index}`,
                name: `Aardvark fund ${index}`,
                tenant_id: TENANT_ID,
              }))
            : [
                {
                  id: "fund-late",
                  name: "Zebra Relief",
                  tenant_id: TENANT_ID,
                },
              ];
        return { ok: true, body: { funds } };
      });
      Object.defineProperty(globalThis, "fetch", {
        configurable: true,
        value: fetchMock,
      });

      const view = renderFundShell(donationId);
      const picker = await view.findByRole(
        "combobox",
        { name: "Destination fund" },
        { timeout: 10_000 },
      );
      await waitFor(() =>
        expect(picker.textContent).toContain("Choose a fund"),
      );
      fireEvent.click(picker);
      const search = await view.findByRole("combobox", {
        name: "Search funds",
      });
      fireEvent.change(search, { target: { value: "Zebra" } });
      expect(
        await view.findByRole("option", { name: "Zebra Relief" }),
      ).toBeTruthy();
      const offsets = fetchMock.mock.calls
        .map(([url]) => String(url))
        .filter((url) => url.startsWith("/api/admin/funds"))
        .map((url) =>
          new URL(url, "http://admin.test").searchParams.get("offset"),
        );
      expect(offsets).toEqual(["0", "200"]);
    });

    it("says when funds could not load and offers to try again", async () => {
      const donationId = "00000000-0000-4000-8000-0000000000f3";
      const detail = fundCorrectionDetail(donationId);
      let fail = true;
      const fetchMock = fundFetchMock(detail, () =>
        fail
          ? { ok: false, body: { error: "private database details" } }
          : {
              ok: true,
              body: {
                funds: [
                  {
                    id: "fund-2",
                    name: "Martinez Family Support",
                    tenant_id: TENANT_ID,
                  },
                ],
              },
            },
      );
      Object.defineProperty(globalThis, "fetch", {
        configurable: true,
        value: fetchMock,
      });

      const view = renderFundShell(donationId);
      expect(
        await view.findByText("Couldn’t load funds.", {}, { timeout: 10_000 }),
      ).toBeTruthy();
      expect(view.queryByText(/private database details/)).toBeNull();
      const picker = view.getByRole("combobox", { name: "Destination fund" });
      expect(picker.hasAttribute("data-disabled")).toBe(true);

      fail = false;
      fireEvent.click(view.getByRole("button", { name: "Try again" }));
      await waitFor(() =>
        expect(view.queryByText("Couldn’t load funds.")).toBeNull(),
      );
      await waitFor(() =>
        expect(picker.textContent).toContain("Choose a fund"),
      );
    });
  });
});
