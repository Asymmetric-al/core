/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  within,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderToString } from "react-dom/server";

import { MCShell } from "../../../../apps/admin/app/mc-shell";

import { useRef, type PropsWithChildren } from "react";
import { useStudioFullscreen } from "../../../../apps/admin/components/studio/shell-navigation-guard";

const shellState = vi.hoisted(() => ({
  role: "admin" as string,
  pathname: "/feed",
  tenantName: "Give Hope",
  user: null as null | { name: string; email: string; avatarUrl?: string },
}));
vi.mock("@asym/lib/mission-control/context", () => ({
  MCProvider: ({ children }: PropsWithChildren) => children,
  useMC: () => ({
    user: shellState.user,
    role: shellState.role,
    tenant: { id: "t1", name: shellState.tenantName, slug: "give-hope" },
    signOut: vi.fn(),
  }),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => shellState.pathname,
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("../../../../apps/admin/app/eve/global-panel", () => ({
  EveGlobalPanel: () => null,
}));
beforeEach(() => {
  vi.stubGlobal("matchMedia", (media: string) => ({
    media,
    matches: false,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  shellState.role = "admin";
  shellState.pathname = "/feed";
  shellState.user = null;
  shellState.tenantName = "Give Hope";
});

function FullscreenEditor({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useStudioFullscreen(active, root);
  return (
    <div ref={root}>
      <h1>Studio editor</h1>
    </div>
  );
}

describe("Mission Control composed navigation names", () => {
  it("renders header controls and a stable shortcut before hydration", () => {
    const html = renderToString(
      <MCShell>
        <h1>Content</h1>
      </MCShell>,
    );
    expect(html).toContain("Open Mission Control search");
    expect(html).toContain("Open profile menu");
    expect(html).toContain("Ctrl K");
  });

  it("removes shell controls and their portals during fullscreen editing", async () => {
    const view = render(
      <MCShell>
        <FullscreenEditor active={false} />
      </MCShell>,
    );
    fireEvent.click(
      view.getAllByRole("button", { name: "Toggle Sidebar" })[0]!,
    );
    fireEvent.click(
      view.getByRole("button", { name: "Ministry Updates pages" }),
    );
    await view.findByRole("menu");
    view.rerender(
      <MCShell>
        <FullscreenEditor active />
      </MCShell>,
    );
    expect(view.queryByRole("menu")).toBeNull();
    expect(
      view.queryByRole("button", { name: "Open profile menu" }),
    ).toBeNull();
    expect(
      view.queryByRole("button", { name: "Open Mission Control search" }),
    ).toBeNull();
    expect(view.getByRole("heading", { name: "Studio editor" })).toBeTruthy();
    view.rerender(
      <MCShell>
        <FullscreenEditor active={false} />
      </MCShell>,
    );
    expect(
      view.getByRole("button", { name: "Open profile menu" }),
    ).toBeTruthy();
  });

  it("opens a collapsed module's permitted pages in a flyout", async () => {
    const view = render(
      <MCShell>
        <h1>Content</h1>
      </MCShell>,
    );
    fireEvent.click(
      view.getAllByRole("button", { name: "Toggle Sidebar" })[0]!,
    );
    fireEvent.click(
      view.getByRole("button", { name: "Ministry Updates pages" }),
    );
    const menu = await view.findByRole("menu");
    expect(
      within(menu)
        .getByRole("menuitem", { name: "Org updates" })
        .getAttribute("href"),
    ).toBe("/feed/org-updates");
    expect(
      within(menu)
        .getByRole("menuitem", { name: "Ministry Updates" })
        .getAttribute("href"),
    ).toBe("/feed");
  });

  it("opens newly active groups and names manual collapse truthfully", () => {
    const view = render(
      <MCShell>
        <h1>Content</h1>
      </MCShell>,
    );
    shellState.pathname = "/crm/notes";
    view.rerender(
      <MCShell>
        <h1>Content</h1>
      </MCShell>,
    );
    const toggle = view.getByRole("button", { name: "Hide CRM pages" });
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(toggle);
    expect(
      view
        .getByRole("button", { name: "Show CRM pages" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });
  it.each(["Contributions", "CRM", "Moderation", /Give Hope/])(
    "closes the mobile sheet after navigating through %s",
    async (name) => {
      vi.stubGlobal("innerWidth", 390);
      const view = render(
        <MCShell>
          <h1>Content</h1>
        </MCShell>,
      );
      fireEvent.click(view.getByRole("button", { name: "Toggle Sidebar" }));
      const sheet = await view.findByRole("dialog", { name: "Sidebar" });
      fireEvent.click(
        within(sheet).getByRole("link", {
          name,
          exact: typeof name === "string",
        }),
      );
      await waitFor(() =>
        expect(view.queryByRole("dialog", { name: "Sidebar" })).toBeNull(),
      );
    },
  );
  it("uses the product name when the tenant name is empty or whitespace", () => {
    shellState.tenantName = "   ";
    const view = render(
      <MCShell>
        <h1>Content</h1>
      </MCShell>,
    );
    // One line, not "Mission Control / Mission Control".
    expect(view.getAllByText("Mission Control")).toHaveLength(1);
  });
  it("keeps the rendered submenu links named by their parent content", () => {
    const view = render(
      <MCShell>
        <h1>Content</h1>
      </MCShell>,
    );
    expect(
      view.getByRole("link", { name: "Moderation" }).getAttribute("href"),
    ).toBe("/feed");
    expect(
      view.getByRole("link", { name: "Org updates" }).getAttribute("href"),
    ).toBe("/feed/org-updates");
  });

  it("keeps sidebar menus valid lists, including collapsible groups", () => {
    const view = render(
      <MCShell>
        <h1>Content</h1>
      </MCShell>,
    );
    const menus = view.container.querySelectorAll(
      '[data-sidebar="menu"], [data-sidebar="menu-sub"]',
    );
    expect(menus.length).toBeGreaterThan(0);
    for (const menu of menus) {
      for (const child of Array.from(menu.children)) {
        // axe "list"/"listitem": a ul may only contain li (or script/template).
        expect(child.tagName).toBe("LI");
      }
    }
  });

  it("offers only working header controls", () => {
    const view = render(
      <MCShell>
        <h1>Content</h1>
      </MCShell>,
    );
    // The language, activity and notification menus were demo content
    // (ADR-0027: the bell was hard-coded presentation, not notifications).
    for (const name of [
      "Change language",
      "Open activity",
      "Open notifications",
    ]) {
      expect(view.queryByRole("button", { name })).toBeNull();
    }
    expect(
      view.getByRole("button", { name: "Open profile menu" }),
    ).toBeTruthy();
    expect(view.queryByText("User Name")).toBeNull();
    expect(view.container.querySelector('img[src*="shadcnstudio"]')).toBeNull();
  });

  it.each([
    ["admin", ["Administration", "Staff directory", "About"]],
    // The staff directory reads admin-only accounts.
    ["finance", ["Administration", "About"]],
    ["staff", ["About"]],
  ])(
    "offers %s only the profile shortcuts their sidebar shows",
    async (role, expected) => {
      shellState.role = role;
      const view = render(
        <MCShell>
          <h1>Content</h1>
        </MCShell>,
      );
      fireEvent.click(view.getByRole("button", { name: "Open profile menu" }));
      await view.findByRole("menuitem", { name: "About" });
      const names = view
        .getAllByRole("menuitem")
        .map((item) => item.textContent?.trim())
        .filter((name) => name !== "Sign out");
      expect(names).toEqual(expected);
    },
  );

  it("shows where the page sits with breadcrumbs", () => {
    shellState.pathname = "/crm/notes";
    const view = render(
      <MCShell>
        <h1>Content</h1>
      </MCShell>,
    );
    const trail = view.getByRole("navigation", { name: /breadcrumb/i });
    expect(
      within(trail).getByRole("link", { name: "CRM" }).getAttribute("href"),
    ).toBe("/crm");
    expect(
      within(trail)
        .getByText("Notes")
        .closest("[aria-current]")
        ?.getAttribute("aria-current"),
    ).toBe("page");
  });

  it("names pages outside the sidebar in the breadcrumb", () => {
    shellState.pathname = "/help/about";
    const view = render(
      <MCShell>
        <h1>Content</h1>
      </MCShell>,
    );
    const trail = view.getByRole("navigation", { name: /breadcrumb/i });
    expect(within(trail).getByText("About")).toBeTruthy();
  });

  it("marks the current page in the sidebar", () => {
    shellState.pathname = "/crm/notes";
    const view = render(
      <MCShell>
        <h1>Content</h1>
      </MCShell>,
    );
    const notes = view
      .getAllByRole("link", { name: "Notes" })
      .find((link) => link.closest('[data-sidebar="menu-sub"]'));
    expect(notes?.getAttribute("aria-current")).toBe("page");
  });

  it("lists only the destinations the viewer's role works in", () => {
    shellState.role = "finance";
    const view = render(
      <MCShell>
        <h1>Content</h1>
      </MCShell>,
    );
    expect(view.getByRole("link", { name: "Contributions" })).toBeTruthy();
    expect(view.queryByRole("link", { name: "CRM" })).toBeNull();
  });

  it("names the organization from the tenant", () => {
    const view = render(
      <MCShell>
        <h1>Content</h1>
      </MCShell>,
    );
    expect(view.getAllByText("Give Hope").length).toBeGreaterThan(0);
    // The product name stays as the subtitle under a real tenant name.
    expect(view.getAllByText("Mission Control").length).toBeGreaterThan(0);
  });
});
