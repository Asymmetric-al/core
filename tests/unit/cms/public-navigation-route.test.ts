import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const { getPayloadClientMock, resolveTenantFromRequestMock } = vi.hoisted(
  () => ({
    getPayloadClientMock: vi.fn(),
    resolveTenantFromRequestMock: vi.fn(),
  }),
);

vi.mock("../../../apps/admin/src/cms/get-payload", () => ({
  getPayloadClient: getPayloadClientMock,
}));

vi.mock("../../../apps/admin/src/cms/public/resolve-tenant", () => ({
  resolveTenantFromRequest: resolveTenantFromRequestMock,
}));

let GET: (request: unknown) => Promise<Response>;

function createRequest(
  url = "http://localhost:3030/api/cms/public/navigation",
) {
  return {
    nextUrl: new URL(url),
  } as never;
}

beforeAll(async () => {
  const routeModule =
    await import("../../../apps/admin/app/api/cms/public/navigation/route");

  GET = routeModule.GET;
});

describe("public navigation route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when tenant cannot be resolved", async () => {
    const find = vi.fn();
    const payloadClient = { find };
    const request = createRequest();

    getPayloadClientMock.mockResolvedValue(payloadClient);
    resolveTenantFromRequestMock.mockResolvedValue(null);

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({
      error: {
        code: "TENANT_NOT_FOUND",
        message: "Tenant not found",
      },
    });
    expect(find).not.toHaveBeenCalled();
    expect(resolveTenantFromRequestMock).toHaveBeenCalledWith(
      request,
      payloadClient,
    );
  });

  it("returns newest tenant navigation record", async () => {
    const find = vi.fn().mockResolvedValue({
      docs: [
        {
          id: "nav_1",
          label: "Main Navigation",
          items: [],
        },
      ],
    });
    getPayloadClientMock.mockResolvedValue({ find });
    resolveTenantFromRequestMock.mockResolvedValue({
      id: "tenant_1",
      slug: "alpha",
    });

    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      navigation: { id: "nav_1", label: "Main Navigation", items: [] },
      tenant: { id: "tenant_1", slug: "alpha" },
    });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("vary")).toBe("x-forwarded-host, host");
    expect(find).toHaveBeenCalledWith({
      collection: "navigation",
      limit: 1,
      overrideAccess: true,
      pagination: false,
      sort: "-updatedAt",
      where: {
        tenant: {
          equals: "tenant_1",
        },
      },
    });
  });

  it("returns null navigation when no docs are published", async () => {
    const find = vi.fn().mockResolvedValue({ docs: [] });
    getPayloadClientMock.mockResolvedValue({ find });
    resolveTenantFromRequestMock.mockResolvedValue({
      id: "tenant_1",
      slug: "alpha",
    });

    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      navigation: null,
      tenant: { id: "tenant_1", slug: "alpha" },
    });
  });

  it("returns 500 when payload lookup fails", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const find = vi.fn().mockRejectedValue(new Error("db down"));
    getPayloadClientMock.mockResolvedValue({ find });
    resolveTenantFromRequestMock.mockResolvedValue({
      id: "tenant_1",
      slug: "alpha",
    });

    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      error: {
        code: "UPSTREAM_FAILURE",
        message: "Failed to fetch navigation content",
      },
    });
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
