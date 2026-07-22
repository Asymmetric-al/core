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

let GET: (request: unknown) => Promise<Response>;

const TENANT_DOC = { id: "tenant_1", slug: "alpha", isActive: true };

function createRequest(
  url = "http://localhost:3030/api/cms/public/navigation",
) {
  return {
    nextUrl: new URL(url),
  } as never;
}

/** Collection-aware fake: the reader reads tenants first, then navigation. */
function fakeFind(docsByCollection: Partial<Record<string, unknown[]>>) {
  return vi.fn(async (args: { collection: string }) => ({
    docs: docsByCollection[args.collection] ?? [],
  }));
}

beforeAll(async () => {
  const routeModule =
    await import("../../../apps/admin/app/api/cms/public/navigation/route");

  GET = routeModule.GET;
});

describe("public navigation route (through the choke-point)", () => {
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

  it("reads navigation tenant-constrained under the public-read policy and serializes it", async () => {
    const find = fakeFind({
      tenants: [TENANT_DOC],
      navigation: [
        {
          id: "nav_1",
          label: "Main Navigation",
          tenant: "tenant_1",
          items: [
            { id: "i1", label: "Home", href: "/", openInNewTab: false },
            {
              id: "i2",
              label: "Unsafe",
              href: "javascript:alert(1)",
              openInNewTab: false,
            },
          ],
          updatedAt: "2026-07-22T00:00:00.000Z",
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
      navigation: {
        id: "nav_1",
        label: "Main Navigation",
        items: [
          { id: "i1", label: "Home", href: "/", openInNewTab: false },
          // Unsafe hrefs are sanitized by the allowlist serializer.
          { id: "i2", label: "Unsafe", href: null, openInNewTab: false },
        ],
        updatedAt: "2026-07-22T00:00:00.000Z",
      },
      tenant: { slug: "alpha" },
    });
    // The raw tenant relationship never leaks through the serializer.
    expect(JSON.stringify(body.navigation)).not.toContain("tenant_1");

    const navigationCall = find.mock.calls
      .map(([args]) => args as Record<string, unknown>)
      .find((args) => args.collection === "navigation");
    expect(navigationCall).toMatchObject({
      collection: "navigation",
      limit: 1,
      overrideAccess: false,
      pagination: false,
      sort: "-updatedAt",
      context: { asymPublicRead: { cmsTenantId: "tenant_1" } },
      where: { and: [{ tenant: { equals: "tenant_1" } }] },
    });
  });

  it("returns null navigation when the tenant has no navigation docs", async () => {
    const find = fakeFind({ tenants: [TENANT_DOC], navigation: [] });
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
      tenant: { slug: "alpha" },
    });
  });

  it("serves nothing for a missing or inactive tenant (fail-closed empty)", async () => {
    const find = fakeFind({
      tenants: [],
      navigation: [{ id: "nav_1", label: "Leak?" }],
    });
    getPayloadClientMock.mockResolvedValue({ find });
    resolveTenantFromRequestMock.mockResolvedValue({
      id: "tenant_1",
      slug: "alpha",
    });

    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ navigation: null, tenant: { slug: null } });

    const collections = find.mock.calls.map(
      ([args]) => (args as { collection: string }).collection,
    );
    expect(collections).toEqual(["tenants"]);
  });

  it("returns 503 unavailable when the store fails", async () => {
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

    expect(response.status).toBe(503);
    expect(body).toEqual({
      error: "Published content is temporarily unavailable",
    });
    consoleErrorSpy.mockRestore();
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

    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toEqual({ error: "Failed to fetch navigation content" });
    expect(resolveTenantFromRequestMock).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
