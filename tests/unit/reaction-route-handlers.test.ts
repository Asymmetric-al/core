import { type NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Rewritten by the WP2a sweep (AL-2675; plan 7.1, NR-68): the routes took
 * their tenant from the caller's `profiles.tenant_id`; they now take the
 * tenant of the request's resolved assignment and read no profile. The old
 * "missing profile" denial is now "no resolved assignment" (401 before any
 * lookup); the others keep their meaning.
 */
const {
  createClientMock,
  getAdminClientMock,
  getAuthContextMock,
  revalidateTagMock,
} = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  getAdminClientMock: vi.fn(),
  getAuthContextMock: vi.fn(),
  revalidateTagMock: vi.fn(),
}));

vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@asym/auth/context")>()),
  getAuthContext: getAuthContextMock,
}));

vi.mock("@asym/database/supabase/server", () => ({
  createClient: createClientMock,
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
}));

import {
  DELETE as unfirePost,
  POST as firePost,
} from "../../packages/api/src/posts/fire";
import {
  DELETE as unlikePost,
  POST as likePost,
} from "../../packages/api/src/posts/like";
import {
  DELETE as unprayForPost,
  POST as prayForPost,
} from "../../packages/api/src/posts/prayer";

const POST_ID = "00000000-0000-4000-8000-000000000001";
const TENANT_ID = "tenant-1";
const OTHER_TENANT_ID = "tenant-2";
const USER_ID = "user-1";

type MutationHandler = (
  request: NextRequest,
  context: { params: Promise<{ postId: string }> },
) => Promise<Response>;

type LookupResult = {
  data: { tenant_id: string | null } | null;
  error: unknown;
};

interface RequestClientOptions {
  /** The resolved request: a donor assignment in TENANT_ID, or none. */
  session?: "donor" | "signed-out" | "no-assignment";
  post?: LookupResult;
}

function createLookupMock(result: LookupResult) {
  const single = vi.fn().mockResolvedValue(result);
  const query = { eq: vi.fn(), single };
  query.eq.mockReturnValue(query);
  const select = vi.fn().mockReturnValue(query);

  return { select, eq: query.eq, single };
}

function mockRequestClient({
  session = "donor",
  post = { data: { tenant_id: TENANT_ID }, error: null },
}: RequestClientOptions = {}) {
  getAuthContextMock.mockResolvedValue({
    userId: session === "signed-out" ? null : USER_ID,
    email: null,
    tenantId: session === "donor" ? TENANT_ID : null,
    role: session === "donor" ? "donor" : null,
    memberships:
      session === "donor"
        ? [
            {
              tenantId: TENANT_ID,
              role: "donor",
              staffRole: null,
              isActive: true,
            },
          ]
        : [],
    profileId: session === "signed-out" ? null : "profile-1",
    isAuthenticated: session === "donor",
  });
  const postLookup = createLookupMock(post);
  const requestRpc = vi.fn();
  const from = vi.fn((table: string) => {
    if (table === "posts") {
      return { select: postLookup.select };
    }
    throw new Error(`Unexpected table: ${table}`);
  });

  createClientMock.mockResolvedValue({
    from,
    rpc: requestRpc,
  });

  return {
    from,
    postLookup,
    requestRpc,
  };
}

function mockAdminRpc(result: { data: unknown; error: unknown }) {
  const adminRpc = vi.fn().mockResolvedValue(result);
  getAdminClientMock.mockReturnValue({
    client: { rpc: adminRpc },
    error: null,
  });
  return adminRpc;
}

function invoke(handler: MutationHandler) {
  const request = new Request(
    `https://example.test/api/posts/${POST_ID}/reaction`,
  ) as NextRequest;

  return handler(request, {
    params: Promise.resolve({ postId: POST_ID }),
  });
}

const mutationCases: Array<{
  label: string;
  handler: MutationHandler;
  rpcName: string;
  notFoundMessage: string;
}> = [
  {
    label: "like",
    handler: likePost,
    rpcName: "atomic_like_post",
    notFoundMessage: "Post not found",
  },
  {
    label: "unlike",
    handler: unlikePost,
    rpcName: "atomic_unlike_post",
    notFoundMessage: "Post not found",
  },
  {
    label: "pray",
    handler: prayForPost,
    rpcName: "atomic_pray_for_post",
    notFoundMessage: "Post not found",
  },
  {
    label: "unpray",
    handler: unprayForPost,
    rpcName: "atomic_unpray_for_post",
    notFoundMessage: "Post not found",
  },
  {
    label: "fire",
    handler: firePost,
    rpcName: "atomic_fire_post",
    notFoundMessage: "Post not found",
  },
  {
    label: "unfire",
    handler: unfirePost,
    rpcName: "atomic_unfire_post",
    notFoundMessage: "Post not found",
  },
];

const deniedCases: Array<{
  label: string;
  options: RequestClientOptions;
  status: number;
  error: string;
}> = [
  {
    label: "unauthenticated",
    options: { session: "signed-out" },
    status: 401,
    error: "Unauthorized",
  },
  {
    label: "no resolved assignment",
    options: { session: "no-assignment" },
    status: 401,
    error: "Unauthorized",
  },
  {
    label: "cross-tenant post",
    options: {
      post: { data: { tenant_id: OTHER_TENANT_ID }, error: null },
    },
    status: 404,
    error: "Post not found",
  },
];

describe("donor reaction route handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(mutationCases)(
    "$label uses the admin RPC after auth and tenant validation",
    async ({ handler, rpcName }) => {
      const requestClient = mockRequestClient();
      const adminRpc = mockAdminRpc({
        data: { applied: true },
        error: null,
      });

      const response = await invoke(handler);

      await expect(response.json()).resolves.toEqual({
        success: true,
        applied: true,
      });
      expect(response.status).toBe(200);
      expect(getAuthContextMock).toHaveBeenCalledOnce();
      expect(requestClient.from.mock.calls).toEqual([["posts"]]);
      expect(requestClient.postLookup.eq).toHaveBeenNthCalledWith(
        1,
        "id",
        POST_ID,
      );
      expect(requestClient.postLookup.eq).toHaveBeenNthCalledWith(
        2,
        "tenant_id",
        TENANT_ID,
      );
      expect(requestClient.requestRpc).not.toHaveBeenCalled();
      expect(getAdminClientMock).toHaveBeenCalledOnce();
      expect(adminRpc).toHaveBeenCalledOnce();
      expect(adminRpc).toHaveBeenCalledWith(rpcName, {
        p_post_id: POST_ID,
        p_user_id: USER_ID,
        p_tenant_id: TENANT_ID,
      });
      expect(
        requestClient.postLookup.single.mock.invocationCallOrder[0]!,
      ).toBeLessThan(getAdminClientMock.mock.invocationCallOrder[0]!);
      expect(revalidateTagMock).toHaveBeenNthCalledWith(
        1,
        `posts:tenant:${TENANT_ID}`,
        "max",
      );
      expect(revalidateTagMock).toHaveBeenNthCalledWith(
        2,
        `post:${POST_ID}`,
        "max",
      );
    },
  );

  it.each(
    mutationCases.flatMap((mutation) =>
      deniedCases.map((denial) => ({ mutation, denial })),
    ),
  )(
    "$mutation.label denies $denial.label without obtaining an admin client",
    async ({ mutation, denial }) => {
      const requestClient = mockRequestClient(denial.options);
      const adminRpc = vi.fn();
      getAdminClientMock.mockReturnValue({
        client: { rpc: adminRpc },
        error: null,
      });

      const response = await invoke(mutation.handler);

      await expect(response.json()).resolves.toEqual({ error: denial.error });
      expect(response.status).toBe(denial.status);
      expect(getAdminClientMock).not.toHaveBeenCalled();
      expect(adminRpc).not.toHaveBeenCalled();
      expect(requestClient.requestRpc).not.toHaveBeenCalled();
      expect(revalidateTagMock).not.toHaveBeenCalled();
    },
  );

  it.each(mutationCases)(
    "$label fails closed when the admin client is unavailable",
    async ({ handler }) => {
      const requestClient = mockRequestClient();
      getAdminClientMock.mockReturnValue({
        client: null,
        error: "SUPABASE_SERVICE_ROLE_KEY is not configured",
      });

      const response = await invoke(handler);

      await expect(response.json()).resolves.toEqual({
        error: "SUPABASE_SERVICE_ROLE_KEY is not configured",
      });
      expect(response.status).toBe(503);
      expect(getAdminClientMock).toHaveBeenCalledOnce();
      expect(requestClient.requestRpc).not.toHaveBeenCalled();
      expect(revalidateTagMock).not.toHaveBeenCalled();
    },
  );

  it.each(mutationCases)(
    "$label preserves an unapplied result without revalidating",
    async ({ handler }) => {
      const requestClient = mockRequestClient();
      const adminRpc = mockAdminRpc({
        data: { applied: false },
        error: null,
      });

      const response = await invoke(handler);

      await expect(response.json()).resolves.toEqual({
        success: true,
        applied: false,
      });
      expect(response.status).toBe(200);
      expect(adminRpc).toHaveBeenCalledOnce();
      expect(requestClient.requestRpc).not.toHaveBeenCalled();
      expect(revalidateTagMock).not.toHaveBeenCalled();
    },
  );

  it.each(mutationCases)(
    "$label preserves the atomic RPC not-found response",
    async ({ handler, notFoundMessage }) => {
      const requestClient = mockRequestClient();
      const adminRpc = mockAdminRpc({
        data: null,
        error: { code: "P0002" },
      });

      const response = await invoke(handler);

      await expect(response.json()).resolves.toEqual({
        error: notFoundMessage,
      });
      expect(response.status).toBe(404);
      expect(adminRpc).toHaveBeenCalledOnce();
      expect(requestClient.requestRpc).not.toHaveBeenCalled();
      expect(revalidateTagMock).not.toHaveBeenCalled();
    },
  );

  it("returns the adapter-owned like failure copy for a non-P0002 RPC error", async () => {
    const requestClient = mockRequestClient();
    const adminRpc = mockAdminRpc({
      data: null,
      error: { code: "XX000", message: "database exploded" },
    });

    const response = await invoke(likePost);

    await expect(response.json()).resolves.toEqual({
      error: "Failed to register like",
    });
    expect(response.status).toBe(500);
    expect(adminRpc).toHaveBeenCalledOnce();
    expect(requestClient.requestRpc).not.toHaveBeenCalled();
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });
});
