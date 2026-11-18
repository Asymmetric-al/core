import { describe, expect, it, vi } from "vitest";

import {
  markWebStudioRefusal,
  webStudioRefusalAfterError,
} from "../../../apps/admin/src/cms/auth/web-studio-refusal";
import { sameOriginWrites } from "../../../apps/admin/src/cms/web-studio-api-route";

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

  it("leaves reads and preflights to Payload", async () => {
    for (const method of ["GET", "HEAD", "OPTIONS"]) {
      const inner = handler();
      await call(sameOriginWrites(inner), method, {
        origin: "https://evil.example",
      });
      expect(inner).toHaveBeenCalledTimes(1);
    }
  });
});

describe("an anonymous refusal on a Web Studio REST call", () => {
  const forbidden = Object.assign(new Error("not allowed"), {
    name: "Forbidden",
  });

  function refusalFor(
    refusal: Parameters<typeof markWebStudioRefusal>[1] | null,
    error = forbidden,
  ) {
    const req = { context: {} as Record<string, unknown> };
    if (refusal) markWebStudioRefusal(req, refusal);
    return webStudioRefusalAfterError({
      error,
      req,
      context: req.context,
    } as never);
  }

  it("is a JSON 401 for an expired session, never a redirect", () => {
    expect(refusalFor("no_session")).toEqual({
      status: 401,
      response: {
        errors: [
          { message: "Your session has ended. Sign in again to continue." },
        ],
      },
    });
  });

  it("is a 409 asking for a reload when the page was opened for another organization", () => {
    expect(refusalFor("scope_mismatch")).toMatchObject({
      status: 409,
      response: {
        errors: [{ message: expect.stringMatching(/Reload the page/) }],
      },
    });
  });

  it("stays a 403 without a usable organization", () => {
    expect(refusalFor("no_selection")).toMatchObject({ status: 403 });
  });

  it("leaves every other error, and a refusal of a signed-in caller, as Payload made it", () => {
    expect(refusalFor(null)).toBeUndefined();
    expect(
      refusalFor(
        "no_session",
        Object.assign(new Error("x"), { name: "ValidationError" }),
      ),
    ).toBeUndefined();
  });
});
