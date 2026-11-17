/**
 * WP0 (#2672), the schema-push half of audit findings NA-04 and NX-05:
 * schema push is off for any non-loopback database host.
 *
 * Payload's Postgres adapter pushes the schema on connect whenever
 * `NODE_ENV` is not `production` and the adapter's `push` is not `false`.
 * These tests build the adapter exactly as the admin server does, from
 * `apps/admin/payload.config.ts`, and read the `push` it will connect with.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

type PayloadConfig = Awaited<
  (typeof import("../../../apps/admin/payload.config"))["default"]
>;

const NON_LOOPBACK_URLS = [
  "postgresql://postgres:test-placeholder@db.abcdefghijklmnopqrst.supabase.co:5432/postgres",
  "postgresql://postgres.abc:test-placeholder@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require",
  "postgresql://postgres:test-placeholder@10.0.0.5:5432/postgres",
  "postgresql://postgres:test-placeholder@192.168.1.20:5432/postgres",
  "postgresql://postgres:test-placeholder@host.docker.internal:54322/postgres",
  "postgresql://postgres:test-placeholder@[2001:db8::1]:5432/postgres",
  "postgresql://postgres:test-placeholder@127.0.0.1.example.com:5432/postgres",
  "postgresql://postgres:test-placeholder@localhost.example.com:5432/postgres",
];

const LOOPBACK_URLS = [
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  "postgresql://postgres:postgres@localhost:54322/postgres",
  "postgresql://postgres:postgres@[::1]:54322/postgres",
  "postgresql://postgres:postgres@127.0.0.2:54322/postgres",
];

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

/** Loads the admin Payload config afresh under the given environment. */
async function loadConfig(env: Record<string, string | undefined>) {
  vi.stubEnv("BLOB_READ_WRITE_TOKEN", undefined);
  vi.stubEnv("RESEND_API_KEY", undefined);
  vi.stubEnv("SUPABASE_DB_URL", undefined);
  vi.stubEnv("PAYLOAD_DISABLE_SCHEMA_PUSH", undefined);
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  const { default: configured } =
    await import("../../../apps/admin/payload.config");
  return (await configured) as PayloadConfig;
}

/** The `push` value of the database adapter the server would connect with. */
function adapterPush(config: PayloadConfig) {
  const adapter = config.db.init({
    payload: { config, logger: console } as never,
  }) as unknown as { push?: boolean };
  return adapter.push;
}

describe("admin Payload schema push (NA-04, NX-05)", () => {
  it.each(NON_LOOPBACK_URLS)(
    "is off for a server started against %s, with no opt-out flag set",
    async (url) => {
      const config = await loadConfig({
        NODE_ENV: "development",
        PAYLOAD_DATABASE_URI: url,
      });
      expect(adapterPush(config)).toBe(false);
    },
    30_000,
  );

  it("never connects to a hosted database named only by SUPABASE_DB_URL", async () => {
    // AL-2674 (WP1.2) removed Payload's fallback to SUPABASE_DB_URL: the
    // adapter reads PAYLOAD_DATABASE_URI and nothing else (NA-04). This case
    // used to assert that push was off for a hosted database reached through
    // that fallback. The fallback is gone, so the stronger fact is asserted:
    // the hosted URL is not the connection at all, the connection that is
    // used is the loopback default, and push keeps Payload's loopback default.
    const config = await loadConfig({
      NODE_ENV: "development",
      PAYLOAD_DATABASE_URI: undefined,
      SUPABASE_DB_URL: NON_LOOPBACK_URLS[0],
    });
    const { DEFAULT_LOCAL_PAYLOAD_DATABASE_URL, resolvePayloadDatabaseConfig } =
      await import("../../../apps/admin/src/cms/payload-database-config");
    const connection = resolvePayloadDatabaseConfig().pool.connectionString;
    expect(connection).toBe(DEFAULT_LOCAL_PAYLOAD_DATABASE_URL);
    expect(connection).not.toBe(NON_LOOPBACK_URLS[0]);
    expect(adapterPush(config)).toBeUndefined();
  }, 30_000);

  it.each(LOOPBACK_URLS)(
    "keeps Payload's development default for the loopback database %s",
    async (url) => {
      const config = await loadConfig({
        NODE_ENV: "development",
        PAYLOAD_DATABASE_URI: url,
      });
      expect(adapterPush(config)).toBeUndefined();
    },
    30_000,
  );

  it("still honours the opt-out flag on a loopback database", async () => {
    const config = await loadConfig({
      NODE_ENV: "development",
      PAYLOAD_DATABASE_URI: LOOPBACK_URLS[0],
      PAYLOAD_DISABLE_SCHEMA_PUSH: "1",
    });
    expect(adapterPush(config)).toBe(false);
  }, 30_000);
});

describe("resolvePayloadSchemaPush", () => {
  async function load() {
    return import("../../../apps/admin/src/cms/payload-schema-push");
  }

  it.each(NON_LOOPBACK_URLS)("returns false for %s", async (url) => {
    const { resolvePayloadSchemaPush } = await load();
    expect(resolvePayloadSchemaPush({ connectionString: url, env: {} })).toBe(
      false,
    );
  });

  it.each(["", "not-a-url", "postgresql:///postgres?host=/var/run/postgresql"])(
    "fails closed for the unusable connection string %j",
    async (url) => {
      const { resolvePayloadSchemaPush } = await load();
      expect(resolvePayloadSchemaPush({ connectionString: url, env: {} })).toBe(
        false,
      );
    },
  );

  it.each(LOOPBACK_URLS)(
    "leaves Payload's default in place for %s",
    async (url) => {
      const { resolvePayloadSchemaPush } = await load();
      expect(
        resolvePayloadSchemaPush({ connectionString: url, env: {} }),
      ).toBeUndefined();
    },
  );

  it.each(["1"])(
    "returns false on loopback when PAYLOAD_DISABLE_SCHEMA_PUSH=%s",
    async (flag) => {
      const { resolvePayloadSchemaPush } = await load();
      expect(
        resolvePayloadSchemaPush({
          connectionString: LOOPBACK_URLS[0]!,
          env: { PAYLOAD_DISABLE_SCHEMA_PUSH: flag },
        }),
      ).toBe(false);
    },
  );

  it.each(["0", "true", ""])(
    "never turns push on for a non-loopback host, whatever PAYLOAD_DISABLE_SCHEMA_PUSH=%j says",
    async (flag) => {
      const { resolvePayloadSchemaPush } = await load();
      expect(
        resolvePayloadSchemaPush({
          connectionString: NON_LOOPBACK_URLS[0]!,
          env: { PAYLOAD_DISABLE_SCHEMA_PUSH: flag },
        }),
      ).toBe(false);
    },
  );
});
