import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock("@asym/database/supabase/server", () => ({
  createClient: createClientMock,
}));

import { DELETE, POST } from "../../packages/api/src/posts/fire";

function makeAuthResult(userId: string | null) {
  return {
    data: {
      user: userId ? { id: userId } : null,
    },
  };
}

describe("posts fire route", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("POST increments fires_count through RPC after insert", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockImplementation((table: string) => {
      if (table === "post_fires") {
        return { insert };
      }
      throw new Error(`Unexpected table ${table}`);
    });
    const rpc = vi.fn().mockResolvedValue({ error: null });

    createClientMock.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue(makeAuthResult("user-1")) },
      from,
      rpc,
    });

    const response = await POST(new Request("http://localhost") as never, {
      params: Promise.resolve({ postId: "post-1" }),
    });

    expect(response.status).toBe(200);
    expect(insert).toHaveBeenCalledWith({ post_id: "post-1", user_id: "user-1" });
    expect(rpc).toHaveBeenCalledWith("increment_post_fire_count", {
      post_id: "post-1",
    });
  });

  it("DELETE does not decrement count when no fire row was deleted", async () => {
    const select = vi.fn().mockResolvedValue({ data: [], error: null });
    const secondEq = vi.fn().mockReturnValue({ select });
    const firstEq = vi.fn().mockReturnValue({ eq: secondEq });
    const del = vi.fn().mockReturnValue({ eq: firstEq });

    const from = vi.fn().mockImplementation((table: string) => {
      if (table === "post_fires") {
        return { delete: del };
      }
      throw new Error(`Unexpected table ${table}`);
    });
    const rpc = vi.fn();

    createClientMock.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue(makeAuthResult("user-2")) },
      from,
      rpc,
    });

    const response = await DELETE(new Request("http://localhost") as never, {
      params: Promise.resolve({ postId: "post-2" }),
    });

    expect(response.status).toBe(200);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("DELETE decrements fires_count through RPC when a fire row exists", async () => {
    const select = vi.fn().mockResolvedValue({
      data: [{ id: "fire-1" }],
      error: null,
    });
    const secondEq = vi.fn().mockReturnValue({ select });
    const firstEq = vi.fn().mockReturnValue({ eq: secondEq });
    const del = vi.fn().mockReturnValue({ eq: firstEq });

    const from = vi.fn().mockImplementation((table: string) => {
      if (table === "post_fires") {
        return { delete: del };
      }
      throw new Error(`Unexpected table ${table}`);
    });
    const rpc = vi.fn().mockResolvedValue({ error: null });

    createClientMock.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue(makeAuthResult("user-3")) },
      from,
      rpc,
    });

    const response = await DELETE(new Request("http://localhost") as never, {
      params: Promise.resolve({ postId: "post-3" }),
    });

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("decrement_post_fire_count", {
      post_id: "post-3",
    });
  });
});
