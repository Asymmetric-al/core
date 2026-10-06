import type {
  FieldPolicyRow,
  FieldPolicySet,
} from "../../../../../packages/api/src/field-policies/reader";
import type {
  HumanProjectionContext,
  ProjectionInput,
  RowScope,
} from "../../../../../packages/api/src/projection/index";

/** Synthetic interface data. Neither a validated producer nor live RLS evidence. */
export function fixture(
  surface = "missionary",
  recordType = "donations",
): ProjectionInput & { auth: HumanProjectionContext; scope: RowScope } {
  const binding = {
    contextRef: "context-a",
    contextRevision: "context-v1",
    principalId: "person-a",
    tenantId: "tenant-a",
    purpose: "support_history",
    surface,
    recordType,
    recordId: "record-a",
    sourceRef: "source-a",
    sourceRevision: "source-v1",
    operation: "read" as const,
  };
  return {
    surface,
    recordType,
    row: {
      id: "record-a",
      tenant_id: "tenant-a",
      legal_entity_id: "entity-a",
      owner_id: "person-a",
      display_name: "Ada",
      amount: 1250,
    },
    auth: {
      kind: "human",
      binding,
      current: { contextRevision: "context-v1", sourceRevision: "source-v1" },
      assignment: {
        id: "assignment-a",
        revision: "assignment-v1",
        currentRevision: "assignment-v1",
        principalId: "person-a",
        tenantId: "tenant-a",
      },
      ceiling: {
        contextRef: "context-a",
        contextRevision: "context-v1",
        purpose: "support_history",
        operation: "read",
        readableFields: ["display_name", "amount"],
        exportableFields: ["display_name", "amount"],
      },
      legalEntities: {
        revision: "entities-v1",
        currentRevision: "entities-v1",
        ids: ["entity-a"],
      },
    },
    policies: policies(surface, recordType),
    scope: {
      binding,
      legalEntity: {
        kind: "applicable",
        entityId: "entity-a",
        scopeRevision: "entities-v1",
      },
      ownership: { kind: "applicable", ownerField: "owner_id" },
      relationship: { kind: "not_applicable" },
      anonymity: { kind: "not_applicable" },
      flags: { kind: "not_applicable" },
      state: { kind: "not_applicable" },
      predicates: [],
    },
  };
}

export function policies(
  surface: string,
  recordType: string,
  rows: Partial<FieldPolicyRow>[] = [
    { fieldKey: "display_name" },
    { fieldKey: "amount" },
  ],
): FieldPolicySet {
  const map = new Map(
    rows.map((row) => [
      row.fieldKey,
      {
        recordType,
        surface,
        tenantId: null,
        visible: true,
        editable: false,
        exportable: true,
        sensitivityCategory: "public",
        ...row,
      } as FieldPolicyRow,
    ]),
  );
  return { surface, recordType, get: (key) => map.get(key) };
}
