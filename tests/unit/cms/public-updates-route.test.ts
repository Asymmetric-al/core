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

function createRequest(url = "http://localhost:3030/api/cms/public/updates") {
  return {
    nextUrl: new URL(url),
  } as never;
}

beforeAll(async () => {
  const routeModule =
    await import("../../../apps/admin/app/api/cms/public/updates/route");

  GET = routeModule.GET;
});

describe("public ministry updates route", () => {
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
    expect(body).toEqual({ error: "Tenant not found" });
    expect(find).not.toHaveBeenCalled();
    expect(resolveTenantFromRequestMock).toHaveBeenCalledWith(
      request,
      payloadClient,
    );
  });

  it("defaults to limit=5 and filters to published docs", async () => {
    const find = vi.fn().mockResolvedValue({
      docs: [
        { id: "update_1", title: "Quarterly Update", _status: "published" },
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
      tenant: { id: "tenant_1", slug: "alpha" },
      updates: [
        { id: "update_1", title: "Quarterly Update", _status: "published" },
      ],
    });
    expect(find).toHaveBeenCalledWith({
      collection: "ministry-updates",
      limit: 5,
      overrideAccess: true,
      pagination: false,
      sort: "-publishedAt",
      where: {
        and: [
          {
            tenant: {
              equals: "tenant_1",
            },
          },
          {
            _status: {
              equals: "published",
            },
          },
        ],
      },
    });
  });

  it("clamps limit values between 1 and 20", async () => {
    const find = vi.fn().mockResolvedValue({ docs: [] });
    getPayloadClientMock.mockResolvedValue({ find });
    resolveTenantFromRequestMock.mockResolvedValue({
      id: "tenant_1",
      slug: "alpha",
    });

    await GET(
      createRequest("http://localhost:3030/api/cms/public/updates?limit=999"),
    );
    await GET(
      createRequest("http://localhost:3030/api/cms/public/updates?limit=0"),
    );
    await GET(
      createRequest(
        "http://localhost:3030/api/cms/public/updates?limit=invalid",
      ),
    );

    expect(find).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        limit: 20,
      }),
    );
    expect(find).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        limit: 1,
      }),
    );
    expect(find).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        limit: 5,
      }),
    );
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
    expect(body).toEqual({ error: "Failed to fetch ministry updates" });
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
