// @vitest-environment jsdom

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { RouterAdapterContext } from "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js";
import { WebStudioNotFoundView } from "../../../../apps/admin/src/cms-ui/web-studio/flows/WebStudioNotFoundView";
import { StudioNavRail } from "../../../../apps/admin/src/cms-ui/web-studio/shell/studio-nav-rail";
import { StudioTopBar } from "../../../../apps/admin/src/cms-ui/web-studio/shell/studio-top-bar";

import type { LinkAdapterProps } from "../../../../apps/admin/node_modules/@payloadcms/ui/dist/providers/RouterAdapter/index.js";

/**
 * Leaving Web Studio for Mission Control is a full document load (AL-2675,
 * council C12): nothing of Web Studio's document, its organization or its
 * Payload state stays behind, and Mission Control resolves its own
 * organization afresh. A link inside Web Studio stays Payload's client
 * navigation, which these tests use as the control.
 */

const fixture = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  getPreference: vi.fn(async () => null),
  setPreference: vi.fn(),
  serverFunction: vi.fn(async () => ({ items: [], page: 1, totalDocs: 0 })),
}));

vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js")
    >()),
    useAuth: () => ({
      user: { email: "editor@example.org" },
      permissions: { canAccessAdmin: true },
    }),
    useConfig: () => ({
      config: {
        admin: { routes: { account: "/account", logout: "/logout" } },
        routes: { admin: "/web-studio" },
      },
    }),
    usePreferences: () => ({
      getPreference: fixture.getPreference,
      setPreference: fixture.setPreference,
    }),
    useServerFunctions: () => ({ serverFunction: fixture.serverFunction }),
  }),
);
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  usePathname: () => "/web-studio/collections/pages",
}));
vi.mock(
  "../../../../apps/admin/src/cms-ui/web-studio/shell/studio-layout",
  () => ({
    StudioLayout: ({ children }: { children: React.ReactNode }) => (
      <main>{children}</main>
    ),
  }),
);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function NativeLink({ href, ...props }: LinkAdapterProps) {
  return <a href={href} {...props} />;
}

function withRouter(children: React.ReactNode) {
  return (
    <RouterAdapterContext
      value={{
        Link: NativeLink,
        pathname: "/web-studio/collections/pages",
        params: {},
        searchParams: new URLSearchParams(),
        router: {
          push: fixture.push,
          replace: fixture.replace,
          refresh: vi.fn(),
          back: vi.fn(),
          forward: vi.fn(),
          prefetch: vi.fn(),
        },
      }}
    >
      {children}
    </RouterAdapterContext>
  );
}

/**
 * Clicks a link and says whether the browser would load the document: its
 * default action survives every handler, and no client router was asked to
 * navigate. (The default is then cancelled, as jsdom cannot navigate.)
 */
function loadsDocument(link: HTMLElement): boolean {
  let defaultSurvived = false;
  const observe = (event: Event) => {
    defaultSurvived = !event.defaultPrevented;
    event.preventDefault();
  };
  window.addEventListener("click", observe);
  try {
    fireEvent.click(link);
  } finally {
    window.removeEventListener("click", observe);
  }
  return (
    defaultSurvived &&
    fixture.push.mock.calls.length === 0 &&
    fixture.replace.mock.calls.length === 0
  );
}

it("keeps a link inside Web Studio a client navigation (the control)", () => {
  render(
    withRouter(
      <StudioTopBar sectionLabel="Pages" currentLabel="Local CMS Home" />,
    ),
  );
  const [crumb] = screen.getAllByRole("link", { name: "Web Studio" });
  expect(loadsDocument(crumb as HTMLElement)).toBe(false);
  expect(fixture.push).toHaveBeenCalledWith("/web-studio", {
    scroll: undefined,
  });
});

it("loads Mission Control as a document from the top bar's link", () => {
  render(withRouter(<StudioTopBar sectionLabel="Pages" />));
  const link = screen.getByRole("link", { name: "Mission Control" });
  expect(link.getAttribute("href")).toBe("/");
  expect(loadsDocument(link)).toBe(true);
});

it("loads Mission Control as a document from the account menu", async () => {
  render(withRouter(<StudioTopBar sectionLabel="Pages" />));
  fireEvent.click(screen.getByRole("button", { name: /account menu/ }));
  const item = await screen.findByRole("menuitem", {
    name: "Mission Control",
  });
  expect(item.getAttribute("href")).toBe("/");
  expect(loadsDocument(item)).toBe(true);
});

it("loads Mission Control as a document from the phone navigation", async () => {
  render(withRouter(<StudioNavRail />));
  fireEvent.click(
    screen.getByRole("button", { name: "Open studio navigation" }),
  );
  const dialog = await screen.findByRole("dialog", {
    name: "Web Studio navigation",
  });
  const link = within(dialog).getByRole("link", { name: "Mission Control" });
  expect(link.getAttribute("href")).toBe("/");
  expect(loadsDocument(link)).toBe(true);
  await waitFor(() => expect(fixture.serverFunction).toHaveBeenCalled());
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
  expect(fixture.serverFunction).toHaveBeenCalledTimes(1);
});

it("loads Mission Control as a document from the not-found page", () => {
  render(withRouter(<WebStudioNotFoundView />));
  const link = screen.getByRole("link", { name: "Back to Mission Control" });
  expect(link.getAttribute("href")).toBe("/");
  expect(loadsDocument(link)).toBe(true);
});

it("leaves no client link to Mission Control anywhere in Web Studio", () => {
  const roots = ["apps/admin/src/cms-ui", "apps/admin/app/(payload)"];
  const offenders: string[] = [];
  const visit = (file: string) => {
    if (statSync(file).isDirectory()) {
      for (const entry of readdirSync(file)) visit(path.join(file, entry));
      return;
    }
    if (!/\.(tsx|ts)$/.test(file)) return;
    // A client `Link` (Payload's or Next's) whose address is Mission Control.
    if (/<Link\b[^>]*?\bhref="\/"/s.test(readFileSync(file, "utf8"))) {
      offenders.push(file);
    }
  };
  roots.forEach(visit);
  expect(offenders).toEqual([]);
});
