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

// Council round 1, A22: every branch of the chooser's streamed part.
const SECOND = "00000000-0000-0000-0000-000000000002";
const FOREIGN = "6f1c2a4e-9b3d-4c5e-8f7a-0b1c2d3e4f5a";
const USER = "00000000-0000-4000-8000-0000000000c1";
let rowNumber = 0;
function row(
  tenantId: string,
  membershipRole: "staff" | "missionary",
  staffRole: string | null,
) {
  rowNumber += 1;
  return {
    assignmentId: `00000000-0000-4000-8000-${rowNumber.toString(16).padStart(12, "0")}`,
    userId: USER,
    tenantId,
    revision: "r",
    membershipRole,
    staffRole,
    isTenantAdmin: false,
  };
}
function signedIn(rows: ReturnType<typeof row>[]) {
  state.signedIn = {
    kind: "signed_in",
    userId: USER,
    assignments: rows,
    organizationNames: new Map([
      [DEMO, "Demo Mission"],
      [SECOND, "Second Mission"],
    ]),
  };
}
async function redirectOf(
  Page: (typeof PAGES)[number][1],
  params: Params,
): Promise<string | null> {
  try {
    await streamedPart(Page, params);
    return null;
  } catch (error) {
    const to = (error as { to?: string }).to;
    if (typeof to === "string") return to;
    throw error;
  }
}

describe("the chooser's redirects", () => {
  const ROWS = {
    "Mission Control": {
      one: () => [row(DEMO, "staff", "development")],
      several: () => [
        row(DEMO, "staff", "finance"),
        row(SECOND, "staff", "hr"),
      ],
    },
    "the missionary workspace": {
      one: () => [row(DEMO, "missionary", null)],
      several: () => [
        row(DEMO, "missionary", null),
        row(SECOND, "missionary", null),
      ],
    },
  } as const;

  it.each(PAGES)(
    "%s sends a signed-out person to sign-in",
    async (_s, Page) => {
      state.signedIn = { kind: "signed_out" };
      expect(await redirectOf(Page, {})).toBe("/login");
    },
  );

  it.each(PAGES)(
    "%s sends a person with no choice there to /no-access (an organization they do not belong to)",
    async (surface, Page) => {
      signedIn(ROWS[surface].several());
      expect(await redirectOf(Page, { tenant: FOREIGN })).toBe("/no-access");
      signedIn([]);
      expect(await redirectOf(Page, {})).toBe("/no-access");
    },
  );

  it.each(PAGES)(
    "%s takes a person with one choice straight to it, with the page they asked for",
    async (surface, Page) => {
      signedIn(ROWS[surface].one());
      expect(await redirectOf(Page, { next: "/settings?tab=account" })).toBe(
        `/${DEMO}/settings?tab=account`,
      );
    },
  );

  it.each(PAGES)(
    "%s shows the choices to a person with several",
    async (surface, Page) => {
      signedIn(ROWS[surface].several());
      expect(await redirectOf(Page, {})).toBeNull();
      render(await streamedPart(Page, {}));
      expect(screen.getAllByRole("link").length).toBe(2);
    },
  );
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
