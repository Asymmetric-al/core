/** @vitest-environment jsdom */

import { QueryProvider } from "@asym/database/providers";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { JSDOM } from "jsdom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type ContributionsPageComponent =
  typeof import("../../../../../apps/admin/app/contributions/page").default;
type InvalidateContributionOperationQueries =
  typeof import("../../../../../apps/admin/app/contributions/page-client").invalidateContributionOperationQueries;
type ContributionsDataModule =
  typeof import("../../../../../apps/admin/app/contributions/data");
type UseAdminContributionsModule =
  typeof import("../../../../../apps/admin/app/contributions/use-admin-contributions");
type DatabaseHooksModule = typeof import("@asym/database/hooks");

const useAdminContributionsMock = vi.fn();
const useContributionNeedsAttentionMock = vi.fn();
const ADMIN_CONTRIBUTIONS_QUERY_KEY_VALUE = ["admin", "contributions"] as const;
const MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY_VALUE = [
  "admin",
  "mission-control",
  "needs-attention",
] as const;

vi.mock("@asym/database/hooks", () => ({
  MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY:
    MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY_VALUE,
  useContributionNeedsAttention: useContributionNeedsAttentionMock,
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
}

async function loadEnvSensitiveModules() {
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";

  const [
    contributionsPageModule,
    pageClientModule,
    dataModule,
    useAdminContributionsModule,
    databaseHooksModule,
  ] = await Promise.all([
    import("../../../../../apps/admin/app/contributions/page"),
    import("../../../../../apps/admin/app/contributions/page-client"),
    import("../../../../../apps/admin/app/contributions/data"),
    import("../../../../../apps/admin/app/contributions/use-admin-contributions"),
    import("@asym/database/hooks"),
  ]);

  ContributionsPage = contributionsPageModule.default;
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

describe("apps/admin/app/contributions/page", () => {
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
    useContributionNeedsAttentionMock.mockReturnValue(
      mockQuery({
        data: { groups: [], items: [] },
        isError: false,
        isPending: false,
      }),
    );
  }, 30_000);

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
    useContributionNeedsAttentionMock.mockReturnValue(
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
    useContributionNeedsAttentionMock.mockReturnValue(
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
  });

  it("invalidates contributions and Needs Attention after contribution mutations", async () => {
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
