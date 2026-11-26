import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";

const REF = "abcdefghijklmnopqrst";
const DEVELOPMENT = "pnmlrbgjiqzzsthsoikm";
const CA = readFileSync(
  "tests/unit/scripts/release/fixtures/ca/ca.crt",
  "utf8",
);
const TENANT_A = "00000000-0000-0000-0000-000000000001";
const TENANT_B = "00000000-0000-0000-0000-000000000002";
const SITE_1 = "ffbeafc8-f85f-a2c9-5493-d62f5003e3b8";
const SITE_2 = "5b53f899-8988-6455-fb3d-bb9fe896184c";
const SITE_3 = "fb579386-29aa-f665-03e5-84adfaaff133";
const LOOSE = "0b0f4a52-38b4-4c55-a1d2-2b2a3e9f0c11";

const records = () =>
  import("../../../scripts/cms/lib/site-presentation-records.mjs");
const sweep = () => import("../../../scripts/cms/sweep-site-presentations.mjs");

function recordingQuery(answers: {
  tables?: { presentations: boolean; sites: boolean };
  presentations?: Array<{ id: string; tenant: string }>;
  sites?: Array<{ id: string; tenantId: string }>;
}) {
  const reads: string[] = [];
  const query = vi.fn(({ sql }: { sql: string }) => {
    if (sql.includes("to_regclass")) {
      reads.push("tables");
      return answers.tables ?? { presentations: true, sites: true };
    }
    if (sql.includes("FROM cms.site_presentations")) {
      reads.push("presentations");
      return answers.presentations ?? [];
    }
    if (sql.includes("FROM public.sites")) {
      reads.push("sites");
      return answers.sites ?? [];
    }
    throw new Error(`unexpected query: ${sql.slice(0, 60)}`);
  });
  return { query, reads };
}

describe("AL-2679 WP6 rest: what the release reads of Sites and their presentations", () => {
  it("reads the presentations before the Sites, so a Site made meanwhile is never taken for an orphan", async () => {
    const { readSitePresentationState } = await records();
    const { query, reads } = recordingQuery({
      presentations: [{ id: SITE_1, tenant: TENANT_A }],
      sites: [{ id: SITE_1, tenantId: TENANT_A }],
    });
    const state = readSitePresentationState({
      databaseUrl: "postgres://unit@localhost/db",
      query,
    });
    expect(reads).toEqual(["tables", "presentations", "sites"]);
    expect(state).toEqual({
      presentationsTable: true,
      presentations: [{ id: SITE_1, tenant: TENANT_A }],
      sites: [{ id: SITE_1, tenantId: TENANT_A }],
    });
  });

  it("reads nothing more where cms.site_presentations does not exist yet", async () => {
    const { readSitePresentationState } = await records();
    const { query, reads } = recordingQuery({
      tables: { presentations: false, sites: true },
    });
    expect(
      readSitePresentationState({
        databaseUrl: "postgres://unit@localhost/db",
        query,
      }),
    ).toEqual({ presentationsTable: false, presentations: [], sites: [] });
    expect(reads).toEqual(["tables"]);
  });

  it("names a presentation with no Site and one under another tenant than its Site's, and lists the Sites that have none", async () => {
    const { judgeSitePresentations, describeSitePresentationProblems } =
      await records();
    const judged = judgeSitePresentations({
      presentations: [
        { id: SITE_1, tenant: TENANT_A },
        { id: SITE_2, tenant: TENANT_A },
        { id: LOOSE, tenant: TENANT_B },
      ],
      sites: [
        { id: SITE_1, tenantId: TENANT_A },
        { id: SITE_2, tenantId: TENANT_B },
        { id: SITE_3, tenantId: TENANT_B },
      ],
    });
    expect(judged.orphans).toEqual([{ id: LOOSE, tenant: TENANT_B }]);
    expect(judged.mismatches).toEqual([
      { id: SITE_2, tenant: TENANT_A, siteTenant: TENANT_B },
    ]);
    expect(judged.missing).toEqual([{ id: SITE_3, tenantId: TENANT_B }]);
    const text = describeSitePresentationProblems(judged);
    expect(text).toContain(LOOSE);
    expect(text).toMatch(
      new RegExp(`${SITE_2}[^;]*${TENANT_A}[^;]*${TENANT_B}`),
    );
    expect(text).not.toContain(SITE_1);
  });

  it("compares IDs and tenants as PostgreSQL uuids, so letter case alone is no difference", async () => {
    const { judgeSitePresentations, uuidKey } = await records();
    expect(uuidKey(SITE_1.toUpperCase())).toBe(SITE_1);
    expect(uuidKey(`{${SITE_1}}`)).toBe(SITE_1);
    expect(uuidKey(SITE_1.replaceAll("-", ""))).toBe(SITE_1);
    for (const bad of ["", "not-a-uuid", ` ${SITE_1}`, `{${SITE_1}`, null])
      expect(uuidKey(bad)).toBeNull();
    const judged = judgeSitePresentations({
      presentations: [{ id: SITE_1, tenant: TENANT_A.toUpperCase() }],
      sites: [{ id: SITE_1.toUpperCase(), tenantId: TENANT_A }],
    });
    expect(judged).toEqual({ orphans: [], mismatches: [], missing: [] });
  });
});

describe("AL-2679 WP6 rest: the sweep's own Payload process", () => {
  const hosted = {
    CMS_SWEEP_ENVIRONMENT: "production",
    CMS_SWEEP_PROJECT_REF: REF,
    PAYLOAD_DATABASE_URI: `postgresql://cms_runtime.${REF}:pw@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=verify-full`,
    PAYLOAD_DATABASE_SSL_CA: CA,
  };

  it("accepts cms_runtime on the job's project over verify-full with the project's CA", async () => {
    const { assertSweepTarget } = await sweep();
    expect(() => assertSweepTarget(hosted)).not.toThrow();
  });

  it.each([
    [
      "another login than cms_runtime",
      {
        PAYLOAD_DATABASE_URI: hosted.PAYLOAD_DATABASE_URI.replace(
          "cms_runtime.",
          "postgres.",
        ),
      },
    ],
    [
      "a project its environment refuses",
      {
        CMS_SWEEP_ENVIRONMENT: "preview",
        CMS_SWEEP_PROJECT_REF: DEVELOPMENT,
        PAYLOAD_DATABASE_URI: hosted.PAYLOAD_DATABASE_URI.replaceAll(
          REF,
          DEVELOPMENT,
        ),
      },
    ],
    [
      "another project than the job's",
      {
        PAYLOAD_DATABASE_URI: hosted.PAYLOAD_DATABASE_URI.replace(
          `cms_runtime.${REF}`,
          "cms_runtime.zyxwvutsrqponmlkjihg",
        ),
      },
    ],
    [
      "a connection that does not verify the server",
      {
        PAYLOAD_DATABASE_URI: hosted.PAYLOAD_DATABASE_URI.replace(
          "verify-full",
          "require",
        ),
      },
    ],
    ["no CA", { PAYLOAD_DATABASE_SSL_CA: "" }],
    ["an unknown environment", { CMS_SWEEP_ENVIRONMENT: "toString" }],
    [
      "a loopback database without the tests' switch",
      {
        PAYLOAD_DATABASE_URI:
          "postgresql://cms_runtime:pw@127.0.0.1:5432/postgres",
      },
    ],
    [
      "a loopback database as another login",
      {
        CMS_SWEEP_ALLOW_LOOPBACK: "1",
        PAYLOAD_DATABASE_URI:
          "postgresql://postgres:pw@127.0.0.1:5432/postgres",
      },
    ],
  ])("refuses %s before Payload starts", async (_label, change) => {
    const { assertSweepTarget } = await sweep();
    expect(() => assertSweepTarget({ ...hosted, ...change })).toThrow();
  });

  it("prints a failure only through the release's redaction, without the run's Payload secret", async () => {
    const { failureText } = await sweep();
    const secret = "f".repeat(64);
    const text = failureText(
      new Error(
        `connect failed postgresql://cms_runtime.${REF}:pw@aws-0-us-east-1.pooler.supabase.com:5432/postgres secret=${secret} password "hunter2hunter2"`,
      ),
      { PAYLOAD_SECRET: secret },
    );
    expect(text).toContain("connect failed");
    expect(text).not.toContain(secret);
    expect(text).not.toMatch(/postgres(?:ql)?:\/\//);
    expect(text).not.toContain("hunter2hunter2");
  });

  it("takes only a list of Sites, each a pair of UUIDs, and nothing else", async () => {
    const { readSweepInput } = await sweep();
    expect(
      readSweepInput(
        JSON.stringify([{ id: SITE_1.toUpperCase(), tenantId: TENANT_A }]),
      ),
    ).toEqual([{ id: SITE_1, tenantId: TENANT_A }]);
    for (const bad of [
      "",
      "{}",
      JSON.stringify([{ id: SITE_1 }]),
      JSON.stringify([{ id: SITE_1, tenantId: TENANT_A, tenant: TENANT_B }]),
      JSON.stringify([{ id: "x", tenantId: TENANT_A }]),
    ])
      expect(() => readSweepInput(bad)).toThrow();
  });

  it("presents each Site through the step, from the list it was given, and stops at the first failure keeping what it wrote", async () => {
    const { presentSites } = await sweep();
    const table = new Map<string, { id: string; tenant: string }>();
    let failOn: string | null = SITE_2;
    const payload = {
      find: vi.fn(async ({ where }: { where: { id: { equals: string } } }) => {
        const row = table.get(where.id.equals);
        return { docs: row ? [row] : [] };
      }),
      create: vi.fn(
        async ({ data }: { data: { id: string; tenant: string } }) => {
          if (data.id === failOn) throw new Error("connection reset");
          table.set(data.id, { id: data.id, tenant: data.tenant });
          return table.get(data.id)!;
        },
      ),
      findByID: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const sites = [
      { id: SITE_1, tenantId: TENANT_A },
      { id: SITE_2, tenantId: TENANT_A },
      { id: SITE_3, tenantId: TENANT_B },
    ];
    await expect(
      presentSites(payload as never, sites, { log: () => {} }),
    ).rejects.toThrow(/connection reset/);
    expect([...table.keys()]).toEqual([SITE_1]);
    failOn = null;
    expect(await presentSites(payload as never, sites, { log: () => {} })).toBe(
      3,
    );
    expect([...table.values()]).toEqual([
      { id: SITE_1, tenant: TENANT_A },
      { id: SITE_2, tenant: TENANT_A },
      { id: SITE_3, tenant: TENANT_B },
    ]);
    expect(payload.create).toHaveBeenCalledTimes(4);
  });
});
