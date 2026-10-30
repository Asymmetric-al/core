import { beforeEach, describe, expect, it, vi } from "vitest";

import * as publicApi from "../../packages/graphql";

import type * as AuthModule from "../../packages/auth/context";
import type { AuthContext } from "../../packages/auth/context";

const seams = vi.hoisted(() => ({
  getAuthContext: vi.fn(),
  getAdminClient: vi.fn(),
  from: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  getAuthContext: seams.getAuthContext,
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: seams.getAdminClient,
}));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

type Row = Record<string, unknown>;
type QueryTrace = { table: string; filters: Array<[string, unknown]> };
const tables = new Map<string, Row[]>();
const queries: QueryTrace[] = [];
const date = "2026-10-21T00:00:00.000Z";
const profile = {
  id: "profile-a",
  tenant_id: "tenant-a",
  user_id: "user-a",
  role: "donor",
  first_name: "Ada",
  last_name: "Example",
  email: "ada@example.invalid",
  avatar_url: "https://example.invalid/avatar.png",
  created_at: date,
  updated_at: date,
};
const missionary = {
  id: "missionary-a",
  tenant_id: "tenant-a",
  profile,
  funding_goal: 100_500,
  current_funding: 12_345,
  created_at: date,
  updated_at: date,
};

function authContext(): AuthContext {
  return {
    userId: "user-a",
    email: profile.email,
    tenantId: "tenant-a",
    role: "donor",
    profileRole: "donor",
    memberships: [],
    profileId: "profile-a",
    isAuthenticated: true,
  };
}

function anonymousContext(): AuthContext {
  return {
    userId: null,
    email: null,
    tenantId: null,
    role: null,
    profileRole: null,
    memberships: [],
    profileId: null,
    isAuthenticated: false,
  };
}

function tableQuery(table: string) {
  const trace: QueryTrace = { table, filters: [] };
  queries.push(trace);
  const matchingRows = () =>
    (tables.get(table) ?? []).filter((row) =>
      trace.filters.every(([column, value]) => row[column] === value),
    );
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn((column: string, value: unknown) => {
      trace.filters.push([column, value]);
      return builder;
    }),
    order: vi.fn(() => builder),
    single: vi.fn(async () => ({
      data: matchingRows()[0] ?? null,
      error: null,
    })),
    range: vi.fn(async (start: number, end: number) => ({
      data: matchingRows().slice(start, end + 1),
      error: null,
    })),
  };
  return builder;
}

function request(
  query: string,
  variables?: Record<string, unknown>,
  headers: Record<string, string> = {},
) {
  return new Request("http://localhost/api/graphql", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify({ query, variables }),
  });
}

async function execute(
  query: string,
  variables?: Record<string, unknown>,
  headers?: Record<string, string>,
) {
  const response = await publicApi
    .createGraphQLHandler()
    .POST(request(query, variables, headers));
  const body: {
    data?: Record<string, unknown> | null;
    errors?: Array<{ message: string }>;
  } = await response.json();
  return { response, body };
}

const donationMutation = `
  mutation Give($input: CreateDonationInput!) {
    createDonation(input: $input) { id tenantId amount currency status createdAt }
  }
`;

describe("product GraphQL HTTP contract with the actual Yoga runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tables.clear();
    queries.length = 0;
    tables.set("profiles", [{ ...profile }]);
    tables.set("missionaries", [{ ...missionary }]);
    tables.set("donations", [
      {
        id: "donation-a",
        tenant_id: "tenant-a",
        donor: { id: "donor-a", profile },
        missionary_id: "missionary-a",
        amount: 12_345,
        currency: "usd",
        status: "pending",
        created_at: date,
      },
    ]);
    seams.getAuthContext.mockResolvedValue(authContext());
    seams.getAdminClient.mockReturnValue({
      client: { from: seams.from, rpc: seams.rpc },
      error: null,
    });
    seams.from.mockImplementation(tableQuery);
    seams.rpc.mockResolvedValue({
      data: {
        donation_id: "donation-a",
        outbox_id: "outbox-a",
        replayed: false,
      },
      error: null,
    });
  });

  it("exports only the handler factory, keeping schema objects inside the package", () => {
    expect(Object.keys(publicApi)).toEqual(["createGraphQLHandler"]);
    expect(Object.keys(publicApi.createGraphQLHandler()).sort()).toEqual([
      "GET",
      "OPTIONS",
      "POST",
    ]);
  });

  it("serves an anonymous me query over GET without database reads", async () => {
    seams.getAuthContext.mockResolvedValue(anonymousContext());
    const response = await publicApi
      .createGraphQLHandler()
      .GET(
        new Request(
          `http://localhost/api/graphql?query=${encodeURIComponent("{ me { id } }")}`,
        ),
      );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { me: null } });
    expect(seams.from).not.toHaveBeenCalled();
    expect(seams.rpc).not.toHaveBeenCalled();
  });

  it("passes the original request to auth and scopes the profile query to its tenant", async () => {
    const incoming = request(
      "{ myProfile { id tenantId createdAt } }",
      undefined,
      {
        authorization: "Bearer synthetic-test-token",
      },
    );
    const response = await publicApi.createGraphQLHandler().POST(incoming);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      data: {
        myProfile: { id: "profile-a", tenantId: "tenant-a", createdAt: date },
      },
    });
    expect(seams.getAuthContext).toHaveBeenCalledWith(incoming);
    expect(queries).toContainEqual({
      table: "profiles",
      filters: [
        ["id", "profile-a"],
        ["tenant_id", "tenant-a"],
      ],
    });
  });

  it("denies anonymous protected reads before database transport", async () => {
    seams.getAuthContext.mockResolvedValue(anonymousContext());
    const { response, body } = await execute("{ myProfile { id } }");
    expect(response.status).toBe(200);
    expect(body.errors).toHaveLength(1);
    expect(body.data).toEqual({ myProfile: null });
    expect(seams.from).not.toHaveBeenCalled();
  });

  it("denies a donor's privileged mutation before RPC transport", async () => {
    const { body } = await execute(
      'mutation { updateUserRole(input: { userId: "profile-b", role: admin }) { id } }',
    );
    expect(body.errors).toHaveLength(1);
    expect(seams.rpc).not.toHaveBeenCalled();
    expect(seams.from).not.toHaveBeenCalled();
  });

  it("returns no foreign missionary and filters lists by the authenticated tenant", async () => {
    tables.get("missionaries")?.push({
      ...missionary,
      id: "missionary-b",
      tenant_id: "tenant-b",
    });
    const { body } = await execute(`{
      missionary(id: "missionary-b") { id }
      missionaries { id fundingGoal currentFunding createdAt }
    }`);
    expect(body).toEqual({
      data: {
        missionary: null,
        missionaries: [
          {
            id: "missionary-a",
            fundingGoal: 100_500,
            currentFunding: 12_345,
            createdAt: date,
          },
        ],
      },
    });
    expect(queries).toHaveLength(2);
    for (const query of queries)
      expect(query.filters).toContainEqual(["tenant_id", "tenant-a"]);
  });

  it.each([1.5, 2_147_483_648, "12345"])(
    "rejects a non-Int donation amount %s before mutation transport",
    async (amount) => {
      const { response, body } = await execute(
        donationMutation,
        { input: { missionaryId: "missionary-a", amount } },
        { "idempotency-key": "gift-attempt-a" },
      );
      expect(response.status).toBe(400);
      expect(body.errors?.length).toBeGreaterThan(0);
      expect(seams.rpc).not.toHaveBeenCalled();
      expect(seams.from).not.toHaveBeenCalled();
    },
  );

  it("rejects unknown input fields before mutation transport", async () => {
    const { response, body } = await execute(
      donationMutation,
      {
        input: {
          missionaryId: "missionary-a",
          amount: 12_345,
          tenantId: "tenant-b",
        },
      },
      { "idempotency-key": "gift-attempt-a" },
    );
    expect(response.status).toBe(400);
    expect(body.errors?.length).toBeGreaterThan(0);
    expect(seams.rpc).not.toHaveBeenCalled();
    expect(seams.from).not.toHaveBeenCalled();
  });

  it("requires an idempotency header before admitting a donation", async () => {
    const { body } = await execute(donationMutation, {
      input: { missionaryId: "missionary-a", amount: 12_345 },
    });
    expect(body.errors).toHaveLength(1);
    expect(seams.rpc).not.toHaveBeenCalled();
    expect(seams.from).not.toHaveBeenCalled();
  });

  it("preserves quoted cents, currency and command identity across replayed requests", async () => {
    const variables = {
      input: { missionaryId: "missionary-a", amount: 12_345, currency: "USD" },
    };
    const headers = { "idempotency-key": "gift-attempt-a" };
    const first = await execute(donationMutation, variables, headers);
    seams.rpc.mockResolvedValue({
      data: {
        donation_id: "donation-a",
        outbox_id: "outbox-a",
        replayed: true,
      },
      error: null,
    });
    const replay = await execute(donationMutation, variables, headers);
    expect(first.body.errors).toBeUndefined();
    expect(first.body).toEqual({
      data: {
        createDonation: {
          id: "donation-a",
          tenantId: "tenant-a",
          amount: 12_345,
          currency: "usd",
          status: "pending",
          createdAt: date,
        },
      },
    });
    expect(replay.body).toEqual(first.body);
    expect(seams.rpc).toHaveBeenCalledTimes(2);
    for (const call of seams.rpc.mock.calls) {
      expect(call).toEqual([
        "begin_donation_saga",
        expect.objectContaining({
          p_tenant_id: "tenant-a",
          p_profile_id: "profile-a",
          p_actor_user_id: "user-a",
          p_amount: 12_345,
          p_currency: "usd",
          p_idempotency_key: "gift-attempt-a",
        }),
      ]);
    }
  });

  it.each([
    { input: {}, expectedAvatar: undefined },
    { input: { avatarUrl: null }, expectedAvatar: null },
  ])(
    "preserves omitted versus null update fields: $input",
    async (testCase) => {
      const { body } = await execute(
        "mutation Update($input: UpdateProfileInput!) { updateMyProfile(input: $input) { id } }",
        { input: testCase.input },
      );
      expect(body.errors).toBeUndefined();
      expect(seams.rpc).toHaveBeenCalledWith(
        "atomic_update_profile_with_audit",
        expect.objectContaining({
          p_profile_id: "profile-a",
          p_tenant_id: "tenant-a",
          p_actor_user_id: "user-a",
          p_updates: expect.objectContaining({
            updated_at: expect.any(String),
          }),
        }),
      );
      const updates = seams.rpc.mock.calls[0]?.[1].p_updates;
      expect(Object.hasOwn(updates, "avatar_url")).toBe(
        testCase.expectedAvatar !== undefined,
      );
      if (testCase.expectedAvatar !== undefined)
        expect(updates.avatar_url).toBe(testCase.expectedAvatar);
    },
  );

  it("rejects mutation execution over GET", async () => {
    const query = 'mutation { likePost(postId: "post-a") }';
    const response = await publicApi
      .createGraphQLHandler()
      .GET(
        new Request(
          `http://localhost/api/graphql?query=${encodeURIComponent(query)}`,
        ),
      );
    expect(response.status).toBe(405);
    expect(seams.rpc).not.toHaveBeenCalled();
  });

  it.each(["GET", "POST", "OPTIONS"] as const)(
    "returns the existing unavailable response on %s when admin configuration is absent",
    async (method) => {
      seams.getAdminClient.mockReturnValue({
        client: null,
        error: "Database unavailable",
      });
      const incoming = new Request("http://localhost/api/graphql", { method });
      const response = await publicApi.createGraphQLHandler()[method](incoming);
      expect(response.status).toBe(503);
      expect(response.headers.get("content-type")).toBe("application/json");
      expect(await response.json()).toEqual({ error: "Database unavailable" });
      expect(seams.getAuthContext).not.toHaveBeenCalled();
      expect(seams.rpc).not.toHaveBeenCalled();
    },
  );
});
