import { afterEach, describe, expect, it } from "vitest";

import {
  createE2EAuthCookieValue,
  isE2EAuthBypassEnabled,
  parseE2EAuthCookieValue,
} from "../../../packages/auth/e2e-auth";
import {
  DEMO_PROFILE_ID,
  DEMO_TENANT_ID,
} from "../../../packages/auth/constants";

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
      tenantId: DEMO_TENANT_ID,
      profileId: DEMO_PROFILE_ID,
    });

    expect(parseE2EAuthCookieValue(encoded)).toEqual({
      userId: "e2e-donor-user",
      role: "donor",
      tenantId: DEMO_TENANT_ID,
      profileId: DEMO_PROFILE_ID,
    });
  });

  it("returns null for malformed payloads", () => {
    expect(parseE2EAuthCookieValue("bad-value")).toBeNull();
    const invalidRolePayload = btoa(
      JSON.stringify({ userId: "user", role: "not-a-role" }),
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    expect(parseE2EAuthCookieValue(invalidRolePayload)).toBeNull();
  });

  it("enables bypass only outside production", () => {
    process.env.E2E_AUTH_BYPASS = "true";
    process.env.NODE_ENV = "development";
    expect(isE2EAuthBypassEnabled()).toBe(true);

    process.env.NODE_ENV = "production";
    expect(isE2EAuthBypassEnabled()).toBe(false);
  });
});
