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
import { YourDocuments } from "../../../../apps/admin/src/cms-ui/web-studio/dashboard/your-documents";

import type { DashboardDocument } from "../../../../apps/admin/src/cms-ui/web-studio/dashboard/your-documents";

const fixture = vi.hoisted(() => ({
  serverFunction: vi.fn(),
}));

vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js")
    >()),
    useServerFunctions: () => ({ serverFunction: fixture.serverFunction }),
    useAuth: () => ({
      user: { id: 1 },
      // Tenant-scoped reads stay objects in Payload's sanitized permissions.
      permissions: {
        collections: {
          pages: { read: { permission: true, where: { tenant: 1 } } },
          media: { read: true },
          tenants: {},
        },
      },
    }),
    useConfig: () => ({
      config: {
        routes: { api: "/api/cms", admin: "/web-studio" },
        serverURL: "",
        collections: [
          { slug: "pages", admin: {} },
          { slug: "media", admin: {} },
          { slug: "tenants", admin: {} },
          { slug: "payload-preferences", admin: { group: false } },
        ],
      },
    }),
  }),
);
vi.mock("../../../../apps/admin/src/cms-ui/web-studio/routing", () => ({
  Link: ({ href, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props} />
  ),
}));

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

const PINNED: DashboardDocument[] = [
  {
    id: 7,
    collectionSlug: "pages",
    title: "Year-End Giving",
    href: "/web-studio/collections/pages/7",
    typeLabel: "Pages",
    dateLabel: "2 hours ago",
    dateTime: "2026-11-07T21:06:00.000Z",
    isChanged: true,
    isDraft: false,
    statusLabel: "Changed",
  },
  {
    id: 3,
    collectionSlug: "missionary-giving-pages",
    title: "Grace Okafor - Give",
    href: "/web-studio/collections/missionary-giving-pages/3",
    typeLabel: "Missionary Giving Pages",
    statusLabel: "Published",
  },
];

const VIEWED: DashboardDocument[] = [
  {
    id: "m1",
    collectionSlug: "media",
    title: "Clinic photo",
    href: "/web-studio/collections/media/m1",
    typeLabel: "Media",
    dateLabel: "5 minutes ago",
    dateTime: "2026-11-07T22:56:00.000Z",
  },
];

function setup({
  pinned = PINNED,
  storedPins = [
    { id: 7, collectionSlug: "pages" },
    { id: 3, collectionSlug: "missionary-giving-pages" },
  ],
  failLoad = false,
}: {
  pinned?: DashboardDocument[];
  storedPins?: Array<{ id: string | number; collectionSlug: string }>;
  failLoad?: boolean;
} = {}) {
  let stored = storedPins;
  fixture.serverFunction.mockImplementation(
    async ({ name, args }: { name: string; args: { tab: string } }) => {
      expect(name).toBe("get-dashboard-documents");
      if (failLoad) throw new Error("offline");
      const items = args.tab === "pinned" ? pinned : VIEWED;
      return { items, page: 1, totalDocs: items.length };
    },
  );
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    expect(url).toBe("/api/cms/payload-preferences/pinned-documents");
    if (init?.method === "POST") {
      stored = (JSON.parse(String(init.body)) as { value: { items: [] } }).value
        .items;
      return Response.json({});
    }
    return Response.json({ value: { items: stored } });
  });
  vi.stubGlobal("fetch", fetchMock);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <YourDocuments />
    </QueryClientProvider>,
  );
  return { fetchMock, stored: () => stored };
}

it("lists pinned documents with Studio names and the lists' status words", async () => {
  setup();
  const region = screen.getByRole("region", { name: "Your documents" });
  const list = await within(region).findByRole("list", {
    name: "Pinned documents",
  });
  const page = within(list).getByRole("link", { name: "Year-End Giving" });
  expect(page.getAttribute("href")).toBe("/web-studio/collections/pages/7");
  const rows = within(list).getAllByRole("listitem");
  expect(within(rows[0]!).getByText("Changed")).toBeTruthy();
  expect(within(rows[1]!).getByText("Giving pages")).toBeTruthy();
  expect(within(rows[1]!).getByText("Published")).toBeTruthy();
  expect(fixture.serverFunction).toHaveBeenCalledWith({
    name: "get-dashboard-documents",
    args: { limit: 5, page: 1, tab: "pinned" },
  });
});

it("unpins through Payload's pinned-documents preference and refreshes", async () => {
  const { stored } = setup();
  fireEvent.click(
    await screen.findByRole("button", { name: "Unpin Year-End Giving" }),
  );
  await waitFor(() =>
    expect(stored()).toEqual([
      { id: 3, collectionSlug: "missionary-giving-pages" },
    ]),
  );
  await waitFor(() =>
    expect(
      fixture.serverFunction.mock.calls.filter(
        ([call]) => (call as { args: { tab: string } }).args.tab === "pinned",
      ).length,
    ).toBeGreaterThan(1),
  );
});

it("switches to the user's recently viewed documents", async () => {
  setup();
  await screen.findByRole("list", { name: "Pinned documents" });
  fireEvent.click(screen.getByRole("tab", { name: "Recently viewed" }));
  const list = await screen.findByRole("list", {
    name: "Recently viewed documents",
  });
  expect(
    within(list)
      .getByRole("link", { name: /Clinic photo/ })
      .getAttribute("href"),
  ).toBe("/web-studio/collections/media/m1");
  expect(within(list).getByText("5 minutes ago")).toBeTruthy();
  expect(fixture.serverFunction).toHaveBeenCalledWith({
    name: "get-dashboard-documents",
    args: { limit: 5, page: 1, tab: "recents" },
  });
});

it("explains where pinning happens when nothing is pinned", async () => {
  setup({ pinned: [], storedPins: [] });
  const title = await screen.findByText("No pinned documents");
  expect(
    screen.getByText("Open a document and choose Pin to keep it here."),
  ).toBeTruthy();
  // One short line, so an empty list never pushes Collections down.
  const note = title.closest('[data-slot="your-documents-empty"]');
  expect(note).not.toBeNull();
  expect(note!.querySelector('[data-slot="empty"]')).toBeNull();
  // No picker button that could fail: pins are made from each document.
  expect(screen.queryByRole("button", { name: /Pin documents/ })).toBeNull();
});

it("shows an inline error with Retry when the lists cannot load", async () => {
  setup({ failLoad: true });
  const alert = await screen.findByRole("alert");
  expect(within(alert).getByText("Couldn't load documents")).toBeTruthy();
  const before = fixture.serverFunction.mock.calls.length;
  fireEvent.click(within(alert).getByRole("button", { name: "Retry" }));
  await waitFor(() =>
    expect(fixture.serverFunction.mock.calls.length).toBeGreaterThan(before),
  );
});

it("moves back to the last page when unpinning empties the current one", async () => {
  let pinned: DashboardDocument[] = Array.from({ length: 6 }, (_, index) => ({
    ...PINNED[0]!,
    id: index + 1,
    title: `Doc ${index + 1}`,
    href: `/web-studio/collections/pages/${index + 1}`,
  }));
  let stored = pinned.map((doc) => ({ id: doc.id, collectionSlug: "pages" }));
  fixture.serverFunction.mockImplementation(
    async ({
      args,
    }: {
      args: { tab: string; page: number; limit: number };
    }) => {
      if (args.tab !== "pinned") {
        return { items: VIEWED, page: 1, totalDocs: VIEWED.length };
      }
      const start = (args.page - 1) * args.limit;
      return {
        items: pinned.slice(start, start + args.limit),
        page: args.page,
        totalDocs: pinned.length,
      };
    },
  );
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method === "POST") {
        stored = (
          JSON.parse(String(init.body)) as { value: { items: typeof stored } }
        ).value.items;
        pinned = pinned.filter((doc) =>
          stored.some((pin) => pin.id === doc.id),
        );
        return Response.json({});
      }
      return Response.json({ value: { items: stored } });
    }),
  );
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <YourDocuments />
    </QueryClientProvider>,
  );

  await screen.findByText("Page 1 of 2");
  fireEvent.click(screen.getByRole("button", { name: "Next page" }));
  fireEvent.click(await screen.findByRole("button", { name: "Unpin Doc 6" }));

  await waitFor(() =>
    expect(
      within(
        screen.getByRole("list", { name: "Pinned documents" }),
      ).getAllByRole("listitem"),
    ).toHaveLength(5),
  );
  expect(screen.getByRole("link", { name: "Doc 1" })).toBeTruthy();
  expect(screen.queryByText("No pinned documents")).toBeNull();
  expect(fixture.serverFunction).toHaveBeenLastCalledWith({
    name: "get-dashboard-documents",
    args: { limit: 5, page: 1, tab: "pinned" },
  });
});

it("keeps Previous on a page another session emptied", async () => {
  // Page 2 had pins when it was opened; they were unpinned elsewhere.
  let total = 6;
  fixture.serverFunction.mockImplementation(
    async ({ args }: { args: { tab: string; page: number } }) => {
      if (args.tab !== "pinned") return { items: [], page: 1, totalDocs: 0 };
      const docs = Array.from({ length: total }, (_, index) => ({
        ...PINNED[0]!,
        id: index + 1,
        title: `Doc ${index + 1}`,
      }));
      const start = (args.page - 1) * 5;
      return {
        items: docs.slice(start, start + 5),
        page: args.page,
        totalDocs: total,
      };
    },
  );
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ value: { items: [] } })),
  );
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <YourDocuments />
    </QueryClientProvider>,
  );
  await screen.findByText("Page 1 of 2");
  total = 5;
  fireEvent.click(screen.getByRole("button", { name: "Next page" }));

  await screen.findByText("No documents on this page.");
  expect(screen.queryByText("No pinned documents")).toBeNull();
  const previous = screen.getByRole("button", { name: "Previous page" });
  expect(previous.hasAttribute("disabled")).toBe(false);
  fireEvent.click(previous);
  await screen.findByRole("link", { name: "Doc 5" });
});
