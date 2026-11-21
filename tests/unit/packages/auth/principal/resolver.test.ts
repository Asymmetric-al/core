import { describe, expect, it } from "vitest";

import {
  TA,
  TB,
  TC,
  U1,
  U2,
  asAssignment,
  failingReader,
  fakeReader,
  row,
} from "./fixtures";
import {
  PrincipalDeniedError,
  resolveActiveAssignment,
  resolveActivePrincipal,
} from "../../../../../packages/auth/principal/assignment";

import type {
  AssignmentRow,
  RoleClass,
} from "../../../../../packages/auth/principal/types";

const ok = (r: AssignmentRow, selection: string) => ({
  ok: true,
  assignment: asAssignment(r),
  selection,
});
const no = (reason: string) => ({ ok: false, reason });

// Plan 12, WP2, "Interim rules until WP3": on the donor portal a person
// with donor memberships in two organizations is refused, for the proxy
// check, server reads and the browser header alike. So on the donor surface
// there must be exactly one live donor row before either header is matched
// (council on the joined release, JB12).
describe("resolveActiveAssignment: the donor surface until WP3", () => {
  const DONOR_TA = row(TA, "donor");
  const DONOR_TB = row(TB, "donor");
  const STAFF = row(TA, "staff", "finance");

  it.each([
    ["a proposal of one of them", { proposedAssignmentId: DONOR_TB.id }],
    [
      "a proposal of one of them in its expected tenant",
      { proposedAssignmentId: DONOR_TB.id, expectedTenantId: TB },
    ],
    ["an expected tenant alone", { expectedTenantId: TA }],
    ["no proposal", {}],
  ])(
    "refuses a person with two live donor rows, given %s, as ambiguous",
    async (_label, narrowing) => {
      await expect(
        resolveActiveAssignment(
          { userId: U1, roleClass: "donor", ...narrowing },
          fakeReader([DONOR_TA, STAFF, DONOR_TB]),
        ),
      ).resolves.toEqual(no("ambiguous"));
    },
  );

  it("still takes the one donor row of a person who also holds other classes, proposed or not", async () => {
    for (const narrowing of [{}, { proposedAssignmentId: DONOR_TA.id }]) {
      await expect(
        resolveActiveAssignment(
          { userId: U1, roleClass: "donor", ...narrowing },
          fakeReader([STAFF, DONOR_TA]),
        ),
      ).resolves.toEqual(
        ok(DONOR_TA, "proposedAssignmentId" in narrowing ? "proposed" : "sole"),
      );
    }
  });

  it("leaves the staff surface's chosen row alone: two donor rows there change nothing", async () => {
    await expect(
      resolveActiveAssignment(
        { userId: U1, roleClass: "staff", proposedAssignmentId: STAFF.id },
        fakeReader([DONOR_TA, STAFF, DONOR_TB]),
      ),
    ).resolves.toEqual(ok(STAFF, "proposed"));
  });
});

describe("resolveActiveAssignment: proposals (the chosen row)", () => {
  const STAFF = row(TA, "staff", "finance");
  const DONOR_TB = row(TB, "donor");

  it("accepts an owned, live proposal of the surface's class as 'proposed'", async () => {
    const reader = fakeReader([STAFF, DONOR_TB]);
    await expect(
      resolveActiveAssignment(
        { userId: U1, roleClass: "donor", proposedAssignmentId: DONOR_TB.id },
        reader,
      ),
    ).resolves.toEqual(ok(DONOR_TB, "proposed"));
    expect(reader.calls).toBe(1);
  });

  it.each([
    ["a random id", row(TA, "donor").id],
    ["another user's id", row(TA, "donor", null, U2).id],
    ["an inactive id (absent from the live rows)", row(TB, "missionary").id],
  ])("denies %s as not_owned_or_inactive", async (_name, proposed) => {
    await expect(
      resolveActiveAssignment(
        { userId: U1, roleClass: "staff", proposedAssignmentId: proposed },
        fakeReader([STAFF, DONOR_TB]),
      ),
    ).resolves.toEqual(no("not_owned_or_inactive"));
  });

  it.each(["", "1 or 1=1", TA.toUpperCase(), ` ${STAFF.id}`])(
    "denies the non-canonical proposal %j before any read",
    async (proposed) => {
      const reader = fakeReader([STAFF]);
      await expect(
        resolveActiveAssignment(
          { userId: U1, roleClass: "staff", proposedAssignmentId: proposed },
          reader,
        ),
      ).resolves.toEqual(no("not_owned_or_inactive"));
      expect(reader.calls).toBe(0);
    },
  );

  it("denies a proposal outside expectedTenantId as tenant_mismatch", async () => {
    await expect(
      resolveActiveAssignment(
        {
          userId: U1,
          roleClass: "staff",
          proposedAssignmentId: STAFF.id,
          expectedTenantId: TB,
        },
        fakeReader([STAFF, DONOR_TB]),
      ),
    ).resolves.toEqual(no("tenant_mismatch"));
  });

  it("denies the person's own donor row proposed on a staff surface as role_class_mismatch", async () => {
    const donor = row(TA, "donor");
    await expect(
      resolveActiveAssignment(
        { userId: U1, roleClass: "staff", proposedAssignmentId: donor.id },
        fakeReader([STAFF, donor]),
      ),
    ).resolves.toEqual(no("role_class_mismatch"));
  });

  it("takes the chosen staff row of a person with several staff rows in a tenant", async () => {
    const care = row(TA, "staff", "member_care");
    await expect(
      resolveActiveAssignment(
        { userId: U1, roleClass: "staff", proposedAssignmentId: care.id },
        fakeReader([STAFF, care]),
      ),
    ).resolves.toEqual(ok(care, "proposed"));
  });
});

describe("resolveActiveAssignment: reader failures and malformed rows", () => {
  it.each(["u1", "", TA.toUpperCase()])(
    "a non-canonical userId %j is reader_error with no read",
    async (userId) => {
      const reader = fakeReader([row(TA, "donor")]);
      await expect(
        resolveActiveAssignment({ userId, roleClass: "donor" }, reader),
      ).resolves.toEqual(no("reader_error"));
      expect(reader.calls).toBe(0);
    },
  );

  it.each(["admin", "super_admin", "", "constructor"])(
    "an unknown role class %j is no_assignment with no read",
    async (roleClass) => {
      const reader = fakeReader([row(TA, "donor")]);
      await expect(
        resolveActiveAssignment(
          { userId: U1, roleClass: roleClass as RoleClass },
          reader,
        ),
      ).resolves.toEqual(no("no_assignment"));
      expect(reader.calls).toBe(0);
    },
  );

  it.each([new Error("rpc down"), "string rejection", null])(
    "a reader rejection (%s) is reader_error, never a throw",
    async (error) => {
      await expect(
        resolveActiveAssignment(
          { userId: U1, roleClass: "staff" },
          failingReader(error),
        ),
      ).resolves.toEqual(no("reader_error"));
    },
  );

  it.each([null, {}, "rows"])(
    "a non-array reader result (%j) is reader_error",
    async (result) => {
      const reader = {
        listActiveAssignments: async () => result as unknown as AssignmentRow[],
      };
      await expect(
        resolveActiveAssignment({ userId: U1, roleClass: "staff" }, reader),
      ).resolves.toEqual(no("reader_error"));
    },
  );

  const valid = row(TA, "staff", "finance");
  const MALFORMED: [string, unknown][] = [
    ["null row", null],
    ["non-UUID id", { ...row(TA, "donor"), id: "x" }],
    ["upper-case id", { ...row(TA, "donor"), id: TB.toUpperCase() }],
    ["non-UUID tenant", { ...row(TA, "donor"), tenant_id: "x" }],
    ["another user's row", row(TA, "donor", null, U2)],
    ["unknown role", { ...row(TA, "donor"), role: "admin" }],
    ["super_admin role", { ...row(TA, "donor"), role: "super_admin" }],
    ["prototype key as role", { ...row(TA, "donor"), role: "constructor" }],
    ["unknown staff role", row(TA, "staff", "ceo")],
    ["staff without staff_role", row(TA, "staff", null)],
    ["staff_role on a donor row", row(TA, "donor", "finance")],
    ["staff_role undefined", { ...row(TA, "donor"), staff_role: undefined }],
    [
      "missing is_tenant_admin",
      (({ is_tenant_admin: _f, ...rest }) => rest)(row(TA, "donor")),
    ],
    [
      "string is_tenant_admin",
      { ...row(TA, "staff", "hr"), is_tenant_admin: "true" },
    ],
    ["the flag on a donor row", row(TA, "donor", null, U1, true)],
    [
      "missing updated_at",
      (({ updated_at: _u, ...rest }) => rest)(row(TA, "donor")),
    ],
    ["empty updated_at", { ...row(TA, "donor"), updated_at: "" }],
    ["numeric updated_at", { ...row(TA, "donor"), updated_at: 1 }],
    ["repeated id", { ...row(TB, "donor"), id: valid.id }],
  ];
  it.each(MALFORMED)(
    "a malformed row (%s) beside a valid one is reader_error, with or without a proposal",
    async (_name, bad) => {
      for (const rows of [
        [valid, bad],
        [bad, valid],
      ]) {
        for (const input of [
          { userId: U1, roleClass: "staff" as const },
          {
            userId: U1,
            roleClass: "staff" as const,
            proposedAssignmentId: valid.id,
          },
          { userId: U1, roleClass: "staff" as const, expectedTenantId: TA },
        ]) {
          await expect(
            resolveActiveAssignment(input, fakeReader(rows)),
          ).resolves.toEqual(no("reader_error"));
        }
      }
    },
  );
});

describe("resolveActiveAssignment: the surface's role class (plan 5.1)", () => {
  const D = row(TA, "donor");
  const M = row(TA, "missionary");
  const S1 = row(TA, "staff", "finance");
  const S2 = row(TA, "staff", "member_care");
  const DB = row(TB, "donor");
  const MB = row(TB, "missionary");
  const SB = row(TB, "staff", "hr");
  const ADM = row(TA, "staff", "development", U1, true);

  it.each<
    [string, RoleClass, AssignmentRow[], { expectedTenantId?: string }, unknown]
  >([
    ["0 rows → no_assignment", "staff", [], {}, no("no_assignment")],
    ["1 row of the class → sole", "missionary", [M], {}, ok(M, "sole")],
    [
      "no row of the class → no_assignment",
      "missionary",
      [S1, D],
      {},
      no("no_assignment"),
    ],
    [
      "staff + donor on the staff surface → the staff row",
      "staff",
      [S1, D],
      {},
      ok(S1, "sole"),
    ],
    [
      "staff + donor on the donor portal → the donor row, never the staff row",
      "donor",
      [S1, D],
      {},
      ok(D, "sole"),
    ],
    [
      "staff + donor + missionary in the workspace → the missionary row",
      "missionary",
      [D, S1, M],
      {},
      ok(M, "sole"),
    ],
    [
      "two staff rows in one tenant → ambiguous, until WP2b's chooser",
      "staff",
      [S1, S2],
      {},
      no("ambiguous"),
    ],
    [
      "two staff rows and a donor row → ambiguous",
      "staff",
      [S1, D, S2],
      {},
      no("ambiguous"),
    ],
    [
      "donor rows in two tenants → ambiguous: never guesses a tenant",
      "donor",
      [D, DB],
      {},
      no("ambiguous"),
    ],
    [
      "staff rows in two tenants → ambiguous",
      "staff",
      [S1, SB],
      {},
      no("ambiguous"),
    ],
    [
      "staff in TA and a donor row in TB on the staff surface → the staff row",
      "staff",
      [DB, S1],
      {},
      ok(S1, "sole"),
    ],
    // Narrowing to a tenant holds for every class; on the donor surface two
    // donor rows are refused first, by plan 12's interim rule until WP3
    // (JB12; "the donor surface until WP3" above).
    [
      "missionary rows in two tenants narrowed to TB → the TB row",
      "missionary",
      [M, MB],
      { expectedTenantId: TB },
      ok(MB, "sole"),
    ],
    [
      "donor rows in two tenants narrowed to TB → ambiguous, until WP3",
      "donor",
      [D, DB],
      { expectedTenantId: TB },
      no("ambiguous"),
    ],
    [
      "narrowed to a tenant with no row of the class → no_assignment",
      "staff",
      [S1, DB],
      { expectedTenantId: TC },
      no("no_assignment"),
    ],
    [
      "the flagged staff row resolves with its flag",
      "staff",
      [ADM, D],
      {},
      ok(ADM, "sole"),
    ],
  ])("%s", async (_name, roleClass, rows, extra, want) => {
    await expect(
      resolveActiveAssignment(
        { userId: U1, roleClass, ...extra },
        fakeReader(rows),
      ),
    ).resolves.toEqual(want);
  });
});

describe("resolveActiveAssignment: no default tenant, no cache", () => {
  it("a person with no membership gets no_assignment and no tenant", async () => {
    const res = await resolveActiveAssignment(
      { userId: U1, roleClass: "staff" },
      fakeReader([]),
    );
    expect(res).toEqual(no("no_assignment"));
    expect(JSON.stringify(res)).not.toMatch(/tenant/i);
  });

  it("re-reads on every call: a membership revoked between calls denies the second", async () => {
    const staff = row(TA, "staff", "finance");
    const reader = fakeReader([staff], []);
    await expect(
      resolveActiveAssignment({ userId: U1, roleClass: "staff" }, reader),
    ).resolves.toEqual(ok(staff, "sole"));
    await expect(
      resolveActiveAssignment({ userId: U1, roleClass: "staff" }, reader),
    ).resolves.toEqual(no("no_assignment"));
    expect(reader.calls).toBe(2);
  });

  it("returns staffRole null (not undefined) for non-staff rows, and a frozen assignment", async () => {
    const res = await resolveActiveAssignment(
      { userId: U1, roleClass: "donor" },
      fakeReader([row(TA, "donor")]),
    );
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.assignment.staffRole).toBeNull();
    expect(res.assignment.isTenantAdmin).toBe(false);
    expect(Object.isFrozen(res.assignment)).toBe(true);
  });
});

describe("resolveActivePrincipal", () => {
  it("returns a human principal for the surface's one assignment", async () => {
    const staff = row(TA, "staff", "finance");
    await expect(
      resolveActivePrincipal(
        { userId: U1 },
        "staff",
        undefined,
        fakeReader([staff, row(TA, "donor")]),
      ),
    ).resolves.toEqual({
      kind: "human",
      userId: U1,
      activeAssignment: asAssignment(staff),
    });
  });

  it.each<[string, RoleClass, string | undefined, AssignmentRow[], string]>([
    ["no rows", "staff", undefined, [], "no_assignment"],
    [
      "two tenants",
      "donor",
      undefined,
      [row(TA, "donor"), row(TB, "donor")],
      "ambiguous",
    ],
    [
      "a foreign proposal",
      "donor",
      row(TA, "donor", null, U2).id,
      [row(TA, "donor")],
      "not_owned_or_inactive",
    ],
  ])(
    "throws PrincipalDeniedError on %s",
    async (_name, roleClass, proposed, rows, reason) => {
      const err = await resolveActivePrincipal(
        { userId: U1 },
        roleClass,
        proposed,
        fakeReader(rows),
      ).catch((e: unknown) => e);
      expect(err).toBeInstanceOf(PrincipalDeniedError);
      expect((err as PrincipalDeniedError).reason).toBe(reason);
    },
  );
});
