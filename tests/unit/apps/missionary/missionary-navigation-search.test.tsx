/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { setPlatform } from "@ui-sdk/core/testing";
import { afterEach, beforeAll, beforeEach, expect, it, vi } from "vitest";

import { LAYOUT_PREFIX, shellFromLayout } from "./layout-shell";

import type { ReactElement, ReactNode } from "react";

const navigation = vi.hoisted(() => ({ pathname: "/", push: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push }),
}));
vi.mock("@asym/database/hooks", () => ({
  useMissionaryPortalSnapshot: () => ({ data: undefined }),
  usePendingFollowRequestCount: () => ({ data: undefined }),
}));
// The shell as app/layout.tsx composes it, its workspace gate resolved once
// for a workspace page (council round 1, A24; ./layout-shell.tsx).
vi.mock("next/headers", () => ({
  headers: async () =>
    new Headers({
      "x-asym-pathname": "/00000000-0000-0000-0000-000000000001/tasks",
    }),
}));
vi.mock("@asym/auth/context", () => ({
  getAuthContext: async () => ({
    isAuthenticated: true,
    userId: "00000000-0000-4000-8000-0000000e2e40",
    tenantId: "00000000-0000-0000-0000-000000000001",
    role: "missionary",
  }),
  hasAnyContextRole: () => true,
}));
vi.mock("@asym/auth/tenant-server", () => ({
  readDocumentScope: async () => ({
    userId: "00000000-0000-4000-8000-0000000e2e40",
    tenantId: "00000000-0000-0000-0000-000000000001",
    assignmentId: "00000000-0000-4000-8000-0000000e2e41",
    addressPrefix: "/00000000-0000-0000-0000-000000000001",
  }),
  redirectInTenant: async () => {
    throw new Error("the workspace gate redirected");
  },
}));
vi.mock("@asym/ui/fonts", () => ({ fontVariables: "" }));
vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({ url: "https://example.supabase.co" }),
}));
vi.mock("@asym/auth/client-session", () => ({
  signOutClientSession: vi.fn(),
  // The sidebar identity subscribes to client auth state; stay "loading".
  subscribeToClientAuthState: () => () => {},
}));

let layoutShell: (children: ReactNode) => ReactElement;
beforeAll(async () => {
  layoutShell = await shellFromLayout();
});

/** The shell exactly as `app/layout.tsx` composes it (A24). */
function Shell({ children }: { children: ReactNode }) {
  return layoutShell(children);
}

const scrollDescriptor = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "scrollIntoView",
);
beforeEach(() => {
  setPlatform("other");
  navigation.pathname = LAYOUT_PREFIX;
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
  // The tenant router carries the organization's prefix.
  expect(navigation.push).toHaveBeenCalledExactlyOnceWith(
    `${LAYOUT_PREFIX}/tasks`,
  );
  await waitFor(() => expect(view.queryByRole("dialog")).toBeNull());
});

it.each([
  "/login",
  "/register",
  "/forgot-password",
  "/no-access",
  // The public site pages the workspace never had left its public routes
  // (A13); /auth/callback and /api paths are route handlers, never pages,
  // where the layout's gate renders nothing (A24).
  "/boneyard",
  "/boneyard/capture",
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
