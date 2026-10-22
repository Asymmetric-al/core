import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  configToJSONSchema,
  fieldsToJSONSchema,
} from "../../../apps/admin/node_modules/payload/dist/index.js";
import { z } from "../../../apps/admin/node_modules/zod/index.js";

import type { CmsRichTextDocument } from "../../../apps/admin/src/cms/create-from-template-payload-shapes";
import type { FlattenedField } from "payload";

type PayloadConfig = Awaited<
  (typeof import("../../../apps/admin/payload.config"))["default"]
>;
let config: PayloadConfig;
let entityDefinitions: ReturnType<
  typeof configToJSONSchema
>["jsonSchema"]["$defs"];

beforeAll(async () => {
  vi.stubEnv("PAYLOAD_DISABLE_SCHEMA_PUSH", "1");
  vi.stubEnv("BLOB_READ_WRITE_TOKEN", undefined);
  vi.stubEnv("RESEND_API_KEY", undefined);
  config = await (await import("../../../apps/admin/payload.config")).default;
  entityDefinitions = configToJSONSchema(config).jsonSchema.$defs;
}, 30_000);

afterAll(() => vi.unstubAllEnvs());

const legacyDocument = {
  root: {
    type: "root",
    children: [
      {
        type: "legacy-core-node",
        version: 1,
        children: [
          { type: "custom-inline", version: 1, text: "Reviewed content" },
        ],
        customData: { variable: "supporter.name", retained: true },
      },
    ],
    direction: null,
    format: "",
    indent: 0,
    version: 1,
  },
  legacyMetadata: { revision: 7 },
} satisfies CmsRichTextDocument;

const sites = [
  { slug: "pages", field: "content" },
  { slug: "ministry-updates", field: "content" },
  { slug: "pages", field: "layout" },
  { slug: "page-templates", field: "defaultLayout" },
  { slug: "missionary-giving-pages", field: "layout" },
  { slug: "project-pages", field: "layout" },
];

function documentSchema(
  slug: string,
  name: string,
  variant: "input" | "output",
) {
  const collection = config.collections.find((entry) => entry.slug === slug);
  let field: FlattenedField | undefined = collection?.flattenedFields.find(
    (entry) => entry.name === name,
  );
  if (field?.type === "blocks") {
    field = field.blocks
      .find((block) => block.slug === "rich-text")
      ?.flattenedFields.find((entry) => entry.name === "body");
  }
  if (!field || field.type !== "richText") {
    throw new Error(`Missing rich-text field: ${slug}.${name}`);
  }
  const definitions = new Map();
  const { properties } = fieldsToJSONSchema({
    config,
    fields: [field],
    collectionIDFieldTypes: {},
    interfaceNameDefinitions: definitions,
    typeStringDefinitions: new Set(),
    variant,
  });
  return z.fromJSONSchema({
    ...properties[field.name],
    $defs: { ...entityDefinitions, ...Object.fromEntries(definitions) },
  });
}

describe.each(sites)("$slug / $field rich-text boundary", ({ slug, field }) => {
  it.each(["input", "output"] as const)(
    "preserves legacy/custom nodes and metadata in the %s schema",
    (variant) => {
      expect(
        documentSchema(slug, field, variant).parse(legacyDocument),
      ).toEqual(legacyDocument);
    },
  );

  it.each(["input", "output"] as const)(
    "retains the document envelope requirements in the %s schema",
    (variant) => {
      const schema = documentSchema(slug, field, variant);
      expect(schema.safeParse({ root: { type: "root" } }).success).toBe(false);
      expect(
        schema.safeParse({
          ...legacyDocument,
          root: { ...legacyDocument.root, version: "invalid" },
        }).success,
      ).toBe(false);
    },
  );
});
