import { cacheTag } from "next/cache";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getAdminClientMock } = vi.hoisted(() => ({
  getAdminClientMock: vi.fn(),
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

vi.mock("next/cache", () => ({
  cacheTag: vi.fn(),
  cacheLife: vi.fn(),
}));

import { getDashboardStats } from "../../../../../packages/api/src/reads/dashboard-stats";

type QueryResult<T> = {
  data: T;
  count?: number | null;
  error: { message: string } | null;
};

function createThenableQuery<T>(result: QueryResult<T>) {
  const query: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    in: ReturnType<typeof vi.fn>;
    gte: ReturnType<typeof vi.fn>;
    or: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    range: ReturnType<typeof vi.fn>;
    then?: PromiseLike<QueryResult<T>>["then"];
  } = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    in: vi.fn(() => query),
    gte: vi.fn(() => query),
    or: vi.fn(() => query),
    order: vi.fn(() => query),
    range: vi.fn(() => query),
  };

  query.then = (onFulfilled, onRejected) =>
    Promise.resolve(result).then(onFulfilled, onRejected);

  return query;
}

const NOW = "2026-11-11T12:00:00.000Z";
const THIS_MONTH = "2026-11-05T09:00:00.000Z";
const SETTLED = ["completed", "succeeded", "success"];

type GiftRow = {
  id: string;
  amount: number | null;
  refund_amount?: number | null;
  currency?: string;
  status: string;
  gift_date: string | null;
  created_at: string;
};

function gift(
  amount: number | null,
  {
    id = "gift-1",
    refund = 0,
    at = THIS_MONTH,
    currency = "usd",
    status = "completed",
    giftDate = null,
  }: {
    id?: string;
    refund?: number | null;
    at?: string;
    currency?: string;
    status?: string;
    giftDate?: string | null;
  } = {},
): GiftRow {
  return {
    id,
    amount,
    refund_amount: refund,
    currency,
    status,
    gift_date: giftDate,
    created_at: at,
  };
}

function count(value: number) {
  return createThenableQuery({ data: null, count: value, error: null });
}

function adjustment(
  effectiveValues: Record<string, unknown>,
  {
    id = "adjustment-1",
    donationId = "gift-1",
    status = "applied",
    at = "2026-11-08T10:00:00Z",
  }: { id?: string; donationId?: string; status?: string; at?: string } = {},
) {
  return {
    id,
    donation_id: donationId,
    adjustment_type: "amount_correction",
    status,
    effective_values: effectiveValues,
    created_at: at,
  };
}

function adjustmentPage(rows: ReturnType<typeof adjustment>[] = []) {
  return createThenableQuery({ data: rows, error: null });
}

/** Wires the four first-wave queries; extra gift pages follow in order. */
function mockClient(
  giftPages: Array<ReturnType<typeof createThenableQuery>>,
  counts: { donors?: number; missionaries?: number } = {},
  adjustmentPages: Array<ReturnType<typeof createThenableQuery>> = [],
) {
  const [firstPage, ...laterPages] = giftPages;
  const queries = [
    count(counts.donors ?? 0),
    count(counts.missionaries ?? 0),
    firstPage!,
    count(0),
    ...laterPages,
  ];
  const from = vi.fn((table: string) =>
    table === "contribution_adjustments"
      ? (adjustmentPages.shift() ?? adjustmentPage())
      : queries.shift(),
  );
  getAdminClientMock.mockReturnValue({ client: { from }, error: null });
  return from;
}

function giftPage(rows: GiftRow[]) {
  return createThenableQuery({ data: rows, error: null });
}

describe("api/reads/dashboard-stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(NOW));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns dashboard stats on the happy path", async () => {
    const donorCountQuery = count(3);
    const missionaryCountQuery = count(2);
    const revenueQuery = giftPage([gift(120), gift(80), gift(null)]);
    const activeFundsQuery = count(4);
    const queries = [
      donorCountQuery,
      missionaryCountQuery,
      revenueQuery,
      activeFundsQuery,
    ];

    const from = vi.fn((table: string) =>
      table === "contribution_adjustments" ? adjustmentPage() : queries.shift(),
    );
    getAdminClientMock.mockReturnValue({
      client: { from } as never,
      error: null,
    });

    const result = await getDashboardStats("tenant-1");

    expect(result).toMatchObject({
      crmRecordCount: 3,
      totalMissionaries: 2,
      totalDonationsThisMonth: 3,
      // donations.amount is stored in cents; the total keeps that unit.
      revenueThisMonthCents: 200,
      activeFundsCount: 4,
    });
    expect(revenueQuery.in).not.toHaveBeenCalledWith("status", SETTLED);
    expect(from).toHaveBeenCalledTimes(5);
    expect(cacheTag).toHaveBeenCalledWith(
      "admin:contributions:tenant:tenant-1",
    );
    expect(cacheTag).toHaveBeenCalledWith("admin:crm:tenant:tenant-1");
    expect(from).toHaveBeenNthCalledWith(1, "donors");
    expect(donorCountQuery.eq).toHaveBeenCalledExactlyOnceWith(
      "tenant_id",
      "tenant-1",
    );
  });

  it("throws when the admin client is unavailable", async () => {
    getAdminClientMock.mockReturnValue({
      client: null,
      error: "Admin client unavailable",
    });

    await expect(getDashboardStats("tenant-1")).rejects.toThrow(
      "Admin client unavailable",
    );
  });

  it.each(["pending", "processing", "failed"])(
    "includes a raw %s gift corrected to completed",
    async (status) => {
      const page = giftPage([gift(10000, { status, refund: 1000 })]);
      mockClient([page], {}, [
        adjustmentPage([adjustment({ paymentStatus: "completed" })]),
      ]);

      const stats = await getDashboardStats("tenant-1");

      expect(page.in).not.toHaveBeenCalledWith("status", SETTLED);
      expect(stats.revenueThisMonthCents).toBe(9000);
      expect(stats.totalDonationsThisMonth).toBe(1);
      expect(stats.givingTrend.months.at(-1)).toMatchObject({
        giftCount: 1,
        netCents: 9000,
      });
    },
  );

  it("ignores uncorrected pending gifts when determining settled totals and currency", async () => {
    mockClient([
      giftPage([
        gift(1000),
        gift(9000, { id: "pending", status: "pending", currency: "cad" }),
      ]),
    ]);

    const stats = await getDashboardStats("tenant-1");

    expect(stats.totalDonationsThisMonth).toBe(1);
    expect(stats.revenueThisMonthCents).toBe(1000);
    expect(stats.givingTrend.currency).toBe("USD");
  });

  it("uses gift date for imports and offline gifts rather than record creation", async () => {
    const page = giftPage([
      gift(1200, { id: "old-import", at: THIS_MONTH, giftDate: "2026-10-15" }),
      gift(3400, {
        id: "current-gift",
        at: "2025-01-01T00:00:00Z",
        giftDate: "2026-11-02",
      }),
      gift(5600, {
        id: "outside-window",
        at: THIS_MONTH,
        giftDate: "2025-10-31",
      }),
      gift(7800, { id: "future-gift", at: THIS_MONTH, giftDate: "2026-12-01" }),
    ]);
    mockClient([page]);

    const stats = await getDashboardStats("tenant-1");

    expect(page.or).toHaveBeenCalledWith(
      "gift_date.gte.2025-11-01,and(gift_date.is.null,created_at.gte.2025-11-01T00:00:00.000Z)",
    );
    expect(stats.totalDonationsThisMonth).toBe(1);
    expect(stats.revenueThisMonthCents).toBe(3400);
    expect(stats.givingTrend.months.at(-2)).toMatchObject({
      giftCount: 1,
      netCents: 1200,
    });
    expect(stats.givingTrend.months.at(-1)).toMatchObject({
      giftCount: 1,
      netCents: 3400,
    });
  });

  it("subtracts partial refunds without adding negative refunds or negative gifts", async () => {
    mockClient([
      giftPage([
        gift(1000, { refund: 250 }),
        gift(100, { refund: 200 }),
        gift(100, { refund: -50 }),
        gift(200, { refund: null }),
      ]),
    ]);
    expect((await getDashboardStats("tenant-1")).revenueThisMonthCents).toBe(
      1050,
    );
  });

  it("applies the canonical corrected amount before subtracting refunds in both the month and trend", async () => {
    mockClient([giftPage([gift(10000, { refund: 1000 })])], {}, [
      adjustmentPage([adjustment({ amountCents: 8000 })]),
    ]);

    const stats = await getDashboardStats("tenant-1");

    expect(stats.revenueThisMonthCents).toBe(7000);
    expect(stats.givingTrend.months.at(-1)).toMatchObject({
      netCents: 7000,
      giftCount: 1,
      soFar: true,
    });
    expect(stats.totalDonationsThisMonth).toBe(1);
    expect(stats.givingTrend.currency).toBe("USD");
  });

  it.each([
    "failed",
    "pending",
    "refunded",
    "processing",
    "unknown",
    " FAILED ",
  ])(
    "excludes effective %s gifts from settled monthly totals and counts",
    async (paymentStatus) => {
      mockClient([giftPage([gift(10000)])], {}, [
        adjustmentPage([
          {
            ...adjustment({ paymentStatus }),
            adjustment_type: "payment_state_correction",
          },
        ]),
      ]);

      const stats = await getDashboardStats("tenant-1");

      expect(stats.revenueThisMonthCents).toBe(0);
      expect(stats.givingTrend.months.at(-1)).toMatchObject({
        netCents: 0,
        giftCount: 0,
      });
      expect(stats.totalDonationsThisMonth).toBe(0);
    },
  );

  it.each(["completed", "succeeded", "success", " Succeeded "])(
    "retains corrected net money for effective settled status %s",
    async (paymentStatus) => {
      mockClient([giftPage([gift(10000, { refund: 1000 })])], {}, [
        adjustmentPage([
          {
            ...adjustment({ amountCents: 8000, paymentStatus }),
            adjustment_type: "payment_state_correction",
          },
        ]),
      ]);

      const stats = await getDashboardStats("tenant-1");

      expect(stats.revenueThisMonthCents).toBe(7000);
      expect(stats.givingTrend.months.at(-1)).toMatchObject({
        netCents: 7000,
        giftCount: 1,
      });
      expect(stats.totalDonationsThisMonth).toBe(1);
    },
  );

  it("excludes a prior month's effective failed money and count without changing this month's giving", async () => {
    mockClient(
      [
        giftPage([
          gift(10000, { id: "prior-gift", at: "2026-10-31T23:59:59Z" }),
          gift(4000, { refund: 1000 }),
        ]),
      ],
      {},
      [
        adjustmentPage([
          {
            ...adjustment(
              { paymentStatus: "failed" },
              { donationId: "prior-gift" },
            ),
            adjustment_type: "payment_state_correction",
          },
        ]),
      ],
    );

    const stats = await getDashboardStats("tenant-1");

    expect(stats.revenueThisMonthCents).toBe(3000);
    expect(stats.totalDonationsThisMonth).toBe(1);
    expect(stats.givingTrend.months.at(-1)).toMatchObject({
      netCents: 3000,
      giftCount: 1,
    });
    expect(stats.givingTrend.months.at(-2)).toMatchObject({
      month: "2026-10",
      netCents: 0,
      giftCount: 0,
    });
  });

  it("uses the latest applied payment status and ignores a reversed failure correction", async () => {
    mockClient([giftPage([gift(10000, { refund: 1000 })])], {}, [
      adjustmentPage([
        adjustment(
          { paymentStatus: "completed", amountCents: 8000 },
          { id: "restored", at: "2026-11-09T10:00:00Z" },
        ),
        adjustment({ paymentStatus: "failed" }),
        adjustment(
          { paymentStatus: "failed" },
          { id: "reversed", status: "reversed", at: "2026-11-10T10:00:00Z" },
        ),
      ]),
    ]);

    const stats = await getDashboardStats("tenant-1");

    expect(stats.revenueThisMonthCents).toBe(7000);
    expect(stats.givingTrend.months.at(-1)).toMatchObject({
      netCents: 7000,
      giftCount: 1,
    });
    expect(stats.totalDonationsThisMonth).toBe(1);
  });

  it("uses an applied currency correction for the trend and monthly figure without converting cents or rewriting the gift", async () => {
    const original = Object.freeze(gift(10000, { refund: 1000 }));
    mockClient(
      [giftPage([original, gift(2000, { id: "gift-2", currency: "cad" })])],
      {},
      [adjustmentPage([adjustment({ amountCents: 8000, currency: " cad " })])],
    );

    const stats = await getDashboardStats("tenant-1");

    expect(stats.givingTrend.currency).toBe("CAD");
    expect(stats.givingTrend.currencies).toEqual(["CAD"]);
    expect(stats.revenueThisMonthCents).toBe(9000);
    expect(stats.givingTrend.months.at(-1)?.netCents).toBe(9000);
    expect(original).toMatchObject({
      amount: 10000,
      refund_amount: 1000,
      currency: "usd",
    });
  });

  it("keeps original amount and currency when the scoped adjustment read is empty", async () => {
    const missing = adjustmentPage();
    mockClient([giftPage([gift(10000, { refund: 1000 })])], {}, [missing]);

    const stats = await getDashboardStats("tenant-1");

    expect(stats.revenueThisMonthCents).toBe(9000);
    expect(stats.givingTrend.months.at(-1)?.netCents).toBe(9000);
    expect(stats.givingTrend.currency).toBe("USD");
    expect(missing.eq).toHaveBeenCalledWith("tenant_id", "tenant-1");
    expect(missing.eq).toHaveBeenCalledWith("status", "applied");
    expect(missing.in).toHaveBeenCalledWith("donation_id", ["gift-1"]);
  });

  it("folds applied corrections in time order within each gift's original UTC month, ignoring unapplied and unrelated rows", async () => {
    mockClient(
      [
        giftPage([
          gift(10000, { refund: 1000 }),
          gift(10000, {
            id: "gift-2",
            currency: "cad",
            refund: 1000,
            at: "2026-10-31T23:59:59Z",
          }),
        ]),
      ],
      {},
      [
        adjustmentPage([
          adjustment({ amountCents: 8000, currency: "cad" }),
          adjustment(
            { amountCents: 9000, currency: "usd" },
            {
              id: "older",
              at: "2026-11-06T10:00:00Z",
            },
          ),
          adjustment(
            { amountCents: 1, currency: "eur" },
            {
              id: "reversed",
              status: "reversed",
              at: "2026-11-10T10:00:00Z",
            },
          ),
          adjustment(
            { amountCents: 2, currency: "eur" },
            {
              id: "pending",
              status: "pending",
              at: "2026-11-10T10:00:00Z",
            },
          ),
          adjustment(
            { amountCents: 6000 },
            { id: "prior-month", donationId: "gift-2" },
          ),
          adjustment(
            { amountCents: 99, currency: "eur" },
            { id: "unrelated", donationId: "another-gift" },
          ),
        ]),
      ],
    );

    const stats = await getDashboardStats("tenant-1");

    expect(stats.revenueThisMonthCents).toBe(7000);
    expect(stats.givingTrend.months.at(-1)?.netCents).toBe(7000);
    expect(stats.givingTrend.months.at(-2)).toMatchObject({
      month: "2026-10",
      netCents: 5000,
      giftCount: 1,
    });
    expect(stats.givingTrend.currency).toBe("CAD");
  });

  it("withholds trend totals when an applied currency correction introduces mixed currencies", async () => {
    mockClient([giftPage([gift(1000), gift(2000, { id: "gift-2" })])], {}, [
      adjustmentPage([adjustment({ currency: "cad" })]),
    ]);

    const { givingTrend } = await getDashboardStats("tenant-1");

    expect(givingTrend.currency).toBeNull();
    expect(givingTrend.currencies).toEqual(["CAD", "USD"]);
    expect(givingTrend.months.every((month) => month.netCents === null)).toBe(
      true,
    );
    expect(givingTrend.months.at(-1)?.giftCount).toBe(2);
  });

  it.each([null, " "])(
    "keeps a corrected unknown currency (%s) unknown instead of reverting to the original",
    async (currency) => {
      mockClient([giftPage([gift(1000)])], {}, [
        adjustmentPage([adjustment({ currency })]),
      ]);

      const { givingTrend } = await getDashboardStats("tenant-1");

      expect(givingTrend.currency).toBeNull();
      expect(givingTrend.currencies).toEqual(["unknown"]);
      expect(givingTrend.months.at(-1)?.netCents).toBeNull();
    },
  );

  it.each([false, true])(
    "fails the whole read on adjustment errors (after an earlier page: %s)",
    async (hasEarlierPage) => {
      const failed = createThenableQuery({
        data: null,
        error: { message: "Correction page unavailable" },
      });
      mockClient(
        [giftPage([gift(10000, { refund: 1000 })])],
        {},
        hasEarlierPage
          ? [adjustmentPage([adjustment({ amountCents: 8000 })]), failed]
          : [failed],
      );

      await expect(getDashboardStats("tenant-1")).rejects.toThrow(
        "Correction page unavailable",
      );
      expect(failed.eq).toHaveBeenCalledWith("tenant_id", "tenant-1");
    },
  );

  it("loads every correction past 1,000 rows with stable tenant-scoped paging and an empty terminal page", async () => {
    const first = adjustmentPage(
      Array.from({ length: 1000 }, (_, index) =>
        adjustment({ amountCents: 9000 }, { id: `adjustment-${index}` }),
      ),
    );
    const last = adjustmentPage([
      adjustment(
        { amountCents: 8000, currency: "cad" },
        {
          id: "last",
          at: "2026-11-09T10:00:00Z",
        },
      ),
    ]);
    const end = adjustmentPage();
    mockClient([giftPage([gift(10000, { refund: 1000 })])], {}, [
      first,
      last,
      end,
    ]);

    const stats = await getDashboardStats("tenant-1");

    expect(stats.revenueThisMonthCents).toBe(7000);
    expect(stats.givingTrend.months.at(-1)?.netCents).toBe(7000);
    expect(stats.givingTrend.currency).toBe("CAD");
    for (const page of [first, last, end]) {
      expect(page.eq).toHaveBeenCalledWith("tenant_id", "tenant-1");
      expect(page.eq).toHaveBeenCalledWith("status", "applied");
      expect(page.in).toHaveBeenCalledWith("donation_id", ["gift-1"]);
      expect(page.order).toHaveBeenCalledWith("created_at", {
        ascending: true,
      });
      expect(page.order).toHaveBeenCalledWith("id", { ascending: true });
    }
    expect(first.range).toHaveBeenCalledWith(0, 999);
    expect(last.range).toHaveBeenCalledWith(1000, 1999);
    expect(end.range).toHaveBeenCalledWith(1001, 2000);
  });

  it("bounds adjustment requests to the loaded gift IDs in chunks, preserving the correction in the last chunk", async () => {
    const gifts = Array.from({ length: 151 }, (_, index) =>
      gift(100, { id: `gift-${index}` }),
    );
    gifts[150] = gift(10000, { id: "gift-150", refund: 1000 });
    const first = adjustmentPage();
    const second = adjustmentPage([
      adjustment({ amountCents: 8000 }, { donationId: "gift-150" }),
    ]);
    const end = adjustmentPage();
    mockClient([giftPage(gifts)], {}, [first, second, end]);

    const stats = await getDashboardStats("tenant-1");

    expect(stats.revenueThisMonthCents).toBe(22000);
    expect(stats.givingTrend.months.at(-1)?.netCents).toBe(22000);
    expect(first.in).toHaveBeenCalledWith(
      "donation_id",
      gifts.slice(0, 150).map((row) => row.id),
    );
    for (const page of [second, end]) {
      expect(page.in).toHaveBeenCalledWith("donation_id", ["gift-150"]);
      expect(page.eq).toHaveBeenCalledWith("tenant_id", "tenant-1");
    }
  });

  it.each([8000.5, Number.MAX_SAFE_INTEGER + 1])(
    "rejects corrected money that is not safe integer cents (%s)",
    async (amountCents) => {
      mockClient([giftPage([gift(10000)])], {}, [
        adjustmentPage([adjustment({ amountCents })]),
      ]);

      await expect(getDashboardStats("tenant-1")).rejects.toThrow(
        "safe integer cents",
      );
    },
  );

  it("rejects a monthly sum beyond safe integer cents rather than rounding corrected money", async () => {
    mockClient([giftPage([gift(100), gift(1, { id: "gift-2" })])], {}, [
      adjustmentPage([adjustment({ amountCents: Number.MAX_SAFE_INTEGER })]),
    ]);

    await expect(getDashboardStats("tenant-1")).rejects.toThrow(
      "safe integer cents",
    );
  });

  it("adds every settled gift past the 1,000-row page limit with tenant-scoped stable paging", async () => {
    const firstPage = giftPage(
      Array.from({ length: 1000 }, () => gift(100, { refund: 0 })),
    );
    const secondPage = giftPage([gift(500, { refund: 100 })]);
    const from = mockClient([firstPage, secondPage], {
      donors: 3,
    });
    const stats = await getDashboardStats("tenant-1");
    expect(stats.revenueThisMonthCents).toBe(100400);
    for (const page of [firstPage, secondPage]) {
      expect(page.select).toHaveBeenCalledWith(
        "id, amount, refund_amount, currency, status, gift_date, created_at",
      );
      expect(page.eq).toHaveBeenCalledWith("tenant_id", "tenant-1");
      expect(page.order).toHaveBeenCalledWith("id", { ascending: true });
      expect(page.in).not.toHaveBeenCalledWith("status", SETTLED);
      // The trend window opens on the 1st, 12 full months back, in UTC.
      expect(page.or).toHaveBeenCalledWith(
        "gift_date.gte.2025-11-01,and(gift_date.is.null,created_at.gte.2025-11-01T00:00:00.000Z)",
      );
    }
    expect(firstPage.range).toHaveBeenCalledWith(0, 999);
    expect(secondPage.range).toHaveBeenCalledWith(1000, 1999);
    expect(from).toHaveBeenCalledTimes(6);
  });

  it("applies corrections to gifts loaded after the first donation page", async () => {
    const first = giftPage(
      Array.from({ length: 1000 }, (_, index) =>
        gift(100, { id: `gift-${index}` }),
      ),
    );
    const last = giftPage([gift(10000, { id: "gift-1000", refund: 1000 })]);
    mockClient([first, last], {}, [
      ...Array.from({ length: 6 }, () => adjustmentPage()),
      adjustmentPage([
        adjustment({ amountCents: 8000 }, { donationId: "gift-1000" }),
      ]),
      adjustmentPage(),
    ]);

    const stats = await getDashboardStats("tenant-1");

    expect(stats.revenueThisMonthCents).toBe(107000);
    expect(stats.givingTrend.months.at(-1)).toMatchObject({
      netCents: 107000,
      giftCount: 1001,
    });
    expect(last.eq).toHaveBeenCalledWith("tenant_id", "tenant-1");
    expect(last.range).toHaveBeenCalledWith(1000, 1999);
  });

  it("throws when a database query returns an error", async () => {
    const queries = [
      createThenableQuery({
        data: null,
        count: 0,
        error: { message: "donor query failed" },
      }),
      count(0),
      giftPage([]),
      count(0),
    ];

    getAdminClientMock.mockReturnValue({
      client: { from: vi.fn(() => queries.shift()) } as never,
      error: null,
    });

    await expect(getDashboardStats("tenant-1")).rejects.toThrow(
      "donor query failed",
    );
  });

  it("does not report a partial total or trend when a later page fails", async () => {
    mockClient(
      [
        giftPage(
          Array.from({ length: 1000 }, (_, index) =>
            gift(100, { at: index % 2 ? THIS_MONTH : "2026-03-02T00:00:00Z" }),
          ),
        ),
        createThenableQuery({
          data: null,
          error: { message: "Revenue page unavailable" },
        }),
      ],
      {},
    );
    await expect(getDashboardStats("tenant-1")).rejects.toThrow(
      "Revenue page unavailable",
    );
  });

  it("fetches the terminal empty page when the window has exactly 1,000 gifts", async () => {
    const emptyPage = giftPage([]);
    mockClient(
      [giftPage(Array.from({ length: 1000 }, () => gift(100))), emptyPage],
      {},
    );
    expect((await getDashboardStats("tenant-1")).revenueThisMonthCents).toBe(
      100000,
    );
    expect(emptyPage.range).toHaveBeenCalledWith(1000, 1999);
  });

  describe("giving trend", () => {
    it("returns the last 12 full UTC months, then the current month so far", async () => {
      mockClient([giftPage([])]);
      const { givingTrend } = await getDashboardStats("tenant-1");

      expect(givingTrend.periodStart).toBe("2025-11-01T00:00:00.000Z");
      expect(givingTrend.asOf).toBe(NOW);
      expect(givingTrend.months.map((month) => month.month)).toEqual([
        "2025-11",
        "2025-12",
        "2026-01",
        "2026-02",
        "2026-03",
        "2026-04",
        "2026-05",
        "2026-06",
        "2026-07",
        "2026-08",
        "2026-09",
        "2026-10",
        "2026-11",
      ]);
      expect(givingTrend.months.map((month) => month.soFar)).toEqual([
        ...Array.from({ length: 12 }, () => false),
        true,
      ]);
    });

    it("crosses the year boundary in January", async () => {
      vi.setSystemTime(new Date("2027-01-01T00:00:00.000Z"));
      const firstPage = giftPage([]);
      mockClient([firstPage]);
      const { givingTrend } = await getDashboardStats("tenant-1");

      expect(givingTrend.periodStart).toBe("2026-01-01T00:00:00.000Z");
      expect(givingTrend.months[0]?.month).toBe("2026-01");
      expect(givingTrend.months.at(-1)).toMatchObject({
        month: "2027-01",
        soFar: true,
      });
      expect(firstPage.or).toHaveBeenCalledWith(
        "gift_date.gte.2026-01-01,and(gift_date.is.null,created_at.gte.2026-01-01T00:00:00.000Z)",
      );
    });

    it("nets refunds per month and keeps empty months at zero", async () => {
      mockClient([
        giftPage([
          gift(5000, { refund: 1000, at: "2026-02-10T10:00:00.000Z" }),
          gift(2500, { at: "2026-02-28T23:00:00.000Z" }),
          gift(700, { refund: 900, at: "2026-06-01T00:00:00.000Z" }),
          gift(1200, { at: THIS_MONTH }),
        ]),
      ]);
      const { givingTrend, revenueThisMonthCents } =
        await getDashboardStats("tenant-1");
      const byMonth = Object.fromEntries(
        givingTrend.months.map((month) => [month.month, month]),
      );

      expect(byMonth["2026-02"]).toMatchObject({
        netCents: 6500,
        giftCount: 2,
      });
      // A full refund nets to zero but still counts as a settled gift.
      expect(byMonth["2026-06"]).toMatchObject({ netCents: 0, giftCount: 1 });
      expect(byMonth["2026-03"]).toMatchObject({ netCents: 0, giftCount: 0 });
      expect(byMonth["2026-11"]).toMatchObject({
        netCents: 1200,
        giftCount: 1,
        soFar: true,
      });
      // Home's "Net giving this month" and the current bar agree.
      expect(revenueThisMonthCents).toBe(byMonth["2026-11"]?.netCents);
      expect(givingTrend.currency).toBe("USD");
      expect(givingTrend.currencies).toEqual(["USD"]);
    });

    it("buckets by the UTC month, whatever offset the timestamp carries", async () => {
      mockClient([
        giftPage([
          gift(100, { at: "2026-10-31T23:59:59.999Z" }),
          // 01:30 on 1 November at UTC+2 is still 31 October in UTC.
          gift(200, { at: "2026-11-01T01:30:00+02:00" }),
          gift(400, { at: "2026-11-01T00:00:00.000Z" }),
          gift(800, { at: "2025-11-01T00:00:00+00:00" }),
        ]),
      ]);
      const { givingTrend, revenueThisMonthCents } =
        await getDashboardStats("tenant-1");
      const net = Object.fromEntries(
        givingTrend.months.map((month) => [month.month, month.netCents]),
      );

      expect(net["2026-10"]).toBe(300);
      expect(net["2026-11"]).toBe(400);
      expect(net["2025-11"]).toBe(800);
      expect(revenueThisMonthCents).toBe(400);
    });

    it("says when currencies are mixed instead of adding them together", async () => {
      mockClient([
        giftPage([
          gift(1000, { currency: "usd", at: "2026-09-03T00:00:00.000Z" }),
          gift(2000, { currency: "cad", at: "2026-09-04T00:00:00.000Z" }),
          gift(3000, { currency: "usd", at: THIS_MONTH }),
        ]),
      ]);
      const { givingTrend } = await getDashboardStats("tenant-1");

      expect(givingTrend.currency).toBeNull();
      expect(givingTrend.currencies).toEqual(["CAD", "USD"]);
      expect(givingTrend.months.every((month) => month.netCents === null)).toBe(
        true,
      );
      const september = givingTrend.months.find(
        (month) => month.month === "2026-09",
      );
      expect(september?.giftCount).toBe(2);
    });

    it("does not total months when a gift has no currency", async () => {
      mockClient([
        giftPage([
          gift(1000, { currency: "usd" }),
          gift(500, { currency: " " }),
        ]),
      ]);
      const { givingTrend } = await getDashboardStats("tenant-1");

      expect(givingTrend.currency).toBeNull();
      expect(givingTrend.currencies).toEqual(["USD", "unknown"]);
      expect(givingTrend.months.at(-1)).toMatchObject({
        netCents: null,
        giftCount: 2,
      });
    });

    it("keeps a gift stamped after now in the current month, as Net giving this month does", async () => {
      mockClient([giftPage([gift(900, { at: "2026-12-02T00:00:00.000Z" })])]);
      const { givingTrend, revenueThisMonthCents } =
        await getDashboardStats("tenant-1");

      expect(givingTrend.months.at(-1)?.netCents).toBe(900);
      expect(revenueThisMonthCents).toBe(900);
    });

    it("reports no currency and zero months when nothing settled", async () => {
      mockClient([giftPage([])]);
      const { givingTrend } = await getDashboardStats("tenant-1");

      expect(givingTrend.currency).toBeNull();
      expect(givingTrend.currencies).toEqual([]);
      expect(givingTrend.months).toHaveLength(13);
      expect(
        givingTrend.months.every(
          (month) => month.netCents === 0 && month.giftCount === 0,
        ),
      ).toBe(true);
    });

    it("rejects a gift whose timestamp cannot be placed in a month", async () => {
      mockClient([giftPage([gift(100, { at: "not a date" })])]);
      await expect(getDashboardStats("tenant-1")).rejects.toThrow(
        "unreadable gift date",
      );
    });
  });
});
