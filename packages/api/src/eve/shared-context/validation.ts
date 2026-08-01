import { eveSharedContextWriteSchema } from "./schema";

import type {
  EveSharedContextClaim,
  EveSharedContextConflict,
  EveSharedContextRisk,
} from "./types";
import type { EveSpecialistId } from "../subagent-catalog/types";

const FORBIDDEN_KEY_PATTERN =
  /(?:authorization|cookie|credential|cvv|donor|customer|email|environment|otp|password|payment|private[_ -]?key|secret|service[_ -]?role|ssn|token)/iu;
const FORBIDDEN_VALUE_PATTERNS = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/u,
  /\b(?:sk|rk|pk)_(?:live|test)_[A-Za-z0-9]{12,}\b/u,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/u,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/iu,
  /\b(?:\d[ -]*?){13,19}\b/u,
  /\b(?:otp|one[- ]time code)\b\s*[:=]?\s*\d{4,8}\b/iu,
] as const;

export class EveSharedContextValidationError extends Error {
  constructor(
    readonly code: "forbidden_sensitive_content" | "invalid_context_write",
    message: string,
  ) {
    super(message);
  }
}

function containsForbiddenContent(value: unknown, key?: string): boolean {
  if (key && FORBIDDEN_KEY_PATTERN.test(key)) return true;
  if (typeof value === "string") {
    return FORBIDDEN_VALUE_PATTERNS.some((pattern) => pattern.test(value));
  }
  if (Array.isArray(value)) {
    return value.some((entry) => containsForbiddenContent(entry));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).some(([entryKey, entry]) =>
      containsForbiddenContent(entry, entryKey),
    );
  }
  return false;
}

function highestRisk(
  left: EveSharedContextRisk,
  right: EveSharedContextRisk,
): EveSharedContextRisk {
  const order: EveSharedContextRisk[] = ["low", "medium", "high", "protected"];
  return order.indexOf(left) >= order.indexOf(right) ? left : right;
}

export function prepareEveSharedContextClaim(input: {
  accountableRunId: string;
  existingClaims: EveSharedContextClaim[];
  now?: Date;
  rootSessionId: string;
  sessionId: string;
  tenantId: string;
  write: unknown;
  writerSubagentId: EveSpecialistId;
}): {
  claim: EveSharedContextClaim;
  conflict?: EveSharedContextConflict;
} {
  const parsed = eveSharedContextWriteSchema.safeParse(input.write);
  if (!parsed.success) {
    throw new EveSharedContextValidationError(
      "invalid_context_write",
      "Shared context requires the complete versioned attribution schema.",
    );
  }
  if (containsForbiddenContent(parsed.data)) {
    throw new EveSharedContextValidationError(
      "forbidden_sensitive_content",
      "Sensitive content is forbidden in shared run context.",
    );
  }

  const now = (input.now ?? new Date()).toISOString();
  const claim: EveSharedContextClaim = {
    ...parsed.data,
    id: crypto.randomUUID(),
    tenantId: input.tenantId,
    rootSessionId: input.rootSessionId,
    sessionId: input.sessionId,
    accountableRunId: input.accountableRunId,
    writerSubagentId: input.writerSubagentId,
    createdAt: now,
  };
  const related = input.existingClaims.filter((candidate) =>
    claim.relatedClaimIds.includes(candidate.id),
  );
  if (claim.relationship !== "independent") {
    if (
      related.length !== claim.relatedClaimIds.length ||
      related.some(
        (candidate) =>
          candidate.fieldPath !== claim.fieldPath ||
          candidate.rootSessionId !== claim.rootSessionId ||
          candidate.tenantId !== claim.tenantId,
      )
    ) {
      throw new EveSharedContextValidationError(
        "invalid_context_write",
        "A relationship may reference only visible claims for the same field and run.",
      );
    }
  }
  if (claim.relationship !== "contradicts") return { claim };

  const risk = related.reduce(
    (current, candidate) => highestRisk(current, candidate.risk),
    claim.risk,
  );
  return {
    claim,
    conflict: {
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      rootSessionId: input.rootSessionId,
      fieldPath: claim.fieldPath,
      claimIds: [...new Set([...claim.relatedClaimIds, claim.id])],
      risk,
      createdAt: now,
    },
  };
}

export function hasBlockingEveSharedContextConflict(input: {
  conflicts: Array<EveSharedContextConflict & { resolution?: { id: string } }>;
  fieldPaths: readonly string[];
}): boolean {
  return input.conflicts.some(
    (conflict) =>
      input.fieldPaths.includes(conflict.fieldPath) &&
      !conflict.resolution &&
      (conflict.risk === "high" || conflict.risk === "protected"),
  );
}
