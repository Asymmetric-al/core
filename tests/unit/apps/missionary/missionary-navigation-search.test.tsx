/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ pathname: "/", push: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push }),
}));
vi.mock("@asym/auth/client-session", () => ({ signOutClientSession: vi.fn() }));

import { MissionaryLayoutShell } from "../../../../apps/missionary/app/_providers/missionary-layout-shell";

const scrollDescriptor = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "scrollIntoView",
);
beforeEach(() => {
  navigation.pathname = "/";
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
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
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

it("mounts one missionary palette with the existing sidebar destinations", async () => {
  const view = render(
    <MissionaryLayoutShell>
      <h1>Workspace</h1>
    </MissionaryLayoutShell>,
  );
  fireEvent.click(
    view.getByRole("button", { name: "Search missionary pages" }),
  );
  const search = await view.findByRole("combobox", {
    name: "Search missionary navigation",
  });
  expect(view.getAllByRole("dialog")).toHaveLength(1);
  expect(view.getAllByRole("option").map((item) => item.textContent)).toEqual([
    "Dashboard",
    "Donors",
    "Ministry Updates",
    "Analytics",
    "Tasks",
    "Profile",
    "Settings",
  ]);
  expect(
    view.queryByRole("option", { name: /Sign out|Admin|Checkout/ }),
  ).toBeNull();
  fireEvent.change(search, { target: { value: "tasks" } });
  fireEvent.click(await view.findByRole("option", { name: "Tasks" }));
  expect(navigation.push).toHaveBeenCalledExactlyOnceWith("/tasks");
  await waitFor(() => expect(view.queryByRole("dialog")).toBeNull());
});

it.each([
  "/login",
  "/register",
  "/forgot-password",
  "/no-access",
  "/auth/callback",
  "/about",
  "/faq",
  "/financials",
  "/ways-to-give",
  "/workers",
  "/checkout",
  "/sign",
  "/api/auth/demo-account",
  "/sitemap.xml",
  "/robots.txt",
  "/boneyard",
  "/boneyard/capture",
  "/api/example",
  "/login/recovery",
  "/checkout/success",
  "/workers/example",
])("keeps public %s free of workspace search and its shortcut", (pathname) => {
  navigation.pathname = pathname;
  const view = render(
    <MissionaryLayoutShell>
      <h1>Sign in</h1>
    </MissionaryLayoutShell>,
  );
  expect(view.getByRole("heading", { name: "Sign in" })).toBeTruthy();
  expect(
    view.queryByRole("button", { name: "Search missionary pages" }),
  ).toBeNull();
  const shortcut = new KeyboardEvent("keydown", {
    key: "k",
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  });
  fireEvent(window, shortcut);
  expect(shortcut.defaultPrevented).toBe(false);
  expect(view.queryByRole("dialog")).toBeNull();
  expect(navigation.push).not.toHaveBeenCalled();
});

it("releases an open workspace palette and its shortcut when returning to login", async () => {
  const content = (
    <MissionaryLayoutShell>
      <h1>Current page</h1>
    </MissionaryLayoutShell>
  );
  const view = render(content);
  fireEvent.click(
    view.getByRole("button", { name: "Search missionary pages" }),
  );
  await view.findByRole("dialog", { name: "Missionary navigation" });

  navigation.pathname = "/login";
  view.rerender(
    <MissionaryLayoutShell>
      <h1>Sign in</h1>
    </MissionaryLayoutShell>,
  );
  await waitFor(() => expect(view.queryByRole("dialog")).toBeNull());
  const shortcut = new KeyboardEvent("keydown", {
    key: "k",
    metaKey: true,
    bubbles: true,
    cancelable: true,
  });
  fireEvent(window, shortcut);
  expect(shortcut.defaultPrevented).toBe(false);
  expect(view.queryByRole("dialog")).toBeNull();
  expect(navigation.push).not.toHaveBeenCalled();
});
