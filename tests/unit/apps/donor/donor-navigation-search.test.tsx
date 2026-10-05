/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ push: vi.fn(), signOut: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/donor-dashboard",
  useRouter: () => ({ push: navigation.push }),
}));
vi.mock("@asym/auth/client-session", () => ({
  signOutClientSession: navigation.signOut,
}));

import { DonorSubNav } from "../../../../apps/donor/features/donor/components/DonorSubNav";

const scrollDescriptor = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "scrollIntoView",
);
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

it("keeps sign-out pending and prevents a duplicate session operation", async () => {
  let finish = () => {};
  navigation.signOut.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const view = render(<DonorSubNav />);
  const button = view.getByRole("button", { name: "Sign out", exact: true });
  fireEvent.click(button);
  await waitFor(() =>
    expect(view.getByRole("button", { name: "Signing out…" })).toBeTruthy(),
  );
  const pending = view.getByRole("button", { name: "Signing out…" });
  expect(pending.getAttribute("aria-disabled")).toBe("true");
  expect(pending.getAttribute("aria-busy")).toBe("true");
  expect(view.getByRole("status").textContent).toBe("Signing out…");
  fireEvent.click(pending);
  expect(navigation.signOut).toHaveBeenCalledTimes(1);
  await act(async () => finish());
  await waitFor(() =>
    expect(
      view.getByRole("button", { name: "Sign out", exact: true }),
    ).toBeTruthy(),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  if (scrollDescriptor)
    Object.defineProperty(
      HTMLElement.prototype,
      "scrollIntoView",
      scrollDescriptor,
    );
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
});

it("searches only donor workspace pages through the existing router", async () => {
  const view = render(<DonorSubNav />);
  fireEvent.click(view.getByRole("button", { name: "Search donor pages" }));
  const search = await view.findByRole("combobox", {
    name: "Search donor navigation",
  });
  expect(view.getAllByRole("option").map((item) => item.textContent)).toEqual([
    "Overview",
    "Donation History",
    "Ministry Updates",
    "Recurring Giving",
    "Wallet",
    "Settings",
  ]);
  expect(
    view.queryByRole("option", { name: /Sign out|Admin|Checkout/ }),
  ).toBeNull();
  fireEvent.change(search, { target: { value: "settings" } });
  fireEvent.click(await view.findByRole("option", { name: "Settings" }));
  expect(navigation.push).toHaveBeenCalledExactlyOnceWith(
    "/donor-dashboard/settings",
  );
  await waitFor(() => expect(view.queryByRole("dialog")).toBeNull());
});
