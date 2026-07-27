/** @vitest-environment jsdom */

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
} from "@testing-library/react";
import { JSDOM } from "jsdom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ContributionGridRow as Contribution } from "@asym/api/admin/contributions/types";
import type {
  ContributionBatchApiResponse,
  ContributionBatchStatus,
} from "@asym/api/admin/contribution-batches";

const selectedRowsRef = { current: [] as unknown[] };
const toastErrorMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastWarningMock = vi.fn();
const onBulkReceiptSuccessMock = vi.fn();

vi.mock("@asym/lib/motion", async () => {
  const React = await import("react");

  return {
    motion: {
      div: ({
        animate: _animate,
        children,
        initial: _initial,
        transition: _transition,
        whileHover: _whileHover,
        whileTap: _whileTap,
        ...props
      }: React.HTMLAttributes<HTMLDivElement> & {
        animate?: unknown;
        initial?: unknown;
        transition?: unknown;
        whileHover?: unknown;
        whileTap?: unknown;
      }) => React.createElement("div", props, children),
    },
  };
});

vi.mock("@asym/ui/components/shadcn/data-table", async () => {
  const React = await import("react");

  return {
    DataTableResponsive: ({
      floatingBarActions = [],
    }: {
      floatingBarActions?: Array<{
        label: string;
        onClick: (rows: unknown[]) => void;
      }>;
    }) =>
      React.createElement(
        "div",
        { "data-testid": "contributions-table" },
        floatingBarActions.map((action) =>
          React.createElement(
            "button",
            {
              key: action.label,
              onClick: () => action.onClick(selectedRowsRef.current),
              type: "button",
            },
            action.label,
          ),
        ),
      ),
  };
});

vi.mock("sonner", () => ({
  toast: {
    error: toastErrorMock,
    success: toastSuccessMock,
    warning: toastWarningMock,
    info: vi.fn(),
  },
}));

const root = new NodeURL("../../../../../", import.meta.url);
type ContributionsMainBodyComponent =
  typeof import("../../../../../apps/admin/app/contributions/main-body").ContributionsMainBody;
type ContributionsPageActionsComponent =
  typeof import("../../../../../apps/admin/app/contributions/main-body").ContributionsPageActions;
let ContributionsMainBody: ContributionsMainBodyComponent;
let ContributionsPageActions: ContributionsPageActionsComponent;
let confirmDescriptor: PropertyDescriptor | undefined;
let cryptoDescriptor: PropertyDescriptor | undefined;
let customEventDescriptor: PropertyDescriptor | undefined;
let dom: JSDOM | undefined;
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
  selectedRowsRef.current = rows;
  return render(
    <ContributionsMainBody
      data={rows}
      isLoading={false}
      onSelectContribution={vi.fn()}
      onBulkReceiptSuccess={onBulkReceiptSuccessMock}
    />,
  );
}

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
  dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost",
  });
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

  globalThis.window = dom.window as unknown as Window & typeof globalThis;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.HTMLButtonElement = dom.window.HTMLButtonElement;
  globalThis.SVGElement = dom.window.SVGElement;
  globalThis.Element = dom.window.Element;
  globalThis.Node = dom.window.Node;
  globalThis.Event = dom.window.Event;
  globalThis.CustomEvent = dom.window.CustomEvent;
  globalThis.EventTarget = dom.window.EventTarget;
  globalThis.MouseEvent = dom.window.MouseEvent;
  globalThis.KeyboardEvent = dom.window.KeyboardEvent;
  globalThis.MutationObserver = dom.window.MutationObserver;
  globalThis.getComputedStyle = dom.window.getComputedStyle;
  globalThis.requestAnimationFrame = (callback) =>
    window.setTimeout(callback, 0);
  globalThis.cancelAnimationFrame = (id) => window.clearTimeout(id);
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: dom.window.navigator,
  });
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
  const mainBodyModule =
    await import("../../../../../apps/admin/app/contributions/main-body");
  ContributionsMainBody = mainBodyModule.ContributionsMainBody;
  ContributionsPageActions = mainBodyModule.ContributionsPageActions;
  selectedRowsRef.current = [];
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
  dom?.window.close();
  dom = undefined;
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

    fireEvent.click(view.getByRole("button", { name: "Send Receipts" }));

    expect(globalThis.confirm).not.toHaveBeenCalled();
    expect(window.confirm).not.toHaveBeenCalled();
    expect(await view.findByRole("alertdialog")).toBeTruthy();
    expect(view.getByText("Send receipts?")).toBeTruthy();
    expect(
      view.getByText(
        "This will start a receipt resend batch for 2 selected contributions.",
      ),
    ).toBeTruthy();
    expect(view.getByText("Selected contributions")).toBeTruthy();
    expect(view.getByText("Ready to send")).toBeTruthy();
    expect(view.getByText("Missing staged gift id")).toBeTruthy();
    expect(view.getByText("1 missing")).toBeTruthy();
  });

  it("cancels without posting the batch", async () => {
    const fetchMock = stubBatchFetch();
    const view = renderMainBody([makeContribution()]);

    fireEvent.click(view.getByRole("button", { name: "Send Receipts" }));
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

    fireEvent.click(view.getByRole("button", { name: "Send Receipts" }));
    fireEvent.click(await view.findByRole("button", { name: "Send receipts" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/contribution-batches",
        {
          body: JSON.stringify({
            actionType: "resend_receipt",
            confirmationToken: "confirmation-token",
            reason: "Bulk receipt resend requested from Contribution Hub.",
            records: rows.map((row) => ({
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
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Bulk receipt batch complete: 2 succeeded, 0 failed.",
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

    fireEvent.click(view.getByRole("button", { name: "Send Receipts" }));
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

    fireEvent.click(view.getByRole("button", { name: "Send Receipts" }));

    const disabledAction = await view.findByRole("button", {
      name: "No eligible receipts",
    });
    expect((disabledAction as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(disabledAction);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("removes the old native confirm source from the bulk receipt path", () => {
    const source = readRepoFile("apps/admin/app/contributions/main-body.tsx");

    expect(source).not.toContain("window.confirm");
    expect(source).not.toContain("confirm(");
    expect(source).not.toContain("Send receipts for");
  });

  it("notifies the page after a successful bulk receipt batch so shared queries refresh", async () => {
    stubBatchFetch();
    const view = renderMainBody([makeContribution()]);

    fireEvent.click(view.getByRole("button", { name: "Send Receipts" }));
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

    fireEvent.click(view.getByRole("button", { name: "Send Receipts" }));
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

    fireEvent.click(view.getByRole("button", { name: "Send Receipts" }));
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
      "Bulk receipt batch complete: 29 succeeded, 1 failed.",
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

    fireEvent.click(view.getByRole("button", { name: "Send Receipts" }));
    fireEvent.click(await view.findByRole("button", { name: "Send receipts" }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Connection lost.");
    });
    fireEvent.click(view.getByRole("button", { name: "Send receipts" }));

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith(
        "Bulk receipt batch complete: 1 succeeded, 0 failed.",
      );
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

    fireEvent.click(view.getByRole("button", { name: "Send Receipts" }));
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

    fireEvent.click(view.getByRole("button", { name: "Send Receipts" }));
    fireEvent.click(await view.findByRole("button", { name: "Send receipts" }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith(
        "Bulk receipt batch failed: 0 succeeded, 1 failed.",
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

    fireEvent.click(view.getByRole("button", { name: "Send Receipts" }));
    fireEvent.click(await view.findByRole("button", { name: "Send receipts" }));

    await waitFor(() => {
      expect(toastWarningMock).toHaveBeenCalledWith(
        "Bulk receipt batch complete with issues: 1 succeeded, 1 failed, 1 skipped.",
      );
    });
    expect(toastSuccessMock).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("contributions surface design tokens", () => {
  it("uses semantic tokens and explicit transitions (no raw palette, no transition-all)", () => {
    const paths = [
      "apps/admin/app/contributions/main-body.tsx",
      "apps/admin/app/contributions/page-client.tsx",
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
      view.queryByRole("button", { name: /Enter Offline Gift/i }),
    ).toBeNull();
  });

  it("keeps finance-authorized users behind the persistence flag until DB dependencies are bound", () => {
    const view = renderPageActions(true);

    expect(
      view.queryByRole("button", { name: /Enter Offline Gift/i }),
    ).toBeNull();
    expect(view.getByRole("button", { name: "Export" })).toBeTruthy();
  });
});
