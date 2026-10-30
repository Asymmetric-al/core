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
  pickDefaultAssignment,
  resolveActiveAssignment,
  resolveActivePrincipal,
} from "../../../../../packages/api/src/principal/assignment";

import type { AssignmentRow } from "../../../../../packages/api/src/principal/types";

const ok = (r: AssignmentRow, selection: string) => ({
  ok: true,
  assignment: asAssignment(r),
  selection,
});
const no = (reason: string) => ({ ok: false, reason });

describe("resolveActiveAssignment: proposals (rules 2 and 4)", () => {
  const STAFF = row(TA, "staff", "finance");
  const DONOR_TB = row(TB, "donor");

  it("accepts an owned, active proposal as 'proposed'", async () => {
    const reader = fakeReader([STAFF, DONOR_TB]);
    await expect(
      resolveActiveAssignment(
        { userId: U1, proposedAssignmentId: DONOR_TB.id },
        reader,
      ),
    ).resolves.toEqual(ok(DONOR_TB, "proposed"));
    expect(reader.calls).toBe(1);
  });

  it.each([
    ["a random id", row(TA, "donor").id],
    ["another user's id", row(TA, "donor", null, U2).id],
    ["an inactive id (absent from the active rows)", row(TB, "missionary").id],
  ])("denies %s as not_owned_or_inactive", async (_name, proposed) => {
    await expect(
      resolveActiveAssignment(
        { userId: U1, proposedAssignmentId: proposed },
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
          { userId: U1, proposedAssignmentId: proposed },
          reader,
        ),
      ).resolves.toEqual(no("not_owned_or_inactive"));
      expect(reader.calls).toBe(0);
    },
  );

  it("denies a proposal outside expectedTenantId as tenant_mismatch", async () => {
    await expect(
      resolveActiveAssignment(
        { userId: U1, proposedAssignmentId: STAFF.id, expectedTenantId: TB },
        fakeReader([STAFF, DONOR_TB]),
      ),
    ).resolves.toEqual(no("tenant_mismatch"));
  });

  it("lets a proposal override the staff default (17i)", async () => {
    const donor = row(TA, "donor");
    await expect(
      resolveActiveAssignment(
        { userId: U1, proposedAssignmentId: donor.id },
        fakeReader([STAFF, donor]),
      ),
    ).resolves.toEqual(ok(donor, "proposed"));
  });
});

describe("resolveActiveAssignment: reader failures and malformed rows (rules 1 and 3)", () => {
  it.each(["u1", "", TA.toUpperCase()])(
    "a non-canonical userId %j is reader_error with no read",
    async (userId) => {
      const reader = fakeReader([row(TA, "donor")]);
      await expect(
        resolveActiveAssignment({ userId }, reader),
      ).resolves.toEqual(no("reader_error"));
      expect(reader.calls).toBe(0);
    },
  );

  it.each([new Error("rpc down"), "string rejection", null])(
    "a reader rejection (%s) is reader_error, never a throw",
    async (error) => {
      await expect(
        resolveActiveAssignment({ userId: U1 }, failingReader(error)),
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
        resolveActiveAssignment({ userId: U1 }, reader),
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
          { userId: U1 },
          { userId: U1, proposedAssignmentId: valid.id },
          { userId: U1, expectedTenantId: TA },
        ]) {
          await expect(
            resolveActiveAssignment(input, fakeReader(rows)),
          ).resolves.toEqual(no("reader_error"));
        }
      }
    },
  );
});

describe("resolveActiveAssignment: default selection (rule 5, criterion 17 S)", () => {
  const D = row(TA, "donor");
  const M = row(TA, "missionary");
  const S1 = row(TA, "staff", "finance");
  const S2 = row(TA, "staff", "member_care");
  const DB = row(TB, "donor");
  const SB = row(TB, "staff", "hr");

  it.each<[string, AssignmentRow[], { expectedTenantId?: string }, unknown]>([
    ["0 rows → no_assignment", [], {}, no("no_assignment")],
    ["1 row → sole", [M], {}, ok(M, "sole")],
    [
      "expectedTenantId TA over TA+TB → the TA row, sole",
      [S1, DB],
      { expectedTenantId: TA },
      ok(S1, "sole"),
    ],
    [
      "expectedTenantId with no row → no_assignment",
      [S1, DB],
      { expectedTenantId: TC },
      no("no_assignment"),
    ],
    [
      "(a) staff + donor → staff, default_staff",
      [S1, D],
      {},
      ok(S1, "default_staff"),
    ],
    [
      "(b) staff + missionary → staff, default_staff",
      [M, S1],
      {},
      ok(S1, "default_staff"),
    ],
    [
      "(c) staff + donor + missionary → staff, default_staff",
      [D, S1, M],
      {},
      ok(S1, "default_staff"),
    ],
    [
      "(d) case (a) reversed → the same row",
      [D, S1],
      {},
      ok(S1, "default_staff"),
    ],
    ["(e) two staff roles → ambiguous", [S1, S2], {}, no("ambiguous")],
    ["(e') two staff + donor → ambiguous", [S1, D, S2], {}, no("ambiguous")],
    ["(f) donor + missionary → ambiguous", [D, M], {}, no("ambiguous")],
    ["(g) staff TA + donor TB → ambiguous (5a)", [S1, DB], {}, no("ambiguous")],
    [
      "(g') staff in both tenants → ambiguous (5a)",
      [S1, SB],
      {},
      no("ambiguous"),
    ],
    [
      "(h) case (g) narrowed to TB → the donor row, sole",
      [S1, DB],
      { expectedTenantId: TB },
      ok(DB, "sole"),
    ],
    [
      "narrowed to TA with staff + donor + a TB row → default_staff",
      [DB, D, S1],
      { expectedTenantId: TA },
      ok(S1, "default_staff"),
    ],
  ])("%s", async (_name, rows, extra, want) => {
    await expect(
      resolveActiveAssignment({ userId: U1, ...extra }, fakeReader(rows)),
    ).resolves.toEqual(want);
  });

  it("pickDefaultAssignment needs exactly one tenant and exactly one staff row", () => {
    const a = (r: AssignmentRow) => asAssignment(r);
    expect(pickDefaultAssignment([a(D), a(S1)])).toEqual(a(S1));
    expect(pickDefaultAssignment([a(S1), a(S2)])).toBeNull();
    expect(pickDefaultAssignment([a(D), a(M)])).toBeNull();
    expect(pickDefaultAssignment([a(S1), a(DB)])).toBeNull();
    expect(pickDefaultAssignment([])).toBeNull();
  });
});

describe("resolveActiveAssignment: no default tenant, no cache (criteria 4 and 5)", () => {
  it("a super_admin profile with a NULL tenant and no membership gets no_assignment and no tenant", async () => {
    const res = await resolveActiveAssignment({ userId: U1 }, fakeReader([]));
    expect(res).toEqual(no("no_assignment"));
    expect(JSON.stringify(res)).not.toMatch(/tenant/i);
  });

  it("re-reads on every call: a membership deactivated between calls denies the second", async () => {
    const staff = row(TA, "staff", "finance");
    const reader = fakeReader([staff], []);
    const input = { userId: U1, proposedAssignmentId: staff.id };
    await expect(resolveActiveAssignment(input, reader)).resolves.toEqual(
      ok(staff, "proposed"),
    );
    await expect(resolveActiveAssignment(input, reader)).resolves.toEqual(
      no("not_owned_or_inactive"),
    );
    expect(reader.calls).toBe(2);
  });

  it("returns staffRole null (not undefined) for non-staff rows, and a frozen assignment", async () => {
    const res = await resolveActiveAssignment(
      { userId: U1 },
      fakeReader([row(TA, "donor")]),
    );
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.assignment.staffRole).toBeNull();
    expect(Object.isFrozen(res.assignment)).toBe(true);
  });
});

describe("resolveActivePrincipal", () => {
  it("returns a human principal for the resolved hat", async () => {
    const staff = row(TA, "staff", "finance");
    await expect(
      resolveActivePrincipal(
        { userId: U1 },
        undefined,
        fakeReader([staff, row(TA, "donor")]),
      ),
    ).resolves.toEqual({
      kind: "human",
      userId: U1,
      activeAssignment: asAssignment(staff),
    });
  });

  it.each<[string, string | undefined, AssignmentRow[], string]>([
    ["no rows", undefined, [], "no_assignment"],
    [
      "two tenants",
      undefined,
      [row(TA, "donor"), row(TB, "donor")],
      "ambiguous",
    ],
    [
      "a foreign proposal",
      row(TA, "donor", null, U2).id,
      [row(TA, "donor")],
      "not_owned_or_inactive",
    ],
  ])(
    "throws PrincipalDeniedError on %s",
    async (_name, proposed, rows, reason) => {
      const err = await resolveActivePrincipal(
        { userId: U1 },
        proposed,
        fakeReader(rows),
      ).catch((e: unknown) => e);
      expect(err).toBeInstanceOf(PrincipalDeniedError);
      expect((err as PrincipalDeniedError).reason).toBe(reason);
    },
  );
});
