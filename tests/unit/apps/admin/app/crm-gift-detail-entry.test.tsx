/** @vitest-environment jsdom */

import { QueryProvider } from "@asym/database/providers";
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react";
import { JSDOM } from "jsdom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type CrmPageComponent =
  typeof import("../../../../../apps/admin/app/crm/page").default;

const useAdminCrmRecordsInfiniteGridMock = vi.fn();
const useAdminCrmRecordDetailMock = vi.fn();
const useCreateLinkedCrmNoteMock = vi.fn();
const useCrmTablePreferencesMock = vi.fn();
const useSaveCrmRowActionPinMock = vi.fn();
const useSaveCrmViewSettingsMock = vi.fn();
const useCrmNamedViewsMock = vi.fn();
const useCreateCrmNamedViewMock = vi.fn();
const useUpdateCrmNamedViewMock = vi.fn();
const useDeleteCrmNamedViewMock = vi.fn();

vi.mock("@asym/database/hooks", () => ({
  ADMIN_CRM_NAMED_VIEWS_QUERY_KEY: ["admin", "crm", "named-views"],
  ADMIN_CRM_RECORD_DETAIL_QUERY_KEY: ["admin", "crm", "records", "detail"],
  ADMIN_CRM_RECORDS_QUERY_KEY: ["admin", "crm", "records"],
  ADMIN_CRM_TABLE_PREFERENCES_QUERY_KEY: ["admin", "crm", "table-preferences"],
  MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY: [
    "admin",
    "mission-control",
    "needs-attention",
  ],
  useAdminCrmRecordDetail: useAdminCrmRecordDetailMock,
  useAdminCrmRecordsInfiniteGrid: useAdminCrmRecordsInfiniteGridMock,
  useCreateCrmNamedView: useCreateCrmNamedViewMock,
  useCreateLinkedCrmNote: useCreateLinkedCrmNoteMock,
  useCrmNamedViews: useCrmNamedViewsMock,
  useCrmTablePreferences: useCrmTablePreferencesMock,
  useDeleteCrmNamedView: useDeleteCrmNamedViewMock,
  useSaveCrmRowActionPin: useSaveCrmRowActionPinMock,
  useSaveCrmViewSettings: useSaveCrmViewSettingsMock,
  useUpdateCrmNamedView: useUpdateCrmNamedViewMock,
}));

const routerPushMock = vi.fn();
const routerReplaceMock = vi.fn();
let mockSearch = "";

vi.mock("next/navigation", () => ({
  usePathname: () => "/crm",
  useRouter: () => ({
    push: routerPushMock,
    replace: routerReplaceMock,
  }),
  useSearchParams: () => new URLSearchParams(mockSearch),
}));

vi.mock("sonner", () => ({
  toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

const DONOR_RECORD_ID = "record-donor-1";
const DONATION_ID = "00000000-0000-4000-8000-00000000d001";

const crmGridRow = {
  id: DONOR_RECORD_ID,
  recordType: "individual",
  displayName: "Alice Johnson",
  title: null,
  primaryOrganization: null,
  primaryContactLine: "alice@example.com",
  location: null,
  lifecycleStatus: "active",
  lastGiftAt: "2026-05-01T00:00:00.000Z",
  lifetimeGiving: 25_000,
  fundsGivenToSummary: null,
  lastTouchAt: null,
  nextTaskSummary: null,
  portalAccessLabel: "none" as const,
  linkedAuthUserId: null,
  tags: [],
  assignedMissionaryName: null,
  avatarUrl: null,
  email: "alice@example.com",
  phone: null,
  notesPreview: null,
  createdAt: "2026-04-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
};

const sharedGiftFields = {
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
  },
  paymentStatus: "completed",
  receiptStatus: "sent",
  crmPostStatus: "posted",
  refundState: "none",
  refundedAmountCents: 0,
  correctionState: "none",
};

const crmDonorDetail = {
  donor: {
    id: DONOR_RECORD_ID,
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: null,
    organization: null,
    status: "active",
    type: "individual",
    profileId: null,
    missionaryId: null,
    notesPreview: null,
  },
  giftHistory: [
    {
      shared: sharedGiftFields,
      id: DONATION_ID,
      donationId: DONATION_ID,
      amountCents: 25_000,
      currencyCode: "USD",
      giftDate: "2026-05-01",
      paymentStatus: "completed",
      receiptStatus: "sent",
      crmPostStatus: "posted",
      refundState: "none",
      correctionState: "none",
      fundId: "fund-1",
      fundName: "Clean Water Initiative",
      missionaryId: null,
      missionaryName: null,
      stagedGiftId: "staged-1",
      twentyRecordId: null,
    },
  ],
  timeline: [],
  duplicateWarnings: [],
  support: {
    lifetimeGivingCents: 25_000,
    lastGiftAt: "2026-05-01T00:00:00.000Z",
    activeRecurringCommitments: 0,
    lapsedCommitments: 0,
    atRiskCommitments: 0,
    byFund: [],
    byMissionary: [],
  },
  privacy: {
    roleGate: "staff",
    restrictedNotesVisible: false,
    missionaryContactDataExposed: false,
  },
  reconciliation: {
    crmWriteMode: "disabled",
    twentyIsPaymentTruth: false,
    platformPaymentTruth: true,
  },
};

const contributionDetailPayload = {
  contribution: {
    id: DONATION_ID,
    shared: sharedGiftFields,
    donor: {
      id: "donor-1",
      profileId: null,
      name: "Alice Johnson",
      email: "alice@example.com",
      phoneNumbers: [],
      location: null,
      organization: null,
    },
    gift: {
      date: "2026-05-01",
      createdAt: "2026-05-01T00:00:00.000Z",
      updatedAt: "2026-05-01T00:00:00.000Z",
      source: "online",
      campaignId: null,
      pledgeId: null,
    },
    amount: {
      value: 25_000,
      gross: 25_000,
      net: null,
      fee: null,
      taxDeductible: null,
      currency: "USD",
    },
    payment: {
      type: "one_time",
      method: "card",
      status: "completed",
      lastFour: null,
      stripe: {
        paymentIntentId: "pi_1",
        chargeId: null,
        refundIds: [],
        replayContext: null,
      },
    },
    designation: {
      fundId: "fund-1",
      fundName: "Clean Water Initiative",
      missionaryId: null,
      missionaryName: null,
      projectId: null,
    },
    receipt: { status: "sent", statementStatus: null },
    refund: { status: "none", amount: 0, refundedAt: null },
    recurring: { isRecurring: false, interval: null, pledgeId: null },
    stagedGift: {
      id: "staged-1",
      status: "posted",
      receiptStatus: "sent",
      crmPostStatus: "posted",
      reviewReason: null,
      twentyRecordId: null,
    },
    crm: { postStatus: "posted", twentyRecordId: null },
    auditEvents: [],
    corrections: [],
    tasks: [],
    batches: [],
    donorVisible: {
      status: "Succeeded",
      historyUpdatedImmediately: true,
      amount: 25_000,
      currency: "USD",
    },
  },
};

const inlineActionsFixture = {
  nextBestActionType: "resend_receipt",
  entries: [
    {
      actionType: "amount_correction",
      available: true,
      blockedReason: null,
      nextStep: null,
      riskLevel: "high",
    },
    {
      actionType: "fund_correction",
      available: true,
      blockedReason: null,
      nextStep: null,
      riskLevel: "high",
    },
    {
      actionType: "resend_receipt",
      available: true,
      blockedReason: null,
      nextStep: null,
      riskLevel: "low",
    },
    {
      actionType: "refund",
      available: false,
      blockedReason:
        "This gift has no payment provider charge to refund against.",
      nextStep: null,
      riskLevel: "high",
    },
  ],
};

function crmDonorDetailFor(donationId: string) {
  return {
    ...crmDonorDetail,
    giftHistory: [
      {
        ...crmDonorDetail.giftHistory[0]!,
        id: donationId,
        donationId,
        shared: { ...sharedGiftFields, donationId },
        inlineActions: inlineActionsFixture,
      },
    ],
  };
}

function contributionDetailPayloadFor(donationId: string) {
  return {
    contribution: {
      ...contributionDetailPayload.contribution,
      id: donationId,
      shared: { ...sharedGiftFields, donationId },
      revision: "2026-05-01T00:00:00.000Z#0",
      actionAvailability: inlineActionsFixture.entries,
    },
  };
}

let CrmPage: CrmPageComponent;
let dom: JSDOM | undefined;
let fetchDescriptor: PropertyDescriptor | undefined;

function mockQuery(partial: Record<string, unknown>) {
  return {
    isError: false,
    isPending: false,
    isLoading: false,
    isFetching: false,
    data: undefined,
    error: null as Error | null,
    refetch: vi.fn().mockResolvedValue({}),
    ...partial,
  };
}

function installDom() {
  dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost/crm",
  });

  globalThis.window = dom.window as unknown as Window & typeof globalThis;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.HTMLButtonElement = dom.window.HTMLButtonElement;
  globalThis.HTMLInputElement = dom.window.HTMLInputElement;
  globalThis.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
  globalThis.SVGElement = dom.window.SVGElement;
  globalThis.Element = dom.window.Element;
  globalThis.Node = dom.window.Node;
  globalThis.Event = dom.window.Event;
  globalThis.CustomEvent = dom.window.CustomEvent;
  globalThis.DocumentFragment = dom.window.DocumentFragment;
  globalThis.EventTarget = dom.window.EventTarget;
  globalThis.NodeFilter = dom.window.NodeFilter;
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
}

describe("apps/admin/app/crm gift detail entry", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    if (fetchDescriptor) {
      Object.defineProperty(globalThis, "fetch", fetchDescriptor);
    } else {
      Reflect.deleteProperty(globalThis, "fetch");
    }
    dom?.window.close();
    dom = undefined;
  });

  beforeEach(async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
    mockSearch = "";
    fetchDescriptor = Object.getOwnPropertyDescriptor(globalThis, "fetch");
    installDom();

    const pageModule = await import("../../../../../apps/admin/app/crm/page");
    CrmPage = pageModule.default;

    useAdminCrmRecordsInfiniteGridMock.mockReturnValue({
      columnFilters: [],
      hasMore: false,
      isFetchingMore: false,
      isLoading: false,
      loadMore: vi.fn(),
      onFiltersChange: vi.fn(),
      onRefresh: vi.fn().mockResolvedValue(undefined),
      onSortingChange: vi.fn(),
      rows: [crmGridRow],
      sorting: [],
      tableError: null,
    });
    useAdminCrmRecordDetailMock.mockReturnValue(
      mockQuery({ data: crmDonorDetail }),
    );
    useCreateLinkedCrmNoteMock.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn().mockResolvedValue({}),
    });
    useCrmTablePreferencesMock.mockReturnValue(mockQuery({ data: undefined }));
    useSaveCrmRowActionPinMock.mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
    });
    useSaveCrmViewSettingsMock.mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
    });
    useCrmNamedViewsMock.mockReturnValue(mockQuery({ data: undefined }));
    useCreateCrmNamedViewMock.mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
    });
    useUpdateCrmNamedViewMock.mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
    });
    useDeleteCrmNamedViewMock.mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
    });
  }, 30_000);

  it("opens the shared contribution detail for the same donation.id the Hub uses", async () => {
    mockSearch = `donor=${DONOR_RECORD_ID}`;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => contributionDetailPayload,
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = render(
      <QueryProvider>
        <CrmPage />
      </QueryProvider>,
    );

    const giftButton = await view.findByRole("button", {
      name: /open gift detail for \$250\.00/i,
    });
    fireEvent.click(giftButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/admin/contribution-operations/${DONATION_ID}`,
        { headers: { accept: "application/json" } },
      );
    });

    expect(routerPushMock).toHaveBeenCalledWith(
      `/crm?donor=${DONOR_RECORD_ID}&gift=${DONATION_ID}`,
      { scroll: false },
    );

    expect(await view.findByText("Clean Water Initiative")).toBeTruthy();
    expect(view.getAllByText("Alice Johnson").length).toBeGreaterThan(0);
  });

  it("renders the next-best action and a grouped, filtered more-actions menu", async () => {
    const donationId = "00000000-0000-4000-8000-00000000d002";
    mockSearch = `donor=${DONOR_RECORD_ID}`;
    useAdminCrmRecordDetailMock.mockReturnValue(
      mockQuery({ data: crmDonorDetailFor(donationId) }),
    );
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: vi.fn().mockResolvedValue({
        ok: true,
        json: async () => contributionDetailPayloadFor(donationId),
      }),
    });

    const view = render(
      <QueryProvider>
        <CrmPage />
      </QueryProvider>,
    );

    // One server-computed next-best action per row (#270).
    expect(
      await view.findByRole("button", { name: "Send receipt" }),
    ).toBeTruthy();

    const trigger = view.getByRole("button", { name: "More gift actions" });
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
    fireEvent.keyDown(trigger, { key: "Enter" });

    // Capability/state-filtered entries grouped by operation category.
    expect(await view.findByText("Correction")).toBeTruthy();
    expect(view.getByText("Receipt")).toBeTruthy();
    expect(view.getByText("Refund")).toBeTruthy();
    expect(view.getByText("Correct gift amount")).toBeTruthy();
    expect(view.getByText("Correct fund designation")).toBeTruthy();
    const refundItem = view.getByText("Refund gift").closest("[role=menuitem]");
    expect(refundItem?.textContent).toContain("Blocked");
    // Entries the server filtered out never render.
    expect(view.queryByText("Replay provider webhook")).toBeNull();
  });

  it("submits inline operations through the shared contract and stays in CRM", async () => {
    const donationId = "00000000-0000-4000-8000-00000000d003";
    mockSearch = `donor=${DONOR_RECORD_ID}`;
    const detailRefetch = vi.fn().mockResolvedValue({});
    useAdminCrmRecordDetailMock.mockReturnValue(
      mockQuery({
        data: crmDonorDetailFor(donationId),
        refetch: detailRefetch,
      }),
    );
    const fetchMock = vi
      .fn()
      .mockImplementation(async (url: string, init?: RequestInit) => {
        if (String(url).includes("/actions")) {
          return {
            ok: true,
            init,
            json: async () => ({
              result: {
                auditEventId: "audit-9",
                approvalStatus: "applied",
                taskIds: [],
                canonicalContribution: {},
              },
            }),
          };
        }
        return {
          ok: true,
          json: async () => contributionDetailPayloadFor(donationId),
        };
      });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = render(
      <QueryProvider>
        <CrmPage />
      </QueryProvider>,
    );

    fireEvent.click(await view.findByRole("button", { name: "Send receipt" }));

    // The reusable operation shell opens with the shared contract context.
    const shell = await view.findByTestId("contribution-operation-shell");
    const submit = await within(shell).findByRole("button", {
      name: "Send receipt",
    });
    await waitFor(() => {
      expect(submit).toHaveProperty("disabled", false);
    });
    fireEvent.click(submit);

    // The result stays in CRM — no navigation away.
    expect(await view.findByTestId("operation-result-panel")).toBeTruthy();
    expect(view.getByText(/audit event: audit-9/i)).toBeTruthy();
    expect(routerPushMock).not.toHaveBeenCalled();

    // Same shared operation contract as contribution detail.
    const actionCall = fetchMock.mock.calls.find(([url]) =>
      String(url).includes("/actions"),
    );
    const body = JSON.parse((actionCall![1] as RequestInit).body as string);
    expect(body).toMatchObject({
      actionType: "resend_receipt",
      contributionId: donationId,
      stagedGiftId: "staged-1",
      sourceSurface: "donor_crm_record",
      expectedRevision: "2026-05-01T00:00:00.000Z#0",
      payload: { stagedGiftId: "staged-1" },
    });
    expect(typeof body.idempotencyKey).toBe("string");
    expect(body.idempotencyKey.length).toBeGreaterThan(10);

    // Shared row data refreshes in place after the operation.
    expect(detailRefetch).toHaveBeenCalled();
  });

  it("shows a valid pinned action as the row action", async () => {
    const donationId = "00000000-0000-4000-8000-00000000d004";
    mockSearch = `donor=${DONOR_RECORD_ID}`;
    useAdminCrmRecordDetailMock.mockReturnValue(
      mockQuery({ data: crmDonorDetailFor(donationId) }),
    );
    useCrmTablePreferencesMock.mockReturnValue(
      mockQuery({
        data: {
          tableId: "crm.giftHistory",
          schemaVersion: 1,
          user: { actionId: "amount_correction", schemaVersion: 1 },
          tenantDefault: null,
        },
      }),
    );
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: vi.fn().mockResolvedValue({
        ok: true,
        json: async () => contributionDetailPayloadFor(donationId),
      }),
    });

    const view = render(
      <QueryProvider>
        <CrmPage />
      </QueryProvider>,
    );

    // The pin replaces the system next-best (Send receipt) as the row action.
    expect(
      await view.findByRole("button", { name: /correct gift amount/i }),
    ).toBeTruthy();
    expect(view.queryByRole("button", { name: "Send receipt" })).toBeNull();
  });

  it("falls back from a blocked pin to the tenant default with explanation", async () => {
    const donationId = "00000000-0000-4000-8000-00000000d005";
    mockSearch = `donor=${DONOR_RECORD_ID}`;
    useAdminCrmRecordDetailMock.mockReturnValue(
      mockQuery({ data: crmDonorDetailFor(donationId) }),
    );
    useCrmTablePreferencesMock.mockReturnValue(
      mockQuery({
        data: {
          tableId: "crm.giftHistory",
          schemaVersion: 1,
          // The fixture's refund entry is blocked for this gift.
          user: { actionId: "refund", schemaVersion: 1 },
          tenantDefault: { actionId: "fund_correction", schemaVersion: 1 },
        },
      }),
    );
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: vi.fn().mockResolvedValue({
        ok: true,
        json: async () => contributionDetailPayloadFor(donationId),
      }),
    });

    const view = render(
      <QueryProvider>
        <CrmPage />
      </QueryProvider>,
    );

    expect(
      await view.findByRole("button", { name: /correct fund designation/i }),
    ).toBeTruthy();
    // The fallback is explained, never silent (#271).
    expect(view.getByRole("note").textContent).toMatch(
      /pinned action .* is blocked/i,
    );
  });

  it("pins a row action by stable operation id from the menu", async () => {
    const donationId = "00000000-0000-4000-8000-00000000d006";
    mockSearch = `donor=${DONOR_RECORD_ID}`;
    useAdminCrmRecordDetailMock.mockReturnValue(
      mockQuery({ data: crmDonorDetailFor(donationId) }),
    );
    const pinMutate = vi.fn();
    useSaveCrmRowActionPinMock.mockReturnValue({
      isPending: false,
      mutate: pinMutate,
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: vi.fn().mockResolvedValue({
        ok: true,
        json: async () => contributionDetailPayloadFor(donationId),
      }),
    });

    const view = render(
      <QueryProvider>
        <CrmPage />
      </QueryProvider>,
    );

    const trigger = await view.findByRole("button", {
      name: "More gift actions",
    });
    fireEvent.keyDown(trigger, { key: "Enter" });

    const subTrigger = await view.findByText("Pin row action");
    fireEvent.keyDown(subTrigger, { key: "ArrowRight" });

    const pinOption = await view.findByRole("menuitemradio", {
      name: "Correct gift amount",
    });
    fireEvent.click(pinOption);

    await waitFor(() => {
      expect(pinMutate).toHaveBeenCalledWith(
        "amount_correction",
        expect.anything(),
      );
    });
  });

  it("applies view settings columns, filter, and sort to the gift list", async () => {
    const giftA = "00000000-0000-4000-8000-00000000d007";
    const giftB = "00000000-0000-4000-8000-00000000d008";
    mockSearch = `donor=${DONOR_RECORD_ID}`;
    const base = crmDonorDetailFor(giftA).giftHistory[0]!;
    useAdminCrmRecordDetailMock.mockReturnValue(
      mockQuery({
        data: {
          ...crmDonorDetail,
          giftHistory: [
            base,
            {
              ...base,
              id: giftB,
              donationId: giftB,
              amountCents: 10_000,
              shared: {
                ...sharedGiftFields,
                donationId: giftB,
                amountCents: 10_000,
              },
            },
          ],
        },
      }),
    );
    useCrmTablePreferencesMock.mockReturnValue(
      mockQuery({
        data: {
          tableId: "crm.giftHistory",
          schemaVersion: 1,
          user: {
            actionId: null,
            schemaVersion: 1,
            settings: {
              columns: { designation: false },
              filtersSort: {
                sortField: "amountCents",
                sortDirection: "asc",
                paymentStatus: "all",
              },
            },
          },
          tenantDefault: null,
        },
      }),
    );
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: vi.fn().mockResolvedValue({
        ok: true,
        json: async () => contributionDetailPayloadFor(giftA),
      }),
    });

    const view = render(
      <QueryProvider>
        <CrmPage />
      </QueryProvider>,
    );

    const giftButtons = await view.findAllByRole("button", {
      name: /open gift detail for/i,
    });
    // Ascending amount sort puts the $100 gift first.
    expect(giftButtons[0]?.textContent).toContain("$100.00");
    expect(giftButtons[1]?.textContent).toContain("$250.00");
    // The designation column is hidden by the user preference.
    expect(view.queryByText("Clean Water Initiative")).toBeNull();
  });

  it("previews a scoped reset before applying it", async () => {
    const donationId = "00000000-0000-4000-8000-00000000d009";
    mockSearch = `donor=${DONOR_RECORD_ID}`;
    useAdminCrmRecordDetailMock.mockReturnValue(
      mockQuery({ data: crmDonorDetailFor(donationId) }),
    );
    useCrmTablePreferencesMock.mockReturnValue(
      mockQuery({
        data: {
          tableId: "crm.giftHistory",
          schemaVersion: 1,
          user: {
            actionId: null,
            schemaVersion: 1,
            settings: { columns: { designation: false } },
          },
          tenantDefault: {
            actionId: null,
            schemaVersion: 1,
            settings: { columns: { designation: true, statusLine: true } },
          },
        },
      }),
    );
    const viewSettingsMutate = vi.fn();
    useSaveCrmViewSettingsMock.mockReturnValue({
      isPending: false,
      mutate: viewSettingsMutate,
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: vi.fn().mockResolvedValue({
        ok: true,
        json: async () => contributionDetailPayloadFor(donationId),
      }),
    });

    const view = render(
      <QueryProvider>
        <CrmPage />
      </QueryProvider>,
    );

    const trigger = await view.findByRole("button", {
      name: "Gift history view settings",
    });
    fireEvent.keyDown(trigger, { key: "Enter" });

    const resetSubTrigger = await view.findByText("Reset view settings");
    fireEvent.keyDown(resetSubTrigger, { key: "ArrowRight" });

    fireEvent.click(await view.findByText("Reset columns…"));

    // The reset previews the fallback before anything is applied.
    const preview = await view.findByTestId("view-settings-reset-preview");
    expect(preview.textContent).toMatch(
      /columns return to the tenant default/i,
    );
    expect(viewSettingsMutate).not.toHaveBeenCalled();

    fireEvent.click(view.getByRole("button", { name: "Reset" }));

    await waitFor(() => {
      expect(viewSettingsMutate).toHaveBeenCalledWith(
        { columns: null },
        expect.anything(),
      );
    });
  });

  it("applies the default named view automatically when no working preference exists", async () => {
    const donationId = "00000000-0000-4000-8000-00000000d00a";
    mockSearch = `donor=${DONOR_RECORD_ID}`;
    useAdminCrmRecordDetailMock.mockReturnValue(
      mockQuery({ data: crmDonorDetailFor(donationId) }),
    );
    useCrmTablePreferencesMock.mockReturnValue(
      mockQuery({
        data: {
          tableId: "crm.giftHistory",
          schemaVersion: 1,
          user: null,
          tenantDefault: null,
        },
      }),
    );
    useCrmNamedViewsMock.mockReturnValue(
      mockQuery({
        data: {
          tableId: "crm.giftHistory",
          views: [
            {
              id: "view-1",
              name: "Receipts focus",
              isDefault: true,
              schemaVersion: 1,
              pinnedActionId: "resend_receipt",
              settings: { columns: { designation: false } },
            },
          ],
        },
      }),
    );
    const viewSettingsMutate = vi.fn();
    useSaveCrmViewSettingsMock.mockReturnValue({
      isPending: false,
      mutate: viewSettingsMutate,
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: vi.fn().mockResolvedValue({
        ok: true,
        json: async () => contributionDetailPayloadFor(donationId),
      }),
    });

    render(
      <QueryProvider>
        <CrmPage />
      </QueryProvider>,
    );

    await waitFor(() => {
      expect(viewSettingsMutate).toHaveBeenCalledWith(
        {
          columns: { designation: false },
          filtersSort: null,
          pinnedActionId: "resend_receipt",
          activeViewId: "view-1",
        },
        expect.anything(),
      );
    });
  });

  it("deleting the default view asks for a replacement default", async () => {
    const donationId = "00000000-0000-4000-8000-00000000d00b";
    mockSearch = `donor=${DONOR_RECORD_ID}`;
    useAdminCrmRecordDetailMock.mockReturnValue(
      mockQuery({ data: crmDonorDetailFor(donationId) }),
    );
    useCrmTablePreferencesMock.mockReturnValue(
      mockQuery({
        data: {
          tableId: "crm.giftHistory",
          schemaVersion: 1,
          user: {
            actionId: null,
            schemaVersion: 1,
            settings: { activeViewId: "view-1" },
          },
          tenantDefault: null,
        },
      }),
    );
    useCrmNamedViewsMock.mockReturnValue(
      mockQuery({
        data: {
          tableId: "crm.giftHistory",
          views: [
            {
              id: "view-1",
              name: "Default view",
              isDefault: true,
              schemaVersion: 1,
              pinnedActionId: null,
              settings: null,
            },
            {
              id: "view-2",
              name: "Backup view",
              isDefault: false,
              schemaVersion: 1,
              pinnedActionId: null,
              settings: null,
            },
          ],
        },
      }),
    );
    const deleteMutate = vi.fn();
    useDeleteCrmNamedViewMock.mockReturnValue({
      isPending: false,
      mutate: deleteMutate,
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: vi.fn().mockResolvedValue({
        ok: true,
        json: async () => contributionDetailPayloadFor(donationId),
      }),
    });

    const view = render(
      <QueryProvider>
        <CrmPage />
      </QueryProvider>,
    );

    // The compact switcher sits near the gift-history toolbar and shows
    // the active view name.
    const switcher = await view.findByRole("button", {
      name: "Gift history views",
    });
    expect(switcher.textContent).toContain("Default view");
    fireEvent.keyDown(switcher, { key: "Enter" });

    fireEvent.click(await view.findByText("Delete view…"));

    const dialog = await view.findByTestId("named-view-delete-dialog");
    expect(dialog.textContent).toMatch(/choose another default/i);

    fireEvent.click(
      within(dialog).getByLabelText(/make “backup view” the default/i),
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Delete view" }),
    );

    await waitFor(() => {
      expect(deleteMutate).toHaveBeenCalledWith(
        { viewId: "view-1", nextDefaultViewId: "view-2" },
        expect.anything(),
      );
    });
  });
});
