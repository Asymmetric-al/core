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
