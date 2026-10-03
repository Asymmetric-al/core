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
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/tasks",
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
  expect(view.queryByRole("link", { name: "Profile" })).toBeNull();
  const trigger = view.getByRole("button", { name: "Toggle Sidebar" });
  trigger.focus();
  fireEvent.click(trigger);
  const sidebar = await view.findByRole("dialog", { name: "Sidebar" });
  expect(sidebar.getAttribute("data-mobile")).toBe("true");
  for (const [name, href] of [
    ["Donors", "/donors"],
    ["Tasks", "/tasks"],
    ["Profile", "/profile"],
  ]) {
    expect(
      within(sidebar).getByRole("link", { name }).getAttribute("href"),
    ).toBe(href);
  }
  expect(within(sidebar).queryByRole("link", { name: "Wallet" })).toBeNull();
  fireEvent.keyDown(sidebar, { key: "Escape" });
  await waitFor(() =>
    expect(view.queryByRole("dialog", { name: "Sidebar" })).toBeNull(),
  );
  await waitFor(() => expect(document.activeElement).toBe(trigger));
  expect(view.queryByRole("link", { name: "Profile" })).toBeNull();
});
