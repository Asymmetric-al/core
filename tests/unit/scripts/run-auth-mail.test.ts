import { describe, expect, it } from "vitest";

import {
  authMailEnvFromStatus,
  statusArguments,
} from "../../../scripts/e2e/run-auth-mail.mjs";

/**
 * Council round 2, B4: `bun run test:e2e:auth-mail` runs the Supabase Auth
 * email journeys against the local stack it finds, and fails, rather than
 * skipping every journey, when it cannot read that stack.
 */
const STATUS = [
  "==> Global Supabase CLI does not match 2.121.0; using pinned fallback.",
  'ANON_KEY="anon.jwt.value"',
  'API_URL="http://127.0.0.1:25321"',
  'DB_URL="postgresql://postgres:postgres@127.0.0.1:25322/postgres"',
  'MAILPIT_URL="http://127.0.0.1:25324"',
  'SERVICE_ROLE_KEY="service.jwt.value"',
  "Stopped services: [supabase_studio_core]",
].join("\n");

describe("the auth email suite's environment", () => {
  it("names the local stack's values as the apps and the journeys read them", () => {
    expect(authMailEnvFromStatus(STATUS)).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:25321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon.jwt.value",
      SUPABASE_SERVICE_ROLE_KEY: "service.jwt.value",
      E2E_AUTH_MAIL_URL: "http://127.0.0.1:25324",
      // AL-2675: the journeys give a person the membership an app needs,
      // which only the database holds (authz is not on the Data API).
      E2E_AUTH_MAIL_DB_URL:
        "postgresql://postgres:postgres@127.0.0.1:25322/postgres",
    });
  });

  it("refuses a stack that does not report every value, naming what is missing and no value", () => {
    const partial = STATUS.split("\n")
      .filter((line) => !line.startsWith("MAILPIT_URL"))
      .join("\n");
    expect(() => authMailEnvFromStatus(partial)).toThrow(/MAILPIT_URL/);
    expect(() => authMailEnvFromStatus(partial)).not.toThrow(/jwt\.value/);
    expect(() => authMailEnvFromStatus("")).toThrow(
      /bun run supabase -- start/,
    );
  });

  it("refuses a stack that is not on this machine", () => {
    expect(() =>
      authMailEnvFromStatus(
        STATUS.replace("http://127.0.0.1:25321", "https://abc.supabase.co"),
      ),
    ).toThrow(/local Supabase stack/);
    expect(() =>
      authMailEnvFromStatus(
        STATUS.replace("@127.0.0.1:25322", "@db.abc.supabase.co:5432"),
      ),
    ).toThrow(/DB_URL is not on this machine/);
  });

  // Council round 1, A18: libpq and node-postgres let the query replace the
  // host, so `127.0.0.1/postgres?host=db.example.com` connects elsewhere while
  // its hostname reads local. The journeys insert memberships through this
  // URL, so a routing override is refused, by the runner and by the journeys.
  it.each(["host", "hostaddr", "port", "dbname", "user", "service"])(
    "refuses a database URL whose query routes it elsewhere (%s)",
    async (key) => {
      const routed = `postgresql://postgres:postgres@127.0.0.1:25322/postgres?${key}=db.example.com`;
      expect(() =>
        authMailEnvFromStatus(
          STATUS.replace(
            "postgresql://postgres:postgres@127.0.0.1:25322/postgres",
            routed,
          ),
        ),
      ).toThrow(new RegExp(`DB_URL.*${key}`));

      const { readAuthMailEnv } = await import("../../e2e/helpers/auth-mail");
      expect(() =>
        readAuthMailEnv({
          NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:25321",
          NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
          SUPABASE_SERVICE_ROLE_KEY: "service",
          E2E_AUTH_MAIL_URL: "http://127.0.0.1:25324",
          E2E_AUTH_MAIL_DB_URL: routed,
        }),
      ).toThrow(new RegExp(key));
    },
  );

  it("reads the default stack, or the one AUTH_MAIL_SUPABASE_WORKDIR names", () => {
    expect(statusArguments({})).toEqual(["status", "-o", "env"]);
    expect(
      statusArguments({ AUTH_MAIL_SUPABASE_WORKDIR: "/tmp/stack-a" }),
    ).toEqual(["status", "-o", "env", "--workdir", "/tmp/stack-a"]);
  });
});
