/** @vitest-environment jsdom */

import { QueryProvider } from "@asym/database/providers";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { JSDOM } from "jsdom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type CrmPageComponent =
  typeof import("../../../../../apps/admin/app/crm/page").default;

const useAdminCrmRecordsInfiniteGridMock = vi.fn();
const useAdminCrmRecordDetailMock = vi.fn();
const useCreateLinkedCrmNoteMock = vi.fn();
const useResendCrmGiftReceiptMock = vi.fn();

vi.mock("@asym/database/hooks", () => ({
  ADMIN_CRM_RECORD_DETAIL_QUERY_KEY: ["admin", "crm", "records", "detail"],
  ADMIN_CRM_RECORDS_QUERY_KEY: ["admin", "crm", "records"],
  MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY: [
    "admin",
    "mission-control",
    "needs-attention",
  ],
  useAdminCrmRecordDetail: useAdminCrmRecordDetailMock,
  useAdminCrmRecordsInfiniteGrid: useAdminCrmRecordsInfiniteGridMock,
  useCreateLinkedCrmNote: useCreateLinkedCrmNoteMock,
  useResendCrmGiftReceipt: useResendCrmGiftReceiptMock,
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
      canResendReceipt: true,
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
    useResendCrmGiftReceiptMock.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn().mockResolvedValue({}),
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
});
