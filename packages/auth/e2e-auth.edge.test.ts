import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DEMO_PROFILE_ID, DEMO_TENANT_ID } from "./constants";
import {
  createE2EAuthCookieValue,
  getE2EAuthCookieNameForProxyHost,
  getE2EAuthCookieNameForRequest,
  inferE2EAuthSurfaceFromHost,
  isE2EAuthBypassEnabled,
  parseE2EAuthCookieValue,
} from "./e2e-auth";

describe("inferE2EAuthSurfaceFromHost", () => {
  it("maps standard dev ports", () => {
    expect(inferE2EAuthSurfaceFromHost("localhost:3030")).toBe("admin");
    expect(inferE2EAuthSurfaceFromHost("127.0.0.1:3000")).toBe("donor");
    expect(inferE2EAuthSurfaceFromHost("127.0.0.1:3005")).toBe("donor");
    expect(inferE2EAuthSurfaceFromHost("localhost:4000")).toBe("missionary");
  });

  it("normalizes IPv6 bracket hosts", () => {
    expect(inferE2EAuthSurfaceFromHost("[::1]:3030")).toBe("admin");
  });

  it("returns null when host has no port or unknown port", () => {
    expect(inferE2EAuthSurfaceFromHost("localhost")).toBe(null);
    expect(inferE2EAuthSurfaceFromHost("example.com")).toBe(null);
    expect(inferE2EAuthSurfaceFromHost("localhost:9999")).toBe(null);
  });

  it("trims and lowercases host before parsing", () => {
    expect(inferE2EAuthSurfaceFromHost("  LocalHost:3030  ")).toBe("admin");
  });
});

describe("getE2EAuthCookieNameForProxyHost", () => {
  const originalSurface = process.env.ASYM_E2E_AUTH_SURFACE;

  afterEach(() => {
    if (originalSurface === undefined) {
      delete process.env.ASYM_E2E_AUTH_SURFACE;
    } else {
      process.env.ASYM_E2E_AUTH_SURFACE = originalSurface;
    }
  });

  it("uses port-derived surface when present", () => {
    expect(getE2EAuthCookieNameForProxyHost("localhost:3030")).toBe(
      "asym_e2e_auth_admin",
    );
  });

  it("falls back to ASYM_E2E_AUTH_SURFACE when host has no inferrable port", () => {
    process.env.ASYM_E2E_AUTH_SURFACE = "missionary";
    expect(getE2EAuthCookieNameForProxyHost("internal.service")).toBe(
      "asym_e2e_auth_missionary",
    );
  });

  it("ignores invalid ASYM_E2E_AUTH_SURFACE values", () => {
    process.env.ASYM_E2E_AUTH_SURFACE = "nope";
    expect(getE2EAuthCookieNameForProxyHost("internal.service")).toBe(null);
  });
});

describe("getE2EAuthCookieNameForRequest", () => {
  const originalSurface = process.env.ASYM_E2E_AUTH_SURFACE;

  afterEach(() => {
    if (originalSurface === undefined) {
      delete process.env.ASYM_E2E_AUTH_SURFACE;
    } else {
      process.env.ASYM_E2E_AUTH_SURFACE = originalSurface;
    }
  });

  it("derives from request URL host", () => {
    expect(
      getE2EAuthCookieNameForRequest(new Request("http://localhost:4000/path")),
    ).toBe("asym_e2e_auth_missionary");
  });

  it("uses ASYM_E2E_AUTH_SURFACE when URL has no port", () => {
    process.env.ASYM_E2E_AUTH_SURFACE = "donor";
    expect(
      getE2EAuthCookieNameForRequest(new Request("https://example.com/app")),
    ).toBe("asym_e2e_auth_donor");
  });
});

describe("parseE2EAuthCookieValue", () => {
  it("accepts explicit null tenantId", () => {
    const raw = createE2EAuthCookieValue({
      userId: "u1",
      role: "staff",
      tenantId: null,
    });
    expect(parseE2EAuthCookieValue(raw)).toEqual({
      userId: "u1",
      role: "staff",
      tenantId: null,
    });
  });

  it("round-trips seeded profile and tenant ids", () => {
    const raw = createE2EAuthCookieValue({
      userId: "u1",
      role: "donor",
      tenantId: DEMO_TENANT_ID,
      profileId: DEMO_PROFILE_ID,
    });
    expect(parseE2EAuthCookieValue(raw)).toEqual({
      userId: "u1",
      role: "donor",
      tenantId: DEMO_TENANT_ID,
      profileId: DEMO_PROFILE_ID,
    });
  });

  it("rejects empty userId and unknown roles", () => {
    expect(
      parseE2EAuthCookieValue(
        createE2EAuthCookieValue({
          userId: "",
          role: "admin",
          tenantId: null,
        }),
      ),
    ).toBe(null);
    const invalidRolePayload = Buffer.from(
      JSON.stringify({ userId: "x", role: "root", tenantId: null }),
      "utf8",
    ).toString("base64url");
    expect(parseE2EAuthCookieValue(invalidRolePayload)).toBe(null);
  });

  it("rejects malformed base64 / JSON", () => {
    expect(parseE2EAuthCookieValue("not-valid-base64!!!")).toBe(null);
    expect(parseE2EAuthCookieValue("e30")).toBe(null); // {} — missing required fields
  });
});

describe("isE2EAuthBypassEnabled", () => {
  const originalBypass = process.env.E2E_AUTH_BYPASS;
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.E2E_AUTH_BYPASS = originalBypass;
    process.env.NODE_ENV = originalNodeEnv;
  });

  beforeEach(() => {
    process.env.NODE_ENV = "development";
  });

  it("is false in production regardless of env flag", () => {
    process.env.NODE_ENV = "production";
    process.env.E2E_AUTH_BYPASS = "true";
    expect(isE2EAuthBypassEnabled()).toBe(false);
  });

  it("accepts only 1 and true (case-insensitive trim)", () => {
    process.env.E2E_AUTH_BYPASS = "TRUE";
    expect(isE2EAuthBypassEnabled()).toBe(true);
    process.env.E2E_AUTH_BYPASS = "1";
    expect(isE2EAuthBypassEnabled()).toBe(true);
    process.env.E2E_AUTH_BYPASS = "yes";
    expect(isE2EAuthBypassEnabled()).toBe(false);
    delete process.env.E2E_AUTH_BYPASS;
    expect(isE2EAuthBypassEnabled()).toBe(false);
  });
});
