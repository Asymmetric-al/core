/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { setPlatform } from "@ui-sdk/core/testing";
import { renderToString } from "react-dom/server";
import { afterEach, beforeAll, beforeEach, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({
  pathname: "/login",
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => navigation,
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
vi.mock("@asym/database/hooks", () => ({
  useMissionaryPortalSnapshot: () => ({ data: undefined }),
  usePendingFollowRequestCount: () => ({ data: undefined }),
}));
vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => ({
    auth: { getUser: async () => ({ data: { user: null } }) },
  }),
}));

// eslint-disable-next-line no-restricted-imports -- AL-1976: Test actual Missionary account composition rather than a replacement shell.
import LoginLoading from "../../../../apps/missionary/app/(auth)/login/loading";
// eslint-disable-next-line no-restricted-imports -- AL-1976: Preserve the app's existing password-help content in composed coverage.
import ForgotPasswordPage from "../../../../apps/missionary/app/forgot-password/page";
// eslint-disable-next-line no-restricted-imports -- AL-2673: The reset step's loading state must keep the account frame.
import ResetPasswordLoading from "../../../../apps/missionary/app/forgot-password/reset/loading";
// eslint-disable-next-line no-restricted-imports -- AL-1976: Verify the existing no-access page in its account frame.
import NoAccessPage from "../../../../apps/missionary/app/no-access/page";
// eslint-disable-next-line no-restricted-imports -- AL-1976: Verify the actual registration loading composition.
import RegisterLoading from "../../../../apps/missionary/app/register/loading";
import { LoginScreen } from "../../../../packages/ui/components/auth/LoginScreen";
import { RegisterScreen } from "../../../../packages/ui/components/auth/RegisterScreen";
import { ResetPasswordScreen } from "../../../../packages/ui/components/auth/ResetPasswordScreen";
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../packages/ui/node_modules/@tanstack/react-query/build/modern/index.js";

import { LAYOUT_PREFIX, shellFromLayout } from "./layout-shell";

import type { ReactElement, ReactNode } from "react";

let layoutShell: (children: ReactNode) => ReactElement;
beforeAll(async () => {
  layoutShell = await shellFromLayout();
});

/** The shell exactly as `app/layout.tsx` composes it (A24). */
function Shell({ children }: { children: ReactNode }) {
  return layoutShell(children);
}

const clients: QueryClient[] = [];
const scrollDescriptor = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "scrollIntoView",
);
beforeEach(() => {
  setPlatform("other");
  navigation.pathname = "/login";
  vi.stubGlobal("innerWidth", 390);
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ roles: {} })),
  );
  vi.stubGlobal("matchMedia", (media: string) => ({
    matches: media.includes("max-width"),
    addEventListener() {},
    removeEventListener() {},
  }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
});
afterEach(() => {
  cleanup();
  clients.splice(0).forEach((client) => client.clear());
  vi.unstubAllGlobals();
  if (scrollDescriptor) {
    Object.defineProperty(
      HTMLElement.prototype,
      "scrollIntoView",
      scrollDescriptor,
    );
  } else {
    Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
  }
});

function compose(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  clients.push(client);
  return (
    <QueryClientProvider client={client}>
      <Shell>{children}</Shell>
    </QueryClientProvider>
  );
}

function expectStandalone(view: ReturnType<typeof render>) {
  expect(view.container.querySelector("header, footer")).toBeNull();
  expect(view.queryByRole("banner")).toBeNull();
  expect(view.queryByRole("contentinfo")).toBeNull();
  expect(view.queryByRole("button", { name: "Toggle Sidebar" })).toBeNull();
  expect(view.queryByRole("button", { name: "Sign out" })).toBeNull();
  expect(
    view.queryByRole("button", { name: "Search missionary pages" }),
  ).toBeNull();
  expect(
    view.container.querySelector('[data-slot="sidebar-wrapper"]'),
  ).toBeNull();
  expect(view.getAllByRole("main")).toHaveLength(1);
}

it("server-renders login loading without any dashboard chrome", () => {
  const markup = renderToString(
    <Shell>
      <LoginLoading />
    </Shell>,
  );
  const view = render(<div dangerouslySetInnerHTML={{ __html: markup }} />);
  expectStandalone(view);
  expect(view.getByRole("main").getAttribute("aria-busy")).toBe("true");
  expect(view.getByRole("status", { name: "Loading sign-in" })).toBeTruthy();
});

it("server-renders registration loading with one full-page content landmark", () => {
  navigation.pathname = "/register";
  const markup = renderToString(
    <Shell>
      <RegisterLoading />
    </Shell>,
  );
  const view = render(<div dangerouslySetInnerHTML={{ __html: markup }} />);
  expect(view.getAllByRole("main")).toHaveLength(1);
  expect(view.getByRole("main").getAttribute("aria-busy")).toBe("true");
  expect(
    view.getByRole("status", { name: "Loading registration" }),
  ).toBeTruthy();
});

const accountScreens = [
  [
    "/login",
    <LoginScreen appId="missionary" nextPath="/tasks" demoOnly={false} />,
  ],
  [
    "/register",
    <RegisterScreen
      appId="missionary"
      enabled={false}
      title="Registration unavailable"
    />,
  ],
  ["/forgot-password", <ForgotPasswordPage />],
  [
    "/forgot-password/reset",
    <ResetPasswordScreen appId="missionary" recovery={null} />,
  ],
  [
    "/forgot-password/reset",
    <ResetPasswordScreen
      appId="missionary"
      recovery={{ email: "missionary@example.com", secondsLeft: 3600 }}
    />,
  ],
  ["/forgot-password/reset", <ResetPasswordLoading />],
  ["/no-access", <NoAccessPage />],
] as const;

it.each(accountScreens)(
  "renders %s standalone before hydration and on mount",
  (pathname, content) => {
    navigation.pathname = pathname;
    const serverView = render(
      <div
        dangerouslySetInnerHTML={{ __html: renderToString(compose(content)) }}
      />,
    );
    expectStandalone(serverView);
    serverView.unmount();
    const view = render(compose(content));
    expectStandalone(view);
    // The account component owns the frame; no padded workspace ancestor remains.
    expect(view.container.firstElementChild).toBe(view.getByRole("main"));
    if (pathname === "/register") {
      expect(
        view.getByText(/Self-service registration is not available/),
      ).toBeTruthy();
      expect(view.queryByRole("button", { name: "Create account" })).toBeNull();
    }
    if (pathname === "/forgot-password") {
      expect(
        view.getByRole("button", { name: "Send reset link" }),
      ).toBeTruthy();
      expect(
        view
          .getByRole("link", { name: "Back to sign in" })
          .getAttribute("href"),
      ).toBe("/login");
    }
  },
);

it.each([
  "/login/anything",
  "/register/step",
  "/forgot-password/sent",
  "/no-access/anything",
])("keeps the account sub-route %s outside the workspace shell", (pathname) => {
  navigation.pathname = pathname;
  const view = render(
    compose(
      <main>
        <h1>Account page</h1>
      </main>,
    ),
  );
  expectStandalone(view);
  expect(view.container.firstElementChild).toBe(view.getByRole("main"));
});

// /workers and /checkout left this list with the public routes the workspace
// never had pages for (council round 1, A13). Workspace pages are tenant
// addresses; /auth/callback is a route handler, where the layout's gate
// renders nothing (A24).
it.each([
  LAYOUT_PREFIX,
  `${LAYOUT_PREFIX}/tasks`,
  `${LAYOUT_PREFIX}/login-history`,
])("preserves the existing shell on %s", (pathname) => {
  navigation.pathname = pathname;
  const view = render(compose(<h1>Existing page</h1>));
  expect(view.getByRole("banner")).toBeTruthy();
  // The workspace has no footer, and sign-out lives in the account menu.
  expect(view.queryByRole("contentinfo")).toBeNull();
  expect(view.queryByRole("button", { name: "Sign out" })).toBeNull();
  expect(
    view.getAllByRole("button", { name: "Toggle Sidebar" }).length,
  ).toBeGreaterThan(0);
  expect(
    view.getByRole("button", { name: "Search missionary pages" }),
  ).toBeTruthy();
});

it.each(["/boneyard", "/boneyard/capture"])(
  "preserves the special capture frame on %s",
  (pathname) => {
    navigation.pathname = pathname;
    const view = render(compose(<h1>Capture</h1>));
    expect(view.queryByRole("banner")).toBeNull();
    expect(view.queryByRole("contentinfo")).toBeNull();
    expect(view.container.firstElementChild?.tagName).toBe("DIV");
    expect(view.getByRole("heading", { name: "Capture" }).parentElement).toBe(
      view.container.firstElementChild,
    );
  },
);

it.each(["palette", "sidebar"])(
  "unmounts an open %s portal and both workspace shortcuts on login, then restores navigation",
  async (overlay) => {
    navigation.pathname = `${LAYOUT_PREFIX}/tasks`;
    const view = render(compose(<h1>Tasks</h1>));
    fireEvent.click(
      view.getAllByRole("button", {
        name:
          overlay === "palette" ? "Search missionary pages" : "Toggle Sidebar",
      })[0]!,
    );
    await view.findByRole("dialog", {
      name: overlay === "palette" ? "Missionary navigation" : "Sidebar",
    });

    navigation.pathname = "/login";
    view.rerender(compose(<LoginLoading />));
    await waitFor(() => expect(view.queryByRole("dialog")).toBeNull());
    expectStandalone(view);
    for (const key of ["b", "k"]) {
      const shortcut = new KeyboardEvent("keydown", {
        key,
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      fireEvent(document.body, shortcut);
      expect(shortcut.defaultPrevented).toBe(false);
    }

    navigation.pathname = `${LAYOUT_PREFIX}/tasks`;
    view.rerender(compose(<h1>Tasks</h1>));
    const shortcut = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    fireEvent(document.body, shortcut);
    expect(shortcut.defaultPrevented).toBe(true);
    await view.findByRole("dialog", { name: "Missionary navigation" });
    fireEvent.click(view.getByRole("option", { name: "Home" }));
    expect(navigation.push).toHaveBeenCalledWith(LAYOUT_PREFIX);
  },
);
