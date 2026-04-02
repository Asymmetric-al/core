import { type NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAdminClientMock, getAuthContextMock } = vi.hoisted(() => ({
  getAdminClientMock: vi.fn(),
  getAuthContextMock: vi.fn(),
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
  requireRole: vi.fn(),
}));

import { GET } from "../../../../packages/api/src/admin/comments/index";
import { PATCH } from "../../../../packages/api/src/admin/comments/comment";

const TENANT_A = "00000000-0000-0000-0000-0000000000aa";
const TENANT_B = "00000000-0000-0000-0000-0000000000bb";

function authContext(tenantId: string) {
  return {
    userId: "user-1",
    tenantId,
    role: "admin",
    profileRole: "admin",
    memberships: [],
    profileId: "prof-1",
    isAuthenticated: true as const,
  };
}

describe("admin comments tenant isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthContextMock.mockResolvedValue(authContext(TENANT_A));
  });

  it("PATCH returns 404 when comment belongs to another tenant", async () => {
    const single = vi
      .fn()
      .mockResolvedValueOnce({
        data: {
          id: "comment-1",
          post: { tenant_id: TENANT_B },
        },
        error: null,
      });
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    const update = vi.fn();
    getAdminClientMock.mockReturnValue({
      client: { from, rpc: vi.fn() },
      error: null,
    });

    const request = new Request("http://localhost/api/admin/comments/c1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: "hijacked" }),
    }) as NextRequest;

    const response = await PATCH(request, {
      params: Promise.resolve({ commentId: "comment-1" }),
    });

    expect(response.status).toBe(404);
    expect(update).not.toHaveBeenCalled();
  });

  it("GET filters out comments whose post is in another tenant", async () => {
    const query: {
      select: ReturnType<typeof vi.fn>;
      order: ReturnType<typeof vi.fn>;
      range: ReturnType<typeof vi.fn>;
      eq?: ReturnType<typeof vi.fn>;
      then?: PromiseLike<{ data: unknown; error: null }>["then"];
    } = {
      select: vi.fn(function selectFn() {
        return query;
      }),
      order: vi.fn(function orderFn() {
        return query;
      }),
      range: vi.fn(function rangeFn() {
        return query;
      }),
    };
    query.then = (onFulfilled, onRejected) =>
      Promise.resolve({
        data: [
          {
            id: "c-own",
            post: { tenant_id: TENANT_A, id: "p1" },
          },
          {
            id: "c-other",
            post: { tenant_id: TENANT_B, id: "p2" },
          },
          {
            id: "c-null-post",
            post: null,
          },
        ],
        error: null,
      }).then(onFulfilled, onRejected);

    const from = vi.fn().mockReturnValue(query);
    getAdminClientMock.mockReturnValue({
      client: { from, rpc: vi.fn() },
      error: null,
    });

    const request = new Request(
      "http://localhost/api/admin/comments?limit=50&offset=0",
    ) as NextRequest;

    const response = await GET(request);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { comments: { id: string }[] };
    expect(body.comments).toHaveLength(1);
    expect(body.comments[0]?.id).toBe("c-own");
  });
});
