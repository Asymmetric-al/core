import type { FieldPolicySet } from "../field-policies/reader";
import type { Surface } from "../field-policies/taxonomy";

export type ProjectionOperation = "read" | "bulk_export";
/** Qualified producer evidence, never a token, caller approval or live verification. */
export type ProjectionBinding = Readonly<{
  contextRef: string;
  contextRevision: string;
  principalId: string;
  tenantId: string;
  purpose: string;
  surface: Surface;
  recordType: string;
  recordId: string;
  sourceRef: string;
  sourceRevision: string;
  operation: ProjectionOperation;
}>;
export type ContextFacts = Readonly<{
  binding: ProjectionBinding;
  current: Readonly<{ contextRevision: string; sourceRevision: string }>;
}>;
/** A producer's already-resolved capability ceiling for this exact context/purpose. */
export type ProjectionCeiling = Readonly<{
  contextRef: string;
  contextRevision: string;
  readableFields: readonly string[];
  exportableFields: readonly string[];
  /** Exact finance capability evidence; role names are not evidence. */
  finance?: Readonly<{
    kind: "processor_identifier_read";
    contextRef: string;
    contextRevision: string;
    purpose: string;
  }>;
}>;
export type HumanProjectionContext = ContextFacts &
  Readonly<{
    kind: "human";
    assignment: Readonly<{
      id: string;
      revision: string;
      currentRevision: string;
      principalId: string;
      tenantId: string;
    }>;
    ceiling: ProjectionCeiling;
    legalEntities: Readonly<{
      revision: string;
      currentRevision: string;
      /** Explicit current registry intersection, never a wildcard/default. */
      ids: readonly string[];
    }>;
  }>;
/** Reserved distinct variants. This bounded core refuses them until separately qualified. */
export type CurrentSourceFact = Readonly<{
  ref: string;
  revision: string;
  currentRevision: string;
  tenantId: string;
  purpose: string;
}>;
export type PublicProjectionContext = ContextFacts &
  Readonly<{
    kind: "public";
    ceiling: ProjectionCeiling;
    hostRef: string;
    site: CurrentSourceFact;
    resource: CurrentSourceFact;
    publicProjection: CurrentSourceFact;
  }>;
export type NhiProjectionContext = ContextFacts &
  Readonly<{
    kind: "nhi";
    ceiling: ProjectionCeiling;
    credential: CurrentSourceFact;
    owner: CurrentSourceFact;
    ownerContextRef: string;
    ownerContextRevision: string;
    currentOwnerContextRevision: string;
    ownCeiling: ProjectionCeiling;
    currentOwnerCeiling: ProjectionCeiling;
  }>;
export type OperatorProjectionContext = ContextFacts &
  Readonly<{
    kind: "operator";
    ceiling: ProjectionCeiling;
    grant: CurrentSourceFact;
    auditRef: string;
    evaluatedAt: string;
    validFrom: string;
    validUntil: string;
  }>;
export type ProjectionContext =
  | HumanProjectionContext
  | PublicProjectionContext
  | NhiProjectionContext
  | OperatorProjectionContext;
export type NotApplicable = Readonly<{ kind: "not_applicable" }>;
export type FieldRestriction = Readonly<{
  removeFields: readonly string[];
  refuse: boolean;
}>;
export type PredicateResult =
  | Readonly<{ kind: "retain" }>
  | Readonly<{ kind: "refuse" }>
  | Readonly<{ kind: "remove"; fields: readonly string[] }>;
export type ProjectionPredicate = (
  facts: Readonly<{
    row: Readonly<Record<string, unknown>>;
    binding: ProjectionBinding;
  }>,
) => PredicateResult;
/** All six dispositions are required and qualified by the enclosing exact source binding. */
export type RowScope = Readonly<{
  binding: ProjectionBinding;
  legalEntity:
    | NotApplicable
    | Readonly<{ kind: "applicable"; entityId: string; scopeRevision: string }>;
  ownership:
    | NotApplicable
    | Readonly<{ kind: "applicable"; ownerField: string }>;
  relationship:
    | NotApplicable
    | Readonly<{
        kind: "applicable";
        viewerId: string;
        recordId: string;
        related: boolean;
      }>;
  anonymity:
    | NotApplicable
    | Readonly<{
        kind: "applicable";
        intent: "named" | "anonymous" | "unknown_offline";
        audience: "identity_restricted" | "finance";
        identityFields: readonly string[];
        identityRequired: boolean;
        identityField: string;
      }>;
  flags: NotApplicable | (Readonly<{ kind: "applicable" }> & FieldRestriction);
  state:
    | NotApplicable
    | (Readonly<{ kind: "applicable"; value: "open" | "settled" | "locked" }> &
        FieldRestriction);
  predicates: readonly ProjectionPredicate[];
}>;
export type ProjectionInput<
  Row extends Readonly<Record<string, unknown>> = Readonly<
    Record<string, unknown>
  >,
> = Readonly<{
  surface: Surface;
  recordType: string;
  row: Row;
  auth: ProjectionContext;
  policies: FieldPolicySet;
  scope?: RowScope;
}>;
export type ProjectionResult<
  Row extends Readonly<Record<string, unknown>> = Readonly<
    Record<string, unknown>
  >,
> =
  | Readonly<{ kind: "refused" }>
  | Readonly<{ kind: "allowed"; projection: Readonly<Partial<Row>> }>;
