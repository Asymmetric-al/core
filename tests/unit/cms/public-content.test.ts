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

type DonorCmsClientModule = typeof import("../../../apps/donor/lib/cms/client");

vi.mock("../../../apps/admin/src/cms/get-payload", () => ({
  getPayloadClient: getPayloadClientMock,
}));

let buildPublicCmsPagePath: (slugSegments: string[]) => string;
let fetchPublishedCmsPageResult: (
  slugSegments: string[],
  hostOverride?: string,
) => Promise<unknown>;
let fetchPublishedCmsUpdates: (
  limit?: number,
  hostOverride?: string,
) => Promise<Array<Record<string, unknown>>>;
let fetchPublishedCmsUpdatesResult: (
  limit?: number,
  hostOverride?: string,
) => Promise<unknown>;
let fetchPublishedMissionaryGivingPageResult: (
  missionaryId: string,
  hostOverride?: string,
) => Promise<unknown>;
let fetchPublishedProjectPageResult: (
  slug: string,
  hostOverride?: string,
) => Promise<unknown>;
let resolvePublishedCmsPageRouteState: DonorCmsClientModule["resolvePublishedCmsPageRouteState"];
let resolveTenantFromRequest: (
  request: unknown,
  payloadOverride?: unknown,
) => Promise<unknown>;

beforeAll(async () => {
  const [donorModule, adminModule] = await Promise.all([
    import("../../../apps/donor/lib/cms/client"),
    import("../../../apps/admin/src/cms/public/resolve-tenant"),
  ]);

  buildPublicCmsPagePath = donorModule.buildPublicCmsPagePath;
  fetchPublishedCmsPageResult = donorModule.fetchPublishedCmsPageResult;
  fetchPublishedCmsUpdates = donorModule.fetchPublishedCmsUpdates;
  fetchPublishedCmsUpdatesResult = donorModule.fetchPublishedCmsUpdatesResult;
  fetchPublishedMissionaryGivingPageResult =
    donorModule.fetchPublishedMissionaryGivingPageResult;
  fetchPublishedProjectPageResult = donorModule.fetchPublishedProjectPageResult;
  resolvePublishedCmsPageRouteState =
    donorModule.resolvePublishedCmsPageRouteState;
  resolveTenantFromRequest = adminModule.resolveTenantFromRequest;
});

afterEach(() => {
  vi.unstubAllEnvs();
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

  it("prefers host resolution over explicit tenant query parameters", async () => {
    const find = vi
      .fn()
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({ docs: [{ id: "tenant_1", slug: "one" }] });
    getPayloadClientMock.mockResolvedValue({ find });

    const tenant = await resolveTenantFromRequest(
      createRequest(
        "/api/cms/public/pages/home?tenant=ignored",
        "one.example.org",
      ),
    );

    expect(tenant).toMatchObject({ id: "tenant_1", slug: "one" });
    expect(find).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: {
          slug: {
            equals: "one",
          },
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

  it("uses explicit tenant only when host does not resolve a tenant", async () => {
    const find = vi
      .fn()
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({ docs: [{ id: "tenant_4", slug: "gamma" }] });
    getPayloadClientMock.mockResolvedValue({ find });

    const tenant = await resolveTenantFromRequest(
      createRequest(
        "/api/cms/public/pages/home?tenant=gamma",
        "localhost:3030",
      ),
    );

    expect(tenant).toMatchObject({ id: "tenant_4", slug: "gamma" });
    expect(find).toHaveBeenCalledTimes(2);
  });

  it("uses the local default tenant for localhost in development and test", async () => {
    vi.stubEnv("CMS_LOCAL_DEFAULT_TENANT_SLUG", "give-hope-demo");
    const find = vi
      .fn()
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({
        docs: [{ id: "tenant_local", slug: "give-hope-demo" }],
      });
    getPayloadClientMock.mockResolvedValue({ find });

    const tenant = await resolveTenantFromRequest(
      createRequest("/api/cms/public/pages/local-cms-home", "localhost:3000"),
    );

    expect(tenant).toMatchObject({
      id: "tenant_local",
      slug: "give-hope-demo",
    });
    expect(find).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: {
          slug: {
            equals: "give-hope-demo",
          },
        },
      }),
    );
  });

  it("uses the local default tenant for 127.0.0.1 in development and test", async () => {
    vi.stubEnv("CMS_LOCAL_DEFAULT_TENANT_SLUG", "give-hope-demo");
    const find = vi
      .fn()
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({
        docs: [{ id: "tenant_local", slug: "give-hope-demo" }],
      });
    getPayloadClientMock.mockResolvedValue({ find });

    const tenant = await resolveTenantFromRequest(
      createRequest("/api/cms/public/pages/local-cms-home", "127.0.0.1:3000"),
    );

    expect(tenant).toMatchObject({
      id: "tenant_local",
      slug: "give-hope-demo",
    });
    expect(find).toHaveBeenCalledTimes(2);
  });

  it("ignores the loopback fallback in production", async () => {
    vi.stubEnv("CMS_LOCAL_DEFAULT_TENANT_SLUG", "give-hope-demo");
    vi.stubEnv("NODE_ENV", "production");
    const find = vi.fn().mockResolvedValueOnce({ docs: [] });
    getPayloadClientMock.mockResolvedValue({ find });

    const tenant = await resolveTenantFromRequest(
      createRequest("/api/cms/public/pages/local-cms-home", "127.0.0.1:3000"),
    );

    expect(tenant).toBeNull();
    expect(find).toHaveBeenCalledTimes(1);
  });

  it("keeps primary domain resolution ahead of the local fallback", async () => {
    vi.stubEnv("CMS_LOCAL_DEFAULT_TENANT_SLUG", "give-hope-demo");
    const find = vi.fn().mockResolvedValueOnce({
      docs: [{ id: "tenant_domain", slug: "domain-tenant" }],
    });
    getPayloadClientMock.mockResolvedValue({ find });

    const tenant = await resolveTenantFromRequest(
      createRequest("/api/cms/public/pages/local-cms-home", "localhost:3000"),
    );

    expect(tenant).toMatchObject({
      id: "tenant_domain",
      slug: "domain-tenant",
    });
    expect(find).toHaveBeenCalledTimes(1);
  });
});

describe("donor CMS content helpers", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("builds URL-safe public CMS page paths", () => {
    expect(buildPublicCmsPagePath([" about us ", "buen día"])).toBe(
      "/api/cms/public/pages/about%20us/buen%20d%C3%ADa",
    );
  });

  it("returns a found result with tenant-aware fetch cache policy", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          page: { id: "p1", title: "Home", slug: "home" },
          tenant: { slug: "alpha" },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchPublishedCmsPageResult(
      [" home "],
      "Alpha.Example.org:443",
    );

    expect(result).toEqual({
      status: "found",
      statusCode: 200,
      page: { id: "p1", title: "Home", slug: "home" },
      tenant: { slug: "alpha" },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:3030/api/cms/public/pages/home",
      expect.objectContaining({
        headers: { "x-forwarded-host": "Alpha.Example.org:443" },
        next: {
          revalidate: 60,
          tags: [
            "public-cms",
            "public-cms:host:alpha.example.org",
            "public-cms:page:home",
          ],
        },
      }),
    );
  });

  it("does not collapse CMS outages into not-found results", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "CMS unavailable" }), {
          status: 503,
        }),
      ),
    );

    await expect(
      fetchPublishedCmsPageResult(["home"], "alpha.example.org"),
    ).resolves.toEqual({
      status: "unavailable",
      statusCode: 503,
      error: "CMS unavailable",
    });
  });

  it("classifies invalid published page payloads as CMS response failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ page: { id: "p1" } }), {
          status: 200,
        }),
      ),
    );

    await expect(
      fetchPublishedCmsPageResult(["home"], "alpha.example.org"),
    ).resolves.toEqual({
      status: "unavailable",
      statusCode: 502,
      error: "Invalid CMS response",
    });
  });

  it("returns only record-shaped updates from the public CMS updates payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          updates: [
            { id: "u1", title: "Published update" },
            null,
            "invalid",
            ["also invalid"],
          ],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      fetchPublishedCmsUpdates(3, "Alpha.Example.org:443"),
    ).resolves.toEqual([{ id: "u1", title: "Published update" }]);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:3030/api/cms/public/updates?limit=3",
      expect.objectContaining({
        headers: { "x-forwarded-host": "Alpha.Example.org:443" },
        next: {
          revalidate: 60,
          tags: ["public-cms", "public-cms:host:alpha.example.org"],
        },
      }),
    );
  });

  it("returns an empty updates array for invalid public CMS updates payloads", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ updates: "not-array" }), {
          status: 200,
        }),
      ),
    );

    await expect(
      fetchPublishedCmsUpdates(5, "alpha.example.org"),
    ).resolves.toEqual([]);
  });

  it("classifies public CMS update failures as structured CMS response failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Tenant not found" }), {
          status: 404,
        }),
      ),
    );

    await expect(
      fetchPublishedCmsUpdatesResult(5, "alpha.example.org"),
    ).resolves.toEqual({
      status: "unavailable",
      statusCode: 404,
      error: "Tenant not found",
    });

    await expect(
      fetchPublishedCmsUpdates(5, "alpha.example.org"),
    ).resolves.toEqual([]);
  });

  it("keeps route handling distinct for missing pages and CMS outages", () => {
    expect(
      resolvePublishedCmsPageRouteState({
        status: "not-found",
        statusCode: 404,
        error: "Page not found",
      }),
    ).toEqual({ status: "not-found" });

    expect(
      resolvePublishedCmsPageRouteState({
        status: "unavailable",
        statusCode: 503,
        error: "CMS unavailable",
      }),
    ).toEqual({
      status: "unavailable",
      error: "CMS unavailable",
    });

    expect(
      resolvePublishedCmsPageRouteState({
        status: "found",
        statusCode: 200,
        page: { id: "p1", title: "Home", slug: "home" },
        tenant: { slug: "alpha" },
      }),
    ).toEqual({
      status: "found",
      page: { id: "p1", title: "Home", slug: "home" },
    });
  });

  it("classifies invalid page-like descriptors before fetching", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      fetchPublishedMissionaryGivingPageResult(" ", "alpha.example.org"),
    ).resolves.toEqual({
      status: "bad-request",
      statusCode: 400,
      error: "Missionary id required",
    });
    await expect(
      fetchPublishedProjectPageResult(" ", "alpha.example.org"),
    ).resolves.toEqual({
      status: "bad-request",
      statusCode: 400,
      error: "Slug required",
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
