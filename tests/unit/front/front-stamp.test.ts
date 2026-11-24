import { randomBytes } from "node:crypto";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  canonicalOrigin,
  FRONT_ORIGIN_HEADER,
  FRONT_STAMP_HEADER,
  signFrontStamp,
  verifyFrontStamp,
} from "../../../packages/auth/front";

function freshKey(bytes = 32): string {
  return randomBytes(bytes).toString("hex").slice(0, bytes);
}

const ORIGIN = "https://one.example.test";
const OTHER_ORIGIN = "https://two.example.test";
const NOW = 1_800_000_000_000;

describe("front stamp signing and verification", () => {
  it("exports the canonical header names", () => {
    expect(FRONT_STAMP_HEADER).toBe("x-asym-front-stamp");
    expect(FRONT_ORIGIN_HEADER).toBe("x-asym-front-origin");
  });

  it("accepts a stamp signed for the same origin, prefix, and key", async () => {
    const key = freshKey(32);
    const stamp = await signFrontStamp(ORIGIN, "/admin", key, NOW);

    expect(stamp).toMatch(/^v1\.\d+\.[A-Za-z0-9_-]{43}$/);
    await expect(
      verifyFrontStamp(ORIGIN, "/admin", stamp, { key }, NOW),
    ).resolves.toBe(true);
    await expect(
      verifyFrontStamp(ORIGIN, "/admin", stamp, { key }, NOW + 60_000),
    ).resolves.toBe(true);
    await expect(
      verifyFrontStamp(ORIGIN, "/admin", stamp, { key }, NOW - 5_000),
    ).resolves.toBe(true);
  });

  it("refuses another origin, another prefix, or the other dashboard's key", async () => {
    const adminKey = freshKey(32);
    const missionaryKey = freshKey(32);
    const stamp = await signFrontStamp(ORIGIN, "/admin", adminKey, NOW);

    await expect(
      verifyFrontStamp(OTHER_ORIGIN, "/admin", stamp, { key: adminKey }, NOW),
    ).resolves.toBe(false);
    await expect(
      verifyFrontStamp(ORIGIN, "/missionary", stamp, { key: adminKey }, NOW),
    ).resolves.toBe(false);
    await expect(
      verifyFrontStamp(ORIGIN, "/admin", stamp, { key: missionaryKey }, NOW),
    ).resolves.toBe(false);
  });

  it("refuses missing, short, or wrong keys, and refuses when primary is absent or short even with previous set", async () => {
    const validKey = freshKey(32);
    const previousKey = freshKey(32);
    const shortKey = "a".repeat(31);
    const stamp = await signFrontStamp(ORIGIN, "/admin", previousKey, NOW);

    await expect(
      signFrontStamp(ORIGIN, "/admin", shortKey, NOW),
    ).rejects.toThrow();

    await expect(
      verifyFrontStamp(ORIGIN, "/admin", stamp, { key: undefined }, NOW),
    ).resolves.toBe(false);
    await expect(
      verifyFrontStamp(ORIGIN, "/admin", stamp, { key: "" }, NOW),
    ).resolves.toBe(false);
    await expect(
      verifyFrontStamp(ORIGIN, "/admin", stamp, { key: shortKey }, NOW),
    ).resolves.toBe(false);
    await expect(
      verifyFrontStamp(
        ORIGIN,
        "/admin",
        stamp,
        { key: undefined, previousKey },
        NOW,
      ),
    ).resolves.toBe(false);
    await expect(
      verifyFrontStamp(
        ORIGIN,
        "/admin",
        stamp,
        { key: shortKey, previousKey },
        NOW,
      ),
    ).resolves.toBe(false);
    await expect(
      verifyFrontStamp(
        ORIGIN,
        "/admin",
        stamp,
        { key: validKey, previousKey },
        NOW,
      ),
    ).resolves.toBe(true);
  });

  it("counts UTF-8 byte length for key minimum (32 bytes)", async () => {
    const multibyte32Bytes = "\u00e9".repeat(16);
    const multibyte30Bytes = "\u00e9".repeat(15);

    const stamp = await signFrontStamp(ORIGIN, "/admin", multibyte32Bytes, NOW);
    await expect(
      verifyFrontStamp(ORIGIN, "/admin", stamp, { key: multibyte32Bytes }, NOW),
    ).resolves.toBe(true);
    await expect(
      signFrontStamp(ORIGIN, "/admin", multibyte30Bytes, NOW),
    ).rejects.toThrow();
  });

  it("refuses expired (61s old) and future (6s ahead) stamps", async () => {
    const key = freshKey(32);
    const stamp = await signFrontStamp(ORIGIN, "/admin", key, NOW);

    await expect(
      verifyFrontStamp(ORIGIN, "/admin", stamp, { key }, NOW + 61_000),
    ).resolves.toBe(false);
    await expect(
      verifyFrontStamp(ORIGIN, "/admin", stamp, { key }, NOW - 6_000),
    ).resolves.toBe(false);
  });

  it("refuses malformed, empty, two-valued, and v2 stamps", async () => {
    const key = freshKey(32);
    const valid = await signFrontStamp(ORIGIN, "/admin", key, NOW);
    const parts = valid.split(".");
    const v2 = `v2.${parts[1]}.${parts[2]}`;

    for (const bad of [
      null,
      "",
      "not-a-stamp",
      "v1.abc.def",
      v2,
      `${valid}, ${valid}`,
      `${valid} ${valid}`,
      `v1.${parts[1]}.${parts[2]}extra`,
    ]) {
      await expect(
        verifyFrontStamp(ORIGIN, "/admin", bad, { key }, NOW),
        String(bad),
      ).resolves.toBe(false);
    }
  });

  it("enforces strictly canonical origins (refuses uppercase, path, query, fragment, trailing slash)", async () => {
    const key = freshKey(32);
    expect(canonicalOrigin("https://one.example.test")).toBe(
      "https://one.example.test",
    );
    expect(canonicalOrigin("http://one.example.test:25050")).toBe(
      "http://one.example.test:25050",
    );

    const stamp = await signFrontStamp(ORIGIN, "/admin", key, NOW);

    for (const badOrigin of [
      "HTTPS://X",
      "HTTPS://ONE.EXAMPLE.TEST",
      "https://One.Example.Test",
      "https://one.example.test/",
      "https://one.example.test/admin",
      "https://one.example.test?x=1",
      "https://one.example.test#frag",
      "ftp://one.example.test",
      `${ORIGIN}, ${ORIGIN}`,
    ]) {
      expect(canonicalOrigin(badOrigin), badOrigin).toBeNull();
      await expect(
        verifyFrontStamp(badOrigin, "/admin", stamp, { key }, NOW),
        badOrigin,
      ).resolves.toBe(false);
    }
  });
});

describe("front runtime variables in @asym/env schema", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  async function parseEnvWith(overrides: Record<string, string>) {
    vi.resetModules();
    vi.stubEnv("SKIP_ENV_VALIDATION", "");
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("VERCEL_TARGET_ENV", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("FRONT_ADMIN_ORIGIN", "");
    vi.stubEnv("FRONT_MISSIONARY_ORIGIN", "");
    for (const [key, value] of Object.entries(overrides)) {
      vi.stubEnv(key, value);
    }
    return import("../../../packages/env/src/schema");
  }

  it("declares all seven server variables as optional and never NEXT_PUBLIC_", async () => {
    const { readFileSync } = await import("node:fs");
    const path = await import("node:path");
    const source = readFileSync(
      path.join(process.cwd(), "packages/env/src/schema.ts"),
      "utf8",
    );
    const expected = [
      "FRONT_STAMP_KEY_ADMIN",
      "FRONT_STAMP_KEY_MISSIONARY",
      "FRONT_STAMP_KEY",
      "FRONT_STAMP_KEY_PREVIOUS",
      "FRONT_ADMIN_ORIGIN",
      "FRONT_MISSIONARY_ORIGIN",
      "FRONT_NAMES",
    ];
    for (const name of expected) {
      expect(source, `server schema should declare ${name}`).toContain(
        `${name}:`,
      );
      expect(source, `runtimeEnv should wire ${name}`).toContain(
        `process.env.${name}`,
      );
      expect(source).not.toContain(`NEXT_PUBLIC_${name}`);
    }
  });

  it("accepts canonical https and loopback http upstream origins in the env schema", async () => {
    for (const [adminOrigin, missionaryOrigin] of [
      ["https://admin.example.test", "https://missionary.example.test"],
      ["http://localhost:25051", "http://127.0.0.1:25052"],
      ["http://[::1]:25051", "https://missionary.example.test:8443"],
    ] as const) {
      const mod = await parseEnvWith({
        FRONT_ADMIN_ORIGIN: adminOrigin,
        FRONT_MISSIONARY_ORIGIN: missionaryOrigin,
      });
      expect(mod.serverEnv.FRONT_ADMIN_ORIGIN).toBe(adminOrigin);
      expect(mod.serverEnv.FRONT_MISSIONARY_ORIGIN).toBe(missionaryOrigin);
    }
  });

  it.each([
    "https://admin.example.test/",
    "HTTPS://ADMIN.EXAMPLE.TEST",
    "https://Admin.Example.Test",
    "https://admin.example.test/admin",
    "https://admin.example.test:443",
    "http://core-admin.vercel.app",
    "http://localhost.evil.test:25051",
    "http://127.0.0.1.evil.test:25051",
  ])(
    "refuses non-canonical or non-loopback http upstream origin %s at schema start-up",
    async (badOrigin) => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      await expect(
        parseEnvWith({ FRONT_ADMIN_ORIGIN: badOrigin }),
      ).rejects.toThrow();
      await expect(
        parseEnvWith({ FRONT_MISSIONARY_ORIGIN: badOrigin }),
      ).rejects.toThrow();
    },
  );
});
