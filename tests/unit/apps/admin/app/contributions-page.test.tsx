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

import type { ReactNode } from "react";

type ContributionsPageComponent =
  typeof import("../../../../../apps/admin/app/contributions/page-client").default;
type InvalidateContributionOperationQueries =
  typeof import("../../../../../apps/admin/app/contributions/page-client").invalidateContributionOperationQueries;
type ContributionsDataModule =
  typeof import("../../../../../apps/admin/app/contributions/data");
type UseAdminContributionsModule =
  typeof import("../../../../../apps/admin/app/contributions/use-admin-contributions");
type DatabaseHooksModule = typeof import("@asym/database/hooks");

const useAdminContributionsMock = vi.fn();
const useMissionControlNeedsAttentionMock = vi.fn();
const ADMIN_CONTRIBUTIONS_QUERY_KEY_VALUE = ["admin", "contributions"] as const;
const MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY_VALUE = [
  "admin",
  "mission-control",
  "needs-attention",
] as const;
const ADMIN_CRM_RECORD_DETAIL_QUERY_KEY_VALUE = [
  "admin",
  "crm",
  "records",
  "detail",
] as const;
const ADMIN_CRM_RECORDS_QUERY_KEY_VALUE = ["admin", "crm", "records"] as const;

vi.mock("@asym/database/hooks", () => ({
  ADMIN_CRM_RECORD_DETAIL_QUERY_KEY: ADMIN_CRM_RECORD_DETAIL_QUERY_KEY_VALUE,
  ADMIN_CRM_RECORDS_QUERY_KEY: ADMIN_CRM_RECORDS_QUERY_KEY_VALUE,
  MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY:
    MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY_VALUE,
  useMissionControlNeedsAttention: useMissionControlNeedsAttentionMock,
}));

const routerPushMock = vi.fn();
const routerReplaceMock = vi.fn();
let mockSearch = "";

vi.mock("next/navigation", () => ({
  usePathname: () => "/contributions",
  useRouter: () => ({
    push: routerPushMock,
    replace: routerReplaceMock,
  }),
  useSearchParams: () => new URLSearchParams(mockSearch),
}));

vi.mock(
  "../../../../../apps/admin/app/contributions/use-admin-contributions",
  async () => {
    const dataModule =
      await import("../../../../../apps/admin/app/contributions/data");

    return {
      ADMIN_CONTRIBUTIONS_QUERY_KEY: ADMIN_CONTRIBUTIONS_QUERY_KEY_VALUE,
      loadMockAdminContributions: () =>
        dataModule.mockContributions.map((contribution) => ({
          ...contribution,
        })),
      useAdminContributions: useAdminContributionsMock,
    };
  },
);

vi.mock("sonner", () => ({
  toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

/**
 * Compat shim for the AL-265 split: the operation shell (mounted by the
 * detail overlay for refunds) imports `isFailedProviderOutcomeStatus`, whose
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

vi.mock("@asym/ui/components/boneyard-skeleton", () => ({
  BoneyardSkeleton: ({
    children,
    fallback,
    loading,
    name,
  }: {
    children: ReactNode;
    fallback?: ReactNode;
    loading?: boolean;
    name?: string;
  }) => (
    <div data-boneyard={name} data-testid={`boneyard-${name ?? "unnamed"}`}>
      {loading ? fallback : children}
    </div>
  ),
}));

let ContributionsPage: ContributionsPageComponent;
let ADMIN_CONTRIBUTIONS_QUERY_KEY: UseAdminContributionsModule["ADMIN_CONTRIBUTIONS_QUERY_KEY"];
let MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY: DatabaseHooksModule["MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY"];
let boneyardContributionsFixture: ContributionsDataModule["boneyardContributionsFixture"];
let dom: JSDOM | undefined;
let fetchDescriptor: PropertyDescriptor | undefined;
let loadMockAdminContributions: UseAdminContributionsModule["loadMockAdminContributions"];
let mockContributions: ContributionsDataModule["mockContributions"];
let windowConfirmDescriptor: PropertyDescriptor | undefined;
let invalidateContributionOperationQueries: InvalidateContributionOperationQueries;

function makeDetailPayload(donationId: string, donorName: string) {
  return {
    contribution: {
      id: donationId,
      shared: {
        donationId,
        amountCents: 10000,
        currencyCode: "USD",
        giftDate: "2026-05-26T00:00:00.000Z",
        donorId: "donor_1",
        donorName,
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
      donor: {
        id: "donor_1",
        profileId: null,
        name: donorName,
        email: "donor@example.com",
        phoneNumbers: [],
        location: null,
        organization: null,
      },
      gift: {
        date: "2026-05-26T00:00:00.000Z",
        createdAt: "2026-05-26T00:00:00.000Z",
        updatedAt: "2026-05-26T00:00:00.000Z",
        source: "online",
        campaignId: null,
        pledgeId: null,
      },
      amount: {
        value: 10000,
        gross: 10000,
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
          paymentIntentId: null,
          chargeId: null,
          refundIds: [],
          replayContext: null,
        },
      },
      receipt: { status: "pending", statementStatus: null },
      refund: { status: "none", amount: 0, refundedAt: null },
      recurring: {
        isRecurring: false,
        interval: null,
        pledgeId: null,
        agreement: null,
        providerRecurrenceWithoutAgreement: false,
      },
      stagedGift: null,
      crm: {
        postStatus: null,
        twentyRecordId: null,
        parent: { status: null, twentyRecordId: null, lastError: null },
        designationRecords: [],
        failedScopes: [],
        adapterLimitation: null,
      },
      auditEvents: [],
      corrections: [],
      // Original donation truth — the refund shell derives its figures from
      // this basis, never the adjusted effective amount (#265).
      original: {
        amountCents: 10000,
        fundId: "fund_1",
        missionaryId: null,
        paymentStatus: "completed",
      },
      tasks: [],
      batches: [],
      donorVisible: {
        status: "Succeeded",
        historyUpdatedImmediately: true,
        amount: 10000,
        currency: "USD",
      },
    },
  };
}

function mockQuery(partial: Record<string, unknown>) {
  return {
    isError: false,
    isPending: false,
    data: undefined,
    error: null as Error | null,
    refetch: vi.fn().mockResolvedValue({}),
    ...partial,
  };
}

function renderContributionsPage() {
  return render(
    <QueryProvider>
      <ContributionsPage />
    </QueryProvider>,
  );
}

function installDom() {
  dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost",
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
  globalThis.PointerEvent = dom.window.MouseEvent as typeof PointerEvent;
  dom.window.PointerEvent = dom.window.MouseEvent as typeof PointerEvent;
  globalThis.KeyboardEvent = dom.window.KeyboardEvent;
  globalThis.MutationObserver = dom.window.MutationObserver;
  globalThis.getComputedStyle = dom.window.getComputedStyle;
  globalThis.Element.prototype.getAnimations ??= function getAnimations() {
    return [];
  };
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
}

async function loadEnvSensitiveModules() {
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";

  const useAdminContributionsModule =
    await import("../../../../../apps/admin/app/contributions/use-admin-contributions");
  const databaseHooksModule = await import("@asym/database/hooks");
  const dataModule =
    await import("../../../../../apps/admin/app/contributions/data");
  const pageClientModule =
    await import("../../../../../apps/admin/app/contributions/page-client");

  ContributionsPage = pageClientModule.default;
  invalidateContributionOperationQueries =
    pageClientModule.invalidateContributionOperationQueries;
  boneyardContributionsFixture = dataModule.boneyardContributionsFixture;
  mockContributions = dataModule.mockContributions;
  loadMockAdminContributions =
    useAdminContributionsModule.loadMockAdminContributions;
  ADMIN_CONTRIBUTIONS_QUERY_KEY =
    useAdminContributionsModule.ADMIN_CONTRIBUTIONS_QUERY_KEY;
  MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY =
    databaseHooksModule.MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY;
}

describe("apps/admin/app/contributions/page-client", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
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

  beforeEach(async () => {
    delete process.env.NEXT_PUBLIC_ADMIN_CONTRIBUTIONS_USE_MOCK;
    mockSearch = "";
    fetchDescriptor = Object.getOwnPropertyDescriptor(globalThis, "fetch");
    installDom();
    await loadEnvSensitiveModules();

    useAdminContributionsMock.mockReset();
    useAdminContributionsMock.mockReturnValue(
      mockQuery({
        isError: false,
        isPending: false,
        data: [],
        error: null,
      }),
    );
    useMissionControlNeedsAttentionMock.mockReturnValue(
      mockQuery({
        data: { groups: [], items: [] },
        isError: false,
        isPending: false,
      }),
    );
  }, 90_000);

  it("exports a client component (function) that renders the contributions UI", () => {
    expect(typeof ContributionsPage).toBe("function");
  });

  it("renders contributions shell with empty data", async () => {
    const view = renderContributionsPage();

    await waitFor(() => {
      expect(view.getByRole("heading", { name: "Contributions" })).toBeTruthy();
    });

    expect(view.getByTestId("mc-contributions-live")).toBeTruthy();
    expect(view.getByText("No contributions found")).toBeTruthy();
  });

  it("shows load failed and retry when the query is in error state", () => {
    useAdminContributionsMock.mockReturnValue(
      mockQuery({
        isError: true,
        isPending: false,
        data: undefined,
        error: new Error("Upstream unavailable"),
      }),
    );

    const view = renderContributionsPage();

    expect(view.getByRole("heading", { name: "Load failed" })).toBeTruthy();
    expect(view.getByText("Upstream unavailable")).toBeTruthy();
    expect(view.getByRole("button", { name: /retry/i })).toBeTruthy();
    expect(view.queryByText("Sarah Mitchell")).toBeNull();
  });

  it("renders contribution rows when the query succeeds", () => {
    const rows = boneyardContributionsFixture;
    useAdminContributionsMock.mockReturnValue(
      mockQuery({
        isError: false,
        isPending: false,
        data: rows,
        error: null,
      }),
    );

    const view = renderContributionsPage();

    expect(view.getByText(rows[0]!.donorName!)).toBeTruthy();
    expect(view.queryByRole("heading", { name: "Load failed" })).toBeNull();
  });

  it("renders Needs Attention groups from Mission Control task state", () => {
    const rows = boneyardContributionsFixture;
    useAdminContributionsMock.mockReturnValue(
      mockQuery({
        isError: false,
        isPending: false,
        data: rows,
        error: null,
      }),
    );
    useMissionControlNeedsAttentionMock.mockReturnValue(
      mockQuery({
        data: {
          groups: [
            {
              key: "critical:donor_notification_failed",
              title: "Donor notification",
              urgency: "critical",
              count: 1,
              items: [
                {
                  id: "attention_1",
                  taskId: "task_1",
                  issueType: "donor_notification_failed",
                  issueLabel: "Donor notification",
                  urgency: "critical",
                  status: "open",
                  summary: "Donor correction email failed",
                  contributionId: rows[0]!.id,
                  donorId: rows[0]!.donorId,
                  firstSeenAt: "2026-05-26T00:00:00.000Z",
                  lastSeenAt: "2026-05-26T01:00:00.000Z",
                },
              ],
            },
          ],
          items: [],
        },
        isError: false,
        isPending: false,
      }),
    );

    const view = renderContributionsPage();

    expect(view.getByText("Needs Attention")).toBeTruthy();
    expect(view.getByText("Donor notification")).toBeTruthy();
    expect(view.getByText("Donor correction email failed")).toBeTruthy();
  });

  it("loads contribution detail when an attention item is outside the current table rows", async () => {
    useAdminContributionsMock.mockReturnValue(
      mockQuery({
        isError: false,
        isPending: false,
        data: [],
        error: null,
      }),
    );
    useMissionControlNeedsAttentionMock.mockReturnValue(
      mockQuery({
        data: {
          groups: [
            {
              key: "high:crm_post_failed",
              title: "CRM post",
              urgency: "high",
              count: 1,
              items: [
                {
                  id: "attention_1",
                  taskId: "task_1",
                  issueType: "crm_post_failed",
                  issueLabel: "CRM post",
                  urgency: "high",
                  status: "open",
                  summary: "CRM post failed",
                  contributionId: "00000000-0000-4000-8000-000000000123",
                  donorId: "donor_1",
                  firstSeenAt: "2026-05-26T00:00:00.000Z",
                  lastSeenAt: "2026-05-26T01:00:00.000Z",
                },
              ],
            },
          ],
          items: [],
        },
        isError: false,
        isPending: false,
      }),
    );
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        contribution: {
          id: "00000000-0000-4000-8000-000000000123",
          shared: {
            donationId: "00000000-0000-4000-8000-000000000123",
            amountCents: 10000,
            currencyCode: "USD",
            giftDate: "2026-05-26T00:00:00.000Z",
            donorId: "donor_1",
            donorName: "Remote Donor",
            designationSummary: {
              fundId: "fund_1",
              fundName: "General Fund",
              missionaryId: null,
              missionaryName: null,
            },
            paymentStatus: "completed",
            receiptStatus: "pending",
            crmPostStatus: "failed",
            refundState: "none",
            refundedAmountCents: 0,
            correctionState: "none",
          },
          donor: {
            id: "donor_1",
            profileId: "profile_1",
            name: "Remote Donor",
            email: "remote@example.com",
            phoneNumbers: [],
            location: null,
            organization: null,
          },
          gift: {
            date: "2026-05-26T00:00:00.000Z",
            createdAt: "2026-05-26T00:00:00.000Z",
            updatedAt: "2026-05-26T00:00:00.000Z",
            source: "online",
            campaignId: null,
            pledgeId: null,
          },
          amount: {
            value: 10000,
            gross: 10000,
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
              paymentIntentId: "pi_123",
              chargeId: "ch_123",
              refundIds: [],
              replayContext: null,
            },
          },
          designation: {
            fundId: "fund_1",
            fundName: "General Fund",
            missionaryId: null,
            missionaryName: null,
            projectId: null,
          },
          receipt: {
            status: "pending",
            statementStatus: null,
          },
          refund: {
            status: "none",
            amount: 0,
            refundedAt: null,
          },
          recurring: {
            isRecurring: false,
            interval: null,
            pledgeId: null,
          },
          stagedGift: null,
          crm: {
            postStatus: "failed",
            twentyRecordId: null,
            parent: {
              status: "failed",
              twentyRecordId: null,
              lastError: "Twenty rejected the gift record.",
            },
            designationRecords: [],
            failedScopes: [{ scope: "parent" }],
            adapterLimitation: null,
          },
          auditEvents: [],
          corrections: [],
          tasks: [],
          batches: [],
          donorVisible: {
            status: "Succeeded",
            historyUpdatedImmediately: true,
            amount: 10000,
            currency: "USD",
          },
        },
      }),
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = renderContributionsPage();

    fireEvent.click(view.getByRole("button", { name: /open contribution/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/contribution-operations/00000000-0000-4000-8000-000000000123",
        { headers: { accept: "application/json" } },
      );
    });
    expect(await view.findByText("Remote Donor")).toBeTruthy();
    expect(routerPushMock).toHaveBeenCalledWith(
      "/contributions?gift=00000000-0000-4000-8000-000000000123",
      { scroll: false },
    );
  });

  it("opens the shared detail overlay from a ?gift= deep link without any row click", async () => {
    mockSearch = "gift=00000000-0000-4000-8000-000000000124";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        contribution: {
          id: "00000000-0000-4000-8000-000000000124",
          shared: {
            donationId: "00000000-0000-4000-8000-000000000124",
            amountCents: 10000,
            currencyCode: "USD",
            giftDate: "2026-05-26T00:00:00.000Z",
            donorId: "donor_1",
            donorName: "Deep Link Donor",
            designationSummary: {
              fundId: "fund_1",
              fundName: "General Fund",
              missionaryId: null,
              missionaryName: null,
            },
            paymentStatus: "completed",
            receiptStatus: "pending",
            crmPostStatus: null,
            refundState: "none",
            refundedAmountCents: 0,
            correctionState: "none",
          },
          donor: {
            id: "donor_1",
            profileId: null,
            name: "Deep Link Donor",
            email: "deep@example.com",
            phoneNumbers: [],
            location: null,
            organization: null,
          },
          gift: {
            date: "2026-05-26T00:00:00.000Z",
            createdAt: "2026-05-26T00:00:00.000Z",
            updatedAt: "2026-05-26T00:00:00.000Z",
            source: "online",
            campaignId: null,
            pledgeId: null,
          },
          amount: {
            value: 10000,
            gross: 10000,
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
              paymentIntentId: null,
              chargeId: null,
              refundIds: [],
              replayContext: null,
            },
          },
          designation: {
            fundId: "fund_1",
            fundName: "General Fund",
            missionaryId: null,
            missionaryName: null,
            projectId: null,
          },
          receipt: { status: "pending", statementStatus: null },
          refund: { status: "none", amount: 0, refundedAt: null },
          recurring: { isRecurring: false, interval: null, pledgeId: null },
          stagedGift: null,
          crm: {
            postStatus: null,
            twentyRecordId: null,
            parent: { status: null, twentyRecordId: null, lastError: null },
            designationRecords: [],
            failedScopes: [],
            adapterLimitation: null,
          },
          auditEvents: [],
          corrections: [],
          tasks: [],
          batches: [],
          donorVisible: {
            status: "Succeeded",
            historyUpdatedImmediately: true,
            amount: 10000,
            currency: "USD",
          },
        },
      }),
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = renderContributionsPage();

    expect(await view.findByText("Deep Link Donor")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/contribution-operations/00000000-0000-4000-8000-000000000124",
      { headers: { accept: "application/json" } },
    );
  });

  it("opens the shared refund operation shell from the Hub detail overlay", async () => {
    const donationId = "00000000-0000-4000-8000-00000000012a";
    mockSearch = `gift=${donationId}`;
    const detailPayload = makeDetailPayload(donationId, "Refund Donor");
    const refundableDetail = {
      contribution: {
        ...detailPayload.contribution,
        revision: "2026-05-26T00:00:00.000Z#0",
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
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => refundableDetail,
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = renderContributionsPage();

    // The Hub entry point renders enabled when refund is available.
    const refundButton = await view.findByRole("button", {
      name: /refund gift/i,
    });
    expect(refundButton).toHaveProperty("disabled", false);
    fireEvent.click(refundButton);

    // The existing reusable operation shell opens with refund context rows.
    const shell = await view.findByTestId("contribution-operation-shell");
    expect(
      within(shell).getByRole("heading", { name: "Refund gift" }),
    ).toBeTruthy();
    expect(await within(shell).findByText("Remaining refundable")).toBeTruthy();
    // Current amount and remaining refundable both show the $100.00 gift.
    expect(within(shell).getAllByText("$100.00").length).toBeGreaterThanOrEqual(
      2,
    );
  });

  it("renders a blocked refund reason inline in the Hub detail overlay", async () => {
    const donationId = "00000000-0000-4000-8000-00000000012b";
    mockSearch = `gift=${donationId}`;
    const detailPayload = makeDetailPayload(donationId, "Blocked Refund Donor");
    const blockedDetail = {
      contribution: {
        ...detailPayload.contribution,
        revision: "2026-05-26T00:00:00.000Z#0",
        actionAvailability: [
          {
            actionType: "refund",
            available: false,
            blockedReason:
              "This gift has no payment provider charge to refund against.",
            nextStep:
              "Offline gifts are corrected through adjustments rather than provider refunds.",
            riskLevel: "high",
          },
        ],
      },
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => blockedDetail,
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = renderContributionsPage();

    const refundButton = await view.findByRole("button", {
      name: /refund gift/i,
    });
    expect(refundButton).toHaveProperty("disabled", true);
    expect(
      view.getByText(/no payment provider charge to refund against/i),
    ).toBeTruthy();
    expect(view.queryByTestId("contribution-operation-shell")).toBeNull();
  });

  it("renders deep-linked detail source and anonymous state from shared row fields", async () => {
    const donationId = "00000000-0000-4000-8000-000000000129";
    mockSearch = `gift=${donationId}`;
    const detailPayload = makeDetailPayload(donationId, "Source Donor");
    detailPayload.contribution.gift.source = "mail";
    detailPayload.contribution.shared.donorId = null;

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => detailPayload,
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = renderContributionsPage();

    expect(await view.findByText("Anonymous Donor")).toBeTruthy();
    expect(view.getByText("Mail")).toBeTruthy();
  });

  it("posts a scoped designation retry through the shared actions contract", async () => {
    const donationId = "00000000-0000-4000-8000-000000000131";
    mockSearch = `gift=${donationId}`;
    const baseDetail = makeDetailPayload(donationId, "Scoped Retry Donor");
    const detailPayload = {
      contribution: {
        ...baseDetail.contribution,
        stagedGift: {
          id: "staged-9",
          status: "posted",
          receiptStatus: "sent",
          crmPostStatus: "failed",
          reviewReason: null,
          twentyRecordId: null,
        },
        actionAvailability: [
          {
            actionType: "retry_staged_gift",
            available: true,
            blockedReason: null,
            nextStep: null,
            riskLevel: "low",
          },
        ],
        crm: {
          postStatus: "failed",
          twentyRecordId: null,
          parent: {
            status: "posted",
            twentyRecordId: "twenty-parent-9",
            lastError: null,
          },
          designationRecords: [
            {
              allocationId: "alloc-2",
              status: "failed",
              twentyRecordId: null,
              lastError: "Twenty rejected the designation record.",
            },
          ],
          failedScopes: [{ scope: "designation", allocationId: "alloc-2" }],
          adapterLimitation: null,
        },
      },
    };
    const fetchMock = vi
      .fn()
      .mockImplementation(async (url: string, init?: RequestInit) => {
        if (String(url).includes("/actions")) {
          return {
            ok: true,
            init,
            json: async () => ({
              result: {
                auditEventId: "audit-31",
                taskIds: [],
                canonicalContribution: {},
              },
            }),
          };
        }
        return {
          ok: true,
          json: async () => detailPayload,
        };
      });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = renderContributionsPage();

    expect(await view.findByText("Twenty CRM posting")).toBeTruthy();
    expect(view.getByText(/rejected the designation record/i)).toBeTruthy();

    fireEvent.click(
      await view.findByRole("button", { name: /retry this line/i }),
    );

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([url]) => String(url).includes("/actions")),
      ).toBe(true);
    });

    const actionCall = fetchMock.mock.calls.find(([url]) =>
      String(url).includes("/actions"),
    );
    const body = JSON.parse((actionCall![1] as RequestInit).body as string);
    expect(body).toMatchObject({
      actionType: "retry_staged_gift",
      contributionId: donationId,
      stagedGiftId: "staged-9",
      payload: { scope: "designation", allocationId: "alloc-2" },
    });
  });

  it("strips invalid gift query params before fetching detail", async () => {
    mockSearch = "status=completed&gift=not-a-uuid";
    const fetchMock = vi.fn();
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    renderContributionsPage();

    await waitFor(() => {
      expect(routerReplaceMock).toHaveBeenCalledWith(
        "/contributions?status=completed",
        { scroll: false },
      );
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("smart close removes only the gift selection from route state", async () => {
    const donationId = "00000000-0000-4000-8000-000000000125";
    mockSearch = `status=completed&gift=${donationId}`;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makeDetailPayload(donationId, "Smart Close Donor"),
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = renderContributionsPage();
    expect(await view.findByText("Smart Close Donor")).toBeTruthy();

    fireEvent.click(
      view.getByRole("button", { name: /close contribution details/i }),
    );

    expect(routerReplaceMock).toHaveBeenCalledWith(
      "/contributions?status=completed",
      { scroll: false },
    );
  });

  it("restores focus to the opener when the detail overlay closes", async () => {
    const donationId = "00000000-0000-4000-8000-000000000126";
    useMissionControlNeedsAttentionMock.mockReturnValue(
      mockQuery({
        data: {
          groups: [
            {
              key: "high:crm_post_failed",
              title: "CRM post",
              urgency: "high",
              count: 1,
              items: [
                {
                  id: "attention_focus",
                  taskId: "task_focus",
                  issueType: "crm_post_failed",
                  issueLabel: "CRM post",
                  urgency: "high",
                  status: "open",
                  summary: "CRM post failed",
                  contributionId: donationId,
                  donorId: "donor_1",
                  firstSeenAt: "2026-05-26T00:00:00.000Z",
                  lastSeenAt: "2026-05-26T01:00:00.000Z",
                },
              ],
            },
          ],
          items: [],
        },
        isError: false,
        isPending: false,
      }),
    );
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makeDetailPayload(donationId, "Focus Donor"),
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: fetchMock,
    });

    const view = renderContributionsPage();
    const opener = view.getByRole("button", { name: /open contribution/i });
    opener.focus();
    fireEvent.click(opener);

    expect(await view.findByText("Focus Donor")).toBeTruthy();

    fireEvent.click(
      view.getByRole("button", { name: /close contribution details/i }),
    );

    await waitFor(() => {
      expect(document.activeElement).toBe(opener);
    });
  });

  it("invalidates every shared contribution surface after contribution mutations", async () => {
    const queryClient = {
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
    };

    await invalidateContributionOperationQueries(queryClient as never);

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ADMIN_CONTRIBUTIONS_QUERY_KEY,
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY,
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["admin", "contribution-detail"],
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ADMIN_CRM_RECORD_DETAIL_QUERY_KEY_VALUE,
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ADMIN_CRM_RECORDS_QUERY_KEY_VALUE,
    });
  });

  it("does not show load failed while the query is pending", () => {
    useAdminContributionsMock.mockReturnValue(
      mockQuery({
        isError: false,
        isPending: true,
        data: undefined,
        error: null,
      }),
    );

    const view = renderContributionsPage();

    expect(view.queryByRole("heading", { name: "Load failed" })).toBeNull();
    expect(
      view.container.querySelector(
        '[data-boneyard="admin-contributions-content"]',
      ),
    ).toBeTruthy();
  });

  it("loadMockAdminContributions returns shallow-cloned rows from mockContributions", () => {
    const data = loadMockAdminContributions();
    expect(data).toEqual(mockContributions);
    for (let i = 0; i < data.length; i++) {
      expect(data[i]).not.toBe(mockContributions[i]);
    }
  });

  it("keeps boneyard fixture timestamps deterministic", () => {
    expect(boneyardContributionsFixture).toMatchObject([
      {
        date: "2026-04-16T12:00:00.000Z",
        contributionDate: "2026-04-16T12:00:00.000Z",
        createdAt: "2026-04-16T12:00:00.000Z",
        updatedAt: "2026-04-16T12:00:00.000Z",
      },
      {
        date: "2026-04-16T12:00:00.000Z",
        contributionDate: "2026-04-16T12:00:00.000Z",
        createdAt: "2026-04-16T12:00:00.000Z",
        updatedAt: "2026-04-16T12:00:00.000Z",
      },
    ]);
  });
});
