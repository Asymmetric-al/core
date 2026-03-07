import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const { getPayloadClientMock } = vi.hoisted(() => ({
  getPayloadClientMock: vi.fn(),
}));

vi.mock("../../../apps/admin/src/cms/get-payload", () => ({
  getPayloadClient: getPayloadClientMock,
}));

let lexicalToPlainText: (value: unknown) => string;
let fetchPublishedCmsPage: (
  slugSegments: string[],
  hostOverride?: string,
) => Promise<unknown>;
let fetchPublishedCmsUpdates: (
  limit?: number,
  hostOverride?: string,
) => Promise<unknown[]>;
let CmsFetchError: typeof Error;
let resolveTenantFromRequest: (
  request: unknown,
  payloadOverride?: unknown,
) => Promise<unknown>;

beforeAll(async () => {
  const [donorModule, adminModule] = await Promise.all([
    import("../../../apps/donor/lib/cms/client"),
    import("../../../apps/admin/src/cms/public/resolve-tenant"),
  ]);

  CmsFetchError = donorModule.CmsFetchError;
  fetchPublishedCmsPage = donorModule.fetchPublishedCmsPage;
  fetchPublishedCmsUpdates = donorModule.fetchPublishedCmsUpdates;
  lexicalToPlainText = donorModule.lexicalToPlainText;
  resolveTenantFromRequest = adminModule.resolveTenantFromRequest;
});

function createRequest(path: string, host?: string) {
  const nextUrl = new URL(`http://localhost:3030${path}`);

  return {
    headers: {
      get: vi.fn((headerName: string) => {
        if (headerName === "x-forwarded-host") {
          return host ?? null;
        }

        if (headerName === "host") {
          return host ?? null;
        }

        return null;
      }),
    },
    nextUrl,
  } as never;
}

describe("public cms tenant resolution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPayloadClientMock.mockReset();
  });

  it("resolves explicit tenant query parameter first", async () => {
    const find = vi
      .fn()
      .mockResolvedValueOnce({ docs: [{ id: "tenant_1", slug: "one" }] });
    getPayloadClientMock.mockResolvedValue({ find });

    const tenant = await resolveTenantFromRequest(
      createRequest("/api/cms/public/pages/home?tenant=one", "tenant.one.org"),
    );

    expect(tenant).toMatchObject({ id: "tenant_1", slug: "one" });
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          and: [
            {
              slug: {
                equals: "one",
              },
            },
            {
              isActive: {
                equals: true,
              },
            },
          ],
        },
      }),
    );
  });

  it("falls back to primary domain and then subdomain lookup", async () => {
    const find = vi
      .fn()
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({ docs: [{ id: "tenant_2", slug: "alpha" }] });
    getPayloadClientMock.mockResolvedValue({ find });

    const tenant = await resolveTenantFromRequest(
      createRequest("/api/cms/public/pages/home", "alpha.example.org"),
    );

    expect(tenant).toMatchObject({ id: "tenant_2", slug: "alpha" });
    expect(find).toHaveBeenCalledTimes(2);
    expect(find).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: {
          and: [
            {
              primaryDomain: {
                equals: "alpha.example.org",
              },
            },
            {
              isActive: {
                equals: true,
              },
            },
          ],
        },
      }),
    );
    expect(find).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: {
          and: [
            {
              slug: {
                equals: "alpha",
              },
            },
            {
              isActive: {
                equals: true,
              },
            },
          ],
        },
      }),
    );
  });

  it("uses provided payload client override when available", async () => {
    const find = vi
      .fn()
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({ docs: [{ id: "tenant_3", slug: "beta" }] });
    const payloadOverride = { find };

    const tenant = await resolveTenantFromRequest(
      createRequest("/api/cms/public/pages/home", "beta.example.org"),
      payloadOverride as never,
    );

    expect(tenant).toMatchObject({ id: "tenant_3", slug: "beta" });
    expect(getPayloadClientMock).not.toHaveBeenCalled();
    expect(find).toHaveBeenCalledTimes(2);
  });
});

describe("donor CMS content helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("extracts plain text from lexical JSON content", () => {
    const text = lexicalToPlainText({
      root: {
        children: [
          {
            children: [{ text: "Hope for all." }],
            type: "paragraph",
          },
        ],
      },
    });

    expect(text).toContain("Hope for all.");
  });

  it("returns null for structured page 404 responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue({
          error: {
            code: "PAGE_NOT_FOUND",
            message: "Page not found",
          },
        }),
      }),
    );

    await expect(
      fetchPublishedCmsPage(["unknown"], "alpha.example.org"),
    ).resolves.toBeNull();
  });

  it("throws a typed CMS error for upstream failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({
          error: {
            code: "UPSTREAM_FAILURE",
            message: "Failed to fetch page content",
          },
        }),
      }),
    );

    await expect(
      fetchPublishedCmsPage(["home"], "alpha.example.org"),
    ).rejects.toMatchObject({
      name: "CmsFetchError",
      status: 500,
      code: "UPSTREAM_FAILURE",
    });
    expect(CmsFetchError).toBeDefined();
  });

  it("throws when the public updates payload does not match the shared contract", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          updates: [{ id: 123, title: null }],
          tenant: { id: "tenant_1", slug: "alpha" },
        }),
      }),
    );

    await expect(
      fetchPublishedCmsUpdates(3, "alpha.example.org"),
    ).rejects.toMatchObject({
      name: "CmsFetchError",
      code: "INVALID_RESPONSE",
    });
  });
});
