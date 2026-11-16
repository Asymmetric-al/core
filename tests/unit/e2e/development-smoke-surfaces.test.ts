// @vitest-environment jsdom

import { queryAllByRole, queryAllByText } from "@testing-library/dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getNavItemsByRole } from "../../../packages/config/navigation";

import type { Page } from "@playwright/test";

const smoke = vi.hoisted(() => ({
  flows: new Map<string, (fixture: { page: Page }) => Promise<void>>(),
}));

vi.mock("@playwright/test", () => {
  const register = Object.assign(
    (title: string, flow: (fixture: { page: Page }) => Promise<void>) => {
      smoke.flows.set(title, flow);
    },
    {
      describe: (_title: string, registerFlows: () => void) => registerFlows(),
      afterEach: () => {},
    },
  );
  return {
    test: register,
    expect: (actual: unknown) => ({
      toBeVisible: async () => {
        expect((actual as { count(): number }).count()).toBeGreaterThan(0);
      },
      toHaveURL: async (expected: RegExp) => {
        expect((actual as { url(): string }).url()).toMatch(expected);
      },
      toHaveTitle: async (expected: RegExp) => {
        expect((actual as { title(): string }).title()).toMatch(expected);
      },
      toHaveCount: async (expected: number) => {
        expect((actual as { count(): number }).count()).toBe(expected);
      },
      toHaveAttribute: async (name: string, expected: RegExp) => {
        expect(
          (
            actual as { getAttribute(name: string): string | null }
          ).getAttribute(name),
        ).toMatch(expected);
      },
      toBeGreaterThan: (expected: number) => {
        expect(actual).toBeGreaterThan(expected);
      },
    }),
  };
});

vi.mock("../../e2e/development-smoke/helpers", () => ({
  ensureAuthenticated: async (
    page: Page,
    options: { authenticatedMarker: (page: Page) => { count(): number } },
  ) => {
    expect(options.authenticatedMarker(page).count()).toBeGreaterThan(0);
  },
  assertNoVisibleLoginPrompt: async () => {
    expect(document.querySelector('input[type="password"]')).toBeNull();
  },
  assertNoErrorBanner: async () => {
    expect(document.querySelector('[role="alert"]')).toBeNull();
  },
  collectFailureEvidence: async () => {},
}));

import "../../e2e/development-smoke/donor.smoke.spec";
import "../../e2e/development-smoke/missionary.smoke.spec";
import "../../e2e/development-smoke/admin.profile-dropdown.spec";

function fixturePage(
  surface: "donor" | "missionary" | "admin",
  content: string,
) {
  document.body.innerHTML = content;
  let pathname = surface === "donor" ? "/donor-dashboard" : "/";
  let title = surface === "admin" ? "Mission Control" : "Dashboard";
  const locator = (elements: Element[]) => ({
    count: () => elements.length,
    first: () => locator(elements.slice(0, 1)),
    getAttribute: (name: string) => elements[0]?.getAttribute(name) ?? null,
    click: async () => {
      const element = elements[0];
      if (!element) throw new Error("Cannot click a missing element");
      if (element instanceof HTMLAnchorElement) {
        await page.goto(element.getAttribute("href") ?? "/");
      } else {
        document.querySelector("[role=menu]")?.removeAttribute("hidden");
      }
    },
  });
  const page = {
    url: () => "https://preview.example" + pathname,
    title: () => title,
    getByRole: (role: Parameters<typeof queryAllByRole>[1], options: object) =>
      locator(queryAllByRole(document.body, role, options)),
    getByText: (text: RegExp) => locator(queryAllByText(document.body, text)),
    goto: async (target: string) => {
      pathname = target;
      title =
        surface === "admin" ? "Administration | Mission Control" : "Partners";
      document.body.innerHTML =
        surface === "admin"
          ? "<h1>Administration</h1><h2>People and access</h2>"
          : "<h1>Partners</h1>";
    },
    waitForURL: async (expected: RegExp) => {
      expect(pathname).toMatch(expected);
    },
    waitForLoadState: async () => {},
  } as unknown as Page;
  return page;
}

function flowFor(surface: "donor" | "missionary" | "admin") {
  const prefix = surface === "admin" ? "profile dropdown" : surface;
  const match = [...smoke.flows].find(([title]) => title.startsWith(prefix));
  if (!match) throw new Error("Missing " + surface + " smoke flow");
  return match[1];
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("hosted smoke dashboard surface contracts", () => {
  function adminPage(staffHref = "/admin/teams") {
    const staffDirectory = getNavItemsByRole("admin")
      .find((item) => item.id === "admin")
      ?.items?.find((item) => item.id === "admin-teams");
    expect(staffDirectory?.title).toBe("Staff directory");
    return fixturePage(
      "admin",
      `<button>Open profile menu</button><div role="menu" hidden><a role="menuitem" href="/admin">Administration</a><a role="menuitem" href="${staffHref}">${staffDirectory?.title}</a><a role="menuitem" href="/help/about">About</a><button role="menuitem">Sign out</button></div>`,
    );
  }

  it("accepts the Staff directory profile shortcut from current admin navigation", async () => {
    const page = adminPage();
    await flowFor("admin")({ page });
    expect(page.url()).toBe("https://preview.example/admin");
  });

  it("rejects a Staff directory shortcut with the wrong destination", async () => {
    await expect(
      flowFor("admin")({ page: adminPage("/admin/wrong") }),
    ).rejects.toThrow();
  });

  it("accepts the donor greeting, giving summary and updates headings", async () => {
    const page = fixturePage(
      "donor",
      "<h1>Welcome back, Preview</h1><h2>Given in 2026</h2><h2>More updates</h2>",
    );
    await flowFor("donor")({ page });
  });

  it("requires the donor giving summary beyond an authenticated greeting", async () => {
    const page = fixturePage(
      "donor",
      "<h1>Welcome back</h1><h2>More updates</h2>",
    );
    await expect(flowFor("donor")({ page })).rejects.toThrow();
  });

  it("accepts the missionary greeting and support heading before visiting partners", async () => {
    const page = fixturePage(
      "missionary",
      "<h1>Welcome back</h1><h2>Monthly support</h2><h2>Giving by month</h2>",
    );
    await flowFor("missionary")({ page });
    expect(page.url()).toBe("https://preview.example/donors");
  });

  it("rejects the missionary portal error even when the greeting remains", async () => {
    const page = fixturePage(
      "missionary",
      '<h1>Welcome back</h1><h2>Monthly support</h2><p role="alert">Could not load your portal</p>',
    );
    await expect(flowFor("missionary")({ page })).rejects.toThrow();
  });
});
