import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { membershipsForRole } from "../../../../fixtures/auth-memberships";

const s = vi.hoisted(() => ({
  getAuthContext: vi.fn(),
  sessionRows: [] as Record<string, unknown>[],
  authorRows: [] as Record<string, unknown>[],
  sessionCalls: [] as Array<[string, ...unknown[]]>,
  adminCalls: [] as Array<[string, ...unknown[]]>,
  interactionClients: [] as unknown[],
}));

function recorder(
  calls: Array<[string, ...unknown[]]>,
  rows: () => Record<string, unknown>[],
) {
  const query: Record<string, unknown> = {};
  for (const name of ["select", "eq", "or", "in", "order", "range"])
    query[name] = (...args: unknown[]) => {
      calls.push([name, ...args]);
      return query;
    };
  query.then = (resolve: (value: unknown) => unknown) =>
    resolve({ data: rows(), error: null });
  return {
    from: (table: string) => {
      calls.push(["from", table]);
      return query;
    },
  };
}

const sessionClient = recorder(s.sessionCalls, () => s.sessionRows);
const adminClient = recorder(s.adminCalls, () => s.authorRows);

vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@asym/auth/context")>()),
  getAuthContext: s.getAuthContext,
  requireAuth: vi.fn(),
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: adminClient, error: null }),
}));
vi.mock(
  "../../../../../packages/api/src/shared/request-session-client",
  () => ({
    createRequestSessionClient: async () => sessionClient,
    requestCarriesSupabaseSession: () => true,
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

import { GET } from "../../../../../packages/api/src/posts/index";
import { FEED_POST_AUTHOR_SELECT } from "../../../../../packages/api/src/posts/select";

function request(search: string) {
  return new NextRequest(`https://donor.example.test/api/posts${search}`);
}

const signedIn = (role: "donor" | "missionary") => ({
  userId: "user-1",
  profileId: "profile-1",
  tenantId: "tenant-1",
  assignmentId: "assignment-1",
  isAuthenticated: true,
  memberships: membershipsForRole(role, "tenant-1"),
});

beforeEach(() => {
  s.sessionCalls.length = 0;
  s.adminCalls.length = 0;
  s.interactionClients.length = 0;
  s.sessionRows = [];
  s.authorRows = [];
  s.getAuthContext.mockResolvedValue(signedIn("donor"));
});

describe("GET /api/posts reads on the caller's own token (AL-2680, WP7 pull request 1, invariants 2, 5 and 11)", () => {
  it("selects the feed through the request's own client, so row security decides which updates come back, with no audience filter of its own", async () => {
    const response = await GET(request("?status=published&limit=5"));

    expect(response.status).toBe(200);
    expect(s.sessionCalls).toContainEqual(["from", "posts"]);
    expect(s.sessionCalls).toContainEqual(["select", "*"]);
    expect(s.sessionCalls).toContainEqual(["eq", "tenant_id", "tenant-1"]);
    expect(s.sessionCalls).toContainEqual(["eq", "status", "published"]);
    expect(s.sessionCalls.some(([name]) => name === "or")).toBe(false);
    expect(s.adminCalls).toEqual([]);
  });

  it("names the authors of the rows the caller read, and only those, through the service key's projection; a withheld worker's update carries no name or photo", async () => {
    s.sessionRows = [
      { id: "post-1", worker_withheld: false },
      { id: "post-2", worker_withheld: true },
    ];
    s.authorRows = [
      {
        id: "post-1",
        post_author_public_name: "Cedar",
        author: { id: "profile-9", avatar_url: "https://img.test/a.png" },
      },
      {
        id: "post-2",
        post_author_public_name: "Hidden Name",
        author: { id: "profile-8", avatar_url: "https://img.test/b.png" },
      },
    ];
    const response = await GET(request("?status=published"));
    const { posts } = (await response.json()) as {
      posts: Record<string, unknown>[];
    };

    expect(s.adminCalls).toEqual([
      ["from", "posts"],
      ["select", FEED_POST_AUTHOR_SELECT],
      ["in", "id", ["post-1", "post-2"]],
    ]);
    expect(posts).toEqual([
      expect.objectContaining({
        id: "post-1",
        post_author_public_name: "Cedar",
        author: { id: "profile-9", avatar_url: "https://img.test/a.png" },
      }),
      expect.objectContaining({
        id: "post-2",
        post_author_public_name: null,
        author: null,
      }),
    ]);
    expect(s.interactionClients).toEqual([sessionClient]);
  });

  it("reads a missionary's drafts as their own only, and refuses drafts to anyone else", async () => {
    s.getAuthContext.mockResolvedValue(signedIn("missionary"));
    await GET(request("?status=draft"));
    expect(s.sessionCalls).toContainEqual(["eq", "author_user_id", "user-1"]);

    s.getAuthContext.mockResolvedValue(signedIn("donor"));
    const refused = await GET(request("?status=draft"));
    expect(refused.status).toBe(403);
  });
});

describe("AL-2678 r2a (F5): no proxy or browser keeps the feed, so a restriction shows at the next request", () => {
  it("answers an empty feed and a feed with posts with Cache-Control: private, no-store", async () => {
    const empty = await GET(request("?status=published"));
    expect(empty.status).toBe(200);
    expect(empty.headers.get("cache-control")).toBe("private, no-store");

    s.sessionRows = [{ id: "post-1", worker_withheld: false }];
    s.authorRows = [{ id: "post-1", post_author_public_name: "Cedar" }];
    const full = await GET(request("?status=published"));
    expect(full.status).toBe(200);
    expect(((await full.json()) as { posts: unknown[] }).posts).toHaveLength(1);
    expect(full.headers.get("cache-control")).toBe("private, no-store");
  });
});
