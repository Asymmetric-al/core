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
let fetchPublishedCmsPage: (
  slugSegments: string[],
  hostOverride?: string,
) => Promise<unknown>;
let fetchPublishedCmsUpdates: (
  limit?: number,
  hostOverride?: string,
) => Promise<unknown[]>;
let lexicalToPlainText: (value: unknown) => string;
let resolveTenantFromRequest: (
  request: unknown,
  payloadOverride?: unknown,
) => Promise<unknown>;
const originalCmsBaseUrl = process.env.CMS_BASE_URL;

beforeAll(async () => {
  const [donorModule, adminModule] = await Promise.all([
    import("../../../apps/donor/lib/cms/client"),
    import("../../../apps/admin/src/cms/public/resolve-tenant"),
  ]);

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
});

describe("donor CMS content helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.CMS_BASE_URL;
  });

  afterEach(() => {
    process.env.CMS_BASE_URL = originalCmsBaseUrl;
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

  it("uses the provided host override when fetching published pages", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          page: {
            id: "page_1",
            slug: "about/team",
            title: "About the Team",
          },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const page = await fetchPublishedCmsPage(
      ["about", "team"],
      "alpha.example.org",
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:3030/api/cms/public/pages/about/team",
      {
        headers: {
          "x-forwarded-host": "alpha.example.org",
        },
        next: {
          revalidate: 60,
        },
      },
    );
    expect(page).toMatchObject({
      id: "page_1",
      slug: "about/team",
      title: "About the Team",
    });
  });

  it("normalizes empty slugs to home and prefers the provided host override", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          page: {
            id: "page_home",
            slug: "home",
            title: "Welcome Home",
          },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const page = await fetchPublishedCmsPage([], "tenant.one.org");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:3030/api/cms/public/pages/home",
      expect.objectContaining({
        headers: {
          "x-forwarded-host": "tenant.one.org",
        },
      }),
    );
    expect(page).toMatchObject({
      id: "page_home",
      slug: "home",
      title: "Welcome Home",
    });
  });

  it("requests updates with the provided limit and host override", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          updates: [{ id: "update_1", title: "Latest update" }],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const updates = await fetchPublishedCmsUpdates(3, "tenant.one.org");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:3030/api/cms/public/updates?limit=3",
      expect.objectContaining({
        headers: {
          "x-forwarded-host": "tenant.one.org",
        },
      }),
    );
    expect(updates).toEqual([{ id: "update_1", title: "Latest update" }]);
  });

  it("returns safe fallbacks when CMS fetches fail", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("server error", { status: 500 }))
      .mockRejectedValueOnce(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);

    const page = await fetchPublishedCmsPage(["about"], "tenant.one.org");
    const updates = await fetchPublishedCmsUpdates(3, "tenant.one.org");

    expect(page).toBeNull();
    expect(updates).toEqual([]);
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://127.0.0.1:3030/api/cms/public/updates?limit=3",
      expect.objectContaining({
        headers: {
          "x-forwarded-host": "tenant.one.org",
        },
      }),
    );
  });
});
