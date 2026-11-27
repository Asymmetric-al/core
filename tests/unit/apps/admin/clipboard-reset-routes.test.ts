import { afterEach, describe, expect, it, vi } from "vitest";

const shared = vi.hoisted(() => ({
  requests: [] as Request[],
}));

async function sharedAnswer(request: Request, location: string) {
  const { NextResponse } = await import("next/server");
  shared.requests.push(request);
  return new NextResponse(null, {
    status: 307,
    headers: { Location: location },
  });
}

vi.mock("@asym/api/auth/callback", () => ({
  GET: (request: Request) =>
    sharedAnswer(request, "/00000000-0000-0000-0000-000000000001"),
}));

vi.mock("@asym/api/auth/password-recovery", () => ({
  GET: (request: Request) => sharedAnswer(request, "/forgot-password/reset"),
}));

vi.mock("@asym/api/auth/demo-account", () => ({
  GET: async () => Response.json({ available: true }),
  POST: async (request: Request) => {
    const { NextResponse } = await import("next/server");
    shared.requests.push(request);
    return NextResponse.json({ ok: true, role: "admin" });
  },
}));

vi.mock("@asym/api/auth/signout", () => ({
  POST: async (request: Request) => {
    const { NextResponse } = await import("next/server");
    shared.requests.push(request);
    return NextResponse.json({ ok: true });
  },
}));

const MARK = "asym_clipboard_reset";

function markOf(response: Response) {
  return response.headers
    .getSetCookie()
    .filter((cookie) => cookie.startsWith(`${MARK}=`));
}

afterEach(() => {
  shared.requests = [];
});

describe("each way into or out of a session marks the browser, with no identifier, so the next page empties Payload's copy-and-paste store (WP6 rest, pull request 2, fix round F1)", () => {
  it.each([
    [
      "the sign-in callback",
      "../../../../apps/admin/app/auth/callback/route",
      "GET",
      "https://admin.test/auth/callback?code=c",
    ],
    [
      "the password-reset callback",
      "../../../../apps/admin/app/(auth)/forgot-password/callback/route",
      "GET",
      "https://admin.test/forgot-password/callback?code=c",
    ],
    [
      "the demo account's sign-in",
      "../../../../apps/admin/app/api/auth/demo-account/route",
      "POST",
      "https://admin.test/api/auth/demo-account",
    ],
    [
      "the sign-out, from whichever screen it is made",
      "../../../../apps/admin/app/api/auth/signout/route",
      "POST",
      "https://admin.test/api/auth/signout",
    ],
  ])(
    "%s answers as the shared handler does and sets the mark",
    async (_label, file, method, url) => {
      const route = (await import(file)) as Record<
        string,
        (request: Request) => Promise<Response>
      >;
      const request = new Request(url, { method });
      const shareable = await route[method]!(request);
      expect(shared.requests).toEqual([request]);
      const marks = markOf(shareable);
      expect(marks).toHaveLength(1);
      expect(marks[0]).toMatch(
        /^asym_clipboard_reset=1; Path=\/; SameSite=lax$/i,
      );
      expect(marks[0]).not.toMatch(/HttpOnly/i);
    },
  );

  it("keeps the shared callbacks' redirects", async () => {
    const callback =
      await import("../../../../apps/admin/app/auth/callback/route");
    const answer = await callback.GET(
      new Request("https://admin.test/auth/callback?code=c"),
    );
    expect(answer.status).toBe(307);
    expect(answer.headers.get("location")).toBe(
      "/00000000-0000-0000-0000-000000000001",
    );
  });

  it("leaves the demo account's availability check unmarked: it signs nobody in", async () => {
    const demo =
      await import("../../../../apps/admin/app/api/auth/demo-account/route");
    expect(markOf(await demo.GET())).toEqual([]);
  });
});
