/**
 * #2067 PR #2169 review 3, Builder-owned: the effective-config layer of the
 * reader connection. Checks the exact object the gate hands to `new
 * pg.Client` (captured by a mocked driver), what pg's own resolver makes of
 * it, and the single-attempt STOP when Node does not trust the Supabase root
 * CA.
 */

import { createRequire } from "node:module";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  checkDatabaseUrl,
  runDocumentCutoverCommand,
} from "../../../scripts/document-cutover/assess-document-cutover";

import type { PgClientConfig } from "../../../scripts/document-cutover/assess-document-cutover";

const pgCalls = vi.hoisted(() => ({
  configs: [] as unknown[],
  connects: 0,
  failWith: null as string | null,
}));

vi.mock("pg", () => {
  class Client {
    constructor(config: unknown) {
      pgCalls.configs.push(config);
    }
    on() {
      return this;
    }
    async connect() {
      pgCalls.connects += 1;
      throw Object.assign(new Error("certificate chain not trusted (test)"), {
        code: pgCalls.failWith ?? "ECONNREFUSED",
      });
    }
    async query() {
      throw new Error("no query expected in this test");
    }
    async end() {}
  }
  const api = { Client };
  return { ...api, default: api };
});

const REF = "readertls2067ref";
/** Obviously fake, built at runtime; never a real credential. */
const PASSWORD = ["reader", "tls", "2067", "not", "a", "pw"].join("-");
const POOLER = `document_cutover_reader.${REF}:${PASSWORD}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`;
const HOSTED_ENV = { SUPABASE_URL: `https://${REF}.supabase.co` };
const LOOPBACK_ENV = { SUPABASE_URL: "http://127.0.0.1:54321" };

const ConnectionParameters = createRequire(import.meta.url)(
  "pg/lib/connection-parameters.js",
) as new (config: unknown) => { ssl: unknown; host: unknown };

function configFor(
  env: Record<string, string>,
  url: string,
): PgClientConfig | string {
  const result = checkDatabaseUrl({
    ...env,
    DOCUMENT_CUTOVER_DATABASE_URL: url,
  });
  return "config" in result ? result.config : result.blocker;
}

let output: string[] = [];

beforeEach(() => {
  pgCalls.configs = [];
  pgCalls.connects = 0;
  pgCalls.failWith = null;
  output = [];
  const capture = (...args: unknown[]) => {
    output.push(args.map(String).join(" "));
  };
  vi.spyOn(console, "log").mockImplementation(capture);
  vi.spyOn(console, "error").mockImplementation(capture);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("#2067 review 3 — the pg client config for a non-loopback reader", () => {
  it.each(["require", "verify-ca", "verify-full"])(
    "sslmode=%s: pg receives exactly the URL without its query and ssl { rejectUnauthorized: true }, and pg resolves that ssl unchanged",
    (mode) => {
      const config = configFor(
        HOSTED_ENV,
        `postgresql://${POOLER}?sslmode=${mode}`,
      );
      expect(config).toEqual({
        connectionString: `postgresql://${POOLER}`,
        application_name: "document-cutover-gate",
        connectionTimeoutMillis: 10_000,
        statement_timeout: 30_000,
        ssl: { rejectUnauthorized: true },
      });
      expect(new ConnectionParameters(config).ssl).toEqual({
        rejectUnauthorized: true,
      });
    },
  );

  it.each([
    "",
    "?sslmode=disable",
    "?sslmode=allow",
    "?sslmode=prefer",
    "?sslmode=no-verify",
  ])("query %j is refused before any client exists", (query) => {
    const result = configFor(HOSTED_ENV, `postgresql://${POOLER}${query}`);
    expect(result).toMatch(/sslmode/);
    expect(pgCalls.configs).toEqual([]);
  });

  it("a loopback reader may run without TLS: ssl false, and no query reaches pg", () => {
    const config = configFor(
      LOOPBACK_ENV,
      `postgresql://document_cutover_reader:${PASSWORD}@127.0.0.1:54322/postgres`,
    );
    expect(config).toMatchObject({ ssl: false });
    expect(new ConnectionParameters(config).ssl).toBe(false);
  });

  it.each([
    [
      "[::1]",
      `postgresql://document_cutover_reader:${PASSWORD}@[::1]:54322/postgres`,
      /IPv6/,
    ],
    [
      "two hosts",
      `postgresql://${POOLER.replace("5432/", "5432,aws-0-us-east-1.pooler.supabase.com:5432/")}?sslmode=require`,
      /more than one host/,
    ],
    [
      "an empty host",
      `postgresql://document_cutover_reader:${PASSWORD}@:5432/postgres?sslmode=require`,
      /names no host/,
    ],
  ])("%s gets its own clear blocker", (_label, url, message) => {
    expect(configFor(LOOPBACK_ENV, url)).toMatch(message);
  });
});

describe("#2067 review 3 — a certificate Node does not trust is a STOP", () => {
  it.each(["SELF_SIGNED_CERT_IN_CHAIN", "UNABLE_TO_VERIFY_LEAF_SIGNATURE"])(
    "%s: one client, one connect attempt with verification on, and a STOP naming the Supabase root CA and NODE_EXTRA_CA_CERTS",
    async (code) => {
      pgCalls.failWith = code;
      const exitCode = await runDocumentCutoverCommand({
        argv: [],
        env: {
          ...HOSTED_ENV,
          DOCUMENT_CUTOVER_DATABASE_URL: `postgresql://${POOLER}?sslmode=verify-full`,
        },
      });

      expect(exitCode).toBe(1);
      expect(pgCalls.configs).toHaveLength(1);
      expect(pgCalls.connects).toBe(1);
      expect(pgCalls.configs[0]).toMatchObject({
        ssl: { rejectUnauthorized: true },
      });
      const text = output.join("\n");
      expect(text).toContain("Supabase Root 2021 CA");
      expect(text).toContain("NODE_EXTRA_CA_CERTS");
    },
  );
});
