import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAdminClientMock, getAuthContextMock, eqCalls, orCalls } = vi.hoisted(
  () => ({
    getAdminClientMock: vi.fn(),
    getAuthContextMock: vi.fn(),
    eqCalls: [] as Array<[string, unknown]>,
    orCalls: [] as string[],
  }),
);

vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
  requireAuth: vi.fn(),
  hasAnyContextRole: (ctx: { roles: string[] }, roles: string[]) =>
    roles.some((role) => ctx.roles.includes(role)),
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));
vi.mock("@asym/database/supabase/post-interactions", () => ({
  fetchUserPostInteractions: vi.fn(async () => []),
  toUserPostInteractionSets: () => ({
    likedPostIds: new Set(),
    prayedPostIds: new Set(),
    firedPostIds: new Set(),
  }),
}));

import { GET } from "../../../../../packages/api/src/posts/index";

function postsClient() {
  const query = {
    select: vi.fn(),
    eq: vi.fn((column: string, value: unknown) => {
      eqCalls.push([column, value]);
      return query;
    }),
    or: vi.fn((filter: string) => {
      orCalls.push(filter);
      return query;
    }),
    order: vi.fn(),
    range: vi.fn(),
    then: (resolve: (value: { data: unknown[]; error: null }) => unknown) =>
      resolve({ data: [], error: null }),
  };
  query.select.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.range.mockReturnValue(query);
  return { from: vi.fn(() => query) };
}

function request(search: string) {
  return new NextRequest(`https://donor.example.test/api/posts${search}`);
}

const PROFILE_ID = "00000000-0000-4000-8000-0000000000aa";

beforeEach(() => {
  eqCalls.length = 0;
  orCalls.length = 0;
  getAdminClientMock.mockReturnValue({ client: postsClient(), error: null });
  getAuthContextMock.mockResolvedValue({
    userId: "user-1",
    profileId: PROFILE_ID,
    tenantId: "tenant-1",
    roles: ["donor"],
  });
});

// GET /api/posts reads with the RLS-bypassing service-role client and has no
// partner-audience check, so other missionaries' restricted posts must never
// be returned -- with or without a missionary filter: only public posts plus
// the caller's own posts (so missionaries can still manage partners-only ones).
describe("GET /api/posts audience boundary", () => {
  it("limits the unfiltered published feed to public and own posts", async () => {
    const response = await GET(request("?status=published&limit=5"));

    expect(response.status).toBe(200);
    expect(eqCalls).toContainEqual(["tenant_id", "tenant-1"]);
    expect(eqCalls).toContainEqual(["status", "published"]);
    expect(orCalls).toEqual([
      `visibility.eq.public,missionary_id.eq.${PROFILE_ID}`,
    ]);
  });

  it("applies the same audience rule to an explicit missionary filter", async () => {
    await GET(request("?status=published&missionaryId=missionary-9"));

    expect(eqCalls).toContainEqual(["missionary_id", "missionary-9"]);
    expect(orCalls).toEqual([
      `visibility.eq.public,missionary_id.eq.${PROFILE_ID}`,
    ]);
  });

  it("keeps drafts scoped to the author", async () => {
    getAuthContextMock.mockResolvedValue({
      userId: "user-1",
      profileId: PROFILE_ID,
      tenantId: "tenant-1",
      roles: ["missionary"],
    });

    await GET(request("?status=draft"));

    expect(eqCalls).toContainEqual(["missionary_id", PROFILE_ID]);
  });
});
