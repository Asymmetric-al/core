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

let GET: (request: unknown) => Promise<Response>;

import { TENANT_DOC, fakeFind } from "./public-route-fakes";

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

describe("public ministry updates route (through the choke-point)", () => {
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

  it("reads published updates under the public-read policy and serializes them through the allowlist", async () => {
    const find = fakeFind({
      tenants: [TENANT_DOC],
      "ministry-updates": [
        {
          id: "update_1",
          title: "Quarterly Update",
          slug: "quarterly-update",
          excerpt: "Progress",
          content: { root: {} },
          missionary: { id: 9, privateEmail: "never@leaks.example" },
          publishedAt: "2026-07-01T00:00:00.000Z",
          updatedAt: "2026-07-02T00:00:00.000Z",
          _status: "published",
          internalNotes: "staff only",
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
      tenant: { slug: "alpha" },
      updates: [
        {
          id: "update_1",
          title: "Quarterly Update",
          slug: "quarterly-update",
          excerpt: "Progress",
          content: { root: {} },
          missionaryId: "9",
          publishedAt: "2026-07-01T00:00:00.000Z",
          updatedAt: "2026-07-02T00:00:00.000Z",
        },
      ],
    });
    // Raw Payload fields never leak through the allowlist serializer.
    expect(JSON.stringify(body)).not.toContain("internalNotes");
    expect(JSON.stringify(body)).not.toContain("privateEmail");
    expect(JSON.stringify(body)).not.toContain("_status");

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "ministry-updates",
        limit: 5,
        overrideAccess: false,
        pagination: false,
        sort: "-publishedAt",
        context: { asymPublicRead: { cmsTenantId: "tenant_1" } },
        where: {
          and: [
            { tenant: { equals: "tenant_1" } },
            { _status: { equals: "published" } },
          ],
        },
      }),
    );
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "tenants",
        overrideAccess: false,
        where: {
          and: [{ id: { equals: "tenant_1" } }, { isActive: { equals: true } }],
        },
      }),
    );
  });

  it("clamps limit values between 1 and 20", async () => {
    const find = fakeFind({ tenants: [TENANT_DOC], "ministry-updates": [] });
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

    const updatesCalls = find.mock.calls
      .map(([args]) => args as { collection: string; limit?: number })
      .filter((args) => args.collection === "ministry-updates");
    expect(updatesCalls.map((args) => args.limit)).toEqual([20, 1, 5]);
  });

  it("serves nothing for a missing or inactive tenant (fail-closed empty)", async () => {
    const find = fakeFind({
      tenants: [],
      "ministry-updates": [{ id: "update_1", title: "Leak?" }],
    });
    getPayloadClientMock.mockResolvedValue({ find });
    resolveTenantFromRequestMock.mockResolvedValue({
      id: "tenant_1",
      slug: "alpha",
    });

    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ tenant: { slug: null }, updates: [] });

    // The content query never ran: tenant gate first, then nothing.
    const collections = find.mock.calls.map(
      ([args]) => (args as { collection: string }).collection,
    );
    expect(collections).toEqual(["tenants"]);
  });

  it("returns 503 unavailable when the store fails, without the raw error", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const find = vi.fn().mockRejectedValue(new Error("db down at 10.0.0.5"));
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
    expect(JSON.stringify(body)).not.toContain("10.0.0.5");
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
    expect(body).toEqual({ error: "Failed to fetch ministry updates" });
    expect(resolveTenantFromRequestMock).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
