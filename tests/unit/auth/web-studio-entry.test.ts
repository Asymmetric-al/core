import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { webStudioEntryRedirect } from "../../../packages/auth/web-studio-proxy";

import type { WebStudioDecision } from "../../../packages/auth/web-studio";

/**
 * Entering Web Studio from Mission Control (council on the joined release,
 * JC3). Web Studio keeps its organization in a cookie that lasts thirty
 * days, so a link from a tenant's page names that page's tenant and row
 * (`?organization=…&assignment=…`). The proxy compares them with the
 * cookie's choice: when they agree it drops them from the address; when
 * they do not, or nothing is chosen, it sends the person to the Web Studio
 * chooser with that organization offered first. A link never sets the
 * cookie: only the chooser's form does, after its own check.
 */

const ORIGIN = "http://localhost:3030";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const ROW_A = "00000000-0000-4000-8000-0000000000a1";
const ROW_B = "00000000-0000-4000-8000-0000000000b1";

const allowedA = {
  kind: "allow",
  assignment: {
    assignmentId: ROW_A,
    userId: "00000000-0000-4000-8000-0000000000c1",
    tenantId: TA,
    revision: "r",
    membershipRole: "staff",
    staffRole: "development",
    isTenantAdmin: false,
  },
} as WebStudioDecision;

function entering(path: string) {
  const request = new NextRequest(`${ORIGIN}${path}`);
  return (decision: WebStudioDecision) =>
    webStudioEntryRedirect(request, request.nextUrl.pathname, decision)?.href ??
    null;
}

describe("a link into Web Studio that names an organization", () => {
  it("changes nothing for an address that names none", () => {
    expect(
      entering("/web-studio/collections/pages?limit=10")(allowedA),
    ).toBeNull();
  });

  it("drops the names once they agree with the cookie's choice", () => {
    expect(
      entering(
        `/web-studio/collections/pages?limit=10&organization=${TA}&assignment=${ROW_A}`,
      )(allowedA),
    ).toBe(`${ORIGIN}/web-studio/collections/pages?limit=10`);
  });

  it.each([
    ["another organization", TB, ROW_B],
    ["another row of the same organization", TA, ROW_B],
    ["a tenant without its row", TB, ""],
  ])(
    "sends a link from %s to the chooser, offering it first, and switches nothing",
    (_label, tenant, row) => {
      const search = new URLSearchParams({ limit: "10", organization: tenant });
      if (row) search.set("assignment", row);
      expect(
        entering(`/web-studio/collections/pages?${search}`)(allowedA),
      ).toBe(
        `${ORIGIN}/web-studio/organization?next=${encodeURIComponent("/web-studio/collections/pages?limit=10")}&from=${tenant}`,
      );
    },
  );

  it("offers that organization first when nothing is chosen yet", () => {
    expect(
      entering(`/web-studio?organization=${TB}&assignment=${ROW_B}`)({
        kind: "choose",
      }),
    ).toBe(`${ORIGIN}/web-studio/organization?next=%2Fweb-studio&from=${TB}`);
  });

  it("leaves a person with no staff row to the proxy's refusal", () => {
    expect(
      entering(`/web-studio?organization=${TB}&assignment=${ROW_B}`)({
        kind: "refuse",
      }),
    ).toBeNull();
  });

  it("never offers a value that is not a tenant id", () => {
    expect(
      entering(`/web-studio?organization=..%2Fevil&assignment=${ROW_B}`)(
        allowedA,
      ),
    ).toBe(`${ORIGIN}/web-studio/organization?next=%2Fweb-studio`);
  });
});
