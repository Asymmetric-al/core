import { readdirSync, readFileSync } from "node:fs";

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

type QueryResult = {
  data?: unknown;
  error?: { message: string; code?: string } | null;
};

function makeClient(result: QueryResult = { error: null }) {
  const rpc = vi.fn(() => Promise.resolve(result));
  return { client: { rpc }, rpc };
}

const gift = {
  id: "sg-1",
  tenantId: "tenant-1",
  status: "needs_review",
} as const;
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
      // The status the caller checked: the function refuses another one.
      p_expected_status: "needs_review",
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

  // Council round 2, B5: a refund, posting or approval that lands between
  // the check and the call makes the function refuse with 40001.
  it("answers 409 when the gift's status moved since it was checked", async () => {
    const mock = makeClient({
      error: {
        code: "40001",
        message: "Staged gift changed since it was checked",
      },
    });

    await expect(
      replaceStagedGiftAllocations({
        supabaseAdmin: mock.client as never,
        gift,
        allocations,
      }),
    ).rejects.toMatchObject({ status: 409 });
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

  // The function's current definition, found by name: the migration that
  // added the checked status (council round 2, B5). Its behaviour is proved
  // on a migrated database by
  // tests/unit/acceptance/issue-2672/staged-gift-allocations.realstack.acceptance.test.ts.
  it("keeps the database replacement atomic, tenant scoped and conditional on the checked status", () => {
    const directory = new URL(
      "../../../../../../supabase/migrations/",
      import.meta.url,
    );
    const [file, ...others] = readdirSync(directory).filter((name) =>
      /^\d{14}_staged_gift_allocations_expected_status\.sql$/.test(name),
    );
    expect(file).toBeDefined();
    expect(others).toEqual([]);
    const migration = readFileSync(new URL(file!, directory), "utf8");

    expect(migration).toContain(
      "DROP FUNCTION IF EXISTS public.replace_staged_gift_allocations(UUID, UUID, JSONB);",
    );
    expect(migration).toMatch(
      /SELECT sg\.status\s+INTO v_status\s+FROM public\.staged_gifts sg\s+WHERE sg\.id = p_staged_gift_id\s+AND sg\.tenant_id = p_tenant_id\s+FOR UPDATE;/,
    );
    expect(migration).toMatch(
      /IF v_status <> p_expected_status THEN\s+RAISE EXCEPTION 'Staged gift changed since it was checked'\s+USING ERRCODE = '40001';/,
    );
    expect(migration).toMatch(
      /DELETE FROM public\.staged_gift_allocations\s+WHERE staged_gift_id = p_staged_gift_id\s+AND tenant_id = p_tenant_id/,
    );
    expect(migration).toContain("jsonb_to_recordset(p_allocations)");
    expect(migration).toMatch(
      /REVOKE EXECUTE ON FUNCTION public\.replace_staged_gift_allocations\(UUID, UUID, JSONB, TEXT\)\s+FROM PUBLIC, anon, authenticated;/,
    );
    expect(migration).toMatch(
      /GRANT EXECUTE ON FUNCTION public\.replace_staged_gift_allocations\(UUID, UUID, JSONB, TEXT\)\s+TO service_role;/,
    );
  });
});
