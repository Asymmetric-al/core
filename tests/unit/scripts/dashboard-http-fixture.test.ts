import { execFile } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { request } from "node:http";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { createClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  FIXTURE_SERVICE_KEY,
  FIXTURE_TENANT_ID,
  startDashboardHttpFixture,
} from "../../../docs/qa/admin-workspaces-hillclimb/review/round13/runtime/loaded-giving-fixture/server.mjs";
import { getDashboardStats } from "../../../packages/api/src/reads/dashboard-stats";

const { getAdminClientMock } = vi.hoisted(() => ({
  getAdminClientMock: vi.fn(),
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));

const AS_OF = "2026-11-12T12:00:00.000Z";
const GIFT_SELECT =
  "id,amount,refund_amount,currency,status,gift_date,created_at";
const CORRECTION_SELECT =
  "id,donation_id,adjustment_type,status,effective_values,reason,actor_profile_id,source_surface,created_at";
const CORRECTED_GIFT_ID = "10000000-0000-4000-8000-000000000037";
const running: Array<Awaited<ReturnType<typeof startDashboardHttpFixture>>> =
  [];
const fixtureDirectory = new URL(
  "../../../docs/qa/admin-workspaces-hillclimb/review/round13/runtime/loaded-giving-fixture/",
  import.meta.url,
);

async function fixtureRequest(
  fixture: (typeof running)[number],
  path: string,
  options: RequestInit = {},
) {
  return fetch(fixture.baseUrl + path, {
    ...options,
    signal: AbortSignal.timeout(3000),
    headers: {
      apikey: FIXTURE_SERVICE_KEY,
      authorization: `Bearer ${FIXTURE_SERVICE_KEY}`,
      ...Object.fromEntries(new Headers(options.headers)),
    },
  });
}

function giftPath(offset = 0, limit = 1000): string {
  return (
    "/rest/v1/donations?" +
    new URLSearchParams({
      select: GIFT_SELECT,
      tenant_id: `eq.${FIXTURE_TENANT_ID}`,
      or: "(gift_date.gte.2025-11-01,and(gift_date.is.null,created_at.gte.2025-11-01T00:00:00.000Z))",
      order: "id.asc",
      offset: String(offset),
      limit: String(limit),
    })
  );
}

function correctionPath(offset = 0, donationId = CORRECTED_GIFT_ID): string {
  return (
    "/rest/v1/contribution_adjustments?" +
    new URLSearchParams({
      select: CORRECTION_SELECT,
      tenant_id: `eq.${FIXTURE_TENANT_ID}`,
      status: "eq.applied",
      donation_id: `in.(${donationId})`,
      order: "created_at.asc,id.asc",
      offset: String(offset),
      limit: "1000",
    })
  );
}

afterEach(async () => {
  await Promise.all(running.splice(0).map((fixture) => fixture.close()));
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("round13 local dashboard HTTP fixture", () => {
  it("runs the operator helper only for a bounded lifetime and emits matching start/close proof", async () => {
    const { stdout } = await promisify(execFile)(
      process.execPath,
      [
        fileURLToPath(new URL("run.mjs", fixtureDirectory)),
        "--as-of",
        AS_OF,
        "--lifetime-ms",
        "50",
        "--max-requests",
        "8",
      ],
      {
        timeout: 5000,
        env: {
          PATH: process.env.PATH,
          SystemRoot: process.env.SystemRoot,
          NODE_ENV: "test",
        },
      },
    );
    const [started, closed] = stdout
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));

    expect(started).toMatchObject({
      event: "started",
      fixture: { lifetimeMs: 50, maxRequests: 8, syntheticOnly: true },
    });
    expect(closed).toMatchObject({
      event: "closed",
      fixture: { runId: started.fixture.runId },
      requests: [],
    });
    await expect(
      fetch(started.fixture.baseUrl, { signal: AbortSignal.timeout(1000) }),
    ).rejects.toThrow();
  });

  it("expires its listener and closes every owned connection", async () => {
    const fixture = await startDashboardHttpFixture({
      asOf: AS_OF,
      lifetimeMs: 30,
    });
    running.push(fixture);

    await fixture.closed;

    await expect(fixtureRequest(fixture, giftPath())).rejects.toThrow();
    await fixture.close();
  });

  it("loads through the unmocked admin client factory in an env-isolated Bun process", async () => {
    const fixture = await startDashboardHttpFixture({
      asOf: new Date().toISOString().slice(0, 7) + "-01T00:00:00.000Z",
    });
    running.push(fixture);
    const { stdout } = await promisify(execFile)(
      "bun",
      [
        "--no-env-file",
        fileURLToPath(new URL("probe.ts", fixtureDirectory)),
        fixture.baseUrl,
        fixture.proof.runId,
        fixture.proof.dataSha256,
      ],
      {
        cwd: fileURLToPath(new URL("../../../", import.meta.url)),
        timeout: 15000,
        maxBuffer: 1024 * 1024,
        env: {
          PATH: process.env.PATH,
          SystemRoot: process.env.SystemRoot,
          NODE_ENV: "test",
          SKIP_ENV_VALIDATION: "1",
          NEXT_PUBLIC_SUPABASE_URL: fixture.baseUrl,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: "round13-local-placeholder-anon",
          SUPABASE_SERVICE_ROLE_KEY: FIXTURE_SERVICE_KEY,
        },
      },
    );
    const probe = JSON.parse(stdout);

    expect(probe).toMatchObject({
      fixtureId: "round13-loaded-giving-v1",
      baseUrl: fixture.baseUrl,
      runId: fixture.proof.runId,
      dataSha256: fixture.proof.dataSha256,
      adminFactory: "unmocked",
      stats: { crmRecordCount: 48, revenueThisMonthCents: 25000 },
    });
    expect(probe.stats.givingTrend.months).toHaveLength(13);
    expect(fixture.requests).toHaveLength(7);
    expect(fixture.requests.every((entry) => entry.status === 200)).toBe(true);
    expect(
      fixture.requests.every((entry) => entry.path?.startsWith("/rest/v1/")),
    ).toBe(true);
    if (process.env.CORE_QA_HTTP_PROOF === "1") {
      await writeFile(
        new URL(
          `logs/http-proof-${fixture.proof.runId}.json`,
          fixtureDirectory,
        ),
        JSON.stringify(
          { fixture: fixture.proof, probe, requests: fixture.requests },
          null,
          2,
        ) + "\n",
        { flag: "wx" },
      );
    }
  });

  it("returns exact HEAD counts without a body and tags HTTP results with fixture provenance", async () => {
    const fixture = await startDashboardHttpFixture({ asOf: AS_OF });
    running.push(fixture);
    const response = await fixtureRequest(
      fixture,
      `/rest/v1/donors?select=id&tenant_id=eq.${FIXTURE_TENANT_ID}`,
      { method: "HEAD", headers: { Prefer: "count=exact" } },
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("");
    expect(response.headers.get("content-range")).toBe("0-47/48");
    expect(response.headers.get("range-unit")).toBe("items");
    expect(response.headers.get("preference-applied")).toBe("count=exact");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-core-qa-fixture")).toBe(
      "round13-loaded-giving-v1",
    );
    expect(response.headers.get("x-core-qa-fixture-run")).toBe(
      fixture.proof.runId,
    );
    expect(response.headers.get("x-core-qa-fixture-sha256")).toBe(
      fixture.proof.dataSha256,
    );
    expect(fixture.proof.dataSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(fixture.requests)).not.toContain(FIXTURE_SERVICE_KEY);
  });

  it("projects raw immutable money rows, filters corrections, and terminates offset paging", async () => {
    const fixture = await startDashboardHttpFixture({ asOf: AS_OF });
    running.push(fixture);
    const gifts = await fixtureRequest(fixture, giftPath(36, 2));
    expect(gifts.headers.get("content-range")).toBe("36-37/*");
    expect(await gifts.json()).toEqual([
      {
        id: CORRECTED_GIFT_ID,
        amount: 10000,
        refund_amount: 1000,
        currency: "USD",
        status: "completed",
        gift_date: null,
        created_at: "2026-11-01T00:00:00.000Z",
      },
      {
        id: "10000000-0000-4000-8000-000000000038",
        amount: 6000,
        refund_amount: 0,
        currency: "USD",
        status: "succeeded",
        gift_date: null,
        created_at: "2026-11-01T00:00:00.000Z",
      },
    ]);
    const corrections = await fixtureRequest(fixture, correctionPath());
    expect(await corrections.json()).toEqual([
      {
        id: "20000000-0000-4000-8000-000000000001",
        donation_id: CORRECTED_GIFT_ID,
        adjustment_type: "amount_correction",
        status: "applied",
        effective_values: { amountCents: 8000 },
        reason: "Synthetic QA amount correction, not a provider operation.",
        actor_profile_id: "30000000-0000-4000-8000-000000000001",
        source_surface: "qa_fixture",
        created_at: "2026-11-01T00:00:00.000Z",
      },
    ]);
    const terminal = await fixtureRequest(fixture, correctionPath(1));
    expect(terminal.status).toBe(200);
    expect(terminal.headers.get("content-range")).toBe("*/*");
    expect(await terminal.json()).toEqual([]);
    expect(
      await (await fixtureRequest(fixture, giftPath(1000))).json(),
    ).toEqual([]);
    expect(
      await (await fixtureRequest(fixture, giftPath(39, 1))).json(),
    ).toMatchObject([{ amount: 5000, refund_amount: 5000 }]);
  });

  it("returns unsettled candidates so applied corrections can determine membership", async () => {
    const fixture = await startDashboardHttpFixture({ asOf: AS_OF });
    running.push(fixture);
    const response = await fixtureRequest(fixture, giftPath(40, 3));

    expect(response.status).toBe(200);
    expect(
      (await response.json()).map((row: { status: string }) => row.status),
    ).toEqual(["pending", "failed", "canceled"]);
    const corrections = await fixtureRequest(
      fixture,
      correctionPath(0, "10000000-0000-4000-8000-000000000041"),
    );
    expect(corrections.status).toBe(200);
    expect(await corrections.json()).toEqual([]);
  });

  it.each<[string, () => string, number]>([
    [
      "missing tenant",
      () => giftPath().replace(`tenant_id=eq.${FIXTURE_TENANT_ID}&`, ""),
      403,
    ],
    [
      "unknown tenant",
      () =>
        giftPath().replace(
          FIXTURE_TENANT_ID,
          "00000000-0000-0000-0000-000000000099",
        ),
      403,
    ],
    [
      "duplicate tenant",
      () => giftPath() + `&tenant_id=eq.${FIXTURE_TENANT_ID}`,
      400,
    ],
    [
      "raw-status prefilter",
      () => giftPath() + "&status=in.(completed,succeeded,success)",
      400,
    ],
    [
      "noncanonical date window",
      () => giftPath().replaceAll("2025-11-01", "2025-10-01"),
      400,
    ],
    [
      "unbounded page",
      () => giftPath().replace("limit=1000", "limit=1001"),
      400,
    ],
    ["negative page", () => giftPath(-1), 400],
    ["noninteger page", () => giftPath(0, 1.5), 400],
    ["unscoped query", () => giftPath() + "&or=(tenant_id.neq.fixture)", 400],
    [
      "wildcard projection",
      () => giftPath().replace(encodeURIComponent(GIFT_SELECT), "*"),
      400,
    ],
    [
      "reversed corrections",
      () => correctionPath().replace("eq.applied", "eq.reversed"),
      400,
    ],
    [
      "unloaded correction ID",
      () => correctionPath(0, "10000000-0000-4000-8000-000000000045"),
      403,
    ],
    ["auth provider", () => "/auth/v1/user", 404],
    ["RPC", () => "/rest/v1/rpc/dashboard", 404],
    ["unknown table", () => "/rest/v1/profiles", 404],
  ])("rejects %s over HTTP", async (_label, path, expectedStatus) => {
    const fixture = await startDashboardHttpFixture({ asOf: AS_OF });
    running.push(fixture);
    const response = await fixtureRequest(fixture, path());
    expect(response.status).toBe(expectedStatus);
    expect(await response.json()).toMatchObject({ code: "CORE_QA_FIXTURE" });
  });

  it.each(["POST", "PUT", "PATCH", "DELETE", "OPTIONS"])(
    "rejects %s without changing money rows",
    async (method) => {
      const fixture = await startDashboardHttpFixture({ asOf: AS_OF });
      running.push(fixture);
      const response = await fixtureRequest(fixture, giftPath(), { method });
      expect(response.status).toBe(405);
      expect(response.headers.get("allow")).toBe("GET, HEAD");
      expect(
        await (await fixtureRequest(fixture, giftPath(36, 1))).json(),
      ).toMatchObject([{ amount: 10000, refund_amount: 1000 }]);
    },
  );

  it.each([
    ["foreign Origin", { origin: "https://tenant.invalid" }, 403],
    ["forwarded host", { "x-forwarded-host": "tenant.invalid" }, 403],
    ["different schema", { "accept-profile": "private" }, 403],
    ["wrong credential", { apikey: "not-a-fixture-key" }, 401],
    ["wrong bearer", { authorization: "Bearer not-a-fixture-key" }, 401],
    [
      "object negotiation",
      { accept: "application/vnd.pgrst.object+json" },
      406,
    ],
  ] as const)(
    "rejects %s without an external request",
    async (_label, headers, expectedStatus) => {
      const fixture = await startDashboardHttpFixture({ asOf: AS_OF });
      running.push(fixture);
      expect(
        (await fixtureRequest(fixture, giftPath(), { headers })).status,
      ).toBe(expectedStatus);
    },
  );

  it("rejects a nonlocal Host while connecting only to its ephemeral loopback socket", async () => {
    const fixture = await startDashboardHttpFixture({ asOf: AS_OF });
    running.push(fixture);
    const status = await new Promise<number | undefined>(
      (resolve, rejectRequest) => {
        const outgoing = request(
          fixture.baseUrl + giftPath(),
          {
            headers: {
              host: "tenant.invalid",
              apikey: FIXTURE_SERVICE_KEY,
              authorization: `Bearer ${FIXTURE_SERVICE_KEY}`,
            },
            signal: AbortSignal.timeout(3000),
          },
          (response) => {
            response.resume();
            response.once("end", () => resolve(response.statusCode));
          },
        );
        outgoing.once("error", rejectRequest);
        outgoing.end();
      },
    );
    expect(status).toBe(403);
  });

  it("bounds request count and closes its own sockets idempotently", async () => {
    const fixture = await startDashboardHttpFixture({
      asOf: AS_OF,
      maxRequests: 1,
    });
    running.push(fixture);
    expect((await fixtureRequest(fixture, giftPath())).status).toBe(200);
    expect((await fixtureRequest(fixture, giftPath())).status).toBe(429);
    expect(fixture.requests).toHaveLength(1);
    await Promise.all([fixture.close(), fixture.close()]);
    await expect(fixtureRequest(fixture, giftPath())).rejects.toThrow();
  });

  it.each([
    { host: "0.0.0.0" },
    { host: "tenant.invalid" },
    { port: 443 },
    { port: -1 },
    { asOf: "not-a-date" },
    { asOf: "2026-11-12T12:00:00+00:00" },
    { lifetimeMs: 900001 },
    { maxRequests: 1025 },
    { scenario: "mixed-with-hidden-writes" },
  ])("rejects unsafe startup options %j before binding", async (options) => {
    await expect(
      startDashboardHttpFixture({ asOf: AS_OF, ...options }),
    ).rejects.toThrow();
  });

  it("keeps the dataset deterministic across runs and UTC January rollover", async () => {
    const first = await startDashboardHttpFixture({ asOf: AS_OF });
    running.push(first);
    const second = await startDashboardHttpFixture({ asOf: AS_OF });
    running.push(second);
    expect(first.proof.dataSha256).toBe(second.proof.dataSha256);
    expect(first.proof.runId).not.toBe(second.proof.runId);
    const january = await startDashboardHttpFixture({
      asOf: "2027-01-01T00:00:00.000Z",
    });
    running.push(january);
    getAdminClientMock.mockReturnValue({
      client: createClient(january.baseUrl, FIXTURE_SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      }),
      error: null,
    });
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2027-01-01T00:00:00.000Z"));
    const stats = await getDashboardStats(FIXTURE_TENANT_ID);
    expect(stats.givingTrend.months[0]?.month).toBe("2026-01");
    expect(stats.givingTrend.months.at(-1)).toEqual({
      month: "2027-01",
      soFar: true,
      giftCount: 4,
      netCents: 25000,
    });
  });

  it("rejects a Range header instead of silently overriding the SDK offset/limit", async () => {
    const fixture = await startDashboardHttpFixture({ asOf: AS_OF });
    running.push(fixture);

    const response = await fixtureRequest(fixture, giftPath(0, 1), {
      headers: { Range: "1000-1999" },
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: "CORE_QA_FIXTURE" });
  });

  it("fails the whole read when the explicitly selected correction outage returns HTTP 503", async () => {
    const fixture = await startDashboardHttpFixture({
      asOf: AS_OF,
      scenario: "adjustments-unavailable",
    });
    running.push(fixture);
    const client = createClient(fixture.baseUrl, FIXTURE_SERVICE_KEY, {
      db: { retry: false, timeout: 3000 },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    getAdminClientMock.mockReturnValue({ client, error: null });
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(AS_OF));

    await expect(getDashboardStats(FIXTURE_TENANT_ID)).rejects.toThrow(
      "Synthetic dashboard corrections unavailable.",
    );
    expect(
      fixture.requests.some(
        (request) =>
          request.path === "/rest/v1/contribution_adjustments" &&
          request.status === 503,
      ),
    ).toBe(true);
    expect(fixture.proof.scenario).toBe("adjustments-unavailable");
  });

  it("loads the unchanged dashboard read through real Supabase HTTP requests", async () => {
    const fixture = await startDashboardHttpFixture({ asOf: AS_OF });
    running.push(fixture);
    const client = createClient(fixture.baseUrl, FIXTURE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    getAdminClientMock.mockReturnValue({ client, error: null });
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(AS_OF));

    const stats = await getDashboardStats(FIXTURE_TENANT_ID);

    expect(stats).toMatchObject({
      crmRecordCount: 48,
      totalMissionaries: 12,
      totalDonationsThisMonth: 4,
      revenueThisMonthCents: 25_000,
      activeFundsCount: 4,
      givingTrend: {
        periodStart: "2025-11-01T00:00:00.000Z",
        asOf: AS_OF,
        currency: "USD",
        currencies: ["USD"],
      },
    });
    expect(stats.givingTrend.months.map((month) => month.netCents)).toEqual([
      125_000, 142_500, 137_500, 168_000, 155_000, 181_000, 174_000, 192_500,
      210_000, 205_000, 223_000, 240_000, 25_000,
    ]);
    expect(stats.givingTrend.months.map((month) => month.giftCount)).toEqual([
      3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4,
    ]);
    expect(stats.givingTrend.months.map((month) => month.soFar)).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
    ]);
    expect(fixture.requests).toHaveLength(6);
    expect(
      fixture.requests.filter((request) => request.method === "HEAD"),
    ).toHaveLength(3);
    expect(fixture.requests.every((request) => request.status === 200)).toBe(
      true,
    );
    expect(
      fixture.requests.every(
        (request) => request.tenantId === FIXTURE_TENANT_ID,
      ),
    ).toBe(true);
  });
});
