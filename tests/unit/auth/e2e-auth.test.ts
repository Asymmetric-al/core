import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createE2EAuthCookieValue,
  hasE2EAuthSecret,
  isE2EAuthBypassEnabled,
  parseE2EAuthCookieValue,
} from "../../../packages/auth/e2e-auth";
import {
  DEMO_PROFILE_ID,
  DEMO_TENANT_ID,
} from "../../../packages/auth/constants";

const originalBypass = process.env.E2E_AUTH_BYPASS;
const originalNodeEnv = process.env.NODE_ENV;
const originalSecret = process.env.E2E_AUTH_SECRET;
const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

describe("e2e auth helpers", () => {
  beforeEach(() => {
    process.env.E2E_AUTH_SECRET = "unit-test-e2e-secret";
  });

  afterEach(() => {
    process.env.E2E_AUTH_BYPASS = originalBypass;
    process.env.NODE_ENV = originalNodeEnv;
    if (originalSecret === undefined) {
      delete process.env.E2E_AUTH_SECRET;
    } else {
      process.env.E2E_AUTH_SECRET = originalSecret;
    }
    if (originalSupabaseUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
    }
  });

  it("serializes and parses a valid auth session", async () => {
    const encoded = await createE2EAuthCookieValue({
      userId: "e2e-donor-user",
      role: "donor",
      tenantId: DEMO_TENANT_ID,
      profileId: DEMO_PROFILE_ID,
    });

    expect(await parseE2EAuthCookieValue(encoded)).toEqual({
      userId: "e2e-donor-user",
      role: "donor",
      tenantId: DEMO_TENANT_ID,
      profileId: DEMO_PROFILE_ID,
    });
  });

  it("returns null for malformed and unsigned payloads", async () => {
    expect(await parseE2EAuthCookieValue("bad-value")).toBeNull();
    const invalidRolePayload = btoa(
      JSON.stringify({ userId: "user", role: "not-a-role" }),
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    // Unsigned single-segment token: rejected before role validation.
    expect(await parseE2EAuthCookieValue(invalidRolePayload)).toBeNull();
  });

  it("enables bypass only outside production", () => {
    process.env.E2E_AUTH_BYPASS = "true";
    process.env.NODE_ENV = "development";
    expect(isE2EAuthBypassEnabled()).toBe(true);

    process.env.NODE_ENV = "production";
    expect(isE2EAuthBypassEnabled()).toBe(false);
  });

  it("rejects explicit E2E auth secrets shorter than the signing key floor", async () => {
    process.env.E2E_AUTH_SECRET = "too-short";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://realproj12345.supabase.co";

    expect(hasE2EAuthSecret()).toBe(false);
    await expect(
      createE2EAuthCookieValue({
        userId: "e2e-donor-user",
        role: "donor",
        tenantId: DEMO_TENANT_ID,
        profileId: DEMO_PROFILE_ID,
      }),
    ).rejects.toThrow(/E2E_AUTH_SECRET/);
  });
});
