import { afterEach, describe, expect, it } from "vitest";

import {
  createE2EAuthCookieValue,
  isE2EAuthBypassEnabled,
  parseE2EAuthCookieValue,
} from "../../../packages/auth/e2e-auth";

const originalBypass = process.env.E2E_AUTH_BYPASS;
const originalNodeEnv = process.env.NODE_ENV;

describe("e2e auth helpers", () => {
  afterEach(() => {
    process.env.E2E_AUTH_BYPASS = originalBypass;
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("serializes and parses a valid auth session", () => {
    const encoded = createE2EAuthCookieValue({
      userId: "e2e-donor-user",
      role: "donor",
      tenantId: null,
    });

    expect(parseE2EAuthCookieValue(encoded)).toEqual({
      userId: "e2e-donor-user",
      role: "donor",
      tenantId: null,
    });
  });

  it("returns null for malformed payloads", () => {
    expect(parseE2EAuthCookieValue("bad-value")).toBeNull();
    expect(
      parseE2EAuthCookieValue(
        Buffer.from(
          JSON.stringify({ userId: "user", role: "not-a-role" }),
        ).toString("base64url"),
      ),
    ).toBeNull();
  });

  it("enables bypass only outside production", () => {
    process.env.E2E_AUTH_BYPASS = "true";
    process.env.NODE_ENV = "development";
    expect(isE2EAuthBypassEnabled()).toBe(true);

    process.env.NODE_ENV = "production";
    expect(isE2EAuthBypassEnabled()).toBe(false);
  });
});
