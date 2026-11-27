import { beforeEach, describe, expect, it, vi } from "vitest";

import { createGraphQLHandler } from "../../packages/graphql/handler";

import type * as SessionModule from "../../packages/api/src/shared/request-session-client";
import type * as AuthModule from "../../packages/auth/context";
import type { AuthContext } from "../../packages/auth/context";

const TENANT = "00000000-0000-4000-8000-0000000000a1";

const s = vi.hoisted(() => ({
  auth: null as unknown,
  sessionCalls: [] as Array<[string, ...unknown[]]>,
  adminCalls: [] as Array<[string, ...unknown[]]>,
  sessionRows: [] as Record<string, unknown>[],
  adminRows: [] as Record<string, unknown>[],
  interactionClients: [] as unknown[],
}));

function recorder(
  calls: Array<[string, ...unknown[]]>,
  rows: () => Record<string, unknown>[],
) {
  const query: Record<string, unknown> = {};
  for (const name of ["select", "eq", "in", "order", "range"])
    query[name] = (...args: unknown[]) => {
      calls.push([name, ...args]);
      return query;
    };
  query.maybeSingle = async () => ({ data: rows()[0] ?? null, error: null });
  query.single = query.maybeSingle;
  query.then = (resolve: (value: unknown) => unknown) =>
    resolve({ data: rows(), error: null });
  return {
    from: (table: string) => {
      calls.push(["from", table]);
      return query;
    },
  };
}

const session = recorder(s.sessionCalls, () => s.sessionRows);
const admin = recorder(s.adminCalls, () => s.adminRows);

vi.mock("@asym/auth/context", async (orig) => ({
  ...(await orig<typeof AuthModule>()),
  getAuthContext: async () => s.auth,
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: admin, error: null }),
}));
vi.mock(
  "../../packages/api/src/shared/request-session-client",
  async (original) => ({
    ...(await original<typeof SessionModule>()),
    createRequestSessionClient: async () => session,
  }),
);
vi.mock("@asym/database/supabase/post-interactions", () => ({
  fetchUserPostInteractions: vi.fn(async (client: unknown) => {
    s.interactionClients.push(client);
    return [];
  }),
  toUserPostInteractionSets: () => ({
    likedPostIds: new Set(),
    prayedPostIds: new Set(),
    firedPostIds: new Set(),
  }),
}));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

const donor = {
  userId: "00000000-0000-4000-9000-000000000001",
  email: null,
  tenantId: TENANT,
  role: "donor",
  memberships: [
    {
      tenantId: TENANT,
      role: "donor",
      staffRole: null,
      isActive: true,
      isTenantAdmin: false,
    },
  ],
  assignment: {
    assignmentId: "00000000-0000-4000-8000-00000000a0a1",
    userId: "00000000-0000-4000-9000-000000000001",
    tenantId: TENANT,
    revision: "1",
    membershipRole: "donor",
    staffRole: null,
    isTenantAdmin: false,
  },
  assignmentDenial: null,
  profileId: "00000000-0000-4000-8000-000000000001",
  isAuthenticated: true,
} as AuthContext;

async function run(query: string) {
  const response = await createGraphQLHandler().POST(
    new Request("http://localhost/api/graphql", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer graphql-fixture",
      },
      body: JSON.stringify({ query }),
    }),
  );
  return (await response.json()) as {
    data?: Record<string, unknown>;
    errors?: unknown[];
  };
}

beforeEach(() => {
  s.auth = donor;
  s.sessionCalls.length = 0;
  s.adminCalls.length = 0;
  s.interactionClients.length = 0;
  s.sessionRows = [{ id: "post-1", tenant_id: TENANT, content: "Letter" }];
  s.adminRows = [{ id: "post-1", missionary: null }];
});

describe("GraphQL posts and post read on the caller's own token (AL-2680, WP7 pull request 1, invariant 11)", () => {
  it("selects the posts through the request's own client, so row security decides which come back, and enriches only the rows it read", async () => {
    const result = await run("{ posts { id content } }");
    expect(result.errors).toBeUndefined();
    expect(result.data?.posts).toEqual([{ id: "post-1", content: "Letter" }]);
    expect(s.sessionCalls).toContainEqual(["from", "posts"]);
    expect(s.sessionCalls).toContainEqual(["select", "*"]);
    expect(s.sessionCalls).toContainEqual(["eq", "tenant_id", TENANT]);
    expect(s.adminCalls.filter(([name]) => name === "from")).toEqual([
      ["from", "posts"],
    ]);
    expect(s.adminCalls).toContainEqual(["in", "id", ["post-1"]]);
    expect(s.interactionClients).toEqual([session]);
  });

  it("reads one post on the caller's own token, and answers null where row security returns none, reading nothing with the service key", async () => {
    const found = await run('{ post(id: "post-1") { id } }');
    expect(found.data?.post).toEqual({ id: "post-1" });
    expect(s.sessionCalls).toContainEqual(["eq", "id", "post-1"]);

    s.sessionRows = [];
    s.adminCalls.length = 0;
    const hidden = await run('{ post(id: "post-2") { id } }');
    expect(hidden.data?.post).toBeNull();
    expect(s.adminCalls).toEqual([]);
  });
});
