import { describe, expect, it } from "vitest";

import { listMissionControlCrmProjectionShadow } from "../../../../packages/api/src/admin/crm/projections/service";
import {
  CRM_PROJECTION_CONTRACTS,
  buildCrmProjectionShadowReport,
  buildCrmProjectionShadowRows,
  createSupabaseCrmProjectionStore,
} from "../../../../packages/api/src/crm/projections";

import type { CrmProjectionStore } from "../../../../packages/api/src/crm/projections";
import type { ActorContext } from "../../../../packages/api/src/crm/types";
import type {
  CrmProjectionState,
  CrmProjectionTargetSurface,
} from "../../../../packages/database/types";

const actor: ActorContext = {
  action: "crm.projection.read",
  authTenantId: "tenant-1",
  isSuperAdmin: false,
  profileId: "profile-1",
  role: "staff",
  tenantId: "tenant-1",
  userId: "user-1",
};

function projectionState(
  overrides: Partial<CrmProjectionState>,
): CrmProjectionState {
  return {
    crmRecordLinkId: null,
    id: "state-1",
    lastError: null,
    lastProjectedAt: "2026-05-08T00:00:00.000Z",
    metadata: {},
    projectedHash: "hash-1",
    projectionName: "donor_crm_detail",
    sourceEntityId: "source-1",
    sourceEntityType: "donor",
    sourceHash: "hash-1",
    sourceSystem: "asym",
    syncStatus: "synced",
    targetSurface: "donor",
    tenantId: "tenant-1",
    twentyObjectName: "people",
    twentyRecordId: "person-1",
    updatedAt: "2026-05-08T00:00:00.000Z",
    ...overrides,
  };
}

class MemoryProjectionStore implements CrmProjectionStore {
  constructor(private readonly states: CrmProjectionState[]) {}

  async listProjectionStates() {
    return this.states;
  }

  async upsertProjectionState() {
    throw new Error("not needed");
  }

  async markProjectionStateForReplay() {
    throw new Error("not needed");
  }
}

function makeFakeSupabaseProjectionClient() {
  const rows: Record<string, unknown>[] = [];

  return {
    rows,
    client: {
      from(table: string) {
        expect(table).toBe("crm_projection_state");

        return {
          select() {
            return this;
          },
          eq(column: string, value: unknown) {
            Object.assign(this, { filter: { column, value } });
            return this;
          },
          order() {
            return this;
          },
          upsert(row: Record<string, unknown>) {
            rows.push({
              id: "projection-state-1",
              created_at: "2026-05-08T00:00:00.000Z",
              ...row,
            });
            return this;
          },
          update(patch: Record<string, unknown>) {
            Object.assign(rows[0] ?? {}, patch);
            return this;
          },
          async single() {
            return { data: rows[0] ?? null, error: null };
          },
          async maybeSingle() {
            return { data: rows[0] ?? null, error: null };
          },
          then(resolve: (value: unknown) => void) {
            resolve({ data: rows, error: null });
          },
        };
      },
    },
  };
}

describe("CRM Phase 06 projections and shadow mode", () => {
  it("defines role-scoped shadow contracts for donor, missionary, CMS, event, and reporting contexts", () => {
    expect(
      Array.from(
        new Set(
          CRM_PROJECTION_CONTRACTS.map((contract) => contract.targetSurface),
        ),
      ).sort(),
    ).toEqual(["cms", "donor", "event", "missionary", "reporting"]);

    for (const contract of CRM_PROJECTION_CONTRACTS) {
      expect(contract.shadowMode).toEqual({
        enabled: true,
        userVisibleDependency: false,
      });
      expect(contract.sourceOwnership.crm).toContain("CRM");
      expect(contract.sourceOwnership.asym).toContain("Asym");
      expect(contract.rollback.disableProjectionName).toBe(
        contract.projectionName,
      );
    }

    const donor = CRM_PROJECTION_CONTRACTS.find(
      (contract) => contract.projectionName === "donor_crm_detail",
    );
    const missionary = CRM_PROJECTION_CONTRACTS.find(
      (contract) => contract.projectionName === "missionary_crm_detail",
    );
    const projectFund = CRM_PROJECTION_CONTRACTS.find(
      (contract) => contract.projectionName === "project_fund_crm_detail",
    );

    expect(donor?.allowedRoles).toEqual(["donor"]);
    expect(donor?.blockedFields.join(" ")).toContain("staff-only");
    expect(donor?.blockedFields.join(" ")).toContain("payment processor");
    expect(missionary?.allowedRoles).toEqual(["missionary"]);
    expect(missionary?.blockedFields.join(" ")).toContain("tenant-wide");
    expect(projectFund?.sourceOwnership.asym).toContain("CMS publish state");
    expect(projectFund?.blockedFields.join(" ")).toContain(
      "CMS publish controls",
    );
  });

  it("builds shadow rows with drift, parity, duplicate, and rollback evidence", () => {
    const rows = buildCrmProjectionShadowRows({
      now: new Date("2026-05-08T12:00:00.000Z"),
      states: [
        projectionState({ id: "donor-ok" }),
        projectionState({
          id: "missionary-missing",
          projectedHash: null,
          projectionName: "missionary_crm_detail",
          sourceEntityType: "missionary",
          syncStatus: "pending",
          targetSurface: "missionary",
          twentyRecordId: null,
        }),
        projectionState({
          id: "cms-stale",
          projectionName: "cms_linkage_status",
          sourceEntityType: "cms_page",
          syncStatus: "stale",
          targetSurface: "cms",
          updatedAt: "2026-05-07T00:00:00.000Z",
        }),
        projectionState({
          id: "event-failed",
          lastError: "event_scope_mismatch",
          projectionName: "event_attendee_crm_context",
          sourceEntityType: "event_attendee",
          syncStatus: "failed",
          targetSurface: "event",
        }),
        projectionState({
          id: "reporting-conflict",
          metadata: { duplicateCandidates: 2 },
          projectedHash: "hash-2",
          projectionName: "relationship_reporting_context",
          sourceEntityType: "relationship_report",
          targetSurface: "reporting",
        }),
      ],
    });

    const byName = new Map(rows.map((row) => [row.projectionName, row]));
    expect(byName.get("donor_crm_detail")?.driftStatus).toBe("healthy");
    expect(byName.get("missionary_crm_detail")?.driftStatus).toBe("missing");
    expect(byName.get("cms_linkage_status")?.driftStatus).toBe("stale");
    expect(byName.get("event_attendee_crm_context")?.driftStatus).toBe(
      "failed",
    );
    expect(byName.get("project_fund_crm_detail")?.driftStatus).toBe("missing");
    expect(byName.get("relationship_reporting_context")?.driftStatus).toBe(
      "conflicting",
    );
    expect(
      byName.get("relationship_reporting_context")?.counts.duplicateCandidates,
    ).toBe(2);
    expect(
      byName.get("relationship_reporting_context")?.shadowMode
        .userVisibleDependency,
    ).toBe(false);

    const report = buildCrmProjectionShadowReport(rows);
    expect(report).toMatchObject({
      duplicateCandidates: 2,
      driftedProjections: 5,
      failedRecords: 1,
      sourceRecords: 5,
      totalProjections: 6,
    });
  });

  it("filters Mission Control projection shadow rows by target surface and search", async () => {
    const response = await listMissionControlCrmProjectionShadow({
      actor,
      params: {
        search: "attendee",
        targetSurfaces: ["event"],
      },
      store: new MemoryProjectionStore([]),
    });

    expect(response.rows.map((row) => row.projectionName)).toEqual([
      "event_attendee_crm_context",
    ]);
    expect(response.rollback.hidePath).toBe("/crm/projections");
    expect(response.rollback.disableAllProjectionNames).toContain(
      "event_attendee_crm_context",
    );
  });

  it("stores projection state and can mark it for replay", async () => {
    const fake = makeFakeSupabaseProjectionClient();
    const store = createSupabaseCrmProjectionStore(fake.client);

    const stored = await store.upsertProjectionState({
      metadata: {
        duplicateCandidates: 1,
        sourceOwnership: "Asym owns donor identity and finance truth.",
      },
      projectionName: "donor_crm_detail",
      projectedHash: "hash-1",
      sourceEntityId: "donor-1",
      sourceEntityType: "donor",
      sourceHash: "hash-1",
      syncStatus: "synced",
      targetSurface: "donor" as CrmProjectionTargetSurface,
      tenantId: "tenant-1",
      twentyObjectName: "people",
      twentyRecordId: "person-1",
    });

    expect(stored).toMatchObject({
      projectionName: "donor_crm_detail",
      syncStatus: "synced",
      targetSurface: "donor",
    });

    await store.markProjectionStateForReplay({
      id: stored.id,
      requestedAt: new Date("2026-05-08T12:00:00.000Z"),
    });

    expect(fake.rows[0]).toMatchObject({
      metadata: {
        replayRequestedAt: "2026-05-08T12:00:00.000Z",
        replaySource: "phase_06_shadow_mode",
      },
      sync_status: "stale",
    });
  });
});
