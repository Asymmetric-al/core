import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { DEMO_PROFILE_ID, DEMO_TENANT_ID } from "./constants";
import {
  assertSupabaseDatasourceAllowedForE2EBypass,
  createE2EAuthCookieValue,
  extractSupabaseProjectRef,
  getE2EAuthCookieNameForProxyHost,
  getE2EAuthCookieNameForRequest,
  hasE2EAuthSecret,
  inferE2EAuthSurfaceFromHost,
  isE2EAuthBypassEnabled,
  isSupabaseDatasourceAllowedForE2EBypass,
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
  const originalSecret = process.env.E2E_AUTH_SECRET;

  beforeAll(() => {
    process.env.E2E_AUTH_SECRET = "edge-test-e2e-secret";
  });

  afterAll(() => {
    if (originalSecret === undefined) {
      delete process.env.E2E_AUTH_SECRET;
    } else {
      process.env.E2E_AUTH_SECRET = originalSecret;
    }
  });

  it("accepts explicit null tenantId", async () => {
    const raw = await createE2EAuthCookieValue({
      userId: "u1",
      role: "staff",
      tenantId: null,
    });
    expect(await parseE2EAuthCookieValue(raw)).toEqual({
      userId: "u1",
      role: "staff",
      tenantId: null,
    });
  });

  it("round-trips seeded profile and tenant ids", async () => {
    const raw = await createE2EAuthCookieValue({
      userId: "u1",
      role: "donor",
      tenantId: DEMO_TENANT_ID,
      profileId: DEMO_PROFILE_ID,
    });
    expect(await parseE2EAuthCookieValue(raw)).toEqual({
      userId: "u1",
      role: "donor",
      tenantId: DEMO_TENANT_ID,
      profileId: DEMO_PROFILE_ID,
    });
  });

  it("rejects empty userId and unknown roles", async () => {
    expect(
      await parseE2EAuthCookieValue(
        await createE2EAuthCookieValue({
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
    expect(await parseE2EAuthCookieValue(invalidRolePayload)).toBe(null);
  });

  it("rejects malformed base64 / JSON", async () => {
    expect(await parseE2EAuthCookieValue("not-valid-base64!!!")).toBe(null);
    expect(await parseE2EAuthCookieValue("e30")).toBe(null); // {} — missing required fields
  });

  it("rejects an unsigned single-segment token", async () => {
    const unsigned = Buffer.from(
      JSON.stringify({
        userId: "u1",
        role: "super_admin",
        tenantId: null,
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
      "utf8",
    ).toString("base64url");
    expect(await parseE2EAuthCookieValue(unsigned)).toBe(null);
  });

  it("rejects a token whose signature does not match the payload", async () => {
    const raw = await createE2EAuthCookieValue({
      userId: "u1",
      role: "super_admin",
      tenantId: null,
    });
    const [payload] = raw.split(".");
    const forged = `${payload}.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`;
    expect(await parseE2EAuthCookieValue(forged)).toBe(null);
  });

  it("rejects a token signed with a different secret", async () => {
    process.env.E2E_AUTH_SECRET = "attacker-secret";
    const forged = await createE2EAuthCookieValue({
      userId: "u1",
      role: "super_admin",
      tenantId: null,
    });
    process.env.E2E_AUTH_SECRET = "edge-test-e2e-secret";
    expect(await parseE2EAuthCookieValue(forged)).toBe(null);
  });

  it("rejects an expired token", async () => {
    // Mint two hours in the past so exp (mint time + TTL) is already elapsed.
    const nowMs = Date.now();
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(nowMs - 7200 * 1000);
    const expired = await createE2EAuthCookieValue({
      userId: "u1",
      role: "donor",
      tenantId: null,
    });
    nowSpy.mockRestore();
    expect(await parseE2EAuthCookieValue(expired)).toBe(null);
  });

  it("fails closed for a real remote datasource when the secret is unset", async () => {
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const raw = await createE2EAuthCookieValue({
      userId: "u1",
      role: "donor",
      tenantId: null,
    });
    delete process.env.E2E_AUTH_SECRET;
    // A real remote datasource must NOT fall back to the public key.
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://realproj12345.supabase.co";
    try {
      expect(await parseE2EAuthCookieValue(raw)).toBe(null);
      await expect(
        createE2EAuthCookieValue({
          userId: "u1",
          role: "donor",
          tenantId: null,
        }),
      ).rejects.toThrow(/E2E_AUTH_SECRET/);
    } finally {
      process.env.E2E_AUTH_SECRET = "edge-test-e2e-secret";
      if (originalUrl === undefined) {
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      } else {
        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
      }
    }
  });
});

describe("E2E_AUTH_SECRET zero-config dev fallback", () => {
  const originalSecret = process.env.E2E_AUTH_SECRET;
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  beforeEach(() => {
    // Exercise the fallback path: no explicit secret configured.
    delete process.env.E2E_AUTH_SECRET;
  });

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.E2E_AUTH_SECRET;
    } else {
      process.env.E2E_AUTH_SECRET = originalSecret;
    }
    if (originalUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    }
  });

  it("mints and verifies with no configured secret against loopback", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
    expect(hasE2EAuthSecret()).toBe(true);
    const raw = await createE2EAuthCookieValue({
      userId: "u1",
      role: "donor",
      tenantId: null,
    });
    expect(await parseE2EAuthCookieValue(raw)).toMatchObject({
      userId: "u1",
      role: "donor",
    });
  });

  it("mints and verifies with no configured secret against the example placeholder", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    expect(hasE2EAuthSecret()).toBe(true);
    const raw = await createE2EAuthCookieValue({
      userId: "u1",
      role: "admin",
      tenantId: null,
    });
    expect(await parseE2EAuthCookieValue(raw)).toMatchObject({
      userId: "u1",
      role: "admin",
    });
  });

  it("does NOT fall back for a real remote datasource", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://realproj12345.supabase.co";
    expect(hasE2EAuthSecret()).toBe(false);
    await expect(
      createE2EAuthCookieValue({
        userId: "u1",
        role: "donor",
        tenantId: null,
      }),
    ).rejects.toThrow(/E2E_AUTH_SECRET/);
  });
});

describe("Supabase datasource binding for E2E bypass", () => {
  const originalAllowlist = process.env.E2E_AUTH_ALLOWED_SUPABASE_REFS;

  afterEach(() => {
    if (originalAllowlist === undefined) {
      delete process.env.E2E_AUTH_ALLOWED_SUPABASE_REFS;
    } else {
      process.env.E2E_AUTH_ALLOWED_SUPABASE_REFS = originalAllowlist;
    }
  });

  it("extracts hosted Supabase project refs", () => {
    expect(extractSupabaseProjectRef("https://abcdefgh.supabase.co")).toBe(
      "abcdefgh",
    );
    expect(extractSupabaseProjectRef("https://abcdefgh.supabase.in")).toBe(
      "abcdefgh",
    );
    expect(extractSupabaseProjectRef("http://127.0.0.1:54321")).toBe(null);
    expect(extractSupabaseProjectRef("not a url")).toBe(null);
  });

  it("does not extract a ref from a Supabase lookalike host", () => {
    // `myref.supabase.evil.com` must NOT resolve to ref `myref`, or an attacker
    // who owns evil.com could satisfy an allowlist that lists `myref`.
    process.env.E2E_AUTH_ALLOWED_SUPABASE_REFS = "myref";
    expect(extractSupabaseProjectRef("https://myref.supabase.evil.com")).toBe(
      null,
    );
    expect(
      isSupabaseDatasourceAllowedForE2EBypass(
        "https://myref.supabase.evil.com",
      ),
    ).toBe(false);
  });

  it("allows loopback, the example placeholder, and unconfigured datasources", () => {
    delete process.env.E2E_AUTH_ALLOWED_SUPABASE_REFS;
    expect(
      isSupabaseDatasourceAllowedForE2EBypass("http://127.0.0.1:54321"),
    ).toBe(true);
    expect(
      isSupabaseDatasourceAllowedForE2EBypass("http://localhost:54321"),
    ).toBe(true);
    // example.supabase.co is a non-resolving placeholder → implicitly allowed.
    expect(
      isSupabaseDatasourceAllowedForE2EBypass("https://example.supabase.co"),
    ).toBe(true);
    expect(isSupabaseDatasourceAllowedForE2EBypass(null)).toBe(true);
    expect(isSupabaseDatasourceAllowedForE2EBypass("")).toBe(true);
  });

  it("allows an allowlisted hosted ref and rejects everything else", () => {
    process.env.E2E_AUTH_ALLOWED_SUPABASE_REFS = "demo1234, example";
    expect(
      isSupabaseDatasourceAllowedForE2EBypass("https://example.supabase.co"),
    ).toBe(true);
    expect(
      isSupabaseDatasourceAllowedForE2EBypass("https://demo1234.supabase.co"),
    ).toBe(true);
    expect(
      isSupabaseDatasourceAllowedForE2EBypass("https://prodxxxx.supabase.co"),
    ).toBe(false);
  });

  it("throws for a non-allowlisted datasource and passes for an allowlisted one", () => {
    process.env.E2E_AUTH_ALLOWED_SUPABASE_REFS = "example";
    expect(() =>
      assertSupabaseDatasourceAllowedForE2EBypass(
        "https://prodxxxx.supabase.co",
      ),
    ).toThrow(/not[\s\S]*allowlisted/i);
    expect(() =>
      assertSupabaseDatasourceAllowedForE2EBypass(
        "https://example.supabase.co",
      ),
    ).not.toThrow();
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
