// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { Component, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The tenant document and the one way to build an address (plan 5.2;
 * AL-2675). The guard renders nothing and reloads when the address's tenant
 * segment or sub-role suffix differs from the document's scope; the helpers
 * carry the document's prefix on every link and router call.
 */

const nav = vi.hoisted(() => ({
  pathname: "/",
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
}));
const reloadDocument = vi.hoisted(() => vi.fn());
const loadDocument = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useRouter: () => ({
    push: nav.push,
    replace: nav.replace,
    prefetch: nav.prefetch,
    back: nav.back,
    forward: vi.fn(),
    refresh: vi.fn(),
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
    href: string | { pathname?: string; query?: Record<string, string> };
    children: React.ReactNode;
    prefetch?: boolean | null;
    replace?: boolean;
  }) => (
    <a
      href={
        typeof href === "string"
          ? href
          : `${href.pathname ?? ""}${href.query ? `?${new URLSearchParams(href.query)}` : ""}`
      }
      {...props}
    >
      {children}
    </a>
  ),
}));
vi.mock("../../../packages/database/document-reload", () => ({
  reloadDocument,
  loadDocument,
}));

const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const scopeA = {
  userId: "00000000-0000-4000-8000-0000000000a1",
  tenantId: TA,
  assignmentId: "00000000-0000-4000-8000-000000000101",
  addressPrefix: `/${TA}~finance`,
};

async function load() {
  vi.resetModules();
  return import("../../../packages/auth/tenant-navigation");
}

/** The address the browser loaded the document at (navigation timing). */
function loadDocumentAt(pathname: string) {
  vi.spyOn(performance, "getEntriesByType").mockImplementation((type) =>
    type === "navigation"
      ? ([{ name: `http://localhost:3330${pathname}` }] as PerformanceEntryList)
      : [],
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  nav.pathname = `/${TA}~finance/contributions`;
  loadDocumentAt(nav.pathname);
  nav.push.mockReset();
  nav.replace.mockReset();
  nav.prefetch.mockReset();
  reloadDocument.mockReset();
  loadDocument.mockReset();
  // One tab's memory of the reload it already tried (A12).
  window.sessionStorage.clear();
});

afterEach(() => {
  cleanup();
});

/** Renders `children`, or the message of the error they throw. */
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

// Council round 1, A12: where the browser cannot say which address the
// document was loaded at, a mismatch reloads; a server fault that the reload
// does not cure used to reload for ever. It reloads once, then shows the
// error.
describe("TenantDocument: one reload, then the error", () => {
  function noNavigationEntry() {
    vi.spyOn(performance, "getEntriesByType").mockImplementation(() => []);
  }

  it("reloads once, and shows the error when the new document has the same mismatch", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    noNavigationEntry();
    nav.pathname = `/${TB}/contributions`;

    const first = await load();
    render(
      <Boundary>
        <first.TenantDocument scope={scopeA}>
          <p>page</p>
        </first.TenantDocument>
      </Boundary>,
    );
    expect(reloadDocument).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("page")).toBeNull();
    cleanup();

    // The reloaded document: fresh modules, the same tab, the same fault.
    const second = await load();
    render(
      <Boundary>
        <second.TenantDocument scope={scopeA}>
          <p>page</p>
        </second.TenantDocument>
      </Boundary>,
    );
    expect(reloadDocument).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("alert").textContent).toBe(
      "TenantScopeMismatchError",
    );
    errors.mockRestore();
  });

  it("forgets the reload once a document renders, so a later crossing reloads again", async () => {
    noNavigationEntry();
    nav.pathname = `/${TB}/contributions`;
    const first = await load();
    render(
      <first.TenantDocument scope={scopeA}>
        <p>page</p>
      </first.TenantDocument>,
    );
    expect(reloadDocument).toHaveBeenCalledTimes(1);
    cleanup();

    // The reload cured it: the new document renders its page.
    nav.pathname = `/${TA}~finance/contributions`;
    const second = await load();
    render(
      <second.TenantDocument scope={scopeA}>
        <p>page</p>
      </second.TenantDocument>,
    );
    expect(screen.getByText("page")).toBeTruthy();
    cleanup();

    // Later the same address needs a reload again: it gets one.
    nav.pathname = `/${TB}/contributions`;
    const third = await load();
    render(
      <third.TenantDocument scope={scopeA}>
        <p>page</p>
      </third.TenantDocument>,
    );
    expect(reloadDocument).toHaveBeenCalledTimes(2);
  });
});

describe("TenantDocument: the guard", () => {
  it("renders the page while the address matches the document's scope", async () => {
    const { TenantDocument } = await load();

    render(
      <TenantDocument scope={scopeA}>
        <p>page</p>
      </TenantDocument>,
    );

    expect(screen.getByText("page")).toBeTruthy();
    expect(reloadDocument).not.toHaveBeenCalled();
  });

  it.each([
    ["another tenant", `/${TB}/contributions`],
    ["another sub-role", `/${TA}~member_care/contributions`],
    ["no sub-role", `/${TA}/contributions`],
    ["no tenant at all", "/contributions"],
  ])(
    "renders nothing and reloads after a soft navigation to %s",
    async (_label, address) => {
      const { TenantDocument } = await load();
      const view = render(
        <TenantDocument scope={scopeA}>
          <p>page</p>
        </TenantDocument>,
      );

      nav.pathname = address;
      view.rerender(
        <TenantDocument scope={scopeA}>
          <p>page</p>
        </TenantDocument>,
      );

      expect(screen.queryByText("page")).toBeNull();
      expect(reloadDocument).toHaveBeenCalledTimes(1);
    },
  );

  it("reloads when the guard mounts afresh after a soft navigation, with the old scope and a new address", async () => {
    const { TenantDocument } = await load();
    const first = render(
      <TenantDocument scope={scopeA}>
        <p>page</p>
      </TenantDocument>,
    );
    first.unmount();

    // A parent remounted the guard during a soft navigation to tenant B; the
    // layout above it was not rendered again, so its scope is still A's.
    nav.pathname = `/${TB}/contributions`;
    render(
      <TenantDocument scope={scopeA}>
        <p>page</p>
      </TenantDocument>,
    );

    expect(screen.queryByText("page")).toBeNull();
    expect(reloadDocument).toHaveBeenCalledTimes(1);
  });

  it("reloads when a soft navigation lands before the page has hydrated", async () => {
    const { TenantDocument } = await load();
    // The document was loaded at tenant A and has fixed no scope yet: the
    // streamed boundary had not hydrated when the router moved to tenant B.
    nav.pathname = `/${TB}/contributions`;

    render(
      <TenantDocument scope={scopeA}>
        <p>page</p>
      </TenantDocument>,
    );

    expect(screen.queryByText("page")).toBeNull();
    expect(reloadDocument).toHaveBeenCalledTimes(1);
  });

  it("renders nothing instead of throwing when the address leaves the segment of a document that fixed its scope, loaded outside it (council round 1, A6)", async () => {
    const { TenantDocument } = await load();
    const view = render(
      <TenantDocument scope={scopeA}>
        <p>page</p>
      </TenantDocument>,
    );
    expect(screen.getByText("page")).toBeTruthy();
    // The navigation entry names an address outside the segment, as the
    // reviewer read for a document signed in through the form. (Since the
    // ruling such a document loads anew before it fixes a scope; the guard
    // must not throw either way.)
    loadDocumentAt("/login");

    // A hidden (Activity) copy of the signed-in layout renders again with
    // the address of an outside page, such as Web Studio.
    nav.pathname = "/web-studio";
    expect(() =>
      view.rerender(
        <TenantDocument scope={scopeA}>
          <p>page</p>
        </TenantDocument>,
      ),
    ).not.toThrow();
    expect(screen.queryByText("page")).toBeNull();
    expect(reloadDocument).toHaveBeenCalledTimes(1);
  });

  it("fails loudly when a document is served under one address with another scope", async () => {
    const { TenantDocument } = await load();
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    // Record D-19: the page rendered at a tenant address without its scope,
    // or with another tenant's. Reloading would only repeat it.
    nav.pathname = `/${TB}/contributions`;
    loadDocumentAt(nav.pathname);
    expect(() =>
      render(
        <TenantDocument scope={scopeA}>
          <p>page</p>
        </TenantDocument>,
      ),
    ).toThrow(/does not match the document's scope/);
    expect(reloadDocument).not.toHaveBeenCalled();
    errors.mockRestore();
  });

  it("publishes the scope to the browser data layer", async () => {
    const { TenantDocument } = await load();
    const { getDocumentScope, useDocumentScope } =
      await import("../../../packages/database/document-scope");
    function Probe() {
      return <p>{useDocumentScope()?.assignmentId}</p>;
    }

    // The page is served at its tenant address.
    window.history.replaceState(null, "", `${scopeA.addressPrefix}/care`);
    render(
      <TenantDocument scope={scopeA}>
        <Probe />
      </TenantDocument>,
    );

    expect(screen.getByText(scopeA.assignmentId)).toBeTruthy();
    expect(getDocumentScope()).toEqual(scopeA);
    // Outside the segment the data layer has no scope (A8).
    window.history.replaceState(null, "", "/web-studio");
    expect(getDocumentScope()).toBeNull();
    window.history.replaceState(null, "", "/");
  });
});

describe("one way to build an address", () => {
  it("prefixes links, router calls and hrefs with the document's prefix", async () => {
    const { TenantDocument, TenantLink, useTenantHref, useTenantRouter } =
      await load();
    let router: ReturnType<typeof useTenantRouter> | null = null;
    function Page() {
      router = useTenantRouter();
      const href = useTenantHref();
      return (
        <>
          <TenantLink href="/care/directory/p-01">Person</TenantLink>
          <TenantLink
            href={{ pathname: "/contributions", query: { gift: "1" } }}
          >
            Gift
          </TenantLink>
          <TenantLink href="/web-studio">Web Studio</TenantLink>
          <TenantLink href="/api/admin/export">Export</TenantLink>
          <p>{href("/")}</p>
        </>
      );
    }

    render(
      <TenantDocument scope={scopeA}>
        <Page />
      </TenantDocument>,
    );

    const prefix = scopeA.addressPrefix;
    expect(screen.getByText("Person").getAttribute("href")).toBe(
      `${prefix}/care/directory/p-01`,
    );
    expect(screen.getByText("Gift").getAttribute("href")).toBe(
      `${prefix}/contributions?gift=1`,
    );
    expect(screen.getByText("Web Studio").getAttribute("href")).toBe(
      "/web-studio",
    );
    expect(screen.getByText("Export").getAttribute("href")).toBe(
      "/api/admin/export",
    );
    expect(screen.getByText(prefix)).toBeTruthy();

    act(() => {
      router!.push("/care?tab=open");
      router!.replace("/contributions", { scroll: false });
      router!.prefetch("/tasks");
      router!.back();
    });
    expect(nav.push).toHaveBeenCalledWith(`${prefix}/care?tab=open`);
    expect(nav.replace).toHaveBeenCalledWith(`${prefix}/contributions`, {
      scroll: false,
    });
    expect(nav.prefetch).toHaveBeenCalledWith(`${prefix}/tasks`);
    expect(nav.back).toHaveBeenCalled();
  });

  it("leaves addresses alone outside a tenant document", async () => {
    const { TenantLink, useTenantRouter } = await load();
    nav.pathname = "/login";
    let router: ReturnType<typeof useTenantRouter> | null = null;
    function Page() {
      router = useTenantRouter();
      return <TenantLink href="/care">Care</TenantLink>;
    }

    render(<Page />);

    expect(screen.getByText("Care").getAttribute("href")).toBe("/care");
    act(() => router!.push("/care"));
    expect(nav.push).toHaveBeenCalledWith("/care");
  });

  it("reads the route pathname, without the prefix, for active-navigation tests", async () => {
    const { useRoutePathname } = await load();
    function Page() {
      return <p>{useRoutePathname()}</p>;
    }

    render(<Page />);
    expect(screen.getByText("/contributions")).toBeTruthy();

    cleanup();
    nav.pathname = `/${TA}`;
    render(<Page />);
    expect(screen.getByText("/")).toBeTruthy();
  });
});

/**
 * Council round 1 ruling (A7, A8): each document has one scope, fixed at load,
 * so every navigation that crosses the boundary of the tenant segment is a
 * document load: into it from outside, out of it, and from one tenant or
 * sub-role to another. Inside one tenant's segment navigation stays soft.
 */
describe("TenantSegmentBoundary: a crossing is a document load", () => {
  it.each([
    ["an account screen", "/no-access"],
    ["the chooser", "/choose-organization"],
    ["sign-in", "/login"],
    ["Web Studio", "/web-studio"],
  ])(
    "shows no signed-in page in a document loaded at %s, and loads it as a document",
    async (_label, loadedAt) => {
      const { TenantDocument } = await load();
      loadDocumentAt(loadedAt);
      nav.pathname = `${scopeA.addressPrefix}/contributions`;
      render(
        <TenantDocument scope={scopeA}>
          <p>page</p>
        </TenantDocument>,
      );
      expect(screen.queryByText("page")).toBeNull();
      expect(reloadDocument).toHaveBeenCalledTimes(1);
      const { getDocumentScope } =
        await import("../../../packages/database/document-scope");
      expect(getDocumentScope()).toBeNull();
    },
  );

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
    expect(screen.getByText("app")).toBeTruthy();
    return {
      ...mod,
      moveTo(address: string) {
        nav.pathname = address;
        view.rerender(page());
      },
    };
  }

  it.each([
    ["into the segment from an account screen", "/no-access", `/${TA}`],
    [
      "into the segment from the chooser",
      "/choose-organization",
      `/${TA}/tasks`,
    ],
    ["into the segment from sign-in", "/login", `/${TA}~finance`],
    ["out of the segment to Web Studio", `/${TA}/contributions`, "/web-studio"],
    ["out of the segment to an account screen", `/${TA}/tasks`, "/no-access"],
    ["to another tenant", `/${TA}/tasks`, `/${TB}/tasks`],
    ["to another sub-role", `/${TA}~finance/care`, `/${TA}~member_care/care`],
  ])(
    "loads the new address as a document when a soft navigation goes %s",
    async (_label, from, to) => {
      const boundary = await boundaryLoadedAt(from);
      boundary.moveTo(to);
      expect(reloadDocument).toHaveBeenCalledTimes(1);
    },
  );

  it.each([
    ["within one tenant's segment", `/${TA}/tasks`, `/${TA}/tasks/t-1`],
    ["between two outside pages", "/login", "/register"],
  ])("stays soft %s", async (_label, from, to) => {
    const boundary = await boundaryLoadedAt(from);
    boundary.moveTo(to);
    expect(screen.getByText("app")).toBeTruthy();
    expect(reloadDocument).not.toHaveBeenCalled();
  });

  it("makes TenantLink and the tenant router load a document for a crossing, and stay soft inside the segment", async () => {
    const mod = await boundaryLoadedAt(`${scopeA.addressPrefix}/contributions`);
    cleanup();
    let router: ReturnType<typeof mod.useTenantRouter> | null = null;
    function Page() {
      router = mod.useTenantRouter();
      return (
        <>
          <mod.TenantLink href="/web-studio">Web Studio</mod.TenantLink>
          <mod.TenantLink href={`/${TB}/tasks`}>Other tenant</mod.TenantLink>
          <mod.TenantLink href="/care/directory">Directory</mod.TenantLink>
        </>
      );
    }
    render(
      <mod.TenantSegmentBoundary>
        <mod.TenantDocument scope={scopeA}>
          <Page />
        </mod.TenantDocument>
      </mod.TenantSegmentBoundary>,
    );

    act(() => screen.getByText("Web Studio").click());
    expect(loadDocument).toHaveBeenLastCalledWith("/web-studio", {
      replace: false,
    });
    act(() => screen.getByText("Other tenant").click());
    expect(loadDocument).toHaveBeenLastCalledWith(`/${TB}/tasks`, {
      replace: false,
    });
    loadDocument.mockReset();
    act(() => screen.getByText("Directory").click());
    expect(loadDocument).not.toHaveBeenCalled();

    act(() => router!.push("/web-studio"));
    expect(loadDocument).toHaveBeenLastCalledWith("/web-studio", {
      replace: false,
    });
    act(() => router!.replace(`/${TB}`));
    expect(loadDocument).toHaveBeenLastCalledWith(`/${TB}`, { replace: true });
    act(() => router!.push("/care"));
    expect(nav.push).toHaveBeenCalledWith(`${scopeA.addressPrefix}/care`);
    expect(nav.push).toHaveBeenCalledTimes(1);
  });

  it("makes a link from an outside page into the segment load a document", async () => {
    const mod = await boundaryLoadedAt("/no-access");
    cleanup();
    let router: ReturnType<typeof mod.useTenantRouter> | null = null;
    function Page() {
      router = mod.useTenantRouter();
      return (
        <>
          <mod.TenantLink href="/">Go to home</mod.TenantLink>
          <mod.TenantLink href="/login">Sign in</mod.TenantLink>
        </>
      );
    }
    render(
      <mod.TenantSegmentBoundary>
        <Page />
      </mod.TenantSegmentBoundary>,
    );

    act(() => screen.getByText("Go to home").click());
    expect(loadDocument).toHaveBeenLastCalledWith("/", { replace: false });
    loadDocument.mockReset();
    act(() => screen.getByText("Sign in").click());
    expect(loadDocument).not.toHaveBeenCalled();
    act(() => router!.replace("/tasks"));
    expect(loadDocument).toHaveBeenLastCalledWith("/tasks", { replace: true });
  });

  it("keeps every navigation soft in an app with no tenant segment, such as the donor portal", async () => {
    const mod = await load();
    nav.pathname = "/donor-dashboard";
    let router: ReturnType<typeof mod.useTenantRouter> | null = null;
    function Page() {
      router = mod.useTenantRouter();
      return (
        <mod.TenantLink href="/donor-dashboard/history">History</mod.TenantLink>
      );
    }
    render(<Page />);
    act(() => screen.getByText("History").click());
    act(() => router!.push("/donor-dashboard/pledges"));
    expect(loadDocument).not.toHaveBeenCalled();
    expect(nav.push).toHaveBeenCalledWith("/donor-dashboard/pledges");
  });
});
