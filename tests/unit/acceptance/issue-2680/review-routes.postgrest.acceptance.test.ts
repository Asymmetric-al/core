import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { POST as review } from "../../../../packages/api/src/admin/posts/review";
import {
  GET as feed,
  POST as submit,
} from "../../../../packages/api/src/posts/index";
import { PATCH as edit } from "../../../../packages/api/src/posts/post";
import { POST as withdrawOwn } from "../../../../packages/api/src/posts/withdraw";
import { membershipsForRole } from "../../../fixtures/auth-memberships";
import {
  anon,
  database,
  identityKeysFixture,
  required,
  service,
  url,
} from "../issue-2678/identity-keys.postgrest-fixture";

import type * as AuthModule from "../../../../packages/auth/context";
import type { AuthContext } from "../../../../packages/auth/context";

const s = vi.hoisted(() => ({ auth: null as unknown }));
vi.mock("@asym/auth/context", async (orig) => ({
  ...(await orig<typeof AuthModule>()),
  getAuthContext: async () => s.auth,
}));
vi.mock("@asym/database/supabase/admin", () => {
  let client: ReturnType<typeof createClient> | undefined;
  return {
    getAdminClient: () => {
      client ??= createClient(
        process.env.WP5_IDENTITY_IT_URL ?? "http://127.0.0.1:1",
        process.env.WP5_IDENTITY_IT_SERVICE_KEY ?? "no-key",
        { auth: { persistSession: false, autoRefreshToken: false } },
      );
      return { client, error: null };
    },
  };
});
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

const doc = (text: string) =>
  JSON.stringify({
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  });

describe.skipIf(!required && ![url, database, anon, service].some(Boolean))(
  "AL-2680 WP7 pull request 1: an update under review through the routes, on real tokens",
  () => {
    const fx = identityKeysFixture();
    const { TA, TB, ids, user, token } = fx;
    const publicEnv = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };

    const member = (
      who: string,
      assignmentId: string,
      role: "donor" | "missionary",
    ): AuthContext =>
      ({
        userId: who,
        email: null,
        tenantId: TA,
        role,
        memberships: membershipsForRole(role, TA),
        profileId: who,
        isAuthenticated: true,
        assignment: {
          userId: who,
          tenantId: TA,
          membershipRole: role,
          assignmentId,
        },
      }) as AuthContext;
    const reviewer = (): AuthContext =>
      ({
        userId: user.admin,
        email: null,
        tenantId: TA,
        role: "admin",
        memberships: [
          {
            tenantId: TA,
            role: "staff",
            staffRole: "development",
            isActive: true,
            isTenantAdmin: true,
          },
        ],
        profileId: user.admin,
        isAuthenticated: true,
        assignment: {
          userId: user.admin,
          tenantId: TA,
          membershipRole: "staff",
          staffRole: "development",
          isTenantAdmin: true,
          revision: "1",
          assignmentId: ids.mAdmin,
        },
        assignmentDenial: null,
      }) as AuthContext;

    const call = (who: keyof typeof token, path: string, init?: RequestInit) =>
      new NextRequest(`http://localhost${path}`, {
        ...init,
        headers: {
          authorization: `Bearer ${token[who]}`,
          "content-type": "application/json",
          ...(init?.headers ?? {}),
        },
      });
    const feedIds = async (
      who: "donor" | "giver",
      assignment: string,
    ): Promise<string[]> => {
      s.auth = member(user[who], assignment, "donor");
      const response = await feed(call(who, "/api/posts?limit=100"));
      const json = (await response.json()) as { posts?: { id: string }[] };
      expect(response.status, JSON.stringify(json)).toBe(200);
      return (json.posts ?? []).map((post) => post.id);
    };
    const follow = (status: "approved" | "pending" | null) =>
      status === null
        ? fx.db!.query(
            "delete from public.follows where tenant_id = $1 and donor_id = $2",
            [TA, ids.dDonor],
          )
        : fx.db!.query(
            `insert into public.follows (tenant_id, donor_id, missionary_id, ministry_assignment_id, status)
             values ($1, $2, $3, $4, $5)
             on conflict (donor_id, missionary_id) do update set status = excluded.status, ministry_assignment_id = excluded.ministry_assignment_id`,
            [TA, ids.dDonor, user.missionary, ids.mi, status],
          );

    const versionOf = async (post: string) =>
      (
        await fx.db!.query(
          "select content_version from public.posts where id = $1",
          [post],
        )
      ).rows[0]?.content_version as number;
    const seenBy = async (
      who: keyof typeof token | null,
      auth: AuthContext | { isAuthenticated: false },
      post: string,
    ) => {
      s.auth = auth;
      const response = await feed(
        who
          ? call(who, "/api/posts?limit=100")
          : new NextRequest("http://localhost/api/posts?limit=100"),
      );
      if (response.status !== 200) return response.status;
      const json = (await response.json()) as { posts?: { id: string }[] };
      return (json.posts ?? []).some((p) => p.id === post);
    };
    const revoke = (live: boolean) =>
      fx.db!.query(
        live
          ? "update authz.memberships set is_active = true, revoked_at = null where id = $1"
          : "update authz.memberships set is_active = false, revoked_at = now() where id = $1",
        [ids.mMissionary],
      );

    beforeAll(() => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = url;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = anon;
    });
    afterAll(() => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = publicEnv.url;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = publicEnv.key;
    });

    it("a missionary's partners-only update waits for review, reaches only a following donor once another person approves it, leaves when the follow goes, and leaves every feed when its author withdraws it", async () => {
      await follow("approved");
      s.auth = member(user.missionary, ids.mMissionary!, "missionary");
      const created = await submit(
        call("missionary", "/api/posts", {
          method: "POST",
          body: JSON.stringify({
            title: "For our partners",
            content: doc("A letter for partners"),
            visibility: "partners",
            status: "published",
          }),
        }),
      );
      const createdBody = (await created.json()) as {
        post?: { id: string; review_state: string; author_user_id: string };
      };
      expect(created.status, JSON.stringify(createdBody)).toBe(201);
      const post = createdBody.post!;
      expect(post).toMatchObject({
        review_state: "submitted",
        author_user_id: user.missionary,
      });

      expect(await feedIds("donor", ids.mDonor!)).not.toContain(post.id);

      s.auth = reviewer();
      const approved = await review(
        call("admin", `/api/admin/posts/${post.id}/review`, {
          method: "POST",
          body: JSON.stringify({
            decision: "approve",
            version: await versionOf(post.id),
          }),
        }),
        { params: Promise.resolve({ postId: post.id }) },
      );
      expect(approved.status, JSON.stringify(await approved.json())).toBe(200);

      expect(await feedIds("donor", ids.mDonor!)).toContain(post.id);
      expect(await feedIds("giver", ids.mGiver!)).not.toContain(post.id);

      await follow(null);
      expect(await feedIds("donor", ids.mDonor!)).not.toContain(post.id);
      await follow("approved");
      expect(await feedIds("donor", ids.mDonor!)).toContain(post.id);

      s.auth = member(user.missionary, ids.mMissionary!, "missionary");
      const withdrawn = await withdrawOwn(
        call("missionary", `/api/posts/${post.id}/withdraw`, {
          method: "POST",
        }),
        { params: Promise.resolve({ postId: post.id }) },
      );
      expect(withdrawn.status, JSON.stringify(await withdrawn.json())).toBe(
        200,
      );
      expect(await feedIds("donor", ids.mDonor!)).not.toContain(post.id);
      await follow(null);
    });

    it("a donor is refused by the review route (403), and the update stays waiting and out of every feed", async () => {
      s.auth = member(user.missionary, ids.mMissionary!, "missionary");
      const created = await submit(
        call("missionary", "/api/posts", {
          method: "POST",
          body: JSON.stringify({
            content: doc("Waiting"),
            visibility: "public",
            status: "published",
          }),
        }),
      );
      const { post } = (await created.json()) as { post: { id: string } };
      s.auth = member(user.donor, ids.mDonor!, "donor");
      const refused = await review(
        call("donor", `/api/admin/posts/${post.id}/review`, {
          method: "POST",
          body: JSON.stringify({
            decision: "approve",
            version: await versionOf(post.id),
          }),
        }),
        { params: Promise.resolve({ postId: post.id }) },
      );
      expect(refused.status).toBe(403);
      const state = await fx.db!.query(
        "select review_state from public.posts where id = $1",
        [post.id],
      );
      expect(state.rows).toEqual([{ review_state: "submitted" }]);
      expect(await feedIds("giver", ids.mGiver!)).not.toContain(post.id);
    });

    it("T5 partners.11: the feed route answers 401 to anon and leaves an approved partners-only update out for a pending follow, staff of another organization and its author once their assignment is revoked", async () => {
      await follow("approved");
      s.auth = member(user.missionary, ids.mMissionary!, "missionary");
      const created = await submit(
        call("missionary", "/api/posts", {
          method: "POST",
          body: JSON.stringify({
            content: doc("Partners only"),
            visibility: "partners",
            status: "published",
          }),
        }),
      );
      const { post } = (await created.json()) as { post: { id: string } };
      s.auth = reviewer();
      const approved = await review(
        call("admin", `/api/admin/posts/${post.id}/review`, {
          method: "POST",
          body: JSON.stringify({
            decision: "approve",
            version: await versionOf(post.id),
          }),
        }),
        { params: Promise.resolve({ postId: post.id }) },
      );
      expect(approved.status).toBe(200);
      const donor = member(user.donor, ids.mDonor!, "donor");
      expect(await seenBy("donor", donor, post.id)).toBe(true);

      expect(await seenBy(null, { isAuthenticated: false }, post.id)).toBe(401);
      await follow("pending");
      expect(await seenBy("donor", donor, post.id)).toBe(false);
      await follow("approved");
      const staffB = {
        userId: user.staffB,
        email: null,
        tenantId: TB,
        role: "staff",
        memberships: membershipsForRole("staff", TB),
        profileId: user.staffB,
        isAuthenticated: true,
        assignment: {
          userId: user.staffB,
          tenantId: TB,
          membershipRole: "staff",
          staffRole: "development",
          isTenantAdmin: false,
          revision: "1",
          assignmentId: ids.mStaffB,
        },
        assignmentDenial: null,
      } as AuthContext;
      expect(await seenBy("staffB", staffB, post.id)).toBe(false);
      const author = member(user.missionary, ids.mMissionary!, "missionary");
      expect(await seenBy("missionary", author, post.id)).toBe(true);
      await revoke(false);
      try {
        expect(await seenBy("missionary", author, post.id)).not.toBe(true);
      } finally {
        await revoke(true);
      }
      await follow(null);
    });

    it("C1: an edit goes through the lane on the missionary's own token: refused while their assignment is revoked, writing nothing, and once it is live again it lands with an audit row naming the assignment", async () => {
      s.auth = member(user.missionary, ids.mMissionary!, "missionary");
      const created = await submit(
        call("missionary", "/api/posts", {
          method: "POST",
          body: JSON.stringify({
            title: "Before",
            content: doc("Before"),
            visibility: "public",
            status: "published",
          }),
        }),
      );
      expect(created.status).toBe(201);
      const { post } = (await created.json()) as { post: { id: string } };
      const change = () =>
        edit(
          call("missionary", `/api/posts/${post.id}`, {
            method: "PATCH",
            body: JSON.stringify({
              title: "After",
              content: doc("After"),
              visibility: "public",
              status: "published",
              post_type: "Update",
              media: [],
            }),
          }),
          { params: Promise.resolve({ postId: post.id }) },
        );
      await revoke(false);
      try {
        expect((await change()).status).toBe(404);
      } finally {
        await revoke(true);
      }
      const before = await fx.db!.query(
        "select title from public.posts where id = $1",
        [post.id],
      );
      expect(before.rows).toEqual([{ title: "Before" }]);
      const done = await change();
      expect(done.status, JSON.stringify(await done.clone().json())).toBe(200);
      const audits = await fx.db!.query(
        "select details->>'assignment_id' as assignment from public.audit_logs where tenant_id = $1 and resource_id = $2 and action = 'ministry_update.submit'",
        [TA, post.id],
      );
      expect(audits.rows).toEqual([
        { assignment: ids.mMissionary },
        { assignment: ids.mMissionary },
      ]);
    });
  },
);
