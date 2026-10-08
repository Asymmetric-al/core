/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

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
vi.mock("@asym/auth/client-session", () => ({ signOutClientSession: vi.fn() }));
vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => ({
    auth: { getUser: async () => ({ data: { user: null } }) },
  }),
}));

// eslint-disable-next-line no-restricted-imports -- AL-1976: Test actual Missionary account composition rather than a replacement shell.
import LoginLoading from "../../../../apps/missionary/app/(auth)/login/loading";
// eslint-disable-next-line no-restricted-imports -- AL-1976: The app selector is the public account/workspace presentation seam.
import { MissionaryLayoutShell } from "../../../../apps/missionary/app/_providers/missionary-layout-shell";
// eslint-disable-next-line no-restricted-imports -- AL-1976: Preserve the app's existing password-help content in composed coverage.
import ForgotPasswordPage from "../../../../apps/missionary/app/forgot-password/page";
// eslint-disable-next-line no-restricted-imports -- AL-1976: Verify the existing no-access page in its account frame.
import NoAccessPage from "../../../../apps/missionary/app/no-access/page";
// eslint-disable-next-line no-restricted-imports -- AL-1976: Verify the actual registration loading composition.
import RegisterLoading from "../../../../apps/missionary/app/register/loading";
import { LoginScreen } from "../../../../packages/ui/components/auth/LoginScreen";
import { RegisterScreen } from "../../../../packages/ui/components/auth/RegisterScreen";
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../packages/ui/node_modules/@tanstack/react-query/build/modern/index.js";

import type { ReactNode } from "react";

const clients: QueryClient[] = [];
const scrollDescriptor = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "scrollIntoView",
);
beforeEach(() => {
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
      <MissionaryLayoutShell>{children}</MissionaryLayoutShell>
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
    <MissionaryLayoutShell>
      <LoginLoading />
    </MissionaryLayoutShell>,
  );
  const view = render(<div dangerouslySetInnerHTML={{ __html: markup }} />);
  expectStandalone(view);
  expect(view.getByRole("main").getAttribute("aria-busy")).toBe("true");
  expect(view.getByRole("status", { name: "Loading sign-in" })).toBeTruthy();
});

it("server-renders registration loading with one full-page content landmark", () => {
  navigation.pathname = "/register";
  const markup = renderToString(
    <MissionaryLayoutShell>
      <RegisterLoading />
    </MissionaryLayoutShell>,
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
      expect(view.queryByRole("button", { name: "Create Account" })).toBeNull();
    }
    if (pathname === "/forgot-password") {
      expect(view.getByText(/Password reset is not enabled yet/)).toBeTruthy();
      expect(
        view.getByRole("link", { name: "Back to login" }).getAttribute("href"),
      ).toBe("/login");
    }
  },
);

it.each([
  "/",
  "/tasks",
  "/workers",
  "/checkout",
  "/auth/callback",
  "/login-history",
])("preserves the existing shell on %s", (pathname) => {
  navigation.pathname = pathname;
  const view = render(compose(<h1>Existing page</h1>));
  expect(view.getByRole("banner")).toBeTruthy();
  expect(view.getByRole("contentinfo")).toBeTruthy();
  expect(view.getByRole("button", { name: "Sign out" })).toBeTruthy();
  expect(
    view.getAllByRole("button", { name: "Toggle Sidebar" }).length,
  ).toBeGreaterThan(0);
  expect(
    Boolean(view.queryByRole("button", { name: "Search missionary pages" })),
  ).toBe(["/", "/tasks", "/login-history"].includes(pathname));
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
    navigation.pathname = "/tasks";
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
      fireEvent(window, shortcut);
      expect(shortcut.defaultPrevented).toBe(false);
    }

    navigation.pathname = "/tasks";
    view.rerender(compose(<h1>Tasks</h1>));
    const shortcut = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    fireEvent(window, shortcut);
    expect(shortcut.defaultPrevented).toBe(true);
    await view.findByRole("dialog", { name: "Missionary navigation" });
    fireEvent.click(view.getByRole("option", { name: "Dashboard" }));
    expect(navigation.push).toHaveBeenCalledWith("/");
  },
);
