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

describe("posts read-only POST", () => {
  it("returns the fixed demo response without running withOperation", async () => {
    const request = new NextRequest("http://localhost/api/posts", {
      method: "POST",
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Read-only demo" });
  });
});
