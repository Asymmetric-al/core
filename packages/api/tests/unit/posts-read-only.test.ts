import { NextRequest } from "next/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/** Load posts module after env bypass so `@asym/env` does not fail in isolation. */
let POST: (request: NextRequest) => Promise<Response>;
const previousSkipEnvValidation = process.env.SKIP_ENV_VALIDATION;

beforeAll(async () => {
  process.env.SKIP_ENV_VALIDATION = "1";
  const mod = await import("../../src/posts");
  POST = mod.POST;
});

afterAll(() => {
  if (previousSkipEnvValidation === undefined) {
    delete process.env.SKIP_ENV_VALIDATION;
    return;
  }

  process.env.SKIP_ENV_VALIDATION = previousSkipEnvValidation;
});

// Missionaries can now publish their own updates (see posts/create.ts and
// tests/unit/packages/api/posts/create-post.test.ts). Creation still needs a
// signed-in missionary: a request without a session never reaches the
// database.
describe("posts POST", () => {
  it("refuses a request without a signed-in missionary", async () => {
    const request = new NextRequest("http://localhost/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Hello" }),
    });

    const response = await POST(request);

    expect([401, 403]).toContain(response.status);
    await expect(response.json()).resolves.not.toEqual({
      post: expect.anything(),
    });
  });
});
