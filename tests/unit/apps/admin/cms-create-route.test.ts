import { readFileSync } from "node:fs";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { getCustomCollectionViewByRoute } from "../../../../apps/admin/node_modules/@payloadcms/ui/dist/views/Root/getCustomCollectionViewByRoute.js";

type Views = Record<string, unknown> | undefined;
type CollectionDef = {
  slug: string;
  admin?: { components?: { views?: Views } };
};

const ADMIN_ROUTE = "/web-studio";

/**
 * Payload saves an empty draft as soon as an autosave collection's stock
 * create view renders, so each visit to `/collections/<slug>/create` left an
 * "Untitled (N)" draft behind. Collections with a Core create flow serve that
 * flow on the create route instead: nothing is saved until the editor
 * submits the form.
 */
const CREATE_FLOWS: Record<string, string> = {
  pages:
    "/src/cms-ui/web-studio/flows/StandardPageFromTemplateView.tsx#StandardPageFromTemplateView",
  "ministry-updates":
    "/src/cms-ui/web-studio/flows/MinistryUpdateCreateView.tsx#MinistryUpdateCreateView",
  "missionary-giving-pages":
    "/src/cms-ui/web-studio/flows/MissionaryGivingCreateView.tsx#MissionaryGivingCreateView",
  "project-pages":
    "/src/cms-ui/web-studio/flows/ProjectPageCreateView.tsx#ProjectPageCreateView",
  // The gallery's registered view renders the new-template form when Payload
  // serves it on the Page Templates create route (it passes collectionSlug).
  "page-templates":
    "/src/cms-ui/web-studio/flows/TemplateGalleryView.tsx#TemplateGalleryView",
};

let collections: Record<string, CollectionDef>;

beforeAll(async () => {
  const [pages, updates, giving, projects, templates] = await Promise.all([
    import("../../../../apps/admin/src/cms/collections/pages"),
    import("../../../../apps/admin/src/cms/collections/ministry-updates"),
    import("../../../../apps/admin/src/cms/collections/missionary-giving-pages"),
    import("../../../../apps/admin/src/cms/collections/project-pages"),
    import("../../../../apps/admin/src/cms/collections/page-templates"),
  ]);
  collections = Object.fromEntries(
    [
      pages.Pages,
      updates.MinistryUpdates,
      giving.MissionaryGivingPages,
      projects.ProjectPages,
      templates.PageTemplates,
    ].map((collection) => [
      collection.slug,
      collection as unknown as CollectionDef,
    ]),
  );
});

function resolve(slug: string, route: string) {
  return getCustomCollectionViewByRoute({
    adminRoute: ADMIN_ROUTE,
    baseRoute: `/collections/${slug}`,
    currentRoute: `${ADMIN_ROUTE}${route}`,
    views: collections[slug]?.admin?.components?.views as never,
  });
}

describe("Web Studio create routes", () => {
  it.each(Object.entries(CREATE_FLOWS))(
    "serves %s's create route with its Core create flow",
    (slug, component) => {
      const view = resolve(slug, `/collections/${slug}/create`);
      expect(view.view.payloadComponent).toBe(component);
    },
  );

  it.each(Object.keys(CREATE_FLOWS))(
    "leaves %s's documents, versions and API views to Payload",
    (slug) => {
      for (const route of [
        `/collections/${slug}/12`,
        `/collections/${slug}/12/versions`,
        `/collections/${slug}/12/api`,
        `/collections/${slug}/create/extra`,
      ]) {
        expect(resolve(slug, route).viewKey).toBeNull();
      }
    },
  );

  it("reuses flow components the Payload import map already holds", () => {
    const importMap = readFileSync(
      path.join(
        process.cwd(),
        "apps/admin/app/(payload)/web-studio/importMap.js",
      ),
      "utf8",
    );
    for (const component of Object.values(CREATE_FLOWS)) {
      expect(importMap).toContain(`"${component}"`);
    }
  });
});
