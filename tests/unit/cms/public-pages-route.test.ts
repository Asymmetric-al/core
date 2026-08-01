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
  toPublicRequestContext: (tenant: { id: number | string }) => ({
    operationalTenantId: String(tenant.id),
    cmsTenantId: tenant.id,
    siteId: null,
  }),
}));

let GET: (request: unknown, context: unknown) => Promise<Response>;

function createRequest(
  url = "http://localhost:3030/api/cms/public/pages/home",
) {
  return {
    nextUrl: new URL(url),
  } as never;
}

beforeAll(async () => {
  const routeModule =
    await import("../../../apps/admin/app/api/cms/public/pages/[...slug]/route");

  GET = routeModule.GET;
});

describe("public pages route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when tenant cannot be resolved", async () => {
    const find = vi.fn();
    const payloadClient = { find };
    const request = createRequest();

    getPayloadClientMock.mockResolvedValue(payloadClient);
    resolveTenantFromRequestMock.mockResolvedValue(null);

    const response = await GET(request, {
      params: Promise.resolve({ slug: ["home"] }),
    });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "Tenant not found" });
    expect(find).not.toHaveBeenCalled();
    expect(resolveTenantFromRequestMock).toHaveBeenCalledWith(
      request,
      payloadClient,
    );
  });

  it("queries the published page through the choke-point (tenant + slug + published, no access override)", async () => {
    const find = vi.fn(async (args: { collection: string }) => ({
      docs:
        args.collection === "tenants"
          ? [{ id: "tenant_1", slug: "alpha", isActive: true }]
          : [{ id: "page_1", slug: "about/team" }],
    }));
    getPayloadClientMock.mockResolvedValue({ find });
    resolveTenantFromRequestMock.mockResolvedValue({
      id: "tenant_1",
      slug: "alpha",
    });

    const response = await GET(createRequest(), {
      params: Promise.resolve({ slug: [" about ", "", "team "] }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      page: { id: "page_1", slug: "about/team" },
      tenant: { slug: "alpha" },
    });
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "pages",
        limit: 1,
        overrideAccess: false,
        pagination: false,
        sort: "-updatedAt",
        context: { asymPublicRead: { cmsTenantId: "tenant_1" } },
        where: {
          and: [
            {
              tenant: {
                equals: "tenant_1",
              },
            },
            {
              slug: {
                equals: "about/team",
              },
            },
            {
              _status: {
                equals: "published",
              },
            },
          ],
        },
      }),
    );
  });

  it("falls back to home slug for missing catch-all params", async () => {
    const find = vi.fn().mockResolvedValue({
      docs: [{ id: "page_home", slug: "home" }],
    });
    getPayloadClientMock.mockResolvedValue({ find });
    resolveTenantFromRequestMock.mockResolvedValue({
      id: "tenant_1",
      slug: "alpha",
    });

    const response = await GET(createRequest(), {
      params: Promise.resolve({ slug: undefined }),
    });

    expect(response.status).toBe(200);
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          and: [
            expect.any(Object),
            {
              slug: {
                equals: "home",
              },
            },
            expect.any(Object),
          ],
        },
      }),
    );
  });

  it("returns 404 when page is missing", async () => {
    const find = vi.fn().mockResolvedValue({ docs: [] });
    getPayloadClientMock.mockResolvedValue({ find });
    resolveTenantFromRequestMock.mockResolvedValue({
      id: "tenant_1",
      slug: "alpha",
    });

    const response = await GET(createRequest(), {
      params: Promise.resolve({ slug: ["unknown"] }),
    });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "Page not found" });
  });

  it("degrades to 503 unavailable when the payload page query fails", async () => {
    const find = vi.fn().mockRejectedValue(new Error("db down"));
    getPayloadClientMock.mockResolvedValue({ find });
    resolveTenantFromRequestMock.mockResolvedValue({
      id: "tenant_1",
      slug: "alpha",
    });

    const response = await GET(createRequest(), {
      params: Promise.resolve({ slug: ["home"] }),
    });
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toEqual({
      error: "Published content is temporarily unavailable",
    });
  });

  it("returns 503 when payload client initialization fails", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    getPayloadClientMock.mockRejectedValue(
      Object.assign(new Error("client init failed"), {
        name: "PayloadClientInitializationError",
        statusCode: 503,
      }),
    );

    const response = await GET(createRequest(), {
      params: Promise.resolve({ slug: ["home"] }),
    });
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toEqual({ error: "Failed to fetch page content" });
    expect(resolveTenantFromRequestMock).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("returns 500 when route params cannot be resolved", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const find = vi.fn();
    getPayloadClientMock.mockResolvedValue({ find });
    resolveTenantFromRequestMock.mockResolvedValue({
      id: "tenant_1",
      slug: "alpha",
    });

    const response = await GET(createRequest(), {
      params: Promise.reject(new Error("params failed")),
    });
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Failed to fetch page content" });
    expect(find).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
