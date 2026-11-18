import "server-only";

export {
  AssignmentReaderError,
  PrincipalDeniedError,
  createRpcAssignmentReader,
  resolveActiveAssignment,
  resolveActivePrincipal,
} from "@asym/auth/principal";
export type { AssignmentRpcClient } from "@asym/auth/principal";
export { toHumanProjectionAssignment } from "./projection";
export type {
  ActiveAssignment,
  AssignmentDenyReason,
  AssignmentReader,
  AssignmentRow,
  AssignmentSelection,
  ExternalPrincipal,
  HumanPrincipal,
  PlatformOperatorPrincipal,
  Principal,
  PrincipalKind,
  ResolveAssignmentInput,
  ResolveAssignmentResult,
  RoleClass,
  ServiceAccountPrincipal,
  SessionIdentity,
} from "./types";
