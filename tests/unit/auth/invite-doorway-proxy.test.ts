import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  getUserCalls: 0,
  rpcCalls: 0,
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://example.supabase.co",
    key: "anon-key",
    keyType: "anon",
  }),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getUser: async () => {
        state.getUserCalls += 1;
        return { data: { user: null } };
      },
    },
    rpc: async () => {
      state.rpcCalls += 1;
      return { data: [], error: null };
    },
  }),
}));

const { proxy: adminProxy } = await import("../../../apps/admin/proxy");
const { proxy: missionaryProxy } =
  await import("../../../apps/missionary/proxy");

const TENANT = "00000000-0000-4000-8000-0000000000a1";
const SELECTOR = "abcdefghijklmnopqrstuvwxyz012345";

describe.each([
  { name: "admin", proxy: adminProxy },
  { name: "missionary", proxy: missionaryProxy },
])("$name proxy: scanner-safe /invite doorway", ({ proxy }) => {
  beforeEach(() => {
    state.getUserCalls = 0;
    state.rpcCalls = 0;
  });

  it.each(["GET", "HEAD"] as const)(
    "answers %s /invite/<selector> with protected-action headers and zero auth or database calls",
    async (method) => {
      const req = new NextRequest(
        new URL(`/invite/${SELECTOR}`, "http://localhost:3030"),
        { method },
      );
      const res = await proxy(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("location")).toBeNull();
      expect(res.headers.get("cache-control")).toBe(
        "private, no-store, no-transform, max-age=0",
      );
      expect(res.headers.get("cdn-cache-control")).toBe("no-store");
      expect(res.headers.get("vercel-cdn-cache-control")).toBe("no-store");
      expect(res.headers.get("referrer-policy")).toBe("no-referrer");
      expect(state.getUserCalls).toBe(0);
      expect(state.rpcCalls).toBe(0);
    },
  );

  it("redirects tenant-prefixed /<tenant>/invite/<selector> outside the tenant segment", async () => {
    const req = new NextRequest(
      new URL(`/${TENANT}/invite/${SELECTOR}`, "http://localhost:3030"),
    );
    const res = await proxy(req);
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe(
      `/invite/${SELECTOR}`,
    );
  });

  it("enforces same-origin JSON admission on POST /api/invitations/accept", async () => {
    const badOrigin = new NextRequest(
      new URL("/api/invitations/accept", "http://localhost:3030"),
      {
        method: "POST",
        headers: {
          origin: "https://evil.example",
          "content-type": "application/json",
        },
        body: JSON.stringify({ selector: SELECTOR, verifier: "v" }),
      },
    );
    expect((await proxy(badOrigin)).status).toBe(403);

    const okSameOrigin = new NextRequest(
      new URL("/api/invitations/accept", "http://localhost:3030"),
      {
        method: "POST",
        headers: {
          origin: "http://localhost:3030",
          "content-type": "application/json",
        },
        body: JSON.stringify({ selector: SELECTOR, verifier: "v" }),
      },
    );
    expect((await proxy(okSameOrigin)).status).toBe(200);
  });
});
