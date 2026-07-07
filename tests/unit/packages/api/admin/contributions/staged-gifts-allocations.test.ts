import { readFileSync } from "node:fs";

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));
vi.mock("@asym/database/supabase/admin", () => ({ getAdminClient: vi.fn() }));
vi.mock("@asym/auth/context", () => ({
  getAuthContext: vi.fn(),
  requireRole: vi.fn(),
  requireAuth: vi.fn(),
}));
vi.mock("zod", () => {
  const chain = {
    int: () => chain,
    max: () => chain,
    min: () => chain,
    nonnegative: () => chain,
    nullable: () => chain,
    optional: () => chain,
    parse: (value: unknown) => value,
    uuid: () => chain,
  };

  return {
    z: {
      array: () => chain,
      enum: () => chain,
      number: () => chain,
      object: () => chain,
      string: () => chain,
    },
  };
});

import { replaceStagedGiftAllocations } from "../../../../../../packages/api/src/admin/contributions/staged-gifts";

type QueryResult = { data?: unknown; error?: { message: string } | null };

function makeClient(result: QueryResult = { error: null }) {
  const rpc = vi.fn(() => Promise.resolve(result));
  return { client: { rpc }, rpc };
}

const gift = { id: "sg-1", tenantId: "tenant-1" };
const allocations = [
  { fundId: "fund-1", missionaryId: null, amount: 5000, memo: null },
  { fundId: "fund-2", missionaryId: null, amount: 5000, memo: null },
];

describe("replaceStagedGiftAllocations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("replaces the split through the tenant-scoped atomic RPC", async () => {
    const mock = makeClient();

    await expect(
      replaceStagedGiftAllocations({
        supabaseAdmin: mock.client as never,
        gift,
        allocations,
      }),
    ).resolves.toBeUndefined();

    expect(mock.rpc).toHaveBeenCalledWith("replace_staged_gift_allocations", {
      p_tenant_id: "tenant-1",
      p_staged_gift_id: "sg-1",
      p_allocations: [
        {
          fund_id: "fund-1",
          missionary_id: null,
          amount: 5000,
          memo: null,
        },
        {
          fund_id: "fund-2",
          missionary_id: null,
          amount: 5000,
          memo: null,
        },
      ],
    });
  });

  it("throws when the atomic replacement RPC fails", async () => {
    const mock = makeClient({ error: { message: "rpc exploded" } });

    await expect(
      replaceStagedGiftAllocations({
        supabaseAdmin: mock.client as never,
        gift,
        allocations,
      }),
    ).rejects.toThrow("rpc exploded");

    expect(mock.rpc).toHaveBeenCalledTimes(1);
  });

  it("keeps the database replacement atomic and tenant scoped", () => {
    const migration = readFileSync(
      new URL(
        "../../../../../../supabase/migrations/20260707220134_atomic_staged_gift_allocation_replace.sql",
        import.meta.url,
      ),
      "utf8",
    );

    expect(migration).toContain(
      "CREATE OR REPLACE FUNCTION public.replace_staged_gift_allocations",
    );
    expect(migration).toMatch(
      /WHERE sg\.id = p_staged_gift_id\s+AND sg\.tenant_id = p_tenant_id\s+FOR UPDATE/,
    );
    expect(migration).toMatch(
      /DELETE FROM public\.staged_gift_allocations\s+WHERE staged_gift_id = p_staged_gift_id\s+AND tenant_id = p_tenant_id/,
    );
    expect(migration).toContain("jsonb_to_recordset(p_allocations)");
    expect(migration).toContain(
      "REVOKE EXECUTE ON FUNCTION public.replace_staged_gift_allocations(UUID, UUID, JSONB)",
    );
    expect(migration).toContain(
      "GRANT EXECUTE ON FUNCTION public.replace_staged_gift_allocations(UUID, UUID, JSONB)",
    );
  });
});
