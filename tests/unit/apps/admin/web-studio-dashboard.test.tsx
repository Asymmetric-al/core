// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { loadWebStudioDashboardData } from "../../../../apps/admin/src/cms-ui/web-studio/dashboard/load-dashboard-data";
import { WebStudioDashboard } from "../../../../apps/admin/src/cms-ui/web-studio/dashboard/web-studio-dashboard";

import type { WebStudioDashboardData } from "../../../../apps/admin/src/cms-ui/web-studio/dashboard/load-dashboard-data";

vi.mock(
  "../../../../apps/admin/src/cms-ui/web-studio/shell/studio-layout",
  () => ({
    StudioLayout: ({ children }: { children: React.ReactNode }) => (
      <main>{children}</main>
    ),
  }),
);
// Payload-backed per-user lists have their own test file.
vi.mock(
  "../../../../apps/admin/src/cms-ui/web-studio/dashboard/your-documents",
  () => ({
    YourDocuments: () => (
      <section aria-label="Your documents">Pinned and recently viewed</section>
    ),
  }),
);
vi.mock("../../../../apps/admin/src/cms-ui/web-studio/routing", () => ({
  Link: ({ href, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props} />
  ),
}));

afterEach(cleanup);

type CountArgs = { collection: string; where?: unknown };
type FindArgs = { collection: string };

function fakePayload({
  failCountFor,
  failDraftCountFor,
  publishedParents = [],
  failVersions = false,
  failRecentFor = [],
}: {
  failCountFor?: string;
  failDraftCountFor?: string;
  /** Document ids that also have a published version (Payload's "changed"). */
  publishedParents?: string[];
  failVersions?: boolean;
  failRecentFor?: string[] | "all";
} = {}) {
  const totals: Record<string, number> = {
    pages: 14,
    navigation: 1,
    media: 6,
  };
  const updated: Record<string, string> = {
    pages: "2026-11-07T21:06:00.000Z",
    navigation: "2026-11-07T22:30:00.000Z",
    media: "2026-11-01T09:00:00.000Z",
  };
  const titleFields: Record<string, string> = {
    pages: "title",
    navigation: "label",
    media: "alt",
  };
  return {
    logger: { error: vi.fn() },
    count: vi.fn(async ({ collection, where }: CountArgs) => {
      if (collection === failCountFor) throw new Error("database down");
      if (where && collection === failDraftCountFor) {
        throw new Error("draft count down");
      }
      return { totalDocs: where ? 1 : (totals[collection] ?? 0) };
    }),
    find: vi.fn(async ({ collection }: FindArgs) => {
      if (failRecentFor === "all" || failRecentFor.includes(collection)) {
        throw new Error("recent documents unavailable");
      }
      const updatedAt = updated[collection];
      if (!updatedAt) return { docs: [] };
      return {
        docs: [
          {
            id: `${collection}-1`,
            [titleFields[collection]!]: `Latest ${collection}`,
            updatedAt,
            _status: collection === "pages" ? "draft" : undefined,
          },
        ],
      };
    }),
    findVersions: vi.fn(async ({ where }: { where: unknown }) => {
      if (failVersions) throw new Error("versions down");
      const ids =
        (
          where as {
            and: Array<{ parent?: { in?: string[] } }>;
          }
        ).and.find((clause) => clause.parent)?.parent?.in ?? [];
      return {
        docs: ids
          .filter((id) => publishedParents.includes(id))
          .map((parent) => ({ parent })),
      };
    }),
    collections: Object.fromEntries(
      Object.keys(totals).map((slug) => [
        slug,
        {
          config: {
            admin: { useAsTitle: titleFields[slug] ?? "title" },
            versions: slug === "pages" ? { drafts: true } : false,
          },
        },
      ]),
    ),
  };
}

describe("loadWebStudioDashboardData (D-18: WP6 part 2b leaves pages, navigation and media, and retires the Administration lists)", () => {
  it("counts every native collection through tenant-scoped Local API reads", async () => {
    const payload = fakePayload();
    const req = { user: { id: 1 } };
    const data = await loadWebStudioDashboardData({
      payload: payload as never,
      req: req as never,
      permissions: {
        collections: { "cms-users": { read: true }, tenants: { read: false } },
      } as never,
    });

    for (const call of [
      ...payload.count.mock.calls,
      ...payload.find.mock.calls,
    ]) {
      expect(call[0]).toMatchObject({ overrideAccess: false, req });
    }

    const pages = data.groups
      .flatMap((group) => group.collections)
      .find((collection) => collection.slug === "pages");
    expect(pages).toMatchObject({
      title: "Pages",
      href: "/web-studio/collections/pages",
      total: 14,
      drafts: 1,
    });
    const media = data.groups
      .flatMap((group) => group.collections)
      .find((collection) => collection.slug === "media");
    expect(media).toMatchObject({ total: 6, drafts: null });

    expect(data.recent.map((doc) => doc.title)).toEqual([
      "Latest navigation",
      "Latest pages",
      "Latest media",
    ]);
    expect(data.recent[0]).toMatchObject({
      href: "/web-studio/collections/navigation/navigation-1",
      collectionLabel: "Navigation",
      status: null,
    });
    expect(data.recent[1]).toMatchObject({ status: "draft" });
    expect(data.recent[2]).toMatchObject({ status: null });
    expect(
      payload.count.mock.calls.map(([args]) => args.collection),
    ).not.toEqual(expect.arrayContaining(["cms-users"]));
  });

  it("lists no administration, whatever the reader may read", async () => {
    const payload = fakePayload();
    const data = await loadWebStudioDashboardData({
      payload: payload as never,
      req: { user: { id: 1 } } as never,
      permissions: {
        collections: {
          "principal-links": { read: true },
          "site-presentations": { read: true },
        },
      } as never,
    });
    expect(Object.keys(data).sort()).toEqual([
      "groups",
      "recent",
      "recentFailedCollections",
    ]);
    const counted = payload.count.mock.calls.map(([args]) => args.collection);
    expect(counted).not.toContain("principal-links");
    expect(counted).not.toContain("site-presentations");
  });

  it("marks a live document with a newer draft as changed, like the lists", async () => {
    const payload = fakePayload({ publishedParents: ["pages-1"] });
    const req = { user: { id: 1 } };
    const data = await loadWebStudioDashboardData({
      payload: payload as never,
      req: req as never,
      permissions: { collections: {} } as never,
    });
    expect(
      data.recent.find((doc) => doc.collectionSlug === "pages"),
    ).toMatchObject({ status: "changed" });
    expect(
      data.recent.find((doc) => doc.collectionSlug === "navigation"),
    ).toMatchObject({ status: null });
    for (const call of payload.findVersions.mock.calls) {
      expect(call[0]).toMatchObject({ overrideAccess: false, req });
    }
  });

  it("marks publication status unknown when the version check fails", async () => {
    const data = await loadWebStudioDashboardData({
      payload: fakePayload({
        publishedParents: ["pages-1"],
        failVersions: true,
      }) as never,
      req: { user: { id: 1 } } as never,
      permissions: { collections: {} } as never,
    });
    expect(
      data.recent.find((doc) => doc.collectionSlug === "pages"),
    ).toMatchObject({ status: "unknown" });
  });

  it.each(["all", ["pages"]] as const)(
    "reports recent-read failures without calling them empty: %s",
    async (failRecentFor) => {
      const data = await loadWebStudioDashboardData({
        payload: fakePayload({
          failRecentFor: failRecentFor === "all" ? "all" : [...failRecentFor],
        }) as never,
        req: { user: { id: 1 } } as never,
        permissions: { collections: {} } as never,
      });
      expect(data.recentFailedCollections).toBeGreaterThan(0);
      render(<WebStudioDashboard data={data} />);
      expect(screen.queryByText("No documents yet")).toBeNull();
      if (failRecentFor === "all") {
        expect(data.recent).toEqual([]);
        expect(
          screen.getByText("Recent documents could not load"),
        ).toBeTruthy();
      } else {
        expect(screen.getByText("Latest navigation")).toBeTruthy();
        expect(
          screen.getByText(
            "Some collections could not load. Reload to try again.",
          ),
        ).toBeTruthy();
      }
    },
  );

  it("shows the true empty state only after successful recent reads", async () => {
    const payload = fakePayload();
    payload.find.mockResolvedValue({ docs: [] });
    const data = await loadWebStudioDashboardData({
      payload: payload as never,
      req: {} as never,
      permissions: undefined,
    });
    expect(data.recentFailedCollections).toBe(0);
    render(<WebStudioDashboard data={data} />);
    expect(screen.getByText("No documents yet")).toBeTruthy();
  });

  it("reports an unavailable count instead of failing the whole page", async () => {
    const data = await loadWebStudioDashboardData({
      payload: fakePayload({ failCountFor: "pages" }) as never,
      req: { user: { id: 1 } } as never,
      permissions: { collections: {} } as never,
    });
    const pages = data.groups
      .flatMap((group) => group.collections)
      .find((collection) => collection.slug === "pages");
    expect(pages).toMatchObject({ total: null, drafts: null });
  });
});

const DATA: WebStudioDashboardData = {
  recentFailedCollections: 0,
  groups: [
    {
      id: "content",
      label: "Content",
      collections: [
        {
          slug: "pages",
          title: "Pages",
          description: "Site pages with drafts and publishing.",
          href: "/web-studio/collections/pages",
          total: 14,
          drafts: 2,
          draftsFailed: false,
        },
      ],
    },
    {
      id: "site",
      label: "Site",
      collections: [
        {
          slug: "media",
          title: "Media",
          description: "Images and files used across the public site.",
          href: "/web-studio/collections/media",
          total: null,
          drafts: null,
          draftsFailed: false,
        },
      ],
    },
  ],
  recent: [
    {
      id: "7",
      title: "Year-End Giving",
      href: "/web-studio/collections/pages/7",
      collectionSlug: "pages",
      collectionLabel: "Pages",
      status: "published",
      updatedAt: "2026-11-07T21:06:00.000Z",
    },
    {
      id: "8",
      title: "Contact Us",
      href: "/web-studio/collections/pages/8",
      collectionSlug: "pages",
      collectionLabel: "Pages",
      status: "changed",
      updatedAt: "2026-11-07T20:06:00.000Z",
    },
  ],
};

describe("WebStudioDashboard (D-18: WP6 part 2b starts every page from New page and retires ministry updates and the Administration lists)", () => {
  it("offers page discovery before the create flows", () => {
    render(<WebStudioDashboard data={DATA} />);
    const findPage = screen.getByRole("link", { name: "Find a page" });
    expect(findPage.getAttribute("href")).toBe("/web-studio/collections/pages");
    expect(
      findPage.compareDocumentPosition(
        screen.getByRole("region", { name: "Create" }),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("omits the discovery shortcut when Pages is not in the directory", () => {
    render(<WebStudioDashboard data={{ ...DATA, groups: [] }} />);
    expect(screen.queryByRole("link", { name: "Find a page" })).toBeNull();
  });

  it("leads with the Studio title and every create flow", () => {
    render(<WebStudioDashboard data={DATA} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Web Studio" }),
    ).toBeTruthy();
    const create = screen.getByRole("region", { name: "Create" });
    const hrefs = within(create)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual(
      expect.arrayContaining([
        "/web-studio/pages/new-from-template",
        "/web-studio/pages/new-from-template?template=missionary-giving",
        "/web-studio/pages/new-from-template?template=project",
      ]),
    );
    expect(hrefs.join(" ")).not.toMatch(
      /ministry-updates|\/pages\/give|\/projects\/new/,
    );
    expect(
      screen
        .getByRole("link", { name: /template gallery/i })
        .getAttribute("href"),
    ).toBe("/web-studio/templates");
  });

  it("lists the collection directory with counts and an honest unavailable state", () => {
    render(<WebStudioDashboard data={DATA} />);
    const directory = screen.getByRole("region", { name: "Collections" });
    const pages = within(directory).getByRole("link", { name: /^Pages/ });
    expect(pages.getAttribute("href")).toBe("/web-studio/collections/pages");
    expect(pages.textContent).toContain("2 drafts");
    // The count names what it counts for screen readers.
    expect(pages.textContent).toContain("14 documents");
    const media = within(directory).getByRole("link", { name: /^Media/ });
    expect(media.textContent).toContain("Count unavailable");
  });

  it("shows recent documents with the lists' status words and no Administration group", () => {
    render(<WebStudioDashboard data={DATA} />);
    const recent = screen.getByRole("region", { name: "Recently updated" });
    const doc = within(recent).getByRole("link", { name: /Year-End Giving/ });
    expect(doc.getAttribute("href")).toBe("/web-studio/collections/pages/7");
    expect(within(doc).getByText("Published")).toBeTruthy();
    const changed = within(recent).getByRole("link", { name: /Contact Us/ });
    expect(within(changed).getByText("Changed")).toBeTruthy();
    expect(within(changed).queryByText("Draft")).toBeNull();
    const directory = screen.getByRole("region", { name: "Collections" });
    expect(
      within(directory).queryByRole("region", { name: "Administration" }),
    ).toBeNull();
  });

  it("keeps the user's pinned and recently viewed documents on the home", () => {
    render(<WebStudioDashboard data={DATA} />);
    expect(screen.getByRole("region", { name: "Your documents" })).toBeTruthy();
  });

  it("puts recent work before the long Collections directory where the sections stack", () => {
    render(<WebStudioDashboard data={DATA} />);
    const yours = screen.getByRole("region", { name: "Your documents" });
    const directory = screen.getByRole("region", { name: "Collections" });
    const recent = screen.getByRole("region", { name: "Recently updated" });
    // Reading order (and the stacked layout below xl): personal work, the
    // team's recent changes, then the directory, so recent work is not
    // a long scroll down on narrow screens.
    expect(
      yours.compareDocumentPosition(recent) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      recent.compareDocumentPosition(directory) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("lays the sections out in their reading order at every width", () => {
    render(<WebStudioDashboard data={DATA} />);
    const yours = screen.getByRole("region", { name: "Your documents" });
    const recent = screen.getByRole("region", { name: "Recently updated" });
    const directory = screen.getByRole("region", { name: "Collections" });
    // No section is moved by grid placement or order, so keyboard and
    // screen reader order is the visual order: on wide screens recent work
    // is one column (left) and the directory the next (right).
    const layout = directory.parentElement!;
    for (const element of layout.querySelectorAll("*")) {
      expect(String(element.getAttribute("class") ?? "")).not.toMatch(
        /(?:^|\s)(?:\S+:)?(?:col-start|row-start|col-end|row-end|order)-/,
      );
    }
    expect(layout.className).not.toMatch(/(?:^|\s)(?:\S+:)?order-/);
    const column = yours.parentElement!;
    expect(column.contains(recent)).toBe(true);
    expect(column.contains(directory)).toBe(false);
    expect(column.parentElement).toBe(layout);
  });

  it("shows the empty state with no Administration group", () => {
    render(<WebStudioDashboard data={{ ...DATA, recent: [] }} />);
    expect(screen.queryByRole("region", { name: "Administration" })).toBeNull();
    expect(screen.getByText("No documents yet")).toBeTruthy();
  });
});

describe("the dashboard's budget and its failures (WP6 rest, pull request 2, invariant 6)", () => {
  const req = { user: { id: 1 } } as never;

  it("makes at most ten Payload operations per load, every one on the request's own authority, so the resolver runs once", async () => {
    const payload = fakePayload();
    await loadWebStudioDashboardData({
      payload: payload as never,
      req,
      permissions: { collections: {} } as never,
    });
    const calls = [
      ...payload.count.mock.calls,
      ...payload.find.mock.calls,
      ...payload.findVersions.mock.calls,
    ].map(([args]) => args as unknown as Record<string, unknown>);
    expect(calls.length).toBeLessThanOrEqual(10);
    for (const args of calls) {
      expect(args.req).toBe(req);
      expect(args.overrideAccess).toBe(false);
    }
  });

  it("shows a failed draft count as an error, never as no drafts, and reports it", async () => {
    const payload = fakePayload({ failDraftCountFor: "pages" });
    const data = await loadWebStudioDashboardData({
      payload: payload as never,
      req,
      permissions: { collections: {} } as never,
    });
    const pages = data.groups
      .flatMap((group) => group.collections)
      .find((collection) => collection.slug === "pages");
    expect(pages).toMatchObject({
      total: 14,
      drafts: null,
      draftsFailed: true,
    });
    render(<WebStudioDashboard data={data} />);
    expect(screen.getByText("Draft count unavailable")).toBeTruthy();
    expect(payload.logger.error).toHaveBeenCalledTimes(1);
  });

  it("shows a failed version-status read as an unknown status, and reports it", async () => {
    const payload = fakePayload({ failVersions: true });
    const data = await loadWebStudioDashboardData({
      payload: payload as never,
      req,
      permissions: { collections: {} } as never,
    });
    expect(
      data.recent.find((doc) => doc.collectionSlug === "pages"),
    ).toMatchObject({ status: "unknown" });
    render(<WebStudioDashboard data={data} />);
    expect(screen.getByText("Status unavailable")).toBeTruthy();
    expect(payload.logger.error).toHaveBeenCalledTimes(1);
  });

  it("reports a failed count and a failed recent read as well as showing them", async () => {
    const payload = fakePayload({
      failCountFor: "media",
      failRecentFor: ["navigation"],
    });
    await loadWebStudioDashboardData({
      payload: payload as never,
      req,
      permissions: { collections: {} } as never,
    });
    expect(payload.logger.error).toHaveBeenCalledTimes(2);
  });

  it("reports nothing when every read succeeds", async () => {
    const payload = fakePayload();
    await loadWebStudioDashboardData({
      payload: payload as never,
      req,
      permissions: { collections: {} } as never,
    });
    expect(payload.logger.error).not.toHaveBeenCalled();
  });
});
