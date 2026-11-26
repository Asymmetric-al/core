// @vitest-environment jsdom

import {
  act,
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
    collectionSlug: "navigation",
    title: "Grace Okafor - Give",
    href: "/web-studio/collections/navigation/3",
    typeLabel: "Navigations",
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
    { id: 3, collectionSlug: "navigation" },
  ],
  failLoad = false,
  savePin,
}: {
  pinned?: DashboardDocument[];
  storedPins?: Array<{ id: string | number; collectionSlug: string }>;
  failLoad?: boolean;
  /** Held open to observe the row while its unpin saves. */
  savePin?: Promise<void>;
} = {}) {
  let stored = storedPins;
  fixture.serverFunction.mockImplementation(
    async ({ name, args }: { name: string; args: { type: string } }) => {
      expect(name).toBe("get-activity-widget-docs");
      if (failLoad) throw new Error("offline");
      const items =
        args.type === "pinned"
          ? pinned.filter((doc) =>
              stored.some(
                (pin) =>
                  pin.id === doc.id &&
                  pin.collectionSlug === doc.collectionSlug,
              ),
            )
          : VIEWED;
      return { items, page: 1, totalDocs: items.length };
    },
  );
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    expect(url).toBe("/api/cms/payload-preferences/pinned-documents");
    if (init?.method === "POST") {
      await savePin;
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

it("lists pinned documents with Studio names and the lists' status words (D-18: WP6 part 2b retires the giving-pages collection; navigation keeps a Studio name)", async () => {
  setup();
  const region = screen.getByRole("region", { name: "Your documents" });
  const list = await within(region).findByRole("list", {
    name: "Pinned documents",
  });
  const page = within(list).getByRole("link", { name: "Year-End Giving" });
  expect(page.getAttribute("href")).toBe("/web-studio/collections/pages/7");
  const rows = within(list).getAllByRole("listitem");
  expect(within(rows[0]!).getByText("Changed")).toBeTruthy();
  expect(within(rows[1]!).getByText("Navigation")).toBeTruthy();
  expect(within(rows[1]!).getByText("Published")).toBeTruthy();
  expect(fixture.serverFunction).toHaveBeenCalledWith({
    name: "get-activity-widget-docs",
    args: { limit: 5, page: 1, type: "pinned" },
  });
});

it("names the tab list after the card heading", async () => {
  setup();
  await screen.findByRole("list", { name: "Pinned documents" });
  expect(screen.getByRole("tablist", { name: "Your documents" })).toBeTruthy();
});

it("unpins through Payload's pinned-documents preference and refreshes", async () => {
  const { stored } = setup();
  fireEvent.click(
    await screen.findByRole("button", { name: "Unpin Year-End Giving" }),
  );
  await waitFor(() =>
    expect(stored()).toEqual([{ id: 3, collectionSlug: "navigation" }]),
  );
  await waitFor(() =>
    expect(
      fixture.serverFunction.mock.calls.filter(
        ([call]) => (call as { args: { type: string } }).args.type === "pinned",
      ).length,
    ).toBeGreaterThan(1),
  );
});

it("keeps focus on Unpin while it saves, then hands it to the next row", async () => {
  const save = Promise.withResolvers<void>();
  setup({ savePin: save.promise });
  const unpin = await screen.findByRole("button", {
    name: "Unpin Year-End Giving",
  });
  unpin.focus();
  fireEvent.click(unpin);
  await waitFor(() => expect(unpin.getAttribute("aria-disabled")).toBe("true"));
  expect(unpin.hasAttribute("disabled")).toBe(false);
  expect(document.activeElement).toBe(unpin);

  await act(async () => save.resolve());
  const next = screen.getByRole("button", {
    name: "Unpin Grace Okafor - Give",
  });
  await waitFor(() => expect(document.activeElement).toBe(next));
  expect(unpin.isConnected).toBe(false);
  expect(screen.getByRole("status").textContent).toBe(
    "Unpinned Year-End Giving",
  );
});

it("hands focus to the previous row, then the tab panel when the list empties", async () => {
  setup();
  const last = await screen.findByRole("button", {
    name: "Unpin Grace Okafor - Give",
  });
  last.focus();
  fireEvent.click(last);
  const previous = screen.getByRole("button", {
    name: "Unpin Year-End Giving",
  });
  await waitFor(() => expect(document.activeElement).toBe(previous));

  fireEvent.click(previous);
  await screen.findByText("No pinned documents");
  expect(document.activeElement).toBe(
    screen.getByRole("tabpanel", { name: "Pinned" }),
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
    name: "get-activity-widget-docs",
    args: { limit: 5, page: 1, type: "recents" },
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

it("shows only what the access-checked read returns, never a stored pin", async () => {
  fixture.serverFunction.mockImplementation(async () => ({
    items: [],
    page: 1,
    totalDocs: 0,
  }));
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json({
        value: { items: [{ id: "other-9", collectionSlug: "pages" }] },
      }),
    ),
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
  const region = screen.getByRole("region", { name: "Your documents" });
  await within(region).findByText("No pinned documents");
  expect(within(region).queryAllByRole("link")).toEqual([]);
  expect(region.innerHTML).not.toContain("other-9");
  fireEvent.click(screen.getByRole("tab", { name: "Recently viewed" }));
  await within(region).findByText("Nothing viewed yet");
  expect(within(region).queryAllByRole("link")).toEqual([]);
  expect(region.innerHTML).not.toContain("other-9");
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

async function pressRetryAfterFailedLoad() {
  setup({ failLoad: true });
  const alert = await screen.findByRole("alert");
  const retry = within(alert).getByRole("button", { name: "Retry" });
  const retried = Promise.withResolvers<{
    items: DashboardDocument[];
    page: number;
    totalDocs: number;
  }>();
  fixture.serverFunction.mockImplementationOnce(() => retried.promise);
  retry.focus();
  fireEvent.click(retry);
  // Busy but still on screen, so focus stays on the button just pressed.
  await waitFor(() => expect(retry.getAttribute("aria-disabled")).toBe("true"));
  expect(retry.isConnected).toBe(true);
  expect(document.activeElement).toBe(retry);
  return { retry, retried };
}

it("keeps focus on Retry while a failed load retries, then hands it to the documents", async () => {
  const { retry, retried } = await pressRetryAfterFailedLoad();
  await act(async () =>
    retried.resolve({ items: PINNED, page: 1, totalDocs: PINNED.length }),
  );
  const list = await screen.findByRole("list", { name: "Pinned documents" });
  expect(retry.isConnected).toBe(false);
  expect(document.activeElement).toBe(within(list).getAllByRole("link")[0]);
});

it("keeps focus on Retry when the retry fails again", async () => {
  const { retry, retried } = await pressRetryAfterFailedLoad();
  await act(async () => retried.reject(new Error("offline")));
  await waitFor(() =>
    expect(retry.getAttribute("aria-disabled")).not.toBe("true"),
  );
  expect(retry.isConnected).toBe(true);
  expect(document.activeElement).toBe(retry);
  expect(screen.getByText("Couldn't load documents")).toBeTruthy();
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
      args: { type: string; page: number; limit: number };
    }) => {
      if (args.type !== "pinned") {
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
  const unpin = await screen.findByRole("button", { name: "Unpin Doc 6" });
  unpin.focus();
  fireEvent.click(unpin);

  await waitFor(() =>
    expect(
      within(
        screen.getByRole("list", { name: "Pinned documents" }),
      ).getAllByRole("listitem"),
    ).toHaveLength(5),
  );
  expect(screen.getByRole("link", { name: "Doc 1" })).toBeTruthy();
  // Doc 5 came just before the removed row, on the page now shown.
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Unpin Doc 5" }),
    ),
  );
  expect(screen.queryByText("No pinned documents")).toBeNull();
  expect(fixture.serverFunction).toHaveBeenLastCalledWith({
    name: "get-activity-widget-docs",
    args: { limit: 5, page: 1, type: "pinned" },
  });
});

it("keeps Previous on a page another session emptied", async () => {
  // Page 2 had pins when it was opened; they were unpinned elsewhere.
  let total = 6;
  fixture.serverFunction.mockImplementation(
    async ({ args }: { args: { type: string; page: number } }) => {
      if (args.type !== "pinned") return { items: [], page: 1, totalDocs: 0 };
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
  const next = screen.getByRole("button", { name: "Next page" });
  next.focus();
  fireEvent.click(next);

  await screen.findByText("No documents on this page.");
  expect(screen.queryByText("No pinned documents")).toBeNull();
  // The pager stays the same element, so the pressed button keeps focus.
  expect(document.activeElement).toBe(next);
  const previous = screen.getByRole("button", { name: "Previous page" });
  expect(previous.getAttribute("aria-disabled")).not.toBe("true");
  previous.focus();
  fireEvent.click(previous);
  await screen.findByRole("link", { name: "Doc 5" });
  // One page is left, so the pager goes; focus moves to the list it acted on.
  await waitFor(() =>
    expect(screen.queryByRole("button", { name: "Previous page" })).toBeNull(),
  );
  expect(document.activeElement).toBe(
    screen.getByRole("link", { name: "Doc 1" }),
  );
});

function renderPages({
  total,
  loadPage,
}: {
  total: number;
  /** Awaited before every pinned page after the first and every recents load. */
  loadPage: () => Promise<void>;
}) {
  const docs = Array.from({ length: total }, (_, index) => ({
    ...PINNED[0]!,
    id: index + 1,
    title: `Doc ${index + 1}`,
    href: `/web-studio/collections/pages/${index + 1}`,
  }));
  fixture.serverFunction.mockImplementation(
    async ({ args }: { args: { type: string; page: number } }) => {
      if (args.type !== "pinned") {
        await loadPage();
        return { items: VIEWED, page: 1, totalDocs: VIEWED.length };
      }
      if (args.page > 1) await loadPage();
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
}

it("keeps the page, pager and focus on screen while the next page loads", async () => {
  const pageTwo = Promise.withResolvers<void>();
  renderPages({ total: 7, loadPage: () => pageTwo.promise });
  const status = await screen.findByText("Page 1 of 2");
  const next = screen.getByRole("button", { name: "Next page" });
  next.focus();
  fireEvent.click(next);

  await waitFor(() =>
    expect(fixture.serverFunction).toHaveBeenCalledWith({
      name: "get-activity-widget-docs",
      args: { limit: 5, page: 2, type: "pinned" },
    }),
  );
  expect(screen.getByRole("link", { name: "Doc 1" })).toBeTruthy();
  expect(document.activeElement).toBe(next);
  expect(next.getAttribute("aria-disabled")).toBe("true");
  expect(next.hasAttribute("disabled")).toBe(false);

  await act(async () => pageTwo.resolve());
  await screen.findByRole("link", { name: "Doc 6" });
  // The same live region announces the new page.
  expect(status.isConnected).toBe(true);
  expect(status.textContent).toBe("Page 2 of 2");
  expect(status.getAttribute("aria-live")).toBe("polite");
  // At the end Next is unavailable but keeps focus instead of dropping it.
  expect(document.activeElement).toBe(next);
  expect(next.getAttribute("aria-disabled")).toBe("true");
  expect(next.hasAttribute("disabled")).toBe(false);
});

it("never shows one tab's documents under the other while it loads", async () => {
  const recents = Promise.withResolvers<void>();
  renderPages({ total: 2, loadPage: () => recents.promise });
  await screen.findByRole("link", { name: "Doc 1" });
  fireEvent.click(screen.getByRole("tab", { name: "Recently viewed" }));
  const panel = screen.getByRole("tabpanel", { name: "Recently viewed" });
  expect(within(panel).queryByRole("link", { name: "Doc 1" })).toBeNull();
  await act(async () => recents.resolve());
  await within(panel).findByRole("link", { name: /Clinic photo/ });
});

it("moves focus to Retry when the next page fails to load", async () => {
  renderPages({
    total: 7,
    loadPage: () => Promise.reject(new Error("offline")),
  });
  await screen.findByText("Page 1 of 2");
  const next = screen.getByRole("button", { name: "Next page" });
  next.focus();
  fireEvent.click(next);
  const alert = await screen.findByRole("alert");
  expect(document.activeElement).toBe(
    within(alert).getByRole("button", { name: "Retry" }),
  );
});
