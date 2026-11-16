/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1931: Exercise the actual missionary header/sidebar composition at its app boundary.
import { AppHeader } from "../../../../apps/missionary/components/app-header";
// eslint-disable-next-line no-restricted-imports -- AL-1931: Verify the flagged AppSidebar through the actual shared mobile Sheet.
import { AppSidebar } from "../../../../apps/missionary/components/app-sidebar";
import { SidebarProvider } from "../../../../packages/ui/components/shadcn/sidebar";

vi.mock("@asym/auth/client-session", () => ({
  signOutClientSession: vi.fn().mockResolvedValue(undefined),
  subscribeToClientAuthState: (
    onState: (state: {
      user: { email: string } | null;
      profile: Record<string, unknown> | null;
      loading: boolean;
    }) => void,
  ) => {
    onState({
      user: { email: "jordan@example.org" },
      profile: {
        display_name: "Jordan Hale",
        first_name: "Jordan",
        last_name: "Hale",
        email: "jordan@example.org",
        avatar_url: null,
      },
      loading: false,
    });
    return () => {};
  },
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/tasks",
}));
vi.mock("@asym/database/hooks", () => ({
  useMissionaryPortalSnapshot: () => ({ data: undefined }),
  usePendingFollowRequestCount: () => ({ data: undefined }),
}));

beforeEach(() => {
  vi.stubGlobal("innerWidth", 390);
  vi.stubGlobal("matchMedia", (media: string) => ({
    media,
    matches: media.includes("max-width"),
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("opens the actual missionary mobile sidebar with its named routes and restores focus after Escape", async () => {
  const view = render(
    <SidebarProvider>
      <AppSidebar role="missionary" />
      <AppHeader title="Tasks" />
    </SidebarProvider>,
  );
  expect(view.queryByRole("dialog", { name: "Sidebar" })).toBeNull();
  expect(view.queryByRole("link", { name: "Giving page" })).toBeNull();
  const trigger = view.getByRole("button", { name: "Toggle Sidebar" });
  trigger.focus();
  fireEvent.click(trigger);
  const sidebar = await view.findByRole("dialog", { name: "Sidebar" });
  expect(sidebar.getAttribute("data-mobile")).toBe("true");
  for (const [name, href] of [
    ["Partners", "/donors"],
    ["Tasks", "/tasks"],
    ["Giving page", "/profile"],
  ]) {
    expect(
      within(sidebar).getByRole("link", { name }).getAttribute("href"),
    ).toBe(href);
  }
  expect(
    within(sidebar)
      .getByRole("link", { name: "Tasks" })
      .getAttribute("aria-current"),
  ).toBe("page");
  expect(
    within(sidebar)
      .getByRole("link", { name: "Giving page" })
      .hasAttribute("aria-current"),
  ).toBe(false);
  expect(within(sidebar).queryByRole("link", { name: "Wallet" })).toBeNull();
  fireEvent.keyDown(sidebar, { key: "Escape" });
  await waitFor(() =>
    expect(view.queryByRole("dialog", { name: "Sidebar" })).toBeNull(),
  );
  await waitFor(() => expect(document.activeElement).toBe(trigger));
  expect(view.queryByRole("link", { name: "Giving page" })).toBeNull();
});

it("shows the signed-in missionary instead of a placeholder identity", async () => {
  const view = render(
    <SidebarProvider>
      <AppSidebar role="missionary" />
      <AppHeader title="Tasks" />
    </SidebarProvider>,
  );
  fireEvent.click(view.getByRole("button", { name: "Toggle Sidebar" }));
  const sidebar = await view.findByRole("dialog", { name: "Sidebar" });
  expect(
    within(sidebar).getByRole("button", {
      name: "Account menu for Jordan Hale",
    }),
  ).toBeTruthy();
  expect(within(sidebar).queryByText("User Name")).toBeNull();
  expect(
    within(sidebar).getByRole("navigation", { name: "Missionary workspace" }),
  ).toBeTruthy();
});

it("closes the mobile sheet once a destination is chosen", async () => {
  const view = render(
    <SidebarProvider>
      <AppSidebar role="missionary" />
      <AppHeader title="Tasks" />
    </SidebarProvider>,
  );
  fireEvent.click(view.getByRole("button", { name: "Toggle Sidebar" }));
  const sidebar = await view.findByRole("dialog", { name: "Sidebar" });
  fireEvent.click(within(sidebar).getByRole("link", { name: "Partners" }));
  await waitFor(() =>
    expect(view.queryByRole("dialog", { name: "Sidebar" })).toBeNull(),
  );
});

it("names the organization the same way the donor app does", async () => {
  const { siteConfig } = await import("@asym/config/site-client");
  const view = render(
    <SidebarProvider>
      <AppSidebar role="missionary" />
      <AppHeader title="Tasks" />
    </SidebarProvider>,
  );
  fireEvent.click(view.getByRole("button", { name: "Toggle Sidebar" }));
  const sidebar = await view.findByRole("dialog", { name: "Sidebar" });
  expect(within(sidebar).getByText(siteConfig.name)).toBeTruthy();
});

it("reads the brand name from the browser-safe site config", async () => {
  const { readFileSync } = await import("node:fs");
  const path = await import("node:path");
  const source = readFileSync(
    path.resolve(
      __dirname,
      "../../../../apps/missionary/components/app-sidebar.tsx",
    ),
    "utf8",
  );
  // The sidebar runs in the browser; "@asym/config/site" reads server-only
  // settings and crashes there.
  expect(source).toContain('from "@asym/config/site-client"');
  expect(source).not.toContain('from "@asym/config/site"');
});
