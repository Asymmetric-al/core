import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";

import {
  createMigrationHealthHandler,
  supabaseProjectRefOf,
} from "../../../../../packages/api/src/health/migrations";
import { BUILD_MIGRATION_HEADS_ENV } from "../../../../../packages/api/src/health/release-contract.mjs";

const build = { supabase: "20261111164500", payload: "20261022_002412_x" };
const BYPASS = "bypass-secret-fixture";
/** A request as the release job sends it, with the deployment-protection bypass header. */
const fromReleaseJob = () =>
  new Request("https://admin-1.vercel.app/api/health/migrations", {
    headers: { "x-vercel-protection-bypass": BYPASS },
  });

function deps(
  result: { data?: unknown; error?: { code?: string; message: string } | null },
  over = {},
) {
  const rpc = vi.fn(async () => ({
    data: result.data ?? null,
    error: result.error ?? null,
  }));
  return {
    rpc,
    deps: {
      connection: vi.fn(async () => {}),
      getClient: () => ({ client: { rpc }, error: null }),
      readBuildHeads: () => JSON.stringify(build),
      readSupabaseUrl: () => "https://abcdefghijklmnopqrst.supabase.co",
      readRelease: () => ({
        commit: "a".repeat(40),
        environment: "production",
      }),
      readBypassSecret: () => BYPASS,
      ...over,
    },
  };
}

async function call(
  handler: (request?: Request) => Promise<Response>,
  request: Request | "none" = fromReleaseJob(),
) {
  const response = await handler(request === "none" ? undefined : request);
  return {
    status: response.status,
    body: await response.json(),
    headers: response.headers,
  };
}

describe("migration health route", () => {
  it("calls the release health function with the service key and passes an equal database", async () => {
    const { rpc, deps: d } = deps({
      data: { environment: "shared", expected_heads: build },
    });
    const { status, body, headers } = await call(
      createMigrationHealthHandler("admin", d),
    );
    expect(rpc).toHaveBeenCalledWith("platform_health");
    expect(d.connection).toHaveBeenCalled();
    expect(status).toBe(200);
    expect(headers.get("cache-control")).toBe("no-store");
    expect(body).toMatchObject({
      status: "ok",
      surface: "admin",
      database: {
        supabaseProjectRef: "abcdefghijklmnopqrst",
        environment: "shared",
      },
      release: { commit: "a".repeat(40) },
      migrations: {
        supabase: {
          build: build.supabase,
          database: build.supabase,
          state: "equal",
        },
      },
    });
  });

  it("blocks promotion when the database is behind the build", async () => {
    const { deps: d } = deps({
      data: {
        environment: "shared",
        expected_heads: { supabase: "20261110120000", payload: build.payload },
      },
    });
    const { status, body } = await call(
      createMigrationHealthHandler("donor", d),
    );
    expect(status).toBe(503);
    expect(body.status).toBe("behind");
    expect(body.migrations.supabase.state).toBe("behind");
  });

  it("stays healthy when the application is rolled back behind a later migration", async () => {
    const { deps: d } = deps({
      data: {
        environment: "shared",
        expected_heads: {
          supabase: "20271231000000",
          payload: "20271231_000000_later",
        },
      },
    });
    const { status, body } = await call(
      createMigrationHealthHandler("missionary", d),
    );
    expect(status).toBe(200);
    expect(body.migrations.supabase.state).toBe("ahead");
  });

  it("reports unknown, not ok, for a build that carries no heads", async () => {
    const { deps: d } = deps(
      { data: { environment: "shared", expected_heads: build } },
      { readBuildHeads: () => undefined },
    );
    const { status, body } = await call(
      createMigrationHealthHandler("admin", d),
    );
    expect(status).toBe(503);
    expect(body.status).toBe("unknown");
  });

  it("fails closed without leaking provider detail when the function or client is missing", async () => {
    const { deps: missing } = deps({
      error: {
        code: "PGRST202",
        message:
          "Could not find the function public.platform_health postgres://u:p@h/db",
      },
    });
    const missingResult = await call(
      createMigrationHealthHandler("admin", missing),
    );
    expect(missingResult.status).toBe(503);
    expect(missingResult.body).toMatchObject({
      status: "error",
      error: { code: "PGRST202" },
    });
    expect(JSON.stringify(missingResult.body)).not.toContain("postgres://");

    const { deps: noClient } = deps(
      {},
      { getClient: () => ({ client: null, error: "missing key" }) },
    );
    const noClientResult = await call(
      createMigrationHealthHandler("admin", noClient),
    );
    expect(noClientResult.status).toBe(503);
    expect(noClientResult.body.error).toEqual({
      code: "admin_client_unavailable",
    });

    const { deps: malformed } = deps({
      data: { environment: "staging", expected_heads: {} },
    });
    expect(
      (await call(createMigrationHealthHandler("admin", malformed))).body.error,
    ).toEqual({
      code: "malformed_release_health",
    });
  });

  // Council round 2, A6f: the route is public and uncached. A caller without
  // the release job's bypass header learns the status alone.
  it.each<[string, Request | "none", string | undefined]>([
    ["no request", "none", BYPASS],
    ["no bypass header", new Request("https://admin.asymmetric.al/x"), BYPASS],
    [
      "a wrong bypass header",
      new Request("https://admin.asymmetric.al/x", {
        headers: { "x-vercel-protection-bypass": `${BYPASS}x` },
      }),
      BYPASS,
    ],
    [
      "the header, on a deployment with no bypass secret",
      fromReleaseJob(),
      undefined,
    ],
  ])(
    "answers %s with the status alone, keeping 200 and 503",
    async (_name, request, secret) => {
      const equal = deps(
        { data: { environment: "shared", expected_heads: build } },
        { readBypassSecret: () => secret },
      ).deps;
      const ok = await call(
        createMigrationHealthHandler("admin", equal),
        request,
      );
      expect([ok.status, ok.body]).toEqual([200, { status: "ok" }]);
      expect(ok.headers.get("cache-control")).toBe("no-store");

      const behind = deps(
        {
          data: {
            environment: "shared",
            expected_heads: {
              supabase: "20261110120000",
              payload: build.payload,
            },
          },
        },
        { readBypassSecret: () => secret },
      ).deps;
      const late = await call(
        createMigrationHealthHandler("admin", behind),
        request,
      );
      expect([late.status, late.body]).toEqual([503, { status: "behind" }]);

      const broken = deps(
        { error: { code: "PGRST202", message: "missing" } },
        { readBypassSecret: () => secret },
      ).deps;
      const failed = await call(
        createMigrationHealthHandler("admin", broken),
        request,
      );
      expect([failed.status, failed.body]).toEqual([503, { status: "error" }]);
    },
  );

  it("reads the build heads through the literal variable Next.js inlines", () => {
    const source = readFileSync(
      "packages/api/src/health/migrations.ts",
      "utf8",
    );
    expect(source).toContain(`process.env.${BUILD_MIGRATION_HEADS_ENV}`);
  });

  it("derives the Supabase project ref from the public URL", () => {
    expect(
      supabaseProjectRefOf("https://abcdefghijklmnopqrst.supabase.co"),
    ).toBe("abcdefghijklmnopqrst");
    expect(supabaseProjectRefOf("http://127.0.0.1:54321")).toBe("local");
    expect(supabaseProjectRefOf("https://example.com")).toBeNull();
    expect(supabaseProjectRefOf(undefined)).toBeNull();
  });
});
