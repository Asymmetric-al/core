/** @vitest-environment jsdom */

import { QueryProvider } from "@asym/database/providers";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CorrectionApprovalPanel } from "../../../../../apps/admin/app/contributions/correction-approval-panel";

import type { ContributionCorrectionRequestView } from "../../../../../apps/admin/app/contributions/correction-approval-panel";
import type { ContributionReceiptDeliveryContext } from "../../../../../apps/admin/app/contributions/receipt-delivery-choice";

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

const REQUEST_ID = "req-1";
const DECISION_URL = `/api/admin/contribution-operations/correction-requests/${REQUEST_ID}/decision`;

function makeReceiptDelivery(
  overrides: Partial<ContributionReceiptDeliveryContext> = {},
): ContributionReceiptDeliveryContext {
  return {
    options: [
      { choice: "email", available: true, blockedReason: null },
      { choice: "pdf", available: true, blockedReason: null },
      { choice: "defer", available: true, blockedReason: null },
    ],
    defaultChoice: "email",
    deferReasonRequired: true,
    requireDeliveryAction: false,
    donor: { email: "donor@example.org", doNotEmail: false },
    ...overrides,
  };
}

function makeRequest(
  overrides: Partial<ContributionCorrectionRequestView> = {},
): ContributionCorrectionRequestView {
  return {
    id: REQUEST_ID,
    actionType: "amount_correction",
    status: "pending",
    reason: "Donor reported the wrong amount",
    requestedByProfileId: "profile-9",
    createdAt: "2026-06-30T12:00:00.000Z",
    receiptDeliveryProposal: { choice: "pdf", deferReason: null },
    receiptAffectedFields: ["amount"],
    viewerCanDecide: true,
    ...overrides,
  };
}

function decisionFetchMock(result: Record<string, unknown> | null = null) {
  return vi.fn().mockImplementation(async () => ({
    ok: true,
    json: async () => ({
      request: { id: REQUEST_ID, status: "approved" },
      result,
      idempotentReplay: false,
    }),
  }));
}

function renderPanel({
  correctionRequests = [makeRequest()],
  receiptDelivery = makeReceiptDelivery(),
}: {
  correctionRequests?: ContributionCorrectionRequestView[];
  receiptDelivery?: ContributionReceiptDeliveryContext | null;
} = {}) {
  return render(
    <QueryProvider>
      <CorrectionApprovalPanel
        correctionRequests={correctionRequests}
        receiptDelivery={receiptDelivery}
      />
    </QueryProvider>,
  );
}

let fetchDescriptor: PropertyDescriptor | undefined;

describe("CorrectionApprovalPanel", () => {
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

  it("renders nothing when no pending request is decidable by the viewer", () => {
    const view = renderPanel({
      correctionRequests: [
        makeRequest({ viewerCanDecide: false }),
        makeRequest({ id: "req-2", status: "approved" }),
      ],
    });

    expect(view.queryByTestId("correction-approval-panel")).toBeNull();
  });

  it("labels and prefills the requester's proposed receipt delivery", () => {
    const view = renderPanel();

    expect(view.getByText("amount correction")).toBeTruthy();
    expect(view.getByText("Donor reported the wrong amount")).toBeTruthy();
    expect(view.getByText(/^requested /i)).toBeTruthy();
    expect(
      view.getByText(/requester proposed: generate updated receipt pdf/i),
    ).toBeTruthy();
    expect(
      view
        .getByRole("radio", { name: /generate updated receipt pdf/i })
        .getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("posts the approver's changed delivery selection with the decision", async () => {
    const fetchMock = decisionFetchMock({
      receiptOutcome: {
        status: "emailed",
        reason: null,
        snapshotId: null,
        affectedFields: ["amount"],
        requested: { choice: "pdf", deferReason: null },
        confirmed: { choice: "email", deferReason: null },
      },
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = renderPanel();
    fireEvent.click(
      view.getByRole("radio", { name: /send updated receipt by email/i }),
    );
    fireEvent.click(view.getByRole("button", { name: "Approve" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe(DECISION_URL);
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toEqual({
      decision: "approve",
      reason: null,
      receiptDelivery: { choice: "email", deferReason: null },
    });

    expect(await view.findByText(/correction request approved/i)).toBeTruthy();
  });

  it("posts a null receipt delivery when the approver keeps the proposal", async () => {
    const fetchMock = decisionFetchMock(null);
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = renderPanel();
    fireEvent.click(view.getByRole("button", { name: "Approve" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = JSON.parse(
      (fetchMock.mock.calls[0]![1] as RequestInit).body as string,
    );
    expect(body).toEqual({
      decision: "approve",
      reason: null,
      receiptDelivery: null,
    });
  });

  it("requires a decision reason to reject and posts the rejection", async () => {
    const fetchMock = decisionFetchMock(null);
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = renderPanel();
    fireEvent.click(view.getByRole("button", { name: "Reject" }));

    expect(
      view.getByText(/a reason is required to reject this correction request/i),
    ).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.change(view.getByLabelText("Decision reason"), {
      target: { value: "Not a valid correction" },
    });
    fireEvent.click(view.getByRole("button", { name: "Reject" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = JSON.parse(
      (fetchMock.mock.calls[0]![1] as RequestInit).body as string,
    );
    expect(body).toEqual({
      decision: "reject",
      reason: "Not a valid correction",
      receiptDelivery: null,
    });
  });

  it("shows a PDF download link when approval generated an updated receipt", async () => {
    const fetchMock = decisionFetchMock({
      receiptOutcome: {
        status: "pdf_generated",
        reason: null,
        snapshotId: "snap-7",
        affectedFields: ["amount"],
        requested: { choice: "pdf", deferReason: null },
        confirmed: { choice: "pdf", deferReason: null },
      },
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = renderPanel();
    fireEvent.click(view.getByRole("button", { name: "Approve" }));

    const link = await view.findByRole("link", {
      name: /download updated receipt pdf/i,
    });
    expect(link.getAttribute("href")).toBe(
      "/api/admin/contribution-operations/receipt-snapshots/snap-7/pdf",
    );
  });
});
