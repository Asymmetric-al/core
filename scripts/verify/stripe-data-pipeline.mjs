#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadWorkspaceEnvironment } from "../load-workspace-env.mjs";

const TABLES = ["customers", "payment_intents", "charges", "refunds"];
const LINKS = {
  customers: {},
  payment_intents: { latest_charge: "ch" },
  charges: { payment_intent: "pi" },
  refunds: { charge: "ch", payment_intent: "pi" },
};
const matchesText = (value, pattern) =>
  typeof value === "string" && pattern.test(value);
const identifier = (value) =>
  matchesText(value, /^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/);
const literal = (value) =>
  `E'${String(value).replaceAll("\\", "\\\\").replaceAll("'", "''")}'`;
const quoted = (value) => `"${value}"`;
const timestamp = (value) =>
  typeof value === "string" &&
  /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(value) &&
  Number.isFinite(Date.parse(value));
class VerificationError extends Error {
  constructor(message, exitCode = 2) {
    super(message);
    this.exitCode = exitCode;
  }
}
function requireCheck(condition, message, exitCode = 2) {
  if (!condition) throw new VerificationError(message, exitCode);
}

function validateExpectations(expected) {
  requireCheck(
    matchesText(expected?.projectRef, /^[a-z][a-z0-9-]{0,62}$/),
    "Expected projectRef is required.",
  );
  requireCheck(
    matchesText(expected.accountId, /^acct_[a-zA-Z0-9]+$/),
    "Expected Stripe accountId is required.",
  );
  requireCheck(
    matchesText(expected.sandboxId, /^[a-zA-Z0-9_-]{1,100}$/),
    "Independently verified sandboxId is required.",
  );
  requireCheck(
    identifier(expected.schema) &&
      !/^(public|graphql_public|auth|storage|realtime|extensions|cms|information_schema|pg_.*)$/.test(
        expected.schema,
      ),
    "Expected private provider schema is required.",
  );
  requireCheck(
    identifier(expected.owner),
    "Expected provider schema/table owner is required.",
  );
  requireCheck(
    Array.isArray(expected.tables) &&
      expected.tables.length > 0 &&
      expected.tables.length <= 4 &&
      new Set(expected.tables).size === expected.tables.length &&
      expected.tables.every((table) => TABLES.includes(table)),
    "Select unique supported tables.",
  );
  requireCheck(
    Array.isArray(expected.fixtures) && expected.fixtures.length <= 10,
    "fixtures must be an array of at most ten synthetic observations.",
  );
  if (expected.fixtures.length)
    requireCheck(
      timestamp(expected.activatedAt),
      "Record actual pipeline activatedAt before verifying movement.",
    );
  for (const fixture of expected.fixtures) {
    requireCheck(
      fixture && typeof fixture === "object",
      "Each fixture must be a synthetic observation object.",
    );
    const prefix = {
      customers: "cus",
      payment_intents: "pi",
      charges: "ch",
      refunds: "re",
    }[fixture.table];
    requireCheck(
      expected.tables.includes(fixture.table) &&
        new RegExp(`^${prefix}_[a-zA-Z0-9]+$`).test(fixture.id),
      "Fixture must identify a selected table and valid synthetic object ID.",
    );
    if (fixture.phase === "backfill") {
      requireCheck(
        timestamp(fixture.sourceObservedAt) &&
          Date.parse(fixture.sourceObservedAt) <
            Date.parse(expected.activatedAt),
        "Backfill requires sourceObservedAt before activation.",
      );
      const values = fixture.expected;
      requireCheck(
        values &&
          typeof values === "object" &&
          !Array.isArray(values) &&
          Object.keys(values).every((key) =>
            [
              "amount",
              "currency",
              "status",
              ...Object.keys(LINKS[fixture.table]),
            ].includes(key),
          ),
        "Backfill expected fields must be amount, currency, status or supported linkage IDs.",
      );
      for (const [key, prefix] of Object.entries(LINKS[fixture.table])) {
        if (Object.hasOwn(values, key))
          requireCheck(
            typeof values[key] === "string" &&
              new RegExp(`^${prefix}_[a-zA-Z0-9]+$`).test(values[key]),
            "Expected financial linkage must be a valid provider ID.",
          );
      }
      requireCheck(
        fixture.table === "customers"
          ? Object.keys(values).length === 0
          : matchesText(values.amount, /^(0|[1-9][0-9]{0,18})$/) &&
              matchesText(values.currency, /^[a-z]{3}$/) &&
              matchesText(values.status, /^[a-z_]{1,40}$/),
        "Financial fixtures require exact decimal-string amount, currency and status; customer backfill uses expected: {}.",
      );
    } else {
      requireCheck(
        fixture.phase === "ongoing" &&
          fixture.table === "customers" &&
          timestamp(fixture.sourceChangedAt) &&
          Date.parse(fixture.sourceChangedAt) >
            Date.parse(expected.activatedAt),
        "Ongoing evidence requires a subsequent synthetic customer change.",
      );
      requireCheck(
        matchesText(fixture.metadata?.key, /^[a-zA-Z0-9_-]{1,40}$/) &&
          matchesText(fixture.metadata?.value, /^[a-zA-Z0-9_.:-]{1,200}$/),
        "Use a non-secret unique metadata probe key/value.",
      );
    }
  }
}

function connectionEnvironment(environment, projectRef) {
  requireCheck(
    environment.SUPABASE_DB_URL,
    "SUPABASE_DB_URL is required; no database fallback is used.",
  );
  let database;
  let user;
  let password;
  try {
    database = new URL(environment.SUPABASE_DB_URL);
    user = decodeURIComponent(database.username);
    password = decodeURIComponent(database.password);
  } catch {
    throw new VerificationError(
      "SUPABASE_DB_URL must be a valid Postgres URL.",
    );
  }
  requireCheck(
    ["postgres:", "postgresql:"].includes(database.protocol),
    "A Postgres URL is required.",
  );
  requireCheck(
    database.pathname === "/postgres" && user && password && !database.hash,
    "Supply an explicit Postgres database, user and password.",
  );
  requireCheck(
    database.hostname === `db.${projectRef}.supabase.co` ||
      (/^[a-z0-9-]+\.pooler\.supabase\.com$/.test(database.hostname) &&
        user.endsWith(`.${projectRef}`)),
    "Database does not match the expected Supabase project.",
  );
  const allowed = new Set([
    "sslmode",
    "sslrootcert",
    "sslcert",
    "sslkey",
    "sslcrl",
    "sslcrldir",
  ]);
  requireCheck(
    [...database.searchParams.keys()].every(
      (key) =>
        allowed.has(key) && database.searchParams.getAll(key).length === 1,
    ),
    "Database URL routing overrides and unsupported/duplicate options are forbidden.",
  );
  const sslmode = database.searchParams.get("sslmode");
  requireCheck(
    ["require", "verify-ca", "verify-full", "no-verify"].includes(sslmode),
    "Explicit encrypted SSL mode is required.",
  );
  // Isolate libpq routing/options from the caller; never place the URL in argv.
  const child = Object.fromEntries(
    Object.entries(environment).filter(([key]) => !key.startsWith("PG")),
  );
  Object.assign(child, {
    PGHOST: database.hostname,
    PGPORT: database.port || "5432",
    PGDATABASE: "postgres",
    PGUSER: user,
    PGPASSWORD: password,
    PGSSLMODE: sslmode === "no-verify" ? "require" : sslmode,
    PGCONNECT_TIMEOUT: "5",
    PGOPTIONS:
      "-c default_transaction_read_only=on -c statement_timeout=10000 -c lock_timeout=2000",
  });
  for (const key of allowed) {
    if (key !== "sslmode" && database.searchParams.has(key))
      child[`PG${key.toUpperCase()}`] = database.searchParams.get(key);
  }
  return child;
}

function sqlQuery(sql, environment, spawn) {
  let result;
  try {
    result = spawn(
      environment.PSQL_BIN || "psql",
      [
        "--no-psqlrc",
        "--no-password",
        "--quiet",
        "--tuples-only",
        "--no-align",
        "--set",
        "ON_ERROR_STOP=1",
      ],
      {
        shell: false,
        encoding: "utf8",
        env: environment,
        timeout: 30_000,
        maxBuffer: 1024 * 1024,
        input: `BEGIN READ ONLY;\nSET LOCAL statement_timeout = '10s';\nSET LOCAL lock_timeout = '2s';\n${sql}\nROLLBACK;\n`,
        stdio: ["pipe", "pipe", "pipe"],
      },
    );
  } catch {
    throw new VerificationError(
      "Database inspection failed: process launch error.",
      1,
    );
  }
  // libpq errors can contain credential material; never forward stderr/cause.
  if (result.error || result.status !== 0)
    throw new VerificationError(
      "Database inspection failed: psql unavailable, connection/query error or timeout.",
      1,
    );
  try {
    return JSON.parse(result.stdout.trim());
  } catch {
    throw new VerificationError(
      "Database inspection returned an invalid result.",
      1,
    );
  }
}

function catalogSql(schema) {
  return `SELECT json_build_object(
    'schemaOwner', (SELECT pg_get_userbyid(nspowner) FROM pg_namespace WHERE nspname = ${literal(schema)}),
    'roles', (SELECT json_agg(rolname ORDER BY rolname) FROM pg_roles WHERE rolname IN ('anon','authenticated')),
    'realtime', EXISTS (SELECT FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = ${literal(schema)})
      OR EXISTS (SELECT FROM pg_publication WHERE pubname = 'supabase_realtime' AND puballtables),
    'tables', COALESCE((SELECT json_agg(json_build_object(
      'name', c.relname, 'owner', pg_get_userbyid(c.relowner),
      'columns', (SELECT json_agg(attname) FROM pg_attribute WHERE attrelid = c.oid AND attnum > 0 AND NOT attisdropped),
      'readableBy', (SELECT json_agg(rolname) FROM pg_roles WHERE rolname IN ('anon','authenticated')
        AND has_schema_privilege(oid, n.oid, 'USAGE') AND (has_table_privilege(oid, c.oid, 'SELECT') OR has_any_column_privilege(oid, c.oid, 'SELECT')))
    ) ORDER BY c.relname) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = ${literal(schema)} AND c.relkind IN ('r','p','v','m','f')), '[]'::json));`;
}

function fixtureSql(fixture, expected, columns) {
  const matches = [`_account_id = ${literal(expected.accountId)}`];
  if (columns.includes("livemode")) matches.push("livemode IS FALSE");
  if (fixture.phase === "ongoing") {
    matches.push(
      `metadata ->> ${literal(fixture.metadata.key)} = ${literal(fixture.metadata.value)}`,
      `_updated_at >= ${literal(fixture.sourceChangedAt)}::timestamptz`,
    );
  } else {
    for (const [key, value] of Object.entries(fixture.expected))
      matches.push(`${quoted(key)}::text = ${literal(value)}`);
  }
  return `(SELECT json_build_object('found', count(*) = 1, 'matched', count(*) = 1 AND COALESCE(bool_and(${matches.join(" AND ")}), false))
    FROM ${quoted(expected.schema)}.${quoted(fixture.table)} WHERE id = ${literal(fixture.id)})`;
}

async function apiExposure(expected, environment, fetch) {
  const key =
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    environment.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key || !environment.NEXT_PUBLIC_SUPABASE_URL) return "incomplete";
  requireCheck(
    environment.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "") ===
      `https://${expected.projectRef}.supabase.co`,
    "Public Supabase URL does not match the expected Supabase project.",
  );
  try {
    // The OpenAPI root requires a privileged key; table requests support public keys.
    const response = await fetch(
      `https://${expected.projectRef}.supabase.co/rest/v1/${encodeURIComponent(expected.tables[0])}?select=id&limit=0`,
      {
        headers: { apikey: key, "Accept-Profile": expected.schema },
        signal: AbortSignal.timeout(10_000),
        redirect: "error",
      },
    );
    const body = await response.json();
    if (response.status === 406 && body.code === "PGRST106") return "passed";
    // An anonymous privilege denial still proves the schema is exposed.
    if (response.status === 401 && body?.code === "42501") return "failed";
    return response.status === 401 || response.status >= 500
      ? "incomplete"
      : "failed";
  } catch {
    return "incomplete";
  }
}

/** One read-only observation. Source identity/timestamps are operator attestations. */
export async function verifyStripeDataPipeline(
  expected,
  {
    environment = process.env,
    spawn = spawnSync,
    fetch = globalThis.fetch,
  } = {},
) {
  validateExpectations(expected);
  const child = connectionEnvironment(environment, expected.projectRef);
  // Validate both destinations before any network operation.
  if (environment.NEXT_PUBLIC_SUPABASE_URL)
    requireCheck(
      environment.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "") ===
        `https://${expected.projectRef}.supabase.co`,
      "Public Supabase URL does not match the expected Supabase project.",
    );
  const catalog = sqlQuery(catalogSql(expected.schema), child, spawn);
  const selected = expected.tables.map((table) =>
    catalog.tables?.find((entry) => entry.name === table),
  );
  const structure =
    catalog.schemaOwner === expected.owner &&
    selected.every(
      (table) =>
        table?.owner === expected.owner &&
        ["id", "_account_id"].every((column) =>
          table.columns?.includes(column),
        ) &&
        (table.name === "refunds" || table.columns.includes("livemode")),
    ) &&
    expected.fixtures.every((fixture) => {
      const columns = selected.find(
        (table) => table?.name === fixture.table,
      )?.columns;
      return (
        fixture.phase === "ongoing"
          ? ["metadata", "_updated_at"]
          : Object.keys(fixture.expected)
      ).every((column) => columns?.includes(column));
    })
      ? "passed"
      : "failed";
  const catalogPrivate =
    catalog.roles?.includes("anon") &&
    catalog.roles.includes("authenticated") &&
    catalog.realtime === false &&
    catalog.tables.every((table) => !table.readableBy?.length);
  const exposure = await apiExposure(expected, environment, fetch);
  const privacy =
    !catalogPrivate || exposure === "failed" ? "failed" : exposure;
  const checks = {
    structure,
    privacy,
    backfill: "incomplete",
    ongoing: "incomplete",
  };
  let tables = [];
  let fixtures = [];
  if (structure === "passed") {
    const selections = selected.map(
      (
        table,
      ) => `(SELECT json_build_object('table', ${literal(table.name)}, 'rows', count(*)::text,
      'wrongAccount', count(*) FILTER (WHERE _account_id IS DISTINCT FROM ${literal(expected.accountId)})::text,
      'liveRows', ${table.columns.includes("livemode") ? "count(*) FILTER (WHERE livemode IS DISTINCT FROM false)::text" : "NULL"}) FROM ${quoted(expected.schema)}.${quoted(table.name)})`,
    );
    const observations = expected.fixtures.map((fixture) =>
      fixtureSql(
        fixture,
        expected,
        selected.find((table) => table.name === fixture.table).columns,
      ),
    );
    const data = sqlQuery(
      `SELECT json_build_object('tables', json_build_array(${selections.join(",")}), 'fixtures', json_build_array(${observations.join(",")}));`,
      child,
      spawn,
    );
    requireCheck(
      Array.isArray(data.tables) &&
        data.tables.length === expected.tables.length &&
        data.tables.every(
          (table, index) =>
            table.table === expected.tables[index] &&
            [table.rows, table.wrongAccount].every(
              (count) => typeof count === "string" && /^[0-9]+$/.test(count),
            ) &&
            (table.liveRows === null ||
              (typeof table.liveRows === "string" &&
                /^[0-9]+$/.test(table.liveRows))),
        ) &&
        Array.isArray(data.fixtures) &&
        data.fixtures.length === expected.fixtures.length &&
        data.fixtures.every(
          (fixture) =>
            typeof fixture.found === "boolean" &&
            typeof fixture.matched === "boolean",
        ),
      "Database inspection returned an invalid result.",
      1,
    );
    tables = data.tables;
    if (
      tables.some(
        (table) =>
          table.wrongAccount !== "0" ||
          (table.liveRows !== null && table.liveRows !== "0"),
      )
    )
      checks.structure = "failed";
    fixtures = expected.fixtures.map((fixture, index) => ({
      phase: fixture.phase,
      table: fixture.table,
      id: fixture.id,
      found: data.fixtures[index].found,
      matched: data.fixtures[index].matched,
    }));
    for (const phase of ["backfill", "ongoing"]) {
      const evidence = fixtures.filter((fixture) => fixture.phase === phase);
      if (
        checks.structure === "passed" &&
        evidence.length &&
        (phase !== "backfill" ||
          !expected.tables.some((table) => table !== "customers") ||
          evidence.some((fixture) => fixture.table !== "customers")) &&
        evidence.every((fixture) => fixture.found && fixture.matched)
      )
        checks[phase] = "observed";
      else if (
        phase === "backfill" &&
        evidence.some((fixture) => fixture.found && !fixture.matched)
      )
        checks[phase] = "failed";
    }
  }
  const statuses = Object.values(checks);
  return {
    projectRef: expected.projectRef,
    accountId: expected.accountId,
    sandboxId: expected.sandboxId,
    schema: expected.schema,
    owner: expected.owner,
    checks,
    tables,
    fixtures,
    exitCode: statuses.includes("failed")
      ? 1
      : statuses.includes("incomplete")
        ? 2
        : 0,
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    requireCheck(
      process.argv.length === 4 && process.argv[2] === "--expect",
      "Usage: node scripts/verify/stripe-data-pipeline.mjs --expect /path/to/local-expectations.json",
    );
    let expected;
    try {
      expected = JSON.parse(readFileSync(process.argv[3], "utf8"));
    } catch {
      throw new VerificationError("Cannot read a valid expectation JSON file.");
    }
    loadWorkspaceEnvironment(fileURLToPath(new URL("../../", import.meta.url)));
    const result = await verifyStripeDataPipeline(expected);
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.exitCode;
  } catch (error) {
    console.error(
      error instanceof VerificationError
        ? error.message
        : "Verification could not run; unexpected error details were withheld.",
    );
    process.exitCode = error instanceof VerificationError ? error.exitCode : 1;
  }
}
