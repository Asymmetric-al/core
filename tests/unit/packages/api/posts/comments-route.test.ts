import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * AL-2675, JB11: the comments route reads its comments without embedding
 * `profiles` (no foreign key joins them, so PostgREST refused the whole read
 * with PGRST200) and names the commenters through
 * `public.post_comment_authors`. A commenter with no name to show comes back
 * with empty names and no avatar, in the shape the comment screens read.
 */

const state = vi.hoisted(() => ({
  selected: [] as string[],
  comments: [] as Record<string, unknown>[],
  authors: [] as Record<string, unknown>[] | null,
  authorsError: null as unknown,
  rpcCalls: [] as unknown[][],
  eqs: [] as unknown[][],
  postFound: true,
  postError: null as unknown,
}));

vi.mock("@asym/auth/context", () => ({
  getAuthContext: async () => ({
    userId: "user-viewer",
    tenantId: "tenant-1",
    isAuthenticated: true,
  }),
  requestScopeOf: () => ({
    tenantId: "tenant-1",
    assignmentId: "assignment-1",
  }),
}));
vi.mock("@asym/database/supabase/server", () => ({
  createClient: async () => ({
    from: (table: string) => ({
      select: (columns: string) => {
        state.selected.push(`${table}: ${columns}`);
        const chain = {
          eq: (column: string, value: unknown) => {
            state.eqs.push([table, column, value]);
            return chain;
          },
          maybeSingle: async () =>
            state.postError
              ? { data: null, error: state.postError }
              : { data: state.postFound ? { id: "found" } : null, error: null },
          order: async () => ({ data: state.comments, error: null }),
        };
        return chain;
      },
    }),
    rpc: async (...args: unknown[]) => {
      state.rpcCalls.push(args);
      return { data: state.authors, error: state.authorsError };
    },
  }),
}));

import { GET } from "../../../../../packages/api/src/posts/comments";

const POST = "50000000-0000-0000-0000-000000000001";

async function get() {
  const response = await GET(
    new Request(`http://localhost/api/posts/${POST}/comments`) as never,
    { params: Promise.resolve({ postId: POST }) },
  );
  return { status: response.status, body: await response.json() };
}

beforeEach(() => {
  state.selected = [];
  state.rpcCalls = [];
  state.authorsError = null;
  state.eqs = [];
  state.postFound = true;
  state.postError = null;
  state.comments = [
    {
      id: "c1",
      post_id: POST,
      user_id: "user-a",
      parent_id: null,
      content: "first",
      created_at: "2026-11-19T00:00:00Z",
      updated_at: null,
    },
    {
      id: "c2",
      post_id: POST,
      user_id: "user-b",
      parent_id: null,
      content: "second",
      created_at: "2026-11-19T00:01:00Z",
      updated_at: null,
    },
    {
      id: "c3",
      post_id: POST,
      user_id: "user-c",
      parent_id: null,
      content: "third",
      created_at: "2026-11-19T00:02:00Z",
      updated_at: null,
    },
  ];
  state.authors = [
    {
      user_id: "user-a",
      display_name: "Blair Admin",
      avatar_url: "https://example.org/a.png",
    },
    { user_id: "user-b", display_name: null, avatar_url: null },
  ];
});

describe("GET /api/posts/[postId]/comments", () => {
  it("reads the post on the caller's token in the request's organization, then the comments without embedding profiles, and the commenters through post_comment_authors", async () => {
    const { status } = await get();
    expect(status).toBe(200);
    expect(state.selected).toHaveLength(2);
    expect(state.selected[0]).toMatch(/^posts: /);
    expect(state.eqs.filter(([table]) => table === "posts")).toEqual([
      ["posts", "id", POST],
      ["posts", "tenant_id", "tenant-1"],
    ]);
    expect(state.selected[1]).toMatch(/^post_comments: /);
    expect(state.selected[1]).not.toMatch(/profiles/);
    expect(state.rpcCalls).toEqual([
      ["post_comment_authors", { p_post_id: POST }],
    ]);
  });

  it("answers the missing post (404), reading no comments and naming no one, when the caller cannot read the post on their own token (AL-2680, round 3, R1)", async () => {
    state.postFound = false;
    const { status, body } = await get();
    expect(status).toBe(404);
    expect(body).toEqual({ error: "Post not found" });
    expect(state.selected.filter((s) => s.startsWith("post_comments"))).toEqual(
      [],
    );
    expect(state.rpcCalls).toEqual([]);
  });

  it("answers the missing post for an id that names no post, reading nothing (AL-2680, round 3, R1)", async () => {
    const response = await GET(
      new Request("http://localhost/api/posts/not-a-post/comments") as never,
      { params: Promise.resolve({ postId: "not-a-post" }) },
    );
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Post not found" });
    expect(state.selected).toEqual([]);
  });

  it("fails as a server error with a fixed sentence, not as a missing post or an empty list, when the post cannot be read (AL-2680, round 3, R1)", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    state.postError = {
      code: "XX000",
      message: "relation detail from the database",
    };
    const { status, body } = await get();
    expect(status).toBe(500);
    expect(body).toEqual({ error: "Couldn’t read that update’s comments." });
    expect(state.rpcCalls).toEqual([]);
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });

  it("gives each comment its commenter in the screens' shape, with empty names and no avatar when there is no name to show", async () => {
    const { body } = await get();
    expect(
      body.comments.map((c: { id: string; user: unknown }) => [c.id, c.user]),
    ).toEqual([
      [
        "c1",
        {
          id: "user-a",
          first_name: "Blair Admin",
          last_name: "",
          avatar_url: "https://example.org/a.png",
        },
      ],
      ["c2", { id: "user-b", first_name: "", last_name: "", avatar_url: null }],
      // No row for this commenter at all.
      ["c3", { id: "user-c", first_name: "", last_name: "", avatar_url: null }],
    ]);
    expect(body.comments.map((c: { content: string }) => c.content)).toEqual([
      "first",
      "second",
      "third",
    ]);
  });

  it("fails as a server error when the commenters cannot be read, rather than naming no one silently", async () => {
    state.authors = null;
    state.authorsError = { message: "boom" };
    const { status, body } = await get();
    expect(status).toBe(500);
    expect(body.error).toMatch(/post_comment_authors/);
  });

  it("AL-2678 r2a (F5): answers the commenters with Cache-Control: private, no-store, so no proxy or browser keeps a name a restriction has since withdrawn", async () => {
    const response = await GET(
      new Request(`http://localhost/api/posts/${POST}/comments`) as never,
      { params: Promise.resolve({ postId: POST }) },
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
});
