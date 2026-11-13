/** @vitest-environment jsdom */
/** @vitest-environment-options {"url": "http://localhost/"} */

import { readFileSync } from "node:fs";
// This test runs under the jsdom environment, whose global `URL` rewrites
// `file:` bases into the Vite dev server's `http://localhost/@fs/...` form;
// `readFileSync` then rejects that on Windows ("The URL must be of scheme
// file"). Alias Node's own `URL` so source-file reads use a real `file:` URL.
import { URL as NodeURL, fileURLToPath } from "node:url";

import { QueryProvider } from "@asym/database/providers";
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  ContributionBatchApiResponse,
  ContributionBatchStatus,
} from "@asym/api/admin/contribution-batches";
import type { ContributionGridRow as Contribution } from "@asym/api/admin/contributions/types";

const toastErrorMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastWarningMock = vi.fn();
const onBulkReceiptSuccessMock = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    error: toastErrorMock,
    success: toastSuccessMock,
    warning: toastWarningMock,
    info: vi.fn(),
  },
}));

const root = new NodeURL("../../../../../", import.meta.url);
// Loaded after the mocks above are registered; tests may not import
// apps/admin statically, so the loader's return type supplies the types.
const loadMainBodyModule = () =>
  import("../../../../../apps/admin/app/(app)/contributions/main-body");
type MainBodyModule = Awaited<ReturnType<typeof loadMainBodyModule>>;
type ContributionsMainBodyComponent = MainBodyModule["ContributionsMainBody"];
type ContributionsPageActionsComponent =
  MainBodyModule["ContributionsPageActions"];
let ContributionsMainBody: ContributionsMainBodyComponent;
let ContributionsPageActions: ContributionsPageActionsComponent;
let confirmDescriptor: PropertyDescriptor | undefined;
let cryptoDescriptor: PropertyDescriptor | undefined;
let customEventDescriptor: PropertyDescriptor | undefined;
let eventTargetDescriptor: PropertyDescriptor | undefined;
let fetchDescriptor: PropertyDescriptor | undefined;
let windowConfirmDescriptor: PropertyDescriptor | undefined;

function readRepoFile(path: string) {
  return readFileSync(fileURLToPath(new NodeURL(path, root)), "utf8");
}

function makeContribution(overrides: Partial<Contribution> = {}): Contribution {
  return {
    shared: {
      donationId: "00000000-0000-4000-8000-000000000001",
      amountCents: 10000,
      currencyCode: "USD",
      giftDate: "2026-05-30T00:00:00.000Z",
      donorId: "donor_1",
      donorName: "Ada Lovelace",
      designationSummary: {
        fundId: "fund_1",
        fundName: "General Fund",
        missionaryId: null,
        missionaryName: null,
        lineCount: 1,
      },
      paymentStatus: "completed",
      receiptStatus: "pending",
      crmPostStatus: null,
      refundState: "none",
      refundedAmountCents: 0,
      correctionState: "none",
      recurringLinkState: "none",
    },
    id: "00000000-0000-4000-8000-000000000001",
    donorId: "donor_1",
    donorName: "Ada Lovelace",
    donorEmail: "ada@example.com",
    donorAvatar: null,
    donorType: null,
    donorPhone: null,
    donorLocation: null,
    organizationName: null,
    amount: 10000,
    amountGross: 10000,
    amountNet: null,
    amountFee: null,
    amountTaxDeductible: null,
    currency: "USD",
    date: "2026-05-30T00:00:00.000Z",
    contributionDate: "2026-05-30T00:00:00.000Z",
    createdAt: "2026-05-30T00:00:00.000Z",
    updatedAt: "2026-05-30T00:00:00.000Z",
    settlementDate: null,
    depositDate: null,
    status: "completed",
    subStatus: null,
    type: "One-time",
    paymentMethod: "Credit Card",
    source: "Online",
    fundId: "fund_1",
    fundCode: "GENERAL",
    fundName: "General Fund",
    missionaryId: null,
    missionaryName: null,
    campaignId: null,
    receiptStatus: "pending",
    receiptSent: false,
    receiptSentAt: null,
    stagedGiftId: "00000000-0000-4000-8000-000000000101",
    stagedGiftStatus: "ready_to_post",
    stagedGiftReviewReason: null,
    crmPostStatus: null,
    annualStatementEligible: true,
    entryMethod: "api",
    reconciliationStatus: "unreconciled",
    transactionId: "pi_1",
    externalTransactionId: null,
    processorTransactionId: "pi_1",
    notes: null,
    notesPreview: null,
    isAnonymous: false,
    ...overrides,
  };
}

function renderMainBody(rows: Contribution[]) {
  const view = render(
    <ContributionsMainBody
      data={rows}
      isLoading={false}
      onSelectContribution={vi.fn()}
      onBulkReceiptSuccess={onBulkReceiptSuccessMock}
    />,
  );
  // Ctrl/Cmd+A on a row selects every gift across pages (shared grid
  // keyboard contract), so bulk actions act on all rendered fixtures.
  const firstPrimary = view.container.querySelector<HTMLElement>(
    "[data-grid-row-primary]",
  );
  if (firstPrimary) {
    firstPrimary.focus();
    fireEvent.keyDown(firstPrimary, { key: "a", ctrlKey: true });
  }
  return view;
}

const BULK_RECEIPTS_ACTION = "Send receipts…";

function renderPageActions(canManageContributions?: boolean) {
  return render(
    <QueryProvider>
      <ContributionsPageActions
        canManageContributions={canManageContributions}
      />
    </QueryProvider>,
  );
}

const persistedBatchId = "batch_9";
const persistedBatchProcessHref = `/api/admin/contribution-batches/${persistedBatchId}/process`;

function makeBatchResponse(
  overrides: {
    status?: ContributionBatchStatus;
    processed?: number;
    succeeded?: number;
    skipped?: number;
    failed?: number;
    followUpTasksCreated?: number;
    includeNextAction?: boolean;
  } = {},
): ContributionBatchApiResponse {
  return {
    batch: {
      id: persistedBatchId,
      status: overrides.status ?? "complete",
      executionMode: "background",
      summary: {
        processed: overrides.processed ?? 0,
        succeeded: overrides.succeeded ?? 0,
        skipped: overrides.skipped ?? 0,
        failed: overrides.failed ?? 0,
        followUpTasksCreated: overrides.followUpTasksCreated ?? 0,
      },
    },
    nextAction: overrides.includeNextAction
      ? { method: "POST", href: persistedBatchProcessHref }
      : undefined,
  };
}

function okBatchResponse(
  overrides: Parameters<typeof makeBatchResponse>[0] = {},
) {
  return {
    ok: true,
    json: async () => makeBatchResponse(overrides),
  };
}

function stubBatchFetch() {
  const fetchMock = vi.fn().mockResolvedValue(
    okBatchResponse({
      processed: 2,
      succeeded: 2,
    }),
  );
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: fetchMock,
  });
  return fetchMock;
}

beforeEach(async () => {
  // Vitest owns the jsdom Window; its document getter cannot be replaced.
  document.body.replaceChildren();
  confirmDescriptor = Object.getOwnPropertyDescriptor(globalThis, "confirm");
  cryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  customEventDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "CustomEvent",
  );
  eventTargetDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "EventTarget",
  );
  fetchDescriptor = Object.getOwnPropertyDescriptor(globalThis, "fetch");

  globalThis.requestAnimationFrame = (callback) =>
    window.setTimeout(callback, 0);
  globalThis.cancelAnimationFrame = (id) => window.clearTimeout(id);
  Object.defineProperty(globalThis.window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  windowConfirmDescriptor =
    typeof window === "undefined"
      ? undefined
      : Object.getOwnPropertyDescriptor(window, "confirm");

  Object.defineProperty(globalThis, "confirm", {
    configurable: true,
    value: vi.fn(),
  });
  if (typeof window !== "undefined") {
    Object.defineProperty(window, "confirm", {
      configurable: true,
      value: vi.fn(),
    });
  }
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: {
      randomUUID: vi.fn(() => "confirmation-token"),
    },
  });
  const mainBodyModule = await loadMainBodyModule();
  ContributionsMainBody = mainBodyModule.ContributionsMainBody;
  ContributionsPageActions = mainBodyModule.ContributionsPageActions;
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  if (confirmDescriptor) {
    Object.defineProperty(globalThis, "confirm", confirmDescriptor);
  } else {
    Reflect.deleteProperty(globalThis, "confirm");
  }
  if (cryptoDescriptor) {
    Object.defineProperty(globalThis, "crypto", cryptoDescriptor);
  }
  if (customEventDescriptor) {
    Object.defineProperty(globalThis, "CustomEvent", customEventDescriptor);
  } else {
    Reflect.deleteProperty(globalThis, "CustomEvent");
  }
  if (eventTargetDescriptor) {
    Object.defineProperty(globalThis, "EventTarget", eventTargetDescriptor);
  } else {
    Reflect.deleteProperty(globalThis, "EventTarget");
  }
  if (fetchDescriptor) {
    Object.defineProperty(globalThis, "fetch", fetchDescriptor);
  } else {
    Reflect.deleteProperty(globalThis, "fetch");
  }
  if (typeof window !== "undefined") {
    if (windowConfirmDescriptor) {
      Object.defineProperty(window, "confirm", windowConfirmDescriptor);
    } else {
      Reflect.deleteProperty(window, "confirm");
    }
  }
});

describe("ContributionsMainBody bulk receipt confirmation", () => {
  it("opens an app dialog instead of calling native confirm", async () => {
    const view = renderMainBody([
      makeContribution(),
      makeContribution({
        id: "00000000-0000-4000-8000-000000000002",
        stagedGiftId: null,
      }),
    ]);

    fireEvent.click(view.getByRole("button", { name: BULK_RECEIPTS_ACTION }));

    expect(globalThis.confirm).not.toHaveBeenCalled();
    expect(window.confirm).not.toHaveBeenCalled();
    expect(await view.findByRole("alertdialog")).toBeTruthy();
    expect(view.getByText("Send receipts?")).toBeTruthy();
    expect(
      view.getByText(
        "Sends a receipt for each ready gift among 2 selected contributions.",
      ),
    ).toBeTruthy();
    expect(view.getByText("Selected contributions")).toBeTruthy();
    expect(view.getByText("Ready to send")).toBeTruthy();
    // Plain words for gifts the batch cannot receipt, not an internal id.
    expect(view.getByText("Will be skipped")).toBeTruthy();
    expect(view.queryByText(/staged gift id/i)).toBeNull();
  });

  it("cancels without posting the batch", async () => {
    const fetchMock = stubBatchFetch();
    const view = renderMainBody([makeContribution()]);

    fireEvent.click(view.getByRole("button", { name: BULK_RECEIPTS_ACTION }));
    fireEvent.click(await view.findByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(view.queryByRole("alertdialog")).toBeNull();
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts the existing contribution batch payload when confirmed", async () => {
    const fetchMock = stubBatchFetch();
    const rows = [
      makeContribution(),
      makeContribution({
        id: "00000000-0000-4000-8000-000000000002",
        receiptStatus: "failed",
        stagedGiftId: null,
      }),
    ];
    const view = renderMainBody(rows);

    fireEvent.click(view.getByRole("button", { name: BULK_RECEIPTS_ACTION }));
    fireEvent.click(await view.findByRole("button", { name: "Send receipts" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/contribution-batches",
        {
          body: JSON.stringify({
            actionType: "resend_receipt",
            confirmationToken: "confirmation-token",
            reason: "Bulk receipt resend requested from Contribution Hub.",
            // Only gifts the server would receipt are sent; the dialog
            // already listed the rest as skipped.
            records: [rows[0]].map((row) => ({
              id: row.id,
              receiptStatus: row.receiptStatus,
              stagedGiftId: row.stagedGiftId,
            })),
          }),
          headers: {
            "content-type": "application/json",
          },
          method: "POST",
        },
      );
    });
    expect(toastSuccessMock).toHaveBeenCalledWith("Sent 2 receipts.");
  });

  it("counts a gift whose payment has not completed as skipped, with the server's reason", async () => {
    const fetchMock = stubBatchFetch();
    const rows = [
      makeContribution(),
      makeContribution({
        id: "00000000-0000-4000-8000-000000000002",
        status: "pending",
        stagedGiftId: "00000000-0000-4000-8000-000000000102",
      }),
    ];
    const view = renderMainBody(rows);

    fireEvent.click(view.getByRole("button", { name: BULK_RECEIPTS_ACTION }));
    const dialog = await view.findByRole("alertdialog");

    const readyValue = view.getByText("Ready to send").nextElementSibling;
    const skippedValue = view.getByText("Will be skipped").nextElementSibling;
    expect(readyValue?.textContent).toBe("1");
    expect(skippedValue?.textContent).toBe("1");
    expect(dialog.textContent).toContain("The payment is not completed yet.");
    // Each reason reads as a skip, with a counted noun, not a bare number.
    const reasons = within(dialog).getByRole("list", {
      name: "Skipped, and why",
    });
    expect(within(dialog).getByText("Skipped, and why")).toBeTruthy();
    expect(within(reasons).getByRole("listitem").textContent).toBe(
      "The payment is not completed yet.1 gift",
    );

    fireEvent.click(view.getByRole("button", { name: "Send receipts" }));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    const body = JSON.parse(
      (fetchMock.mock.calls[0] as unknown as [string, { body: string }])[1]
        .body,
    ) as { records: Array<{ id: string }> };
    expect(body.records.map((record) => record.id)).toEqual([rows[0].id]);
  });

  it("does not resend a receipt that was already sent unless the admin opts in", async () => {
    const fetchMock = stubBatchFetch();
    const rows = [
      makeContribution(),
      makeContribution({
        id: "00000000-0000-4000-8000-000000000002",
        receiptStatus: "sent",
        receiptSent: true,
        stagedGiftId: "00000000-0000-4000-8000-000000000102",
      }),
    ];
    const view = renderMainBody(rows);

    fireEvent.click(view.getByRole("button", { name: BULK_RECEIPTS_ACTION }));
    const dialog = await view.findByRole("alertdialog");

    expect(
      view.getByText("Ready to send").nextElementSibling?.textContent,
    ).toBe("1");
    expect(view.getByText("Already sent").nextElementSibling?.textContent).toBe(
      "1",
    );
    expect(
      view.getByText("Will be skipped").nextElementSibling?.textContent,
    ).toBe("0");
    const resend = view.getByRole("checkbox", {
      name: /send another copy for 1 gift that already has a receipt/i,
    });
    expect(resend.getAttribute("aria-checked")).toBe("false");
    // One gift, one donor.
    expect(dialog.textContent).toContain(
      "If ticked, this donor will get a second copy.",
    );
    expect(dialog.textContent).not.toContain("these donors");

    fireEvent.click(view.getByRole("button", { name: "Send receipts" }));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    const body = JSON.parse(
      (fetchMock.mock.calls[0] as unknown as [string, { body: string }])[1]
        .body,
    ) as { records: Array<{ id: string }> };
    expect(body.records.map((record) => record.id)).toEqual([rows[0].id]);
  });

  it("includes already-sent receipts once the admin chooses to resend them", async () => {
    const fetchMock = stubBatchFetch();
    const rows = [
      makeContribution({
        receiptStatus: "sent",
        receiptSent: true,
      }),
    ];
    const view = renderMainBody(rows);

    fireEvent.click(view.getByRole("button", { name: BULK_RECEIPTS_ACTION }));
    // Nothing new to send until the admin opts in to the resend.
    const blocked = await view.findByRole("button", {
      name: "No new receipts to send",
    });
    expect((blocked as HTMLButtonElement).disabled).toBe(true);
    // With nothing ready, the only possible send is another copy, so the
    // dialog asks about a resend and does not promise a first receipt.
    const dialog = view.getByRole("alertdialog");
    expect(
      within(dialog).getByRole("heading", { name: "Resend receipts?" }),
    ).toBeTruthy();
    expect(dialog.textContent).not.toContain("Send receipts?");
    expect(dialog.textContent).not.toContain("ready gift");
    expect(dialog.textContent).toContain(
      "1 of 1 selected contribution already has a receipt, and none need a first one. Tick the box below to send another copy.",
    );

    fireEvent.click(
      view.getByRole("checkbox", {
        name: /send another copy for 1 gift that already has a receipt/i,
      }),
    );
    expect(dialog.textContent).toContain(
      "Sends another copy of the receipt for the 1 gift that already has one.",
    );
    fireEvent.click(view.getByRole("button", { name: "Resend receipts" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    const body = JSON.parse(
      (fetchMock.mock.calls[0] as unknown as [string, { body: string }])[1]
        .body,
    ) as { records: Array<{ id: string }> };
    expect(body.records.map((record) => record.id)).toEqual([rows[0].id]);
  });

  it("does not claim skipped gifts need no first receipt when only resends are possible", async () => {
    stubBatchFetch();
    const rows = [
      makeContribution({
        receiptStatus: "sent",
        receiptSent: true,
      }),
      makeContribution({
        id: "00000000-0000-4000-8000-000000000002",
        stagedGiftId: null,
      }),
      makeContribution({
        id: "00000000-0000-4000-8000-000000000003",
        stagedGiftId: null,
      }),
    ];
    const view = renderMainBody(rows);

    fireEvent.click(view.getByRole("button", { name: BULK_RECEIPTS_ACTION }));
    const dialog = await view.findByRole("alertdialog");

    expect(
      within(dialog).getByRole("heading", { name: "Resend receipts?" }),
    ).toBeTruthy();
    expect(
      view.getByText("Will be skipped").nextElementSibling?.textContent,
    ).toBe("2");
    // The skipped gifts have no receipt, so the dialog must not say none
    // of the selection needs a first one.
    expect(dialog.textContent).not.toContain("none need a first one");
    expect(dialog.textContent).toContain(
      "1 of 3 selected contributions already has a receipt, and none of the others can be sent a first receipt. Tick the box below to send another copy.",
    );
  });

  it("guards duplicate submission while the batch request is pending", async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    const fetchMock = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });
    const view = renderMainBody([makeContribution()]);

    fireEvent.click(view.getByRole("button", { name: BULK_RECEIPTS_ACTION }));
    const sendButton = await view.findByRole("button", {
      name: "Send receipts",
    });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    fireEvent.click(sendButton);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFetch(okBatchResponse({ processed: 1, succeeded: 1 }));
    });
  });

  it("does not submit when no selected rows have staged gift ids", async () => {
    const fetchMock = stubBatchFetch();
    const view = renderMainBody([
      makeContribution({ stagedGiftId: null }),
      makeContribution({
        id: "00000000-0000-4000-8000-000000000002",
        stagedGiftId: null,
      }),
    ]);

    fireEvent.click(view.getByRole("button", { name: BULK_RECEIPTS_ACTION }));

    const disabledAction = await view.findByRole("button", {
      name: "No eligible receipts",
    });
    expect((disabledAction as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(disabledAction);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("removes the old native confirm source from the bulk receipt path", () => {
    const source = readRepoFile(
      "apps/admin/app/(app)/contributions/main-body.tsx",
    );

    expect(source).not.toContain("window.confirm");
    expect(source).not.toContain("confirm(");
    expect(source).not.toContain("Send receipts for");
  });

  it("notifies the page after a successful bulk receipt batch so shared queries refresh", async () => {
    stubBatchFetch();
    const view = renderMainBody([makeContribution()]);

    fireEvent.click(view.getByRole("button", { name: BULK_RECEIPTS_ACTION }));
    fireEvent.click(await view.findByRole("button", { name: "Send receipts" }));

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalled();
    });
    // The page wires this to invalidateContributionOperationQueries
    // (ADR-CD-032) so the table and needs-attention panel reload.
    expect(onBulkReceiptSuccessMock).toHaveBeenCalledTimes(1);
  });

  it("does not signal bulk receipt success when the batch request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Batch rejected." }),
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });
    const view = renderMainBody([makeContribution()]);

    fireEvent.click(view.getByRole("button", { name: BULK_RECEIPTS_ACTION }));
    fireEvent.click(await view.findByRole("button", { name: "Send receipts" }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Batch rejected.");
    });
    expect(onBulkReceiptSuccessMock).not.toHaveBeenCalled();
  });

  it("continues a background batch until the process endpoint returns a terminal result", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        okBatchResponse({ status: "running", includeNextAction: true }),
      )
      .mockResolvedValueOnce(
        okBatchResponse({ status: "running", processed: 25, succeeded: 25 }),
      )
      .mockResolvedValueOnce(
        okBatchResponse({
          processed: 30,
          succeeded: 29,
          failed: 1,
          followUpTasksCreated: 1,
        }),
      );
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });
    const view = renderMainBody([makeContribution()]);

    fireEvent.click(view.getByRole("button", { name: BULK_RECEIPTS_ACTION }));
    fireEvent.click(await view.findByRole("button", { name: "Send receipts" }));

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalled();
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenNthCalledWith(2, persistedBatchProcessHref, {
      method: "POST",
    });
    expect(fetchMock).toHaveBeenNthCalledWith(3, persistedBatchProcessHref, {
      method: "POST",
    });
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Sent 29 receipts; 1 failed.",
    );
    expect(onBulkReceiptSuccessMock).toHaveBeenCalledTimes(1);
  });

  it("retries the existing persisted batch instead of creating another batch", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        okBatchResponse({ status: "running", includeNextAction: true }),
      )
      .mockRejectedValueOnce(new Error("Connection lost."))
      .mockResolvedValueOnce(okBatchResponse({ processed: 1, succeeded: 1 }));
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });
    const view = renderMainBody([makeContribution()]);

    fireEvent.click(view.getByRole("button", { name: BULK_RECEIPTS_ACTION }));
    fireEvent.click(await view.findByRole("button", { name: "Send receipts" }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Connection lost.");
    });
    fireEvent.click(view.getByRole("button", { name: "Send receipts" }));

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith("Sent 1 receipt.");
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/admin/contribution-batches",
      expect.any(Object),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(2, persistedBatchProcessHref, {
      method: "POST",
    });
    expect(fetchMock).toHaveBeenNthCalledWith(3, persistedBatchProcessHref, {
      method: "POST",
    });
  });

  it("retries a lost batch request with the same confirmation token, so the server returns the batch it already made", async () => {
    const randomUUID = vi.mocked(globalThis.crypto.randomUUID);
    randomUUID
      .mockReturnValueOnce("11111111-1111-4111-8111-111111111111")
      .mockReturnValueOnce("22222222-2222-4222-8222-222222222222");
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("Connection lost."))
      .mockResolvedValueOnce(okBatchResponse({ processed: 1, succeeded: 1 }));
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });
    const view = renderMainBody([makeContribution()]);

    fireEvent.click(view.getByRole("button", { name: BULK_RECEIPTS_ACTION }));
    fireEvent.click(await view.findByRole("button", { name: "Send receipts" }));
    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Connection lost.");
    });
    fireEvent.click(view.getByRole("button", { name: "Send receipts" }));
    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith("Sent 1 receipt.");
    });

    const tokens = fetchMock.mock.calls
      .filter(([url]) => url === "/api/admin/contribution-batches")
      .map(
        ([, init]) =>
          (
            JSON.parse(String((init as RequestInit).body)) as {
              confirmationToken: string;
            }
          ).confirmationToken,
      );
    expect(tokens).toEqual([
      "11111111-1111-4111-8111-111111111111",
      "11111111-1111-4111-8111-111111111111",
    ]);
  });

  it("locks the resend choice once the batch is saved, so a retry sends what the dialog shows", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        okBatchResponse({ status: "running", includeNextAction: true }),
      )
      .mockRejectedValueOnce(new Error("Connection lost."))
      .mockResolvedValueOnce(okBatchResponse({ processed: 1, succeeded: 1 }));
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });
    const view = renderMainBody([
      makeContribution({ receiptStatus: "sent", receiptSent: true }),
    ]);

    fireEvent.click(view.getByRole("button", { name: BULK_RECEIPTS_ACTION }));
    const resendName =
      /send another copy for 1 gift that already has a receipt/i;
    fireEvent.click(await view.findByRole("checkbox", { name: resendName }));
    fireEvent.click(view.getByRole("button", { name: "Resend receipts" }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Connection lost.");
    });

    // The saved batch already holds the resend, so the choice can no
    // longer change and the dialog says why.
    const resend = view.getByRole("checkbox", { name: resendName });
    expect(resend.getAttribute("aria-checked")).toBe("true");
    expect(resend.getAttribute("aria-disabled")).toBe("true");
    expect(view.getByRole("alertdialog").textContent).toContain(
      "This batch is saved with this choice",
    );
    fireEvent.click(resend);
    expect(resend.getAttribute("aria-checked")).toBe("true");

    fireEvent.click(view.getByRole("button", { name: "Resend receipts" }));
    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith("Sent 1 receipt.");
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenNthCalledWith(3, persistedBatchProcessHref, {
      method: "POST",
    });
  });

  it("shows processed progress while a later batch chunk is pending", async () => {
    let resolveFinalProcess: (value: unknown) => void = () => {};
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        okBatchResponse({ status: "running", includeNextAction: true }),
      )
      .mockResolvedValueOnce(
        okBatchResponse({ status: "running", processed: 25, succeeded: 25 }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFinalProcess = resolve;
          }),
      );
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });
    const rows = Array.from({ length: 30 }, (_, index) =>
      makeContribution({
        id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
      }),
    );
    const view = renderMainBody(rows);

    fireEvent.click(view.getByRole("button", { name: BULK_RECEIPTS_ACTION }));
    fireEvent.click(await view.findByRole("button", { name: "Send receipts" }));

    expect(
      await view.findByRole("button", {
        name: "Processing batch... 25 of 30",
      }),
    ).toBeTruthy();

    await act(async () => {
      resolveFinalProcess(okBatchResponse({ processed: 30, succeeded: 30 }));
    });
  });

  it("shows a failure message when processing reaches a failed terminal state", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        okBatchResponse({ status: "running", includeNextAction: true }),
      )
      .mockResolvedValueOnce(
        okBatchResponse({
          status: "failed",
          processed: 1,
          failed: 1,
          followUpTasksCreated: 1,
        }),
      );
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });
    const view = renderMainBody([makeContribution()]);

    fireEvent.click(view.getByRole("button", { name: BULK_RECEIPTS_ACTION }));
    fireEvent.click(await view.findByRole("button", { name: "Send receipts" }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith(
        "The receipt batch failed: 0 sent, 1 failed.",
      );
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("warns when processing completes with failed or skipped items", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        okBatchResponse({ status: "running", includeNextAction: true }),
      )
      .mockResolvedValueOnce(
        okBatchResponse({
          status: "complete_with_issues",
          processed: 3,
          succeeded: 1,
          failed: 1,
          skipped: 1,
          followUpTasksCreated: 1,
        }),
      );
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });
    const view = renderMainBody([makeContribution()]);

    fireEvent.click(view.getByRole("button", { name: BULK_RECEIPTS_ACTION }));
    fireEvent.click(await view.findByRole("button", { name: "Send receipts" }));

    await waitFor(() => {
      expect(toastWarningMock).toHaveBeenCalledWith(
        "Sent 1 receipt; 1 failed and 1 skipped.",
      );
    });
    expect(toastSuccessMock).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("ContributionsMainBody skip to gifts", () => {
  it("offers a skip link first, ahead of Needs attention and the summary", () => {
    const view = render(
      <ContributionsMainBody
        data={[makeContribution()]}
        isLoading={false}
        onSelectContribution={vi.fn()}
      />,
    );

    const link = view.getByRole("link", { name: "Skip to gifts" });
    const firstFocusable = view.container.querySelector<HTMLElement>(
      "a[href], button, input, [tabindex]:not([tabindex='-1'])",
    );
    expect(firstFocusable).toBe(link);
    // Invisible until focused, so it costs sighted mouse users nothing; it
    // keeps its padding when shown (sr-only would reset it on focus).
    const classes = link.className.split(" ");
    expect(classes).toEqual(
      expect.arrayContaining([
        "opacity-0",
        "focus:opacity-100",
        "pointer-events-none",
        "focus:pointer-events-auto",
        "focus:ring-2",
        "focus:ring-ring",
        "px-3",
        "py-2",
      ]),
    );
    expect(classes).not.toContain("focus:not-sr-only");
  });

  it("moves focus to the first gift in the grid", () => {
    const view = render(
      <ContributionsMainBody
        data={[makeContribution()]}
        isLoading={false}
        onSelectContribution={vi.fn()}
      />,
    );

    fireEvent.click(view.getByRole("link", { name: "Skip to gifts" }));

    const firstGift = view.container.querySelector<HTMLElement>(
      "[data-grid-row-primary]",
    );
    expect(firstGift).toBeTruthy();
    expect(document.activeElement).toBe(firstGift);
  });

  it("lands on the gifts search when no gift is listed", () => {
    const view = render(
      <ContributionsMainBody
        data={[]}
        isLoading={false}
        onSelectContribution={vi.fn()}
      />,
    );

    fireEvent.click(view.getByRole("link", { name: "Skip to gifts" }));

    // With no gifts the grid is an empty state; focus lands inside it
    // rather than staying on the link.
    const gifts = view.container.querySelector("#contribution-gifts");
    expect(gifts?.contains(document.activeElement)).toBe(true);
  });
});

describe("ContributionsMainBody jump to gifts on phones", () => {
  it("shows touch users a visible Jump to gifts link that reaches the first gift", () => {
    const view = render(
      <ContributionsMainBody
        data={[makeContribution()]}
        isLoading={false}
        onSelectContribution={vi.fn()}
      />,
    );

    // Needs attention and the summary push the first gift below the fold on
    // phones and small tablets (640 included), where gifts show as cards;
    // the keyboard-only skip link does not help a touch user.
    const link = view.getByRole("link", { name: "Jump to gifts" });
    expect(link.getAttribute("href")).toBe("#contribution-gifts");
    const classes = link.className.split(" ");
    expect(classes).toContain("md:hidden");
    expect(classes).not.toContain("sm:hidden");
    expect(classes).not.toContain("opacity-0");
    // Where it shows it replaces the invisible skip link, so a keyboard user
    // there does not meet two links to the same place.
    const skip = view.getByRole("link", { name: "Skip to gifts" });
    expect(skip.className.split(" ")).toContain("max-md:hidden");

    fireEvent.click(link);
    expect(document.activeElement).toBe(
      view.container.querySelector("[data-grid-row-primary]"),
    );
  });

  it("is left out when there are no gifts to jump to", () => {
    const view = render(
      <ContributionsMainBody
        data={[]}
        isLoading={false}
        onSelectContribution={vi.fn()}
      />,
    );

    expect(view.queryByRole("link", { name: "Jump to gifts" })).toBeNull();
  });
});

describe("contributions surface design tokens", () => {
  it("uses semantic tokens and explicit transitions (no raw palette, no transition-all)", () => {
    const paths = [
      "apps/admin/app/(app)/contributions/main-body.tsx",
      "apps/admin/app/(app)/contributions/page-client.tsx",
    ];

    for (const path of paths) {
      const source = readRepoFile(path);

      expect(source, `${path} must not use transition-all`).not.toContain(
        "transition-all",
      );
      // Raw light-biased palette classes (bg-white, text-zinc-900, rose
      // accents) render wrong in dark mode; use semantic tokens instead
      // (bg-card, text-foreground, text-muted-foreground, destructive).
      expect(
        source,
        `${path} must use semantic color tokens, not raw white/zinc/rose utilities`,
      ).not.toMatch(/-(?:white|zinc-\d+|rose-\d+)\b/);
    }
  });
});

describe("offline gift entry readiness gate", () => {
  it("keeps the unbound offline gift form hidden by default", () => {
    const view = renderPageActions();

    expect(
      view.queryByRole("button", { name: /Enter offline gift/i }),
    ).toBeNull();
  });

  it("keeps finance-authorized users behind the persistence flag until DB dependencies are bound", () => {
    const view = renderPageActions(true);

    expect(
      view.queryByRole("button", { name: /Enter offline gift/i }),
    ).toBeNull();
    // Export only toasted "coming soon"; a dead header control is removed
    // rather than shown.
    expect(view.queryByRole("button", { name: "Export" })).toBeNull();
  });
});
