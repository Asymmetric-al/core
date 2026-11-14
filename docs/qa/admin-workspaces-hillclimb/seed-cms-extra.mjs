// QA-only: adds realistic Web Studio content on top of `bun run cms:local:seed`
// so collection lists have enough rows to judge table design. Local scratch
// databases only; it refuses to run unless PAYLOAD_DATABASE_URI points at
// 127.0.0.1/localhost. Idempotent by slug/label.
// Usage: PAYLOAD_DATABASE_URI=postgresql://postgres:postgres@127.0.0.1:54322/postgres \
//   bun docs/qa/admin-workspaces-hillclimb/seed-cms-extra.mjs
import { createRequire } from "node:module";
import path from "node:path";

import nextEnv from "@next/env";

import {
  LOCAL_TEMPLATE_KEYS,
  createLexicalRichText,
  createLocalPageLayout,
} from "../../../scripts/cms/lib/local-data.mjs";
import { adminAppDir, repoRoot } from "../../../scripts/cms/lib/paths.mjs";

process.env.NODE_ENV ||= "development";
process.env.PAYLOAD_DISABLE_SCHEMA_PUSH ||= "1";
nextEnv.loadEnvConfig(repoRoot);

const uri = process.env.PAYLOAD_DATABASE_URI ?? "";
if (!/@(127\.0\.0\.1|localhost)[:/]/.test(uri)) {
  throw new Error("Refusing to seed: PAYLOAD_DATABASE_URI must be local.");
}

const PAGES = [
  [
    "About GiveHope",
    "about",
    "published",
    "Who we are, what we believe, and how partnership works.",
  ],
  [
    "Ways to Give",
    "ways-to-give",
    "published",
    "One-time, monthly, stock, and church partnership options.",
  ],
  [
    "Our Missionaries",
    "our-missionaries",
    "published",
    "Meet the field workers your partnership sends.",
  ],
  [
    "Annual Report 2025",
    "annual-report-2025",
    "published",
    "Stewardship, outcomes, and audited financials.",
  ],
  [
    "Church Partnerships",
    "church-partnerships",
    "draft",
    "Resources for mission committees and pastors.",
  ],
  [
    "Volunteer With Us",
    "volunteer",
    "published",
    "Short-term teams, hosting, and prayer partners.",
  ],
  ["Prayer Requests", "prayer", "draft", "Weekly prayer focus from the field."],
  [
    "Financial Accountability",
    "accountability",
    "published",
    "ECFA membership, policies, and statements.",
  ],
  [
    "Events and Gatherings",
    "events",
    "draft",
    "Vision dinners, missions weekends, and webinars.",
  ],
  ["Contact Us", "contact", "published", "Reach our donor care team."],
  [
    "Kenya School Build",
    "kenya-school-build",
    "draft",
    "Campaign landing page for the 2027 classroom wing.",
  ],
  [
    "Year-End Giving",
    "year-end-giving",
    "draft",
    "December matching campaign landing page.",
  ],
];

const UPDATES = [
  [
    "Wells Completed in Kajiado",
    "wells-completed-kajiado",
    "published",
    "Three new boreholes now serve 2,400 neighbors.",
  ],
  [
    "Teacher Training Week",
    "teacher-training-week",
    "published",
    "Forty teachers finished our literacy workshop.",
  ],
  [
    "Prayer for the Rainy Season",
    "prayer-rainy-season",
    "draft",
    "Roads are washing out; pray for safe travel.",
  ],
  [
    "Clinic Opening Day",
    "clinic-opening-day",
    "published",
    "The Mwea clinic saw 120 patients on day one.",
  ],
  [
    "Furlough Plans for Spring",
    "furlough-plans-spring",
    "draft",
    "Visiting partner churches March through May.",
  ],
];

const NAVIGATION = [
  [
    "Footer Navigation",
    [
      ["About", "/about"],
      ["Contact", "/contact"],
      ["Accountability", "/accountability"],
    ],
  ],
  [
    "Campaign Navigation",
    [
      ["Year-End Giving", "/year-end-giving"],
      ["Kenya School Build", "/kenya-school-build"],
    ],
  ],
];

async function findOne(payload, collection, where) {
  const result = await payload.find({
    collection,
    where,
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  });
  return result.docs[0] ?? null;
}

async function upsert(payload, collection, where, data, draft) {
  const existing = await findOne(payload, collection, where);
  const options = {
    collection,
    data,
    draft,
    overrideAccess: true,
    context: { cmsLocalSeed: true },
  };
  return existing
    ? payload.update({ ...options, id: existing.id })
    : payload.create(options);
}

async function main() {
  process.chdir(adminAppDir);
  const requireFromAdmin = createRequire(
    path.join(adminAppDir, "package.json"),
  );
  const [{ getPayload }, { default: config }] = await Promise.all([
    import(requireFromAdmin.resolve("payload")),
    import("../../../apps/admin/payload.config.ts"),
  ]);
  const payload = await getPayload({ config });
  try {
    const tenant =
      (await findOne(payload, "tenants", {
        slug: { equals: "00000000-0000-0000-0000-000000000001" },
      })) ??
      (await findOne(payload, "tenants", {
        slug: { equals: "give-hope-demo" },
      }));
    if (!tenant)
      throw new Error("Demo tenant missing; run cms:local:seed first.");
    const template = await findOne(payload, "page-templates", {
      templateKey: { equals: LOCAL_TEMPLATE_KEYS.standard },
    });
    const media = await findOne(payload, "media", {});
    const profile = await findOne(payload, "missionary-profiles", {
      tenant: { equals: tenant.id },
    });
    let count = 0;
    for (const [title, slug, status, summary] of PAGES) {
      await upsert(
        payload,
        "pages",
        {
          and: [{ tenant: { equals: tenant.id } }, { slug: { equals: slug } }],
        },
        {
          tenant: tenant.id,
          title,
          slug,
          summary,
          pageType: "standard",
          template: template?.id,
          layout: createLocalPageLayout({
            headline: title,
            mediaId: media?.id,
            variant: "standard",
          }),
          content: createLexicalRichText(summary),
          legacyContentFallback: true,
          _status: status,
        },
        status === "draft",
      );
      count++;
    }
    for (const [title, slug, status, excerpt] of UPDATES) {
      await upsert(
        payload,
        "ministry-updates",
        {
          and: [{ tenant: { equals: tenant.id } }, { slug: { equals: slug } }],
        },
        {
          tenant: tenant.id,
          missionary: profile?.id,
          title,
          slug,
          excerpt,
          content: createLexicalRichText(excerpt),
          publishedAt: "2026-10-15T00:00:00.000Z",
          _status: status,
        },
        status === "draft",
      );
      count++;
    }
    for (const [label, items] of NAVIGATION) {
      await upsert(
        payload,
        "navigation",
        {
          and: [
            { tenant: { equals: tenant.id } },
            { label: { equals: label } },
          ],
        },
        {
          tenant: tenant.id,
          label,
          items: items.map(([itemLabel, href]) => ({
            label: itemLabel,
            href,
            openInNewTab: false,
          })),
        },
      );
      count++;
    }
    process.stdout.write(`[ok] extra CMS rows upserted: ${count}\n`);
  } finally {
    await payload.destroy();
  }
}

await main();
