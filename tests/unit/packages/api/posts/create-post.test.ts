import { describe, expect, it, vi } from "vitest";

import { createMissionaryPost } from "../../../../../packages/api/src/posts/create";
import { postWriteSchema } from "../../../../../packages/api/src/schemas/posts";

const doc = (text: string) =>
  JSON.stringify({
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  });

const auth = {
  isAuthenticated: true,
  userId: "user-1",
  profileId: "profile-1",
  tenantId: "tenant-1",
  role: "missionary",
} as never;

function sessionClient(
  refusal: { code: string; message: string } | null = null,
) {
  const rpc = vi.fn(async () =>
    refusal ? { data: null, error: refusal } : { data: "post-1", error: null },
  );
  const reads: Array<[string, ...unknown[]]> = [];
  const created = {
    id: "post-1",
    title: "Clinic opens",
    content: doc("We opened."),
    status: "published",
    visibility: "partners_only",
    post_type: "Milestone",
    review_state: "submitted",
  };
  const from = vi.fn((table: string) => {
    reads.push(["from", table]);
    const chain = {
      select: (columns: string) => {
        reads.push(["select", columns]);
        return chain;
      },
      eq: (column: string, value: unknown) => {
        reads.push(["eq", column, value]);
        return chain;
      },
      single: async () => ({ data: created, error: null }),
    };
    return chain;
  });
  return { client: { rpc, from } as never, rpc, reads };
}

describe("postWriteSchema", () => {
  it("fills the defaults a new update needs", () => {
    expect(postWriteSchema.parse({ content: doc("Hi") })).toEqual({
      content: doc("Hi"),
      post_type: "Update",
      visibility: "public",
      status: "published",
      media: [],
    });
  });

  it("stores the composer's partners choice as partners_only", () => {
    expect(
      postWriteSchema.parse({ content: doc("Hi"), visibility: "partners" })
        .visibility,
    ).toBe("partners_only");
  });

  it("rejects visibility, types and states the feeds can't show", () => {
    for (const bad of [
      { visibility: "private" },
      { post_type: "Newsletter" },
      { status: "archived" },
    ]) {
      expect(() =>
        postWriteSchema.parse({ content: doc("Hi"), ...bad }),
      ).toThrow();
    }
  });

  it("trims the title and drops an empty one", () => {
    expect(
      postWriteSchema.parse({ content: doc("Hi"), title: "  Clinic opens " })
        .title,
    ).toBe("Clinic opens");
    expect(
      postWriteSchema.parse({ content: doc("Hi"), title: "   " }).title,
    ).toBeUndefined();
  });

  it("refuses an update with no words or images", () => {
    expect(() => postWriteSchema.parse({ content: doc("   ") })).toThrow();
    expect(() => postWriteSchema.parse({ content: "" })).toThrow();
  });

  it("only accepts image or video media with real URLs", () => {
    expect(() =>
      postWriteSchema.parse({
        content: doc("Hi"),
        media: [{ url: "javascript:alert(1)", type: "image" }],
      }),
    ).toThrow();
  });
});

describe("createMissionaryPost: the missionary submits through the own-ministry lane on their own token (AL-2680, WP7 pull request 1, invariant 1)", () => {
  it("submits every attribute in one call to submit_ministry_update and reads the update back on the same token", async () => {
    const { client, rpc, reads } = sessionClient();
    const result = await createMissionaryPost({
      supabase: client,
      auth,
      input: postWriteSchema.parse({
        title: "Clinic opens",
        content: doc("We opened."),
        post_type: "Milestone",
        visibility: "partners",
        status: "published",
      }),
    });

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("submit_ministry_update", {
      p_tenant_id: "tenant-1",
      p_post_id: null,
      p_title: "Clinic opens",
      p_content: doc("We opened."),
      p_media: [],
      p_visibility: "partners_only",
      p_post_type: "Milestone",
      p_publish: true,
    });
    expect(reads).toEqual([
      ["from", "posts"],
      ["select", "*"],
      ["eq", "id", "post-1"],
    ]);
    expect(result).toEqual({
      ok: true,
      post: expect.objectContaining({
        id: "post-1",
        review_state: "submitted",
      }),
    });
  });

  it("saves drafts unpublished", async () => {
    const { client, rpc } = sessionClient();
    await createMissionaryPost({
      supabase: client,
      auth,
      input: postWriteSchema.parse({ content: doc("Later"), status: "draft" }),
    });
    expect(rpc).toHaveBeenCalledWith(
      "submit_ministry_update",
      expect.objectContaining({ p_publish: false, p_title: null }),
    );
  });

  it("answers 403 when the lane refuses the caller (42501) and 400 with the command's words when it refuses the update (22023)", async () => {
    const input = postWriteSchema.parse({ content: doc("Hi") });
    const refused = sessionClient({
      code: "42501",
      message:
        "tenant_guard: the caller does not hold the authority this command requires",
    });
    expect(
      await createMissionaryPost({ supabase: refused.client, auth, input }),
    ).toEqual({ ok: false, status: 403, error: "Forbidden" });
    const invalid = sessionClient({
      code: "22023",
      message: "Unknown visibility",
    });
    expect(
      await createMissionaryPost({ supabase: invalid.client, auth, input }),
    ).toEqual({ ok: false, status: 400, error: "Unknown visibility" });
  });
});
