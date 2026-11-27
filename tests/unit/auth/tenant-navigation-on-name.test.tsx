// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { Component, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type * as FormatUrl from "next/dist/shared/lib/router/utils/format-url";

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
vi.mock("next/link", async () => {
  const { formatUrl } = await vi.importActual<typeof FormatUrl>(
    "next/dist/shared/lib/router/utils/format-url",
  );
  return {
    default: ({
      href,
      children,
      prefetch: _prefetch,
      replace: _replace,
      ...props
    }: {
      href: string | Parameters<typeof formatUrl>[0];
      children: ReactNode;
      prefetch?: boolean | null;
      replace?: boolean;
    }) => (
      <a href={typeof href === "string" ? href : formatUrl(href)} {...props}>
        {children}
      </a>
    ),
  };
});
vi.mock(
  "../../../packages/database/document-reload",
  async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return { ...actual, reloadDocument, loadDocument };
  },
);

const TA = "00000000-0000-0000-0000-000000000001";
const USER = "00000000-0000-4000-8000-0000000000a1";
const ROW = "00000000-0000-4000-8000-000000000101";
const bare = {
  userId: USER,
  tenantId: TA,
  assignmentId: ROW,
  addressPrefix: "",
  generation: 7,
};
const finance = { ...bare, addressPrefix: "/~finance" };

async function load() {
  vi.resetModules();
  return import("../../../packages/auth/tenant-navigation");
}

function loadDocumentAt(pathname: string) {
  vi.spyOn(performance, "getEntriesByType").mockImplementation((type) =>
    type === "navigation"
      ? ([
          {
            name: `http://localhost:3330/admin${pathname === "/" ? "" : pathname}`,
          },
        ] as PerformanceEntryList)
      : [],
  );
}

class Boundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    return this.state.error ? (
      <p role="alert">{this.state.error.name}</p>
    ) : (
      this.props.children
    );
  }
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
  vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
  nav.pathname = "/contributions";
  loadDocumentAt(nav.pathname);
  nav.push.mockReset();
  nav.replace.mockReset();
  nav.prefetch.mockReset();
  reloadDocument.mockReset();
  loadDocument.mockReset();
  window.sessionStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("on: TenantDocument", () => {
  it("renders a page at the bare path for a scope with the empty prefix (base: the scope mismatch error)", async () => {
    const { TenantDocument } = await load();
    const { container } = render(
      <Boundary>
        <TenantDocument scope={bare}>
          <p>page</p>
        </TenantDocument>
      </Boundary>,
    );
    expect(screen.getByText("page")).toBeTruthy();
    expect(
      container
        .querySelector("[data-tenant-scope]")
        ?.getAttribute("data-tenant-scope"),
    ).toBe("");
    expect(reloadDocument).not.toHaveBeenCalled();
  });

  it("renders a page under /~finance for the finance scope (base: the scope mismatch error)", async () => {
    nav.pathname = "/~finance/contributions";
    loadDocumentAt(nav.pathname);
    const { TenantDocument } = await load();
    render(
      <Boundary>
        <TenantDocument scope={finance}>
          <p>page</p>
        </TenantDocument>
      </Boundary>,
    );
    expect(screen.getByText("page")).toBeTruthy();
  });

  it.each([
    ["from the bare path to a sub-role", "/contributions", bare, "/~finance/y"],
    ["from a sub-role to the bare path", "/~finance/x", finance, "/y"],
    ["from a sub-role to another", "/~finance/x", finance, "/~development/y"],
  ])(
    "renders nothing and reloads after a soft navigation %s",
    async (_label, from, scope, to) => {
      nav.pathname = from;
      loadDocumentAt(from);
      const { TenantDocument } = await load();
      const view = render(
        <TenantDocument scope={scope}>
          <p>page</p>
        </TenantDocument>,
      );
      expect(screen.getByText("page")).toBeTruthy();
      nav.pathname = to;
      view.rerender(
        <TenantDocument scope={scope}>
          <p>page</p>
        </TenantDocument>,
      );
      expect(screen.queryByText("page")).toBeNull();
      expect(reloadDocument).toHaveBeenCalledTimes(1);
    },
  );
});

describe("on: a crossing between segments is a document load", () => {
  async function boundaryLoadedAt(pathname: string) {
    const mod = await load();
    nav.pathname = pathname;
    loadDocumentAt(pathname);
    const page = () => (
      <mod.TenantSegmentBoundary>
        <p>app</p>
      </mod.TenantSegmentBoundary>
    );
    const view = render(page());
    return {
      ...mod,
      moveTo(address: string) {
        nav.pathname = address;
        view.rerender(page());
      },
    };
  }

  it.each([
    ["from the bare path to a sub-role", "/contributions", "/~finance/y"],
    ["from a sub-role to another", "/~finance/x", "/~development/y"],
    ["from a sub-role to the bare path", "/~finance/x", "/y"],
    ["from sign-in into the bare path", "/login", "/donors"],
  ])("loads a document %s (base: soft)", async (_label, from, to) => {
    const boundary = await boundaryLoadedAt(from);
    boundary.moveTo(to);
    expect(reloadDocument).toHaveBeenCalledTimes(1);
  });

  it("loads a document from the bare path to Web Studio (guard)", async () => {
    const boundary = await boundaryLoadedAt("/donors");
    boundary.moveTo("/web-studio");
    expect(reloadDocument).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["within the bare path", "/contributions", "/donors"],
    ["within a sub-role", "/~finance/x", "/~finance/y"],
  ])("stays soft %s", async (_label, from, to) => {
    const boundary = await boundaryLoadedAt(from);
    boundary.moveTo(to);
    expect(screen.getByText("app")).toBeTruthy();
    expect(reloadDocument).not.toHaveBeenCalled();
  });

  it("makes TenantLink and the tenant router load a document from the bare path to a sub-role", async () => {
    const mod = await boundaryLoadedAt("/contributions");
    cleanup();
    let router: ReturnType<typeof mod.useTenantRouter> | null = null;
    function Page() {
      router = mod.useTenantRouter();
      return (
        <>
          <mod.TenantLink href="/~finance/y">Finance</mod.TenantLink>
          <mod.TenantLink href="/donors">Donors</mod.TenantLink>
        </>
      );
    }
    render(
      <mod.TenantSegmentBoundary>
        <mod.TenantDocument scope={bare}>
          <Page />
        </mod.TenantDocument>
      </mod.TenantSegmentBoundary>,
    );
    act(() => screen.getByText("Finance").click());
    expect(loadDocument).toHaveBeenLastCalledWith("/~finance/y", {
      replace: false,
    });
    loadDocument.mockReset();
    act(() => screen.getByText("Donors").click());
    expect(loadDocument).not.toHaveBeenCalled();
    act(() => router!.push("/~development/z"));
    expect(loadDocument).toHaveBeenLastCalledWith("/admin/~development/z", {
      replace: false,
    });
    act(() => router!.push("/donors"));
    expect(nav.push).toHaveBeenCalledWith("/donors");
  });
});

describe("on: the helpers build addresses with the sub-role, never the ID", () => {
  it("prefixes links under /~finance and names only the sub-role into Web Studio (base: the ID and row)", async () => {
    nav.pathname = "/~finance/contributions";
    loadDocumentAt(nav.pathname);
    const { TenantDocument, TenantLink, useTenantHref, useRoutePathname } =
      await load();
    function Page() {
      const href = useTenantHref();
      return (
        <>
          <TenantLink href="/care">Care</TenantLink>
          <TenantLink href="/web-studio">Web Studio</TenantLink>
          <TenantLink href={{ pathname: "/web-studio", query: { x: "1" } }}>
            Studio object
          </TenantLink>
          <p data-testid="home">{href("/")}</p>
          <p data-testid="route">{useRoutePathname()}</p>
        </>
      );
    }
    render(
      <TenantDocument scope={finance}>
        <Page />
      </TenantDocument>,
    );
    expect(screen.getByText("Care").getAttribute("href")).toBe(
      "/~finance/care",
    );
    expect(screen.getByText("Web Studio").getAttribute("href")).toBe(
      "/web-studio?role=finance",
    );
    expect(screen.getByText("Studio object").getAttribute("href")).toContain(
      "role=finance",
    );
    expect(
      screen.getByText("Studio object").getAttribute("href"),
    ).not.toContain(TA);
    expect(screen.getByTestId("home").textContent).toBe("/~finance");
    expect(screen.getByTestId("route").textContent).toBe("/contributions");
  });

  it("adds nothing under the empty prefix, Web Studio's link included (base: the ID and row)", async () => {
    const { TenantDocument, TenantLink } = await load();
    render(
      <TenantDocument scope={bare}>
        <TenantLink href="/care">Care</TenantLink>
        <TenantLink href="/web-studio">Web Studio</TenantLink>
      </TenantDocument>,
    );
    expect(screen.getByText("Care").getAttribute("href")).toBe("/care");
    expect(screen.getByText("Web Studio").getAttribute("href")).toBe(
      "/web-studio",
    );
  });

  it("copies links with no sub-role and no ID (R6; base: the ID and sub-role)", async () => {
    nav.pathname = "/~finance/contributions";
    loadDocumentAt(nav.pathname);
    const mod = (await load()) as Record<string, unknown>;
    const useCopiedLinkHref = mod.useCopiedLinkHref as
      (() => (href: string) => string) | undefined;
    expect(typeof useCopiedLinkHref).toBe("function");
    const TenantDocument = mod.TenantDocument as (props: {
      scope: typeof finance;
      children: ReactNode;
    }) => ReactNode;
    function Page() {
      return (
        <p data-testid="copied">{useCopiedLinkHref!()("/contributions/c-1")}</p>
      );
    }
    render(
      <TenantDocument scope={finance}>
        <Page />
      </TenantDocument>,
    );
    expect(screen.getByTestId("copied").textContent).toBe("/contributions/c-1");
  });
});
