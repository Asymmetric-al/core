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
      toHaveURL: async (expected: RegExp | ((url: URL) => boolean)) => {
        const url = (actual as { url(): string }).url();
        if (typeof expected === "function") {
          expect(expected(new URL(url))).toBe(true);
        } else {
          expect(url).toMatch(expected);
        }
      },
      toHaveTitle: async (expected: RegExp) => {
        expect((actual as { title(): string }).title()).toMatch(expected);
      },
      toHaveCount: async (expected: number) => {
        expect((actual as { count(): number }).count()).toBe(expected);
      },
      toHaveAttribute: async (name: string, expected: RegExp | string) => {
        const value = (
          actual as { getAttribute(name: string): string | null }
        ).getAttribute(name);
        if (typeof expected === "string") expect(value).toBe(expected);
        else expect(value).toMatch(expected);
      },
      toEqual: (expected: unknown) => {
        expect(actual).toEqual(expected);
      },
      not: {
        toBeNull: () => {
          expect(actual).not.toBeNull();
        },
      },
      toBe: (expected: unknown) => {
        expect(actual).toBe(expected);
      },
      toBeGreaterThan: (expected: number) => {
        expect(actual).toBeGreaterThan(expected);
      },
      toBeGreaterThanOrEqual: (expected: number) => {
        expect(actual).toBeGreaterThanOrEqual(expected);
      },
      toBeLessThan: (expected: number) => {
        expect(actual).toBeLessThan(expected);
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

/**
 * The demo organization's address, where the missionary workspace and Mission
 * Control land (AL-2675).
 */
const TENANT_PREFIX = "/00000000-0000-0000-0000-000000000001";
const SCOPE_MARKER = `<span hidden data-tenant-scope="${TENANT_PREFIX}"></span>`;

/** What the hosted deployment answers, where a case changes it. */
interface Hosted {
  /** Whether the page renders its document scope. */
  scope?: boolean;
  /** Headers on every response the page sees. */
  responseHeaders?: Record<string, string>;
  /** The answer to a tenant address whose inner path names another host. */
  crossing?: { status: number; location?: string };
}

function fixturePage(
  surface: "donor" | "missionary" | "admin",
  content: string,
  hosted: Hosted = {},
) {
  const tenantSurface = surface !== "donor";
  const marker = tenantSurface && hosted.scope !== false ? SCOPE_MARKER : "";
  const responses: Array<(response: unknown) => void> = [];
  const respond = () => {
    for (const listener of responses) {
      listener({
        url: () => "https://preview.example" + pathname,
        headers: () => hosted.responseHeaders ?? {},
      });
    }
  };
  document.body.innerHTML = `${marker}${content}`;
  let pathname = surface === "donor" ? "/donor-dashboard" : TENANT_PREFIX;
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
    locator: (selector: string) =>
      locator([...document.querySelectorAll(selector)]),
    on: (event: string, listener: (response: unknown) => void) => {
      if (event === "response") responses.push(listener);
    },
    // A tenant address that names another host is refused, unless a case
    // says otherwise.
    request: {
      get: async (url: string) => {
        probes.push(new URL(url).pathname);
        const crossing = hosted.crossing ?? { status: 404 };
        return {
          status: () => crossing.status,
          headers: () =>
            crossing.location ? { location: crossing.location } : {},
        };
      },
    },
    goto: async (target: string) => {
      // The proxy lands a bare address on the person's organization; a
      // prefixed one is already there.
      pathname =
        tenantSurface && !target.startsWith(TENANT_PREFIX)
          ? `${TENANT_PREFIX}${target}`
          : target;
      title =
        surface === "admin" ? "Administration | Mission Control" : "Partners";
      document.body.innerHTML =
        surface === "admin"
          ? `${marker}<h1>Administration</h1><h2>People and access</h2>`
          : `${marker}<h1>Partners</h1>`;
      respond();
    },
    waitForURL: async (expected: RegExp | ((url: URL) => boolean)) => {
      if (typeof expected === "function") {
        expect(expected(new URL("https://preview.example" + pathname))).toBe(
          true,
        );
      } else {
        expect(pathname).toMatch(expected);
      }
    },
    waitForLoadState: async () => {},
  } as unknown as Page;
  return page;
}

/** The paths the flows probed with a direct request. */
const probes: string[] = [];

function flowFor(surface: "donor" | "missionary" | "admin") {
  const prefix = surface === "admin" ? "profile dropdown" : surface;
  const match = [...smoke.flows].find(([title]) => title.startsWith(prefix));
  if (!match) throw new Error("Missing " + surface + " smoke flow");
  return match[1];
}

afterEach(() => {
  document.body.innerHTML = "";
  probes.length = 0;
});

describe("hosted smoke dashboard surface contracts", () => {
  function adminPage(
    {
      adminHref = `${TENANT_PREFIX}/admin`,
      staffHref = `${TENANT_PREFIX}/admin/teams`,
    }: { adminHref?: string; staffHref?: string } = {},
    hosted: Hosted = {},
  ) {
    const staffDirectory = getNavItemsByRole("admin")
      .find((item) => item.id === "admin")
      ?.items?.find((item) => item.id === "admin-teams");
    expect(staffDirectory?.title).toBe("Staff directory");
    return fixturePage(
      "admin",
      `<button>Open profile menu</button><div role="menu" hidden><a role="menuitem" href="${adminHref}">Administration</a><a role="menuitem" href="${staffHref}">${staffDirectory?.title}</a><a role="menuitem" href="/help/about">About</a><button role="menuitem">Sign out</button></div>`,
      hosted,
    );
  }

  it("accepts the Staff directory profile shortcut from current admin navigation", async () => {
    const page = adminPage();
    await flowFor("admin")({ page });
    expect(page.url()).toBe(`https://preview.example${TENANT_PREFIX}/admin`);
  });

  it("rejects a Staff directory shortcut with the wrong destination", async () => {
    await expect(
      flowFor("admin")({
        page: adminPage({ staffHref: `${TENANT_PREFIX}/admin/wrong` }),
      }),
    ).rejects.toThrow();
  });

  // Council round 2, AR8: Mission Control's hosted flow carries the three
  // checks of the missionary workspace's (one scope, no internal header in a
  // response, the `//` form refused).
  it("rejects Administration and Staff directory links without the tenant prefix", async () => {
    await expect(
      flowFor("admin")({ page: adminPage({ adminHref: "/admin" }) }),
    ).rejects.toThrow();
    await expect(
      flowFor("admin")({ page: adminPage({ staffHref: "/admin/teams" }) }),
    ).rejects.toThrow();
  });

  it("rejects a Mission Control page rendered without its document scope", async () => {
    await expect(
      flowFor("admin")({ page: adminPage({}, { scope: false }) }),
    ).rejects.toThrow();
  });

  it("rejects a response that carries the proxy's internal headers", async () => {
    for (const name of [
      "x-asym-tenant-rewrite",
      "x-middleware-request-x-asym-tenant",
      "x-middleware-override-headers",
    ]) {
      await expect(
        flowFor("admin")({
          page: adminPage({}, { responseHeaders: { [name]: "1" } }),
        }),
      ).rejects.toThrow();
    }
  });

  it("probes the `//` form under the tenant prefix, and rejects a redirect off the origin", async () => {
    await flowFor("admin")({ page: adminPage() });
    expect(probes).toEqual([
      `${TENANT_PREFIX}//example.invalid/latest/meta-data`,
    ]);

    await expect(
      flowFor("admin")({
        page: adminPage(
          {},
          {
            crossing: {
              status: 307,
              location: "https://example.invalid/latest/meta-data",
            },
          },
        ),
      }),
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
    expect(page.url()).toBe(`https://preview.example${TENANT_PREFIX}/donors`);
  });

  it("rejects the missionary portal error even when the greeting remains", async () => {
    const page = fixturePage(
      "missionary",
      '<h1>Welcome back</h1><h2>Monthly support</h2><p role="alert">Could not load your portal</p>',
    );
    await expect(flowFor("missionary")({ page })).rejects.toThrow();
  });
});
