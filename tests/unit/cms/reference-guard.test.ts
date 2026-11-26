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
type Check = (
  req: unknown,
  references: Array<{ path: string; relationTo: string; id: string }>,
  scope: { tenant: string; site: string | null; asActor: boolean },
) => Promise<Array<{ path: string; message: string }>>;

let collectReferences: Collect;
let checkReferences: Check;

beforeAll(async () => {
  ({ collectReferences, checkReferences } =
    (await import("../../../apps/admin/src/cms/tenancy/reference-guard")) as unknown as {
      collectReferences: Collect;
      checkReferences: Check;
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

const OTHER_MEDIA = "00000000-0000-4000-8000-00000000e003";
const relationship = (value: string) => ({
  type: "relationship",
  relationTo: "media",
  value,
});
const internalLink = (value: string) => ({
  type: "link",
  fields: { linkType: "internal", doc: { relationTo: "pages", value } },
  children: [{ type: "text", text: "x" }],
});
const blockNode = { type: "block", fields: { blockType: "x" } };
const spoof = { root: { children: [] } };

describe("F1: a rich-text field is read as rich text because its configuration says so, and nothing a client adds stops the walk", () => {
  it.each([
    [
      "a top-level root beside content",
      (node: unknown) => ({ ...spoof, content: state([node]) }),
      "content.root.children.0.children.0",
    ],
    [
      "a root beside a block's body",
      (node: unknown) => ({
        layout: [{ blockType: "rich-text", ...spoof, body: state([node]) }],
      }),
      "layout.0.body.root.children.0.children.0",
    ],
  ])("%s: the content is still walked", (_label, build, path) => {
    const media = collectReferences(fields, build(relationship(OTHER_MEDIA)));
    expect(media.references).toEqual([
      { path, relationTo: "media", id: OTHER_MEDIA },
    ]);
    const link = collectReferences(fields, build(internalLink(PAGE)));
    expect(link.references).toEqual([{ path, relationTo: "pages", id: PAGE }]);
    const block = collectReferences(fields, build(blockNode));
    expect(block.references).toEqual([]);
    expect(block.refusals.map((item) => item.path)).toEqual([path]);
  });

  it.each([
    ["a string", "text"],
    ["an object with no root", { children: [] }],
    ["a root whose children are not a list", { root: { children: "x" } }],
    ["a list", [state([])]],
  ])(
    "refuses a rich-text value that is %s, not a Lexical state",
    (_l, value) => {
      const top = collectReferences(fields, { content: value });
      expect(top.refusals.map((item) => item.path)).toEqual(["content"]);
      const nested = collectReferences(fields, {
        layout: [{ blockType: "rich-text", body: value }],
      });
      expect(nested.refusals.map((item) => item.path)).toEqual([
        "layout.0.body",
      ]);
    },
  );

  it("lets an empty rich-text value through", () => {
    for (const value of [null, undefined]) {
      const { references, refusals } = collectReferences(fields, {
        content: value,
      });
      expect(references).toEqual([]);
      expect(refusals).toEqual([]);
    }
  });

  it("visits a Lexical state nested in a node's fields", () => {
    const { references } = collectReferences(fields, {
      content: state([
        {
          type: "link",
          fields: {
            linkType: "custom",
            url: "https://x.test",
            note: state([relationship(OTHER_MEDIA)]),
          },
        },
      ]),
    });
    expect(references).toEqual([
      {
        path: "content.root.children.0.children.0.fields.note.root.children.0.children.0",
        relationTo: "media",
        id: OTHER_MEDIA,
      },
    ]);
  });

  it("still walks an unknown key, and reports each node once", () => {
    const { references } = collectReferences(fields, {
      content: state([relationship(MEDIA)]),
      pasted: state([relationship(OTHER_MEDIA)]),
    });
    expect(references).toEqual([
      {
        path: "content.root.children.0.children.0",
        relationTo: "media",
        id: MEDIA,
      },
      {
        path: "pasted.root.children.0.children.0",
        relationTo: "media",
        id: OTHER_MEDIA,
      },
    ]);
  });
});

describe("F2: the guard reads as the actor with overrideAccess false, and as the service only through the service port", () => {
  const references = [{ path: "content", relationTo: "media", id: MEDIA }];
  const tenant = "00000000-0000-4000-8000-0000000000a1";

  it("reads as the actor with overrideAccess: false and the actor as user", async () => {
    const calls: Array<Record<string, unknown>> = [];
    const user = { id: "u", collection: "principal-links" };
    const req = {
      user,
      context: {},
      payload: {
        find: async (args: Record<string, unknown>) => {
          calls.push(args);
          return { docs: [{ id: MEDIA, tenant }] };
        },
      },
    };
    const refusals = await checkReferences(req, references, {
      tenant,
      site: null,
      asActor: true,
    });
    expect(refusals).toEqual([]);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({ overrideAccess: false, user });
  });

  it("refuses to read as the service for a request the service port did not make", async () => {
    let finds = 0;
    const req = {
      user: null,
      context: {},
      payload: {
        find: async () => {
          finds += 1;
          return { docs: [{ id: MEDIA, tenant }] };
        },
      },
    };
    await expect(
      checkReferences(req, references, { tenant, site: null, asActor: false }),
    ).rejects.toThrow();
    expect(finds).toBe(0);
  });
});
