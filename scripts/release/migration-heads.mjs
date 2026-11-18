// Migration heads of the source tree, and the order rule the release job
// applies before it migrates (plan 7.4; WP1 "a release that carries an
// out-of-order migration stops before it deploys").
import { readdirSync } from "node:fs";
import path from "node:path";

import { BUILD_MIGRATION_HEADS_ENV } from "../../packages/api/src/health/release-contract.mjs";

// The same filter scripts/verify/supabase-migrations.mjs applies in CI.
const SUPABASE_MIGRATION = /^(\d{14})_.+\.sql$/;
// Payload writes `<YYYYMMDD_HHMMSS>_<slug>.ts` beside a `.json` snapshot.
const PAYLOAD_MIGRATION = /^(\d{8}_\d{6}_[A-Za-z0-9_]+)\.ts$/;

export const SUPABASE_MIGRATIONS_DIR = path.join("supabase", "migrations");
export const PAYLOAD_MIGRATIONS_DIR = path.join(
  "apps",
  "admin",
  "src",
  "migrations",
);

function readNames(directory, pattern) {
  const names = readdirSync(directory)
    .map((file) => pattern.exec(file)?.[1])
    .filter(Boolean)
    .sort();
  const duplicate = names.find((name, index) => names[index - 1] === name);
  if (duplicate) {
    throw new Error(
      `Duplicate migration version ${duplicate} in ${directory}; each version must be unique.`,
    );
  }
  return names;
}

/** Forward migrations of both ledgers, oldest first. */
export function listSourceMigrations({ root }) {
  return {
    supabase: readNames(
      path.join(root, SUPABASE_MIGRATIONS_DIR),
      SUPABASE_MIGRATION,
    ),
    payload: readNames(
      path.join(root, PAYLOAD_MIGRATIONS_DIR),
      PAYLOAD_MIGRATION,
    ),
  };
}

/** The newest migration of each ledger, or null for an empty ledger. */
export function readSourceMigrationHeads({ root }) {
  const { supabase, payload } = listSourceMigrations({ root });
  return { supabase: supabase.at(-1) ?? null, payload: payload.at(-1) ?? null };
}

/**
 * The `env` block every app's next.config passes to Next.js, so each build
 * carries the heads it was built against (read by /api/health/migrations).
 */
export function migrationHeadsBuildEnv(root) {
  return {
    [BUILD_MIGRATION_HEADS_ENV]: JSON.stringify(
      readSourceMigrationHeads({ root }),
    ),
  };
}

/**
 * The order rule, per ledger. Versions sort as text: both ledgers name
 * migrations with a fixed-width timestamp first.
 *
 * - A pending migration (in source, not applied) at or before the database
 *   head is out of order: it would apply under a later schema. Stop.
 * - An applied migration the source does not have, at or before the source
 *   head, means the database and source disagree about history. Stop.
 * - Applied migrations newer than the source head are allowed: the database
 *   is ahead, as when an application is rolled back after a migration.
 */
export function checkMigrationOrder({ ledger, source, applied }) {
  const sourceSet = new Set(source);
  const appliedSet = new Set(applied);
  const sourceHead = [...source].sort().at(-1) ?? null;
  const databaseHead = [...applied].sort().at(-1) ?? null;
  const pending = source.filter((name) => !appliedSet.has(name)).sort();
  const extra = applied.filter((name) => !sourceSet.has(name)).sort();
  const outOfOrder =
    databaseHead === null ? [] : pending.filter((name) => name <= databaseHead);
  const unknown =
    sourceHead === null ? [] : extra.filter((name) => name <= sourceHead);
  const ahead = extra.filter((name) => !unknown.includes(name));
  const reasons = [];
  if (outOfOrder.length > 0) {
    reasons.push(
      `${outOfOrder.length} ${ledger} migration(s) out of order: ${outOfOrder.join(", ")} precede the database head ${databaseHead}`,
    );
  }
  if (unknown.length > 0) {
    reasons.push(
      `${unknown.length} ${ledger} migration(s) applied to the database are missing from source: ${unknown.join(", ")}`,
    );
  }
  return {
    ledger,
    ok: reasons.length === 0,
    reason: reasons.join("; "),
    pending,
    outOfOrder,
    unknown,
    ahead,
    sourceHead,
    databaseHead,
  };
}
