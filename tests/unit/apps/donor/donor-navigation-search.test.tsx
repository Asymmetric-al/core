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

const navigation = vi.hoisted(() => ({
  pathname: "/donor-dashboard/history",
  signOut: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@asym/auth/client-session", () => ({
  signOutClientSession: navigation.signOut,
}));
vi.mock("@asym/database/hooks", () => ({
  useDonorPortalSnapshot: () => ({ data: undefined }),
}));
vi.mock("@asym/lib/hooks", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    profile: {
      first_name: "Avery",
      last_name: "Lopez",
      email: "avery@example.test",
      avatar_url: null,
    },
  }),
}));

import { DonorPortalHeader } from "../../../../apps/donor/features/donor/components/donor-portal-header";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  navigation.pathname = "/donor-dashboard/history";
});

it("names every portal section once and marks the current one", () => {
  render(<DonorPortalHeader />);
  // Desktop tabs and the phone tab bar share one name; only one shows per width.
  const [tabs, phone] = screen.getAllByRole("navigation", {
    name: "Donor workspace",
  });
  // Below xl a tab shows its short name; its full name is the xl one.
  expect(
    within(tabs!)
      .getAllByRole("link")
      .map(
        (link) =>
          link.querySelector(".xl\\:inline")?.textContent ?? link.textContent,
      ),
  ).toEqual([
    "Overview",
    "Updates",
    "Giving history",
    "Recurring gifts",
    "Payment methods",
  ]);
  expect(
    within(phone!)
      .getAllByRole("link")
      .map((link) => link.textContent),
  ).toEqual(["Overview", "Updates", "Giving", "Recurring", "Payments"]);
  expect(
    within(tabs!)
      .getByRole("link", { name: /Giving history/ })
      .getAttribute("aria-current"),
  ).toBe("page");
  expect(
    within(tabs!)
      .getByRole("link", { name: "Overview" })
      .getAttribute("aria-current"),
  ).toBeNull();
});

it("keeps Give and the account menu in the header, with sign-out inside the menu", async () => {
  let finish = () => {};
  navigation.signOut.mockImplementation(
    () => new Promise<void>((resolve) => (finish = resolve)),
  );
  render(<DonorPortalHeader />);
  expect(screen.getByRole("link", { name: "Give" }).getAttribute("href")).toBe(
    "/workers",
  );
  // Sign-out is not a top-level control any more.
  expect(screen.queryByRole("button", { name: "Sign out" })).toBeNull();

  fireEvent.click(
    screen.getByRole("button", { name: "Account menu for Avery Lopez" }),
  );
  const menu = await screen.findByRole("menu");
  expect(within(menu).getByText("avery@example.test")).toBeTruthy();
  // Settings is a header link of its own, so it can show when it's current.
  expect(within(menu).queryByRole("menuitem", { name: "Settings" })).toBeNull();
  expect(
    within(screen.getByRole("banner"))
      .getByRole("link", { name: "Settings" })
      .getAttribute("href"),
  ).toBe("/donor-dashboard/settings");
  fireEvent.click(within(menu).getByRole("menuitem", { name: "Sign out" }));
  await waitFor(() =>
    expect(screen.getByRole("status").textContent).toBe("Signing out…"),
  );
  expect(navigation.signOut).toHaveBeenCalledTimes(1);
  await act(async () => finish());
});
