/**
 * WP0 (#2672), audit findings NB-01 and NV-03: the legacy staged-gift routes
 * stay the approve and relink path, but each requires the finance capability,
 * and the edit and receipt handlers check the staged gift's state.
 *
 * The handlers run through the real `withOperation` wrapper, its real gates
 * and the real contribution capabilities (the registry since AL-2675); only the auth
 * lookup, the service client and the receipt sender are doubles.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import type * as AuthModule from "../../../../../../packages/auth/context";
import type { AuthContext } from "../../../../../../packages/auth/context";
import type { NextRequest } from "next/server";

const seams = vi.hoisted(() => ({
  getAuthContext: vi.fn(),
  getAdminClient: vi.fn(),
  sendStagedGiftReceipt: vi.fn(),
}));

vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  getAuthContext: seams.getAuthContext,
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: seams.getAdminClient,
}));
vi.mock("@asym/lib/audit/logger", () => ({ createAuditLogger: () => ({}) }));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));
vi.mock(
  "../../../../../../packages/api/src/shared/request-session-client",
  async (original) => ({
    ...(await original<
      typeof import("../../../../../../packages/api/src/shared/request-session-client")
    >()),
    createRequestSessionClient: vi.fn(async () => ({})),
  }),
);
vi.mock("../../../../../../packages/api/src/giving/receipts", () => ({
  sendStagedGiftReceipt: seams.sendStagedGiftReceipt,
}));

import { revalidateTag } from "next/cache";

import * as legacy from "../../../../../../packages/api/src/admin/contributions/staged-gifts";

type Row = Record<string, unknown>;
type Write = { table: string; op: "update" | "insert"; values: Row };

const TENANT = "11111111-1111-4111-8111-111111111111";
const OTHER_TENANT = "22222222-2222-4222-8222-222222222222";
const GIFT = "33333333-3333-4333-8333-333333333333";
const DONOR = "44444444-4444-4444-8444-444444444444";
const FOREIGN_DONOR = "55555555-5555-4555-8555-555555555555";
const FUND = "66666666-6666-4666-8666-666666666666";
const FOREIGN_FUND = "77777777-7777-4777-8777-777777777777";
const MISSIONARY = "88888888-8888-4888-8888-888888888888";
const FOREIGN_MISSIONARY = "99999999-9999-4999-8999-999999999999";

const tables = new Map<string, Row[]>();
const writes: Write[] = [];
const rpcCalls: Array<[string, Row]> = [];
/** Runs once after the first staged-gift read, to simulate a concurrent writer. */
let afterFirstGiftRead: (() => void) | null = null;
/** Runs once when an RPC is called, to simulate a writer between two writes. */
let duringRpc: (() => void) | null = null;
/** Runs once before the RPC's own check, to simulate a writer before the call. */
let beforeRpc: (() => void) | null = null;

function giftRow(overrides: Row = {}): Row {
  return {
    id: GIFT,
    tenant_id: TENANT,
    donation_id: "donation-1",
    donor_id: null,
    amount: 10_000,
    currency: "usd",
    status: "needs_review",
    receipt_status: "pending",
    crm_post_status: "not_required",
    metadata: {},
    ...overrides,
  };
}

function resetDatabase(gift: Row = giftRow()) {
  tables.clear();
  writes.length = 0;
  rpcCalls.length = 0;
  afterFirstGiftRead = null;
  duringRpc = null;
  beforeRpc = null;
  tables.set("staged_gifts", [{ ...gift }]);
  tables.set("donors", [
    { id: DONOR, tenant_id: TENANT },
    { id: FOREIGN_DONOR, tenant_id: OTHER_TENANT },
  ]);
  tables.set("funds", [
    { id: FUND, tenant_id: TENANT, system_purpose: null },
    {
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      tenant_id: TENANT,
      system_purpose: "fee_cover",
    },
    { id: FOREIGN_FUND, tenant_id: OTHER_TENANT, system_purpose: null },
  ]);
  tables.set("missionaries", [
    { id: MISSIONARY, tenant_id: TENANT },
    { id: FOREIGN_MISSIONARY, tenant_id: OTHER_TENANT },
  ]);
  tables.set("staged_gift_audit_events", []);
  tables.set("staged_gift_allocations", [
    { tenant_id: gift.tenant_id, staged_gift_id: gift.id, amount: gift.amount },
  ]);
}

/** A small PostgREST-shaped double over the in-memory tables. */
function query(table: string) {
  const filters: Array<(row: Row) => boolean> = [];
  let update: Row | null = null;
  let insert: Row | null = null;
  const rows = () => tables.get(table) ?? [];
  const matching = () => rows().filter((row) => filters.every((f) => f(row)));
  const run = () => {
    if (insert) {
      writes.push({ table, op: "insert", values: insert });
      rows().push({ ...insert });
      return { data: [insert], error: null };
    }
    if (update) {
      const hit = matching();
      for (const row of hit) Object.assign(row, update);
      writes.push({ table, op: "update", values: update });
      return { data: hit.map((row) => ({ ...row })), error: null };
    }
    const data = matching().map((row) => ({ ...row }));
    if (table === "staged_gifts" && afterFirstGiftRead) {
      const hook = afterFirstGiftRead;
      afterFirstGiftRead = null;
      hook();
    }
    return { data, error: null };
  };
  const builder = {
    select: () => builder,
    is: (column: string, value: null) => builder.eq(column, value),
    order: () => builder,
    limit: () => builder,
    eq: (column: string, value: unknown) => {
      filters.push((row) => row[column] === value);
      return builder;
    },
    in: (column: string, values: unknown[]) => {
      filters.push((row) => values.includes(row[column]));
      return builder;
    },
    update: (values: Row) => {
      update = values;
      return builder;
    },
    insert: (values: Row) => {
      insert = values;
      return builder;
    },
    single: async () => {
      const { data } = run();
      return data.length === 1
        ? { data: data[0], error: null }
        : { data: null, error: { code: "PGRST116", message: "No rows" } };
    },
    maybeSingle: async () => {
      const { data } = run();
      return { data: data[0] ?? null, error: null };
    },
    then: (
      resolve: (value: { data: Row[]; error: null }) => unknown,
      reject?: (reason: unknown) => unknown,
    ) => Promise.resolve(run()).then(resolve, reject),
  };
  return builder;
}

const client = {
  from: (table: string) => query(table),
  /**
   * replace_staged_gift_allocations as the database defines it: under the
   * gift's lock it refuses a gift whose status is not the one the caller
   * checked, and otherwise replaces the split.
   */
  rpc: async (fn: string, args: Row) => {
    rpcCalls.push([fn, args]);
    if (beforeRpc) {
      const hook = beforeRpc;
      beforeRpc = null;
      hook();
    }
    const gift = tables
      .get("staged_gifts")
      ?.find(
        (row) =>
          row.id === args.p_staged_gift_id &&
          row.tenant_id === args.p_tenant_id,
      );
    if (!gift) {
      return {
        data: null,
        error: { code: "P0002", message: "Staged gift not found" },
      };
    }
    if (gift.status !== args.p_expected_status) {
      return {
        data: null,
        error: {
          code: "40001",
          message: "Staged gift changed since it was checked",
        },
      };
    }
    tables.set(
      "staged_gift_allocations",
      (args.p_allocations as Row[]).map((line) => ({
        tenant_id: gift.tenant_id,
        staged_gift_id: gift.id,
        amount: line.amount,
      })),
    );
    if (duringRpc) {
      const hook = duringRpc;
      duringRpc = null;
      hook();
    }
    return { data: null, error: null };
  },
};

const baseAuth = {
  userId: "user-1",
  email: "person@example.invalid",
  tenantId: TENANT,
  profileId: "profile-1",
  isAuthenticated: true,
} as const;

function staffWith(staffRole: string, isTenantAdmin = false): AuthContext {
  return {
    ...baseAuth,
    role: isTenantAdmin ? "admin" : "staff",
    assignment: {
      assignmentId: "00000000-0000-4000-8000-000000000001",
      tenantId: TENANT,
      userId: baseAuth.userId,
      membershipRole: "staff",
      staffRole: staffRole as NonNullable<
        AuthContext["assignment"]
      >["staffRole"],
      isTenantAdmin,
      revision: "1",
    },
    memberships: [
      {
        tenantId: TENANT,
        role: "staff",
        staffRole: staffRole as never,
        isActive: true,
        isTenantAdmin,
      },
    ],
  };
}

/**
 * Joined with WP2a (AL-2675): capabilities come from the registry by the one
 * membership the request acts under, and the auth context has no profile
 * role. A caller with a role name and no membership holds nothing; the
 * administrator is the flagged staff row.
 */
const callers = {
  memberCare: staffWith("member_care"),
  development: staffWith("development"),
  legacyStaffProfile: {
    ...baseAuth,
    role: "staff",
    memberships: [],
  } satisfies AuthContext,
  finance: staffWith("finance"),
  admin: staffWith("development", true),
};

function request(pathSuffix: string, method: string, body?: unknown) {
  return new Request(
    `https://admin.example.test/api/admin/contributions/staged-gifts${pathSuffix}`,
    {
      method,
      headers: {
        "content-type": "application/json",
        cookie: "sb-local-auth-token=session",
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    },
  ) as NextRequest;
}

const routes = {
  GET: () => legacy.GET(request("?status=needs_review", "GET")),
  PATCH: (body: unknown = { donorId: DONOR }) =>
    legacy.PATCH(request(`/${GIFT}`, "PATCH", body)),
  POST_APPROVE: () =>
    legacy.POST_APPROVE(request(`/${GIFT}/approve`, "POST", { note: null })),
  POST_RETRY: () =>
    legacy.POST_RETRY(request(`/${GIFT}/retry`, "POST", { note: null })),
  POST_RECEIPT: () =>
    legacy.POST_RECEIPT(request(`/${GIFT}/receipt`, "POST", {})),
};

/** The `details` of each review audit row written, in order. */
function auditDetails() {
  return writes
    .filter((write) => write.table === "staged_gift_audit_events")
    .map((write) => write.values.details);
}

beforeEach(() => {
  vi.clearAllMocks();
  resetDatabase();
  seams.getAdminClient.mockReturnValue({ client, error: null });
  seams.getAuthContext.mockResolvedValue(callers.finance);
  seams.sendStagedGiftReceipt.mockResolvedValue({
    status: "sent",
    sendLogId: "send-1",
  });
});

describe("legacy staged-gift routes refuse non-finance staff (NB-01)", () => {
  const nonFinance = [
    ["member-care staff", callers.memberCare],
    ["development staff", callers.development],
    ["a staff profile with no membership", callers.legacyStaffProfile],
  ] as const;

  describe.each(Object.keys(routes) as Array<keyof typeof routes>)(
    "%s",
    (route) => {
      it.each(nonFinance)(
        "refuses %s with 403 and writes nothing",
        async (_label, caller) => {
          seams.getAuthContext.mockResolvedValue(caller);
          const response = await routes[route]();
          expect(response.status).toBe(403);
          expect(writes).toEqual([]);
          expect(rpcCalls).toEqual([]);
          expect(seams.sendStagedGiftReceipt).not.toHaveBeenCalled();
        },
      );
    },
  );

  it.each([
    ["finance staff", callers.finance],
    ["a tenant admin", callers.admin],
  ])("still serves %s on the review list", async (_label, caller) => {
    seams.getAuthContext.mockResolvedValue(caller);
    const response = await routes.GET();
    expect(response.status).toBe(200);
    const body = (await response.json()) as { rows: Row[] };
    expect(body.rows.map((row) => row.id)).toEqual([GIFT]);
  });

  it("keeps the retired retry route retired for finance staff", async () => {
    const response = await routes.POST_RETRY();
    expect(response.status).toBe(410);
    expect(writes).toEqual([]);
  });
});

describe("legacy approve stays the approve path", () => {
  it.each([
    ["finance staff", callers.finance],
    ["a tenant admin", callers.admin],
  ])("approves a gift awaiting review for %s", async (_label, caller) => {
    seams.getAuthContext.mockResolvedValue(caller);
    const response = await routes.POST_APPROVE();
    expect(response.status).toBe(200);
    expect(tables.get("staged_gifts")?.[0]?.status).toBe("ready_to_post");
  });

  it.each(["posted", "refunded", "voided"])(
    "refuses to approve a %s gift",
    async (status) => {
      resetDatabase(giftRow({ status }));
      const response = await routes.POST_APPROVE();
      expect(response.status).toBe(409);
      expect(writes).toEqual([]);
    },
  );

  // Council round 2, B5: a refund applied between the read and the write
  // must not be overwritten by an approval.
  it("refuses the approval when the gift was refunded after it was read", async () => {
    resetDatabase(
      giftRow({
        last_error_code: "refund_pending",
        last_error_message: "Refund in flight",
      }),
    );
    afterFirstGiftRead = () => {
      const gift = tables.get("staged_gifts")?.[0];
      if (gift) gift.status = "refunded";
    };
    const response = await routes.POST_APPROVE();
    expect(response.status).toBe(409);
    expect(tables.get("staged_gifts")?.[0]).toMatchObject({
      status: "refunded",
      last_error_code: "refund_pending",
      last_error_message: "Refund in flight",
    });
    expect(tables.get("staged_gifts")?.[0]).not.toHaveProperty(
      "reviewed_by_profile_id",
    );
    expect(tables.get("staged_gift_audit_events")).toEqual([]);
  });
});

describe("legacy edit checks the staged gift's state (NV-03)", () => {
  it("relinks the donor and moves a gift awaiting review to ready_to_post", async () => {
    const response = await routes.PATCH({
      donorId: DONOR,
      status: "ready_to_post",
      note: "Matched by finance",
    });
    expect(response.status).toBe(200);
    const gift = tables.get("staged_gifts")?.[0];
    expect(gift).toMatchObject({
      donor_id: DONOR,
      donor_match_status: "corrected",
      status: "ready_to_post",
      review_reason: "Matched by finance",
    });
    expect(
      writes.filter((write) => write.table === "staged_gift_audit_events"),
    ).toHaveLength(1);
  });

  it("replaces the allocation split with references from the tenant", async () => {
    const response = await routes.PATCH({
      allocations: [
        { fundId: FUND, amount: 6_000 },
        { missionaryId: MISSIONARY, amount: 4_000 },
      ],
    });
    expect(response.status).toBe(200);
    expect(rpcCalls.map(([fn]) => fn)).toEqual([
      "replace_staged_gift_allocations",
    ]);
  });

  it.each([
    ["posted", "voided"],
    ["posted", "ready_to_post"],
    ["refunded", "ready_to_post"],
    ["refunded", "voided"],
    ["voided", "needs_review"],
    ["needs_review", "received"],
  ])("refuses to move a %s gift to %s and writes nothing", async (from, to) => {
    resetDatabase(giftRow({ status: from }));
    const response = await routes.PATCH({ status: to });
    expect(response.status).toBe(409);
    expect(writes).toEqual([]);
    expect(tables.get("staged_gifts")?.[0]?.status).toBe(from);
  });

  it.each(["posted", "refunded", "voided"])(
    "refuses to relink the donor or the split of a %s gift",
    async (status) => {
      resetDatabase(giftRow({ status }));
      const relink = await routes.PATCH({ donorId: DONOR });
      const split = await routes.PATCH({
        allocations: [{ fundId: FUND, amount: 10_000 }],
      });
      expect(relink.status).toBe(409);
      expect(split.status).toBe(409);
      expect(writes).toEqual([]);
      expect(rpcCalls).toEqual([]);
    },
  );

  it.each([
    ["a donor", { donorId: FOREIGN_DONOR }],
    ["a fund", { allocations: [{ fundId: FOREIGN_FUND, amount: 10_000 }] }],
    [
      "the reserved fund",
      {
        allocations: [
          { fundId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", amount: 10_000 },
        ],
      },
    ],
    [
      "a missionary",
      { allocations: [{ missionaryId: FOREIGN_MISSIONARY, amount: 10_000 }] },
    ],
    [
      "an unknown fund",
      {
        allocations: [
          { fundId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", amount: 10_000 },
        ],
      },
    ],
  ])(
    "refuses %s as an allocation or donor reference and writes nothing",
    async (_label, body) => {
      const response = await routes.PATCH(body);
      expect(response.status).toBe(400);
      expect(writes).toEqual([]);
      expect(rpcCalls).toEqual([]);
    },
  );

  it("refuses a split that does not equal the gift before writing anything", async () => {
    const response = await routes.PATCH({
      status: "ready_to_post",
      allocations: [{ fundId: FUND, amount: 9_999 }],
    });
    expect(response.status).toBe(400);
    expect(writes).toEqual([]);
    expect(rpcCalls).toEqual([]);
  });

  // Council round 2, B5: a refund that lands after the edit's checked write
  // and before the replacement leaves the split as it was.
  it("refuses with 409 to replace the split of a gift refunded since the check", async () => {
    beforeRpc = () => {
      const gift = tables.get("staged_gifts")?.[0];
      if (gift) gift.status = "refunded";
    };
    const response = await routes.PATCH({
      allocations: [
        { fundId: FUND, amount: 6_000 },
        { missionaryId: MISSIONARY, amount: 4_000 },
      ],
    });
    expect(response.status).toBe(409);
    expect(rpcCalls).toEqual([
      [
        "replace_staged_gift_allocations",
        expect.objectContaining({ p_expected_status: "needs_review" }),
      ],
    ]);
    expect(tables.get("staged_gift_allocations")).toEqual([
      { tenant_id: TENANT, staged_gift_id: GIFT, amount: 10_000 },
    ]);
    expect(tables.get("staged_gifts")?.[0]).toMatchObject({
      status: "refunded",
    });
    expect(tables.get("staged_gifts")?.[0]).not.toHaveProperty(
      "allocation_status",
    );
    // Council round 3: the edit's first write is saved by then, so the edit
    // is audited, with what became of the split, and the lists are refreshed.
    expect(auditDetails()).toEqual([
      expect.objectContaining({ allocationCount: 2, split: "refused" }),
    ]);
    expect(revalidateTag).toHaveBeenCalled();
  });

  // Council round 3: a donor relink and a status change that the edit saved
  // before its split was refused are still audited.
  it("audits the relink and the status it saved when the split is then refused", async () => {
    beforeRpc = () => {
      const gift = tables.get("staged_gifts")?.[0];
      if (gift) gift.status = "refunded";
    };
    const response = await routes.PATCH({
      donorId: DONOR,
      status: "ready_to_post",
      note: "Matched by finance",
      allocations: [{ fundId: FUND, amount: 10_000 }],
    });
    expect(response.status).toBe(409);
    expect(tables.get("staged_gifts")?.[0]).toMatchObject({
      donor_id: DONOR,
      donor_match_status: "corrected",
      review_reason: "Matched by finance",
      status: "refunded",
    });
    expect(tables.get("staged_gift_allocations")).toEqual([
      { tenant_id: TENANT, staged_gift_id: GIFT, amount: 10_000 },
    ]);
    expect(
      writes.filter((write) => write.table === "staged_gift_audit_events"),
    ).toEqual([
      expect.objectContaining({
        values: expect.objectContaining({
          action: "staged_gift_review_updated",
          actor_profile_id: "profile-1",
          note: "Matched by finance",
          details: {
            donorCorrected: true,
            allocationCount: 1,
            status: "ready_to_post",
            split: "refused",
          },
        }),
      }),
    ]);
    expect(revalidateTag).toHaveBeenCalled();
  });

  it("passes the status the edit left the gift in", async () => {
    const response = await routes.PATCH({
      status: "ready_to_post",
      allocations: [{ fundId: FUND, amount: 10_000 }],
    });
    expect(response.status).toBe(200);
    expect(rpcCalls[0]?.[1]).toMatchObject({
      p_expected_status: "ready_to_post",
    });
  });

  // Council round 2, B5: the split is recorded only while the gift is still
  // in the state the edit left it in.
  it("does not record the split on a gift that moved after the checked write", async () => {
    duringRpc = () => {
      const gift = tables.get("staged_gifts")?.[0];
      if (gift) gift.status = "posted";
    };
    const response = await routes.PATCH({
      allocations: [
        { fundId: FUND, amount: 6_000 },
        { missionaryId: MISSIONARY, amount: 4_000 },
      ],
    });
    expect(response.status).toBe(409);
    expect(tables.get("staged_gifts")?.[0]).toMatchObject({
      status: "posted",
    });
    expect(tables.get("staged_gifts")?.[0]).not.toHaveProperty(
      "allocation_status",
    );
    // Council round 3: the new split is saved by then, so it is audited as
    // replaced on a gift that has since moved.
    expect(tables.get("staged_gift_allocations")).toEqual([
      { tenant_id: TENANT, staged_gift_id: GIFT, amount: 6_000 },
      { tenant_id: TENANT, staged_gift_id: GIFT, amount: 4_000 },
    ]);
    expect(auditDetails()).toEqual([
      expect.objectContaining({
        allocationCount: 2,
        split: "replaced_gift_moved",
      }),
    ]);
    expect(revalidateTag).toHaveBeenCalled();
  });

  it("audits a replaced split as replaced", async () => {
    const response = await routes.PATCH({
      allocations: [
        { fundId: FUND, amount: 6_000 },
        { missionaryId: MISSIONARY, amount: 4_000 },
      ],
    });
    expect(response.status).toBe(200);
    expect(auditDetails()).toEqual([
      expect.objectContaining({ allocationCount: 2, split: "replaced" }),
    ]);
  });

  it("records the split with the state check on the gift's tenant", async () => {
    const response = await routes.PATCH({
      allocations: [
        { fundId: FUND, amount: 6_000 },
        { missionaryId: MISSIONARY, amount: 4_000 },
      ],
    });
    expect(response.status).toBe(200);
    expect(tables.get("staged_gifts")?.[0]).toMatchObject({
      status: "needs_review",
      allocation_status: "split",
    });
  });

  it("refuses the edit when the gift's state changed after it was read", async () => {
    afterFirstGiftRead = () => {
      const gift = tables.get("staged_gifts")?.[0];
      if (gift) gift.status = "posted";
    };
    const response = await routes.PATCH({ donorId: DONOR });
    expect(response.status).toBe(409);
    expect(tables.get("staged_gifts")?.[0]).toMatchObject({
      status: "posted",
      donor_id: null,
    });
    expect(
      writes.filter((write) => write.table === "staged_gift_audit_events"),
    ).toEqual([]);
  });
});

describe("legacy receipt resend checks the staged gift's state", () => {
  it("resends a receipt for a posted gift", async () => {
    resetDatabase(giftRow({ status: "posted", donor_id: DONOR }));
    const response = await routes.POST_RECEIPT();
    expect(response.status).toBe(200);
    expect(seams.sendStagedGiftReceipt).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["voided", { status: "voided" }],
    ["refunded", { status: "refunded" }],
    ["suppressed", { status: "posted", receipt_status: "suppressed" }],
  ])(
    "refuses to resend a receipt for a %s gift and sends nothing",
    async (_label, overrides) => {
      resetDatabase(giftRow({ donor_id: DONOR, ...overrides }));
      const response = await routes.POST_RECEIPT();
      expect(response.status).toBe(409);
      expect(seams.sendStagedGiftReceipt).not.toHaveBeenCalled();
      expect(writes).toEqual([]);
    },
  );
});
