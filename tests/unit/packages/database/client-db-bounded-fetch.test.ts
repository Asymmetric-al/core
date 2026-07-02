import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock, getQueryClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  getQueryClientMock: vi.fn(),
}));

vi.mock("../../../../packages/database/supabase/client", () => ({
  createClient: createClientMock,
}));

vi.mock("../../../../packages/database/providers/query-client", () => ({
  getQueryClient: getQueryClientMock,
}));

import { createBoundedTableFetcher } from "../../../../packages/database/collections/client-db";

type Row = Record<string, unknown>;

interface BuilderCalls {
  select: string[];
  eq: Array<[string, unknown]>;
  order: Array<[string, unknown]>;
  range: Array<[number, number]>;
}

interface QueryResult {
  data: Row[] | null;
  error: { message: string } | null;
}

/**
 * Stub the supabase chain `from(table).select(...).eq(...)*.order(...).range(...)`
 * and record every call so assertions can pin window/order/filter behavior.
 * `range` is the terminal that resolves to the query result.
 */
function mockSupabaseRange(
  rangeResults: Array<{ from: number; to: number; rows: Row[] }>,
) {
  const calls: BuilderCalls = { select: [], eq: [], order: [], range: [] };
  const builder = {
    select: vi.fn((clause: string) => {
      calls.select.push(clause);
      return builder;
    }),
    eq: vi.fn((column: string, value: unknown) => {
      calls.eq.push([column, value]);
      return builder;
    }),
    order: vi.fn((column: string, options: unknown) => {
      calls.order.push([column, options]);
      return builder;
    }),
    range: vi.fn((from: number, to: number) => {
      calls.range.push([from, to]);
      const match =
        rangeResults.find((entry) => entry.from === from && entry.to === to) ??
        rangeResults.find((entry) => entry.from === from);
      const rows = match?.rows ?? [];
      return Promise.resolve({ data: rows, error: null });
    }),
  };
  const from = vi.fn(() => builder);
  createClientMock.mockReturnValue({ from });
  return { calls, from };
}

function mockSupabase(result: QueryResult) {
  const calls: BuilderCalls = { select: [], eq: [], order: [], range: [] };
  const builder = {
    select: vi.fn((clause: string) => {
      calls.select.push(clause);
      return builder;
    }),
    eq: vi.fn((column: string, value: unknown) => {
      calls.eq.push([column, value]);
      return builder;
    }),
    order: vi.fn((column: string, options: unknown) => {
      calls.order.push([column, options]);
      return builder;
    }),
    range: vi.fn((from: number, to: number) => {
      calls.range.push([from, to]);
      return Promise.resolve(result);
    }),
  };
  const from = vi.fn(() => builder);
  createClientMock.mockReturnValue({ from });
  return { calls, from };
}

function mockRows(rows: Row[]) {
  return mockSupabase({ data: rows, error: null });
}

function makeRows(count: number): Row[] {
  return Array.from({ length: count }, (_, index) => ({ id: `row-${index}` }));
}

function donorsFetcher(overrides: Record<string, unknown> = {}) {
  return createBoundedTableFetcher<Row>({
    table: "donors",
    pageSize: 5,
    orderBy: { column: "created_at", ascending: false },
    ...overrides,
  });
}

describe("createBoundedTableFetcher", () => {
  const invalidateQueries = vi.fn(() => Promise.resolve());

  beforeEach(() => {
    vi.clearAllMocks();
    getQueryClientMock.mockReturnValue({ invalidateQueries });
  });

  it("fetches one window from offset zero with deterministic, null-safe order", async () => {
    const { calls, from } = mockRows(makeRows(3));
    const fetcher = donorsFetcher();

    const rows = await fetcher.queryFn();

    expect(from).toHaveBeenCalledWith("donors");
    expect(calls.select).toEqual(["*"]);
    expect(calls.order).toEqual([
      ["created_at", { ascending: false, nullsFirst: false }],
      ["id", { ascending: true }],
    ]);
    expect(calls.range).toEqual([[0, 4]]);
    expect(rows).toHaveLength(3);
  });

  it("reports no continuation when the fetch does not fill the window", async () => {
    mockRows(makeRows(3));
    const fetcher = donorsFetcher();

    await fetcher.queryFn();

    expect(fetcher.hasMore()).toBe(false);
    expect(fetcher.getSnapshot()).toBe(false);
    await expect(fetcher.loadMore()).resolves.toBe(false);
    expect(invalidateQueries).not.toHaveBeenCalled();
  });

  it("grows the window by one page and invalidates the exact configured key", async () => {
    mockRows(makeRows(5));
    const fetcher = donorsFetcher({
      queryKey: ["donors", "missionary", "m-1"],
    });

    await fetcher.queryFn();
    expect(fetcher.hasMore()).toBe(true);

    await expect(fetcher.loadMore()).resolves.toBe(true);
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["donors", "missionary", "m-1"],
    });

    const { calls } = mockRows(makeRows(7));
    const rows = await fetcher.queryFn();

    expect(calls.range).toEqual([[0, 9]]);
    expect(rows).toHaveLength(7);
    expect(fetcher.hasMore()).toBe(false);
  });

  it("defaults the invalidation key to the table's canonical query key", async () => {
    mockRows(makeRows(5));
    const fetcher = donorsFetcher();

    await fetcher.queryFn();
    await fetcher.loadMore();

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["donors"] });
  });

  it("notifies subscribers only when the window flag changes", async () => {
    mockRows(makeRows(5));
    const fetcher = donorsFetcher();
    const listener = vi.fn();
    const unsubscribe = fetcher.subscribe(listener);

    expect(fetcher.getSnapshot()).toBe(false);

    await fetcher.queryFn();
    expect(fetcher.getSnapshot()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);

    mockRows(makeRows(2));
    await fetcher.queryFn();
    expect(fetcher.getSnapshot()).toBe(false);
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    mockRows(makeRows(5));
    await fetcher.queryFn();
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("applies equality filters for scoped collections", async () => {
    const { calls } = mockRows(makeRows(1));
    const fetcher = donorsFetcher({
      filters: [{ column: "missionary_id", value: "m-1" }],
    });

    await fetcher.queryFn();

    expect(calls.eq).toContainEqual(["missionary_id", "m-1"]);
  });

  it("scopes through an inner embed and strips the embed-only key", async () => {
    const { calls } = mockRows([
      { id: "a-1", donor_id: "d-1", donors: { missionary_id: "m-1" } },
    ]);
    const fetcher = createBoundedTableFetcher<Row>({
      table: "donor_activities",
      queryKey: ["donor_activities", "missionary", "m-1"],
      pageSize: 10,
      orderBy: { column: "date", ascending: false },
      embedSelect: "donors!inner(missionary_id)",
      filters: [{ column: "donors.missionary_id", value: "m-1" }],
      omitKeys: ["donors"],
    });

    const rows = await fetcher.queryFn();

    expect(calls.select).toEqual(["*, donors!inner(missionary_id)"]);
    expect(calls.eq).toContainEqual(["donors.missionary_id", "m-1"]);
    expect(rows[0]).not.toHaveProperty("donors");
    expect(rows[0]).toMatchObject({ id: "a-1", donor_id: "d-1" });
  });

  it("short-circuits to [] when disabled without touching the network", async () => {
    const from = vi.fn();
    createClientMock.mockReturnValue({ from });
    const fetcher = donorsFetcher({ enabled: false });

    const rows = await fetcher.queryFn();

    expect(rows).toEqual([]);
    expect(from).not.toHaveBeenCalled();
    expect(fetcher.hasMore()).toBe(false);
    await expect(fetcher.loadMore()).resolves.toBe(false);
    expect(invalidateQueries).not.toHaveBeenCalled();
  });

  it("ignores a concurrent loadMore while one is already in flight", async () => {
    mockRows(makeRows(5));
    const fetcher = donorsFetcher();

    await fetcher.queryFn();
    expect(fetcher.hasMore()).toBe(true);

    const [first, second] = await Promise.all([
      fetcher.loadMore(),
      fetcher.loadMore(),
    ]);

    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(invalidateQueries).toHaveBeenCalledTimes(1);

    // Window grew by one page (10), not two (15), despite the second call.
    const { calls } = mockRows(makeRows(11));
    await fetcher.queryFn();
    expect(calls.range).toEqual([[0, 9]]);
  });

  it("throws when supabase returns an error", async () => {
    mockSupabase({ data: null, error: { message: "boom" } });
    const fetcher = donorsFetcher();

    await expect(fetcher.queryFn()).rejects.toEqual({ message: "boom" });
  });

  it("fetches windows larger than the PostgREST row cap in sequential chunks", async () => {
    const firstChunk = makeRows(1000);
    const secondChunk = makeRows(200).map((row, index) => ({
      ...row,
      id: `row-${1000 + index}`,
    }));
    const { calls } = mockSupabaseRange([
      { from: 0, to: 999, rows: firstChunk },
      { from: 1000, to: 1199, rows: secondChunk },
    ]);
    const fetcher = donorsFetcher({ pageSize: 1200 });

    const rows = await fetcher.queryFn();

    expect(calls.range).toEqual([
      [0, 999],
      [1000, 1199],
    ]);
    expect(rows).toHaveLength(1200);
    expect(fetcher.hasMore()).toBe(true);
  });
});
