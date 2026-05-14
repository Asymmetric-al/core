import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

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
