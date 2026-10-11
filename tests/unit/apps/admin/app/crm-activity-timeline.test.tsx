/** @vitest-environment jsdom */
/** @vitest-environment-options {"url": "http://localhost/crm"} */

import { formatCurrency } from "@asym/lib/utils";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  QueryClient,
  QueryClientProvider,
} from "../../../../../apps/admin/node_modules/@tanstack/react-query/build/modern/index.js";

import type { CrmRecord } from "../../../../../apps/admin/app/(app)/crm/types";
import type {
  CrmDonorDetailResponse,
  CrmGiftHistoryRow,
  CrmNamedViewsResponse,
  CrmTablePreferencesResponse,
} from "@asym/database/types";

const DONOR_ID = "crm-amount-donor";
const DONATION_ID = "00000000-0000-4000-8000-000000001990";
const GIFT_DATE = "2026-10-01T12:00:00.000Z";
const FUND_NAME = "Timeline regression fund";

const contact: CrmRecord = {
  id: DONOR_ID,
  recordType: "individual",
  displayName: "Timeline Regression Donor",
  title: null,
  primaryOrganization: null,
  primaryContactLine: "timeline@example.invalid",
  location: null,
  lifecycleStatus: "active",
  lastGiftAt: GIFT_DATE,
  lifetimeGiving: 0,
  fundsGivenToSummary: null,
  lastTouchAt: null,
  nextTaskSummary: null,
  portalAccessLabel: "none",
  linkedAuthUserId: null,
  tags: [],
  assignedMissionaryName: null,
  avatarUrl: null,
  email: "timeline@example.invalid",
  phone: null,
  notesPreview: null,
  createdAt: GIFT_DATE,
  updatedAt: GIFT_DATE,
  activities: [],
};

// Literal HTTP response data, not values derived through production builders.
function giftRow(amountCents: number, currencyCode: string): CrmGiftHistoryRow {
  return {
    id: DONATION_ID,
    donationId: DONATION_ID,
    stagedGiftId: null,
    amountCents,
    currencyCode,
    giftDate: GIFT_DATE,
    paymentStatus: "completed",
    receiptStatus: "sent",
    crmPostStatus: "not_required",
    refundState: "none",
    correctionState: "none",
    twentyRecordId: null,
    fundId: "timeline-fund",
    fundName: FUND_NAME,
    missionaryId: null,
    missionaryName: null,
    inlineActions: { nextBestActionType: null, entries: [] },
    shared: {
      donationId: DONATION_ID,
      amountCents,
      currencyCode,
      giftDate: GIFT_DATE,
      donorId: DONOR_ID,
      donorName: "Timeline Regression Donor",
      designationSummary: {
        fundId: "timeline-fund",
        fundName: FUND_NAME,
        missionaryId: null,
        missionaryName: null,
        lineCount: 1,
      },
      paymentStatus: "completed",
      receiptStatus: "sent",
      crmPostStatus: "not_required",
      refundState: "none",
      refundedAmountCents: 0,
      correctionState: "none",
      recurringLinkState: "none",
    },
  };
}

function donorDetail(
  amountCents: number | null,
  currencyCode: string | null = "USD",
): CrmDonorDetailResponse {
  return {
    donor: {
      id: DONOR_ID,
      name: "Timeline Regression Donor",
      title: null,
      email: "timeline@example.invalid",
      phone: null,
      organization: null,
      location: null,
      status: "active",
      type: "individual",
      profileId: null,
      missionaryId: null,
      notesPreview: null,
      tags: [],
      avatarUrl: null,
      createdAt: GIFT_DATE,
      updatedAt: GIFT_DATE,
    },
    giftHistory:
      amountCents !== null && currencyCode !== null
        ? [giftRow(amountCents, currencyCode)]
        : [],
    giftHistoryTruncated: false,
    timeline: [
      {
        id: `gift:${DONATION_ID}`,
        kind: "gift",
        occurredAt: GIFT_DATE,
        title: "Gift received",
        description: "Matching native gift timeline entry",
        amountCents,
        currencyCode,
        source: "platform",
        visibility: "standard",
      },
    ],
    duplicateWarnings: [],
    support: {
      lifetimeGivingCents: amountCents ?? 0,
      lastGiftAt: GIFT_DATE,
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
      platformPaymentTruth: true,
    },
  };
}

let DetailDrawer: typeof import("../../../../../apps/admin/app/(app)/crm/detail-drawer").DetailDrawer;
const queryClients: QueryClient[] = [];
let unexpectedRequests: string[];

function installHttpBoundary(detail: CrmDonorDetailResponse) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const requestUrl =
        typeof input === "string" || input instanceof URL
          ? String(input)
          : input.url;
      const method =
        init?.method ??
        (typeof input === "object" && "method" in input ? input.method : "GET");
      const url = new URL(requestUrl, "http://localhost");
      let payload: unknown;

      if (method === "GET" && url.origin === "http://localhost") {
        if (url.pathname === `/api/admin/crm/records/${DONOR_ID}`) {
          payload = detail;
        } else if (url.pathname === "/api/admin/crm/table-preferences") {
          payload = {
            tableId: url.searchParams.get("tableId") ?? "",
            schemaVersion: 1,
            user: null,
            tenantDefault: null,
            canManageTenantDefaults: false,
          } satisfies CrmTablePreferencesResponse;
        } else if (url.pathname === "/api/admin/crm/table-preferences/views") {
          payload = {
            tableId: url.searchParams.get("tableId") ?? "",
            views: [],
          } satisfies CrmNamedViewsResponse;
        }
      }

      if (payload === undefined) {
        const request = `${method} ${url.origin}${url.pathname}`;
        unexpectedRequests.push(request);
        throw new Error(`Unexpected HTTP request: ${request}`);
      }

      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }),
  );
}

async function renderActivity(detail: CrmDonorDetailResponse) {
  installHttpBoundary(detail);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  queryClients.push(queryClient);
  render(
    <QueryClientProvider client={queryClient}>
      <DetailDrawer
        contact={contact}
        onClose={() => {}}
        onOpenGift={() => {}}
      />
    </QueryClientProvider>,
  );
  const dialog = await screen.findByRole("dialog", {
    name: "Timeline Regression Donor, CRM record details",
  });
  const activity = within(dialog).getByRole("tabpanel", { name: "Activity" });
  // Wait for the public loading state to finish, including empty responses.
  await waitFor(() => {
    if (within(activity).queryByText("Loading donor workflow history...")) {
      throw new Error("Donor detail is still loading");
    }
  });
  return within(activity);
}

describe("CRM Activity timeline money display (#1990)", () => {
  beforeAll(async () => {
    ({ DetailDrawer } =
      await import("../../../../../apps/admin/app/(app)/crm/detail-drawer"));
  }, 120_000);

  beforeEach(() => {
    unexpectedRequests = [];
    // Browser platform shims only; application modules and hooks remain real.
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent: () => false,
      })),
    );
  });

  afterEach(() => {
    cleanup();
    for (const queryClient of queryClients.splice(0)) queryClient.clear();
    vi.unstubAllGlobals();
    // Query libraries can catch a rejected fetch; retain a fail-closed harness.
    expect(unexpectedRequests).toEqual([]);
  });

  const usdExamples = [
    { amountCents: 1, display: "$0.01" },
    { amountCents: 1234, display: "$12.34" },
    { amountCents: 7500, display: "$75.00" },
  ];

  it.each(usdExamples)(
    "renders $amountCents native cents as +$display in Gift received activity",
    async ({ amountCents, display }) => {
      const activity = await renderActivity(donorDetail(amountCents));
      await activity.findByText("Gift received", { exact: true });
      expect(activity.getByText(`+${display}`, { exact: true })).toBeTruthy();
    },
  );

  it.each(usdExamples)(
    "keeps gift history at $display for $amountCents native cents",
    async ({ amountCents, display }) => {
      const activity = await renderActivity(donorDetail(amountCents));
      const gift = await activity.findByRole("button", {
        name: `Open gift detail for ${display} to ${FUND_NAME}`,
      });
      expect(within(gift).getByText(display, { exact: true })).toBeTruthy();
    },
  );

  it("does not show +$7,500.00 for the matching 7,500-cent gift", async () => {
    const activity = await renderActivity(donorDetail(7500));
    await activity.findByText("Matching native gift timeline entry", {
      exact: true,
    });
    expect(activity.queryByText("+$7,500.00", { exact: true })).toBeNull();
  });

  it("preserves EUR currency when rendering 1,234 native cents in activity", async () => {
    const activity = await renderActivity(donorDetail(1234, "EUR"));
    expect(await activity.findByText("+€12.34", { exact: true })).toBeTruthy();
  });

  it("preserves EUR currency in the matching gift history row", async () => {
    const activity = await renderActivity(donorDetail(1234, "EUR"));
    const gift = await activity.findByRole("button", {
      name: `Open gift detail for €12.34 to ${FUND_NAME}`,
    });
    expect(within(gift).getByText("€12.34", { exact: true })).toBeTruthy();
  });

  it("keeps the USD fallback for an activity without a currency code", async () => {
    const activity = await renderActivity(donorDetail(1234, null));
    expect(await activity.findByText("+$12.34", { exact: true })).toBeTruthy();
  });

  it.each([0, null])(
    "omits the activity amount when amountCents is %s",
    async (amountCents) => {
      const activity = await renderActivity(donorDetail(amountCents));
      await activity.findByText("Matching native gift timeline entry", {
        exact: true,
      });
      expect(activity.queryByText(/^\+(?:\$|€)/)).toBeNull();
    },
  );

  it("keeps a zero gift visible as $0.00 in gift history", async () => {
    const activity = await renderActivity(donorDetail(0));
    const gift = await activity.findByRole("button", {
      name: `Open gift detail for $0.00 to ${FUND_NAME}`,
    });
    expect(within(gift).getByText("$0.00", { exact: true })).toBeTruthy();
  });

  it("keeps the existing empty Activity timeline message", async () => {
    const detail = donorDetail(null);
    detail.timeline = [];
    const activity = await renderActivity(detail);
    expect(
      activity.getByText(
        "No timeline entries yet. Activity from donations and tasks will appear here as the CRM read model expands.",
        { exact: true },
      ),
    ).toBeTruthy();
  });

  it("continues treating formatCurrency inputs as dollars", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });
});
