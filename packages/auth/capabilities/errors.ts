export type CapabilityResolutionErrorCode =
  | "missing_context"
  | "foreign_tenant"
  | "inactive_source"
  | "multiple_assignments"
  | "unknown_subject"
  | "tenant_overrides_dormant";

/**
 * Thrown when a grant context cannot be resolved. The message is the code
 * alone: no capability key, tenant, assignment, grant or subject is disclosed.
 */
export class CapabilityResolutionError extends Error {
  override readonly name = "CapabilityResolutionError";
  readonly code: CapabilityResolutionErrorCode;

  constructor(code: CapabilityResolutionErrorCode) {
    super(code);
    this.code = code;
  }
}
