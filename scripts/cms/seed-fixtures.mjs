import { createRequire } from "node:module";
import path from "node:path";

import { isLoopbackDatabaseUrl } from "../../packages/env/src/database-url.mjs";
import { requireDisposableDatabase } from "../lib/environment-marker.mjs";
import { SEED_SITES_SQL } from "./lib/local-data.mjs";
import { queryJson } from "./lib/postgres.mjs";
import { adminAppDir } from "./lib/paths.mjs";

export const FIXTURE_LOOPBACK_REFUSAL =
  "CMS fixtures are written only to a loopback database (127.0.0.1, localhost or [::1]); PAYLOAD_DATABASE_URI names another host.";

async function main() {
  process.env.NODE_ENV ||= "development";
  process.env.PAYLOAD_DISABLE_SCHEMA_PUSH ||= "1";
  const databaseUrl = process.env.PAYLOAD_DATABASE_URI?.trim() ?? "";
  if (!isLoopbackDatabaseUrl(databaseUrl)) {
    throw new Error(FIXTURE_LOOPBACK_REFUSAL);
  }
  requireDisposableDatabase({
    databaseUrl,
    action: "seed CMS fixtures into",
  });
  const sites = queryJson(SEED_SITES_SQL, { databaseUrl });
  if (!Array.isArray(sites) || sites.length === 0) {
    throw new Error(
      "No Sites in public.sites: apply the demo seed before the CMS fixtures.",
    );
  }

  const originalCwd = process.cwd();
  process.chdir(adminAppDir);
  const requireFromAdmin = createRequire(
    path.join(adminAppDir, "package.json"),
  );
  const [{ getPayload }, { default: config }] = await Promise.all([
    import(requireFromAdmin.resolve("payload")),
    import("../../apps/admin/payload.config.ts"),
  ]);
  const payload = await getPayload({ config, importMap: {} });
  const { seedCmsFixtures } = await import("./lib/cms-fixtures.mjs");
  try {
    const summary = await seedCmsFixtures(payload, sites);
    for (const [key, value] of Object.entries(summary)) {
      process.stdout.write(`[ok] ${key}: ${value}\n`);
    }
  } finally {
    await payload.destroy();
    process.chdir(originalCwd);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  });
