import { describe, expect, it } from "vitest";

import { nextDevReadyURL } from "../e2e/base-urls";

describe("nextDevReadyURL", () => {
  it("uses the DB-independent endpoint for Playwright webServer readiness", () => {
    expect(nextDevReadyURL("http://localhost:3030")).toBe(
      "http://localhost:3030/api/playwright-ready",
    );
  });

  it("normalizes a trailing slash before appending the readiness path", () => {
    expect(nextDevReadyURL("http://127.0.0.1:3005/")).toBe(
      "http://127.0.0.1:3005/api/playwright-ready",
    );
  });
});
