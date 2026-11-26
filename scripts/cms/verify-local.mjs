import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import nextEnv from "@next/env";

import { isLocalCmsVerificationTarget } from "./lib/env.mjs";
import {
  DEMO_ADMIN_EMAIL,
  FIXTURE_MEDIA_ALT,
  FIXTURE_NAVIGATION_LABEL,
  DEMO_ADMIN_PASSWORD,
  DEMO_ADMIN_USER_ID,
  DEMO_PUBLIC_TENANT_ID,
  DEMO_PUBLIC_TENANT_SLUG,
  EDITORIAL_COLLECTIONS,
  LOCAL_ADMIN_URL,
  LOCAL_SEED_SLUGS,
  LOCAL_SUPABASE_URL,
  REQUIRED_LOCAL_ENV_KEYS,
} from "./lib/local-data.mjs";
import { queryJson, runPsql } from "./lib/postgres.mjs";
import {
  adminAppDir,
  adminImportMapPath,
  repoRoot,
  rootEnvPath,
} from "./lib/paths.mjs";
import { runCommand } from "./lib/process.mjs";

const { loadEnvConfig } = nextEnv;

process.env.NODE_ENV ||= "development";
process.env.PAYLOAD_DISABLE_SCHEMA_PUSH ||= "1";
loadEnvConfig(repoRoot);

const checks = [];

function pass(name, detail) {
  checks.push({ name, ok: true, detail });
  process.stdout.write(`[ok] ${name}${detail ? `: ${detail}` : ""}\n`);
}

function fail(name, detail) {
  checks.push({ name, ok: false, detail });
  process.stdout.write(`[fail] ${name}${detail ? `: ${detail}` : ""}\n`);
}

function assertCheck(name, condition, detail, fix) {
  if (condition) {
    pass(name, detail);
    return true;
  }

  fail(name, `${detail}${fix ? `\n  Fix: ${fix}` : ""}`);
  return false;
}

async function verifyHttpIfServerRunning(seed) {
  const baseUrl = process.env.CMS_BASE_URL || LOCAL_ADMIN_URL;
  const endpoints = [
    `/api/cms/public/pages/${LOCAL_SEED_SLUGS.homePage}`,
    "/api/cms/public/navigation",
    "/api/cms/public/updates?limit=5",
    "/api/cms/public/project-pages/local-project",
    `/api/cms/public/missionary-pages/${seed.missionary.id}`,
  ];

  let serverReachable = false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2_000);
    const response = await fetch(`${baseUrl}/api/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    serverReachable = response.ok || response.status < 500;
  } catch {
    serverReachable = false;
  }

  if (!serverReachable) {
    if (process.env.CMS_LOCAL_VERIFY_REQUIRE_HTTP === "1") {
      fail(
        "http public endpoints",
        `admin server is not reachable at ${baseUrl}. Start it with \`bun run dev:admin\`.`,
      );
    } else {
      process.stdout.write(
        `[skip] http public endpoints: admin server is not running at ${baseUrl}\n`,
      );
    }
    return;
  }

  for (const endpoint of endpoints) {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        "x-forwarded-host": "localhost:3000",
      },
    });
    assertCheck(
      `http ${endpoint} returns 404`,
      response.status === 404,
      `status ${response.status}`,
      "Retired public CMS routes must return 404; restart `bun run dev:admin` if an older server is running.",
    );
  }

  const missing = await fetch(`${baseUrl}/api/cms/public/pages/not-a-page`, {
    headers: {
      "x-forwarded-host": "localhost:3000",
    },
  });
  assertCheck(
    "http missing page returns 404",
    missing.status === 404,
    `status ${missing.status}`,
  );
}

async function verifyLocalSupabaseDemoPasswordAuth() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || LOCAL_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!anonKey) {
    fail("demo password auth", "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing");
    return;
  }

  const response = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: DEMO_ADMIN_EMAIL,
        password: DEMO_ADMIN_PASSWORD,
      }),
    },
  );

  assertCheck(
    "demo password auth",
    response.ok,
    `status ${response.status}`,
    "Run `bun run cms:local:reset` so auth.users and auth.identities are reseeded.",
  );
}

async function verifyPayloadSeed() {
  const originalCwd = process.cwd();
  process.chdir(adminAppDir);

  const requireFromAdmin = createRequire(
    path.join(adminAppDir, "package.json"),
  );
  const [{ getPayload }, { default: config }, { serviceFind }] =
    await Promise.all([
      import(requireFromAdmin.resolve("payload")),
      import("../../apps/admin/payload.config.ts"),
      import("../../apps/admin/src/cms/ports/service-port.ts"),
    ]);

  const payload = await getPayload({ config, importMap: {} });

  try {
    const sites = queryJson(`
      SELECT coalesce(json_agg(id ORDER BY id), '[]'::json)::text
        FROM public.sites
       WHERE tenant_id = '${DEMO_PUBLIC_TENANT_ID}'::uuid;
    `);
    const presentations = await serviceFind(payload, {
      collection: "site-presentations",
      where: { tenant: { equals: DEMO_PUBLIC_TENANT_ID } },
    });
    const presented = new Set(presentations.map((doc) => String(doc.id)));
    assertCheck(
      "cms site presentation seeds",
      Array.isArray(sites) &&
        sites.length > 0 &&
        sites.every((id) => presented.has(id)),
      `${presentations.length} of ${Array.isArray(sites) ? sites.length : 0} Sites`,
      "Run `bun run cms:local:seed`.",
    );

    const requiredCollectionChecks = [
      ["pages", { slug: { equals: LOCAL_SEED_SLUGS.homePage } }],
      ["navigation", { label: { equals: FIXTURE_NAVIGATION_LABEL } }],
      ["media", { alt: { equals: FIXTURE_MEDIA_ALT } }],
    ];

    for (const [collection, where] of requiredCollectionChecks) {
      const docs = await serviceFind(payload, {
        collection,
        draft: collection === "pages",
        where: {
          and: [{ tenant: { equals: DEMO_PUBLIC_TENANT_ID } }, where],
        },
      });
      assertCheck(`cms seed ${collection}`, docs.length > 0, "row exists");
    }
  } finally {
    await payload.destroy();
    process.chdir(originalCwd);
  }
}

async function main() {
  assertCheck(
    "env file",
    fs.existsSync(rootEnvPath),
    rootEnvPath,
    "Run `bun run cms:local:bootstrap`.",
  );

  for (const key of REQUIRED_LOCAL_ENV_KEYS) {
    assertCheck(
      `env ${key}`,
      Boolean(process.env[key]?.trim()),
      process.env[key]?.trim() ? "set" : "missing",
      "Run `bun run cms:local:bootstrap`.",
    );
  }

  if (
    !isLocalCmsVerificationTarget(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.PAYLOAD_DATABASE_URI,
    )
  ) {
    throw new Error(
      "Local CMS verification requires loopback Supabase and database URLs.",
    );
  }

  runPsql("select 1;");
  pass("postgres reachable", "loopback database");

  const seed = queryJson(`
    WITH tenant AS (
      SELECT id, slug FROM public.tenants
      WHERE id = '${DEMO_PUBLIC_TENANT_ID}'::uuid
    ),
    profile AS (
      SELECT id, email, role FROM public.profiles
      WHERE user_id = '${DEMO_ADMIN_USER_ID}'::uuid
    ),
    membership AS (
      SELECT user_id, tenant_id FROM authz.memberships
      WHERE user_id = '${DEMO_ADMIN_USER_ID}'::uuid
        AND tenant_id = '${DEMO_PUBLIC_TENANT_ID}'::uuid
        AND role = 'staff'
        AND is_active = true
      LIMIT 1
    ),
    missionary AS (
      SELECT id FROM public.missionaries
      WHERE tenant_id = '${DEMO_PUBLIC_TENANT_ID}'::uuid
      ORDER BY created_at, id
      LIMIT 1
    ),
    fund AS (
      SELECT id FROM public.funds
      WHERE tenant_id = '${DEMO_PUBLIC_TENANT_ID}'::uuid
        AND system_purpose IS NULL
      ORDER BY created_at, id
      LIMIT 1
    )
    SELECT json_build_object(
      'tenant', (SELECT row_to_json(tenant) FROM tenant),
      'profile', (SELECT row_to_json(profile) FROM profile),
      'membership', (SELECT row_to_json(membership) FROM membership),
      'missionary', (SELECT row_to_json(missionary) FROM missionary),
      'fund', (SELECT row_to_json(fund) FROM fund)
    )::text;
  `);
  assertCheck(
    "public seed tenant",
    seed?.tenant?.slug === DEMO_PUBLIC_TENANT_SLUG,
    DEMO_PUBLIC_TENANT_SLUG,
  );
  assertCheck(
    "public seed profile",
    seed?.profile?.email === DEMO_ADMIN_EMAIL,
    DEMO_ADMIN_EMAIL,
  );
  assertCheck(
    "public seed membership",
    Boolean(seed?.membership),
    "active staff membership",
  );
  assertCheck(
    "public seed missionary",
    Boolean(seed?.missionary?.id),
    seed?.missionary?.id ?? "missing",
  );
  assertCheck(
    "public seed fund",
    Boolean(seed?.fund?.id),
    seed?.fund?.id ?? "missing",
  );
  await verifyLocalSupabaseDemoPasswordAuth();

  const schema = queryJson(`
    SELECT json_build_object(
      'cmsSchema', EXISTS (
        SELECT 1 FROM information_schema.schemata WHERE schema_name = 'cms'
      ),
      'cmsTableCount', (
        SELECT count(*) FROM information_schema.tables WHERE table_schema = 'cms'
      )
    )::text;
  `);
  assertCheck("cms schema exists", schema?.cmsSchema === true, "schema cms");
  assertCheck(
    "cms tables exist",
    Number(schema?.cmsTableCount ?? 0) >= EDITORIAL_COLLECTIONS.length,
    `${schema?.cmsTableCount ?? 0} tables`,
    "Run `bun run cms:migrate`.",
  );

  runCommand("Payload migration status", "bun", ["run", "cms:migrate:status"], {
    cwd: repoRoot,
  });
  pass("payload migration status", "clean");

  await verifyPayloadSeed();

  assertCheck(
    "payload import map exists",
    fs.existsSync(adminImportMapPath),
    adminImportMapPath,
    "Run `bun run cms:importmap`.",
  );
  if (fs.existsSync(adminImportMapPath)) {
    const importMap = fs.readFileSync(adminImportMapPath, "utf8");
    for (const expected of [
      "PagesNativeListView",
      "NavigationNativeListView",
      "MediaNativeListView",
    ]) {
      assertCheck(
        `import map ${expected}`,
        importMap.includes(expected),
        "present",
      );
    }
  }

  await verifyHttpIfServerRunning(seed);

  const failed = checks.filter((check) => !check.ok);
  if (failed.length > 0) {
    process.exit(1);
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
