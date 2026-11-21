import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The organization chooser's options (plan 5.2; AL-2675): every live row of
 * the surface's class, grouped by organization, each linking to the page the
 * person was going to under that row's address. Each organization is named
 * from `public.current_user_organizations()`, which the signed-in read returns
 * beside the rows (D-26 as the coordinator's ruling amends it).
 */

const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const TC = "00000000-0000-0000-0000-000000000003";
const state = vi.hoisted(() => ({
  signedIn: null as unknown,
}));

vi.mock("server-only", () => ({}));
vi.mock("@asym/auth/context", () => ({
  getSignedInAssignments: async () => state.signedIn,
}));
const { loadOrganizationChoices } =
  await import("../../../../packages/api/src/auth/organization-choices");

function assignment(
  tenantId: string,
  membershipRole: "staff" | "missionary" | "donor",
  staffRole: string | null,
  n: number,
) {
  return {
    assignmentId: `00000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`,
    userId: "u",
    tenantId,
    revision: "r",
    membershipRole,
    staffRole,
    isTenantAdmin: false,
  };
}

beforeEach(() => {
  state.signedIn = {
    kind: "signed_in",
    userId: "u",
    assignments: [
      assignment(TA, "staff", "member_care", 1),
      assignment(TA, "staff", "finance", 2),
      assignment(TB, "staff", "development", 3),
      assignment(TB, "donor", null, 4),
      assignment(TC, "donor", null, 5),
    ],
    organizationNames: new Map([
      [TA, "Demo Mission"],
      [TB, "Second Mission"],
      [TC, "Third Mission"],
    ]),
  };
});

describe("loadOrganizationChoices", () => {
  it("lists each organization by name, with one option per row of the class", async () => {
    await expect(
      loadOrganizationChoices({ roleClass: "staff", next: "/care?tab=open" }),
    ).resolves.toEqual({
      kind: "ok",
      organizations: [
        {
          tenantId: TA,
          name: "Demo Mission",
          options: [
            { subRole: "finance", href: `/${TA}~finance/care?tab=open` },
            {
              subRole: "member_care",
              href: `/${TA}~member_care/care?tab=open`,
            },
          ],
        },
        {
          tenantId: TB,
          name: "Second Mission",
          options: [{ subRole: "development", href: `/${TB}/care?tab=open` }],
        },
      ],
    });
  });

  it("names only organizations where the person holds a row of the surface's class", async () => {
    // TC is named for the person, as a donor; Mission Control lists only staff rows.
    const result = await loadOrganizationChoices({ roleClass: "staff" });
    expect(
      result.kind === "ok" && result.organizations.map((o) => o.name),
    ).toEqual(["Demo Mission", "Second Mission"]);
    expect(JSON.stringify(result)).not.toContain("Third Mission");
  });

  it("narrows to one organization's rows", async () => {
    const result = await loadOrganizationChoices({
      roleClass: "staff",
      tenantId: TA,
      next: "/",
    });
    expect(result.kind === "ok" && result.organizations).toEqual([
      expect.objectContaining({
        tenantId: TA,
        options: [
          { subRole: "finance", href: `/${TA}~finance` },
          { subRole: "member_care", href: `/${TA}~member_care` },
        ],
      }),
    ]);
  });

  it.each([
    ["an absolute URL", "https://evil.example/x"],
    ["a protocol-relative URL", "//evil.example/x"],
    ["sign-in", "/login"],
    ["an API route", "/api/admin/export"],
    ["nothing", null],
  ])("sends %s to the organization's home page", async (_label, next) => {
    const result = await loadOrganizationChoices({
      roleClass: "staff",
      tenantId: TB,
      next,
    });
    expect(result.kind === "ok" && result.organizations[0]!.options).toEqual([
      { subRole: "development", href: `/${TB}` },
    ]);
  });

  it("drops a tenant prefix the next address already carries", async () => {
    const result = await loadOrganizationChoices({
      roleClass: "staff",
      tenantId: TB,
      next: `/${TA}~finance/contributions`,
    });
    expect(result.kind === "ok" && result.organizations[0]!.options).toEqual([
      { subRole: "development", href: `/${TB}/contributions` },
    ]);
  });

  it("names an organization the name list leaves out, such as an E2E bypass identity's, by a short form of its id", async () => {
    state.signedIn = {
      ...(state.signedIn as object),
      organizationNames: new Map([[TB, "Second Mission"]]),
    };
    const result = await loadOrganizationChoices({ roleClass: "staff" });
    expect(
      result.kind === "ok" && result.organizations.map((o) => o.name),
    ).toEqual(["Organization 00000000…0001", "Second Mission"]);
  });

  it("takes no name reader of its own", async () => {
    const result = await loadOrganizationChoices({
      roleClass: "staff",
      // @ts-expect-error -- names come only from the person's own organizations (D-26)
      readOrganizationNames: async () => new Map([[TA, "Injected"]]),
    });
    expect(
      result.kind === "ok" && result.organizations.map((o) => o.name),
    ).toEqual(["Demo Mission", "Second Mission"]);
    // A failed or malformed read of the names makes the signed-in read
    // unavailable (packages/auth/context.request-auth.test.ts), passed on below.
  });

  it("passes on a signed-out or unreadable session", async () => {
    state.signedIn = { kind: "signed_out" };
    await expect(
      loadOrganizationChoices({ roleClass: "staff" }),
    ).resolves.toEqual({ kind: "signed_out" });
    state.signedIn = { kind: "unavailable" };
    // The unavailable state carries the chooser again, for the same choice
    // (council round 1, A9).
    await expect(
      loadOrganizationChoices({ roleClass: "missionary" }),
    ).resolves.toEqual({
      kind: "unavailable",
      retryHref: "/choose-organization",
    });
    await expect(
      loadOrganizationChoices({
        roleClass: "staff",
        tenantId: "00000000-0000-0000-0000-000000000001",
        next: "/care?tab=open",
      }),
    ).resolves.toEqual({
      kind: "unavailable",
      retryHref:
        "/choose-organization?tenant=00000000-0000-0000-0000-000000000001&next=%2Fcare%3Ftab%3Dopen",
    });
  });
});
