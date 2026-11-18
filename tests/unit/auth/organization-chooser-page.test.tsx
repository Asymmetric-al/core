// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ReactElement } from "react";

/**
 * The organization chooser's page in Mission Control and the missionary
 * workspace (plan 5.2; AL-2675): every branch of its streamed part.
 */

const DEMO = "00000000-0000-0000-0000-000000000001";

const state = vi.hoisted(() => ({ signedIn: null as unknown }));

vi.mock("server-only", () => ({}));
vi.mock("@asym/auth/context", () => ({
  getSignedInAssignments: async () => state.signedIn,
}));
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  redirect: (to: string) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { to });
  },
}));

// `redirectInTenant` reads the request's address prefix; these pages and
// gates have none, so it is the plain redirect (council round 1, A10).
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

const { default: AdminChooserPage } =
  await import("../../../apps/admin/app/(auth)/choose-organization/page");
const { default: MissionaryChooserPage } =
  await import("../../../apps/missionary/app/choose-organization/page");

const PAGES = [
  ["Mission Control", AdminChooserPage],
  ["the missionary workspace", MissionaryChooserPage],
] as const;

type Params = Record<string, string>;

/** Runs a chooser page's streamed part: the element it renders. */
async function streamedPart(
  Page: (typeof PAGES)[number][1],
  params: Params,
): Promise<ReactElement> {
  const element = Page({ searchParams: Promise.resolve(params) }) as {
    props: {
      children: {
        type: (p: unknown) => Promise<ReactElement>;
        props: unknown;
      };
    };
  };
  const choices = element.props.children;
  return choices.type(choices.props);
}

beforeEach(() => {
  state.signedIn = null;
});

afterEach(() => {
  cleanup();
});

// Council round 1, A9: a failed read used to throw, and with no error
// boundary on the route the person got the global error page.
// Council round 1, A13: the accessible name of each choice reads once,
// "Open Acme", not "Acme: Open Acme"; a role names its organization.
describe("the chooser's choices", () => {
  it("are named once, with the organization where a role alone would not say it", async () => {
    const { OrganizationChooser } =
      await import("../../../packages/ui/components/auth/organization-chooser");
    render(
      <OrganizationChooser
        organizations={[
          {
            tenantId: DEMO,
            name: "Acme",
            options: [{ subRole: null, href: `/${DEMO}` }],
          },
          {
            tenantId: "00000000-0000-0000-0000-000000000002",
            name: "Beta",
            options: [
              { subRole: "finance", href: "/b~finance" },
              { subRole: "hr", href: "/b~hr" },
            ],
          },
        ]}
      />,
    );

    expect(
      screen
        .getAllByRole("link")
        .map((link) => link.textContent?.replace(/\s+/g, " ").trim()),
    ).toEqual(["Open Acme", "Beta: Finance", "Beta: HR"]);
  });
});

describe("when the person's organizations cannot be read", () => {
  it.each(PAGES)(
    "%s shows an alert with a way to try again, not an error page",
    async (_surface, Page) => {
      state.signedIn = { kind: "unavailable" };

      render(await streamedPart(Page, {}));

      expect(
        screen.getByRole("heading", { level: 1, name: /organization/i }),
      ).toBeTruthy();
      const alert = screen.getByRole("alert");
      expect(alert.textContent).toMatch(/could not be loaded/i);
      const retry = within(alert).getByRole("link", { name: "Try again" });
      expect(retry.getAttribute("href")).toBe("/choose-organization");
    },
  );

  it.each(PAGES)(
    "%s tries again with the same tenant and next page",
    async (_surface, Page) => {
      state.signedIn = { kind: "unavailable" };
      const next = `/${DEMO}/care?tab=open`;

      render(await streamedPart(Page, { tenant: DEMO, next }));

      const href = screen
        .getByRole("link", { name: "Try again" })
        .getAttribute("href")!;
      const url = new URL(href, "https://app.test");
      expect(url.origin).toBe("https://app.test");
      expect(url.pathname).toBe("/choose-organization");
      expect(url.searchParams.get("tenant")).toBe(DEMO);
      expect(url.searchParams.get("next")).toBe(next);
    },
  );
});
