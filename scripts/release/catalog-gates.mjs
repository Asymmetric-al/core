// Catalog gates the release job runs on the migrated target (plan 7.4): the
// tenant-table RLS and definer gate CI already runs, and the cross-schema
// name-collision gate. The schema fingerprint is the third gate
// (schema-fingerprint.mjs).
import { EXCLUDED_SCHEMA_PATTERN } from "./schema-fingerprint.mjs";
import { queryJson } from "./lib/postgres.mjs";
import {
  formatTenantRlsCatalogSummary,
  runTenantRlsCatalogGate,
} from "../verify/tenant-rls-catalog.mjs";

export const NAME_COLLISION_EXCEPTIONS = Object.freeze([]);

export const NAME_COLLISION_SQL = `
SELECT coalesce(json_agg(json_build_object('name', relname, 'schemas', schemas)
                ORDER BY relname), '[]'::json)::text
FROM (
  SELECT c.relname, array_agg(n.nspname::text ORDER BY n.nspname) AS schemas
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind IN ('r', 'p', 'v', 'm', 'f')
    AND n.nspname !~ '${EXCLUDED_SCHEMA_PATTERN}'
  GROUP BY c.relname HAVING count(*) > 1
) collisions;`;

const sameSchemas = (a, b) =>
  a.length === b.length && a.every((schema, i) => schema === b[i]);

export function evaluateNameCollisions(
  collisions,
  exceptions = NAME_COLLISION_EXCEPTIONS,
) {
  const unexpected = collisions.filter(
    (row) =>
      !exceptions.some(
        (exception) =>
          exception.name === row.name &&
          sameSchemas([...exception.schemas].sort(), [...row.schemas].sort()),
      ),
  );
  const stale = exceptions.filter(
    (exception) =>
      !collisions.some(
        (row) =>
          row.name === exception.name &&
          sameSchemas([...exception.schemas].sort(), [...row.schemas].sort()),
      ),
  );
  return {
    ok: unexpected.length === 0 && stale.length === 0,
    unexpected,
    stale,
  };
}

export function runNameCollisionGate({ databaseUrl, query = queryJson }) {
  const collisions = query({
    databaseUrl,
    sql: NAME_COLLISION_SQL,
    label: "name-collision gate",
  });
  return evaluateNameCollisions(collisions);
}

export function formatNameCollisionResult(result) {
  if (result.ok) return "PASS: name-collision gate (recorded exceptions only).";
  const lines = ["FAIL: name-collision gate"];
  for (const row of result.unexpected) {
    lines.push(`- ${row.name} exists in ${row.schemas.join(", ")}`);
  }
  for (const exception of result.stale) {
    lines.push(
      `- the recorded exception for ${exception.name} (${exception.schemas.join(", ")}) no longer applies; remove it`,
    );
  }
  return lines.join("\n");
}

/** Both catalog gates, on one target. Returns { ok, report }. */
export function runCatalogGates({
  databaseUrl,
  rlsGate = runTenantRlsCatalogGate,
  collisionGate = runNameCollisionGate,
}) {
  const report = [];
  const rls = rlsGate({ databaseUrl });
  if (rls.ok) {
    report.push(formatTenantRlsCatalogSummary(rls));
  } else {
    report.push("FAIL: tenant RLS catalog gate");
    for (const failure of rls.failures ?? []) {
      report.push(
        `- ${failure.code} ${failure.table ?? failure.function ?? "-"}: ${failure.detail}`,
      );
    }
  }
  const collisions = collisionGate({ databaseUrl });
  report.push(formatNameCollisionResult(collisions));
  return { ok: rls.ok && collisions.ok, report: report.join("\n") };
}
