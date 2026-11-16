/** @vitest-environment jsdom */

import {
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
import { StudioNavRail } from "../../../apps/admin/src/cms-ui/web-studio/shell/studio-nav-rail";

import type { LinkAdapterProps } from "../../../apps/admin/node_modules/@payloadcms/ui/dist/providers/RouterAdapter/index.js";

const fixture = vi.hoisted(() => ({
  pathname: "/web-studio",
  extraRecent: [] as unknown[],
  getPreference: vi.fn(async (key: string) => {
    if (key === "web-studio.navCollapsed") return { collapsed: false };
    if (key === "web-studio.pages.recent") {
      return [
        {
          id: "doc-1",
          title: "Quarterly update",
          href: "/web-studio/collections/pages/doc-1",
        },
        ...fixture.extraRecent,
      ];
    }
    return [];
  }),
  setPreference: vi.fn(),
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
      useAuth: () => ({ permissions: fixture.permissions }),
    };
  },
);
vi.mock("next/navigation", () => ({ usePathname: () => fixture.pathname }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  fixture.pathname = "/web-studio";
  fixture.permissions = undefined;
  fixture.extraRecent = [];
});

it("offers the same enabled sections on mobile and closes after Payload navigation", async () => {
  fixture.pathname = "/web-studio/collections/pages";
  render(
    <RouterAdapterContext
      value={{
        Link: NativeLink,
        pathname: fixture.pathname,
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
    within(navigation).getByRole("link", { name: "Missionaries", exact: true }),
  ).toBeTruthy();
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

function NativeLink({ href, ...props }: LinkAdapterProps) {
  return <a href={href} {...props} />;
}

it("keeps recent documents as named navigation links and preserves Payload navigation", async () => {
  render(
    <RouterAdapterContext
      value={{
        Link: NativeLink,
        pathname: "/web-studio",
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
  fixture.pathname = "/web-studio/collections/pages";
  render(
    <RouterAdapterContext
      value={{
        Link: NativeLink,
        pathname: fixture.pathname,
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

it("gives stock admin lists a home for tenant-scoped readers", async () => {
  // Payload keeps a where-scoped read as an object, never `true`.
  fixture.permissions = {
    collections: {
      "cms-users": { read: { permission: true, where: { tenant: 1 } } },
      tenants: { read: { permission: true, where: { id: 1 } } },
    },
  };
  renderRail("/web-studio/collections/tenants");
  await screen.findByTitle("Quarterly update");
  const sections = screen.getByRole("navigation", { name: "Studio sections" });
  const admin = within(sections).getByRole("list", { name: "Administration" });
  expect(
    within(admin).getByRole("link", { name: "Users" }).getAttribute("href"),
  ).toBe("/web-studio/collections/cms-users");
  const tenants = within(admin).getByRole("link", { name: "Organizations" });
  expect(tenants.getAttribute("href")).toBe("/web-studio/collections/tenants");
  expect(tenants.getAttribute("aria-current")).toBe("page");
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

it("names a recent document saved before it had a title as the lists do", async () => {
  fixture.extraRecent = [
    { id: "18", title: "18", href: "/web-studio/collections/pages/18" },
  ];
  renderRail("/web-studio");
  const untitled = await screen.findByRole("link", { name: "Untitled (18)" });
  expect(untitled.getAttribute("href")).toBe(
    "/web-studio/collections/pages/18",
  );
});
