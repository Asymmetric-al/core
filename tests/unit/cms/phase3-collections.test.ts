import { beforeAll, describe, expect, it } from "vitest";

import {
  MISSIONARY_GIVING_PAGES_SLUG,
  PAGE_TEMPLATES_SLUG,
  PROJECT_PAGES_SLUG,
} from "../../../apps/admin/src/cms/constants";

type FieldDef = { name?: string; type?: string; required?: boolean };
type CollectionDef = {
  slug: string;
  fields: FieldDef[];
  versions?: { drafts?: unknown };
  admin?: {
    components?: {
      views?: {
        list?: { Component?: string };
        edit?: { default?: { Component?: string } };
      };
    };
    preview?: unknown;
  };
};

let MissionaryGivingPages: CollectionDef;
let ProjectPages: CollectionDef;
let PageTemplates: CollectionDef;

function getField(collection: CollectionDef, name: string) {
  const field = collection.fields.find((entry) => entry.name === name);
  expect(field).toBeDefined();
  return field as FieldDef;
}

beforeAll(async () => {
  const [mgp, pp, pt] = await Promise.all([
    import("../../../apps/admin/src/cms/collections/missionary-giving-pages"),
    import("../../../apps/admin/src/cms/collections/project-pages"),
    import("../../../apps/admin/src/cms/collections/page-templates"),
  ]);

  MissionaryGivingPages = mgp.MissionaryGivingPages;
  ProjectPages = pp.ProjectPages;
  PageTemplates = pt.PageTemplates;
});

describe("Phase 3 CMS collections", () => {
  it("uses stable slugs aligned with constants", () => {
    expect(MissionaryGivingPages.slug).toBe(MISSIONARY_GIVING_PAGES_SLUG);
    expect(ProjectPages.slug).toBe(PROJECT_PAGES_SLUG);
    expect(PageTemplates.slug).toBe(PAGE_TEMPLATES_SLUG);
  });

  it("requires tenant on builder collections", () => {
    for (const collection of [
      MissionaryGivingPages,
      ProjectPages,
      PageTemplates,
    ]) {
      const tenantField = getField(collection, "tenant");
      expect(tenantField.type).toBe("relationship");
      expect(tenantField.required).toBe(true);
    }
  });

  it("anchors missionary giving pages to canonical missionary id", () => {
    const field = getField(MissionaryGivingPages, "missionaryId");
    expect(field.type).toBe("text");
    expect(field.required).toBe(true);
  });

  it("anchors project pages to canonical fund id", () => {
    const field = getField(ProjectPages, "fundId");
    expect(field.type).toBe("text");
    expect(field.required).toBe(true);
  });

  it("enables drafts for versioned editorial collections", () => {
    expect(MissionaryGivingPages.versions?.drafts).toBeDefined();
    expect(ProjectPages.versions?.drafts).toBeDefined();
    expect(PageTemplates.versions?.drafts).toBeDefined();
  });

  it("registers native Web Studio list/edit when flags default on", () => {
    expect(
      MissionaryGivingPages.admin?.components?.views?.list?.Component,
    ).toContain("MissionaryGivingPagesNativeListView");
    expect(
      MissionaryGivingPages.admin?.components?.views?.edit?.default?.Component,
    ).toContain("MissionaryGivingPagesNativeEditView");

    expect(ProjectPages.admin?.components?.views?.list?.Component).toContain(
      "ProjectPagesNativeListView",
    );
    expect(
      ProjectPages.admin?.components?.views?.edit?.default?.Component,
    ).toContain("ProjectPagesNativeEditView");

    expect(PageTemplates.admin?.components?.views?.list?.Component).toContain(
      "PageTemplatesNativeListView",
    );
    expect(
      PageTemplates.admin?.components?.views?.edit?.default?.Component,
    ).toContain("PageTemplatesNativeEditView");
  });

  it("wires preview for page-builder collections that ship to donor", () => {
    expect(MissionaryGivingPages.admin?.preview).toBeTypeOf("function");
    expect(ProjectPages.admin?.preview).toBeTypeOf("function");
  });
});
