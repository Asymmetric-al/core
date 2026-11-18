import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  signWebStudioSelection,
  WEB_STUDIO_TENANT_COOKIE,
} from "../../../../packages/auth/web-studio";

/**
 * The Web Studio layout's gate (plan 5.2; AL-2675, WP2b slice C): every Web
 * Studio page renders for the organization the signed Web Studio cookie
 * selects, judged against the person's live staff rows, and carries that
 * tenant and row as its document scope. Nothing falls back to a profile's
 * tenant, a first membership or another surface's address.
 */

const USER = "00000000-0000-4000-8000-0000000000c1";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";

const state = vi.hoisted(() => ({
  signedIn: {} as unknown,
  cookie: undefined as string | undefined,
}));

vi.mock("@asym/auth/context", () => ({
  getSignedInAssignments: async () => state.signedIn,
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === WEB_STUDIO_TENANT_COOKIE && state.cookie !== undefined
        ? { name, value: state.cookie }
        : undefined,
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

const { requireWebStudioAccess } =
  await import("../../../../apps/admin/lib/web-studio-access");

function staff(id: string, tenantId: string, membershipRole = "staff") {
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
const A = staff("00000000-0000-4000-8000-0000000000a1", TA);
const B = staff("00000000-0000-4000-8000-0000000000b1", TB);

function signedIn(assignments: unknown[]) {
  return {
    kind: "signed_in",
    userId: USER,
    assignments,
    organizationNames: new Map([
      [TA, "Alpha Mission"],
      [TB, "Bravo Mission"],
    ]),
  };
}

async function redirectOf(pathname = "/web-studio/collections/pages") {
  try {
    await requireWebStudioAccess(pathname);
  } catch (error) {
    if (error instanceof RedirectError) return error.target;
    throw error;
  }
  throw new Error("expected a redirect");
}

beforeEach(() => {
  state.signedIn = signedIn([A, B]);
  state.cookie = undefined;
});

describe("requireWebStudioAccess", () => {
  it("renders for the organization the cookie selects, with that tenant and row as the document scope", async () => {
    state.cookie = await signWebStudioSelection(
      { tenantId: TB, assignmentId: B.assignmentId },
      "unit-test-payload-secret",
    );

    await expect(requireWebStudioAccess("/web-studio")).resolves.toEqual({
      scope: {
        userId: USER,
        tenantId: TB,
        assignmentId: B.assignmentId,
        addressPrefix: "",
      },
      organization: { name: "Bravo Mission", canSwitch: true },
    });
  });

  it("sends a person in two organizations without a cookie to the Web Studio chooser", async () => {
    expect(await redirectOf()).toBe(
      "/web-studio/organization?next=%2Fweb-studio%2Fcollections%2Fpages",
    );
  });

  it("needs no choice from a person with one staff row, and offers no switch", async () => {
    state.signedIn = signedIn([
      A,
      staff("00000000-0000-4000-8000-0000000000b2", TB, "donor"),
    ]);

    await expect(requireWebStudioAccess("/web-studio")).resolves.toMatchObject({
      scope: { tenantId: TA, assignmentId: A.assignmentId },
      organization: { name: "Alpha Mission", canSwitch: false },
    });
  });

  it("never falls back when the cookie names a row the person no longer holds", async () => {
    state.signedIn = signedIn([A]);
    state.cookie = await signWebStudioSelection(
      { tenantId: TB, assignmentId: B.assignmentId },
      "unit-test-payload-secret",
    );

    expect(await redirectOf("/web-studio")).toBe(
      "/web-studio/organization?next=%2Fweb-studio",
    );
  });

  it("refuses a person with no staff row, and sends a signed-out one to sign in", async () => {
    state.signedIn = signedIn([
      staff("00000000-0000-4000-8000-0000000000b2", TB, "donor"),
    ]);
    expect(await redirectOf()).toBe("/no-access");

    state.signedIn = { kind: "signed_out" };
    expect(await redirectOf()).toBe(
      "/login?next=%2Fweb-studio%2Fcollections%2Fpages",
    );
  });

  it("refuses when the person's rows cannot be read", async () => {
    state.signedIn = { kind: "unavailable" };
    expect(await redirectOf()).toBe("/no-access");
  });
});
