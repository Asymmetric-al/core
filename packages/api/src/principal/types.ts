import type { PublicProjectionContext } from "../projection/types";
import type { HumanPrincipal } from "@asym/auth/principal";

export type {
  ActiveAssignment,
  AssignmentDenyReason,
  AssignmentReader,
  AssignmentRow,
  AssignmentSelection,
  HumanPrincipal,
  ResolveAssignmentInput,
  ResolveAssignmentResult,
  RoleClass,
  SessionIdentity,
} from "@asym/auth/principal";

/**
 * Principal types (#2258, Phase 12 T4 slice (a)). The active-assignment
 * resolver and its types live in `@asym/auth/principal` (AL-2675), where
 * `getAuthContext` uses them; this module adds the principal union. The class
 * is carried in the value (`kind`); a caller never derives it from a role
 * string.
 */
export type Principal =
  | HumanPrincipal
  | ExternalPrincipal
  | ServiceAccountPrincipal
  | PlatformOperatorPrincipal;

export type PrincipalKind = Principal["kind"];

/**
 * Public/anonymous visitor. Carries only its server-produced public context;
 * the `never` fields make an assignment or grant a compile-time error.
 */
export interface ExternalPrincipal {
  readonly kind: "external";
  readonly publicContext: PublicProjectionContext;
  readonly activeAssignment?: never;
  readonly assignment?: never;
  readonly grant?: never;
  readonly grants?: never;
}

/** Type-only: no table and no resolution exist yet (NHI owner ceiling is out of scope). */
export interface ServiceAccountPrincipal {
  readonly kind: "service_account";
  readonly nhiId: string;
  readonly tenantId: string;
  readonly ownerAssignmentId: string;
}

/** Type-only: the operator plane, its grants and its sink are out of scope. */
export interface PlatformOperatorPrincipal {
  readonly kind: "platform_operator";
  readonly operatorId: string;
}
