// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  readWebStudioCookie,
  WEB_STUDIO_TENANT_COOKIE,
} from "../../../../packages/auth/web-studio";

/**
 * The organization choice inside Web Studio (plan 5.2; AL-2675, WP2b slice
 * C). A person with several staff rows picks one; the choice is checked
 * against their live rows before the signed cookie is set, scoped to
 * `/web-studio`, and they go back where they were inside Web Studio.
 */

const USER = "00000000-0000-4000-8000-0000000000c1";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const A = "00000000-0000-4000-8000-0000000000a1";
const B = "00000000-0000-4000-8000-0000000000b1";

const state = vi.hoisted(() => ({
  signedIn: {} as unknown,
  set: [] as Array<Record<string, unknown>>,
  choices: {} as unknown,
}));

vi.mock("@asym/auth/context", () => ({
  getSignedInAssignments: async () => state.signedIn,
}));
vi.mock("@asym/api/auth/organization-choices", () => ({
  loadWebStudioOrganizationChoices: async () => state.choices,
}));
vi.mock("next/server", () => ({ connection: async () => undefined }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    set: (cookie: Record<string, unknown>) => state.set.push(cookie),
  }),
  // Slice A's redirect reads the proxy's address prefix; Web Studio has none.
  headers: async () => new Headers(),
}));
class RedirectError extends Error {
  constructor(public readonly target: string) {
    super(`NEXT_REDIRECT:${target}`);
  }
}
vi.mock("next/navigation", () => ({
  redirect: (target: string) => {
    throw new RedirectError(target);
  },
}));

const { chooseWebStudioOrganization } =
  await import("../../../../apps/admin/app/(auth)/web-studio/organization/actions");
const { OrganizationChooser } =
  await import("../../../../packages/ui/components/auth/organization-chooser");
const { default: WebStudioOrganizationPage } =
  await import("../../../../apps/admin/app/(auth)/web-studio/organization/page");

function row(id: string, tenantId: string, membershipRole = "staff") {
  return {
    assignmentId: id,
    userId: USER,
    tenantId,
    revision: "r",
    membershipRole,
    staffRole: membershipRole === "staff" ? "development" : null,
    isTenantAdmin: false,
  };
}

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

async function choose(fields: Record<string, string>) {
  try {
    await chooseWebStudioOrganization(form(fields));
  } catch (error) {
    if (error instanceof RedirectError) return error.target;
    throw error;
  }
  throw new Error("expected a redirect");
}

beforeEach(() => {
  state.signedIn = {
    kind: "signed_in",
    userId: USER,
    assignments: [
      row(A, TA),
      row(B, TB),
      row("00000000-0000-4000-8000-0000000000b2", TB, "donor"),
    ],
    organizationNames: new Map(),
  };
  state.set = [];
  state.choices = {
    kind: "choices",
    organizations: [
      {
        tenantId: TA,
        name: "Alpha Mission",
        options: [{ subRole: null, assignmentId: A }],
      },
      {
        tenantId: TB,
        name: "Bravo Mission",
        options: [{ subRole: null, assignmentId: B }],
      },
    ],
  };
});

afterEach(cleanup);

/**
 * Renders the chooser page as Next would: its Suspense boundary holds the
 * async part, which is called here like the server component it is.
 */
async function openChooserPage(params: Record<string, string>) {
  const page = WebStudioOrganizationPage({
    searchParams: Promise.resolve(params),
  }) as React.ReactElement<{ children: React.ReactElement }>;
  const choices = page.props.children as React.ReactElement<object> & {
    type: (props: object) => Promise<React.ReactElement>;
  };
  try {
    return await choices.type(choices.props);
  } catch (error) {
    if (error instanceof RedirectError) return error.target;
    throw error;
  }
}

describe("choosing an organization inside Web Studio", () => {
  it("sets the signed cookie for a row the person holds, scoped to /web-studio, and returns to the page", async () => {
    const target = await choose({
      tenant: TB,
      assignment: B,
      next: "/web-studio/collections/pages?limit=10",
    });

    expect(target).toBe("/web-studio/collections/pages?limit=10");
    expect(state.set).toHaveLength(1);
    const [cookie] = state.set;
    expect(cookie).toMatchObject({
      name: WEB_STUDIO_TENANT_COOKIE,
      httpOnly: true,
      sameSite: "strict",
      path: "/web-studio",
    });
    await expect(
      readWebStudioCookie(cookie!.value as string, "unit-test-payload-secret"),
    ).resolves.toEqual({
      kind: "selected",
      selection: { tenantId: TB, assignmentId: B },
    });
  });

  it("sets nothing for a row the person does not hold, a donor row, or a row in another tenant", async () => {
    for (const fields of [
      { tenant: TB, assignment: "00000000-0000-4000-8000-0000000000ff" },
      { tenant: TB, assignment: "00000000-0000-4000-8000-0000000000b2" },
      { tenant: TA, assignment: B },
      { tenant: "acme", assignment: "x" },
    ]) {
      // Back to the chooser, which says the choice did not go through
      // (council C11).
      expect(await choose({ ...fields, next: "/web-studio" })).toBe(
        "/web-studio/organization?next=%2Fweb-studio&refused=1",
      );
    }
    expect(state.set).toEqual([]);
  });

  it("only ever returns inside Web Studio", async () => {
    for (const next of [
      "https://evil.example/web-studio",
      "//evil.example/web-studio",
      "/\\evil.example/web-studio",
      "/\\/evil.example/web-studio",
      "\\\\evil.example/web-studio",
      "/%2F%2Fevil.example/web-studio",
      "/web-studio//evil.example",
      "/web-studio/%5Cevil.example",
      "/",
      "/api/admin/missionaries",
      "/web-studio/api/pages",
      "/web-studio/organization",
      "",
    ]) {
      expect(await choose({ tenant: TA, assignment: A, next })).toBe(
        "/web-studio",
      );
    }
  });

  it("sends a signed-out person to sign in and back to this choice and page", async () => {
    state.signedIn = { kind: "signed_out" };
    expect(
      await choose({
        tenant: TA,
        assignment: A,
        next: "/web-studio/collections/pages",
      }),
    ).toBe(
      `/login?next=${encodeURIComponent(
        "/web-studio/organization?next=%2Fweb-studio%2Fcollections%2Fpages",
      )}`,
    );
  });
});

describe("the chooser page (council C11)", () => {
  it("keeps the return address when it sends a signed-out person to sign in", async () => {
    state.choices = { kind: "signed_out" };
    expect(
      await openChooserPage({ next: "/web-studio/collections/pages?limit=10" }),
    ).toBe(
      `/login?next=${encodeURIComponent(
        "/web-studio/organization?next=%2Fweb-studio%2Fcollections%2Fpages%3Flimit%3D10",
      )}`,
    );
    // A return address outside Web Studio is dropped, as everywhere else.
    expect(await openChooserPage({ next: "//evil.example" })).toBe(
      `/login?next=${encodeURIComponent("/web-studio/organization?next=%2Fweb-studio")}`,
    );
  });

  it("says when the last choice did not go through", async () => {
    const chooser = await openChooserPage({
      next: "/web-studio",
      refused: "1",
    });
    render(chooser as React.ReactElement);
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toMatch(/That choice didn’t go through/);
    expect(alert.textContent).toMatch(/Choose again/);
  });

  it("shows no such message on a first visit", async () => {
    const chooser = await openChooserPage({ next: "/web-studio" });
    render(chooser as React.ReactElement);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  // Council on the joined release, JC3: a link from Mission Control names
  // the organization and row it was opened in; when Web Studio works in
  // another, or under another role of the same organization, or in none yet,
  // the proxy sends the person here instead of switching. The sentence is
  // true in each (check of the fix lists, JR7).
  it("offers first the organization the person came from in Mission Control, and says in one sentence why it asks", async () => {
    const chooser = await openChooserPage({ next: "/web-studio", from: TB });
    render(chooser as React.ReactElement);
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent),
    ).toEqual(["Bravo Mission", "Alpha Mission"]);
    expect(screen.getByRole("alert").textContent).toBe(
      "You came from Bravo Mission in Mission Control. Web Studio asks before it changes the organization or the role it works in.",
    );
  });

  it("says nothing of an organization the person holds no staff row in", async () => {
    const chooser = await openChooserPage({
      next: "/web-studio",
      from: "00000000-0000-0000-0000-000000000009",
    });
    render(chooser as React.ReactElement);
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent),
    ).toEqual(["Alpha Mission", "Bravo Mission"]);
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("the chooser's Web Studio form", () => {
  it("offers each organization as a form that posts the tenant, row and return address", () => {
    const action = vi.fn();
    render(
      <OrganizationChooser
        organizations={[
          {
            tenantId: TA,
            name: "Alpha Mission",
            options: [{ subRole: null, assignmentId: A }],
          },
          {
            tenantId: TB,
            name: "Bravo Mission",
            options: [{ subRole: null, assignmentId: B }],
          },
        ]}
        choose={{ action, next: "/web-studio/collections/pages" }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Choose an organization" }),
    ).toBeTruthy();
    expect(
      screen.getByText(/Web Studio works in one organization at a time/),
    ).toBeTruthy();
    const button = screen.getByRole("button", {
      // Named once, as every chooser option is (slice A, council A13).
      name: /^Open Bravo Mission$/,
    });
    const formElement = button.closest("form")!;
    const fields = Object.fromEntries(new FormData(formElement).entries());
    expect(fields).toEqual({
      tenant: TB,
      assignment: B,
      next: "/web-studio/collections/pages",
    });
    expect(within(formElement).queryByRole("link")).toBeNull();
  });

  it("shows that a posted choice is opening and takes no second press", async () => {
    // The action never settles, as while the server is still answering.
    const action = vi.fn(() => new Promise<void>(() => {}));
    render(
      <OrganizationChooser
        organizations={[
          {
            tenantId: TA,
            name: "Alpha Mission",
            options: [{ subRole: null, assignmentId: A }],
          },
          {
            tenantId: TB,
            name: "Bravo Mission",
            options: [{ subRole: null, assignmentId: B }],
          },
        ]}
        choose={{ action, next: "/web-studio" }}
      />,
    );
    const bravo = screen.getByRole<HTMLButtonElement>("button", {
      name: /Bravo Mission/,
    });
    expect(bravo.disabled).toBe(false);
    bravo.focus();
    fireEvent.click(bravo);

    // Busy and unavailable, but still focusable, so keyboard focus stays on
    // it while the server answers (council r2, minor): a disabled button
    // drops focus in the browser.
    await waitFor(() =>
      expect(bravo.getAttribute("aria-disabled")).toBe("true"),
    );
    expect(bravo.disabled).toBe(false);
    expect(document.activeElement).toBe(bravo);
    expect(bravo.getAttribute("aria-busy")).toBe("true");
    expect(bravo.querySelector("svg")).not.toBeNull();
    expect(action).toHaveBeenCalledTimes(1);
    fireEvent.click(bravo);
    expect(action).toHaveBeenCalledTimes(1);
  });
});
