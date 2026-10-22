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
