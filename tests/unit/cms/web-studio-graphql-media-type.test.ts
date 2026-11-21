/**
 * Re-check H2 (AL-2677): Web Studio's GraphQL route accepts only a JSON body.
 * The proxy forwards a write with no type and no framing as empty, and a
 * body can still arrive over HTTP/2 or HTTP/3; Payload builds its request and
 * parses a multipart body before graphql-http refuses anything that is not
 * JSON. The route refuses first, in the Studio envelope, and dispatches
 * nothing.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const dispatch = vi.hoisted(() => vi.fn());
vi.mock("@payload-config", () => ({ default: {} }));
// The admin app's own copy (Bun installs per workspace; the repository root
// has none), as the route module resolves `@payloadcms/next/routes`.
vi.mock(
  "../../../apps/admin/node_modules/@payloadcms/next/dist/exports/routes.js",
  () => ({
    GRAPHQL_POST: () => dispatch,
    REST_OPTIONS: () => vi.fn(),
  }),
);

import { POST } from "../../../apps/admin/app/(payload)/web-studio/api/graphql/route";

const ORIGIN = "https://admin.example.org";
const query = JSON.stringify({
  query: "mutation { deletePage(id: 7) { id } }",
});
const post = (headers: Record<string, string>, body?: BodyInit) =>
  POST(
    new Request(`${ORIGIN}/web-studio/api/graphql`, {
      method: "POST",
      headers: { origin: ORIGIN, ...headers },
      body,
    }),
    undefined as never,
  );

beforeEach(() => {
  dispatch.mockReset();
  dispatch.mockResolvedValue(Response.json({ data: {} }));
});

describe("Web Studio's GraphQL route", () => {
  it.each([
    ["no media type", {}, new TextEncoder().encode(query)],
    ["text/plain", { "content-type": "text/plain" }, query],
    [
      "multipart",
      { "content-type": "multipart/form-data; boundary=piece" },
      "--piece--",
    ],
  ] as const)(
    "refuses a body with %s before Payload runs",
    async (_name, headers, body) => {
      const response = await post({ ...headers }, body);
      expect(response.status).toBe(415);
      expect(await response.json()).toEqual({
        errors: [{ message: "Unsupported mutation content type." }],
      });
      expect(dispatch).not.toHaveBeenCalled();
    },
  );

  it("passes a JSON body to Payload", async () => {
    const response = await post(
      { "content-type": "application/json; charset=utf-8" },
      query,
    );
    expect(response.status).toBe(200);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});
