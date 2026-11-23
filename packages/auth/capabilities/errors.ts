export type CapabilityResolutionErrorCode =
  | "missing_context"
  | "foreign_tenant"
  | "inactive_source"
  | "multiple_assignments"
  | "unknown_subject"
  | "tenant_overrides_dormant";

export class CapabilityResolutionError extends Error {
  override readonly name = "CapabilityResolutionError";
  readonly code: CapabilityResolutionErrorCode;

  constructor(code: CapabilityResolutionErrorCode) {
    super(code);
    this.code = code;
  }
}
