// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * WP2b acceptance (plan 12, WP2; AL-2675): "Inside Web Studio a person in two
 * organizations sees only the selected one's missionaries and funds in
 * pickers and labels." This line is shared with slice C.
 *
 * This slice's half: Web Studio's three callers of Mission Control's own API
 * (the missionary picker, the fund picker and the reference-label loader)
 * send the tenant and assignment of the document's scope, and nothing else
 * decides which organization's records they show. The scope is set here the
 * way a page sets it. Slice C's half is to render that scope in every Web
 * Studio document, from the organization its cookie selects.
 *
 * Mission Control's API stands in at the network: it answers each request
 * with the organization its `x-asym-tenant` header names, and refuses a
 * request that names none, as the resolver refuses a person in two
 * organizations who names no tenant.
 */

const USER = "00000000-0000-4000-8000-0000000e2e30";
const ORGANIZATIONS = {
  "00000000-0000-0000-0000-000000000001": {
    assignmentId: "00000000-0000-4000-8000-0000000e2e31",
    missionaries: [{ id: "m-demo", profile: { full_name: "Ada Demo" } }],
    funds: [{ id: "f-demo", name: "Demo Wells" }],
  },
  "00000000-0000-0000-0000-000000000002": {
    assignmentId: "00000000-0000-4000-8000-0000000e2e32",
    missionaries: [{ id: "m-second", profile: { full_name: "Ben Second" } }],
    funds: [{ id: "f-second", name: "Harbor Fund" }],
  },
} as const;
type TenantId = keyof typeof ORGANIZATIONS;

function missionControlApi(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const tenant = headers.get("x-asym-tenant") as TenantId | null;
  const organization = tenant ? ORGANIZATIONS[tenant] : undefined;
  if (
    !organization ||
    headers.get("x-asym-assignment") !== organization.assignmentId
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(path, "http://localhost:3030");
  if (url.pathname === "/api/admin/missionaries") {
    const offset = Number(url.searchParams.get("offset") ?? 0);
    return Response.json({
      missionaries: offset === 0 ? organization.missionaries : [],
    });
  }
  if (url.pathname === "/api/admin/funds") {
    return Response.json({ funds: organization.funds });
  }
  return Response.json({ error: "Not found" }, { status: 404 });
}

/** A new Web Studio document showing `tenant`, as slice C will render it. */
async function loadStudioDocument(tenant: TenantId) {
  cleanup();
  vi.resetModules();
  vi.stubGlobal("fetch", vi.fn(missionControlApi));
  const { DocumentScopeProvider } =
    await import("../../../../packages/database/document-scope");
  render(
    createElement(
      DocumentScopeProvider,
      {
        scope: {
          userId: USER,
          tenantId: tenant,
          assignmentId: ORGANIZATIONS[tenant].assignmentId,
          addressPrefix: "",
        },
      },
      null,
    ),
  );
  const [missionaries, funds, labels] = await Promise.all([
    import("../../../../apps/admin/src/cms-ui/web-studio/flows/studio-missionaries"),
    import("../../../../apps/admin/src/cms-ui/web-studio/flows/studio-funds"),
    import("../../../../apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/reference-labels"),
  ]);
  return { ...missionaries, ...funds, ...labels };
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Web Studio's pickers and labels for a person in two organizations", () => {
  it.each([
    [
      "00000000-0000-0000-0000-000000000001" as TenantId,
      { missionary: "Ada Demo", fund: "Demo Wells" },
      { missionary: "Ben Second", fund: "Harbor Fund" },
    ],
    [
      "00000000-0000-0000-0000-000000000002" as TenantId,
      { missionary: "Ben Second", fund: "Harbor Fund" },
      { missionary: "Ada Demo", fund: "Demo Wells" },
    ],
  ])(
    "show only the selected organization's records (%s)",
    async (tenant, shown, other) => {
      const studio = await loadStudioDocument(tenant);

      const missionaryNames = (await studio.fetchStudioMissionaries()).map(
        studio.studioMissionaryName,
      );
      const fundNames = (await studio.fetchStudioFunds()).map(
        (fund) => fund.name,
      );
      const labels = await studio.loadReferenceLabels({
        accessors: ["missionaryId", "fundId"],
      });

      expect(missionaryNames).toEqual([shown.missionary]);
      expect(fundNames).toEqual([shown.fund]);
      expect(labels.missionaryId?.map((option) => option.label)).toEqual([
        shown.missionary,
      ]);
      expect(labels.fundId?.map((option) => option.label)).toEqual([
        shown.fund,
      ]);
      const everything = JSON.stringify({ missionaryNames, fundNames, labels });
      expect(everything).not.toContain(other.missionary);
      expect(everything).not.toContain(other.fund);
    },
  );
});
