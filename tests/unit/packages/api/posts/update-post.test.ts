import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PATCH } from "../../../../../packages/api/src/posts/post";
import { membershipsForRole } from "../../../../fixtures/auth-memberships";

import type * as SessionModule from "../../../../../packages/api/src/shared/request-session-client";
import type * as AuthModule from "../../../../../packages/auth/context";

const s = vi.hoisted(() => ({
  auth: null as unknown,
  rpc: vi.fn(),
  reads: [] as Array<[string, ...unknown[]]>,
  row: null as Record<string, unknown> | null,
  serviceKeyUsed: vi.fn(),
}));

vi.mock("@asym/auth/context", async (orig) => ({
  ...(await orig<typeof AuthModule>()),
  getAuthContext: async () => s.auth,
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => {
    s.serviceKeyUsed();
    throw new Error("service-key client used");
  },
}));
vi.mock(
  "../../../../../packages/api/src/shared/request-session-client",
  async (original) => ({
    ...(await original<typeof SessionModule>()),
    createRequestSessionClient: async () => ({
      rpc: s.rpc,
      from: (table: string) => {
        s.reads.push(["from", table]);
        const query = {
          select: (columns: string) => {
            s.reads.push(["select", columns]);
            return query;
          },
          eq: (column: string, value: unknown) => {
            s.reads.push(["eq", column, value]);
            return query;
          },
          maybeSingle: async () => ({ data: s.row, error: null }),
          single: async () => ({ data: s.row, error: null }),
        };
        return query;
      },
    }),
  }),
);
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

const TENANT = "tenant-1";
const version = "2026-11-11T12:00:00.000Z";
const postId = "11111111-2222-4333-8444-555555555555";
const body = {
  title: "Clinic opens",
  content: "<p>New draft text</p>",
  post_type: "Update",
  visibility: "public",
  status: "draft",
  media: [],
};
const request = (payload: Record<string, unknown>) =>
  new NextRequest(`http://localhost/api/posts/${postId}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer patch-fixture",
    },
    body: JSON.stringify(payload),
  });
const params = { params: Promise.resolve({ postId }) };

beforeEach(() => {
  s.rpc.mockReset();
  s.reads.length = 0;
  s.serviceKeyUsed.mockReset();
  s.row = { id: postId, updated_at: "2026-11-11T12:00:01.000Z" };
  s.auth = {
    userId: "user-1",
    profileId: "profile-1",
    tenantId: TENANT,
    role: "missionary",
    isAuthenticated: true,
    memberships: membershipsForRole("missionary", TENANT),
    assignment: {
      assignmentId: "assignment-1",
      userId: "user-1",
      tenantId: TENANT,
      membershipRole: "missionary",
      staffRole: null,
      isTenantAdmin: false,
      revision: "1",
    },
    assignmentDenial: null,
  };
});

describe("PATCH /api/posts/[postId]: an edit goes through the own-ministry lane on the missionary's own token (AL-2680 fix round C1)", () => {
  it("passes every field and the autosave's preconditions to submit_ministry_update, reads the update back on the same token, and never opens the service key", async () => {
    s.rpc.mockResolvedValue({ data: postId, error: null });
    const response = await PATCH(
      request({ ...body, autosave: true, expected_updated_at: version }),
      params,
    );
    expect(response.status).toBe(200);
    expect(s.rpc).toHaveBeenCalledWith("submit_ministry_update", {
      p_tenant_id: TENANT,
      p_post_id: postId,
      p_title: "Clinic opens",
      p_content: "<p>New draft text</p>",
      p_media: [],
      p_visibility: "public",
      p_post_type: "Update",
      p_publish: false,
      p_expected_updated_at: version,
      p_expected_draft: true,
    });
    expect(s.reads).toContainEqual(["from", "posts"]);
    expect(s.reads).toContainEqual(["eq", "id", postId]);
    expect(s.serviceKeyUsed).not.toHaveBeenCalled();
    expect(((await response.json()) as { post: { id: string } }).post.id).toBe(
      postId,
    );
  });

  it("publishes an edit with no autosave precondition", async () => {
    s.rpc.mockResolvedValue({ data: postId, error: null });
    const response = await PATCH(
      request({ ...body, status: "published", expected_updated_at: null }),
      params,
    );
    expect(response.status).toBe(200);
    expect(s.rpc).toHaveBeenCalledWith(
      "submit_ministry_update",
      expect.objectContaining({
        p_publish: true,
        p_expected_updated_at: null,
        p_expected_draft: false,
      }),
    );
  });

  it("answers 409 for a stale write, 404 for an update that is not the caller's own, and 403 with words the missionary can act on when their worker record is not linked", async () => {
    s.rpc.mockResolvedValue({
      data: null,
      error: { code: "40001", message: "Post changed since it was loaded" },
    });
    expect((await PATCH(request(body), params)).status).toBe(409);

    s.rpc.mockResolvedValue({
      data: null,
      error: {
        code: "42501",
        message: "tenant_guard: the update is not the caller's own",
      },
    });
    const notOwn = await PATCH(request(body), params);
    expect(notOwn.status).toBe(404);

    s.rpc.mockResolvedValue({
      data: null,
      error: {
        code: "42501",
        message:
          "tenant_guard: the caller's worker record is not linked to their sign-in",
        hint: "worker_not_linked",
      },
    });
    const unlinked = await PATCH(request(body), params);
    expect(unlinked.status).toBe(403);
    expect(await unlinked.json()).toEqual({
      error:
        "Your worker record is not linked to your sign-in yet: ask your organization’s staff.",
      code: "worker_not_linked",
    });
  });

  it("answers a fixed sentence, never the database's words, when the command fails otherwise", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    s.rpc.mockResolvedValue({
      data: null,
      error: { code: "XX000", message: "relation detail from the database" },
    });
    const failed = await PATCH(request(body), params);
    expect(failed.status).toBe(500);
    expect(((await failed.json()) as { error: string }).error).toBe(
      "Couldn’t save that update. Nothing was changed.",
    );
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });

  it("refuses an edit without its words, visibility or status, and an autosave without its revision or as a published update, before any command", async () => {
    for (const payload of [
      { ...body, content: undefined },
      { ...body, visibility: undefined },
      { ...body, status: undefined },
      { ...body, autosave: true },
      {
        ...body,
        autosave: true,
        status: "published",
        expected_updated_at: version,
      },
    ]) {
      const response = await PATCH(request(payload), params);
      expect(response.status, JSON.stringify(payload)).toBe(400);
    }
    expect(s.rpc).not.toHaveBeenCalled();
  });
});
