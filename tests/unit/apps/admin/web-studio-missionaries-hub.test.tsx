// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeAll, expect, it, vi } from "vitest";

import {
  QueryClient,
  QueryClientProvider,
} from "../../../../apps/admin/node_modules/@tanstack/react-query/build/modern/index.js";
import { MissionariesHubView } from "../../../../apps/admin/src/cms-ui/web-studio/flows/MissionariesHubView";

vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js")
    >()),
    useConfig: () => ({
      config: {
        routes: { api: "/api/cms", admin: "/web-studio" },
        serverURL: "",
      },
    }),
  }),
);
vi.mock("../../../../apps/admin/src/cms-ui/web-studio/routing", () => ({
  Link: ({ href, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props} />
  ),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock(
  "../../../../apps/admin/src/cms-ui/web-studio/shell/studio-layout",
  () => ({
    StudioLayout: ({ children }: { children: React.ReactNode }) => (
      <main>{children}</main>
    ),
  }),
);

beforeAll(() => {
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const NAMES = [
  "Grace Okafor",
  "Daniel and Ruth Mbeki",
  "Priya Raman",
  "Mateo Alvarez",
  "Hannah Lindqvist",
  "Samuel Osei",
  "Leah Park",
  "Tomas Berg",
  "Ana Lima",
  "Joel Kim",
  "Ruth Adeyemi",
];

const PUBLISHED_PAGE = {
  id: 41,
  missionaryId: "m-1",
  title: "Grace",
  _status: "published",
};

function renderHub({
  missionariesOk = true,
  missionaries = NAMES.map((name, index) => ({
    id: `m-${index + 1}`,
    profile: { full_name: name },
  })),
  givingPagesOk = true,
  givingPages = [PUBLISHED_PAGE],
  publishedVersionParents = [],
  fetchVersions,
}: {
  missionariesOk?: boolean;
  missionaries?: Array<Record<string, unknown>>;
  givingPagesOk?: boolean;
  givingPages?: Array<Record<string, unknown>>;
  /** Giving page ids that also have a published version. */
  publishedVersionParents?: number[];
  fetchVersions?: () => Response | Promise<Response>;
} = {}) {
  const fetchMock = vi.fn(async (url: string) => {
    if (url.startsWith("/api/admin/missionaries")) {
      return missionariesOk
        ? Response.json({
            missionaries: missionaries.slice(
              Number(new URLSearchParams(url.split("?")[1]).get("offset") ?? 0),
              Number(
                new URLSearchParams(url.split("?")[1]).get("offset") ?? 0,
              ) + 200,
            ),
          })
        : new Response("down", { status: 503 });
    }
    if (url.includes("/missionary-giving-pages/versions")) {
      const query = new URLSearchParams(url.split("?")[1]);
      expect(query.get("where[and][1][version._status][equals]")).toBe(
        "published",
      );
      const asked = [...query.entries()]
        .filter(([key]) => key.startsWith("where[and][0][parent][in]"))
        .map(([, value]) => Number(value));
      if (fetchVersions) return fetchVersions();
      return Response.json({
        docs: asked
          .filter((id) => publishedVersionParents.includes(id))
          .map((parent) => ({ parent })),
      });
    }
    if (url.includes("/missionary-giving-pages")) {
      return givingPagesOk
        ? Response.json({ docs: givingPages })
        : new Response("down", { status: 503 });
    }
    return new Response("unexpected", { status: 404 });
  });
  vi.stubGlobal("fetch", fetchMock);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MissionariesHubView />
    </QueryClientProvider>,
  );
  return { client, fetchMock };
}

it("lists missionaries in a ReUI grid with their giving page state", async () => {
  const { client } = renderHub();
  expect(
    screen.getByRole("heading", { level: 1, name: "Missionaries" }),
  ).toBeTruthy();
  const region = screen.getByRole("region", { name: "Missionaries" });
  const grace = await within(region).findByRole("link", {
    name: "Grace Okafor",
  });
  expect(grace.getAttribute("href")).toBe(
    "/web-studio/collections/missionary-giving-pages/41",
  );
  await waitFor(() =>
    expect(within(region).getByText("Published")).toBeTruthy(),
  );
  expect(
    within(region)
      .getByRole("link", { name: "Edit giving page for Grace Okafor" })
      .getAttribute("href"),
  ).toBe("/web-studio/collections/missionary-giving-pages/41");
  const priya = within(region).getByRole("link", { name: "Priya Raman" });
  expect(priya.getAttribute("href")).toBe(
    "/web-studio/pages/give?missionaryId=m-3",
  );
  expect(
    within(region).getByRole("link", {
      name: "Create giving page for Priya Raman",
    }),
  ).toBeTruthy();
  // Sorted by name, ten per page: the eleventh name waits on page two.
  expect(within(region).queryByRole("link", { name: "Tomas Berg" })).toBeNull();
  fireEvent.click(within(region).getByRole("button", { name: "Go to page 2" }));
  expect(
    await within(region).findByRole("link", { name: "Tomas Berg" }),
  ).toBeTruthy();
  client.clear();
});

it("searches by name or missionary ID", async () => {
  const { client } = renderHub();
  await screen.findByRole("link", { name: "Grace Okafor" });
  fireEvent.change(
    screen.getByRole("searchbox", { name: "Search missionaries" }),
    { target: { value: "raman" } },
  );
  await waitFor(() =>
    expect(screen.queryByRole("link", { name: "Grace Okafor" })).toBeNull(),
  );
  expect(screen.getByRole("link", { name: "Priya Raman" })).toBeTruthy();
  client.clear();
});

it.each([1024, 390])(
  "shows and searches missionary context at %ipx while preserving IDs",
  async (width) => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: width,
    });
    const { client } = renderHub({
      missionaries: [
        {
          id: "m-1",
          profile: { full_name: "Grace Okafor" },
          location: "Nairobi",
          missionField: "Education",
        },
        {
          id: "m-2",
          profile: { full_name: "Grace Okafor" },
          location: "Lima",
          missionField: "Healthcare",
        },
      ],
    });
    try {
      expect(await screen.findByText("Nairobi · Education")).toBeTruthy();
      expect(screen.getByText("Lima · Healthcare")).toBeTruthy();
      expect(
        screen.getByRole("button", { name: "Copy Missionary ID m-1" }),
      ).toBeTruthy();
      const search = screen.getByRole("searchbox", {
        name: "Search missionaries",
      });
      fireEvent.change(search, { target: { value: "Healthcare" } });
      await waitFor(() =>
        expect(screen.queryByText("Nairobi · Education")).toBeNull(),
      );
      expect(screen.getByText("Lima · Healthcare")).toBeTruthy();
      fireEvent.change(search, { target: { value: "Nairobi" } });
      expect(await screen.findByText("Nairobi · Education")).toBeTruthy();
      expect(screen.queryByText("Lima · Healthcare")).toBeNull();
    } finally {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: 1024,
      });
      client.clear();
    }
  },
);

it("counts the full directory and can find a missionary beyond the first 200", async () => {
  const { client, fetchMock } = renderHub({
    missionaries: [
      ...Array.from({ length: 200 }, (_, i) => ({
        id: `m-${i}`,
        profile: { full_name: `Missionary ${i}` },
      })),
      { id: "last", profile: { full_name: "Grace Last" } },
    ],
  });
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Go to page 21" })).toBeTruthy(),
  );
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/admin/missionaries?limit=200&offset=200",
    expect.objectContaining({ credentials: "include" }),
  );
  fireEvent.change(
    screen.getByRole("searchbox", { name: "Search missionaries" }),
    { target: { value: "Grace Last" } },
  );
  expect(await screen.findByRole("link", { name: "Grace Last" })).toBeTruthy();
  client.clear();
});

it("replaces the grid with an inline error and retries", async () => {
  const { client, fetchMock } = renderHub({ missionariesOk: false });
  expect(await screen.findByText("Couldn't load missionaries")).toBeTruthy();
  const before = fetchMock.mock.calls.length;
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  await waitFor(() =>
    expect(fetchMock.mock.calls.length).toBeGreaterThan(before),
  );
  client.clear();
});

it("explains an empty directory", async () => {
  const { client } = renderHub({ missionaries: [] });
  expect(await screen.findByText("No missionaries yet")).toBeTruthy();
  client.clear();
});

it("shows a live page with a newer draft as Changed, like the collection list", async () => {
  const { client } = renderHub({
    givingPages: [
      { id: 41, missionaryId: "m-1", _status: "draft" },
      { id: 42, missionaryId: "m-2", _status: "draft" },
    ],
    publishedVersionParents: [41],
  });
  const region = screen.getByRole("region", { name: "Missionaries" });
  await waitFor(() => expect(within(region).getByText("Changed")).toBeTruthy());
  expect(within(region).getAllByText("Draft")).toHaveLength(1);
  client.clear();
});

it.each([
  { width: 1024, failure: "HTTP" },
  { width: 1024, failure: "transport" },
  { width: 390, failure: "HTTP" },
  { width: 390, failure: "transport" },
])(
  "keeps publication status uncertain after a $failure versions failure at $width px and recovers on retry",
  async ({ width, failure }) => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: width,
    });
    const fetchVersions = vi
      .fn<() => Promise<Response>>()
      .mockImplementationOnce(async () => {
        if (failure === "HTTP") return new Response("down", { status: 503 });
        throw new TypeError("Network request failed");
      });
    const { client, fetchMock } = renderHub({
      missionaries: NAMES.slice(0, 4).map((name, index) => ({
        id: `m-${index + 1}`,
        profile: { full_name: name },
      })),
      givingPages: [
        { id: 41, missionaryId: "m-1", _status: "draft" },
        { id: 42, missionaryId: "m-2", _status: "draft" },
        { id: 43, missionaryId: "m-3", _status: "published" },
      ],
      fetchVersions,
    });
    try {
      const region = screen.getByRole("region", { name: "Missionaries" });
      await waitFor(() =>
        expect(within(region).queryAllByText("Unavailable")).toHaveLength(2),
      );
      expect(within(region).queryAllByText("Draft")).toHaveLength(0);
      expect(within(region).getByText("Published")).toBeTruthy();
      expect(within(region).getByText("Not created")).toBeTruthy();
      expect(screen.getByText(/Publication status didn't load/)).toBeTruthy();
      expect(
        within(region)
          .getByRole("link", { name: "Edit giving page for Grace Okafor" })
          .getAttribute("href"),
      ).toBe("/web-studio/collections/missionary-giving-pages/41");
      expect(
        within(region)
          .getByRole("link", { name: "Grace Okafor" })
          .getAttribute("href"),
      ).toBe("/web-studio/collections/missionary-giving-pages/41");
      expect(
        within(region).queryByRole("link", {
          name: "Create giving page for Grace Okafor",
        }),
      ).toBeNull();
      expect(
        within(region)
          .getByRole("link", { name: "Create giving page for Mateo Alvarez" })
          .getAttribute("href"),
      ).toBe("/web-studio/pages/give?missionaryId=m-4");

      const retry = Promise.withResolvers<Response>();
      fetchVersions.mockReturnValueOnce(retry.promise);
      const retryButton = screen.getByRole<HTMLButtonElement>("button", {
        name: "Retry publication status",
      });
      fireEvent.click(retryButton);
      await waitFor(() => expect(fetchVersions).toHaveBeenCalledTimes(2));
      expect(retryButton.disabled).toBe(true);
      expect(within(region).getAllByText("Unavailable")).toHaveLength(2);
      expect(
        within(region)
          .getByRole("link", { name: "Grace Okafor" })
          .getAttribute("href"),
      ).toBe("/web-studio/collections/missionary-giving-pages/41");
      expect(
        within(region).getByRole("link", {
          name: "Edit giving page for Grace Okafor",
        }),
      ).toBeTruthy();
      expect(within(region).queryAllByText("Checking…")).toHaveLength(0);
      retry.resolve(Response.json({ docs: [{ parent: 41 }] }));
      await waitFor(() =>
        expect(within(region).queryAllByText("Changed")).toHaveLength(1),
      );
      expect(within(region).getAllByText("Draft")).toHaveLength(1);
      expect(within(region).queryAllByText("Unavailable")).toHaveLength(0);
      expect(screen.queryByText(/Publication status didn't load/)).toBeNull();
      expect(fetchVersions).toHaveBeenCalledTimes(2);
      expect(
        fetchMock.mock.calls.filter(([url]) =>
          url.startsWith("/api/admin/missionaries"),
        ),
      ).toHaveLength(1);
    } finally {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: 1024,
      });
      client.clear();
    }
  },
);

it("keeps a confirmed unpublished page as Draft after an empty versions response", async () => {
  const fetchVersions = vi.fn(async () => Response.json({ docs: [] }));
  const { client } = renderHub({
    missionaries: [{ id: "m-1", profile: { full_name: "Grace Okafor" } }],
    givingPages: [{ id: 41, missionaryId: "m-1", _status: "draft" }],
    fetchVersions,
  });
  try {
    const region = screen.getByRole("region", { name: "Missionaries" });
    expect(await within(region).findByText("Draft")).toBeTruthy();
    expect(within(region).queryAllByText("Unavailable")).toHaveLength(0);
    expect(
      screen.queryByRole("button", { name: "Retry publication status" }),
    ).toBeNull();
    expect(fetchVersions).toHaveBeenCalledTimes(1);
  } finally {
    client.clear();
  }
});

it.each(["invalid JSON", "missing docs"])(
  "keeps a %s versions response uncertain instead of asserting Draft",
  async (response) => {
    const { client } = renderHub({
      missionaries: [{ id: "m-1", profile: { full_name: "Grace Okafor" } }],
      givingPages: [{ id: 41, missionaryId: "m-1", _status: "draft" }],
      fetchVersions: async () =>
        response === "invalid JSON"
          ? new Response("{")
          : Response.json({ totalDocs: 0 }),
    });
    try {
      const region = screen.getByRole("region", { name: "Missionaries" });
      await waitFor(() =>
        expect(within(region).queryAllByText("Unavailable")).toHaveLength(1),
      );
      expect(within(region).queryAllByText("Draft")).toHaveLength(0);
      expect(
        screen.getByRole("button", { name: "Retry publication status" }),
      ).toBeTruthy();
      expect(
        within(region)
          .getByRole("link", { name: "Edit giving page for Grace Okafor" })
          .getAttribute("href"),
      ).toBe("/web-studio/collections/missionary-giving-pages/41");
      expect(
        within(region).queryByRole("link", { name: /Create giving page/ }),
      ).toBeNull();
    } finally {
      client.clear();
    }
  },
);

it("restores duplicate-creation guards if the primary giving-page read fails during publication retry", async () => {
  const { client, fetchMock } = renderHub({
    missionaries: NAMES.slice(0, 2).map((name, index) => ({
      id: `m-${index + 1}`,
      profile: { full_name: name },
    })),
    givingPages: [{ id: 41, missionaryId: "m-1", _status: "draft" }],
    fetchVersions: async () => new Response("down", { status: 503 }),
  });
  try {
    await screen.findByText(/Publication status didn't load/);
    const originalFetch = fetchMock.getMockImplementation()!;
    fetchMock.mockImplementation(async (url) =>
      url.includes("/missionary-giving-pages")
        ? new Response("down", { status: 503 })
        : originalFetch(url),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Retry publication status" }),
    );
    await screen.findByText(/so Create and Edit are hidden/);
    const region = screen.getByRole("region", { name: "Missionaries" });
    expect(within(region).getAllByText("Unavailable")).toHaveLength(2);
    expect(within(region).queryAllByText("Not created")).toHaveLength(0);
    expect(
      within(region).queryByRole("link", { name: /Create giving page/ }),
    ).toBeNull();
    expect(
      within(region).queryByRole("link", { name: /Edit giving page/ }),
    ).toBeNull();
    expect(
      within(region).getByRole("link", {
        name: "View giving pages for Grace Okafor",
      }),
    ).toBeTruthy();
    expect(
      within(region)
        .getByRole("link", { name: "Grace Okafor" })
        .getAttribute("href"),
    ).not.toContain("/web-studio/pages/give");
    expect(
      within(region).getByRole("link", { name: "Daniel and Ruth Mbeki" }),
    ).toBeTruthy();
  } finally {
    client.clear();
  }
});

it("says giving page status is unavailable and offers Retry instead of a false Create", async () => {
  const { client, fetchMock } = renderHub({ givingPagesOk: false });
  const region = screen.getByRole("region", { name: "Missionaries" });
  await within(region).findByRole("link", { name: "Grace Okafor" });
  await waitFor(() =>
    expect(within(region).getAllByText("Unavailable").length).toBeGreaterThan(
      0,
    ),
  );
  expect(within(region).queryByText("Not created")).toBeNull();
  expect(
    within(region).queryByRole("link", { name: /Create giving page/ }),
  ).toBeNull();
  expect(
    within(region).queryByRole("link", { name: /Edit giving page/ }),
  ).toBeNull();
  // A path forward instead of nothing: each row opens that missionary's
  // existing giving pages, and the notice says why Create is hidden.
  const view = within(region).getByRole("link", {
    name: "View giving pages for Grace Okafor",
  });
  expect(view.getAttribute("href")).toContain("missionaryId");
  expect(screen.getByText(/so Create and Edit are hidden/)).toBeTruthy();
  const before = fetchMock.mock.calls.length;
  fireEvent.click(
    screen.getByRole("button", { name: "Retry giving page status" }),
  );
  await waitFor(() =>
    expect(fetchMock.mock.calls.length).toBeGreaterThan(before),
  );
  client.clear();
});

it("keeps the explicit create or edit action on mobile cards", async () => {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: 390,
  });
  const { client } = renderHub();
  const list = await screen.findByRole("list", { name: "Missionaries" });
  await waitFor(() =>
    expect(
      within(list).getByRole("link", {
        name: "Edit giving page for Grace Okafor",
      }),
    ).toBeTruthy(),
  );
  expect(
    within(list)
      .getByRole("link", { name: "Create giving page for Priya Raman" })
      .getAttribute("href"),
  ).toBe("/web-studio/pages/give?missionaryId=m-3");
  // One primary link per card: the name.
  expect(within(list).getByRole("link", { name: "Grace Okafor" })).toBeTruthy();
  // The ID stays on the card (shortened, copyable) so missionaries with
  // similar names can be told apart, below the giving page status.
  expect(
    within(list).getByRole("button", { name: "Copy Missionary ID m-1" }),
  ).toBeTruthy();
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: 1024,
  });
  client.clear();
});

it("offers View giving pages on mobile cards when status is unavailable", async () => {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: 390,
  });
  const { client } = renderHub({ givingPagesOk: false });
  const list = await screen.findByRole("list", { name: "Missionaries" });
  await waitFor(() =>
    expect(
      within(list).getByRole("link", {
        name: "View giving pages for Grace Okafor",
      }),
    ).toBeTruthy(),
  );
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: 1024,
  });
  client.clear();
});

it("sorts the mobile cards from the Sort menu", async () => {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: 390,
  });
  const { client } = renderHub();
  const list = await screen.findByRole("list", { name: "Missionaries" });
  await within(list).findByRole("link", { name: "Ana Lima" });
  fireEvent.click(screen.getByRole("button", { name: /^Sort/ }));
  fireEvent.click(
    await screen.findByRole("menuitemradio", { name: "Descending" }),
  );
  await waitFor(() =>
    expect(
      within(within(list).getAllByRole("listitem")[0]!).getAllByRole("link")[0]
        ?.textContent,
    ).toBe("Tomas Berg"),
  );
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: 1024,
  });
  client.clear();
});

it("never routes a name to Create while giving page status is unknown", async () => {
  const { client } = renderHub({ givingPagesOk: false });
  const region = screen.getByRole("region", { name: "Missionaries" });
  await waitFor(() =>
    expect(within(region).getAllByText("Unavailable").length).toBeGreaterThan(
      0,
    ),
  );
  // Grace already has a page: the name opens the giving pages kept for her
  // instead of the create flow.
  const href =
    within(region)
      .getByRole("link", { name: "Grace Okafor" })
      .getAttribute("href") ?? "";
  expect(href).not.toContain("/web-studio/pages/give");
  const [path, search] = href.split("?");
  expect(path).toBe("/web-studio/collections/missionary-giving-pages");
  expect(
    new URLSearchParams(search).get(
      "where[or][0][and][0][missionaryId][equals]",
    ),
  ).toBe("m-1");
  client.clear();
});

it("shortens the desktop missionary ID and offers to copy it in full", async () => {
  renderHub({
    missionaries: [
      {
        id: "5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a01",
        profile: { full_name: "Grace Okafor" },
      },
    ],
    givingPages: [],
  });
  const region = screen.getByRole("region", { name: "Missionaries" });
  expect(await within(region).findByText("5b0c2a52…0a01")).toBeTruthy();
  expect(
    within(region).queryByText("5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a01"),
  ).toBeNull();
  expect(
    within(region).getByRole("button", {
      name: "Copy Missionary ID 5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a01",
    }),
  ).toBeTruthy();
});
