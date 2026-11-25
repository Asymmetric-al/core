import { createRequire } from "node:module";
import path from "node:path";

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

  const OVERRIDE_LOCK_SPELLING_TABLE: ReadonlyArray<
    readonly [query: string, outcome: "refused" | "passed", why: string]
  > = [
    ["?overrideLock=true", "refused", "value true overrides lock"],
    ["?overrideLock=", "refused", "empty value is not exact false"],
    ["?overrideLock", "refused", "valueless key is not exact false"],
    ["?overrideLock=FALSE", "refused", "uppercase FALSE is not exact false"],
    [
      "?overrideLock=%20false",
      "refused",
      "leading space in value is not exact false",
    ],
    [
      "?overrideLock=false%20",
      "refused",
      "trailing space in value is not exact false",
    ],
    ["?overrideLock=0", "refused", "numeric 0 is not exact false"],
    [
      "?overrideLock=false&overrideLock=true",
      "refused",
      "duplicate overrideLock parameter with true",
    ],
    [
      "?overrideLock=false&overrideLock=false",
      "refused",
      "overrideLock appears more than once in query",
    ],
    [
      "?overrideLock[0]=true",
      "refused",
      "indexed bracket key contains overrideLock",
    ],
    [
      "?overrideLock[]=true",
      "refused",
      "empty bracket key contains overrideLock",
    ],
    [
      "?overrideLock[0]=false",
      "refused",
      "indexed bracket key is not whole key overrideLock",
    ],
    ["?overrideLock.x=true", "refused", "dotted key contains overrideLock"],
    [
      "?override%4Cock=true",
      "refused",
      "percent-encoded key decodes to overrideLock",
    ],
    [
      "?[overrideLock]=true",
      "refused",
      "leading-bracket key parses as top-level overrideLock in qs-esm",
    ],
    [
      "?%5BoverrideLock%5D=true",
      "refused",
      "percent-encoded bracket key parses as top-level overrideLock in qs-esm",
    ],
    [
      "?%5BoverrideLock]=true",
      "refused",
      "mixed-encoded bracket key parses as top-level overrideLock in qs-esm",
    ],
    [
      "?[overrideLock]=false",
      "refused",
      "leading-bracket key is not whole key overrideLock",
    ],
    [
      "?[overrideLock][0]=true",
      "refused",
      "nested bracket key contains overrideLock",
    ],
    [
      "?[[overrideLock]]=true",
      "refused",
      "double-bracket key contains overrideLock",
    ],
    [
      "?a=1;overrideLock=true",
      "refused",
      "semicolon-delimited overrideLock appears in decoded value",
    ],
    [
      "?%20overrideLock=true",
      "refused",
      "leading-space key contains overrideLock",
    ],
    ["?note=overrideLock", "refused", "overrideLock appears in decoded value"],
    [
      "?overrideLock=false&note=overrideLock",
      "refused",
      "overrideLock appears in a value as well as a key",
    ],
    [
      "?OverrideLock=true",
      "passed",
      "different case omits overrideLock and Payload ignores it",
    ],
    [
      `?${Array.from({ length: 1001 }, (_, index) => `p${index}=1`).join("&")}&overrideLock=true`,
      "refused",
      "more than 1000 parameters before overrideLock=true",
    ],
    ["", "passed", "legitimate client omits overrideLock"],
    [
      "?overrideLock=false",
      "passed",
      "appears once as whole key with exact value false",
    ],
    [
      "?draft=true&overrideLock=false",
      "passed",
      "appears once as whole key with exact value false beside other parameters",
    ],
  ];

  it.each(["POST", "PATCH", "PUT", "DELETE"])(
    "applies the single overrideLock query rule to %s across the spelling table without consuming the body",
    async (method) => {
      expect(OVERRIDE_LOCK_WRITE_MESSAGE).not.toBe(CROSS_ORIGIN_WRITE_MESSAGE);
      for (const [query, outcome, why] of OVERRIDE_LOCK_SPELLING_TABLE) {
        const inner = vi.fn(async (req: Request) => {
          expect(req.bodyUsed, `${method} ${query} (${why})`).toBe(false);
          return Response.json({ ok: true });
        });
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
        const label = `${method} ${query.slice(0, 64)} (${why})`;
        if (outcome === "refused") {
          expect(response.status, label).toBe(403);
          expect(response.headers.get("content-type"), label).toContain(
            "application/json",
          );
          expect(response.headers.get("cache-control"), label).toBe("no-store");
          expect(await response.json(), label).toEqual({
            errors: [{ message: OVERRIDE_LOCK_WRITE_MESSAGE }],
          });
          expect(inner, label).not.toHaveBeenCalled();
          expect(request.bodyUsed, label).toBe(false);
        } else {
          expect(response.status, label).toBe(200);
          expect(inner, label).toHaveBeenCalledTimes(1);
        }
      }
    },
  );

  it("refuses every query where Payload's installed qs-esm yields a top-level overrideLock other than false", async () => {
    const adminRequire = createRequire(path.resolve("apps/admin/package.json"));
    const payloadRequire = createRequire(adminRequire.resolve("payload"));
    const qs = payloadRequire("qs-esm") as {
      parse: (
        query: string,
        options: {
          allowEmptyArrays: boolean;
          arrayLimit: number;
          depth: number;
          ignoreQueryPrefix: boolean;
        },
      ) => Record<string, unknown>;
    };
    const payloadQsOptions = {
      allowEmptyArrays: true,
      arrayLimit: 1000,
      depth: 10,
      ignoreQueryPrefix: true,
    };

    expect(
      qs.parse("?[overrideLock]=true", payloadQsOptions).overrideLock,
    ).toBe("true");
    expect(
      qs.parse("?%5BoverrideLock%5D=true", payloadQsOptions).overrideLock,
    ).toBe("true");
    expect(
      qs.parse("?%5BoverrideLock]=true", payloadQsOptions).overrideLock,
    ).toBe("true");

    const prefixes = ["", "[", "%5B", "[[", "a", "%20", "a["];
    const suffixes = ["", "]", "%5D", "]]", "[0]", "[]", ".x", "b", "]a"];
    const values = ["true", "false", "1", ""];
    const generated: string[] = [];
    for (const prefix of prefixes) {
      for (const suffix of suffixes) {
        for (const value of values) {
          generated.push(`?${prefix}overrideLock${suffix}=${value}`);
        }
      }
    }

    const allQueries = [
      ...OVERRIDE_LOCK_SPELLING_TABLE.map(([query]) => query),
      ...generated,
    ];
    let checkedTopLevelOverrides = 0;

    for (const query of allQueries) {
      const parsed = qs.parse(query, payloadQsOptions);
      if (
        !Object.prototype.hasOwnProperty.call(parsed, "overrideLock") ||
        parsed.overrideLock === "false"
      ) {
        continue;
      }
      checkedTopLevelOverrides += 1;
      const inner = handler();
      const request = new Request(`${ORIGIN}/web-studio/api/pages/7${query}`, {
        method: "PATCH",
        headers: {
          origin: ORIGIN,
          "content-type": "application/json",
        },
        body: JSON.stringify({ title: "Updated" }),
      });
      const response = await sameOriginWrites(inner)(request, {
        params: Promise.resolve({ slug: ["pages", "7"] }),
      });
      expect(response.status, `qs-esm pin for ${query}`).toBe(403);
      expect(
        response.headers.get("cache-control"),
        `qs-esm pin for ${query}`,
      ).toBe("no-store");
      expect(await response.json(), `qs-esm pin for ${query}`).toEqual({
        errors: [{ message: OVERRIDE_LOCK_WRITE_MESSAGE }],
      });
      expect(inner, `qs-esm pin for ${query}`).not.toHaveBeenCalled();
      expect(request.bodyUsed, `qs-esm pin for ${query}`).toBe(false);
    }

    expect(checkedTopLevelOverrides).toBeGreaterThan(20);
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
