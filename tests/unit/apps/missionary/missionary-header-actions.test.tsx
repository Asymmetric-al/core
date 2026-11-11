/** @vitest-environment jsdom */

import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("@asym/ui/components/shadcn/sidebar", () => ({
  SidebarTrigger: () => <button type="button">Toggle sidebar</button>,
}));

import { AppHeader } from "../../../../apps/missionary/components/app-header";

afterEach(cleanup);

// Account, help and sign-out live in the sidebar's account menu, so the bar
// holds only the sidebar toggle, where you are and search.
it("keeps the workspace bar to the toggle, the current section and search", () => {
  const view = render(
    <AppHeader
      sectionLabel="Partners"
      navigation={<button type="button">Search</button>}
    />,
  );
  expect(view.getByRole("button", { name: "Toggle sidebar" })).toBeTruthy();
  expect(view.getByText("Partners")).toBeTruthy();
  expect(view.getByRole("button", { name: "Search" })).toBeTruthy();
  for (const name of ["Sign out", "Help", "Notifications", "Toggle theme"]) {
    expect(view.queryByRole("button", { name })).toBeNull();
  }
});

it("names the account pages too, so the bar and search know where you are", async () => {
  const { getNavItems } =
    await import("../../../../apps/missionary/components/navigation-items");
  const titles = Object.fromEntries(
    getNavItems("missionary").map((item) => [item.href, item.title]),
  );
  expect(titles["/settings"]).toBe("Settings");
  expect(titles["/help/about"]).toBe("About this app");
});
