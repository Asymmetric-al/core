import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * TDD — finding 06 Gap 3: posts/comments GET reads post_comments (+ joined
 * profiles) via the user-scoped client with no explicit auth call. Add an
 * explicit auth check rather than relying on RLS alone.
 *
 * WP2b, first release (AL-2675; plan 5.4): the caller is now resolved through
 * `getAuthContext`, so that the session client sends the tenant and
 * assignment the resolver selected. The two original assertions are kept as
 * they were, on that seam.
 */

const { createClientMock, getAuthContextMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  getAuthContextMock: vi.fn(),
}));

vi.mock("@asym/database/supabase/server", () => ({
  createClient: createClientMock,
}));
vi.mock("@asym/auth/context", async () => {
  const actual =
    await vi.importActual<typeof AuthContext>("@asym/auth/context");
  return { ...actual, getAuthContext: getAuthContextMock };
});

import { GET, POST } from "../../src/posts/comments";

import type * as AuthContext from "@asym/auth/context";
import type { NextRequest } from "next/server";

const TENANT = "00000000-0000-0000-0000-000000000002";
const ASSIGNMENT = "00000000-0000-4000-8000-000000000152";
const POST_ID = "00000000-0000-4000-8000-0000000000a1";

function ctx(postId = POST_ID) {
  return { params: Promise.resolve({ postId }) };
}
const request = new Request(
  `https://example.com/api/posts/${POST_ID}/comments`,
) as unknown as NextRequest;

function signedIn(userId: string | null) {
  getAuthContextMock.mockResolvedValue(
    userId
      ? {
          isAuthenticated: true,
          userId,
          email: null,
          tenantId: TENANT,
          role: "missionary",
          memberships: [
            {
              tenantId: TENANT,
              role: "missionary",
              staffRole: null,
              isActive: true,
              isTenantAdmin: false,
            },
          ],
          assignment: {
            assignmentId: ASSIGNMENT,
            userId,
            tenantId: TENANT,
            revision: "1",
            membershipRole: "missionary",
            staffRole: null,
            isTenantAdmin: false,
          },
          assignmentDenial: null,
          profileId: "profile-1",
        }
      : {
          isAuthenticated: false,
          userId: null,
          email: null,
          tenantId: null,
          role: null,
          memberships: [],
          assignment: null,
          assignmentDenial: null,
          profileId: null,
        },
  );
}

function mockClient() {
  const order = vi.fn().mockResolvedValue({ data: [], error: null });
  const maybeSingle = vi
    .fn()
    .mockResolvedValue({ data: { id: POST_ID }, error: null });
  const eq: ReturnType<typeof vi.fn> = vi.fn(() => ({
    eq,
    order,
    maybeSingle,
  }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));
  // The commenters' names and avatars (`post_comment_authors`; AL-2675, JB11).
  const rpc = vi.fn().mockResolvedValue({ data: [], error: null });
  createClientMock.mockResolvedValue({ from, rpc });
  return { from };
}

describe("posts/comments GET — explicit auth check (finding 06 Gap 3)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 for an unauthenticated caller and never queries comments", async () => {
    signedIn(null);
    const { from } = mockClient();
    const res = await GET(request, ctx());
    expect(res.status).toBe(401);
    expect(from).not.toHaveBeenCalled();
  });

  it("returns comments for an authenticated caller (feature still works)", async () => {
    signedIn("user-1");
    const { from } = mockClient();
    const res = await GET(request, ctx());
    expect(res.status).toBe(200);
    expect(from).toHaveBeenCalledWith("posts");
    expect(from).toHaveBeenCalledWith("post_comments");
  });

  it("reads with a session client that sends the resolved tenant and assignment", async () => {
    signedIn("user-1");
    mockClient();
    await GET(request, ctx());
    expect(getAuthContextMock).toHaveBeenCalledWith(request);
    expect(createClientMock).toHaveBeenCalledWith({
      tenantId: TENANT,
      assignmentId: ASSIGNMENT,
    });
  });
});

describe("posts/comments POST — read-only demo no-op", () => {
  it("returns the demo no-op payload without writing a comment", async () => {
    const res = await POST(request, ctx());
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      success: true,
      readOnlyDemo: true,
    });
    expect(createClientMock).not.toHaveBeenCalled();
  });
});
