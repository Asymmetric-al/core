import type { NextRequest } from "next/server";
import { beforeEach, expect, it, vi } from "vitest";

import { memberRow } from "../../../fixtures/fake-service-client";
const mocks = vi.hoisted(() => ({
  admin: vi.fn(),
  auth: vi.fn(),
  role: vi.fn(),
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: mocks.admin,
}));
vi.mock("@asym/auth/context", () => ({
  getAuthContext: mocks.auth,
  requireRole: mocks.role,
  // AL-2675: the gates that replaced requireRole, stubbed alike.
  requireCapability: mocks.role,
  requireTenantAdministrator: mocks.role,
  requireRoleClass: mocks.role,
  requireAuth: () => undefined,
}));
import { GET as posts } from "../../../../packages/api/src/admin/posts/index";
import { GET as comments } from "../../../../packages/api/src/admin/comments/index";
import { TENANT_MEMBER_PAGE_SIZE } from "../../../../packages/api/src/shared/tenant-members";
function query(result: object) {
  const q = {
    select: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
    then: Promise.resolve(result).then.bind(Promise.resolve(result)),
  };
  for (const fn of [q.select, q.eq, q.in, q.order, q.range])
    fn.mockReturnValue(q);
  return q;
}
beforeEach(() => {
  mocks.auth.mockResolvedValue({ tenantId: "tenant-a", role: "admin" });
});
/**
 * AL-2675 (WP2a sweep; NR-68): a comment's author is found through their
 * login's membership in the tenant (`tenant_member_profiles`); profiles are
 * then read by id alone, never filtered on the profile's tenant column.
 */
const membersOf = (...people: string[]) =>
  vi.fn(async () => ({
    data: people.map((p) => memberRow({ profileId: p, userId: p })),
    error: null,
  }));
it("looks up comment authors by profile id within the authenticated tenant", async () => {
  const rows = query({
    data: [
      {
        id: "comment",
        user_id: "person",
        content: "Hello",
        post: { tenant_id: "tenant-a" },
      },
    ],
    error: null,
    count: 1,
  });
  const profiles = query({
    data: [
      { id: "person", first_name: "Ada", last_name: "Lee", avatar_url: null },
    ],
    error: null,
  });
  const from = vi.fn((table: string) =>
    table === "profiles" ? profiles : rows,
  );
  const rpc = membersOf("person");
  mocks.admin.mockReturnValue({ client: { from, rpc } });
  const response = await comments(
    new Request("https://core.test/api/admin/comments?limit=20") as NextRequest,
  );
  expect(response.status).toBe(200);
  expect(rpc).toHaveBeenCalledWith("tenant_member_profiles", {
    p_tenant_id: "tenant-a",
    p_profile_ids: null,
    p_user_ids: ["person"],
    p_include_revoked: true,
    p_role: null,
    p_tenant_admin: null,
    p_after_membership_id: null,
    p_limit: TENANT_MEMBER_PAGE_SIZE,
  });
  expect(profiles.eq).not.toHaveBeenCalled();
  expect(profiles.in).toHaveBeenCalledWith("id", ["person"]);
  expect(rows.eq).toHaveBeenCalledWith("post.tenant_id", "tenant-a");
  expect(rows.select.mock.calls[0][0]).not.toContain("profiles!user_id");
  expect((await response.json()).comments[0].author).toMatchObject({
    first_name: "Ada",
    last_name: "Lee",
    full_name: "Ada Lee",
    avatar_url: null,
  });
});
it("reports author lookup errors explicitly", async () => {
  const rows = query({
    data: [{ id: "comment", user_id: "person" }],
    error: null,
  });
  const profiles = query({
    data: null,
    error: { message: "Profile lookup failed" },
  });
  mocks.admin.mockReturnValue({
    client: {
      from: (table: string) => (table === "profiles" ? profiles : rows),
      rpc: membersOf("person"),
    },
  });
  const response = await comments(
    new Request("https://core.test/api/admin/comments") as NextRequest,
  );
  expect(response.status).toBe(500);
  expect((await response.json()).error).toBe("Profile lookup failed");
});
it("keeps a missing tenant author anonymous", async () => {
  const rows = query({
    data: [{ id: "comment", user_id: "outside" }],
    error: null,
  });
  const profiles = query({ data: [], error: null });
  // No membership in this tenant: the author stays anonymous and no profile
  // is read at all.
  mocks.admin.mockReturnValue({
    client: {
      from: (table: string) => (table === "profiles" ? profiles : rows),
      rpc: membersOf(),
    },
  });
  const response = await comments(
    new Request("https://core.test/api/admin/comments") as NextRequest,
  );
  expect((await response.json()).comments[0].author).toBeNull();
});
it("supports a multi-status review queue and returns its exact filtered count", async () => {
  const q = query({ data: [{ id: "old-flagged" }], error: null, count: 7 });
  mocks.admin.mockReturnValue({ client: { from: () => q } });
  const response = await posts(
    new Request(
      "https://core.test/api/admin/posts?status=flagged,hidden,pending_review&limit=100",
    ) as NextRequest,
  );
  expect(response.status).toBe(200);
  expect(q.in).toHaveBeenCalledWith("status", [
    "flagged",
    "hidden",
    "pending_review",
  ]);
  expect(q.eq).toHaveBeenCalledWith("tenant_id", "tenant-a");
  expect((await response.json()).total).toBe(7);
});
it("fails the read when a count fails rather than claiming zero", async () => {
  const rows = query({ data: [], error: null, count: 0 });
  const failed = query({
    count: null,
    error: { message: "Count unavailable" },
  });
  const from = vi.fn().mockReturnValueOnce(rows).mockReturnValue(failed);
  mocks.admin.mockReturnValue({ client: { from } });
  const response = await posts(
    new Request("https://core.test/api/admin/posts") as NextRequest,
  );
  expect(response.status).toBe(500);
  expect((await response.json()).error).toBe("Count unavailable");
});
