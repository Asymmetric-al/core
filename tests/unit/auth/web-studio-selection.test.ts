import { describe, expect, it } from "vitest";

import {
  WEB_STUDIO_TENANT_COOKIE,
  clearedWebStudioCookie,
  decideWebStudioAccess,
  isWebStudioApiPath,
  isWebStudioPath,
  readWebStudioCookie,
  signWebStudioSelection,
  webStudioCookie,
  webStudioResolveInput,
} from "../../../packages/auth/web-studio";

import type { ActiveAssignment } from "../../../packages/auth/principal/types";

/**
 * The Web Studio tenant cookie (plan 5.2, "One stated exception: Web Studio";
 * AL-2675, WP2b slice C). It carries the tenant and the chosen membership row
 * and nothing else, signed, and only narrows: whatever it names is checked
 * against the person's live rows on every request.
 */

const SECRET = "test-payload-secret-for-the-web-studio-cookie";
const USER = "00000000-0000-4000-8000-0000000000c1";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";

function row(
  id: string,
  tenantId: string,
  membershipRole: ActiveAssignment["membershipRole"] = "staff",
): ActiveAssignment {
  return {
    assignmentId: id,
    userId: USER,
    tenantId,
    revision: "2026-11-18T00:00:00Z",
    membershipRole,
    staffRole: membershipRole === "staff" ? "development" : null,
    isTenantAdmin: false,
  };
}

const A = row("00000000-0000-4000-8000-0000000000a1", TA);
const B = row("00000000-0000-4000-8000-0000000000b1", TB);
const DONOR_B = row("00000000-0000-4000-8000-0000000000b2", TB, "donor");

describe("the signed cookie", () => {
  it("round-trips the tenant and the assignment, and nothing else", async () => {
    const value = await signWebStudioSelection(
      { tenantId: TA, assignmentId: A.assignmentId },
      SECRET,
    );
    expect(value.split(".")).toHaveLength(4);
    expect(value).not.toContain(USER);
    await expect(readWebStudioCookie(value, SECRET)).resolves.toEqual({
      kind: "selected",
      selection: { tenantId: TA, assignmentId: A.assignmentId },
    });
  });

  it("reads a forged, altered or foreign-key value as unusable, never as a selection", async () => {
    const value = await signWebStudioSelection(
      { tenantId: TA, assignmentId: A.assignmentId },
      SECRET,
    );
    const [version, , assignment, signature] = value.split(".");
    const retargeted = [version, TB, assignment, signature].join(".");
    const flipped = value.slice(0, -2) + (value.endsWith("A") ? "BB" : "AA");
    for (const forged of [
      retargeted,
      flipped,
      `${version}.${TA}.${assignment}`,
      `v2.${TA}.${assignment}.${signature}`,
      `${value}.extra`,
      "not-a-cookie",
      `v1.${TA}.${assignment!.toUpperCase()}.${signature}`,
    ]) {
      await expect(readWebStudioCookie(forged, SECRET)).resolves.toEqual({
        kind: "unusable",
      });
    }
    await expect(
      readWebStudioCookie(value, `${SECRET}-rotated`),
    ).resolves.toEqual({ kind: "unusable" });
  });

  it("reads a missing or cleared cookie as absent", async () => {
    for (const value of [undefined, null, ""]) {
      await expect(readWebStudioCookie(value, SECRET)).resolves.toEqual({
        kind: "absent",
      });
    }
  });

  it("refuses to sign anything but canonical ids, or without a key", async () => {
    await expect(
      signWebStudioSelection(
        { tenantId: "acme", assignmentId: A.assignmentId },
        SECRET,
      ),
    ).rejects.toThrow(/canonical/);
    await expect(
      signWebStudioSelection(
        { tenantId: TA, assignmentId: A.assignmentId },
        "",
      ),
    ).rejects.toThrow(/key/);
  });

  it("is HttpOnly, SameSite=Strict and scoped to /web-studio, so Mission Control's /api never receives it", () => {
    expect(webStudioCookie("v", { secure: true })).toEqual({
      name: WEB_STUDIO_TENANT_COOKIE,
      value: "v",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      path: "/web-studio",
      maxAge: 60 * 60 * 24 * 30,
    });
    expect(clearedWebStudioCookie({ secure: false })).toEqual({
      name: WEB_STUDIO_TENANT_COOKIE,
      value: "",
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      path: "/web-studio",
      maxAge: 0,
    });
  });
});

describe("Web Studio paths", () => {
  it("knows Web Studio and its REST routes, and nothing that only starts like them", () => {
    expect(isWebStudioPath("/web-studio")).toBe(true);
    expect(isWebStudioPath("/web-studio/collections/pages")).toBe(true);
    expect(isWebStudioPath("/web-studio-old")).toBe(false);
    expect(isWebStudioPath("/api/web-studio")).toBe(false);
    // Only the prefix with its slash: no API route serves the bare path,
    // which falls to the page route and its gate (council C5).
    expect(isWebStudioApiPath("/web-studio/api")).toBe(false);
    expect(isWebStudioApiPath("/web-studio/api/pages/1")).toBe(true);
    expect(isWebStudioApiPath("/web-studio/apis")).toBe(false);
    expect(isWebStudioApiPath("/web-studio")).toBe(false);
    expect(isWebStudioApiPath("/api/pages")).toBe(false);
  });
});

describe("who may open Web Studio", () => {
  const selected = (assignmentId: string, tenantId: string) =>
    ({ kind: "selected", selection: { tenantId, assignmentId } }) as const;

  it("needs no choice from a person with one staff row", () => {
    expect(
      decideWebStudioAccess({
        assignments: [A, DONOR_B],
        cookie: { kind: "absent" },
      }),
    ).toEqual({ kind: "allow", assignment: A });
  });

  it("asks a person with staff rows in two organizations to choose, and never picks the first", () => {
    expect(
      decideWebStudioAccess({
        assignments: [A, B],
        cookie: { kind: "absent" },
      }),
    ).toEqual({ kind: "choose" });
  });

  it("acts under the row the cookie names when the person holds it live", () => {
    expect(
      decideWebStudioAccess({
        assignments: [A, B],
        cookie: selected(B.assignmentId, TB),
      }),
    ).toEqual({ kind: "allow", assignment: B });
  });

  it("selects nothing with a cookie that names a row the person does not hold, a row of another class or a tenant the row is not in", () => {
    for (const cookie of [
      selected("00000000-0000-4000-8000-0000000000ff", TA),
      selected(DONOR_B.assignmentId, TB),
      selected(A.assignmentId, TB),
      { kind: "unusable" } as const,
    ]) {
      // One staff row left is no licence to fall back to it: the cookie
      // named something else, so the person chooses again.
      expect(
        decideWebStudioAccess({ assignments: [A, DONOR_B], cookie }),
      ).toEqual({
        kind: "choose",
      });
    }
  });

  it("refuses a person with no staff row, whatever the cookie says", () => {
    for (const cookie of [
      { kind: "absent" } as const,
      { kind: "unusable" } as const,
      selected(DONOR_B.assignmentId, TB),
    ]) {
      expect(decideWebStudioAccess({ assignments: [DONOR_B], cookie })).toEqual(
        {
          kind: "refuse",
        },
      );
    }
  });

  it("hands the resolver the cookie's row and tenant as proposals, and denies an unusable cookie outright", () => {
    expect(webStudioResolveInput({ kind: "absent" })).toEqual({
      ok: true,
      roleClass: "staff",
    });
    expect(webStudioResolveInput(selected(B.assignmentId, TB))).toEqual({
      ok: true,
      roleClass: "staff",
      proposedAssignmentId: B.assignmentId,
      expectedTenantId: TB,
    });
    expect(webStudioResolveInput({ kind: "unusable" })).toEqual({ ok: false });
  });
});
