/**
 * Payload's real route modules under `/web-studio/api` refuse a cross-origin
 * write (plan 5.2 and 6.3; AL-2675, WP2b slice C, council C7). The guard is
 * tested on a fake handler in `web-studio-api-route.test.ts`; this file loads
 * the route modules as Next.js does, so a route that lost `sameOriginWrites`
 * fails here, in the unit suite that gates a pull request. The guard answers
 * before Payload runs, so no database is reached.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@payload-config", () => import("../../../apps/admin/payload.config"));

const ORIGIN = "https://admin.example.org";
const MESSAGE = "Web Studio only accepts changes made from Web Studio itself.";

type Handler = (request: Request, args: unknown) => Promise<Response>;
let rest: Record<string, Handler>;
let graphql: Record<string, Handler>;

beforeAll(async () => {
  vi.stubEnv("PAYLOAD_DISABLE_SCHEMA_PUSH", "1");
  vi.stubEnv("BLOB_READ_WRITE_TOKEN", undefined);
  vi.stubEnv("RESEND_API_KEY", undefined);
  rest =
    (await import("../../../apps/admin/app/(payload)/web-studio/api/[...slug]/route")) as never;
  graphql =
    (await import("../../../apps/admin/app/(payload)/web-studio/api/graphql/route")) as never;
}, 60_000);

afterAll(() => vi.unstubAllEnvs());

async function expectRefused(response: Response) {
  expect(response.status).toBe(403);
  expect(response.headers.get("content-type")).toContain("application/json");
  expect(await response.json()).toEqual({ errors: [{ message: MESSAGE }] });
}

describe("Payload's route modules under /web-studio/api", () => {
  it.each(["PATCH", "PUT", "DELETE", "POST"])(
    "REST %s from another origin gets 403 and the JSON message",
    async (method) => {
      await expectRefused(
        await rest[method]!(
          new Request(`${ORIGIN}/web-studio/api/pages/7`, {
            method,
            headers: { origin: "https://evil.example" },
          }),
          { params: Promise.resolve({ slug: ["pages", "7"] }) },
        ),
      );
    },
  );

  it("GraphQL POST from another origin gets 403 and the JSON message", async () => {
    await expectRefused(
      await graphql.POST!(
        new Request(`${ORIGIN}/web-studio/api/graphql`, {
          method: "POST",
          headers: {
            origin: "https://evil.example",
            "content-type": "application/json",
          },
          body: JSON.stringify({ query: "mutation { __typename }" }),
        }),
        {},
      ),
    );
  });
});
