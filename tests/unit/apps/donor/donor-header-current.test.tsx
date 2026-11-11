/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({
  pathname: "/donor-dashboard/settings",
}));
vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@asym/auth/client-session", () => ({
  signOutClientSession: vi.fn(),
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

// eslint-disable-next-line no-restricted-imports -- AL-1931: The real donor portal header at its app boundary.
import { DonorPortalHeader } from "../../../../apps/donor/features/donor/components/donor-portal-header";

afterEach(() => {
  cleanup();
  navigation.pathname = "/donor-dashboard/settings";
});

it("marks Settings as the current page in the header itself, not only inside a closed menu", () => {
  render(<DonorPortalHeader />);

  const banner = screen.getByRole("banner");
  const settings = within(banner).getByRole("link", { name: "Settings" });
  expect(settings.getAttribute("href")).toBe("/donor-dashboard/settings");
  expect(settings.getAttribute("aria-current")).toBe("page");
  // The current-page bar the section tabs use sits under it too.
  expect(settings.parentElement!.className).toMatch(/after:bg-foreground/);

  // No section claims to be current while on Settings.
  for (const nav of screen.getAllByRole("navigation", {
    name: "Donor workspace",
  })) {
    expect(
      within(nav)
        .getAllByRole("link")
        .filter((link) => link.getAttribute("aria-current") === "page"),
    ).toHaveLength(0);
  }
});

it("leaves Settings unmarked on other pages", () => {
  navigation.pathname = "/donor-dashboard/history";
  render(<DonorPortalHeader />);

  const settings = within(screen.getByRole("banner")).getByRole("link", {
    name: "Settings",
  });
  expect(settings.getAttribute("aria-current")).toBeNull();
  expect(settings.parentElement!.className).not.toMatch(/after:bg-foreground/);
});

it("offers Settings once, so there is no unmarked copy in the account menu", async () => {
  render(<DonorPortalHeader />);

  fireEvent.click(
    screen.getByRole("button", { name: "Account menu for Avery Lopez" }),
  );
  const menu = await screen.findByRole("menu");
  expect(within(menu).queryByRole("menuitem", { name: "Settings" })).toBeNull();
  expect(within(menu).getByRole("menuitem", { name: "Sign out" })).toBeTruthy();
});

// Tablets (768 to 1279px) can't fit five two-word tabs beside the brand, Give,
// Settings and the account name, so the page scrolled sideways at 768px and
// the labels wrapped. Below xl the tabs use the phone bar's short names and
// the brand name steps aside; labels never wrap.
it("fits the header on tablets: short tab names and no brand name below xl", () => {
  navigation.pathname = "/donor-dashboard/history";
  render(<DonorPortalHeader />);
  const [tabs] = screen.getAllByRole("navigation", { name: "Donor workspace" });
  for (const link of within(tabs!).getAllByRole("link")) {
    expect(link.className).toMatch(/whitespace-nowrap/);
  }
  const giving = within(tabs!).getByRole("link", { name: /Giving history/ });
  const [short, full] = [...giving.querySelectorAll("span")];
  expect(short?.textContent).toBe("Giving");
  expect(short?.className).toMatch(/xl:hidden/);
  expect(full?.textContent).toBe("Giving history");
  expect(full?.className).toMatch(/hidden xl:inline/);
  // One-word tabs need no second name.
  expect(
    within(tabs!).getByRole("link", { name: "Overview" }).querySelector("span"),
  ).toBeNull();
  const brand = screen.getByRole("link", { name: /donor portal/ });
  expect(brand.querySelector("span:last-child")?.className).toMatch(
    /md:hidden xl:inline/,
  );
});
