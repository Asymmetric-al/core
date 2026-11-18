// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
}));

vi.mock("@asym/auth/context", () => ({
  getSignedInAssignments: async () => state.signedIn,
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    set: (cookie: Record<string, unknown>) => state.set.push(cookie),
  }),
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
});

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
      expect(await choose({ ...fields, next: "/web-studio" })).toBe(
        "/web-studio/organization?next=%2Fweb-studio",
      );
    }
    expect(state.set).toEqual([]);
  });

  it("only ever returns inside Web Studio", async () => {
    for (const next of [
      "https://evil.example/web-studio",
      "//evil.example/web-studio",
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

  it("sends a signed-out person to sign in", async () => {
    state.signedIn = { kind: "signed_out" };
    expect(
      await choose({ tenant: TA, assignment: A, next: "/web-studio" }),
    ).toBe("/login?next=%2Fweb-studio%2Forganization");
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
      name: /^Bravo Mission:\s+Open Bravo Mission$/,
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
});
