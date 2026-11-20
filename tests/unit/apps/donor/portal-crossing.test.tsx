// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Council round 2 on slice B, BR2 (record D-41): every crossing of the donor
 * portal's boundary, out or in, is one document load at its source. The
 * donor app declares the portal's path at its root, so the shared link and
 * router helpers (`TenantLink`, `useTenantRouter`) that already load a
 * document for a crossing of a tenant's segment do it for the portal too:
 * the links out of and into the portal, and the landing after sign-in,
 * sign-up, password reset and the demo sign-in, which the shared auth
 * screens make through the tenant router. The scope provider's own reloads
 * (BR1) remain the fallback for a crossing that bypasses them.
 */

const nav = vi.hoisted(() => ({
  pathname: "/",
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  refresh: vi.fn(),
}));
const reloadDocument = vi.hoisted(() => vi.fn());
const loadDocument = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useRouter: () => ({
    push: nav.push,
    replace: nav.replace,
    prefetch: nav.prefetch,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: nav.refresh,
  }),
}));
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    prefetch: _prefetch,
    replace: _replace,
    ...props
  }: {
    href: string;
    children: ReactNode;
    prefetch?: boolean | null;
    replace?: boolean;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("../../../../packages/database/document-reload", () => ({
  reloadDocument,
  loadDocument,
}));

/** A new donor app document, loaded at `pathname`. */
async function documentLoadedAt(pathname: string) {
  vi.resetModules();
  vi.spyOn(performance, "getEntriesByType").mockImplementation((type) =>
    type === "navigation"
      ? ([{ name: `http://localhost:3005${pathname}` }] as PerformanceEntryList)
      : [],
  );
  nav.pathname = pathname.split("?")[0]!;
  window.history.replaceState(null, "", pathname);
  const navigation =
    await import("../../../../packages/auth/tenant-navigation");
  const portal = await import("../../../../packages/auth/portal-document");
  return { ...navigation, ...portal };
}

beforeEach(() => {
  vi.restoreAllMocks();
  for (const fn of [nav.push, nav.replace, nav.prefetch, nav.refresh]) {
    fn.mockReset();
  }
  reloadDocument.mockReset();
  loadDocument.mockReset();
});

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});

describe("crossing the donor portal's boundary", () => {
  it("loads the target of a link out of the portal as a new document at the click", async () => {
    const mod = await documentLoadedAt("/donor-dashboard");
    render(
      <mod.PortalSegmentBoundary>
        <mod.TenantLink href="/checkout?missionary_id=m1">
          Give again
        </mod.TenantLink>
        <mod.TenantLink href="/workers">Give</mod.TenantLink>
        <mod.TenantLink href="/">Visit the site</mod.TenantLink>
      </mod.PortalSegmentBoundary>,
    );

    act(() => screen.getByText("Give again").click());
    expect(loadDocument).toHaveBeenLastCalledWith(
      "/checkout?missionary_id=m1",
      { replace: false },
    );
    act(() => screen.getByText("Give").click());
    expect(loadDocument).toHaveBeenLastCalledWith("/workers", {
      replace: false,
    });
    act(() => screen.getByText("Visit the site").click());
    expect(loadDocument).toHaveBeenLastCalledWith("/", { replace: false });
    expect(loadDocument).toHaveBeenCalledTimes(3);
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("loads the portal as a new document from a link on the public site", async () => {
    const mod = await documentLoadedAt("/");
    render(
      <mod.PortalSegmentBoundary>
        <mod.TenantLink href="/donor-dashboard">Donor Portal</mod.TenantLink>
        <mod.TenantLink href="/about">Our Mission</mod.TenantLink>
      </mod.PortalSegmentBoundary>,
    );

    act(() => screen.getByText("Donor Portal").click());
    expect(loadDocument).toHaveBeenCalledWith("/donor-dashboard", {
      replace: false,
    });
    loadDocument.mockReset();
    // Between two public pages navigation stays soft.
    act(() => screen.getByText("Our Mission").click());
    expect(loadDocument).not.toHaveBeenCalled();
  });

  it("leaves a modifier key, the middle button and a target to the browser", async () => {
    const mod = await documentLoadedAt("/donor-dashboard");
    render(
      <mod.PortalSegmentBoundary>
        <mod.TenantLink href="/workers">Give</mod.TenantLink>
        <mod.TenantLink href="/workers" target="_blank">
          Give in a new tab
        </mod.TenantLink>
      </mod.PortalSegmentBoundary>,
    );
    const give = screen.getByText("Give");

    for (const init of [
      { ctrlKey: true },
      { metaKey: true },
      { shiftKey: true },
      { altKey: true },
      { button: 1 },
    ]) {
      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        ...init,
      });
      act(() => {
        give.dispatchEvent(event);
      });
      expect(event.defaultPrevented, JSON.stringify(init)).toBe(false);
    }
    fireEvent.click(screen.getByText("Give in a new tab"));
    expect(loadDocument).not.toHaveBeenCalled();
  });

  it("lands in the portal with a document load after sign-in, sign-up, password reset and the demo sign-in", async () => {
    // The shared auth screens (LoginScreen, RegisterScreen,
    // ResetPasswordScreen) land with the tenant router's replace, then refresh.
    for (const screenPath of [
      "/login?next=%2Fdonor-dashboard",
      "/register",
      "/forgot-password/reset",
    ]) {
      const mod = await documentLoadedAt(screenPath);
      let router: ReturnType<typeof mod.useTenantRouter> | null = null;
      function AuthScreen() {
        router = mod.useTenantRouter();
        return null;
      }
      render(
        <mod.PortalSegmentBoundary>
          <AuthScreen />
        </mod.PortalSegmentBoundary>,
      );

      act(() => {
        router!.replace("/donor-dashboard");
        router!.refresh();
      });

      expect(loadDocument, screenPath).toHaveBeenCalledTimes(1);
      expect(loadDocument).toHaveBeenLastCalledWith("/donor-dashboard", {
        replace: true,
      });
      expect(nav.replace).not.toHaveBeenCalled();
      expect(nav.refresh).not.toHaveBeenCalled();
      cleanup();
      loadDocument.mockReset();
    }
  });

  it("keeps navigation inside the portal soft", async () => {
    const mod = await documentLoadedAt("/donor-dashboard/history");
    let router: ReturnType<typeof mod.useTenantRouter> | null = null;
    function Page() {
      router = mod.useTenantRouter();
      return (
        <mod.TenantLink href="/donor-dashboard/pledges">Pledges</mod.TenantLink>
      );
    }
    render(
      <mod.PortalSegmentBoundary>
        <Page />
      </mod.PortalSegmentBoundary>,
    );

    act(() => screen.getByText("Pledges").click());
    act(() => router!.push("/donor-dashboard/wallet"));
    expect(loadDocument).not.toHaveBeenCalled();
    expect(nav.push).toHaveBeenCalledWith("/donor-dashboard/wallet");
  });
});

/** Finds the first element in a tree whose component has `name`. */
function findElement(node: unknown, name: string): ReactElement | null {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElement(child, name);
      if (found) return found;
    }
    return null;
  }
  if (!isValidElement(node)) return null;
  const type = node.type as { name?: string } | string;
  if (typeof type === "function" && type.name === name) return node;
  for (const value of Object.values(
    (node.props ?? {}) as Record<string, unknown>,
  )) {
    const found = findElement(value, name);
    if (found) return found;
  }
  return null;
}

/** Whether `target` is `node` or inside it, by identity. */
function contains(node: unknown, target: ReactElement): boolean {
  if (node === target) return true;
  if (Array.isArray(node)) return node.some((child) => contains(child, target));
  if (!isValidElement(node)) return false;
  return Object.values((node.props ?? {}) as Record<string, unknown>).some(
    (value) => contains(value, target),
  );
}

describe("the donor app's root layout", () => {
  it("declares the portal's boundary around every page", async () => {
    vi.resetModules();
    vi.doMock("@asym/ui/fonts", () => ({ fontVariables: "" }));
    const { default: RootLayout } =
      await import("../../../../apps/donor/app/layout");
    const page = <p>page</p>;
    const tree = RootLayout({ children: page });

    const boundary = findElement(tree, "PortalSegmentBoundary");
    expect(boundary).not.toBeNull();
    expect(contains(boundary, page)).toBe(true);
  });
});
