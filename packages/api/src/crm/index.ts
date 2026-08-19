export { requireCrmAccess } from "./auth/access";
export { logCrmCommand } from "./commands/log";
export {
  CRM_IDENTITY_CONCEPTS,
  getCrmIdentityConcept,
} from "./identity/concepts";
export {
  buildIdentityFingerprint,
  scoreDuplicateCandidate,
} from "./mapping/duplicates";
export type {
  CrmIdentityConcept,
  CrmIdentityConceptId,
  CrmIdentityLinkPolicy,
} from "./identity/concepts";
export type {
  CrmIdentityFingerprint,
  CrmIdentityFingerprintInput,
  CrmRelatedLinkReference,
  CrmSourceEntityType,
  CrmSourceReference,
  DuplicateConfidence,
  DuplicateRecommendation,
  DuplicateScore,
} from "./mapping/types";
export type {
  ActorContext,
  CrmAction,
  CrmCommandStatus,
  CrmResourceType,
} from "./types";
