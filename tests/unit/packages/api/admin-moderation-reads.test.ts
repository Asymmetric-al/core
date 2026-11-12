import type { NextRequest } from "next/server";
import { beforeEach, expect, it, vi } from "vitest";
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
}));
import { GET as posts } from "../../../../packages/api/src/admin/posts/index";
import { GET as comments } from "../../../../packages/api/src/admin/comments/index";
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
  mocks.admin.mockReturnValue({ client: { from } });
  const response = await comments(
    new Request("https://core.test/api/admin/comments?limit=20") as NextRequest,
  );
  expect(response.status).toBe(200);
  expect(profiles.eq).toHaveBeenCalledWith("tenant_id", "tenant-a");
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
  mocks.admin.mockReturnValue({
    client: {
      from: (table: string) => (table === "profiles" ? profiles : rows),
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
