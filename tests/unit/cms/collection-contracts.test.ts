import { beforeAll, describe, expect, it } from "vitest";

import type { CollectionConfig, Field } from "payload";

let collections: Record<string, CollectionConfig>;

beforeAll(async () => {
  const load = (name: string) =>
    import(`../../../apps/admin/src/cms/collections/${name}.ts`);
  const [sites, pages, navigation, media, links] = await Promise.all([
    load("site-presentations"),
    load("pages"),
    load("navigation"),
    load("media"),
    load("principal-links"),
  ]);
  collections = {
    "site-presentations": sites.SitePresentations,
    pages: pages.Pages,
    navigation: navigation.Navigation,
    media: media.Media,
    "principal-links": links.PrincipalLinks,
  };
}, 60_000);

const named = (fields: Field[]) =>
  Object.fromEntries(
    fields.flatMap((field) => ("name" in field ? [[field.name, field]] : [])),
  ) as Record<string, Field & Record<string, unknown>>;

describe("CMS collection contracts (D-18: WP6 part 2b replaces the ten prototype collections with five, plan 6.2)", () => {
  it("defines exactly the five target collections", () => {
    expect(Object.values(collections).map((config) => config.slug)).toEqual([
      "site-presentations",
      "pages",
      "navigation",
      "media",
      "principal-links",
    ]);
  });

  it("keeps versions on pages only, with drafts validated, autosave every two seconds and at most 50 versions", () => {
    expect(collections.pages!.versions).toEqual({
      maxPerDoc: 50,
      drafts: {
        autosave: { interval: 2000, showSaveDraftButton: true },
        validate: true,
      },
    });
    for (const slug of [
      "site-presentations",
      "navigation",
      "media",
      "principal-links",
    ]) {
      expect(collections[slug]!.versions, slug).toBe(false);
    }
  });

  it("records authorship on the four tenant collections and not on principal-links", () => {
    for (const slug of ["site-presentations", "pages", "navigation", "media"]) {
      expect(collections[slug]!.authorship, slug).toBe(true);
    }
    expect(collections["principal-links"]!.authorship).toBe(false);
  });

  it("gives the four tenant collections a required, indexed tenant text field and principal-links none", () => {
    for (const slug of ["site-presentations", "pages", "navigation", "media"]) {
      expect(named(collections[slug]!.fields).tenant, slug).toMatchObject({
        type: "text",
        required: true,
        index: true,
      });
    }
    expect(
      named(collections["principal-links"]!.fields).tenant,
    ).toBeUndefined();
    expect(named(collections["principal-links"]!.fields).role).toBeUndefined();
  });

  it("gives pages its Site, family, references and indexed fields", () => {
    const fields = named(collections.pages!.fields);
    expect(fields.site).toMatchObject({
      type: "relationship",
      relationTo: "site-presentations",
      required: true,
    });
    expect(fields.family).toMatchObject({
      type: "select",
      defaultValue: "standard",
    });
    expect(
      (fields.family!.options as Array<{ value: string }>).map(
        (option) => option.value,
      ),
    ).toEqual(["standard", "missionary", "project"]);
    expect(fields.title).toMatchObject({ required: true });
    expect(fields.slug).toMatchObject({ required: true, index: true });
    for (const name of ["templateKey", "missionaryId", "fundId"]) {
      expect(fields[name], name).toMatchObject({ type: "text", index: true });
    }
    expect(fields.layout).toMatchObject({ type: "blocks" });
    expect(fields.content).toMatchObject({ type: "richText" });
    expect(fields.content!.required).toBeUndefined();
    expect(fields.legacyContentFallback).toMatchObject({ type: "checkbox" });
    expect(collections.pages!.admin?.useAsTitle).toBe("title");
  });

  it("keeps navigation items to a page or an address, and media to its three editorial fields", () => {
    const items = named(collections.navigation!.fields).items!;
    expect(items).toMatchObject({ type: "array", required: true });
    expect(Object.keys(named(items.fields as Field[]))).toEqual([
      "label",
      "page",
      "href",
      "openInNewTab",
    ]);
    expect(named(items.fields as Field[]).page).toMatchObject({
      type: "relationship",
      relationTo: "pages",
    });
    expect(collections.media!.upload).toBeUndefined();
    expect(Object.keys(named(collections.media!.fields))).toEqual([
      "tenant",
      "alt",
      "credit",
      "folder",
    ]);
    expect(collections.media!.admin?.useAsTitle).toBe("alt");
  });

  it("keeps principal-links an auth collection with no local strategy, an optional email and no list", () => {
    const links = collections["principal-links"]!;
    expect(links.auth).toMatchObject({ disableLocalStrategy: true });
    expect(named(links.fields).email).toMatchObject({ type: "text" });
    expect(named(links.fields).email!.required).toBeUndefined();
    expect(named(links.fields).email!.unique).toBeUndefined();
    expect(links.admin?.hidden).toBe(true);
    expect(links.admin?.components).toBeUndefined();
  });

  it("offers rich-text relationships to media only and internal links to pages only (note 2)", () => {
    for (const slug of [
      "pages",
      "navigation",
      "site-presentations",
      "principal-links",
    ]) {
      expect(collections[slug]!.admin?.enableRichTextRelationship, slug).toBe(
        false,
      );
    }
    expect(
      collections.media!.admin?.enableRichTextRelationship,
    ).toBeUndefined();
    for (const slug of [
      "media",
      "navigation",
      "site-presentations",
      "principal-links",
    ]) {
      expect(collections[slug]!.admin?.enableRichTextLink, slug).toBe(false);
    }
    expect(collections.pages!.admin?.enableRichTextLink).toBeUndefined();
  });

  it("registers native Mission Control list and edit views for pages, navigation and media", () => {
    for (const slug of ["pages", "navigation", "media"]) {
      const views = collections[slug]!.admin?.components?.views as
        Record<string, unknown> | undefined;
      expect(views?.list, slug).toBeDefined();
      expect(views?.edit, slug).toBeDefined();
    }
  });
});
