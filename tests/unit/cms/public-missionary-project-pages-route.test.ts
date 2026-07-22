import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const { getPayloadClientMock, resolveTenantFromRequestMock } = vi.hoisted(
  () => ({
    getPayloadClientMock: vi.fn(),
    resolveTenantFromRequestMock: vi.fn(),
  }),
);

vi.mock("../../../apps/admin/src/cms/get-payload", () => ({
  getPayloadClient: getPayloadClientMock,
  isPayloadClientInitializationError: (error: unknown) =>
    Boolean(
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "PayloadClientInitializationError" &&
      "statusCode" in error &&
      error.statusCode === 503,
    ),
}));

vi.mock("../../../apps/admin/src/cms/public/resolve-tenant", () => ({
  resolveTenantFromRequest: resolveTenantFromRequestMock,
}));

let missionaryGET: (request: unknown, context: unknown) => Promise<Response>;
let projectGET: (request: unknown, context: unknown) => Promise<Response>;

beforeAll(async () => {
  const missionaryModule =
    await import("../../../apps/admin/app/api/cms/public/missionary-pages/[id]/route");
  const projectModule =
    await import("../../../apps/admin/app/api/cms/public/project-pages/[slug]/route");
  missionaryGET = missionaryModule.GET;
  projectGET = projectModule.GET;
});

describe("public missionary giving page route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 without tenant", async () => {
    getPayloadClientMock.mockResolvedValue({});
    resolveTenantFromRequestMock.mockResolvedValue(null);
    const res = await missionaryGET(
      {
        nextUrl: new URL(
          "http://localhost:3030/api/cms/public/missionary-pages/x",
        ),
      } as never,
      { params: Promise.resolve({ id: "x" }) },
    );
    expect(res.status).toBe(404);
  });

  it("returns serialized published doc", async () => {
    const find = vi.fn(async (args: { collection: string }) => ({
      docs:
        args.collection === "tenants"
          ? [{ id: "t1", slug: "demo", isActive: true }]
          : [
              {
                id: "p1",
                title: "Give",
                slug: "give",
                missionaryId: "m1",
                _status: "published",
              },
            ],
    }));
    getPayloadClientMock.mockResolvedValue({ find });
    resolveTenantFromRequestMock.mockResolvedValue({ id: "t1", slug: "demo" });

    const res = await missionaryGET(
      {
        nextUrl: new URL(
          "http://localhost:3030/api/cms/public/missionary-pages/m1",
        ),
      } as never,
      { params: Promise.resolve({ id: "m1" }) },
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.page).toMatchObject({
      id: "p1",
      title: "Give",
      missionaryId: "m1",
    });
    expect(body.tenant).toEqual({ slug: "demo" });
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "missionary-giving-pages",
        limit: 1,
        overrideAccess: false,
        pagination: false,
        sort: "-updatedAt",
        where: expect.objectContaining({
          and: expect.arrayContaining([
            { tenant: { equals: "t1" } },
            { missionaryId: { equals: "m1" } },
            { _status: { equals: "published" } },
          ]),
        }),
      }),
    );
  });

  it("returns 400 for blank missionary ids before querying Payload", async () => {
    const find = vi.fn();
    getPayloadClientMock.mockResolvedValue({ find });
    resolveTenantFromRequestMock.mockResolvedValue({ id: "t1", slug: "demo" });

    const res = await missionaryGET(
      {
        nextUrl: new URL(
          "http://localhost:3030/api/cms/public/missionary-pages/%20",
        ),
      } as never,
      { params: Promise.resolve({ id: " " }) },
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: "Missionary id required" });
    expect(find).not.toHaveBeenCalled();
  });
});

describe("public project page route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns serialized published doc by slug", async () => {
    const find = vi.fn(async (args: { collection: string }) => ({
      docs:
        args.collection === "tenants"
          ? [{ id: "t1", slug: "demo", isActive: true }]
          : [{ id: "pp1", title: "Project", slug: "water-well", fundId: "f1" }],
    }));
    getPayloadClientMock.mockResolvedValue({ find });
    resolveTenantFromRequestMock.mockResolvedValue({ id: "t1", slug: "demo" });

    const res = await projectGET(
      {
        nextUrl: new URL(
          "http://localhost:3030/api/cms/public/project-pages/water-well",
        ),
      } as never,
      { params: Promise.resolve({ slug: "water-well" }) },
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.page.slug).toBe("water-well");
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "project-pages",
        limit: 1,
        overrideAccess: false,
        pagination: false,
        sort: "-updatedAt",
        where: expect.objectContaining({
          and: expect.arrayContaining([
            { tenant: { equals: "t1" } },
            { slug: { equals: "water-well" } },
            { _status: { equals: "published" } },
          ]),
        }),
      }),
    );
  });

  it("returns 400 for blank project slugs before querying Payload", async () => {
    const find = vi.fn();
    getPayloadClientMock.mockResolvedValue({ find });
    resolveTenantFromRequestMock.mockResolvedValue({ id: "t1", slug: "demo" });

    const res = await projectGET(
      {
        nextUrl: new URL(
          "http://localhost:3030/api/cms/public/project-pages/%20",
        ),
      } as never,
      { params: Promise.resolve({ slug: " " }) },
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: "Slug required" });
    expect(find).not.toHaveBeenCalled();
  });

  it("returns 404 when a published project page is missing", async () => {
    const find = vi.fn().mockResolvedValue({ docs: [] });
    getPayloadClientMock.mockResolvedValue({ find });
    resolveTenantFromRequestMock.mockResolvedValue({ id: "t1", slug: "demo" });

    const res = await projectGET(
      {
        nextUrl: new URL(
          "http://localhost:3030/api/cms/public/project-pages/missing",
        ),
      } as never,
      { params: Promise.resolve({ slug: "missing" }) },
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toEqual({ error: "Page not found" });
  });
});
