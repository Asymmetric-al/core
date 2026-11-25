import { describe, expect, it, vi } from "vitest";

import {
  markWebStudioRefusal,
  readWebStudioRefusalDigest,
  webStudioRefusalAfterError,
} from "../../../apps/admin/src/cms/auth/web-studio-refusal";
import {
  CROSS_ORIGIN_WRITE_MESSAGE,
  OVERRIDE_LOCK_WRITE_MESSAGE,
  sameOriginWrites,
} from "../../../apps/admin/src/cms/web-studio-api-route";

/**
 * Payload's REST routes under `/web-studio/api` (plan 5.2 and 6.3; AL-2675,
 * WP2b slice C). A request that changes data must be same-origin. Payload
 * 4.0.0-beta.9's own check (`csrf`, `auth/extractJWT.js`) covers only its own
 * `payload-token` cookie, which Web Studio does not use (the local strategy is
 * disabled), so the route adds one. An anonymous refusal is answered with
 * JSON that says why, never a redirect.
 */

const ORIGIN = "https://admin.example.org";

function handler() {
  return vi.fn(async () => Response.json({ ok: true }));
}

function call(
  wrapped: (request: Request, args: unknown) => Promise<Response>,
  method: string,
  headers: Record<string, string>,
) {
  return wrapped(
    new Request(`${ORIGIN}/web-studio/api/pages/7`, { method, headers }),
    { params: Promise.resolve({ slug: ["pages", "7"] }) },
  );
}

describe("writes to /web-studio/api", () => {
  it.each(["POST", "PATCH", "PUT", "DELETE"])(
    "%s from another origin is refused with JSON before Payload runs",
    async (method) => {
      for (const headers of [
        { origin: "https://evil.example" },
        { origin: "https://donor.example.org" },
        { origin: "null" },
        { "sec-fetch-site": "cross-site" },
        { "sec-fetch-site": "same-site" },
        { referer: "https://evil.example/form" },
        {},
      ]) {
        const inner = handler();
        const response = await call(sameOriginWrites(inner), method, headers);
        expect(response.status, JSON.stringify(headers)).toBe(403);
        expect(response.headers.get("content-type")).toContain(
          "application/json",
        );
        expect(await response.json()).toEqual({
          errors: [
            {
              message:
                "Web Studio only accepts changes made from Web Studio itself.",
            },
          ],
        });
        expect(inner).not.toHaveBeenCalled();
      }
    },
  );

  it("from the same origin reaches Payload", async () => {
    for (const headers of [
      { origin: ORIGIN },
      { "sec-fetch-site": "same-origin" },
      { referer: `${ORIGIN}/web-studio/collections/pages/7` },
    ]) {
      const inner = handler();
      const response = await call(sameOriginWrites(inner), "PATCH", headers);
      expect(response.status).toBe(200);
      expect(inner).toHaveBeenCalledTimes(1);
    }
  });

  it("treats the two loopback names of a local server as one origin", async () => {
    const inner = handler();
    const response = await sameOriginWrites(inner)(
      new Request("http://localhost:3030/web-studio/api/pages", {
        method: "POST",
        headers: { origin: "http://127.0.0.1:3030" },
      }),
      {},
    );
    expect(response.status).toBe(200);
    const other = await sameOriginWrites(handler())(
      new Request("http://localhost:3030/web-studio/api/pages", {
        method: "POST",
        headers: { origin: "http://127.0.0.1:3005" },
      }),
      {},
    );
    expect(other.status).toBe(403);
  });

  // Council on the joined release, JC7: an opaque origin (a `data:` or
  // sandboxed document) serializes as the string "null"; read as an origin
  // it made the check throw, so the write answered 500 instead of 403.
  it.each([
    ["a data: referrer", { referer: "data:text/html,<form>" }],
    ["an opaque Origin", { origin: "null" }],
    ["a referrer that is no URL", { referer: "not a url" }],
  ])("refuses a write from %s with 403, never 500", async (_label, headers) => {
    const payload = handler();
    const response = await call(sameOriginWrites(payload), "POST", headers);
    expect(response.status).toBe(403);
    expect(payload).not.toHaveBeenCalled();
  });

  it("leaves reads and preflights to Payload", async () => {
    for (const method of ["GET", "HEAD", "OPTIONS"]) {
      const inner = handler();
      await call(sameOriginWrites(inner), method, {
        origin: "https://evil.example",
      });
      expect(inner).toHaveBeenCalledTimes(1);
    }
  });

  it.each(["POST", "PATCH", "PUT", "DELETE"])(
    "refuses same-origin %s with disallowed overrideLock query parameters without consuming the body",
    async (method) => {
      const expectedMessage = OVERRIDE_LOCK_WRITE_MESSAGE;
      expect(expectedMessage).not.toBe(CROSS_ORIGIN_WRITE_MESSAGE);
      for (const query of [
        "?overrideLock=true",
        "?overrideLock=",
        "?overrideLock",
        "?overrideLock=FALSE",
        "?overrideLock=%20false",
        "?overrideLock=false%20",
        "?overrideLock=0",
        "?overrideLock=false&overrideLock=true",
        "?overrideLock[0]=true",
        "?overrideLock[0]=false",
        "?overrideLock.nested=true",
        "?override%4cock=true",
      ]) {
        const inner = handler();
        const request = new Request(
          `${ORIGIN}/web-studio/api/pages/7${query}`,
          {
            method,
            headers: {
              origin: ORIGIN,
              "content-type": "application/json",
            },
            body: JSON.stringify({ title: "Updated" }),
          },
        );
        const response = await sameOriginWrites(inner)(request, {
          params: Promise.resolve({ slug: ["pages", "7"] }),
        });
        expect(response.status, `${method} ${query}`).toBe(403);
        expect(response.headers.get("content-type")).toContain(
          "application/json",
        );
        expect(response.headers.get("cache-control")).toBe("no-store");
        expect(await response.json()).toEqual({
          errors: [{ message: expectedMessage }],
        });
        expect(inner).not.toHaveBeenCalled();
        expect(request.bodyUsed).toBe(false);
      }
    },
  );

  it.each(["POST", "PATCH", "PUT", "DELETE"])(
    "allows same-origin %s when overrideLock is absent or exactly false without touching the body",
    async (method) => {
      for (const query of [
        "",
        "?overrideLock=false",
        "?draft=true&overrideLock=false",
      ]) {
        const inner = vi.fn(async (req: Request) => {
          expect(req.bodyUsed).toBe(false);
          return Response.json({ ok: true });
        });
        const response = await sameOriginWrites(inner)(
          new Request(`${ORIGIN}/web-studio/api/pages/7${query}`, {
            method,
            headers: {
              origin: ORIGIN,
              "content-type": "application/json",
            },
            body: JSON.stringify({ title: "Updated" }),
          }),
          { params: Promise.resolve({ slug: ["pages", "7"] }) },
        );
        expect(response.status, `${method} ${query}`).toBe(200);
        expect(inner).toHaveBeenCalledTimes(1);
      }
    },
  );
});

describe("an anonymous refusal on a Web Studio REST call", () => {
  const forbidden = Object.assign(new Error("not allowed"), {
    name: "Forbidden",
  });

  function refusalFor(
    refusal: Parameters<typeof markWebStudioRefusal>[1] | null,
    error = forbidden,
  ) {
    const req: {
      context: Record<string, unknown>;
      responseHeaders?: Headers;
    } = { context: {} };
    if (refusal) markWebStudioRefusal(req, refusal);
    const result = webStudioRefusalAfterError({
      error,
      req,
      context: req.context,
    } as never);
    return Object.assign({}, result, {
      header: req.responseHeaders?.get("x-asym-web-studio-refusal") ?? null,
    });
  }

  it("is a JSON 401 for an expired session, never a redirect", () => {
    const message = "Your session has ended. Sign in again to continue.";
    expect(refusalFor("no_session")).toEqual({
      status: 401,
      // A top-level message for any reader, Payload's errors for its own
      // screens, an empty `docs` so Payload's bulk actions show the message
      // rather than "Unknown error" (council r2 CR5), and a header the Web
      // Studio document recognizes the refusal by (council C2).
      response: { message, errors: [{ message }], docs: [] },
      header: "no_session",
    });
  });

  it("is a 409 asking for a reload when the page was opened for another organization", () => {
    expect(refusalFor("scope_mismatch")).toMatchObject({
      status: 409,
      response: {
        message: expect.stringMatching(/Reload the page/),
        errors: [{ message: expect.stringMatching(/Reload the page/) }],
        docs: [],
      },
      header: "scope_mismatch",
    });
  });

  it("stays a 403 without a usable organization", () => {
    expect(refusalFor("no_selection")).toMatchObject({
      status: 403,
      header: "no_selection",
    });
  });

  it("turns a marked UnauthorizedError from preferences operations into the refusal response and header", () => {
    const unauthorized = Object.assign(new Error("Unauthorized"), {
      name: "UnauthorizedError",
    });
    expect(refusalFor("scope_mismatch", unauthorized)).toMatchObject({
      status: 409,
      response: {
        message: expect.stringMatching(/Reload the page/),
        errors: [{ message: expect.stringMatching(/Reload the page/) }],
        docs: [],
      },
      header: "scope_mismatch",
    });
  });

  it("leaves every other error, and a refusal of a signed-in caller, as Payload made it", () => {
    expect(refusalFor(null)).toEqual({ header: null });
    expect(
      refusalFor(
        "no_session",
        Object.assign(new Error("x"), { name: "ValidationError" }),
      ),
    ).toEqual({ header: null });
  });
});

describe("readWebStudioRefusalDigest", () => {
  it("reads an exact refusal digest from a server action error line, including dev-mode message and stack", () => {
    expect(
      readWebStudioRefusalDigest(
        '0:{"a":"$@1","f":"","b":"dev"}\n1:E{"digest":"ASYM_WEB_STUDIO_REFUSAL;scope_mismatch","message":"stale","stack":[["fn","file.ts",1,1,0,0,false]]}\n',
      ),
    ).toBe("scope_mismatch");
    expect(
      readWebStudioRefusalDigest(
        'a:E{"digest":"ASYM_WEB_STUDIO_REFUSAL;no_session"}\n',
      ),
    ).toBe("no_session");
    expect(
      readWebStudioRefusalDigest(
        '1f:E{"digest":"ASYM_WEB_STUDIO_REFUSAL;no_selection"}\n',
      ),
    ).toBe("no_selection");
  });

  it("ignores refusal text outside an error line's digest and rejects non-exact digests", () => {
    expect(
      readWebStudioRefusalDigest(
        '0:{"title":"ASYM_WEB_STUDIO_REFUSAL;scope_mismatch"}\n',
      ),
    ).toBeNull();
    expect(
      readWebStudioRefusalDigest(
        '1:E{"digest":"ASYM_WEB_STUDIO_REFUSAL;scope_mismatch1"}\n',
      ),
    ).toBeNull();
    expect(
      readWebStudioRefusalDigest(
        '1:E{"digest":"ASYM_WEB_STUDIO_REFUSAL;scope_mismatch-extra"}\n',
      ),
    ).toBeNull();
    expect(
      readWebStudioRefusalDigest(
        '1:E{"digest":"xASYM_WEB_STUDIO_REFUSAL;scope_mismatch"}\n',
      ),
    ).toBeNull();
    expect(
      readWebStudioRefusalDigest(
        '1:E{"digest":"ASYM_WEB_STUDIO_REFUSAL;scope_mismatchx"}\n',
      ),
    ).toBeNull();
    expect(
      readWebStudioRefusalDigest(
        '1:E{"message":"ASYM_WEB_STUDIO_REFUSAL;scope_mismatch","digest":"OTHER"}\n',
      ),
    ).toBeNull();
  });
});
