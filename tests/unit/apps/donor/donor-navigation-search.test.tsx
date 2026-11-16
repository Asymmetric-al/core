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
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const scrollDescriptor = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "scrollIntoView",
);

const navigation = vi.hoisted(() => ({
  pathname: "/donor-dashboard/history",
  push: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push }),
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

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  if (scrollDescriptor)
    Object.defineProperty(
      HTMLElement.prototype,
      "scrollIntoView",
      scrollDescriptor,
    );
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
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

it("searches owned donor routes and navigates through the app router", async () => {
  render(<DonorPortalHeader />);
  fireEvent.click(screen.getByRole("button", { name: "Search donor pages" }));
  const dialog = await screen.findByRole("dialog", {
    name: "Donor navigation",
  });
  expect(
    within(dialog)
      .getAllByRole("option")
      .map((option) => option.textContent),
  ).toEqual([
    "Overview",
    "Updates",
    "Giving history",
    "Recurring gifts",
    "Payment methods",
    "Settings",
  ]);
  const search = within(dialog).getByRole("combobox", {
    name: "Search donor navigation",
  });
  await waitFor(() => expect(document.activeElement).toBe(search));
  fireEvent.change(search, { target: { value: "settings" } });
  await waitFor(() =>
    expect(within(dialog).getAllByRole("option")).toHaveLength(1),
  );
  fireEvent.keyDown(search, { key: "Enter" });
  expect(navigation.push).toHaveBeenCalledExactlyOnceWith(
    "/donor-dashboard/settings",
  );
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});

it.each(["ctrlKey", "metaKey"] as const)(
  "opens donor navigation with %s and restores focus after Escape",
  async (modifier) => {
    render(<DonorPortalHeader />);
    const trigger = screen.getByRole("button", { name: "Search donor pages" });
    trigger.focus();
    expect(fireEvent.keyDown(window, { key: "k", [modifier]: true })).toBe(
      false,
    );
    const search = await screen.findByRole("combobox", {
      name: "Search donor navigation",
    });
    await waitFor(() => expect(document.activeElement).toBe(search));
    fireEvent.keyDown(search, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  },
);

it("leaves draft-editing and account-menu shortcuts with their current owner", async () => {
  render(
    <>
      <DonorPortalHeader />
      <input aria-label="Profile draft" defaultValue="Unsaved profile" />
    </>,
  );
  const draft = screen.getByRole("textbox", { name: "Profile draft" });
  draft.focus();
  expect(fireEvent.keyDown(draft, { key: "k", ctrlKey: true })).toBe(true);
  expect(fireEvent.keyDown(draft, { key: "k", metaKey: true })).toBe(true);
  expect(document.activeElement).toBe(draft);
  expect((draft as HTMLInputElement).value).toBe("Unsaved profile");
  expect(screen.queryByRole("dialog", { name: "Donor navigation" })).toBeNull();

  fireEvent.click(
    screen.getByRole("button", { name: "Account menu for Avery Lopez" }),
  );
  const menu = await screen.findByRole("menu");
  expect(fireEvent.keyDown(menu, { key: "k", ctrlKey: true })).toBe(true);
  expect(fireEvent.keyDown(menu, { key: "k", metaKey: true })).toBe(true);
  expect(screen.queryByRole("dialog", { name: "Donor navigation" })).toBeNull();
  expect(navigation.push).not.toHaveBeenCalled();
});
