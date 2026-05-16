import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import nextEnv from "@next/env";

import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_USER_ID,
  DEMO_PUBLIC_TENANT_ID,
  DEMO_PUBLIC_TENANT_NAME,
  DEMO_PUBLIC_TENANT_SLUG,
  LOCAL_SEED_SLUGS,
  LOCAL_TEMPLATE_KEYS,
  SECOND_PUBLIC_TENANT_ID,
  SECOND_PUBLIC_TENANT_NAME,
  SECOND_PUBLIC_TENANT_SLUG,
  createLexicalRichText,
  createLocalPageLayout,
} from "./lib/local-data.mjs";
import { executeSql, queryJson } from "./lib/postgres.mjs";
import {
  adminAppDir,
  adminMediaDir,
  localCmsTmpDir,
  repoRoot,
} from "./lib/paths.mjs";

const { loadEnvConfig } = nextEnv;

process.env.NODE_ENV ||= "development";
process.env.PAYLOAD_DISABLE_SCHEMA_PUSH ||= "1";
loadEnvConfig(repoRoot);

const LOCAL_MEDIA_ALT = "Local CMS Demo Image";
const LOCAL_MEDIA_CAPTION = "Local seed image";
const LOCAL_MEDIA_FILENAME = "local-cms-demo.png";
const FIXTURE_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lE2V2QAAAABJRU5ErkJggg==";

function printSummary(summary) {
  for (const [key, value] of Object.entries(summary)) {
    process.stdout.write(`[ok] ${key}: ${value}\n`);
  }
}

function relationId(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  if (typeof value === "object" && "id" in value) {
    return value.id;
  }

  return null;
}

async function findOne(payload, collection, where) {
  const result = await payload.find({
    collection,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where,
  });

  return result.docs[0] ?? null;
}

async function upsertOne(payload, collection, where, data, options = {}) {
  const existing = await findOne(payload, collection, where);
  if (existing?.id !== undefined && existing.id !== null) {
    const doc = await payload.update({
      id: existing.id,
      collection,
      context: { cmsLocalSeed: true },
      data,
      draft: options.draft,
      filePath: options.filePath,
      overrideAccess: true,
    });
    return { doc, status: "updated" };
  }

  const doc = await payload.create({
    collection,
    context: { cmsLocalSeed: true },
    data,
    draft: options.draft,
    filePath: options.filePath,
    overrideAccess: true,
  });
  return { doc, status: "inserted" };
}

function createMediaFixture() {
  fs.mkdirSync(localCmsTmpDir, { recursive: true });
  const fixturePath = path.join(localCmsTmpDir, LOCAL_MEDIA_FILENAME);
  fs.writeFileSync(fixturePath, Buffer.from(FIXTURE_PNG_BASE64, "base64"));
  return fixturePath;
}

function ensureLocalMediaFile(fixturePath) {
  for (const mediaDir of [adminMediaDir, path.join(repoRoot, "media")]) {
    fs.mkdirSync(mediaDir, { recursive: true });
    fs.copyFileSync(fixturePath, path.join(mediaDir, LOCAL_MEDIA_FILENAME));
  }
}

function createTemplateData({
  mediaId,
  pageType,
  summary,
  templateKey,
  tenantId,
  title,
}) {
  return {
    tenant: tenantId,
    name: title,
    templateKey,
    description:
      "Deterministic local seed template for Web Studio create-from-template flows.",
    pageType,
    thumbnail: mediaId,
    defaultSummary: summary,
    defaultLayout: createLocalPageLayout({
      headline: title,
      mediaId,
      variant: pageType === "project" ? "project" : "standard",
    }),
    _status: "published",
  };
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
    ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        org_settings = EXCLUDED.org_settings,
        updated_at = EXCLUDED.updated_at;
  `);

  return seed;
}

async function seedCmsContent(payload, publicSeed) {
  const summary = {};

  const tenantResult = await upsertOne(
    payload,
    "tenants",
    { slug: { equals: DEMO_PUBLIC_TENANT_SLUG } },
    {
      name: DEMO_PUBLIC_TENANT_NAME,
      slug: DEMO_PUBLIC_TENANT_SLUG,
      primaryDomain: "localhost",
      isActive: true,
    },
  );
  const tenantId = relationId(tenantResult.doc);
  summary["cms tenant"] = `${DEMO_PUBLIC_TENANT_SLUG} ${tenantResult.status}`;

  const secondTenantResult = await upsertOne(
    payload,
    "tenants",
    { slug: { equals: SECOND_PUBLIC_TENANT_SLUG } },
    {
      name: SECOND_PUBLIC_TENANT_NAME,
      slug: SECOND_PUBLIC_TENANT_SLUG,
      primaryDomain: "second.localhost",
      isActive: true,
    },
  );
  const secondTenantId = relationId(secondTenantResult.doc);
  summary["second cms tenant"] =
    `${SECOND_PUBLIC_TENANT_SLUG} ${secondTenantResult.status}`;

  const userResult = await upsertOne(
    payload,
    "cms-users",
    { supabaseUserId: { equals: DEMO_ADMIN_USER_ID } },
    {
      email: DEMO_ADMIN_EMAIL,
      role: "admin",
      supabaseUserId: DEMO_ADMIN_USER_ID,
      tenantId: String(tenantId),
    },
  );
  summary["cms user"] = `${DEMO_ADMIN_EMAIL} ${userResult.status}`;

  const fixturePath = createMediaFixture();
  const mediaResult = await upsertOne(
    payload,
    "media",
    { alt: { equals: LOCAL_MEDIA_ALT } },
    {
      tenant: tenantId,
      alt: LOCAL_MEDIA_ALT,
      caption: LOCAL_MEDIA_CAPTION,
    },
    { filePath: fixturePath },
  );
  ensureLocalMediaFile(fixturePath);
  const mediaId = relationId(mediaResult.doc);
  summary.media = `${LOCAL_MEDIA_ALT} ${mediaResult.status}`;

  const templateSpecs = [
    {
      key: LOCAL_TEMPLATE_KEYS.standard,
      pageType: "standard",
      title: "Standard Page Template",
      summary: "Local standard page template summary.",
    },
    {
      key: LOCAL_TEMPLATE_KEYS.missionaryGiving,
      pageType: "missionary_giving",
      title: "Missionary Giving Page Template",
      summary: "Local missionary giving page template summary.",
    },
    {
      key: LOCAL_TEMPLATE_KEYS.project,
      pageType: "project",
      title: "Project Page Template",
      summary: "Local project page template summary.",
    },
    {
      key: LOCAL_TEMPLATE_KEYS.ministryUpdate,
      pageType: "ministry_update",
      title: "Ministry Update Starter Template",
      summary: "Local ministry update starter summary.",
    },
  ];

  const templates = {};
  let templateInsertedOrUpdated = 0;
  for (const spec of templateSpecs) {
    const result = await upsertOne(
      payload,
      "page-templates",
      {
        and: [
          { tenant: { equals: tenantId } },
          { templateKey: { equals: spec.key } },
        ],
      },
      createTemplateData({
        mediaId,
        pageType: spec.pageType,
        summary: spec.summary,
        templateKey: spec.key,
        tenantId,
        title: spec.title,
      }),
      { draft: false },
    );
    templates[spec.key] = result.doc;
    templateInsertedOrUpdated += 1;
  }
  summary["page templates"] = String(templateInsertedOrUpdated);

  const homePageResult = await upsertOne(
    payload,
    "pages",
    {
      and: [
        { tenant: { equals: tenantId } },
        { slug: { equals: LOCAL_SEED_SLUGS.homePage } },
      ],
    },
    {
      tenant: tenantId,
      title: "Local CMS Home",
      slug: LOCAL_SEED_SLUGS.homePage,
      summary: "Published local CMS home page from deterministic seed data.",
      pageType: "standard",
      template: relationId(templates[LOCAL_TEMPLATE_KEYS.standard]),
      layout: createLocalPageLayout({
        headline: "Local CMS Home",
        mediaId,
        variant: "standard",
      }),
      content: createLexicalRichText("Published local CMS home content."),
      legacyContentFallback: true,
      _status: "published",
    },
    { draft: false },
  );
  summary["published page"] =
    `${LOCAL_SEED_SLUGS.homePage} ${homePageResult.status}`;

  const draftPageResult = await upsertOne(
    payload,
    "pages",
    {
      and: [
        { tenant: { equals: tenantId } },
        { slug: { equals: LOCAL_SEED_SLUGS.draftPage } },
      ],
    },
    {
      tenant: tenantId,
      title: "Local CMS Draft Preview",
      slug: LOCAL_SEED_SLUGS.draftPage,
      summary: "Draft-only local CMS page used by preview tests.",
      pageType: "standard",
      template: relationId(templates[LOCAL_TEMPLATE_KEYS.standard]),
      layout: createLocalPageLayout({
        headline: "Local CMS Draft Preview",
        mediaId,
        variant: "standard",
      }),
      content: createLexicalRichText("Draft local CMS preview content."),
      legacyContentFallback: true,
      _status: "draft",
    },
    { draft: true },
  );
  summary["draft page"] =
    `${LOCAL_SEED_SLUGS.draftPage} ${draftPageResult.status}`;

  const navResult = await upsertOne(
    payload,
    "navigation",
    {
      and: [
        { tenant: { equals: tenantId } },
        { label: { equals: "Main Navigation" } },
      ],
    },
    {
      tenant: tenantId,
      label: "Main Navigation",
      items: [
        { label: "Home", href: "/", openInNewTab: false },
        {
          label: "Local CMS",
          href: `/${LOCAL_SEED_SLUGS.homePage}`,
          openInNewTab: false,
        },
        { label: "Give", href: "/give", openInNewTab: false },
        {
          label: "Projects",
          href: `/projects/${LOCAL_SEED_SLUGS.projectPage}`,
          openInNewTab: false,
        },
      ],
    },
  );
  summary.navigation = `Main Navigation ${navResult.status}`;

  const missionaryName =
    publicSeed.missionaryProfile.full_name ||
    publicSeed.missionaryProfile.display_name ||
    "Local Missionary";
  const missionaryProfileResult = await upsertOne(
    payload,
    "missionary-profiles",
    {
      and: [
        { tenant: { equals: tenantId } },
        {
          supabaseMissionaryId: {
            equals: publicSeed.missionary.id,
          },
        },
      ],
    },
    {
      tenant: tenantId,
      fullName: missionaryName,
      slug: "local-missionary",
      supabaseMissionaryId: publicSeed.missionary.id,
      tagline: publicSeed.missionary.tagline || "Local seed tagline",
      bio: publicSeed.missionary.bio || "Local seed bio",
      location: publicSeed.missionary.location || "Local seed location",
      portrait: mediaId,
    },
  );
  const missionaryProfileId = relationId(missionaryProfileResult.doc);
  summary["missionary profile"] =
    `${missionaryName} ${missionaryProfileResult.status}`;

  const ministryUpdateResult = await upsertOne(
    payload,
    "ministry-updates",
    {
      and: [
        { tenant: { equals: tenantId } },
        { slug: { equals: LOCAL_SEED_SLUGS.ministryUpdate } },
      ],
    },
    {
      tenant: tenantId,
      missionary: missionaryProfileId,
      title: "Local Ministry Update",
      slug: LOCAL_SEED_SLUGS.ministryUpdate,
      excerpt: "Local CMS seed update excerpt.",
      content: createLexicalRichText(
        "This published ministry update is seeded locally through Payload.",
      ),
      publishedAt: "2026-05-16T00:00:00.000Z",
      _status: "published",
    },
    { draft: false },
  );
  summary["ministry update"] =
    `${LOCAL_SEED_SLUGS.ministryUpdate} ${ministryUpdateResult.status}`;

  const givingPageResult = await upsertOne(
    payload,
    "missionary-giving-pages",
    {
      and: [
        { tenant: { equals: tenantId } },
        { missionaryId: { equals: publicSeed.missionary.id } },
      ],
    },
    {
      tenant: tenantId,
      missionaryId: publicSeed.missionary.id,
      missionaryProfile: missionaryProfileId,
      templateKey: LOCAL_TEMPLATE_KEYS.missionaryGiving,
      template: relationId(templates[LOCAL_TEMPLATE_KEYS.missionaryGiving]),
      title: `${missionaryName} - Give`,
      slug: "local-missionary-giving",
      summary: "Published local missionary giving page.",
      pageType: "missionary_giving",
      layout: createLocalPageLayout({
        headline: `${missionaryName} - Give`,
        mediaId,
        variant: "standard",
      }),
      _status: "published",
    },
    { draft: false },
  );
  summary["missionary giving page"] =
    `${publicSeed.missionary.id} ${givingPageResult.status}`;

  const projectPageResult = await upsertOne(
    payload,
    "project-pages",
    {
      and: [
        { tenant: { equals: tenantId } },
        { slug: { equals: LOCAL_SEED_SLUGS.projectPage } },
      ],
    },
    {
      tenant: tenantId,
      fundId: publicSeed.fund.id,
      templateKey: LOCAL_TEMPLATE_KEYS.project,
      template: relationId(templates[LOCAL_TEMPLATE_KEYS.project]),
      title: publicSeed.fund.name || "Local Project",
      slug: LOCAL_SEED_SLUGS.projectPage,
      summary: publicSeed.fund.description || "Published local project page.",
      pageType: "project",
      layout: createLocalPageLayout({
        headline: publicSeed.fund.name || "Local Project",
        mediaId,
        variant: "project",
      }),
      _status: "published",
    },
    { draft: false },
  );
  summary["project page"] =
    `${LOCAL_SEED_SLUGS.projectPage} ${projectPageResult.status}`;

  await upsertOne(
    payload,
    "pages",
    {
      and: [
        { tenant: { equals: secondTenantId } },
        { slug: { equals: LOCAL_SEED_SLUGS.secondTenantPage } },
      ],
    },
    {
      tenant: secondTenantId,
      title: "Second Tenant Local CMS Home",
      slug: LOCAL_SEED_SLUGS.secondTenantPage,
      summary: "Second tenant collision page for isolation tests.",
      pageType: "standard",
      layout: createLocalPageLayout({
        headline: "Second Tenant Local CMS Home",
        mediaId,
        variant: "standard",
      }),
      content: createLexicalRichText("Second tenant local CMS content."),
      legacyContentFallback: true,
      _status: "published",
    },
    { draft: false },
  );
  summary["second tenant page"] = LOCAL_SEED_SLUGS.secondTenantPage;

  return summary;
}

async function main() {
  const publicSeed = await ensurePublicSeedRows();

  const originalCwd = process.cwd();
  process.chdir(adminAppDir);

  const requireFromAdmin = createRequire(
    path.join(adminAppDir, "package.json"),
  );
  const [{ getPayload }, { default: config }] = await Promise.all([
    import(requireFromAdmin.resolve("payload")),
    import("../../apps/admin/payload.config.ts"),
  ]);
  const payload = await getPayload({ config });

  try {
    const summary = await seedCmsContent(payload, publicSeed);
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
