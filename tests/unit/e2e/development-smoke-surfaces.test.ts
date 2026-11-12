// @vitest-environment jsdom

import { queryAllByRole, queryAllByText } from "@testing-library/dom";
import { afterEach, describe, expect, it, vi } from "vitest";

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

function fixturePage(surface: "donor" | "missionary", content: string) {
  document.body.innerHTML = content;
  let pathname = surface === "donor" ? "/donor-dashboard" : "/";
  let title = "Dashboard";
  const locator = (elements: Element[]) => ({
    count: () => elements.length,
    first: () => locator(elements.slice(0, 1)),
  });
  return {
    url: () => "https://preview.example" + pathname,
    title: () => title,
    getByRole: (role: Parameters<typeof queryAllByRole>[1], options: object) =>
      locator(queryAllByRole(document.body, role, options)),
    getByText: (text: RegExp) => locator(queryAllByText(document.body, text)),
    goto: async (target: string) => {
      pathname = target;
      title = "Partners";
      document.body.innerHTML = "<h1>Partners</h1>";
    },
    waitForLoadState: async () => {},
  } as unknown as Page;
}

function flowFor(surface: "donor" | "missionary") {
  const match = [...smoke.flows].find(([title]) => title.startsWith(surface));
  if (!match) throw new Error("Missing " + surface + " smoke flow");
  return match[1];
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("hosted smoke dashboard surface contracts", () => {
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
