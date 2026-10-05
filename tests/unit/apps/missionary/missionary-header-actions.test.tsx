/** @vitest-environment jsdom */

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("@asym/auth/client-session", () => ({ signOutClientSession: vi.fn() }));
vi.mock("@asym/ui/components/shadcn/sidebar", () => ({
  SidebarTrigger: () => <button type="button">Toggle sidebar</button>,
}));

import { AppHeader } from "../../../../apps/missionary/components/app-header";

afterEach(cleanup);

it("hides unsupported notifications and fixed-theme actions while preserving Help", async () => {
  const view = render(<AppHeader />);
  expect(view.queryByRole("button", { name: "Notifications" })).toBeNull();
  expect(view.queryByRole("button", { name: "Toggle theme" })).toBeNull();
  fireEvent.click(view.getByRole("button", { name: "Help" }));
  const about = await view.findByRole("menuitem", { name: "About" });
  expect(about.getAttribute("href")).toBe("/help/about");
});
