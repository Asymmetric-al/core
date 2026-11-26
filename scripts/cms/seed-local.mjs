import { createRequire } from "node:module";
import path from "node:path";

import nextEnv from "@next/env";

import { isLoopbackDatabaseUrl } from "../../packages/env/src/database-url.mjs";
import { requireDisposableDatabase } from "../lib/environment-marker.mjs";
import {
  DEMO_ADMIN_USER_ID,
  SEED_SITES_SQL,
  DEMO_PUBLIC_TENANT_ID,
  SECOND_PUBLIC_TENANT_ID,
  SECOND_PUBLIC_TENANT_NAME,
  SECOND_PUBLIC_TENANT_SLUG,
} from "./lib/local-data.mjs";
import { executeSql, getLocalDatabaseUrl, queryJson } from "./lib/postgres.mjs";
import { adminAppDir, repoRoot } from "./lib/paths.mjs";

const { loadEnvConfig } = nextEnv;

process.env.NODE_ENV ||= "development";
process.env.PAYLOAD_DISABLE_SCHEMA_PUSH ||= "1";
loadEnvConfig(repoRoot);

function printSummary(summary) {
  for (const [key, value] of Object.entries(summary)) {
    process.stdout.write(`[ok] ${key}: ${value}\n`);
  }
}

async function ensurePublicSeedRows() {
  const seed = queryJson(`
    WITH tenant AS (
      SELECT id, slug, name FROM public.tenants
      WHERE id = '${DEMO_PUBLIC_TENANT_ID}'::uuid
    ),
    missionary AS (
      SELECT m.id, m.profile_id, m.location, m.tagline, m.bio
      FROM public.missionaries m
      WHERE m.tenant_id = '${DEMO_PUBLIC_TENANT_ID}'::uuid
      ORDER BY CASE WHEN m.id = '${DEMO_ADMIN_USER_ID}'::uuid THEN 0 ELSE 1 END, m.created_at, m.id
      LIMIT 1
    ),
    missionary_profile AS (
      SELECT p.id, p.full_name, p.display_name
      FROM public.profiles p
      JOIN missionary m ON m.profile_id = p.id
      LIMIT 1
    ),
    fund AS (
      SELECT f.id, f.name, f.description
      FROM public.funds f
      WHERE f.tenant_id = '${DEMO_PUBLIC_TENANT_ID}'::uuid
        AND f.system_purpose IS NULL
      ORDER BY CASE WHEN f.is_active THEN 0 ELSE 1 END, f.created_at, f.id
      LIMIT 1
    ),
    demo_user AS (
      SELECT u.id, u.email FROM auth.users u
      WHERE u.id = '${DEMO_ADMIN_USER_ID}'::uuid
      LIMIT 1
    ),
    membership AS (
      SELECT tenant_id, user_id, role, staff_role
      FROM authz.memberships
      WHERE tenant_id = '${DEMO_PUBLIC_TENANT_ID}'::uuid
        AND user_id = '${DEMO_ADMIN_USER_ID}'::uuid
        AND role = 'staff'
        AND is_active = true
      LIMIT 1
    )
    SELECT json_build_object(
      'tenant', (SELECT row_to_json(tenant) FROM tenant),
      'missionary', (SELECT row_to_json(missionary) FROM missionary),
      'missionaryProfile', (SELECT row_to_json(missionary_profile) FROM missionary_profile),
      'fund', (SELECT row_to_json(fund) FROM fund),
      'demoUser', (SELECT row_to_json(demo_user) FROM demo_user),
      'membership', (SELECT row_to_json(membership) FROM membership)
    )::text;
  `);

  const missing = [];
  for (const key of [
    "tenant",
    "missionary",
    "missionaryProfile",
    "fund",
    "demoUser",
    "membership",
  ]) {
    if (!seed?.[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required public demo seed rows: ${missing.join(", ")}. Run \`bun run cms:local:reset\` to recreate local Supabase data.`,
    );
  }

  executeSql(`
    INSERT INTO public.tenants (
      id,
      name,
      slug,
      org_post_visibility,
      org_settings,
      billing_email,
      default_timezone,
      locale,
      created_at,
      updated_at
    )
    VALUES (
      '${SECOND_PUBLIC_TENANT_ID}'::uuid,
      '${SECOND_PUBLIC_TENANT_NAME}',
      '${SECOND_PUBLIC_TENANT_SLUG}',
      'all_donors',
      '{"demo":true,"localCmsIsolation":true}'::jsonb,
      'ops+second@givehope.test',
      'America/Chicago',
      'en-US',
      '2026-05-16T00:00:00Z'::timestamptz,
      '2026-05-16T00:00:00Z'::timestamptz
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  return seed;
}

async function main() {
  const databaseUrl = getLocalDatabaseUrl();
  if (!isLoopbackDatabaseUrl(databaseUrl)) {
    throw new Error(
      "Local CMS seed requires a loopback database URL (127.0.0.1, localhost, or [::1]).",
    );
  }
  // Plan 7.5: reseed only a database marked disposable.
  requireDisposableDatabase({
    databaseUrl,
    action: "seed local CMS content into",
  });
  await ensurePublicSeedRows();
  const sites = queryJson(SEED_SITES_SQL, { databaseUrl });

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
    printSummary(summary);
  } finally {
    await payload.destroy();
    process.chdir(originalCwd);
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(`error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  });
