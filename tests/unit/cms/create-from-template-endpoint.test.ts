import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { defaultRichTextValue } from "../../../apps/admin/node_modules/@payloadcms/richtext-lexical/dist/index.js";

import type {
  CmsLayoutBlocks,
  PageCreateFields,
} from "../../../apps/admin/src/cms/create-from-template-payload-shapes";

const { getAdminClientMock } = vi.hoisted(() => ({
  getAdminClientMock: vi.fn(),
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

vi.mock("@asym/api/missionaries/queries", () => ({
  findMissionaryById: vi.fn(),
}));

let handler: (req: unknown) => Promise<Response>;

// Large transitive import (Payload + Lexical + CMS graph); 10s default
// hookTimeout is flaky on Windows CI and parallel test runs.
beforeAll(async () => {
  const module =
    await import("../../../apps/admin/src/cms/create-from-template-endpoint");
  handler = module.webStudioCreateFromTemplateEndpoint.handler as (
    req: unknown,
  ) => Promise<Response>;
}, 60_000);

beforeEach(() => {
  vi.clearAllMocks();
  getAdminClientMock.mockReturnValue({
    client: {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(),
            })),
            single: vi.fn(),
            maybeSingle: vi.fn(),
          })),
        })),
      })),
      // never used in the tests that should short-circuit
    },
    error: null,
  });
});

function makeReq({
  user,
  body,
  payloadOverrides,
}: {
  user: {
    id: string;
    publicTenantId?: string | null;
    role: string;
    tenantId: string | null;
  };
  body: unknown;
  payloadOverrides?: Partial<{
    findByID: (...args: any[]) => Promise<unknown>;
    find: (...args: any[]) => Promise<unknown>;
    create: (...args: any[]) => Promise<unknown>;
  }>;
}) {
  return {
    user,
    json: async () => body,
    payload: {
      findByID: vi.fn(),
      find: vi.fn(),
      create: vi.fn(),
      ...payloadOverrides,
    },
  } as never;
}

describe("webStudioCreateFromTemplateEndpoint", () => {
  it("preserves a template's legacy nodes and creates an independent unchanged fallback document", async () => {
    const layout = [
      {
        blockType: "rich-text",
        body: {
          root: {
            type: "root",
            children: [
              {
                type: "legacy-core-node",
                version: 1,
                customData: { variable: "supporter.name" },
              },
            ],
            direction: null,
            format: "",
            indent: 0,
            version: 1,
          },
          legacyMetadata: { revision: 7 },
        },
      },
    ];
    const create = vi
      .fn<(options: { data: PageCreateFields }) => Promise<{ id: number }>>()
      .mockResolvedValue({ id: 44 });
    const req = makeReq({
      user: { id: "u1", role: "staff", tenantId: "17" },
      body: {
        targetCollection: "pages",
        templateId: "1",
        title: "Reviewed page",
        slug: "reviewed-page",
      },
      payloadOverrides: {
        findByID: vi.fn().mockResolvedValue({
          id: 1,
          tenant: 17,
          pageType: "standard",
          defaultLayout: layout,
          templateKey: "standard-default",
        }),
        create,
      },
    });

    const response = await handler(req);

    expect(response.status).toBe(200);
    expect(create).toHaveBeenCalledWith({
      collection: "pages",
      data: expect.objectContaining({
        tenant: 17,
        layout,
        content: defaultRichTextValue,
      }),
      draft: true,
      req,
    });
    const content = create.mock.calls[0]?.[0].data.content;
    expect(content).toEqual(defaultRichTextValue);
    expect(content).not.toBe(defaultRichTextValue);
    expect(content?.root).not.toBe(defaultRichTextValue.root);
  });

  it("creates independent pages without copying template block or nested row identities", async () => {
    const layout: CmsLayoutBlocks = [
      {
        blockType: "hero",
        id: "template-hero",
        headline: "Welcome",
        backgroundImage: 71,
        blockName: "Reviewed hero",
      },
      { blockType: "media-feature", id: "template-media", media: 72 },
      {
        blockType: "faq",
        id: "template-faq",
        items: [
          {
            id: "template-question",
            question: "Why?",
            answer: "Reviewed answer",
          },
        ],
      },
      {
        blockType: "impact-stats",
        id: "template-impact",
        items: [{ id: "template-stat", label: "Families", value: "25" }],
      },
      {
        blockType: "rich-text",
        id: "template-text",
        body: {
          root: {
            type: "root",
            children: [
              {
                type: "legacy-core-node",
                version: 1,
                id: "content-node",
                relationship: { id: 73 },
                customData: { id: "reviewed-metadata" },
              },
            ],
            direction: null,
            format: "",
            indent: 0,
            version: 1,
          },
          legacyMetadata: { id: "reviewed-document" },
        },
      },
    ];
    const original = structuredClone(layout);
    const expected = [
      {
        blockType: "hero",
        headline: "Welcome",
        backgroundImage: 71,
        blockName: "Reviewed hero",
      },
      { blockType: "media-feature", media: 72 },
      {
        blockType: "faq",
        items: [{ question: "Why?", answer: "Reviewed answer" }],
      },
      {
        blockType: "impact-stats",
        items: [{ label: "Families", value: "25" }],
      },
      {
        blockType: "rich-text",
        body: {
          root: {
            type: "root",
            children: [
              {
                type: "legacy-core-node",
                version: 1,
                id: "content-node",
                relationship: { id: 73 },
                customData: { id: "reviewed-metadata" },
              },
            ],
            direction: null,
            format: "",
            indent: 0,
            version: 1,
          },
          legacyMetadata: { id: "reviewed-document" },
        },
      },
    ];
    const create = vi
      .fn<(options: { data: PageCreateFields }) => Promise<{ id: number }>>()
      .mockResolvedValue({ id: 44 });
    for (const slug of ["first-page", "second-page"]) {
      const req = makeReq({
        user: { id: "u1", role: "staff", tenantId: "17" },
        body: {
          targetCollection: "pages",
          templateId: "1",
          title: "Reviewed page",
          slug,
        },
        payloadOverrides: {
          findByID: vi.fn().mockResolvedValue({
            id: 1,
            tenant: 17,
            pageType: "standard",
            defaultLayout: layout,
            templateKey: "standard-default",
          }),
          create,
        },
      });
      expect((await handler(req)).status).toBe(200);
    }
    expect(create).toHaveBeenCalledTimes(2);
    const first = create.mock.calls[0]?.[0].data;
    const second = create.mock.calls[1]?.[0].data;
    expect(first).toEqual(
      expect.objectContaining({ tenant: 17, template: 1, layout: expected }),
    );
    expect(second).toEqual(
      expect.objectContaining({ tenant: 17, template: 1, layout: expected }),
    );
    expect(first?.layout).not.toBe(second?.layout);
    expect(first?.layout[2]).not.toBe(second?.layout[2]);
    const firstText = first?.layout.find(
      (block) => block.blockType === "rich-text",
    );
    const secondText = second?.layout.find(
      (block) => block.blockType === "rich-text",
    );
    expect(firstText?.body).not.toBe(secondText?.body);
    expect(firstText?.body).not.toBe(
      layout[4] && "body" in layout[4] ? layout[4].body : undefined,
    );
    expect(layout).toEqual(original);
  });

  it("requires tenantId for super-admin missionary giving creates", async () => {
    const req = makeReq({
      user: { id: "u1", role: "super_admin", tenantId: null },
      body: {
        targetCollection: "missionary-giving-pages",
        templateId: "1",
        missionaryId: "123e4567-e89b-42d3-a456-426614174111",
        tenantId: undefined,
      },
      payloadOverrides: {
        findByID: vi.fn().mockResolvedValue({
          id: 1,
          tenant: 10,
          pageType: "missionary_giving",
          defaultLayout: [],
          templateKey: "give-default",
        }),
      },
    });

    const res = await handler(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "Super-admin must choose a tenant",
    });
  });

  it("returns 404 when ministry update profile is cross-tenant", async () => {
    const req = makeReq({
      user: { id: "u1", role: "staff", tenantId: "17" },
      body: {
        targetCollection: "ministry-updates",
        templateId: "1",
        missionaryProfileId: "42",
        title: "Update",
        slug: "update",
      },
      payloadOverrides: {
        findByID: vi
          .fn()
          .mockResolvedValueOnce({
            id: 1,
            tenant: 17,
            pageType: "ministry_update",
            defaultLayout: [],
            templateKey: "mu-default",
          })
          .mockResolvedValueOnce({
            id: 42,
            tenant: 99,
          }),
      },
    });

    const res = await handler(req);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: "Missionary profile not found",
    });
  });

  it("rejects super-admin missionary giving create when template tenant differs from requested tenant", async () => {
    const req = makeReq({
      user: { id: "u1", role: "super_admin", tenantId: null },
      body: {
        targetCollection: "missionary-giving-pages",
        templateId: "1",
        tenantId: "99",
        missionaryId: "123e4567-e89b-42d3-a456-426614174111",
      },
      payloadOverrides: {
        find: vi.fn().mockResolvedValue({ docs: [] }),
        findByID: vi
          .fn()
          .mockResolvedValueOnce({
            id: 1,
            tenant: 10,
            pageType: "missionary_giving",
            defaultLayout: [],
            templateKey: "give-default",
          })
          .mockResolvedValueOnce({
            id: 99,
            slug: "tenant-99",
            name: "Tenant 99",
          }),
      },
    });

    const res = await handler(req);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      error: "Template is not in your tenant",
    });
  });
});
