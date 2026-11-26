/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

// Use the admin workspace's public client export so the preferences mock and
// router context share Payload's bundled module identity with Bun's linker.
import { RouterAdapterContext } from "../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js";
import { webStudioRefusalDigest } from "../../../apps/admin/src/cms/auth/web-studio-refusal";
import { StudioNavRail } from "../../../apps/admin/src/cms-ui/web-studio/shell/studio-nav-rail";

import type { LinkAdapterProps } from "../../../apps/admin/node_modules/@payloadcms/ui/dist/providers/RouterAdapter/index.js";

const STORED_TITLE = "Stored title from another organization";
const STUDIO_SLUGS = ["pages", "navigation", "media"];
const OTHER_SLUGS = [
  "site-presentations",
  "principal-links",
  "payload-preferences",
  "payload-locked-documents",
];

type ActivityItem = {
  id: string | number;
  collectionSlug: string;
  title: string;
};

const fixture = vi.hoisted(() => ({
  pathname: "/web-studio",
  items: [] as ActivityItem[],
  collections: undefined as Array<{ slug: string }> | undefined,
  serverFunctionMissing: false,
  getPreference: vi.fn(async (key: string): Promise<unknown> => {
    if (key === "web-studio.navCollapsed") return { collapsed: false };
    if (key === "web-studio.pages.recent") {
      return [
        {
          id: "doc-9",
          title: "Stored title from another organization",
          href: "/web-studio/collections/pages/doc-9",
          updatedAt: "2026-11-25T00:00:00.000Z",
        },
      ];
    }
    return null;
  }),
  setPreference: vi.fn(),
  serverFunction: vi.fn(async (_call: unknown): Promise<unknown> => null),
  permissions: undefined as unknown,
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock(
  "../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js")
      >();
    return {
      ...actual,
      usePreferences: () => ({
        getPreference: fixture.getPreference,
        setPreference: fixture.setPreference,
      }),
      useServerFunctions: () => ({
        serverFunction: fixture.serverFunctionMissing
          ? undefined
          : fixture.serverFunction,
      }),
      useConfig: () => ({ config: { collections: fixture.collections } }),
      useAuth: () => ({ permissions: fixture.permissions }),
    };
  },
);
vi.mock("next/navigation", () => ({ usePathname: () => fixture.pathname }));

function configured() {
  return [...STUDIO_SLUGS, ...OTHER_SLUGS].map((slug) => ({ slug }));
}

function quarterlyUpdate(): ActivityItem {
  return { id: "doc-1", collectionSlug: "pages", title: "Quarterly update" };
}

function resetFixture() {
  fixture.pathname = "/web-studio";
  fixture.permissions = undefined;
  fixture.items = [quarterlyUpdate()];
  fixture.collections = configured();
  fixture.serverFunctionMissing = false;
  fixture.serverFunction.mockImplementation(async () => ({
    items: fixture.items,
    page: 1,
    totalDocs: fixture.items.length,
  }));
}

resetFixture();

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  resetFixture();
});

function NativeLink({ href, ...props }: LinkAdapterProps) {
  return <a href={href} {...props} />;
}

function renderRail(pathname: string) {
  fixture.pathname = pathname;
  return render(
    <RouterAdapterContext
      value={{
        Link: NativeLink,
        pathname,
        params: {},
        searchParams: new URLSearchParams(),
        router: {
          push: fixture.push,
          replace: fixture.replace,
          refresh: vi.fn(),
          back: vi.fn(),
          forward: vi.fn(),
          prefetch: vi.fn(),
        },
      }}
    >
      <StudioNavRail />
    </RouterAdapterContext>,
  );
}

async function settle(container: HTMLElement) {
  await waitFor(() =>
    expect(
      container.querySelector('aside[data-hydrated="true"]'),
    ).not.toBeNull(),
  );
  for (let turn = 0; turn < 5; turn += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

function expectAbsent(container: HTMLElement, title: string) {
  expect(container.innerHTML).not.toContain(title);
  expect(screen.queryAllByText(title)).toEqual([]);
}

it("offers the same enabled sections on mobile and closes after Payload navigation (D-18: WP6 part 2b removes the Missionaries hub)", async () => {
  renderRail("/web-studio/collections/pages");

  fireEvent.click(
    screen.getByRole("button", { name: "Open studio navigation" }),
  );
  const dialog = await screen.findByRole("dialog", {
    name: "Web Studio navigation",
  });
  const navigation = within(dialog).getByRole("navigation", {
    name: "Studio sections",
  });
  const pageLink = within(navigation).getByRole("link", {
    name: "Pages",
    exact: true,
  });
  expect(pageLink.getAttribute("aria-current")).toBe("page");
  expect(
    within(navigation).getByRole("link", {
      name: "Template gallery",
      exact: true,
    }),
  ).toBeTruthy();
  expect(
    within(navigation).queryByRole("link", {
      name: "Missionaries",
      exact: true,
    }),
  ).toBeNull();
  fireEvent.click(pageLink);
  expect(fixture.push).toHaveBeenCalledExactlyOnceWith(
    "/web-studio/collections/pages",
    { scroll: undefined },
  );
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Web Studio navigation" }),
    ).toBeNull(),
  );
  expect(fixture.setPreference).not.toHaveBeenCalled();

  const trigger = screen.getByRole("button", {
    name: "Open studio navigation",
  });
  trigger.focus();
  fireEvent.click(trigger);
  const reopened = await screen.findByRole("dialog", {
    name: "Web Studio navigation",
  });
  fireEvent.keyDown(reopened, { key: "Escape" });
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Web Studio navigation" }),
    ).toBeNull(),
  );
  await waitFor(() => expect(document.activeElement).toBe(trigger));
});

it("reads recent documents through the access-checked server function, never a stored title (D-18: WP6 part 2b's collections and its login collection, principal-links)", async () => {
  fixture.items = [
    quarterlyUpdate(),
    { id: 3, collectionSlug: "principal-links", title: "editor@example.org" },
  ];
  const { container } = renderRail("/web-studio");

  const recent = await screen.findByRole("list", { name: "Recent" });
  const link = within(recent).getByRole("link", { name: "Quarterly update" });
  expect(link.getAttribute("href")).toBe("/web-studio/collections/pages/doc-1");
  expect(within(recent).getAllByRole("link")).toHaveLength(1);
  await settle(container);
  expectAbsent(container, STORED_TITLE);
  expectAbsent(container, "editor@example.org");
  expect(
    fixture.getPreference.mock.calls.filter(([key]) => key.endsWith(".recent")),
  ).toEqual([]);
  expect(fixture.serverFunction).toHaveBeenCalledExactlyOnceWith({
    name: "get-activity-widget-docs",
    args: {
      type: "recents",
      limit: 5,
      page: 1,
      excludedCollections: OTHER_SLUGS,
    },
  });
});

it("keeps a switched-off collection's documents out of the rail", async () => {
  vi.stubEnv("CMS_WEB_STUDIO_NATIVE_MEDIA", "false");
  fixture.items = [
    { id: 5, collectionSlug: "media", title: "Retired banner" },
    quarterlyUpdate(),
  ];
  const { container } = renderRail("/web-studio");

  const recent = await screen.findByRole("list", { name: "Recent" });
  expect(
    within(recent)
      .getAllByRole("link")
      .map((link) => link.textContent),
  ).toEqual(["Quarterly update"]);
  await settle(container);
  expectAbsent(container, "Retired banner");
  expect(fixture.serverFunction).toHaveBeenCalledExactlyOnceWith({
    name: "get-activity-widget-docs",
    args: {
      type: "recents",
      limit: 5,
      page: 1,
      excludedCollections: ["media", ...OTHER_SLUGS],
    },
  });
});

it("asks once with an empty exclusion list when Payload's config lists no collections", async () => {
  fixture.collections = undefined;
  renderRail("/web-studio");

  await screen.findByRole("link", { name: "Quarterly update" });
  expect(fixture.serverFunction).toHaveBeenCalledExactlyOnceWith({
    name: "get-activity-widget-docs",
    args: { type: "recents", limit: 5, page: 1, excludedCollections: [] },
  });
});

it.each([
  [
    "a refusal",
    () =>
      Promise.reject(
        Object.assign(new Error("Reload the page to continue."), {
          digest: webStudioRefusalDigest("scope_mismatch"),
        }),
      ),
  ],
  ["a plain error", () => Promise.reject(new Error("Network down"))],
])(
  "shows no recent documents after %s from the server function",
  async (_label, answer) => {
    fixture.serverFunction.mockImplementation(answer);
    const { container } = renderRail("/web-studio");

    await settle(container);
    expect(screen.queryByRole("list", { name: "Recent" })).toBeNull();
    expect(screen.queryByText("Recent")).toBeNull();
    expectAbsent(container, STORED_TITLE);
    expectAbsent(container, "Quarterly update");
    expect(fixture.serverFunction).toHaveBeenCalledTimes(1);
  },
);

it("shows no recent documents without a server function", async () => {
  fixture.serverFunctionMissing = true;
  const { container } = renderRail("/web-studio");

  await settle(container);
  expect(screen.queryByRole("list", { name: "Recent" })).toBeNull();
  expect(screen.queryByText("Recent")).toBeNull();
  expectAbsent(container, STORED_TITLE);
});

it("keeps recent documents as named navigation links and preserves Payload navigation", async () => {
  renderRail("/web-studio");
  const documentLink = await screen.findByTitle("Quarterly update");
  expect(documentLink.tagName).toBe("A");
  expect(documentLink.getAttribute("href")).toBe(
    "/web-studio/collections/pages/doc-1",
  );
  fireEvent.click(documentLink);
  expect(fixture.push).toHaveBeenCalledExactlyOnceWith(
    "/web-studio/collections/pages/doc-1",
    { scroll: undefined },
  );
  expect(screen.getByRole("link", { name: "Quarterly update" })).toBe(
    documentLink,
  );
  expect(screen.queryByRole("button", { name: "Quarterly update" })).toBeNull();
  expect(
    screen.getByRole("button", { name: "Collapse studio navigation" }),
  ).toBeTruthy();
});

it("keeps collapsed section controls as named links with one navigation and stable focus", async () => {
  renderRail("/web-studio/collections/pages");
  await screen.findByTitle("Quarterly update");
  fireEvent.click(
    screen.getByRole("button", { name: "Collapse studio navigation" }),
  );
  const pageLink = screen.getByRole("link", { name: "Pages", exact: true });
  expect(pageLink.tagName).toBe("A");
  expect(pageLink.getAttribute("href")).toBe("/web-studio/collections/pages");
  expect(pageLink.getAttribute("aria-current")).toBe("page");
  expect(pageLink.querySelector("button")).toBeNull();
  expect(
    screen.queryByRole("button", { name: "Pages", exact: true }),
  ).toBeNull();
  pageLink.focus();
  expect(document.activeElement).toBe(pageLink);
  fireEvent.click(pageLink);
  expect(fixture.push).toHaveBeenCalledExactlyOnceWith(
    "/web-studio/collections/pages",
    { scroll: undefined },
  );
  expect(fixture.setPreference).toHaveBeenCalledExactlyOnceWith(
    "web-studio.navCollapsed",
    { collapsed: true },
  );
});

it("offers no Administration list, even to a reader of the Site and login collections (D-18: WP6 part 2b retires the Users and Organizations lists)", async () => {
  fixture.permissions = {
    collections: {
      "principal-links": { read: { permission: true, where: { id: "a" } } },
      "site-presentations": {
        read: { permission: true, where: { tenant: "b" } },
      },
    },
  };
  renderRail("/web-studio");
  await screen.findByTitle("Quarterly update");
  const sections = screen.getByRole("navigation", { name: "Studio sections" });
  expect(
    within(sections).queryByRole("list", { name: "Administration" }),
  ).toBeNull();
  expect(within(sections).queryByRole("link", { name: "Users" })).toBeNull();
  expect(
    within(sections).queryByRole("link", { name: "Organizations" }),
  ).toBeNull();
});

it("leaves administration out for users who cannot read it", async () => {
  fixture.permissions = { collections: { tenants: { read: false } } };
  renderRail("/web-studio");
  await screen.findByTitle("Quarterly update");
  expect(screen.queryByRole("list", { name: "Administration" })).toBeNull();
  expect(screen.queryByRole("link", { name: "Organizations" })).toBeNull();
});

it("names the collapse toggle by its next action without a contradictory pressed state", async () => {
  renderRail("/web-studio");
  await screen.findByTitle("Quarterly update");
  const toggle = screen.getByRole("button", {
    name: "Collapse studio navigation",
  });
  expect(toggle.hasAttribute("aria-pressed")).toBe(false);
  fireEvent.click(toggle);
  const expand = screen.getByRole("button", {
    name: "Expand studio navigation",
  });
  expect(expand.hasAttribute("aria-pressed")).toBe(false);
});

it("names a recent document Payload titles by its id as the lists do", async () => {
  fixture.items = [
    quarterlyUpdate(),
    { id: 18, collectionSlug: "pages", title: "18" },
  ];
  renderRail("/web-studio");
  const untitled = await screen.findByRole("link", { name: "Untitled (18)" });
  expect(untitled.getAttribute("href")).toBe(
    "/web-studio/collections/pages/18",
  );
});
