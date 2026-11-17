import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The organization chooser's options (plan 5.2; AL-2675): every live row of
 * the surface's class, grouped by organization, each linking to the page the
 * person was going to under that row's address.
 */

const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const state = vi.hoisted(() => ({
  signedIn: null as unknown,
  tenants: [] as Array<{ id: string; name: string }>,
  adminAvailable: true,
  tenantFilter: [] as unknown[],
}));

vi.mock("server-only", () => ({}));
vi.mock("@asym/auth/context", () => ({
  getSignedInAssignments: async () => state.signedIn,
}));
const { loadOrganizationChoices: load } =
  await import("../../../../packages/api/src/auth/organization-choices");

/** As Mission Control passes it: names for the person's own tenants. */
async function readOrganizationNames(ids: string[]) {
  state.tenantFilter = ids;
  if (!state.adminAvailable) throw new Error("no reader");
  return new Map(
    state.tenants.filter((t) => ids.includes(t.id)).map((t) => [t.id, t.name]),
  );
}

function loadOrganizationChoices(
  input: Omit<Parameters<typeof load>[0], "readOrganizationNames">,
) {
  return load({ ...input, readOrganizationNames });
}

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
  state.adminAvailable = true;
  state.tenants = [
    { id: TA, name: "Demo Mission" },
    { id: TB, name: "Second Mission" },
  ];
  state.signedIn = {
    kind: "signed_in",
    userId: "u",
    assignments: [
      assignment(TA, "staff", "member_care", 1),
      assignment(TA, "staff", "finance", 2),
      assignment(TB, "staff", "development", 3),
      assignment(TB, "donor", null, 4),
    ],
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
    expect(state.tenantFilter).toEqual([TA, TB]);
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

  it("names an organization it cannot read by a short form of its id", async () => {
    state.adminAvailable = false;
    const failed = await loadOrganizationChoices({ roleClass: "staff" });
    const unread = await load({ roleClass: "staff" });
    for (const result of [failed, unread]) {
      expect(
        result.kind === "ok" && result.organizations.map((o) => o.name),
      ).toEqual(["Organization 00000000…0001", "Organization 00000000…0002"]);
    }
  });

  it("passes on a signed-out or unreadable session", async () => {
    state.signedIn = { kind: "signed_out" };
    await expect(
      loadOrganizationChoices({ roleClass: "staff" }),
    ).resolves.toEqual({ kind: "signed_out" });
    state.signedIn = { kind: "unavailable" };
    await expect(
      loadOrganizationChoices({ roleClass: "missionary" }),
    ).resolves.toEqual({ kind: "unavailable" });
  });
});
