import {
  createSitePresentation,
  registerMediaRecord,
  serviceCreate,
  serviceFind,
} from "../../../apps/admin/src/cms/ports/service-port.ts";
import {
  createLexicalRichText,
  createLocalPageLayout,
  FIXTURE_MEDIA_ALT,
  FIXTURE_NAVIGATION_LABEL,
  LOCAL_SEED_SLUGS,
} from "./local-data.mjs";

async function findOne(payload, collection, where) {
  const [doc] = await serviceFind(payload, { collection, where, draft: true });
  return doc ?? null;
}

async function ensurePage(payload, { site, tenantId, slug, data, publish }) {
  const existing = await findOne(payload, "pages", {
    and: [{ site: { equals: site } }, { slug: { equals: slug } }],
  });
  if (existing) return { doc: existing, status: "kept" };
  const doc = await serviceCreate(payload, {
    collection: "pages",
    data: {
      tenant: tenantId,
      site,
      slug,
      family: "standard",
      ...data,
      ...(publish ? { _status: "published" } : {}),
    },
    draft: !publish,
  });
  return { doc, status: "inserted" };
}

export async function seedCmsFixtures(payload, sites) {
  const summary = {};
  for (const site of sites) {
    await createSitePresentation(payload, {
      siteId: site.id,
      tenantId: site.tenantId,
    });
  }
  summary["site presentations"] = String(sites.length);

  const defaults = sites.filter((site) => site.isDefault);
  for (const site of defaults) {
    const media = await registerMediaRecord(payload, {
      id: site.mediaId,
      tenantId: site.tenantId,
      alt: FIXTURE_MEDIA_ALT,
      credit: "Local seed",
      folder: "Seed",
    });
    const home = await ensurePage(payload, {
      site: site.id,
      tenantId: site.tenantId,
      slug: LOCAL_SEED_SLUGS.homePage,
      publish: true,
      data: {
        title: "Local CMS Home",
        summary: "Published local CMS home page from deterministic seed data.",
        layout: createLocalPageLayout({
          headline: "Local CMS Home",
          mediaId: media.id,
          variant: "standard",
        }),
        content: createLexicalRichText("Published local CMS home content."),
        legacyContentFallback: true,
      },
    });
    await ensurePage(payload, {
      site: site.id,
      tenantId: site.tenantId,
      slug: LOCAL_SEED_SLUGS.draftPage,
      publish: false,
      data: {
        title: "Local CMS Draft Preview",
        summary: "Draft-only local CMS page used by preview tests.",
        layout: createLocalPageLayout({
          headline: "Local CMS Draft Preview",
          mediaId: media.id,
          variant: "standard",
        }),
        content: createLexicalRichText("Draft local CMS preview content."),
        legacyContentFallback: true,
      },
    });
    const navigation = await findOne(payload, "navigation", {
      and: [
        { site: { equals: site.id } },
        { label: { equals: FIXTURE_NAVIGATION_LABEL } },
      ],
    });
    if (!navigation) {
      await serviceCreate(payload, {
        collection: "navigation",
        data: {
          tenant: site.tenantId,
          site: site.id,
          label: FIXTURE_NAVIGATION_LABEL,
          items: [
            { label: "Home", page: home.doc.id, openInNewTab: false },
            {
              label: "Give",
              href: "https://example.org/give",
              openInNewTab: false,
            },
          ],
        },
      });
    }
  }
  summary["media records"] = String(defaults.length);
  summary["seeded Sites with pages"] = String(defaults.length);
  return summary;
}
