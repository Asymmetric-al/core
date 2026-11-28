import { beforeEach, describe, expect, it, vi } from "vitest";

import { createGraphQLHandler } from "../../packages/graphql/handler";
import { membershipsForRole } from "../fixtures/auth-memberships";

import type * as SessionModule from "../../packages/api/src/shared/request-session-client";
import type * as AuthModule from "../../packages/auth/context";
import type { AuthContext } from "../../packages/auth/context";

const s = vi.hoisted(() => ({
  auth: null as unknown,
  profile: null as Record<string, unknown> | null,
  selects: [] as Array<[string, string]>,
  rpc: [] as string[],
  writes: [] as string[],
}));

vi.mock("@asym/auth/context", async (orig) => ({
  ...(await orig<typeof AuthModule>()),
  getAuthContext: async () => s.auth,
}));
vi.mock("@asym/database/supabase/admin", () => {
  const COMMENT = {
    id: "comment-1",
    post_id: "post-1",
    user_id: "user-d",
    parent_id: null,
    content: "Amen",
    created_at: "2026-11-25T00:00:00.000Z",
    updated_at: "2026-11-25T00:00:00.000Z",
  };
  const client = {
    rpc: async (fn: string) => {
      s.rpc.push(fn);
      return { data: { comment_id: COMMENT.id }, error: null };
    },
    from(table: string) {
      const builder = {
        select(columns: string) {
          s.selects.push([table, columns]);
          return builder;
        },
        eq: () => builder,
        delete() {
          s.writes.push(`delete ${table}`);
          return builder;
        },
        update() {
          s.writes.push(`update ${table}`);
          return builder;
        },
        single: async () => {
          if (table === "post_comments") return { data: COMMENT, error: null };
          if (table === "profiles")
            return s.profile
              ? { data: s.profile, error: null }
              : {
                  data: null,
                  error: { code: "PGRST116", message: "no rows" },
                };
          return { data: null, error: null };
        },
        maybeSingle: async () => builder.single(),
      };
      return builder;
    },
  };
  return { getAdminClient: () => ({ client, error: null }) };
});
vi.mock(
  "../../packages/api/src/shared/request-session-client",
  async (original) => ({
    ...(await original<typeof SessionModule>()),
    createRequestSessionClient: async () => {
      const read = {
        select: () => read,
        eq: () => read,
        maybeSingle: async () => ({ data: { id: "post-1" }, error: null }),
      };
      return { from: () => read };
    },
  }),
);
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

const donor: AuthContext = {
  userId: "user-d",
  email: null,
  tenantId: "tenant-a",
  role: "donor",
  memberships: membershipsForRole("donor", "tenant-a"),
  profileId: "user-d",
  isAuthenticated: true,
};

async function addComment() {
  const response = await createGraphQLHandler().POST(
    new Request("http://localhost/api/graphql", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query:
          'mutation { addComment(postId: "post-1", content: "Amen") { id postId content author { id tenantId role firstName } } }',
      }),
    }),
  );
  return (await response.json()) as {
    data?: { addComment: unknown } | null;
    errors?: Array<{ message: string }>;
  };
}

beforeEach(() => {
  s.auth = donor;
  s.profile = null;
  s.selects = [];
  s.rpc = [];
  s.writes = [];
});

describe("AL-2678 r2a: GraphQL addComment's author is the caller's own profile, read as myProfile reads it (AL-2680 fix round S8: on a post the caller's own token reads first)", () => {
  it("a caller with no profile row gets Comment author not found, and the comment stays written (N4)", async () => {
    const body = await addComment();
    expect(body.errors?.map((e) => e.message)).toEqual([
      "Comment author not found",
    ]);
    expect(s.rpc).toEqual(["atomic_add_post_comment"]);
    expect(s.writes).toEqual([]);
  });

  it("with a profile, the author is the caller's profile, its organization and role the request's, never the profile's own columns, and the comment is read without any embed", async () => {
    s.profile = {
      id: "user-d",
      user_id: "user-d",
      tenant_id: "tenant-other",
      role: "admin",
      first_name: "Donor",
      last_name: "Dee",
      email: "dee@example.test",
      avatar_url: null,
      created_at: "2026-11-25T00:00:00.000Z",
      updated_at: "2026-11-25T00:00:00.000Z",
    };
    const body = await addComment();
    expect(body.errors, JSON.stringify(body.errors)).toBeUndefined();
    expect(body.data!.addComment).toEqual({
      id: "comment-1",
      postId: "post-1",
      content: "Amen",
      author: {
        id: "user-d",
        tenantId: "tenant-a",
        role: "donor",
        firstName: "Donor",
      },
    });
    const commentSelect = s.selects.find(([t]) => t === "post_comments");
    expect(commentSelect?.[1]).not.toMatch(/\(|profiles/);
  });
});
