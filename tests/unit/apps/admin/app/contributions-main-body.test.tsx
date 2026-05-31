/** @vitest-environment jsdom */

import { readFileSync } from "node:fs";
// This test runs under the jsdom environment, whose global `URL` rewrites
// `file:` bases into the Vite dev server's `http://localhost/@fs/...` form;
// `readFileSync` then rejects that on Windows ("The URL must be of scheme
// file"). Alias Node's own `URL` so source-file reads use a real `file:` URL.
import { URL as NodeURL, fileURLToPath } from "node:url";

import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react";
import { JSDOM } from "jsdom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Contribution } from "../../../../../apps/admin/app/contributions/types";

const selectedRowsRef = { current: [] as unknown[] };
const toastErrorMock = vi.fn();
const toastSuccessMock = vi.fn();

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
    info: vi.fn(),
  },
}));

const root = new NodeURL("../../../../../", import.meta.url);
type ContributionsMainBodyComponent =
  typeof import("../../../../../apps/admin/app/contributions/main-body").ContributionsMainBody;
let ContributionsMainBody: ContributionsMainBodyComponent;
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
    />,
  );
}

function stubBatchFetch() {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      batch: {
        status: "complete",
        summary: { failed: 0, succeeded: 2 },
      },
    }),
  });
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
  ContributionsMainBody = (
    await import("../../../../../apps/admin/app/contributions/main-body")
  ).ContributionsMainBody;
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
    fireEvent.click(sendButton);

    const submittingButton = await view.findByRole("button", {
      name: "Starting batch...",
    });
    expect((submittingButton as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(submittingButton);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFetch({
        ok: true,
        json: async () => ({
          batch: {
            status: "complete",
            summary: { failed: 0, succeeded: 1 },
          },
        }),
      });
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
});
