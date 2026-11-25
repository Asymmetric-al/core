import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const { headersMock, notFoundMock } = vi.hoisted(() => ({
  headersMock: vi.fn(async () => new Headers({ host: "alpha.example.org" })),
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

type DonorCmsClientModule = typeof import("../../../apps/donor/lib/cms/client");
type CmsPublicPageModule =
  typeof import("../../../apps/donor/app/(public)/(solid)/[...cmsSlug]/page");
type LatestMinistryUpdatesModule =
  typeof import("../../../apps/donor/app/(public)/(hero)/latest-ministry-updates");

let client: DonorCmsClientModule;
let cmsPublicPage: CmsPublicPageModule;
let latestMinistryUpdates: LatestMinistryUpdatesModule;

const RETIRED_RESULT = {
  status: "not-found",
  statusCode: 404,
  error: "Public CMS reads are retired until WP7.",
} as const;

beforeAll(async () => {
  [client, cmsPublicPage, latestMinistryUpdates] = await Promise.all([
    import("../../../apps/donor/lib/cms/client"),
    import("../../../apps/donor/app/(public)/(solid)/[...cmsSlug]/page"),
    import("../../../apps/donor/app/(public)/(hero)/latest-ministry-updates"),
  ]);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("donor CMS empty reader after WP6 part 2a retires prototype public CMS routes", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    headersMock.mockClear();
    notFoundMock.mockClear();
    fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          page: { id: "p1", title: "Home", slug: "home" },
          tenant: { slug: "alpha" },
          updates: [{ id: "u1", title: "Published update" }],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
  });

  it("keeps buildPublicCmsPagePath and getPublicCmsBaseUrl exports intact", () => {
    expect(client.buildPublicCmsPagePath([" about us ", "buen día"])).toBe(
      "/api/cms/public/pages/about%20us/buen%20d%C3%ADa",
    );
    vi.stubEnv("CMS_BASE_URL", undefined);
    expect(client.getPublicCmsBaseUrl()).toBe("http://127.0.0.1:3030");
    vi.stubEnv("CMS_BASE_URL", "https://cms.example.org");
    expect(client.getPublicCmsBaseUrl()).toBe("https://cms.example.org");
  });

  it("returns retired not-found for all three page reads without calling fetch or headers", async () => {
    await expect(client.fetchPublishedCmsPageResult(["home"])).resolves.toEqual(
      RETIRED_RESULT,
    );
    await expect(
      client.fetchPublishedMissionaryGivingPageResult(
        "11111111-1111-1111-1111-111111111111",
      ),
    ).resolves.toEqual(RETIRED_RESULT);
    await expect(
      client.fetchPublishedProjectPageResult("local-project"),
    ).resolves.toEqual(RETIRED_RESULT);
    await expect(
      client.fetchPublishedMissionaryGivingPageResult(" ", "alpha.example.org"),
    ).resolves.toEqual(RETIRED_RESULT);
    await expect(
      client.fetchPublishedProjectPageResult(" ", "alpha.example.org"),
    ).resolves.toEqual(RETIRED_RESULT);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(headersMock).not.toHaveBeenCalled();
  });

  it("returns empty updates without calling fetch or headers", async () => {
    await expect(client.fetchPublishedCmsUpdatesResult(5)).resolves.toEqual({
      status: "found",
      statusCode: 200,
      updates: [],
    });
    await expect(client.fetchPublishedCmsUpdates(3)).resolves.toEqual([]);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(headersMock).not.toHaveBeenCalled();
  });

  it("keeps route-state mapping distinct for not-found, unavailable, and found results", () => {
    expect(client.resolvePublishedCmsPageRouteState(RETIRED_RESULT)).toEqual({
      status: "not-found",
    });
    expect(
      client.resolvePublishedCmsPageRouteState({
        status: "unavailable",
        statusCode: 503,
        error: "CMS unavailable",
      }),
    ).toEqual({
      status: "unavailable",
      error: "CMS unavailable",
    });
    expect(
      client.resolvePublishedCmsPageRouteState({
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

  it("drives the donor catch-all route to notFound and page-not-found metadata without fetch", async () => {
    await expect(
      cmsPublicPage.generateMetadata({
        params: Promise.resolve({ cmsSlug: ["local-cms-home"] }),
      }),
    ).resolves.toEqual({ title: "Page not found" });

    await expect(
      cmsPublicPage.default({
        params: Promise.resolve({ cmsSlug: ["local-cms-home"] }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFoundMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(headersMock).not.toHaveBeenCalled();
  });

  it("renders the home latest-ministry-updates section as null without fetch or headers", async () => {
    await expect(latestMinistryUpdates.LatestMinistryUpdates()).resolves.toBe(
      null,
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(headersMock).not.toHaveBeenCalled();
  });
});
