/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { setPlatform } from "@ui-sdk/core/testing";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import type { ReactNode } from "react";

const navigation = vi.hoisted(() => ({ pathname: "/", push: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push }),
}));
vi.mock("@asym/database/hooks", () => ({
  useMissionaryPortalSnapshot: () => ({ data: undefined }),
  usePendingFollowRequestCount: () => ({ data: undefined }),
}));
vi.mock("@asym/auth/client-session", () => ({
  signOutClientSession: vi.fn(),
  // The sidebar identity subscribes to client auth state; stay "loading".
  subscribeToClientAuthState: () => () => {},
}));

import {
  MissionaryLayoutShell,
  MissionaryWorkspaceChrome,
} from "../../../../apps/missionary/app/_providers/missionary-layout-shell";

/** The shell as `app/layout.tsx` composes it; the gate and scope are not under test here. */
function Shell({ children }: { children: ReactNode }) {
  return (
    <MissionaryLayoutShell
      workspace={
        <MissionaryWorkspaceChrome>{children}</MissionaryWorkspaceChrome>
      }
    >
      {children}
    </MissionaryLayoutShell>
  );
}

const scrollDescriptor = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "scrollIntoView",
);
beforeEach(() => {
  setPlatform("other");
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
    <Shell>
      <h1>Workspace</h1>
    </Shell>,
  );
  fireEvent.click(
    view.getByRole("button", { name: "Search missionary pages" }),
  );
  const search = await view.findByRole("combobox", {
    name: "Search missionary navigation",
  });
  expect(view.getAllByRole("dialog")).toHaveLength(1);
  expect(view.getAllByRole("option").map((item) => item.textContent)).toEqual([
    "Home",
    "Partners",
    "Tasks",
    "Updates",
    "Analytics",
    "Giving page",
    "Settings",
    "About this app",
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
  // The public site pages the workspace never had left its public routes
  // (council round 1, A13).
  "/api/auth/demo-account",
  "/boneyard",
  "/boneyard/capture",
  "/api/example",
  "/login/recovery",
])("keeps public %s free of workspace search and its shortcut", (pathname) => {
  navigation.pathname = pathname;
  const view = render(
    <Shell>
      <h1>Sign in</h1>
    </Shell>,
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
  fireEvent(document.body, shortcut);
  expect(shortcut.defaultPrevented).toBe(false);
  expect(view.queryByRole("dialog")).toBeNull();
  expect(navigation.push).not.toHaveBeenCalled();
});

it("releases an open workspace palette and its shortcut when returning to login", async () => {
  const content = (
    <Shell>
      <h1>Current page</h1>
    </Shell>
  );
  const view = render(content);
  fireEvent.click(
    view.getByRole("button", { name: "Search missionary pages" }),
  );
  await view.findByRole("dialog", { name: "Missionary navigation" });

  navigation.pathname = "/login";
  view.rerender(
    <Shell>
      <h1>Sign in</h1>
    </Shell>,
  );
  await waitFor(() => expect(view.queryByRole("dialog")).toBeNull());
  const shortcut = new KeyboardEvent("keydown", {
    key: "k",
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  });
  fireEvent(document.body, shortcut);
  expect(shortcut.defaultPrevented).toBe(false);
  expect(view.queryByRole("dialog")).toBeNull();
  expect(navigation.push).not.toHaveBeenCalled();
});
