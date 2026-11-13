/** @vitest-environment jsdom */

import { QueryProvider } from "@asym/database/providers";
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1894: App panel regression test at its public UI boundary.
import { CorrectionApprovalPanel } from "../../../../../apps/admin/app/(app)/contributions/correction-approval-panel";

// eslint-disable-next-line no-restricted-imports -- AL-1894: App panel regression test at its public UI boundary.
import type { ContributionCorrectionRequestView } from "../../../../../apps/admin/app/(app)/contributions/correction-approval-panel";
// eslint-disable-next-line no-restricted-imports -- AL-1894: App panel regression test at its public UI boundary.
import type { ContributionReceiptDeliveryContext } from "../../../../../apps/admin/app/(app)/contributions/receipt-delivery-choice";

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
    requestedByName: "Joel Ramirez",
    createdAt: "2026-06-30T12:00:00.000Z",
    proposedChange: [{ label: "Amount", from: "$1,000.00", to: "$1,500.00" }],
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

  it("shows the request's own change and who asked", () => {
    const view = renderPanel();
    const card = view.getByTestId(`correction-request-${REQUEST_ID}`);

    // The request name matches its Needs attention summary.
    expect(within(card).getByText("Amount correction").className).toContain(
      "font-medium",
    );
    const change = within(card).getByRole("list", { name: "Proposed change" });
    expect(change.textContent).toContain("Amount");
    expect(change.textContent).toContain("$1,000.00");
    expect(change.textContent).toContain("$1,500.00");
    expect(card.textContent).toContain("Joel Ramirez");
  });

  it("titles fund corrections from the catalog and unknown keys generically", () => {
    const view = renderPanel({
      correctionRequests: [
        makeRequest({ id: "req-fund", actionType: "fund_correction" }),
        makeRequest({ id: "req-odd", actionType: "legacy_adjustment" }),
      ],
    });

    expect(
      within(view.getByTestId("correction-request-req-fund")).getByText(
        "Correct fund designation",
      ),
    ).toBeTruthy();
    const unknownCard = view.getByTestId("correction-request-req-odd");
    expect(within(unknownCard).getByText("Correction request")).toBeTruthy();
    expect(unknownCard.textContent).not.toMatch(/legacy adjustment/i);
  });

  it("keeps both decision buttons in place while a decision submits", async () => {
    // Never resolves, so the decision stays pending for the assertions.
    const fetchMock = vi.fn(() => new Promise<Response>(() => {}));
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = renderPanel();
    const card = view.getByTestId(`correction-request-${REQUEST_ID}`);
    const approve = within(card).getByRole("button", { name: "Approve" });
    approve.focus();
    fireEvent.click(approve);

    await waitFor(() => expect(approve.getAttribute("aria-busy")).toBe("true"));
    // The clicked button stays mounted, focused and named for its progress;
    // nothing drops focus to the page body.
    expect(approve.isConnected).toBe(true);
    expect(document.activeElement).toBe(approve);
    expect(approve.textContent).toContain("Approving…");
    expect(approve.getAttribute("aria-disabled")).toBe("true");
    const reject = within(card).getByRole("button", { name: "Reject" });
    expect(reject).toHaveProperty("disabled", true);
    expect(within(card).getByRole("status").textContent).toBe(
      "Approving correction…",
    );

    // A second click while pending posts nothing more.
    fireEvent.click(approve);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keeps each pending request's change with its own request", () => {
    const view = renderPanel({
      correctionRequests: [
        makeRequest(),
        makeRequest({
          id: "req-2",
          actionType: "fund_correction",
          proposedChange: [
            { label: "Fund", from: "General Fund", to: "Clean Water" },
          ],
        }),
      ],
    });

    expect(
      view.getByTestId(`correction-request-${REQUEST_ID}`).textContent,
    ).not.toContain("Clean Water");
    expect(view.getByTestId("correction-request-req-2").textContent).toContain(
      "General Fund",
    );
    expect(view.getByTestId("correction-request-req-2").textContent).toContain(
      "Clean Water",
    );
  });

  it("does not offer approval when the request's change cannot be read", () => {
    const view = renderPanel({
      correctionRequests: [makeRequest({ proposedChange: null })],
    });
    const card = view.getByTestId(`correction-request-${REQUEST_ID}`);

    expect(
      (
        within(card).getByRole("button", {
          name: "Approve",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(card.textContent).toContain("can't be read");
    expect(
      (
        within(card).getByRole("button", {
          name: "Reject",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
  });

  it("labels and prefills the requester's proposed receipt delivery", () => {
    const view = renderPanel();

    expect(view.getByText("Amount correction")).toBeTruthy();
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

  it("shows the donor's email on its own line under the email option", () => {
    const view = renderPanel();
    // The address is not run into the label, where it wrapped at a hyphen
    // on phones; the radio keeps a short name.
    const radio = view.getByRole("radio", {
      name: "Send updated receipt by email",
    });
    expect(radio).toBeTruthy();
    const address = view.getByText("donor@example.org");
    expect(address.closest("label")).toBeNull();
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
    expect(view.getByText("Receipt: Emailed to the donor")).toBeTruthy();
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

  it("blocks approval and wires the defer error when a required defer reason is empty", async () => {
    const fetchMock = decisionFetchMock(null);
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = renderPanel({
      correctionRequests: [
        makeRequest({
          receiptDeliveryProposal: { choice: "defer", deferReason: null },
        }),
      ],
    });

    const approve = view.getByRole("button", { name: "Approve" });
    const deferReason = view.getByLabelText("Defer reason");

    expect(approve).toHaveProperty("disabled", true);
    expect(deferReason.getAttribute("aria-invalid")).toBe("true");
    const describedBy = deferReason.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)?.textContent).toMatch(
      /a reason is required when deferring the updated receipt/i,
    );

    fireEvent.change(deferReason, {
      target: { value: "Donor asked us to wait" },
    });
    expect(approve).toHaveProperty("disabled", false);
    fireEvent.click(approve);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = JSON.parse(
      (fetchMock.mock.calls[0]![1] as RequestInit).body as string,
    );
    expect(body).toEqual({
      decision: "approve",
      reason: null,
      receiptDelivery: {
        choice: "defer",
        deferReason: "Donor asked us to wait",
      },
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

    const reason = view.getByRole("textbox", { name: "Decision reason" });
    expect(reason.getAttribute("aria-invalid")).toBe("true");
    const errorId = reason.getAttribute("aria-describedby");
    expect(errorId).toBeTruthy();
    expect(document.getElementById(errorId!)?.textContent).toMatch(
      /a reason is required to reject this correction request/i,
    );

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
      name: /download updated receipt pdf\s*\(opens in a new tab\)/i,
    });
    expect(view.getByText("Receipt: PDF generated")).toBeTruthy();
    expect(link.getAttribute("href")).toBe(
      "/api/admin/contribution-operations/receipt-snapshots/snap-7/pdf",
    );
  });
});
