import { expect, test } from "@playwright/test";

import { proofReady } from "./helpers/n2-on";

test.skip(!proofReady(), "run through bun run test:e2e:n2-on");

const REFUSED_PATHS = [
  "/api/nope",
  "/auth/nope",
  "/web-studio/x",
  "/invite/x",
  "/api/nope.png",
  "/web-studio/x.js",
];

const YEAR_LONG = /immutable|max-age=31536000/;

test("reserved addresses no donor route serves answer HTTP 404, uncached, before anything renders", async ({
  page,
}) => {
  for (const path of REFUSED_PATHS) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(404);
    expect(response?.headers()["cache-control"] ?? "", path).not.toMatch(
      YEAR_LONG,
    );
  }
  for (const path of ["/api/nope", "/auth/nope", "/web-studio/x"]) {
    const status = await page.evaluate(async (address) => {
      const response = await fetch(address, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      });
      return response.status;
    }, path);
    expect(status, `POST ${path}`).toBe(404);
  }
});

test("the routes under reserved segments still answer as before (guard)", async ({
  page,
}) => {
  expect((await page.goto("/api/health"))?.status()).toBe(200);
  const landed = await page.goto("/auth/callback");
  const callback = await landed?.request().redirectedFrom()?.response();
  expect(callback?.status()).toBe(307);
  expect(new URL(page.url()).pathname).toBe("/login");
});

test("a miss under a page prefix still reaches the public catch-all and shows the not-found page", async ({
  page,
}) => {
  await page.goto("/privacy/x");
  await expect(
    page.getByRole("heading", {
      name: /page (?:could )?not (?:be )?found/i,
    }),
  ).toBeVisible();
});
