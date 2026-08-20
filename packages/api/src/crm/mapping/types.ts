import type { CrmIdentityConceptId } from "../identity/concepts";

export type CrmSourceEntityType = CrmIdentityConceptId;

export interface CrmSourceReference {
  tenantId: string;
  entityType: CrmSourceEntityType;
  entityId: string;
}

export interface CrmRelatedLinkReference {
  entityType: CrmSourceEntityType;
  entityId: string;
  relationship: string;
}

export type DuplicateConfidence = "none" | "low" | "medium" | "high";
export type DuplicateRecommendation =
  | "ignore"
  | "merge_candidate"
  | "link_candidate";

export interface CrmIdentityFingerprintInput {
  tenantId: string;
  entityType: CrmSourceEntityType;
  entityId: string;
  displayName?: string | null;
  primaryEmail?: string | null;
  phones?: Array<string | null | undefined>;
  organizationName?: string | null;
}

export interface CrmIdentityFingerprint {
  tenantId: string;
  entityType: CrmSourceEntityType;
  entityId: string;
  displayName: string | null;
  matchName: string | null;
  primaryEmail: string | null;
  phones: string[];
  organizationName: string | null;
  matchOrganizationName: string | null;
}

export interface DuplicateScore {
  score: number;
  confidence: DuplicateConfidence;
  recommendation: DuplicateRecommendation;
  reasons: string[];
}
