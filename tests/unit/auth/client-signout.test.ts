import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_FETCH = global.fetch;

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
});

describe("signOutOnServer", () => {
  it("returns ok true on successful server signout", async () => {
    global.fetch = vi.fn(async () => new Response("", { status: 200 }));
    const { signOutOnServer } =
      await import("../../../packages/auth/client-signout");

    const result = await signOutOnServer();
    expect(result).toEqual({ ok: true });
  });

  it("returns failure with message on non-200 response", async () => {
    global.fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ error: "Invalid sign-out request origin." }),
          {
            status: 403,
            headers: { "content-type": "application/json" },
          },
        ),
    );
    const { signOutOnServer } =
      await import("../../../packages/auth/client-signout");

    const result = await signOutOnServer();
    expect(result.ok).toBe(false);
    expect(result.message).toBe("Invalid sign-out request origin.");
  });

  it("returns fallback failure when request throws", async () => {
    global.fetch = vi.fn(async () => {
      throw new Error("network down");
    });
    const { signOutOnServer } =
      await import("../../../packages/auth/client-signout");

    const result = await signOutOnServer();
    expect(result.ok).toBe(false);
    expect(result.message).toBe("Unable to sign out. Please try again.");
  });
});
