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

/** Just enough of the service-role client for the create path. */
function fakeClient(options: { profile?: { id: string } | null } = {}) {
  const rpc = vi.fn(async () => ({
    data: { post_id: "post-1" },
    error: null,
  }));
  const created = {
    id: "post-1",
    title: "Clinic opens",
    content: doc("We opened."),
    status: "published",
    visibility: "partners_only",
    post_type: "Milestone",
  };
  const from = vi.fn((table: string) => {
    const chain = {
      select: () => chain,
      eq: () => chain,
      single: async () =>
        table === "profiles"
          ? {
              data:
                options.profile === undefined
                  ? { id: "profile-1" }
                  : options.profile,
              error: null,
            }
          : { data: created, error: null },
    };
    return chain;
  });
  return { client: { rpc, from } as never, rpc, from };
}

const request = new Request("http://localhost/api/posts", {
  method: "POST",
  headers: { "x-forwarded-for": "203.0.113.9", "user-agent": "vitest" },
});

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

describe("createMissionaryPost", () => {
  it("creates the post in one call with every attribute, as the author", async () => {
    const { client, rpc } = fakeClient();
    const result = await createMissionaryPost({
      supabaseAdmin: client,
      auth,
      request,
      input: postWriteSchema.parse({
        title: "Clinic opens",
        content: doc("We opened."),
        post_type: "Milestone",
        visibility: "partners",
        status: "published",
      }),
    });

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("atomic_create_post_with_audit", {
      p_tenant_id: "tenant-1",
      // posts.missionary_id references profiles.id.
      p_missionary_id: "profile-1",
      p_title: "Clinic opens",
      p_content: doc("We opened."),
      p_media: [],
      p_post_type: "Milestone",
      p_visibility: "partners_only",
      p_status: "published",
      p_actor_user_id: "user-1",
      p_ip_address: "203.0.113.9",
      p_user_agent: "vitest",
    });
    expect(result).toEqual({
      ok: true,
      post: expect.objectContaining({ id: "post-1" }),
    });
  });

  it("saves drafts as drafts", async () => {
    const { client, rpc } = fakeClient();
    await createMissionaryPost({
      supabaseAdmin: client,
      auth,
      request,
      input: postWriteSchema.parse({ content: doc("Later"), status: "draft" }),
    });
    expect(rpc).toHaveBeenCalledWith(
      "atomic_create_post_with_audit",
      expect.objectContaining({ p_status: "draft", p_title: null }),
    );
  });

  it("refuses when the signed-in user has no profile in this tenant", async () => {
    const { client, rpc } = fakeClient({ profile: null });
    const result = await createMissionaryPost({
      supabaseAdmin: client,
      auth,
      request,
      input: postWriteSchema.parse({ content: doc("Hi") }),
    });
    expect(result).toEqual({
      ok: false,
      status: 404,
      error: "Profile not found",
    });
    expect(rpc).not.toHaveBeenCalled();
  });
});
