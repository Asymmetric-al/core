/**
 * Acceptance tests for GitHub issue #2067 addendum 4 — the gate reads through
 * a restricted database role and private functions, and fails closed.
 * Addendum 4 (Blake-approved 2026-10-20 10:31 PM PT; engineering ruling by
 * Samson): {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6308840307}
 *
 * Covers done criteria 1 (the restricted role works), 2 (no direct reads),
 * 3 (privileged connections rejected; the missing-URL case is in
 * ./credentials.acceptance.test.ts), 6 (RLS can't produce a false clean
 * proof: the unit model is "zero rows, no error"), 7 / m1 (census and schema
 * version under the detector deadline) and criterion 10 items 1–4 (the fakes
 * model only the committed exposure; anon/authenticated get 42501; a
 * privileged connection user is rejected). The real-stack half of criteria 5,
 * 6 and 10 is ./reader-role.integration.acceptance.test.ts.
 *
 * Every rejection test runs the same `--decision go` as the reader control
 * (exit 0, one clean proof) and changes exactly one thing, so a rejection
 * can't pass because the fake failed to understand the gate. The gate's
 * queries must use the forms documented in ./fake-postgres.ts; the control
 * asserts the fake understood every query.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  LOCAL_TARGET_ENV,
  READER_ROLE,
  allowlistedOwner,
  cleanTarget,
  cleanupProofFiles,
  decisionArgs,
  fakeDatabaseUrl,
  listProofFiles,
  markedStatement,
  newProofFiles,
  proofRunMarker,
  runCommand,
} from "./command-harness";
import { createFakePgModule, fakePg } from "./fake-postgres";
import { fakeDb, makeFakeClient } from "./fake-supabase";
import {
  InMemoryDocumentCutoverProofStore,
  PHASE_18_PROTOTYPE_DOCUMENT_TABLES,
} from "../../../../packages/api/src/document-cutover";

import type { FakePgRoute } from "./fake-postgres";

vi.mock("@supabase/supabase-js", async (importOriginal) =>
  (await import("./fake-supabase")).mockSupabaseModule(await importOriginal()),
);
vi.mock("pg", async () => (await import("./fake-postgres")).mockPgModule());

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  cleanupProofFiles();
});

/** Detector deadline from packages/api/src/document-cutover/assessment.ts. */
const DETECTOR_DEADLINE_MS = 30_000;

interface GoRun {
  exitCode: number;
  output: string;
  stored: Awaited<ReturnType<InMemoryDocumentCutoverProofStore["list"]>>;
  files: string[];
}

/**
 * `--decision go` by the allowlisted owner on a clean fake target, with an
 * in-memory store and the default proof directory both watched for proofs.
 */
async function goRun(
  env: Record<string, string> = LOCAL_TARGET_ENV,
): Promise<GoRun> {
  const marker = proofRunMarker();
  const before = listProofFiles();
  const store = new InMemoryDocumentCutoverProofStore();
  const result = await runCommand({
    argv: decisionArgs("go", allowlistedOwner(), markedStatement(marker)),
    env,
    store,
  });
  return {
    exitCode: result.exitCode,
    output: `${result.stdout}\n${result.stderr}`,
    stored: await store.list(),
    files: newProofFiles(before, marker),
  };
}

function expectRejected(run: GoRun, blocker: RegExp): void {
  expect(run.exitCode, run.output).not.toBe(0);
  expect(run.output).toMatch(blocker);
  expect(run.stored).toEqual([]);
  expect(run.files).toEqual([]);
}

/** A connection-identity blocker (wording not pinned by the spec). */
const IDENTITY_BLOCKER =
  /document_cutover_reader|rolsuper|rolbypassrls|superuser|bypass ?rls|member|privileged/i;

/** A blocker for a read that came back without its result row. */
const INCOMPLETE_READ_BLOCKER =
  /indeterminate|unknown|empty|no rows?|missing|incomplete|row[- ]level security|rls|stop_the_line/i;

function withDatabaseUrl(url: string): Record<string, string> {
  return { ...LOCAL_TARGET_ENV, DOCUMENT_CUTOVER_DATABASE_URL: url };
}

// ---------------------------------------------------------------------------
// Criterion 1 — the restricted role works
// ---------------------------------------------------------------------------

describe("issue #2067 addendum 4 — criterion 1: the restricted role works", () => {
  it("criterion 1 (control for every rejection below): connected as document_cutover_reader on a clean target, --decision go exits 0 and records exactly one clean proof", async () => {
    cleanTarget();
    const run = await goRun();

    expect(run.exitCode, run.output).toBe(0);
    expect(run.stored).toHaveLength(1);
    expect(run.stored[0]?.outcome).toBe("clean_preproduction_proof");
    expect(fakePg.connections.map(({ user }) => user)).toContain(READER_ROLE);
    expect(fakePg.unsupported).toEqual([]);
  });

  it("criterion 1: the census, the schema version and every detector result come from document_cutover.* function calls", async () => {
    cleanTarget();
    await goRun();
    const routes = new Set(
      fakePg.queries
        .filter((query) => query.kind === "function")
        .map((query) => query.route),
    );
    const expected: FakePgRoute[] = [
      "schema_version",
      "users",
      "table",
      "storage",
      "external",
      "jobs",
      "reports",
      "integrations",
    ];
    expect([...routes].sort()).toEqual([...expected].sort());
    const tables = new Set(
      fakePg.queries
        .filter((query) => query.route === "table")
        .map((query) => query.args?.[0]),
    );
    expect([...tables].sort()).toEqual(
      [...PHASE_18_PROTOTYPE_DOCUMENT_TABLES].sort(),
    );
  });

  it("criterion 1: every query the gate sends is a connection-identity check, a document_cutover.* call or session control", async () => {
    cleanTarget();
    await goRun();
    expect(fakePg.queries.length).toBeGreaterThan(0);
    expect(
      fakePg.queries.filter(
        (query) => !["identity", "function", "control"].includes(query.kind),
      ),
    ).toEqual([]);
    expect(fakePg.writes).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Criterion 2 — no direct reads
// ---------------------------------------------------------------------------

describe("issue #2067 addendum 4 — criterion 2: no direct reads", () => {
  it("criterion 2: a run with DOCUMENT_CUTOVER_SUPABASE_READ_KEY and SUPABASE_SERVICE_ROLE_KEY also set creates no Supabase client (no PostgREST, no auth.admin.*, no .schema('supabase_migrations'))", async () => {
    cleanTarget();
    const run = await goRun({
      ...LOCAL_TARGET_ENV,
      SUPABASE_SERVICE_ROLE_KEY: ["acceptance", "2067", "unused", "key"].join(
        "-",
      ),
    });
    expect(run.exitCode, run.output).toBe(0);
    expect(fakeDb.clients).toEqual([]);
    expect(fakeDb.reads).toEqual([]);
  });

  it("criterion 2: the gate makes no direct table, view or Storage SELECT over the reader connection", async () => {
    cleanTarget();
    const run = await goRun();
    expect(run.exitCode, run.output).toBe(0);
    expect(fakePg.directReads).toEqual([]);
  });

  it("criterion 2: DOCUMENT_CUTOVER_SUPABASE_READ_KEY is no longer used — the run is identical with it removed", async () => {
    cleanTarget();
    const env = { ...LOCAL_TARGET_ENV };
    delete env.DOCUMENT_CUTOVER_SUPABASE_READ_KEY;
    const run = await goRun(env);
    expect(run.exitCode, run.output).toBe(0);
    expect(run.stored[0]?.outcome).toBe("clean_preproduction_proof");
  });
});

// ---------------------------------------------------------------------------
// Criterion 3 — privileged connections are rejected (fail closed)
// ---------------------------------------------------------------------------

describe("issue #2067 addendum 4 — criterion 3: privileged connections are rejected", () => {
  it.each(["postgres", "service_role", "authenticator", "supabase_admin"])(
    "criterion 3 (connection user isn't document_cutover_reader): DOCUMENT_CUTOVER_DATABASE_URL connecting as %s exits non-zero with a blocker and writes no proof",
    async (user) => {
      cleanTarget();
      const run = await goRun(withDatabaseUrl(fakeDatabaseUrl(user)));
      expectRejected(run, IDENTITY_BLOCKER);
    },
  );

  it("criterion 3 (connection user isn't document_cutover_reader): a pooler URL for postgres.<ref> is rejected the same way", async () => {
    cleanTarget();
    const run = await goRun(
      withDatabaseUrl(fakeDatabaseUrl("postgres", "acceptance2067ref")),
    );
    expectRejected(run, IDENTITY_BLOCKER);
  });

  it("criterion 3 (role has rolsuper): document_cutover_reader with rolsuper = true is rejected and writes no proof", async () => {
    cleanTarget();
    const reader = fakePg.roles.get(READER_ROLE);
    if (!reader) throw new Error("fake catalog lost the reader role");
    reader.rolsuper = true;
    const run = await goRun();
    expectRejected(run, IDENTITY_BLOCKER);
  });

  it("criterion 3 (role has rolbypassrls): document_cutover_reader with rolbypassrls = true is rejected and writes no proof", async () => {
    cleanTarget();
    const reader = fakePg.roles.get(READER_ROLE);
    if (!reader) throw new Error("fake catalog lost the reader role");
    reader.rolbypassrls = true;
    const run = await goRun();
    expectRejected(run, IDENTITY_BLOCKER);
  });

  it.each(["postgres", "service_role", "authenticator"])(
    "criterion 3 (direct membership): document_cutover_reader as a direct member of %s is rejected and writes no proof",
    async (privileged) => {
      cleanTarget();
      fakePg.roles.get(READER_ROLE)?.memberOf.push(privileged);
      const run = await goRun();
      expectRejected(run, IDENTITY_BLOCKER);
    },
  );

  it.each(["postgres", "service_role", "authenticator"])(
    "criterion 3 (inherited membership): document_cutover_reader inheriting %s through an intermediate role is rejected and writes no proof",
    async (privileged) => {
      cleanTarget();
      fakePg.roles.set("acceptance_2067_intermediate", {
        rolsuper: false,
        rolbypassrls: false,
        rolcanlogin: false,
        rolinherit: true,
        memberOf: [privileged],
      });
      fakePg.roles
        .get(READER_ROLE)
        ?.memberOf.push("acceptance_2067_intermediate");
      const run = await goRun();
      expectRejected(run, IDENTITY_BLOCKER);
    },
  );
});

// ---------------------------------------------------------------------------
// Criterion 6 — RLS can't produce a false clean proof (unit model)
// ---------------------------------------------------------------------------

describe("issue #2067 addendum 4 — criterion 6 / 10 item 2: RLS returning empty with no error stops the gate", () => {
  it.each([...PHASE_18_PROTOTYPE_DOCUMENT_TABLES])(
    "criterion 6: the census of %s returning zero rows (no error) ends in a blocker, a non-zero exit and no proof",
    async (table) => {
      cleanTarget();
      fakePg.rlsEmpty.add(table);
      const run = await goRun();
      expectRejected(run, INCOMPLETE_READ_BLOCKER);
      expect(
        fakePg.queries.some(
          (query) => query.route === "table" && query.args?.[0] === table,
        ),
      ).toBe(true);
    },
  );

  it.each<FakePgRoute>([
    "schema_version",
    "users",
    "storage",
    "external",
    "jobs",
    "reports",
    "integrations",
  ])(
    "criterion 6: the %s function returning zero rows (no error) ends in a blocker, a non-zero exit and no proof",
    async (route) => {
      cleanTarget();
      fakePg.rlsEmpty.add(route);
      const run = await goRun();
      expectRejected(run, INCOMPLETE_READ_BLOCKER);
      expect(fakePg.queries.some((query) => query.route === route)).toBe(true);
    },
  );

  it("criterion 6: with every read empty the gate never records a clean proof", async () => {
    cleanTarget();
    fakePg.rlsEmpty.add("*");
    const run = await goRun();
    expectRejected(run, INCOMPLETE_READ_BLOCKER);
  });
});

// ---------------------------------------------------------------------------
// Criterion 7 (m1) — census and schema version under the detector deadline
// ---------------------------------------------------------------------------

describe("issue #2067 addendum 4 — criterion 7 (m1): census and schema-version reads run under the detector deadline", () => {
  async function hungRun(route: FakePgRoute) {
    cleanTarget();
    fakePg.hang.add(route);
    vi.useFakeTimers({
      toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
    });
    let settled = false;
    const pending = goRun().finally(() => {
      settled = true;
    });
    let elapsed = 0;
    // Advance fake time in 1s steps, past the deadline plus a margin.
    while (!settled && elapsed < DETECTOR_DEADLINE_MS + 5_000) {
      await vi.advanceTimersByTimeAsync(1_000);
      elapsed += 1_000;
    }
    for (let i = 0; i < 50 && !settled; i += 1) {
      await vi.advanceTimersByTimeAsync(0);
    }
    vi.useRealTimers();
    return { settled, elapsed, pending };
  }

  it.each<FakePgRoute>(["schema_version", "users", "table"])(
    "criterion 7: a %s call that never resolves ends in a timeout blocker and a non-zero exit within the 30s detector deadline, with no proof",
    async (route) => {
      const { settled, elapsed, pending } = await hungRun(route);
      expect(
        fakePg.queries.some((query) => query.route === route),
        `the gate never called the ${route} function`,
      ).toBe(true);
      expect(settled, "the run did not finish within the deadline").toBe(true);
      expect(elapsed).toBeLessThanOrEqual(DETECTOR_DEADLINE_MS + 1_000);
      const run = await pending;
      expectRejected(run, /time(d)? ?out|timeout|exceeded|deadline/i);
    },
    20_000,
  );
});

// ---------------------------------------------------------------------------
// Criterion 10 items 1 and 3 — the fakes model only the committed exposure
// ---------------------------------------------------------------------------

describe("issue #2067 addendum 4 — criterion 10 item 1: the fakes model only the committed exposure", () => {
  it("fake: PostgREST .schema('supabase_migrations') errors (PGRST106), as the committed config.toml does not expose it", async () => {
    cleanTarget();
    const client = makeFakeClient("restricted") as {
      schema: (name: string) => {
        from: (table: string) => {
          select: (c: string) => PromiseLike<unknown>;
        };
      };
    };
    const read = (await client
      .schema("supabase_migrations")
      .from("schema_migrations")
      .select("version")) as { error: { code: string } | null };
    expect(read.error?.code).toBe("PGRST106");
  });

  it("fake: PostgREST .schema('document_cutover') errors (PGRST106); the schema is reachable only over the reader connection", async () => {
    cleanTarget();
    const client = makeFakeClient("restricted") as {
      schema: (name: string) => {
        from: (table: string) => {
          select: (c: string) => PromiseLike<unknown>;
        };
      };
    };
    const read = (await client
      .schema("document_cutover")
      .from("anything")
      .select("*")) as { error: { code: string } | null };
    expect(read.error?.code).toBe("PGRST106");
  });

  it("fake: auth.admin.listUsers with a non-service-role key fails (403 User not allowed)", async () => {
    cleanTarget();
    const client = makeFakeClient("restricted") as {
      auth: { admin: { listUsers: () => Promise<{ error: unknown }> } };
    };
    expect((await client.auth.admin.listUsers()).error).toMatchObject({
      status: 403,
    });
  });

  async function connectAs(user: string) {
    const pg = createFakePgModule(fakePg) as {
      Client: new (config: string) => {
        connect: () => Promise<void>;
        query: (text: string) => Promise<{ rows: unknown[] }>;
      };
    };
    const client = new pg.Client(fakeDatabaseUrl(user));
    await client.connect();
    return client;
  }

  it.each([
    "auth.users",
    "supabase_migrations.schema_migrations",
    "storage.objects",
    "public.pdf_templates",
  ])(
    "fake: document_cutover_reader's direct SELECT from %s fails with 42501",
    async (relation) => {
      cleanTarget();
      const client = await connectAs(READER_ROLE);
      await expect(
        client.query(`select count(*) from ${relation}`),
      ).rejects.toMatchObject({ code: "42501" });
    },
  );

  it("fake: document_cutover_reader can call a document_cutover function", async () => {
    cleanTarget();
    const client = await connectAs(READER_ROLE);
    const result = await client.query(
      "select * from document_cutover.table_census('pdf_templates')",
    );
    expect(result.rows).toEqual([{ row_count: "0", tenant_count: "0" }]);
  });
});

describe("issue #2067 addendum 4 — criterion 10 item 3: anon and authenticated get 42501 on the functions (unit model; real stack in the integration test)", () => {
  it.each(["anon", "authenticated", "service_role"])(
    "fake: %s calling a document_cutover function fails with 42501",
    async (user) => {
      cleanTarget();
      const pg = createFakePgModule(fakePg) as {
        Client: new (config: string) => {
          connect: () => Promise<void>;
          query: (text: string) => Promise<unknown>;
        };
      };
      const client = new pg.Client(fakeDatabaseUrl(user));
      await client.connect();
      await expect(
        client.query("select document_cutover.auth_user_count()"),
      ).rejects.toMatchObject({ code: "42501" });
    },
  );
});
