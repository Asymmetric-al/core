import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));
vi.mock("@asym/database/supabase/admin", () => ({ getAdminClient: vi.fn() }));
vi.mock("@asym/auth/context", () => ({
  getAuthContext: vi.fn(),
  requireRole: vi.fn(),
  requireAuth: vi.fn(),
}));

import { replaceStagedGiftAllocations } from "../../../../../../packages/api/src/admin/contributions/staged-gifts";

type QueryResult = { data?: unknown; error?: { message: string } | null };

/**
 * Minimal supabase mock for the `staged_gift_allocations` table used by
 * `replaceStagedGiftAllocations`: `.select().eq()`, `.delete().eq()`, and a
 * sequence of `.insert()` results (replacement first, restore second).
 */
function makeClient(opts: {
  existing: QueryResult;
  deleteResult?: QueryResult;
  insertResults: QueryResult[];
}) {
  const insertQueue = [...opts.insertResults];
  const insert = vi.fn(() =>
    Promise.resolve(insertQueue.shift() ?? { error: null }),
  );
  const selectEq = vi.fn(() => Promise.resolve(opts.existing));
  const select = vi.fn(() => ({ eq: selectEq }));
  const deleteEq = vi.fn(() =>
    Promise.resolve(opts.deleteResult ?? { error: null }),
  );
  const del = vi.fn(() => ({ eq: deleteEq }));
  const from = vi.fn(() => ({ select, delete: del, insert }));
  return { client: { from }, from, insert, select, del };
}

const gift = { id: "sg-1", tenantId: "tenant-1" };
const allocations = [
  { fundId: "fund-1", missionaryId: null, amount: 5000, memo: null },
  { fundId: "fund-2", missionaryId: null, amount: 5000, memo: null },
];
const existingRows = [
  {
    tenant_id: "tenant-1",
    staged_gift_id: "sg-1",
    fund_id: "fund-orig",
    missionary_id: null,
    amount: 10000,
    memo: null,
  },
];

describe("replaceStagedGiftAllocations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("replaces the split and does not restore when the insert succeeds", async () => {
    const mock = makeClient({
      existing: { data: existingRows, error: null },
      insertResults: [{ error: null }],
    });

    await expect(
      replaceStagedGiftAllocations({
        supabaseAdmin: mock.client as never,
        gift,
        allocations,
      }),
    ).resolves.toBeUndefined();

    expect(mock.insert).toHaveBeenCalledTimes(1);
    expect(mock.insert).toHaveBeenCalledWith([
      {
        tenant_id: "tenant-1",
        staged_gift_id: "sg-1",
        fund_id: "fund-1",
        missionary_id: null,
        amount: 5000,
        memo: null,
      },
      {
        tenant_id: "tenant-1",
        staged_gift_id: "sg-1",
        fund_id: "fund-2",
        missionary_id: null,
        amount: 5000,
        memo: null,
      },
    ]);
  });

  it("restores the original allocations when the replacement insert fails", async () => {
    const mock = makeClient({
      existing: { data: existingRows, error: null },
      insertResults: [
        { error: { message: "insert exploded" } },
        { error: null },
      ],
    });

    await expect(
      replaceStagedGiftAllocations({
        supabaseAdmin: mock.client as never,
        gift,
        allocations,
      }),
    ).rejects.toThrow("insert exploded");

    expect(mock.insert).toHaveBeenCalledTimes(2);
    // The compensating write re-inserts the exact snapshot rows.
    expect(mock.insert).toHaveBeenLastCalledWith(existingRows);
  });

  it("reports both errors when the compensating restore also fails", async () => {
    const mock = makeClient({
      existing: { data: existingRows, error: null },
      insertResults: [
        { error: { message: "insert exploded" } },
        { error: { message: "restore exploded" } },
      ],
    });

    await expect(
      replaceStagedGiftAllocations({
        supabaseAdmin: mock.client as never,
        gift,
        allocations,
      }),
    ).rejects.toThrow(
      /insert exploded.*restore exploded.*manual reconciliation/,
    );
  });

  it("does not attempt a restore when there were no prior allocations", async () => {
    const mock = makeClient({
      existing: { data: [], error: null },
      insertResults: [{ error: { message: "insert exploded" } }],
    });

    await expect(
      replaceStagedGiftAllocations({
        supabaseAdmin: mock.client as never,
        gift,
        allocations,
      }),
    ).rejects.toThrow("insert exploded");

    expect(mock.insert).toHaveBeenCalledTimes(1);
  });

  it("throws and skips the rewrite when the snapshot read fails", async () => {
    const mock = makeClient({
      existing: { data: null, error: { message: "select exploded" } },
      insertResults: [],
    });

    await expect(
      replaceStagedGiftAllocations({
        supabaseAdmin: mock.client as never,
        gift,
        allocations,
      }),
    ).rejects.toThrow("select exploded");

    expect(mock.del).not.toHaveBeenCalled();
    expect(mock.insert).not.toHaveBeenCalled();
  });
});
