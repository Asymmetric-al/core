// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ReactElement } from "react";

const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const USER = "00000000-0000-4000-8000-0000000000c1";

const state = vi.hoisted(() => ({
  signedIn: null as unknown,
  headers: new Map<string, string>(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@asym/auth/context", () => ({
  getSignedInAssignments: async () => state.signedIn,
}));
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  redirect: (to: string) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { to });
  },
}));
vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string) => state.headers.get(name) ?? null,
    has: (name: string) => state.headers.has(name),
  }),
}));

const { loadOrganizationChoices } =
  await import("../../../packages/api/src/auth/organization-choices");
const { default: AdminChooserPage } =
  await import("../../../apps/admin/app/(auth)/choose-organization/page");
const { default: MissionaryChooserPage } =
  await import("../../../apps/missionary/app/choose-organization/page");

let n = 0;
function row(
  tenantId: string,
  membershipRole: "staff" | "missionary" | "donor",
  staffRole: string | null,
) {
  n += 1;
  return {
    assignmentId: `00000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`,
    userId: USER,
    tenantId,
    revision: "r",
    membershipRole,
    staffRole,
    isTenantAdmin: false,
  };
}

const P = [
  row(TA, "staff", "development"),
  row(TA, "staff", "finance"),
  row(TB, "staff", "development"),
  row(TA, "missionary", null),
  row(TB, "missionary", null),
];
const Q = [row(TA, "staff", "member_care")];

function signedIn(assignments: unknown[]) {
  state.signedIn = {
    kind: "signed_in",
    userId: USER,
    assignments,
    organizationNames: new Map([
      [TA, "Demo Mission"],
      [TB, "Second Mission"],
    ]),
  };
}

type Page = typeof AdminChooserPage;
async function streamedPart(
  Page: Page,
  params: Record<string, string>,
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

async function redirectOf(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return (error as { to?: string }).to;
  }
  throw new Error("expected a redirect");
}

beforeEach(() => {
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
  vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
  state.headers = new Map([
    ["x-asym-name-tenant", TA],
    ["x-asym-name-generation", "7"],
  ]);
  signedIn(P);
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("on: the staff chooser", () => {
  it("lists exactly A's ~finance and ~development, each linking /~<sub-role>/<next> (base: hrefs with A's ID)", async () => {
    await expect(
      loadOrganizationChoices({ roleClass: "staff", next: "/gifts?x=1" }),
    ).resolves.toEqual({
      kind: "ok",
      organizations: [
        {
          tenantId: TA,
          name: "Demo Mission",
          options: [
            { subRole: "finance", href: "/~finance/gifts?x=1" },
            { subRole: "development", href: "/~development/gifts?x=1" },
          ],
        },
      ],
    });
  });

  it("keeps next without the sub-role it carried, and ignores ?tenant=<B>", async () => {
    const choices = await loadOrganizationChoices({
      roleClass: "staff",
      tenantId: TB,
      next: "/~member_care/x",
    });
    expect(choices).toMatchObject({
      organizations: [
        {
          tenantId: TA,
          options: [{ href: "/~finance/x" }, { href: "/~development/x" }],
        },
      ],
    });
  });

  it("sends Q, with one row, straight to next with no prefix (base: /<A>/gifts)", async () => {
    signedIn(Q);
    expect(
      await redirectOf(
        streamedPart(AdminChooserPage, { next: "/gifts", tenant: TB }),
      ),
    ).toBe("/gifts");
  });

  it("renders P's two options as links with no ID", async () => {
    render(await streamedPart(AdminChooserPage, { next: "/gifts" }));
    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual([
      "/admin/~finance/gifts",
      "/admin/~development/gifts",
    ]);
  });

  it("sets no tenant on its retry address (base: ?tenant=<B>)", async () => {
    state.signedIn = { kind: "unavailable" };
    await expect(
      loadOrganizationChoices({
        roleClass: "staff",
        tenantId: TB,
        next: "/gifts",
      }),
    ).resolves.toEqual({
      kind: "unavailable",
      retryHref: "/choose-organization?next=%2Fgifts",
    });
  });
});

describe("on: the missionary chooser never lists", () => {
  it("sends P, with one missionary row in A, straight to next (base: /<A>/feed)", async () => {
    vi.stubEnv("CORE_APP_BASE_PATH", "/missionary");
    expect(
      await redirectOf(streamedPart(MissionaryChooserPage, { next: "/feed" })),
    ).toBe("/feed");
  });
});
