import { describe, expect, it } from "vitest";

import {
  readActiveAssignments,
  selectAssignment,
} from "../../../packages/auth/principal/assignment";
import {
  decideLanding,
  decideTenantAddress,
  listAddressChoices,
} from "../../../packages/auth/tenant-address-decisions";
import {
  TA,
  TB,
  U1,
  asAssignment,
  failingReader,
  fakeReader,
  row,
} from "../packages/auth/principal/fixtures";

import type { AssignmentRow } from "../../../packages/auth/principal/types";

const live = (...rows: AssignmentRow[]) => rows.map(asAssignment);

describe("readActiveAssignments", () => {
  it("returns every validated row", async () => {
    const rows = [row(TA, "staff", "finance"), row(TB, "donor")];
    await expect(readActiveAssignments(U1, fakeReader(rows))).resolves.toEqual({
      ok: true,
      assignments: live(...rows),
    });
  });

  it("fails closed on a reader error or a malformed row", async () => {
    await expect(readActiveAssignments(U1, failingReader())).resolves.toEqual({
      ok: false,
      reason: "reader_error",
    });
    const malformed = { ...row(TA, "staff", "finance"), staff_role: "admin" };
    await expect(
      readActiveAssignments(U1, fakeReader([malformed])),
    ).resolves.toEqual({ ok: false, reason: "reader_error" });
  });
});

describe("selectAssignment (the resolver's rule over parsed rows)", () => {
  const FIN = row(TA, "staff", "finance");
  const CARE = row(TA, "staff", "member_care");
  const OTHER_TENANT = row(TB, "staff", "development");

  it("takes the proposed row only in the expected tenant", () => {
    expect(
      selectAssignment(live(FIN, CARE, OTHER_TENANT), {
        roleClass: "staff",
        proposedAssignmentId: CARE.id,
        expectedTenantId: TA,
      }),
    ).toEqual({
      ok: true,
      assignment: asAssignment(CARE),
      selection: "proposed",
    });
    expect(
      selectAssignment(live(FIN, CARE, OTHER_TENANT), {
        roleClass: "staff",
        proposedAssignmentId: OTHER_TENANT.id,
        expectedTenantId: TA,
      }),
    ).toEqual({ ok: false, reason: "tenant_mismatch" });
  });

  it("resolves a person in two organizations in the expected one", () => {
    expect(
      selectAssignment(live(FIN, OTHER_TENANT), {
        roleClass: "staff",
        expectedTenantId: TB,
      }),
    ).toEqual({
      ok: true,
      assignment: asAssignment(OTHER_TENANT),
      selection: "sole",
    });
  });
});

describe("decideTenantAddress (plan 5.1, 5.2; WP2 acceptance)", () => {
  const FIN = row(TA, "staff", "finance");
  const CARE = row(TA, "staff", "member_care");
  const DEV_B = row(TB, "staff", "development");
  const MISSIONARY = row(TA, "missionary");

  it("refuses a tenant where the person holds no row of the class", () => {
    expect(
      decideTenantAddress({
        assignments: live(DEV_B, MISSIONARY),
        roleClass: "staff",
        tenantId: TA,
        subRole: null,
      }),
    ).toEqual({ kind: "refuse", reason: "no_assignment" });
  });

  it("acts under the one row, and drops any suffix", () => {
    const assignments = live(FIN, DEV_B);
    expect(
      decideTenantAddress({
        assignments,
        roleClass: "staff",
        tenantId: TB,
        subRole: null,
      }),
    ).toEqual({
      kind: "allow",
      assignment: asAssignment(DEV_B),
      prefix: `/${TB}`,
    });
    for (const subRole of ["development", "finance"] as const) {
      expect(
        decideTenantAddress({
          assignments,
          roleClass: "staff",
          tenantId: TB,
          subRole,
        }),
      ).toEqual({ kind: "canonical", prefix: `/${TB}` });
    }
  });

  it("acts under the named row of a person with several, never another", () => {
    expect(
      decideTenantAddress({
        assignments: live(FIN, CARE),
        roleClass: "staff",
        tenantId: TA,
        subRole: "member_care",
      }),
    ).toEqual({
      kind: "allow",
      assignment: asAssignment(CARE),
      prefix: `/${TA}~member_care`,
    });
  });

  it.each([null, "hr"] as const)(
    "sends a person with several rows to the chooser when the address names %s",
    (subRole) => {
      expect(
        decideTenantAddress({
          assignments: live(FIN, CARE),
          roleClass: "staff",
          tenantId: TA,
          subRole,
        }),
      ).toEqual({ kind: "choose", tenantId: TA });
    },
  );

  it("treats the missionary row like a one-row person", () => {
    expect(
      decideTenantAddress({
        assignments: live(FIN, MISSIONARY),
        roleClass: "missionary",
        tenantId: TA,
        subRole: "finance",
      }),
    ).toEqual({ kind: "canonical", prefix: `/${TA}` });
  });
});

describe("decideLanding: an address without a tenant", () => {
  it("enters the one organization", () => {
    expect(
      decideLanding({
        assignments: live(row(TA, "staff", "finance"), row(TB, "donor")),
        roleClass: "staff",
      }),
    ).toEqual({ kind: "enter", prefix: `/${TA}` });
  });

  it("chooses the assignment in one organization with several rows", () => {
    expect(
      decideLanding({
        assignments: live(
          row(TA, "staff", "finance"),
          row(TA, "staff", "member_care"),
        ),
        roleClass: "staff",
      }),
    ).toEqual({ kind: "choose", tenantId: TA });
  });

  it("chooses the organization when there are several", () => {
    expect(
      decideLanding({
        assignments: live(
          row(TA, "staff", "finance"),
          row(TB, "staff", "development"),
        ),
        roleClass: "staff",
      }),
    ).toEqual({ kind: "choose", tenantId: null });
  });

  it("refuses a person with no row of the class", () => {
    expect(
      decideLanding({
        assignments: live(row(TA, "donor")),
        roleClass: "staff",
      }),
    ).toEqual({ kind: "refuse" });
  });
});

describe("listAddressChoices", () => {
  it("lists one address for each row of the class, sub-roles in registry order", () => {
    const care = row(TA, "staff", "member_care");
    const fin = row(TA, "staff", "finance");
    const devB = row(TB, "staff", "development");
    const choices = listAddressChoices({
      assignments: live(care, devB, fin, row(TA, "donor")),
      roleClass: "staff",
    });
    expect(choices).toEqual([
      {
        tenantId: TA,
        assignmentId: fin.id,
        subRole: "finance",
        prefix: `/${TA}~finance`,
      },
      {
        tenantId: TA,
        assignmentId: care.id,
        subRole: "member_care",
        prefix: `/${TA}~member_care`,
      },
      {
        tenantId: TB,
        assignmentId: devB.id,
        subRole: "development",
        prefix: `/${TB}`,
      },
    ]);
    expect(
      listAddressChoices({
        assignments: live(care, devB, fin),
        roleClass: "staff",
        tenantId: TB,
      }).map((choice) => choice.prefix),
    ).toEqual([`/${TB}`]);
  });
});
