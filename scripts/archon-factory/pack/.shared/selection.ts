import {
  evaluateEligibility,
  isRecord,
  isText,
  type EligibilityInput,
} from "./eligibility";

export interface RankingPolicy {
  nowMs: number;
  agingIntervalMs: number;
  maxAgingBonus: number;
}

export interface SamsonSelection {
  issueIds: [string];
  scopeRevision: string;
  contextRevision: string;
  ranking: {
    roadmapPriority: number;
    unlockValue: number;
    repairValue: number;
    agingBonus: number;
    tieBreakKey: string;
  };
  reason: {
    summary: string;
    sources: string[];
    expectedBenefit: string;
    affectedAreas: string[];
    uncertainty: string;
  };
}

export type SelectionResult =
  | {
      ok: false;
      code:
        | "invalid-policy"
        | "malformed-selection"
        | "stale-scope"
        | "ineligible-issue"
        | "stale-context"
        | "invalid-aging"
        | "invalid-tie-break";
    }
  | {
      ok: true;
      issueId: string;
      scopeRevision: string;
      contextRevision: string;
      ranking: SamsonSelection["ranking"];
      reason: SamsonSelection["reason"];
      aging: { waitedMs: number; bonus: number; tieBreakKey: string };
    };

function textList(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 16 &&
    value.every(isText)
  );
}

function score(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= 100
  );
}

function isSelection(value: unknown): value is SamsonSelection {
  if (
    !isRecord(value) ||
    !Array.isArray(value.issueIds) ||
    value.issueIds.length !== 1 ||
    !isText(value.issueIds[0]) ||
    !isText(value.scopeRevision) ||
    !isText(value.contextRevision) ||
    !isRecord(value.ranking) ||
    !isRecord(value.reason)
  )
    return false;
  return (
    score(value.ranking.roadmapPriority) &&
    score(value.ranking.unlockValue) &&
    score(value.ranking.repairValue) &&
    score(value.ranking.agingBonus) &&
    isText(value.ranking.tieBreakKey) &&
    isText(value.reason.summary) &&
    textList(value.reason.sources) &&
    isText(value.reason.expectedBenefit) &&
    textList(value.reason.affectedAreas) &&
    isText(value.reason.uncertainty)
  );
}

// Samson copies the chosen issue's id twice. The same number without its
// leading "#" or with stray spaces names the same issue; anything else does
// not. The id that is recorded is always the trusted frontier's own.
const issueKey = (value: string) => value.trim().replace(/^#/, "");

export function validateSamsonSelection(
  input: EligibilityInput,
  proposal: unknown,
  policy: RankingPolicy,
): SelectionResult {
  if (
    !isRecord(policy) ||
    !Number.isSafeInteger(policy.nowMs) ||
    policy.nowMs < 0 ||
    !Number.isSafeInteger(policy.agingIntervalMs) ||
    policy.agingIntervalMs <= 0 ||
    !score(policy.maxAgingBonus)
  )
    return { ok: false, code: "invalid-policy" };
  if (!isSelection(proposal)) return { ok: false, code: "malformed-selection" };
  const frontier = evaluateEligibility(input);
  if (proposal.scopeRevision !== frontier.scopeRevision)
    return { ok: false, code: "stale-scope" };
  const work = frontier.eligible.find(
    (candidate) => issueKey(candidate.id) === issueKey(proposal.issueIds[0]),
  );
  if (!work) return { ok: false, code: "ineligible-issue" };
  if (proposal.contextRevision !== work.contextRevision)
    return { ok: false, code: "stale-context" };
  const waitedMs = policy.nowMs - work.eligibleSinceMs;
  const bonus = Math.min(
    policy.maxAgingBonus,
    Math.floor(waitedMs / policy.agingIntervalMs),
  );
  if (waitedMs < 0 || proposal.ranking.agingBonus !== bonus)
    return { ok: false, code: "invalid-aging" };
  if (issueKey(proposal.ranking.tieBreakKey) !== issueKey(work.id))
    return { ok: false, code: "invalid-tie-break" };
  return {
    ok: true,
    issueId: work.id,
    scopeRevision: frontier.scopeRevision,
    contextRevision: work.contextRevision,
    ranking: { ...proposal.ranking, tieBreakKey: work.id },
    reason: {
      ...proposal.reason,
      sources: [...proposal.reason.sources],
      affectedAreas: [...proposal.reason.affectedAreas],
    },
    aging: { waitedMs, bonus, tieBreakKey: work.id },
  };
}
