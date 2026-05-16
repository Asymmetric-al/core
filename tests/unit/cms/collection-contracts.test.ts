import { beforeAll, describe, expect, it } from "vitest";

type FieldDef = {
  admin?: {
    readOnly?: boolean;
  };
  name?: string;
  type?: string;
  required?: boolean;
  validate?: (value: unknown) => true | string | Promise<true | string>;
};

type CollectionDef = {
  slug: string;
  fields: FieldDef[];
  versions?: {
    drafts?: {
      autosave?: {
        interval?: number;
        showSaveDraftButton?: boolean;
      };
    };
  };
  upload?: {
    staticDir?: string;
    imageSizes?: Array<{ name?: string; width?: number; height?: number }>;
    mimeTypes?: string[];
    pasteURL?: boolean;
  };
  auth?: {
    disableLocalStrategy?: boolean;
    strategies?: unknown[];
  };
  admin?: {
    components?: {
      views?: {
        edit?: {
          default?: {
            Component?: string;
          };
        };
        list?: {
          Component?: string;
        };
      };
    };
    preview?: unknown;
    useAsTitle?: string;
  };
};

let CmsUsers: CollectionDef;
let Media: CollectionDef;
let MinistryUpdates: CollectionDef;
let MissionaryGivingPages: CollectionDef;
let MissionaryProfiles: CollectionDef;
let Navigation: CollectionDef;
let Pages: CollectionDef;
let ProjectPages: CollectionDef;
let Tenants: CollectionDef;
let CMS_USERS_SLUG: string;

function getField(collection: CollectionDef, name: string) {
  const field = collection.fields.find((entry) => entry.name === name);
  expect(field).toBeDefined();
  return field as FieldDef;
}

beforeAll(async () => {
  const [
    cmsUsersModule,
    mediaModule,
    ministryUpdatesModule,
    missionaryGivingPagesModule,
    missionaryProfilesModule,
    navigationModule,
    pagesModule,
    projectPagesModule,
    tenantsModule,
    constantsModule,
  ] = await Promise.all([
    import("../../../apps/admin/src/cms/collections/cms-users"),
    import("../../../apps/admin/src/cms/collections/media"),
    import("../../../apps/admin/src/cms/collections/ministry-updates"),
    import("../../../apps/admin/src/cms/collections/missionary-giving-pages"),
    import("../../../apps/admin/src/cms/collections/missionary-profiles"),
    import("../../../apps/admin/src/cms/collections/navigation"),
    import("../../../apps/admin/src/cms/collections/pages"),
    import("../../../apps/admin/src/cms/collections/project-pages"),
    import("../../../apps/admin/src/cms/collections/tenants"),
    import("../../../apps/admin/src/cms/constants"),
  ]);

  CmsUsers = cmsUsersModule.CmsUsers;
  Media = mediaModule.Media;
  MinistryUpdates = ministryUpdatesModule.MinistryUpdates;
  MissionaryGivingPages = missionaryGivingPagesModule.MissionaryGivingPages;
  MissionaryProfiles = missionaryProfilesModule.MissionaryProfiles;
  Navigation = navigationModule.Navigation;
  Pages = pagesModule.Pages;
  ProjectPages = projectPagesModule.ProjectPages;
  Tenants = tenantsModule.Tenants;
  CMS_USERS_SLUG = constantsModule.CMS_USERS_SLUG;
});

describe("CMS collection contracts", () => {
  it("defines expected tenant-scoped collections", () => {
    expect(Pages.slug).toBe("pages");
    expect(Navigation.slug).toBe("navigation");
    expect(MissionaryProfiles.slug).toBe("missionary-profiles");
    expect(MinistryUpdates.slug).toBe("ministry-updates");
    expect(Media.slug).toBe("media");
  });

  it("enables drafts only for publish-managed collections", () => {
    expect(Pages.versions?.drafts?.autosave?.interval).toBe(300);
    expect(MinistryUpdates.versions?.drafts?.autosave?.interval).toBe(300);
    expect(Pages.versions?.drafts?.autosave?.showSaveDraftButton).toBe(true);
    expect(
      MinistryUpdates.versions?.drafts?.autosave?.showSaveDraftButton,
    ).toBe(true);

    expect(Navigation.versions).toBeUndefined();
    expect(MissionaryProfiles.versions).toBeUndefined();
    expect(Media.versions).toBeUndefined();
  });

  it("requires tenant relationship on all tenant-scoped collections", () => {
    for (const collection of [
      Pages,
      Navigation,
      MissionaryProfiles,
      MinistryUpdates,
      Media,
    ]) {
      const tenantField = getField(collection, "tenant");
      expect(tenantField.type).toBe("relationship");
      expect(tenantField.required).toBe(true);
    }
  });

  it("uses expected primary fields per collection", () => {
    expect(getField(Pages, "title").type).toBe("text");
    expect(getField(Pages, "content").type).toBe("richText");
    expect(getField(Navigation, "items").type).toBe("array");
    expect(getField(MissionaryProfiles, "fullName").type).toBe("text");
    expect(getField(MissionaryProfiles, "portrait").type).toBe("relationship");
    expect(getField(MinistryUpdates, "missionary").type).toBe("relationship");
    expect(getField(MinistryUpdates, "content").type).toBe("richText");
    expect(getField(Media, "alt").type).toBe("text");
  });

  it("keeps navigation array item contract for UI controls", () => {
    const itemsField = getField(Navigation, "items") as FieldDef & {
      fields?: FieldDef[];
    };

    expect(itemsField.required).toBe(true);
    const itemFields = itemsField.fields ?? [];

    expect(itemFields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "label",
          type: "text",
          required: true,
        }),
        expect.objectContaining({
          name: "href",
          type: "text",
          required: true,
        }),
        expect.objectContaining({
          name: "openInNewTab",
          type: "checkbox",
        }),
      ]),
    );
  });

  it("keeps media upload transforms for thumbnail and card surfaces", () => {
    expect(Media.upload).toEqual(
      expect.objectContaining({
        staticDir: "media",
        mimeTypes: [
          "image/avif",
          "image/gif",
          "image/jpeg",
          "image/png",
          "image/webp",
        ],
        pasteURL: false,
        imageSizes: expect.arrayContaining([
          expect.objectContaining({
            name: "thumbnail",
            width: 320,
            height: 320,
          }),
          expect.objectContaining({ name: "card", width: 960, height: 540 }),
        ]),
      }),
    );
  });

  it("keeps tenant and cms-user admin models stable", () => {
    expect(Tenants.slug).toBe("tenants");
    expect(Tenants.admin?.useAsTitle).toBe("name");
    expect(getField(Tenants, "name").required).toBe(true);
    expect(getField(Tenants, "slug").required).toBe(true);

    expect(CmsUsers.slug).toBe(CMS_USERS_SLUG);
    expect(CmsUsers.auth?.disableLocalStrategy).toBe(true);
    expect(CmsUsers.auth?.strategies).toHaveLength(1);
    expect(getField(CmsUsers, "email").type).toBe("email");
    expect(getField(CmsUsers, "role").type).toBe("select");
  });

  it("validates giving CTA source references as UUIDs", async () => {
    const missionaryIdField = getField(MissionaryGivingPages, "missionaryId");
    const fundIdField = getField(ProjectPages, "fundId");
    const missionaryProfileSourceField = getField(
      MissionaryProfiles,
      "supabaseMissionaryId",
    );

    expect(missionaryIdField.validate).toBeTypeOf("function");
    expect(fundIdField.validate).toBeTypeOf("function");
    expect(missionaryIdField.admin?.readOnly).toBe(true);
    expect(fundIdField.admin?.readOnly).toBe(true);
    expect(missionaryProfileSourceField.admin?.readOnly).toBe(true);
    expect(
      await missionaryIdField.validate?.(
        "123e4567-e89b-42d3-a456-426614174111",
      ),
    ).toBe(true);
    expect(
      await missionaryProfileSourceField.validate?.(
        "123e4567-e89b-42d3-a456-426614174111",
      ),
    ).toBe(true);
    expect(
      await missionaryProfileSourceField.validate?.(
        "11111111-1111-1111-1111-111111111111",
      ),
    ).toBe(true);
    expect(await fundIdField.validate?.("not-a-uuid")).toBe(
      "Must be a valid UUID reference.",
    );
    expect(await missionaryProfileSourceField.validate?.("not-a-uuid")).toBe(
      "Must be a valid UUID reference.",
    );
  });

  it("registers native Mission Control list/edit views for editorial collections", () => {
    expect(Pages.admin?.components?.views?.list?.Component).toContain(
      "PagesNativeListView",
    );
    expect(Pages.admin?.components?.views?.edit?.default?.Component).toContain(
      "PagesNativeEditView",
    );
    expect(Pages.admin?.preview).toBeTypeOf("function");

    expect(Navigation.admin?.components?.views?.list?.Component).toContain(
      "NavigationNativeListView",
    );
    expect(
      Navigation.admin?.components?.views?.edit?.default?.Component,
    ).toContain("NavigationNativeEditView");

    expect(
      MissionaryProfiles.admin?.components?.views?.list?.Component,
    ).toContain("MissionaryProfilesNativeListView");
    expect(
      MissionaryProfiles.admin?.components?.views?.edit?.default?.Component,
    ).toContain("MissionaryProfilesNativeEditView");

    expect(MinistryUpdates.admin?.components?.views?.list?.Component).toContain(
      "MinistryUpdatesNativeListView",
    );
    expect(
      MinistryUpdates.admin?.components?.views?.edit?.default?.Component,
    ).toContain("MinistryUpdatesNativeEditView");

    expect(Media.admin?.components?.views?.list?.Component).toContain(
      "MediaNativeListView",
    );
    expect(Media.admin?.components?.views?.edit?.default?.Component).toContain(
      "MediaNativeEditView",
    );
  });
});
