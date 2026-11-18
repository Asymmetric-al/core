export { CAPABILITY_BUNDLES, ROLE_DEFAULT_BUNDLES } from "./bundles";
export type { BundleKey, GrantSubjectKey, NamedGrantSubject } from "./bundles";
export {
  resolveAssignmentCapabilities,
  resolveEffectiveCapabilities,
} from "./effective-capabilities";
export type {
  AssignmentGrantSource,
  GrantSource,
  NamedGrantSource,
  SelectedAssignment,
  SelectedGrantContext,
} from "./effective-capabilities";
export { CapabilityResolutionError } from "./errors";
export type { CapabilityResolutionErrorCode } from "./errors";
export { CAPABILITY_REGISTRY } from "./registry";
export type { Capability, CapabilityMeta } from "./registry";
export { capabilityRegistryRows } from "./rows";
