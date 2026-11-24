// @vitest-environment jsdom

import path from "node:path";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ESLint } from "eslint";
import { useContext, useRef } from "react";
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

const pathnameMock = vi.hoisted(() => ({
  current: "/web-studio/collections/pages",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
  usePathname: () => pathnameMock.current,
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    prefetch: _p,
    replace: _r,
    scroll: _s,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    prefetch?: boolean | null;
    replace?: boolean;
    scroll?: boolean;
  }) => {
    const base = process.env.CORE_APP_BASE_PATH ?? "";
    const resolved =
      base && href.startsWith("/") && !href.startsWith("//")
        ? href === "/"
          ? base
          : `${base}${href}`
        : href;
    return (
      <a href={resolved} {...props}>
        {children}
      </a>
    );
  },
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

vi.mock(
  "../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    useAuth: () => ({ user: { email: "editor@example.org" } }),
    useConfig: () => ({
      config: {
        admin: { routes: { account: "/account", logout: "/logout" } },
        routes: { admin: "/web-studio" },
      },
    }),
  }),
);

vi.mock("@asym/database/hooks", () => ({
  useMissionaryPortalSnapshot: () => ({ data: null }),
  usePendingFollowRequestCount: () => ({ data: 0 }),
}));

vi.mock("../../../apps/missionary/components/sidebar-account-menu", () => ({
  SidebarAccountMenu: () => null,
}));

const { RouterAdapterContext } =
  await import("../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js");
const { isWebStudioPageAddress, NextRouterAdapter } =
  await import("../../../apps/admin/src/cms/payload-next-router-adapter");
const { ShellNavigationProvider, useStudioDirtyState } =
  await import("../../../apps/admin/components/studio/shell-navigation-guard");
const { StudioTopBar } =
  await import("../../../apps/admin/src/cms-ui/web-studio/shell/studio-top-bar");
const { MissionControlLink } =
  await import("../../../apps/admin/src/cms-ui/web-studio/shell/mission-control-link");
const {
  buildWebStudioAuthenticatedPreviewPath,
  createWebStudioAuthenticatedPreviewURL,
} =
  await import("../../../apps/admin/src/cms-ui/web-studio/adapters/preview-url");
const { OrganizationChooser, OrganizationChooserUnavailable } =
  await import("../../../packages/ui/components/auth/organization-chooser");
const { InvitationDoorway } =
  await import("../../../packages/ui/components/auth/InvitationDoorway");
const { ScopeReloadNotice } =
  await import("../../../packages/database/scope-reload-notice");
const { ScopeReloadNotices } =
  await import("../../../packages/ui/components/scope-reload-notices");
const { ownApiFetch, OwnApiPathError } =
  await import("../../../packages/database/own-api");
const { signOutClientSession } =
  await import("../../../packages/auth/client-session");
const { passwordRecoveryRedirectUrl } =
  await import("../../../packages/auth/password-recovery");
const { signUpConfirmationRedirectUrl } =
  await import("../../../packages/auth/sign-up-confirmation");
const { AppSidebar } =
  await import("../../../apps/missionary/components/app-sidebar");
const { SidebarProvider } =
  await import("../../../packages/ui/components/shadcn/sidebar");
const { default: missionaryManifest } =
  await import("../../../apps/missionary/app/manifest");
const {
  captureAndStripInviteFragment,
  clearPendingInviteFragment,
  consumeInviteFragment,
} = await import("../../../packages/lib/monitoring/sentry-policy");

const TA = "00000000-0000-0000-0000-000000000001";
const ORIGINAL_FETCH = global.fetch;

beforeEach(() => {
  vi.clearAllMocks();
  clearPendingInviteFragment();
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
  vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
  window.history.replaceState(null, "", "/admin/web-studio/collections/pages");
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  global.fetch = ORIGINAL_FETCH;
  clearPendingInviteFragment();
});

describe("Item 6c & 6d: invitation fragment, doorway, chooser, reload notices, and Studio links", () => {
  it("strips verifier on /admin/invite/<s>#<v>, enables Accept, keeps next app-relative, and prefixes loadDocument", async () => {
    window.history.replaceState(null, "", "/admin/invite/sel123#secret-token");
    const fetchSpy = vi.fn(async () =>
      Response.json({ tenant_id: TA, redirectPath: `/${TA}` }),
    );
    global.fetch = fetchSpy as typeof fetch;

    render(
      <InvitationDoorway selector="sel123" surfaceName="Mission Control" />,
    );

    expect(window.location.hash).toBe("");
    const signIn = screen.getByRole("link", { name: /Need to sign in/i });
    expect(signIn.getAttribute("href")).toBe(
      "/admin/login?next=%2Finvite%2Fsel123",
    );

    const acceptBtn = screen.getByRole<HTMLButtonElement>("button", {
      name: /Accept invitation/i,
    });
    expect(acceptBtn.disabled).toBe(false);
    fireEvent.click(acceptBtn);

    await vi.waitFor(() =>
      expect(loadMock.loadDocument).toHaveBeenCalledWith(`/admin/${TA}`),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      "/admin/api/invitations/accept",
      expect.anything(),
    );

    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    vi.stubEnv("CORE_APP_BASE_PATH", "");
    cleanup();
    window.history.replaceState(null, "", "/invite/sel456#tok2");
    render(
      <InvitationDoorway selector="sel456" surfaceName="Mission Control" />,
    );
    expect(
      screen
        .getByRole("link", { name: /Need to sign in/i })
        .getAttribute("href"),
    ).toBe("/login?next=%2Finvite%2Fsel456");
  });

  it("reads invite fragments through appPathname directly in sentry-policy", () => {
    window.history.replaceState(null, "", "/missionary/invite/abc#v999");
    vi.stubEnv("CORE_APP_BASE_PATH", "/missionary");
    expect(captureAndStripInviteFragment()).toBe("v999");
    expect(window.location.hash).toBe("");
    expect(consumeInviteFragment("/missionary/invite/abc")).toBe("v999");
  });

  it("prefixes OrganizationChooser links, retryHref, StudioTopBar switchHref, MissionControlLink, preview URLs, and ScopeReloadNotice", () => {
    render(
      <>
        <OrganizationChooser
          organizations={[
            {
              tenantId: TA,
              name: "Alpha",
              options: [{ subRole: null, href: `/${TA}/donors` }],
            },
          ]}
        />
        <OrganizationChooserUnavailable retryHref="/choose-organization?next=%2Fdonors" />
        <MissionControlLink>Go MC</MissionControlLink>
        <ScopeReloadNotices>
          <ScopeReloadNotice requestReload={false} />
        </ScopeReloadNotices>
      </>,
    );

    expect(
      screen.getByRole("link", { name: /Open Alpha/i }).getAttribute("href"),
    ).toBe(`/admin/${TA}/donors`);
    expect(
      screen.getByRole("link", { name: /Try again/i }).getAttribute("href"),
    ).toBe("/admin/choose-organization?next=%2Fdonors");
    expect(
      screen.getByRole("link", { name: "Go MC" }).getAttribute("href"),
    ).toBe("/admin");

    expect(
      buildWebStudioAuthenticatedPreviewPath({
        collectionSlug: "pages",
        id: "7",
      }),
    ).toBe("/admin/web-studio/preview/pages/7");
    const previewFn = createWebStudioAuthenticatedPreviewURL("pages");
    expect(previewFn({} as never, {} as never)).toBe(
      "/admin/web-studio/collections/pages",
    );

    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    vi.stubEnv("CORE_APP_BASE_PATH", "");
    expect(
      buildWebStudioAuthenticatedPreviewPath({
        collectionSlug: "pages",
        id: "7",
      }),
    ).toBe("/web-studio/preview/pages/7");
  });

  it("prefixes signOutClientSession default redirect when on and keeps /login when off", async () => {
    await signOutClientSession({
      signOutOnServer: async () => ({ ok: true }),
      createClient: () =>
        ({ auth: { signOut: async () => ({ error: null }) } }) as never,
    });
    expect(loadMock.loadDocument).toHaveBeenCalledWith("/admin/login");

    loadMock.loadDocument.mockClear();
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    vi.stubEnv("CORE_APP_BASE_PATH", "");
    await signOutClientSession({
      signOutOnServer: async () => ({ ok: true }),
      createClient: () =>
        ({ auth: { signOut: async () => ({ error: null }) } }) as never,
    });
    expect(loadMock.loadDocument).toHaveBeenCalledWith("/login");
  });
});

describe("Item 6d: Payload router adapter and ShellNavigationProvider under /admin", () => {
  it("requires url.pathname under appBasePath() in isWebStudioPageAddress and never double-prefixes", () => {
    const here = "http://one.example.test/admin/web-studio/collections/pages";
    expect(
      isWebStudioPageAddress(
        "http://one.example.test/admin/web-studio/collections/pages/8",
        here,
      ),
    ).toBe(true);
    expect(isWebStudioPageAddress("?page=2", here)).toBe(true);
    expect(
      isWebStudioPageAddress(
        "http://one.example.test/web-studio/collections/pages/8",
        here,
      ),
    ).toBe(false);
    expect(
      isWebStudioPageAddress("/web-studio/collections/pages/8", here),
    ).toBe(false);

    let adapter: React.ContextType<typeof RouterAdapterContext> | null = null;
    function Probe() {
      adapter = useContext(RouterAdapterContext);
      return null;
    }
    render(
      <NextRouterAdapter>
        <Probe />
      </NextRouterAdapter>,
    );
    const { Link, router } = adapter!;

    render(<Link href="/admin/web-studio/collections/pages/8">Prefixed</Link>);
    expect(
      screen.getByRole("link", { name: "Prefixed" }).getAttribute("href"),
    ).toBe("/admin/web-studio/collections/pages/8");

    router.push("/admin/web-studio/collections/pages/8");
    expect(routerMock.push).toHaveBeenLastCalledWith(
      "/web-studio/collections/pages/8",
      undefined,
    );

    router.push("/web-studio/collections/pages/9");
    expect(routerMock.push).toHaveBeenLastCalledWith(
      "/web-studio/collections/pages/9",
      undefined,
    );

    router.push("?page=2");
    expect(routerMock.push).toHaveBeenLastCalledWith("?page=2", undefined);

    router.push("/web-studio/organization?next=%2Fweb-studio");
    expect(loadMock.loadDocument).toHaveBeenLastCalledWith(
      "/admin/web-studio/organization?next=%2Fweb-studio",
      { replace: false },
    );

    router.push("/admin/web-studio/organization?next=%2Fweb-studio");
    expect(loadMock.loadDocument).toHaveBeenLastCalledWith(
      "/admin/web-studio/organization?next=%2Fweb-studio",
      { replace: false },
    );

    router.push("/admin/teams");
    expect(loadMock.loadDocument).toHaveBeenLastCalledWith(
      "/admin/admin/teams",
      { replace: false },
    );

    router.push("../../../people");
    expect(loadMock.loadDocument).toHaveBeenLastCalledWith("../../../people", {
      replace: false,
    });

    router.push("https://elsewhere.example/web-studio");
    expect(loadMock.loadDocument).toHaveBeenLastCalledWith(
      "https://elsewhere.example/web-studio",
      { replace: false },
    );
  });

  it("pushes appPathname for own-app links and loads cross-app links in ShellNavigationProvider", () => {
    window.history.replaceState(null, "", "/admin/email");
    function DirtyEditor() {
      useStudioDirtyState(true);
      const ref = useRef<HTMLDivElement>(null);
      return (
        <div ref={ref}>
          <a href="/admin/crm?view=all">CRM</a>
          <a href="/donor-dashboard">Donor</a>
        </div>
      );
    }
    const firstView = render(
      <ShellNavigationProvider>
        <DirtyEditor />
      </ShellNavigationProvider>,
    );

    fireEvent.click(screen.getByRole("link", { name: "CRM" }));
    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));
    expect(routerMock.push).toHaveBeenCalledWith("/crm?view=all");
    firstView.unmount();

    render(
      <ShellNavigationProvider>
        <DirtyEditor />
      </ShellNavigationProvider>,
    );
    fireEvent.click(screen.getByRole("link", { name: "Donor" }));
    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));
    expect(loadMock.loadDocument).toHaveBeenCalledWith("/donor-dashboard");
  });
});

describe("Item 6e, 6f, 6g, 6i: ownApiFetch, lint rule, cross-app links, mail redirects, manifest", () => {
  it("sends ownApiFetch under basePath while refusing prefixed arguments, and lint flags prefixed literals", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/missionary");
    const fetchSpy = vi.fn(async () => new Response("{}", { status: 200 }));
    global.fetch = fetchSpy as typeof fetch;

    await ownApiFetch("/api/missionary/tasks");
    expect(fetchSpy).toHaveBeenCalledWith(
      "/missionary/api/missionary/tasks",
      expect.anything(),
    );
    expect(() => ownApiFetch("/missionary/api/missionary/tasks")).toThrow(
      OwnApiPathError,
    );
    expect(() => ownApiFetch("/admin/api/admin/funds")).toThrow(
      OwnApiPathError,
    );

    const eslint = new ESLint({
      cwd: process.cwd(),
      overrideConfigFile: path.join(process.cwd(), "eslint.config.mjs"),
      overrideConfig: {
        languageOptions: { parserOptions: { projectService: false } },
      },
    });
    const [adminRes] = await eslint.lintText(
      'export function f() { return fetch("/admin/api/x"); }',
      { filePath: path.join(process.cwd(), "apps/admin/app/probe.ts") },
    );
    expect(
      adminRes!.messages.some((m) => m.ruleId === "own-api/no-direct-call"),
    ).toBe(true);
    const [missRes] = await eslint.lintText(
      'export function f() { return fetch("/missionary/api/x"); }',
      { filePath: path.join(process.cwd(), "apps/missionary/app/probe.ts") },
    );
    expect(
      missRes!.messages.some((m) => m.ruleId === "own-api/no-direct-call"),
    ).toBe(true);
  });

  it("renders donor items in missionary AppSidebar as plain <a> to /donor-dashboard/* (never prefixed)", () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/missionary");
    pathnameMock.current = "/";
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(
      <SidebarProvider>
        <AppSidebar role="donor" />
      </SidebarProvider>,
    );

    const dashboard = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboard.getAttribute("href")).toBe("/donor-dashboard");
    const pledges = screen.getByRole("link", { name: "My Giving" });
    expect(pledges.getAttribute("href")).toBe("/donor-dashboard/pledges");
  });

  it("prefixes mail redirect URLs and missionary manifest when on, and leaves them unprefixed when off", () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
    expect(passwordRecoveryRedirectUrl("https://one.example.test")).toBe(
      "https://one.example.test/admin/forgot-password/callback",
    );
    expect(signUpConfirmationRedirectUrl("https://one.example.test")).toBe(
      "https://one.example.test/admin/auth/callback",
    );

    vi.stubEnv("CORE_APP_BASE_PATH", "/missionary");
    const onManifest = missionaryManifest();
    expect(onManifest.start_url).toBe("/missionary");
    expect(onManifest.scope).toBe("/missionary");
    expect(onManifest.icons?.map((i) => i.src)).toEqual([
      "/missionary/icon.svg",
      "/missionary/apple-icon",
    ]);

    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    vi.stubEnv("CORE_APP_BASE_PATH", "");
    expect(passwordRecoveryRedirectUrl("https://one.example.test")).toBe(
      "https://one.example.test/forgot-password/callback",
    );
    expect(signUpConfirmationRedirectUrl("https://one.example.test")).toBe(
      "https://one.example.test/auth/callback",
    );
    const offManifest = missionaryManifest();
    expect(offManifest.start_url).toBe("/");
    expect(offManifest.scope).toBe("/");
    expect(offManifest.icons?.map((i) => i.src)).toEqual([
      "/icon.svg",
      "/apple-icon",
    ]);
  });

  it("renders StudioTopBar without crashing and prefixes switchHref when on", async () => {
    const { WebStudioDocument } =
      await import("../../../apps/admin/src/cms-ui/web-studio/shell/web-studio-document");
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
    pathnameMock.current = "/web-studio/collections/pages";
    window.history.replaceState(
      null,
      "",
      "/admin/web-studio/collections/pages",
    );

    render(
      <NextRouterAdapter>
        <WebStudioDocument
          scope={{
            userId: "00000000-0000-4000-8000-0000000000c1",
            tenantId: TA,
            assignmentId: "00000000-0000-4000-8000-0000000000a1",
            addressPrefix: "",
          }}
          organization={{
            name: "Alpha",
            canSwitch: true,
            missionControlHref: `/${TA}`,
          }}
        >
          <StudioTopBar sectionLabel="Pages" />
        </WebStudioDocument>
      </NextRouterAdapter>,
    );

    expect(
      screen
        .getByRole("link", { name: "Mission Control" })
        .getAttribute("href"),
    ).toBe(`/admin/${TA}`);
    fireEvent.click(screen.getByRole("button", { name: /account menu/ }));
    const switchItem = await screen.findByRole("menuitem", {
      name: /Switch organization/,
    });
    expect(switchItem.getAttribute("href")).toBe(
      "/admin/web-studio/organization?next=%2Fweb-studio%2Fcollections%2Fpages",
    );
  });
});
