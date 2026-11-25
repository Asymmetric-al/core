import { beforeAll, describe, expect, it } from "vitest";

type Collected = {
  references: Array<{ path: string; relationTo: string; id: string }>;
  refusals: Array<{ path: string; message: string }>;
};
type Collect = (
  fields: unknown[],
  document: Record<string, unknown>,
  blocks?: unknown[],
) => Collected;

let collectReferences: Collect;

beforeAll(async () => {
  ({ collectReferences } =
    (await import("../../../apps/admin/src/cms/tenancy/reference-guard")) as unknown as {
      collectReferences: Collect;
    });
});

const MEDIA = "00000000-0000-4000-8000-00000000e001";
const PAGE = "00000000-0000-4000-8000-00000000e002";

const state = (children: unknown[]) => ({
  root: { type: "root", children: [{ type: "paragraph", children }] },
});

const fields = [
  { name: "site", type: "relationship", relationTo: "site-presentations" },
  { name: "createdBy", type: "relationship", relationTo: ["principal-links"] },
  {
    name: "layout",
    type: "blocks",
    blocks: [
      {
        slug: "rich-text",
        fields: [{ name: "body", type: "richText" }],
      },
      {
        slug: "gallery-note",
        fields: [
          { name: "caption", type: "text" },
          {
            name: "notes",
            type: "array",
            fields: [{ name: "text", type: "richText" }],
          },
        ],
      },
    ],
  },
  { name: "content", type: "richText" },
];

describe("note 2: the reference walker finds every Lexical tree in the saved data and allows two (node, collection) pairs only", () => {
  it("covers a block added later with a rich-text field, with no code change", () => {
    const { references, refusals } = collectReferences(fields, {
      layout: [
        {
          blockType: "gallery-note",
          notes: [
            {
              text: state([
                { type: "relationship", relationTo: "navigation", value: PAGE },
              ]),
            },
            {
              text: state([
                { type: "relationship", relationTo: "media", value: MEDIA },
              ]),
            },
          ],
        },
      ],
    });
    expect(refusals.map((item) => item.path)).toEqual([
      "layout.0.notes.0.text.root.children.0.children.0",
    ]);
    expect(references).toEqual([
      {
        path: "layout.0.notes.1.text.root.children.0.children.0",
        relationTo: "media",
        id: MEDIA,
      },
    ]);
  });

  it.each([
    ["an upload node", { type: "upload", relationTo: "media", value: MEDIA }],
    [
      "a relationship to principal-links",
      { type: "relationship", relationTo: "principal-links", value: PAGE },
    ],
    [
      "a relationship to site-presentations",
      { type: "relationship", relationTo: "site-presentations", value: PAGE },
    ],
    [
      "an internal link to media",
      {
        type: "link",
        fields: {
          linkType: "internal",
          doc: { relationTo: "media", value: MEDIA },
        },
      },
    ],
    [
      "an internal link with no document",
      { type: "link", fields: { linkType: "internal" } },
    ],
    [
      "a custom link that still carries a document",
      {
        type: "link",
        fields: {
          linkType: "custom",
          url: "https://x.test",
          doc: { relationTo: "navigation", value: PAGE },
        },
      },
    ],
    ["a block node", { type: "block", fields: { media: MEDIA } }],
    [
      "an unknown node that names a collection",
      { type: "mystery", relationTo: "pages", value: PAGE },
    ],
  ])("refuses %s, by default", (_label, node) => {
    const { references, refusals } = collectReferences(fields, {
      content: state([node]),
    });
    expect(references).toEqual([]);
    expect(refusals).toHaveLength(1);
  });

  it("collects the two allowed pairs, a relationship to media and an internal link to a page", () => {
    const { references, refusals } = collectReferences(fields, {
      content: state([
        { type: "relationship", relationTo: "media", value: MEDIA },
        {
          type: "link",
          fields: {
            linkType: "internal",
            doc: { relationTo: "pages", value: { id: PAGE } },
          },
          children: [{ type: "text", text: "x" }],
        },
        { type: "link", fields: { linkType: "custom", url: "https://x.test" } },
      ]),
    });
    expect(refusals).toEqual([]);
    expect(references.map((item) => [item.relationTo, item.id])).toEqual([
      ["media", MEDIA],
      ["pages", PAGE],
    ]);
  });

  it("checks declared relationship fields, skips Payload's stamped authorship, and refuses an unknown block type", () => {
    const { references, refusals } = collectReferences(fields, {
      site: PAGE,
      createdBy: { relationTo: "principal-links", value: PAGE },
      layout: [{ blockType: "pasted-unknown", media: MEDIA }],
    });
    expect(references).toEqual([
      { path: "site", relationTo: "site-presentations", id: PAGE },
    ]);
    expect(refusals.map((item) => item.path)).toEqual(["layout.0"]);
  });
});
