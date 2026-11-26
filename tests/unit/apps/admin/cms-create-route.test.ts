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

const CREATE_FLOWS: Record<string, string> = {
  pages:
    "/src/cms-ui/web-studio/flows/StandardPageFromTemplateView.tsx#StandardPageFromTemplateView",
};

let collections: Record<string, CollectionDef>;

beforeAll(async () => {
  const [pages, navigation, media] = await Promise.all([
    import("../../../../apps/admin/src/cms/collections/pages"),
    import("../../../../apps/admin/src/cms/collections/navigation"),
    import("../../../../apps/admin/src/cms/collections/media"),
  ]);
  collections = Object.fromEntries(
    [pages.Pages, navigation.Navigation, media.Media].map((collection) => [
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

describe("Web Studio create routes (D-18: WP6 part 2b leaves pages the one collection with a create flow; navigation and media create through Payload's form or the service port)", () => {
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

  it.each(["navigation", "media"])("gives %s no Core create flow", (slug) => {
    expect(resolve(slug, `/collections/${slug}/create`).viewKey).toBeNull();
  });

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
