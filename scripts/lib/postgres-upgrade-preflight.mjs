import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../../", import.meta.url));
const marker = "-- CORE_POSTGRES_UPGRADE_READINESS_QUERY";

/** Inject the actual catalogue query into the disposable mixed-case regression. */
export function buildPostgresUpgradeProbe() {
  const query = readFileSync(
    path.join(root, "scripts/sql/postgres17-upgrade-readiness.sql"),
    "utf8",
  );
  const probe = readFileSync(
    path.join(
      root,
      "tests/integration/supabase/postgres17-upgrade-readiness-verification.sql",
    ),
    "utf8",
  );
  if (probe.split(marker).length !== 2)
    throw new Error(
      "Postgres readiness probe requires exactly one query marker",
    );
  return probe.replace(
    marker,
    query.trim().replace(/;$/, "") + "\n\\gset readiness_",
  );
}
