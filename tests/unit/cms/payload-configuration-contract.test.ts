import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

type PayloadConfig = Awaited<
  (typeof import("../../../apps/admin/payload.config"))["default"]
>;

let config: PayloadConfig;

beforeAll(async () => {
  vi.stubEnv("PAYLOAD_DISABLE_SCHEMA_PUSH", "1");
  vi.stubEnv("BLOB_READ_WRITE_TOKEN", undefined);
  vi.stubEnv("RESEND_API_KEY", undefined);
  const { default: configured } =
    await import("../../../apps/admin/payload.config");
  config = await configured;
}, 30_000);

afterAll(() => vi.unstubAllEnvs());

const collectionContracts = [
  { slug: "cms-users", versioned: false },
  { slug: "tenants", versioned: false },
  { slug: "pages", versioned: true },
  { slug: "page-templates", versioned: true },
  { slug: "missionary-giving-pages", versioned: true },
  { slug: "project-pages", versioned: true },
  { slug: "navigation", versioned: false },
  { slug: "missionary-profiles", versioned: false },
  { slug: "ministry-updates", versioned: true },
  { slug: "media", versioned: false },
];

describe.each(collectionContracts)(
  "$slug storage contract",
  ({ slug, versioned }) => {
    it("retains the reviewed version-history setting", () => {
      const collection = config.collections.find(
        (entry) => entry.slug === slug,
      );
      if (!collection) throw new Error(`Missing product collection: ${slug}`);

      expect(Boolean(collection.versions)).toBe(versioned);
    });

    it("does not introduce unreviewed author identity relationships", () => {
      const collection = config.collections.find(
        (entry) => entry.slug === slug,
      );
      if (!collection) throw new Error(`Missing product collection: ${slug}`);

      const names = collection.fields.map((field) =>
        "name" in field ? field.name : null,
      );
      expect(names).not.toContain("createdBy");
      expect(names).not.toContain("updatedBy");
    });
  },
);

describe("Core CMS feature boundary", () => {
  it("does not introduce a shared instruction-management collection", () => {
    expect(config.llmInstructions).toBe(false);
    expect(config.collections.map(({ slug }) => slug)).not.toContain(
      "payload-llm-instructions",
    );
  });
});

describe("Web Studio display conventions", () => {
  it("uses the admin shell's light theme and neutral unset labels", () => {
    expect(config.admin.theme).toBe("light");
    expect(config.i18n.translations?.en?.general?.noLabel).toBe("Not set");
  });
  it("shows dates in the short form the rest of Mission Control uses", () => {
    // "Nov 9, 2026, 3:45 PM", not Payload's "November 9th 2026, 3:45 PM",
    // which truncates on phone cards and widens list columns.
    expect(config.admin.dateFormat).toBe("MMM d, yyyy, h:mm a");
  });

  it("keeps page-builder internals out of list columns and filters", () => {
    const pages = config.collections.find(({ slug }) => slug === "pages");
    if (!pages) throw new Error("Missing pages collection");
    for (const name of ["layout", "content", "legacyContentFallback"]) {
      const field = pages.fields.find(
        (entry) => "name" in entry && entry.name === name,
      );
      // Payload 4: admin.disabled replaces disableListColumn/ListFilter.
      const disabled = (field?.admin as { disabled?: unknown } | undefined)
        ?.disabled as { column?: boolean; filter?: boolean } | undefined;
      expect(disabled?.column, name).toBe(true);
      expect(disabled?.filter, name).toBe(true);
    }
  });
});

describe("Payload's REST routes (AL-2675, WP2b slice C; plan 5.2)", () => {
  it("answer under /web-studio/api, inside Web Studio's path and outside Mission Control's /api", () => {
    expect(config.routes.admin).toBe("/web-studio");
    expect(config.routes.api).toBe("/web-studio/api");
    // GraphQL follows the setting; WP6 removes it.
    expect(config.routes.graphQL).toBe("/graphql");
  });

  it("answer an anonymous Web Studio refusal with JSON that says why", async () => {
    const { webStudioRefusalAfterError } =
      await import("../../../apps/admin/src/cms/auth/web-studio-refusal");
    expect(config.hooks?.afterError).toContain(webStudioRefusalAfterError);
  });
});

describe("Payload's server functions stay inside the organization (AL-2675, council C3)", () => {
  it("closes the lock collection on start: no write through the API, and no row shown", async () => {
    // Payload's lock collection grants every signed-in user create, read,
    // update and delete (payload/dist/locked-documents/config.js).
    const locks = { config: { access: {} as Record<string, unknown> } };
    await config.onInit?.({
      collections: { "payload-locked-documents": locks },
    } as never);
    const { access } = locks.config;
    for (const operation of ["create", "update", "delete"]) {
      expect((access[operation] as () => unknown)(), operation).toBe(false);
    }
    expect((access.read as () => unknown)()).toEqual({ id: { exists: false } });
  });

  it("dispatches form-state without lock status from the Payload layout", async () => {
    const { readFileSync } = await import("node:fs");
    const layout = readFileSync("apps/admin/app/(payload)/layout.tsx", "utf8");
    expect(layout).toContain("serverFunctions: webStudioServerFunctions");
    const { webStudioServerFunctions } =
      await import("../../../apps/admin/src/cms/web-studio-server-functions");
    expect(Object.keys(webStudioServerFunctions)).toEqual(["form-state"]);
  });

  it("schedules no publication: the schedule-publish function queues jobs on publish permission alone", () => {
    for (const collection of config.collections) {
      const drafts = collection.versions && collection.versions.drafts;
      const schedulePublish =
        drafts && typeof drafts === "object"
          ? drafts.schedulePublish
          : undefined;
      expect(Boolean(schedulePublish), collection.slug).toBe(false);
    }
  });
});

describe("Postgres adapter settings", () => {
  it("never lets Payload create a missing database or schema", () => {
    // The adapter keeps its options on the instance that init returns; init
    // only records the Payload reference and opens no connection.
    const adapter = config.db.init({
      payload: { config, logger: console },
    } as unknown as Parameters<typeof config.db.init>[0]) as {
      disableCreateDatabase?: boolean;
      schemaName?: string;
    };
    expect(adapter.schemaName).toBe("cms");
    expect(adapter.disableCreateDatabase).toBe(true);
  });
});
