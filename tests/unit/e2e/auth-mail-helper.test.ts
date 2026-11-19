import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createConfirmedUser,
  deleteUser,
  findUserIdByEmail,
  readAuthMailEnv,
  type AuthMailEnv,
} from "../../../tests/e2e/helpers/auth-mail";

/**
 * AL-2674, phase 15: the auth email helpers write memberships to the stack's
 * database through node-postgres, which follows a host in the URL's query
 * over the one the URL shows. They judge that database the way every
 * local-only tool does, with isLoopbackDatabaseUrl
 * (packages/env/src/database-url.mjs), never by its host name alone.
 */
const LOCAL = {
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:25321",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon.jwt.value",
  SUPABASE_SERVICE_ROLE_KEY: "service.jwt.value",
  E2E_AUTH_MAIL_URL: "http://127.0.0.1:25324",
  E2E_AUTH_MAIL_DB_URL:
    "postgresql://postgres:postgres@127.0.0.1:25322/postgres",
};

/** A loopback host name whose query sends node-postgres elsewhere. */
const QUERY_HOSTS = [
  [
    "a query host",
    "postgresql://postgres:postgres@127.0.0.1:25322/postgres?host=db.abc.supabase.co",
  ],
  [
    "a query host address",
    "postgresql://postgres:postgres@127.0.0.1:25322/postgres?hostaddr=203.0.113.9",
  ],
  [
    "a socket directory as the query host",
    "postgresql://postgres:postgres@127.0.0.1:25322/postgres?host=%2Fnonexistent-auth-mail",
  ],
] as const;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the auth email helpers' database", () => {
  it("accepts the local stack's database", () => {
    expect(readAuthMailEnv(LOCAL)?.dbUrl).toBe(LOCAL.E2E_AUTH_MAIL_DB_URL);
  });

  it.each(QUERY_HOSTS)("refuses a database with %s", (_case, dbUrl) => {
    expect(() =>
      readAuthMailEnv({ ...LOCAL, E2E_AUTH_MAIL_DB_URL: dbUrl }),
    ).toThrow(/only against a local Supabase stack/);
  });

  // The write itself checks too: an AuthMailEnv can be built by hand. The
  // query host here is a socket directory that does not exist, so even
  // without the check nothing leaves this machine.
  it("writes no membership to a database with a query host", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ id: "user-1" }))),
    );
    const env: AuthMailEnv = {
      supabaseUrl: LOCAL.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: LOCAL.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: LOCAL.SUPABASE_SERVICE_ROLE_KEY,
      mailUrl: LOCAL.E2E_AUTH_MAIL_URL,
      dbUrl: QUERY_HOSTS[2][1],
    };
    await expect(
      createConfirmedUser(env, {
        email: "auth-mail@example.test",
        password: "a phrase",
        membership: {
          role: "missionary",
          tenantId: "00000000-0000-0000-0000-000000000001",
        },
      }),
    ).rejects.toThrow(/only against a local Supabase stack/);
  });
});

// Phase 16, Q6: the Auth admin writes carry the service-role key over HTTP,
// so they check the hand-built environment's Supabase address as the
// database write checks its database. fetch is stubbed, so even without the
// check nothing leaves this machine.
describe("the auth email helpers' service-role requests", () => {
  const hosted: AuthMailEnv = {
    supabaseUrl: "https://abc.supabase.co",
    anonKey: LOCAL.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: LOCAL.SUPABASE_SERVICE_ROLE_KEY,
    mailUrl: LOCAL.E2E_AUTH_MAIL_URL,
    dbUrl: null,
  };

  it.each([
    [
      "createConfirmedUser",
      () =>
        createConfirmedUser(hosted, {
          email: "auth-mail@example.test",
          password: "a phrase",
          membership: { role: "donor" },
        }),
    ],
    ["deleteUser", () => deleteUser(hosted, "user-1")],
    [
      "findUserIdByEmail",
      () => findUserIdByEmail(hosted, "auth-mail@example.test"),
    ],
  ])(
    "%s sends nothing to a Supabase address not on this machine",
    async (_name, call) => {
      const fetch = vi.fn(
        async () => new Response(JSON.stringify({ id: "user-1" })),
      );
      vi.stubGlobal("fetch", fetch);
      await expect(call()).rejects.toThrow(
        /only against a local Supabase stack, not abc\.supabase\.co/,
      );
      expect(fetch).not.toHaveBeenCalled();
    },
  );
});
