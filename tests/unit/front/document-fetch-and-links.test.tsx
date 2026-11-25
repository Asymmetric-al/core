// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
  forward: vi.fn(),
}));

const loadMock = vi.hoisted(() => ({
  loadDocument: vi.fn(),
  reloadDocument: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
  usePathname: () => "/00000000-0000-0000-0000-000000000001/crm",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

vi.mock(
  "../../../packages/database/document-reload",
  async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
      ...actual,
      loadDocument: loadMock.loadDocument,
      reloadDocument: loadMock.reloadDocument,
    };
  },
);

vi.mock("@asym/database/document-reload", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    loadDocument: loadMock.loadDocument,
    reloadDocument: loadMock.reloadDocument,
  };
});

const maplibreMock = vi.hoisted(() => ({
  workerUrl: "",
  setWorkerUrl: vi.fn((url: string) => {
    maplibreMock.workerUrl = url;
  }),
  getWorkerUrl: vi.fn(() => maplibreMock.workerUrl),
}));

vi.mock("maplibre-gl", () => ({
  getWorkerUrl: maplibreMock.getWorkerUrl,
  setWorkerUrl: maplibreMock.setWorkerUrl,
  Map: vi.fn(),
}));

const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const USER = "00000000-0000-4000-8000-0000000000c1";
const ASSIGN = "00000000-0000-4000-8000-0000000000a1";

const ORIGINAL_FETCH = window.fetch;

beforeEach(() => {
  vi.clearAllMocks();
  maplibreMock.workerUrl = "";
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  window.fetch = ORIGINAL_FETCH;
  vi.resetModules();
});

describe("Item 6c: Web Studio fetch wrapper and document scope under /admin", () => {
  it("adds tenant/assignment on /admin/web-studio/api/*, claims on server functions, and blocks both when retired", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
    window.history.replaceState(
      null,
      "",
      "/admin/web-studio/collections/pages",
    );

    const sent: Array<{ url: string; headers: Headers }> = [];
    window.fetch = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.href
              : input.url;
        sent.push({ url, headers: new Headers(init?.headers) });
        return new Response("{}", { status: 200 });
      },
    ) as typeof fetch;

    const { DocumentScopeProvider, retireDocumentScope } =
      await import("../../../packages/database/document-scope");
    const { WEB_STUDIO_SEGMENT } =
      await import("../../../packages/auth/web-studio");
    const { installWebStudioDocumentFetch } =
      await import("../../../apps/admin/src/cms-ui/web-studio/shell/web-studio-document-fetch");

    render(
      <DocumentScopeProvider
        scope={{
          userId: USER,
          tenantId: TA,
          assignmentId: ASSIGN,
          addressPrefix: "",
        }}
        segment={WEB_STUDIO_SEGMENT}
      >
        <p>Studio</p>
      </DocumentScopeProvider>,
    );
    expect(screen.getByText("Studio")).toBeTruthy();

    installWebStudioDocumentFetch(window);

    await window.fetch("/admin/web-studio/api/pages/1", { method: "PATCH" });
    await window.fetch("/admin/web-studio/collections/pages/1", {
      method: "POST",
      headers: { "next-action": "act1" },
    });

    expect(sent).toHaveLength(2);
    expect(sent[0]!.headers.get("x-asym-tenant")).toBe(TA);
    expect(sent[0]!.headers.get("x-asym-assignment")).toBe(ASSIGN);
    expect(sent[1]!.headers.get("x-asym-web-studio-tenant")).toBe(TA);
    expect(sent[1]!.headers.get("x-asym-web-studio-assignment")).toBe(ASSIGN);

    sent.length = 0;
    retireDocumentScope();

    const retiredRest = await window.fetch("/admin/web-studio/api/pages/1", {
      method: "PATCH",
    });
    const retiredAction = await window.fetch(
      "/admin/web-studio/collections/pages/1",
      {
        method: "POST",
        headers: { "next-action": "act1" },
      },
    );
    expect(retiredRest.status).toBe(401);
    expect(retiredAction.status).toBe(401);
    expect(sent).toHaveLength(0);
  });

  it("reads navigation entry through appPathname and prefixes crossing loads in useTenantRouter", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
    window.history.replaceState(null, "", `/admin/${TA}/crm`);

    const navSpy = vi
      .spyOn(performance, "getEntriesByType")
      .mockReturnValue([
        { name: `http://localhost:3000/admin/${TA}/crm` } as PerformanceEntry,
      ]);

    try {
      const { TenantDocument, TenantSegmentBoundary, useTenantRouter } =
        await import("../../../packages/auth/tenant-navigation");

      let router: ReturnType<typeof useTenantRouter> | null = null;
      function Probe() {
        router = useTenantRouter();
        return <p>Inside tenant</p>;
      }

      render(
        <TenantSegmentBoundary>
          <TenantDocument
            scope={{
              userId: USER,
              tenantId: TA,
              assignmentId: ASSIGN,
              addressPrefix: `/${TA}`,
            }}
          >
            <Probe />
          </TenantDocument>
        </TenantSegmentBoundary>,
      );

      expect(screen.getByText("Inside tenant")).toBeTruthy();
      expect(loadMock.reloadDocument).not.toHaveBeenCalled();

      router!.push(`/${TB}/crm`);
      expect(loadMock.loadDocument).toHaveBeenCalledWith(`/admin/${TB}/crm`, {
        replace: false,
      });

      router!.replace("/login");
      expect(loadMock.loadDocument).toHaveBeenCalledWith("/admin/login", {
        replace: true,
      });
    } finally {
      navSpy.mockRestore();
    }
  });
});

describe("Item 6g & 6i: invitation addresses, copied links, and map worker URL", () => {
  it("formats staff and missionary invitation links with per-dashboard prefixes when on, and unchanged when off", async () => {
    const { formatInvitationAddress } =
      await import("../../../apps/admin/app/(app)/settings/teams/page-client");

    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
    expect(
      formatInvitationAddress(
        { role: "staff", invitePath: "/invite/s1#v1" },
        "https://one.example.test",
      ),
    ).toBe("https://one.example.test/admin/invite/s1#v1");
    expect(
      formatInvitationAddress(
        { role: "missionary", invitePath: "/invite/m1#v2" },
        "https://one.example.test",
      ),
    ).toBe("https://one.example.test/missionary/invite/m1#v2");

    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    vi.stubEnv("CORE_APP_BASE_PATH", "");
    expect(
      formatInvitationAddress(
        { role: "staff", invitePath: "/invite/s1#v1" },
        "https://one.example.test",
      ),
    ).toBe("https://one.example.test/invite/s1#v1");
    expect(
      formatInvitationAddress(
        { role: "missionary", invitePath: "/invite/m1#v2" },
        "https://one.example.test",
      ),
    ).toBe("/invite/m1#v2");
  });

  it("prefixes copied contribution and saved-view links when on and leaves them unprefixed when off", async () => {
    const { contributionCopyUrl } =
      await import("../../../apps/admin/app/(app)/contributions/columns");
    const { savedViewCopyUrl } =
      await import("../../../apps/admin/features/support-hub/components/settings/saved-views/SavedViewsList");

    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
    expect(
      contributionCopyUrl(
        `/${TA}/contributions/c-1`,
        "https://one.example.test",
      ),
    ).toBe(`https://one.example.test/admin/${TA}/contributions/c-1`);
    expect(
      savedViewCopyUrl(
        `/${TA}/support?status=open`,
        "https://one.example.test",
      ),
    ).toBe(`https://one.example.test/admin/${TA}/support?status=open`);

    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    vi.stubEnv("CORE_APP_BASE_PATH", "");
    expect(
      contributionCopyUrl(
        `/${TA}/contributions/c-1`,
        "https://one.example.test",
      ),
    ).toBe(`https://one.example.test/${TA}/contributions/c-1`);
    expect(
      savedViewCopyUrl(
        `/${TA}/support?status=open`,
        "https://one.example.test",
      ),
    ).toBe(`https://one.example.test/${TA}/support?status=open`);
  });

  it("prefixes maplibre worker URL when on and leaves it unprefixed when off", async () => {
    const { resolveMaplibreWorkerUrl } =
      await import("../../../packages/ui/components/primitives/map");

    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
    expect(resolveMaplibreWorkerUrl()).toBe(
      "/admin/maplibre/maplibre-gl-worker.mjs",
    );

    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    vi.stubEnv("CORE_APP_BASE_PATH", "");
    expect(resolveMaplibreWorkerUrl()).toBe("/maplibre/maplibre-gl-worker.mjs");
  });
});
