import { QueryProvider } from "@asym/database/providers";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  flushContributionTestDomEffects,
  installContributionTestDom,
  restoreContributionTestDom,
} from "./contribution-test-dom";

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

type OperationShellModule =
  typeof import("../../../../../apps/admin/app/contributions/operation-shell");

const testDom = installContributionTestDom();
const { cleanup, fireEvent, render, waitFor } =
  await import("@testing-library/react");
const {
  ContributionOperationShell,
  OPERATION_DEFINITIONS,
}: OperationShellModule =
  await import("../../../../../apps/admin/app/contributions/operation-shell");

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
        actionType: "retry_staged_gift",
        available: false,
        blockedReason: "There is no failed or blocked posting to retry.",
        nextStep:
          "Retry becomes available when staged gift processing or CRM posting fails.",
        riskLevel: "low",
      },
    ],
    ...overrides,
  };
}

function fetchMockForShell(actionResult: Record<string, unknown>) {
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
      json: async () => ({ contribution: makeDetail() }),
    };
  });
}

function changeTextField(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string,
) {
  const prototype = Object.getPrototypeOf(element) as
    | HTMLInputElement
    | HTMLTextAreaElement;
  const valueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  valueSetter?.call(element, value);
  fireEvent.input(element, { target: { value } });
}

let fetchDescriptor: PropertyDescriptor | undefined;

describe("ContributionOperationShell", () => {
  beforeEach(() => {
    fetchDescriptor = Object.getOwnPropertyDescriptor(globalThis, "fetch");
  });

  afterEach(async () => {
    cleanup();
    await flushContributionTestDomEffects();
    vi.clearAllMocks();
    if (fetchDescriptor) {
      Object.defineProperty(globalThis, "fetch", fetchDescriptor);
    } else {
      Reflect.deleteProperty(globalThis, "fetch");
    }
  });

  afterAll(() => {
    restoreContributionTestDom(testDom);
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

    changeTextField(
      view.getByLabelText("Amount (USD)") as HTMLInputElement,
      "200",
    );
    changeTextField(
      view.getByLabelText("Reason") as HTMLTextAreaElement,
      "Donor reported the wrong amount",
    );
    fireEvent.click(view.getByRole("checkbox"));

    await waitFor(() => {
      expect(submit).toHaveProperty("disabled", false);
    });
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
          operation={OPERATION_DEFINITIONS.retry_staged_gift!}
          donationId={DONATION_ID}
          sourceSurface="donor_crm_record"
        />
      </QueryProvider>,
    );

    expect(
      await view.findByText(/no failed or blocked posting to retry/i),
    ).toBeTruthy();
    expect(
      view.getByText(/retry becomes available when staged gift processing/i),
    ).toBeTruthy();
    expect(
      view.queryByRole("button", { name: "Retry CRM posting" }),
    ).toBeNull();
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
    changeTextField(
      view.getByLabelText("Amount (USD)") as HTMLInputElement,
      "150",
    );
    changeTextField(
      view.getByLabelText("Reason") as HTMLTextAreaElement,
      "fix",
    );
    fireEvent.click(view.getByRole("checkbox"));
    const submit = view.getByRole("button", { name: "Correct gift amount" });
    await waitFor(() => {
      expect(submit).toHaveProperty("disabled", false);
    });
    fireEvent.click(submit);

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
});
