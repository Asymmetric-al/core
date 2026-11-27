import { describe, expect, it } from "vitest";

import { decodeCrmRelationshipCursor } from "../../../../packages/api/src/admin/crm/relationships/query";
import { listMissionControlCrmRelationships } from "../../../../packages/api/src/admin/crm/relationships/service";
import { ApiHttpError } from "../../../../packages/api/src/shared/api-http-error";

import type { ActorContext } from "../../../../packages/api/src/crm/types";
import type { CrmRelationshipDomain } from "../../../../packages/database/types/crm-relationships";

/**
 * AL-2678 (WP5 rest, r6; ruling WP5 part 2 Q11): the relationships list is
 * one answer of public.crm_relationships_page on the caller's token, which
 * builds, filters, counts, sorts and pages the rows and reports over the
 * whole authorized set in Postgres. What the Node model guaranteed before
 * (people, households, churches, organizations, workers, pledges, care
 * activity, duplicates, commitments) is proved on the real stack in
 * tests/unit/acceptance/issue-2678/crm-pages.realstack.acceptance.test.ts,
 * the routes' paging past 1,000 and the care gate in its PostgREST suite.
 */
const TENANT_A = "11111111-1111-4111-8111-111111111111";
const OTHER_TENANT = "33333333-3333-4333-8333-333333333333";

const params = {
  cursor: { offset: 0 },
  limit: 50,
  search: null,
  sort: { field: "updatedAt" as const, direction: "desc" as const },
  domains: [] as CrmRelationshipDomain[],
};

function actor(overrides: Partial<ActorContext> = {}): ActorContext {
  return {
    userId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    profileId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    tenantId: TENANT_A,
    authTenantId: TENANT_A,
    role: "admin",
    isTenantAdministrator: false,
    action: "crm.relationship.read",
    ...overrides,
  };
}

const REPORT = {
  activeCommitments: {
    monthlyByCurrency: [],
    pledgeCount: 0,
    unknownFrequencyCount: 0,
  },
  domainCounts: {
    activity: 0,
    churches: 0,
    households: 0,
    organizations: 0,
    people: 2,
    pledges: 0,
  },
  duplicateCompanyCandidates: 0,
  duplicatePersonCandidates: 0,
  excludedCareActivityCount: 0,
  householdCount: 0,
  recentActivityCount: 0,
  totalRows: 2,
};

function pageClient(answer: { data: unknown; error: unknown }) {
  const calls: [string, Record<string, unknown>][] = [];
  return {
    calls,
    supabase: {
      rpc: async (fn: string, args: Record<string, unknown>) => {
        calls.push([fn, args]);
        return answer;
      },
      from: () => {
        throw new Error("The list reads no table directly");
      },
    } as never,
  };
}

describe("CRM relationships through crm_relationships_page", () => {
  it("passes the actor's tenant, the search, the domains, the sort and the page, and returns the page, its total and the report with the source notes", async () => {
    const row = { id: "person:d-1", displayName: "Jordan Lee" };
    const { calls, supabase } = pageClient({
      data: { totalCount: 2, rows: [row], report: REPORT },
      error: null,
    });

    const result = await listMissionControlCrmRelationships({
      actor: actor(),
      supabase,
      params: {
        ...params,
        cursor: { offset: 0 },
        limit: 1,
        search: "jordan",
        domains: ["people", "pledges"],
        sort: { field: "displayName", direction: "asc" },
      },
      now: "2026-11-26T00:00:00.000Z",
    });

    expect(calls).toEqual([
      [
        "crm_relationships_page",
        {
          p_tenant_id: TENANT_A,
          p_search: "jordan",
          p_domains: ["people", "pledges"],
          p_sort: "displayName",
          p_descending: false,
          p_offset: 0,
          p_limit: 1,
          p_now: "2026-11-26T00:00:00.000Z",
        },
      ],
    ]);
    expect(result.mode).toBe("local");
    expect(result.rows).toEqual([row]);
    expect(result.totalCount).toBe(2);
    expect(result.hasMore).toBe(true);
    expect(decodeCrmRelationshipCursor(result.nextCursor)).toEqual({
      offset: 1,
    });
    expect(result.report).toMatchObject(REPORT);
    expect(result.report.sourceSystems.crm).toContain("Asym Postgres");
    expect(result.report.sourceSystems.crm).not.toContain("Twenty");
    expect(result.report.sourceSystems.care).toMatch(/always left out/i);
    expect(result.filters).toEqual({
      domains: ["people", "pledges"],
      search: "jordan",
    });
  });

  it("ends the list at the filtered total", async () => {
    const { supabase } = pageClient({
      data: { totalCount: 1, rows: [{ id: "person:d-1" }], report: REPORT },
      error: null,
    });

    const result = await listMissionControlCrmRelationships({
      actor: actor(),
      supabase,
      params,
    });

    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeNull();
  });

  it("rejects a tenant mismatch for non-super-admin actors before any read", async () => {
    const { calls, supabase } = pageClient({ data: null, error: null });

    await expect(
      listMissionControlCrmRelationships({
        actor: actor({ tenantId: OTHER_TENANT }),
        supabase,
        params,
      }),
    ).rejects.toBeInstanceOf(ApiHttpError);
    expect(calls).toEqual([]);
  });

  it("answers 500, not an empty list, when the page read fails or is malformed", async () => {
    for (const answer of [
      { data: null, error: { message: "denied" } },
      { data: { totalCount: "x", rows: null }, error: null },
    ])
      await expect(
        listMissionControlCrmRelationships({
          actor: actor(),
          supabase: pageClient(answer).supabase,
          params,
        }),
      ).rejects.toMatchObject({ status: 500 });
  });
});
