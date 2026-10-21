import { describe, expect, it, vi } from "vitest";

import { verifyStripeDataPipeline } from "../../../scripts/verify/stripe-data-pipeline.mjs";

const expectations = {
  projectRef: "developmentfixture",
  accountId: "acct_fixture",
  sandboxId: "sandbox_fixture",
  schema: "provider_fixture",
  owner: "provider_owner",
  tables: ["customers", "payment_intents", "charges"],
  fixtures: [],
};
const environment = {
  SUPABASE_DB_URL:
    "postgresql://postgres.developmentfixture:fake-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require",
  NEXT_PUBLIC_SUPABASE_URL: "https://developmentfixture.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "fake-public-key",
};

function catalog() {
  return {
    schemaOwner: "provider_owner",
    roles: ["anon", "authenticated"],
    realtime: false,
    tables: expectations.tables.map((name) => ({
      name,
      owner: "provider_owner",
      columns: [
        "id",
        "_account_id",
        "_updated_at",
        "metadata",
        "livemode",
        ...(name === "customers" ? [] : ["amount", "currency", "status"]),
      ],
      readableBy: [] as string[],
    })),
  };
}

type ObservationData = {
  tables: {
    table: string;
    rows: string;
    wrongAccount: string;
    liveRows: string | null;
  }[];
  fixtures: { found: boolean; matched: boolean }[];
};
function emptyData(): ObservationData {
  return {
    tables: expectations.tables.map((table) => ({
      table,
      rows: "0",
      wrongAccount: "0",
      liveRows: "0",
    })),
    fixtures: [],
  };
}
function dependencies(data = emptyData(), catalogResult = catalog()) {
  const spawn = vi
    .fn()
    .mockReturnValueOnce({ status: 0, stdout: JSON.stringify(catalogResult) })
    .mockReturnValueOnce({ status: 0, stdout: JSON.stringify(data) });
  const fetch = vi.fn().mockResolvedValue({
    status: 406,
    json: async () => ({ code: "PGRST106" }),
  });
  return { environment, spawn, fetch };
}

describe("Stripe Data Pipeline verifier", () => {
  it("rejects a different destination before opening a connection", async () => {
    const spawn = vi.fn();
    await expect(
      verifyStripeDataPipeline(expectations, {
        environment: {
          ...environment,
          SUPABASE_DB_URL: environment.SUPABASE_DB_URL.replace(
            "postgres.developmentfixture",
            "postgres.other",
          ),
        },
        spawn,
      }),
    ).rejects.toThrow("expected Supabase project");
    expect(spawn).not.toHaveBeenCalled();
  });

  it("keeps credentials out of argv and uses bounded read-only SQL without ambient routing", async () => {
    const deps = dependencies();
    const result = await verifyStripeDataPipeline(expectations, {
      ...deps,
      environment: {
        ...environment,
        PGHOSTADDR: "another-host",
        PGSERVICE: "other",
        PGOPTIONS: "-c default_transaction_read_only=off",
      },
    });
    expect(result.checks).toEqual({
      structure: "passed",
      privacy: "passed",
      backfill: "incomplete",
      ongoing: "incomplete",
    });
    expect(result.exitCode).toBe(2);
    const [, args, options] = deps.spawn.mock.calls[0];
    expect(JSON.stringify(args)).not.toContain("fake-password");
    expect(args).toContain("--no-password");
    expect(options.shell).toBe(false);
    expect(options.timeout).toBe(30_000);
    expect(options.env).toMatchObject({
      PGCONNECT_TIMEOUT: "5",
      PGPASSWORD: "fake-password",
      PGSSLMODE: "require",
    });
    expect(options.env.PGOPTIONS).toContain("default_transaction_read_only=on");
    expect(options.env.PGHOSTADDR).toBeUndefined();
    expect(options.env.PGSERVICE).toBeUndefined();
    expect(options.input).toContain("BEGIN READ ONLY;");
    expect(options.input).toContain("statement_timeout = '10s'");
    expect(options.input).toContain("ROLLBACK;");
    expect(JSON.stringify(result)).not.toContain("fake-password");
  });

  it("observes preactivation backfill and a subsequent synthetic customer change independently", async () => {
    const fixtureExpectations = {
      ...expectations,
      activatedAt: "2026-10-21T01:00:00Z",
      fixtures: [
        {
          phase: "backfill",
          table: "payment_intents",
          id: "pi_fixture",
          sourceObservedAt: "2026-10-21T00:59:00Z",
          expected: {
            amount: "9007199254740993",
            currency: "usd",
            status: "succeeded",
          },
        },
        {
          phase: "ongoing",
          table: "customers",
          id: "cus_fixture",
          sourceChangedAt: "2026-10-21T01:01:00Z",
          metadata: { key: "core_pipeline_probe", value: "probe-20261021" },
        },
      ],
    };
    const deps = dependencies({
      tables: expectations.tables.map((table) => ({
        table,
        rows: "1",
        wrongAccount: "0",
        liveRows: "0",
      })),
      fixtures: [
        { found: true, matched: true },
        { found: true, matched: true },
      ],
    });
    const result = await verifyStripeDataPipeline(fixtureExpectations, deps);
    expect(result.exitCode).toBe(0);
    expect(result.checks).toEqual({
      structure: "passed",
      privacy: "passed",
      backfill: "observed",
      ongoing: "observed",
    });
    const sql = deps.spawn.mock.calls[1][2].input;
    expect(sql).toContain("9007199254740993");
    expect(sql).toContain("_updated_at");
    expect(sql).toContain("metadata ->>");
    expect(JSON.stringify(result)).not.toContain("probe-20261021");
  });

  it.each([
    "host=other",
    "hostaddr=127.0.0.1",
    "user=other",
    "dbname=other",
    "service=other",
    "options=-c%20default_transaction_read_only=off",
    "sslmode=disable",
  ])("rejects connection option %s before connecting", async (option) => {
    const deps = dependencies();
    await expect(
      verifyStripeDataPipeline(expectations, {
        ...deps,
        environment: {
          ...environment,
          SUPABASE_DB_URL: `${environment.SUPABASE_DB_URL}&${option}`,
        },
      }),
    ).rejects.toThrow("options are forbidden");
    expect(deps.spawn).not.toHaveBeenCalled();
  });

  it.each([
    { schema: "public" },
    { schema: 'provider";DROP SCHEMA public;--' },
    { owner: "owner'" },
    { accountId: "acct_fixture'" },
    { tables: ["customers", "customers"] },
    { tables: ["invoices"] },
  ])(
    "rejects unsafe or unsupported expectations before connecting: %j",
    async (override) => {
      const deps = dependencies();
      await expect(
        verifyStripeDataPipeline({ ...expectations, ...override }, deps),
      ).rejects.toThrow();
      expect(deps.spawn).not.toHaveBeenCalled();
    },
  );

  it("has no CMS fallback and rejects mismatched public endpoints before connecting", async () => {
    const deps = dependencies();
    await expect(
      verifyStripeDataPipeline(expectations, {
        ...deps,
        environment: { PAYLOAD_DATABASE_URI: environment.SUPABASE_DB_URL },
      }),
    ).rejects.toThrow("SUPABASE_DB_URL is required");
    await expect(
      verifyStripeDataPipeline(expectations, {
        ...deps,
        environment: {
          ...environment,
          NEXT_PUBLIC_SUPABASE_URL: "https://other.supabase.co",
        },
      }),
    ).rejects.toThrow("expected Supabase project");
    expect(deps.spawn).not.toHaveBeenCalled();
  });

  it.each(["wrongAccount", "liveRows"] as const)(
    "fails source verification for %s",
    async (field) => {
      const data = emptyData();
      data.tables[1][field] = "1";
      const result = await verifyStripeDataPipeline(
        expectations,
        dependencies(data),
      );
      expect(result.exitCode).toBe(1);
      expect(result.checks.structure).toBe("failed");
      expect(result.checks.backfill).toBe("incomplete");
    },
  );

  it.each(["schemaOwner", "tableOwner", "missingTable", "missingColumn"])(
    "fails structural drift: %s",
    async (change) => {
      const inventory = catalog();
      if (change === "schemaOwner") inventory.schemaOwner = "other";
      if (change === "tableOwner") inventory.tables[0].owner = "other";
      if (change === "missingTable") inventory.tables.pop();
      if (change === "missingColumn") inventory.tables[0].columns = ["id"];
      const deps = dependencies(emptyData(), inventory);
      const result = await verifyStripeDataPipeline(expectations, deps);
      expect(result.exitCode).toBe(1);
      expect(result.checks.structure).toBe("failed");
      expect(deps.spawn).toHaveBeenCalledTimes(1);
    },
  );

  it.each(["roleRead", "realtime", "missingRole"])(
    "fails catalog privacy: %s",
    async (change) => {
      const inventory = catalog();
      if (change === "roleRead")
        inventory.tables[0].readableBy = ["authenticated"];
      if (change === "realtime") inventory.realtime = true;
      if (change === "missingRole") inventory.roles.pop();
      const result = await verifyStripeDataPipeline(
        expectations,
        dependencies(emptyData(), inventory),
      );
      expect(result.exitCode).toBe(1);
      expect(result.checks.privacy).toBe("failed");
    },
  );

  it.each([
    [200, {}, "failed"],
    [403, { code: "42501" }, "failed"],
    [401, { code: "invalid_key" }, "incomplete"],
    [503, {}, "incomplete"],
  ])(
    "requires hosted schema exclusion, HTTP %s => %s",
    async (status, body, check) => {
      const deps = dependencies();
      deps.fetch.mockResolvedValue({ status, json: async () => body });
      const result = await verifyStripeDataPipeline(expectations, deps);
      expect(result.checks.privacy).toBe(check);
      const [url, options] = deps.fetch.mock.calls[0];
      expect(url).toBe("https://developmentfixture.supabase.co/rest/v1/");
      expect(options.headers["Accept-Profile"]).toBe("provider_fixture");
      expect(options.redirect).toBe("error");
    },
  );

  it("does not claim privacy from missing public configuration or network failure", async () => {
    for (const missing of [true, false]) {
      const deps = dependencies();
      deps.fetch.mockRejectedValue(new Error("sensitive upstream body"));
      const result = await verifyStripeDataPipeline(expectations, {
        ...deps,
        environment: missing
          ? { SUPABASE_DB_URL: environment.SUPABASE_DB_URL }
          : environment,
      });
      expect(result.checks.privacy).toBe("incomplete");
      expect(result.exitCode).toBe(2);
      expect(JSON.stringify(result)).not.toContain("sensitive");
    }
  });

  it("does not assume a refunds livemode column", async () => {
    const inventory = catalog();
    inventory.tables = [
      {
        name: "refunds",
        owner: "provider_owner",
        columns: ["id", "_account_id"],
        readableBy: [],
      },
    ];
    const deps = dependencies(
      {
        tables: [
          { table: "refunds", rows: "0", wrongAccount: "0", liveRows: null },
        ],
        fixtures: [],
      },
      inventory,
    );
    const result = await verifyStripeDataPipeline(
      { ...expectations, tables: ["refunds"] },
      deps,
    );
    expect(result.checks.structure).toBe("passed");
    expect(deps.spawn.mock.calls[1][2].input).not.toContain("WHERE livemode");
  });

  it("redacts psql stderr, thrown errors, and malformed JSON", async () => {
    for (const output of [
      { status: 1, stderr: "fake-password" },
      { status: null, error: new Error("fake-password") },
      { status: 0, stdout: "fake-password" },
    ]) {
      const spawn = vi.fn().mockReturnValue(output);
      await expect(
        verifyStripeDataPipeline(expectations, { environment, spawn }),
      ).rejects.toThrow(/Database inspection/);
      try {
        await verifyStripeDataPipeline(expectations, { environment, spawn });
      } catch (error) {
        expect(String(error)).not.toContain("fake-password");
      }
    }
  });

  it("does not accept missing project or financial status expectations", async () => {
    const deps = dependencies();
    await expect(
      verifyStripeDataPipeline(
        { ...expectations, projectRef: undefined },
        deps,
      ),
    ).rejects.toThrow("projectRef");
    await expect(
      verifyStripeDataPipeline(
        {
          ...expectations,
          activatedAt: "2026-10-21T01:00:00Z",
          fixtures: [
            {
              phase: "backfill",
              table: "payment_intents",
              id: "pi_fixture",
              sourceObservedAt: "2026-10-21T00:59:00Z",
              expected: { amount: "100", currency: "usd" },
            },
          ],
        },
        deps,
      ),
    ).rejects.toThrow("status");
    expect(deps.spawn).not.toHaveBeenCalled();
  });

  it("redacts a synchronous process-launch exception", async () => {
    const spawn = vi.fn().mockImplementation(() => {
      throw new Error("fake-password");
    });
    await expect(
      verifyStripeDataPipeline(expectations, { environment, spawn }),
    ).rejects.toThrow("Database inspection failed");
  });

  it("does not complete financial backfill from only a customer fixture", async () => {
    const expected = {
      ...expectations,
      activatedAt: "2026-10-21T01:00:00Z",
      fixtures: [
        {
          phase: "backfill",
          table: "customers",
          id: "cus_fixture",
          sourceObservedAt: "2026-10-21T00:59:00Z",
          expected: {},
        },
      ],
    };
    const data = emptyData();
    data.fixtures = [{ found: true, matched: true }];
    const result = await verifyStripeDataPipeline(expected, dependencies(data));
    expect(result.checks.backfill).toBe("incomplete");
    expect(result.exitCode).toBe(2);
  });

  it("compares safe optional financial linkage IDs from actual columns", async () => {
    const inventory = catalog();
    inventory.tables[1].columns.push("latest_charge");
    const data = emptyData();
    data.fixtures = [{ found: true, matched: true }];
    const expected = {
      ...expectations,
      activatedAt: "2026-10-21T01:00:00Z",
      fixtures: [
        {
          phase: "backfill",
          table: "payment_intents",
          id: "pi_fixture",
          sourceObservedAt: "2026-10-21T00:59:00Z",
          expected: {
            amount: "100",
            currency: "usd",
            status: "succeeded",
            latest_charge: "ch_fixture",
          },
        },
      ],
    };
    const deps = dependencies(data, inventory);
    const result = await verifyStripeDataPipeline(expected, deps);
    expect(result.checks.backfill).toBe("observed");
    expect(deps.spawn.mock.calls[1][2].input).toContain(
      '"latest_charge"::text',
    );
  });

  it.each([false, true])(
    "distinguishes pending/mismatching backfill, found=%s",
    async (found) => {
      const expected = {
        ...expectations,
        activatedAt: "2026-10-21T01:00:00Z",
        fixtures: [
          {
            phase: "backfill",
            table: "payment_intents",
            id: "pi_fixture",
            sourceObservedAt: "2026-10-21T00:59:00Z",
            expected: { amount: "100", currency: "usd", status: "succeeded" },
          },
        ],
      };
      const data = emptyData();
      data.fixtures = [{ found, matched: false }];
      const result = await verifyStripeDataPipeline(
        expected,
        dependencies(data),
      );
      expect(result.checks.backfill).toBe(found ? "failed" : "incomplete");
      expect(result.exitCode).toBe(found ? 1 : 2);
    },
  );

  it("leaves a pending ongoing marker incomplete and checks required evidence columns first", async () => {
    const expected = {
      ...expectations,
      activatedAt: "2026-10-21T01:00:00Z",
      fixtures: [
        {
          phase: "ongoing",
          table: "customers",
          id: "cus_fixture",
          sourceChangedAt: "2026-10-21T01:01:00Z",
          metadata: { key: "core_pipeline_probe", value: "probe-pending" },
        },
      ],
    };
    const data = emptyData();
    data.fixtures = [{ found: true, matched: false }];
    const result = await verifyStripeDataPipeline(expected, dependencies(data));
    expect(result.checks.ongoing).toBe("incomplete");
    const inventory = catalog();
    inventory.tables[0].columns = ["id", "_account_id", "livemode"];
    const deps = dependencies(data, inventory);
    expect(
      (await verifyStripeDataPipeline(expected, deps)).checks.structure,
    ).toBe("failed");
    expect(deps.spawn).toHaveBeenCalledTimes(1);
  });

  it.each([
    { amount: 100, currency: "usd", status: "succeeded" },
    { amount: "1.00", currency: "usd", status: "succeeded" },
    { amount: "100", currency: "usd", status: "succeeded", metadata: "unsafe" },
    {
      amount: "100",
      currency: "usd",
      status: "succeeded",
      latest_charge: "ch_unsafe'",
    },
  ])("rejects unsafe or inexact financial expectations: %j", async (fields) => {
    const deps = dependencies();
    await expect(
      verifyStripeDataPipeline(
        {
          ...expectations,
          activatedAt: "2026-10-21T01:00:00Z",
          fixtures: [
            {
              phase: "backfill",
              table: "payment_intents",
              id: "pi_fixture",
              sourceObservedAt: "2026-10-21T00:59:00Z",
              expected: fields,
            },
          ],
        },
        deps,
      ),
    ).rejects.toThrow();
    expect(deps.spawn).not.toHaveBeenCalled();
  });

  it("requires independent preactivation/ongoing source chronology", async () => {
    const deps = dependencies();
    await expect(
      verifyStripeDataPipeline(
        {
          ...expectations,
          activatedAt: "2026-10-21T01:00:00Z",
          fixtures: [
            {
              phase: "backfill",
              table: "customers",
              id: "cus_fixture",
              sourceObservedAt: "2026-10-21T01:01:00Z",
              expected: {},
            },
          ],
        },
        deps,
      ),
    ).rejects.toThrow("before activation");
    await expect(
      verifyStripeDataPipeline(
        {
          ...expectations,
          activatedAt: "2026-10-21T01:00:00Z",
          fixtures: [
            {
              phase: "ongoing",
              table: "customers",
              id: "cus_fixture",
              sourceChangedAt: "2026-10-21T00:59:00Z",
              metadata: { key: "core_pipeline_probe", value: "stale-marker" },
            },
          ],
        },
        deps,
      ),
    ).rejects.toThrow("subsequent");
    expect(deps.spawn).not.toHaveBeenCalled();
  });

  it("rejects a libpq multi-host destination disguised by an allowed pooler suffix", async () => {
    const deps = dependencies();
    await expect(
      verifyStripeDataPipeline(expectations, {
        ...deps,
        environment: {
          ...environment,
          SUPABASE_DB_URL: environment.SUPABASE_DB_URL.replace(
            "aws-0-us-east-1.pooler.supabase.com",
            "unapproved.invalid,aws-0-us-east-1.pooler.supabase.com",
          ),
        },
      }),
    ).rejects.toThrow("expected Supabase project");
    expect(deps.spawn).not.toHaveBeenCalled();
  });
});
