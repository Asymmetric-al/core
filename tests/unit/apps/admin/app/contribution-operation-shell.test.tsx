/** @vitest-environment jsdom */

import { getQueryClient, QueryProvider } from "@asym/database/providers";
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ContributionOperationShell,
  OPERATION_DEFINITIONS,
} from "../../../../../apps/admin/app/contributions/operation-shell";
import { contributionDetailQueryKey } from "../../../../../apps/admin/app/contributions/contribution-detail-overlay";
import { useAdminContributions } from "../../../../../apps/admin/app/contributions/use-admin-contributions";

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
    const sendReceipt = view.getByRole("button", { name: "Send receipt" });
    await waitFor(() =>
      expect((sendReceipt as HTMLButtonElement).disabled).toBe(false),
    );
    fireEvent.click(sendReceipt);

    await view.findByTestId("operation-result-panel");
    // The receipt outcome from the shared result renders as a result line.
    expect(view.getByText("Receipt: sent")).toBeTruthy();
    const actionCall = fetchMock.mock.calls.find(([url]) =>
      String(url).includes("/actions"),
    );
    const body = JSON.parse((actionCall![1] as RequestInit).body as string);
    expect(body.stagedGiftId).toBe("staged-1");
    expect(body.payload).toEqual({});
  });

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

    await view.findByText("$250.00");
    const sendReceipt = view.getByRole("button", { name: "Send receipt" });
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
        if (url === "/api/admin/contributions") {
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
      await view.findByText(/this correction changes receipt fields: amount/i),
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

    await view.findByText(/this correction changes receipt fields: amount/i);
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

    await view.findByText(/this correction changes receipt fields: amount/i);
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

    await view.findByText(/this correction changes receipt fields: amount/i);
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
});
