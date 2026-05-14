import { describe, expect, it, vi } from "vitest";

import {
  buildHouseholdMembershipKey,
  normalizeTwentyRelationshipResponse,
} from "../../../../packages/api/src/admin/crm/relationships/model";
import { listMissionControlCrmRelationships } from "../../../../packages/api/src/admin/crm/relationships/service";

import type { ActorContext } from "../../../../packages/api/src/crm/types";

const actor: ActorContext = {
  action: "crm.relationship.read",
  authTenantId: "tenant-1",
  isSuperAdmin: false,
  profileId: "profile-1",
  role: "staff",
  tenantId: "tenant-1",
  userId: "user-1",
};

const params = {
  cursor: null,
  domains: [],
  limit: 50,
  search: null,
  sort: {
    direction: "desc" as const,
    field: "updatedAt" as const,
  },
};

describe("CRM relationship expansion", () => {
  it("searches expanded relationship domains without leaking cross-tenant rows", async () => {
    const recordsByObject = {
      churches: {
        data: {
          churches: [
            {
              asymTenantId: "tenant-1",
              id: "church-1",
              name: "Antioch Church",
              updatedAt: "2026-05-06T10:00:00.000Z",
            },
            {
              asymTenantId: "tenant-2",
              id: "church-2",
              name: "Antioch Church Other Tenant",
              updatedAt: "2026-05-06T10:00:00.000Z",
            },
          ],
        },
      },
      companies: {
        data: {
          companies: [
            {
              asymTenantId: "tenant-1",
              id: "company-1",
              name: "Antioch Church",
              organizationKind: "church",
              updatedAt: "2026-05-05T10:00:00.000Z",
            },
            {
              asymTenantId: "tenant-1",
              id: "company-2",
              name: "Partner Agency",
              organizationKind: "agency",
              updatedAt: "2026-05-04T10:00:00.000Z",
            },
          ],
        },
      },
      households: {
        data: {
          households: [
            {
              asymTenantId: "tenant-1",
              id: "household-1",
              members: [{ id: "person-b" }, { id: "person-a" }],
              name: "Rivera Household",
              updatedAt: "2026-05-03T10:00:00.000Z",
            },
          ],
        },
      },
      ministryActivities: {
        data: {
          ministryActivities: [
            {
              activityKind: "meeting",
              asymTenantId: "tenant-1",
              id: "activity-1",
              occurredAt: "2026-05-08T10:00:00.000Z",
              title: "Partner lunch",
              updatedAt: "2026-05-08T10:00:00.000Z",
            },
            {
              activityKind: "private care note",
              asymTenantId: "tenant-1",
              id: "activity-care",
              title: "Care plan follow-up",
              updatedAt: "2026-05-08T10:00:00.000Z",
            },
          ],
        },
      },
      people: {
        data: {
          people: [
            {
              asymTenantId: "tenant-1",
              fullName: "Avery Donor",
              id: "person-1",
              primaryEmail: "avery@example.test",
              updatedAt: "2026-05-02T10:00:00.000Z",
            },
          ],
        },
      },
      relationshipCommitments: {
        data: {
          relationshipCommitments: [
            {
              amount: 2500,
              asymPledgeId: "pledge-1",
              asymTenantId: "tenant-1",
              currency: "USD",
              donorName: "Avery Donor",
              frequency: "monthly",
              fundName: "Mission Fund",
              id: "commitment-1",
              status: "active",
              stripePaymentIntentId: "pi_should_not_be_projected",
              updatedAt: "2026-05-07T10:00:00.000Z",
            },
          ],
        },
      },
    };
    const coreClient = {
      listRecords: vi.fn(async (objectName: keyof typeof recordsByObject) => {
        return recordsByObject[objectName];
      }),
    };

    const response = await listMissionControlCrmRelationships({
      actor,
      coreClient,
      env: {
        TWENTY_API_KEY: "secret",
        TWENTY_API_URL: "https://twenty.example.test/rest",
      },
      params: {
        ...params,
        search: "antioch",
        sort: {
          direction: "asc",
          field: "displayName",
        },
      },
    });

    expect(response.mode).toBe("twenty");
    expect(response.rows.map((row) => row.displayName)).toEqual([
      "Antioch Church",
    ]);
    expect(response.rows[0]?.twentyObjectName).toBe("churches");
    expect(response.report.duplicateCompanyCandidates).toBe(1);
    expect(response.report.excludedCareActivityCount).toBe(1);
    expect(coreClient.listRecords).toHaveBeenCalledWith(
      "churches",
      expect.objectContaining({
        filter: expect.stringContaining("tenant-1"),
        orderBy: "updatedAt:desc",
        search: "antioch",
      }),
    );
  });

  it("returns a safe not-configured response without requiring Twenty credentials", async () => {
    const response = await listMissionControlCrmRelationships({
      actor,
      params,
    });

    expect(response).toMatchObject({
      configured: false,
      missing: ["TWENTY_API_URL", "TWENTY_API_KEY"],
      mode: "not_configured",
      rows: [],
    });
    expect(response.report.sourceSystems.finance).toContain(
      "Asym owns payment execution",
    );
  });

  it("keeps relationship commitments separate from payment truth", () => {
    const rows = normalizeTwentyRelationshipResponse(
      "relationshipCommitments",
      {
        relationshipCommitments: [
          {
            amount: 1000,
            asymTenantId: "tenant-1",
            currency: "USD",
            donorName: "Jordan Donor",
            id: "commitment-1",
            paymentStatus: "succeeded",
            receiptId: "receipt-1",
          },
        ],
      },
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      authorityScope: "finance_summary",
      commitmentAmountCents: 1000,
      domain: "pledges",
      sourceSystem: "Asym finance summary",
    });
    expect(JSON.stringify(rows[0])).not.toContain("receipt-1");
    expect(JSON.stringify(rows[0])).not.toContain("succeeded");
  });

  it("derives deterministic household membership keys", () => {
    expect(
      buildHouseholdMembershipKey({
        members: [{ id: "person-c" }, { id: "person-a" }, { id: "person-c" }],
      }),
    ).toBe("household-members:person-a+person-c");
  });
});
