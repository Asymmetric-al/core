import {
  normalizeEmail,
  normalizeNameForMatching,
  normalizePhone,
  normalizeWhitespace,
} from "./normalize";

import type {
  CrmIdentityFingerprint,
  CrmIdentityFingerprintInput,
  DuplicateScore,
} from "./types";

function uniqueStrings(values: Array<string | null>): string[] {
  return [
    ...new Set(values.filter((value): value is string => Boolean(value))),
  ];
}

export function buildIdentityFingerprint(
  input: CrmIdentityFingerprintInput,
): CrmIdentityFingerprint {
  const displayName = normalizeWhitespace(input.displayName);
  const organizationName = normalizeWhitespace(input.organizationName);

  return {
    tenantId: input.tenantId,
    entityType: input.entityType,
    entityId: input.entityId,
    displayName,
    matchName: normalizeNameForMatching(displayName),
    primaryEmail: normalizeEmail(input.primaryEmail),
    phones: uniqueStrings((input.phones ?? []).map(normalizePhone)),
    organizationName,
    matchOrganizationName: normalizeNameForMatching(organizationName),
  };
}

function hasIntersection(left: string[], right: string[]): boolean {
  return left.some((value) => right.includes(value));
}

export function scoreDuplicateCandidate(
  source: CrmIdentityFingerprint,
  candidate: CrmIdentityFingerprint,
): DuplicateScore {
  if (source.tenantId !== candidate.tenantId) {
    return {
      score: 0,
      confidence: "none",
      recommendation: "ignore",
      reasons: ["tenant_mismatch"],
    };
  }

  let score = 0;
  const reasons: string[] = [];

  if (
    source.primaryEmail &&
    candidate.primaryEmail &&
    source.primaryEmail === candidate.primaryEmail
  ) {
    score += 70;
    reasons.push("email_exact");
  }

  if (
    source.phones.length > 0 &&
    hasIntersection(source.phones, candidate.phones)
  ) {
    score += 20;
    reasons.push("phone_exact");
  }

  if (source.matchName && source.matchName === candidate.matchName) {
    score += 10;
    reasons.push("name_exact");
  }

  if (
    source.matchOrganizationName &&
    source.matchOrganizationName === candidate.matchOrganizationName
  ) {
    score += 15;
    reasons.push("organization_exact");
  }

  if (score >= 90) {
    return {
      score,
      confidence: "high",
      recommendation: "link_candidate",
      reasons,
    };
  }

  if (score >= 65) {
    return {
      score,
      confidence: "medium",
      recommendation: "merge_candidate",
      reasons,
    };
  }

  if (score >= 20) {
    return {
      score,
      confidence: "low",
      recommendation: "merge_candidate",
      reasons,
    };
  }

  return {
    score,
    confidence: "none",
    recommendation: "ignore",
    reasons,
  };
}
