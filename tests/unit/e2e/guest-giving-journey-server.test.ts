import { describe, expect, it } from "vitest";

import config from "../../../playwright.guest-giving.config";

function servers() {
  const web = config.webServer;
  return Array.isArray(web) ? web : web ? [web] : [];
}

describe("AL-2681 B fix round X0: the guest-giving journeys serve the donor app from a production build", () => {
  it("builds the donor app and starts it, so no development server, hot reload or development cache takes part in a journey", () => {
    const donor = servers()[0];
    expect(donor?.command).toMatch(
      /^bun run --cwd apps\/donor build && bun run --cwd apps\/donor start -- --port \d+ --hostname 127\.0\.0\.1$/,
    );
    expect(donor?.command).not.toMatch(/\bdev\b|dev:playwright/);
  });
});
