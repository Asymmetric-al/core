// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
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
    ...props
  }: {
    href: string | { pathname?: string; query?: Record<string, string> };
    children: React.ReactNode;
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
});

afterEach(() => {
  cleanup();
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

    render(
      <TenantDocument scope={scopeA}>
        <Probe />
      </TenantDocument>,
    );

    expect(screen.getByText(scopeA.assignmentId)).toBeTruthy();
    expect(getDocumentScope()).toEqual(scopeA);
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
