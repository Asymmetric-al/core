import { digestQualificationValue } from "./canonical";
import { digestCandidateLock } from "./charter";
import { HELD_BACK_CASE_IDS, OPEN_CASE_IDS } from "./types";
import { verifyRendererQualificationCharter } from "./verify";

import type {
  CandidateWorkPacket,
  FrozenRendererQualificationCharter,
  QualificationCaseId,
  RemediationCycleRecord,
  RendererCandidateId,
  SealedCandidateSubmission,
} from "./types";

export type QualificationHarnessErrorCode =
  | "candidate_ineligible_for_remediation"
  | "candidate_unknown"
  | "case_unknown"
  | "charter_digest_mismatch"
  | "charter_invalid"
  | "evidence_append_conflict"
  | "initial_submission_missing"
  | "remediation_budget_exceeded"
  | "remediation_cycle_limit"
  | "remediation_cycle_missing"
  | "remediation_incomplete"
  | "role_forbidden"
  | "submission_already_sealed"
  | "submission_invalid";

export class QualificationHarnessError extends Error {
  readonly code: QualificationHarnessErrorCode;

  constructor(code: QualificationHarnessErrorCode, message: string) {
    super(message);
    this.name = "QualificationHarnessError";
    this.code = code;
  }
}

/**
 * Append-only evidence store for sealed submissions and remediation cycles.
 * Records are never edited; a rerun appends a new record.
 */
export class InMemoryRendererQualificationStore {
  private readonly submissions = new Map<string, SealedCandidateSubmission>();
  private readonly submissionMeterKeys = new Map<string, string>();
  private readonly cycles = new Map<string, RemediationCycleRecord>();

  private static meterKey(record: {
    manifest_digest: string;
    candidate_id: RendererCandidateId;
    remediation_cycle_ordinal?: number;
    ordinal?: number;
  }): string {
    const ordinal = record.remediation_cycle_ordinal ?? record.ordinal ?? 0;
    return `${record.manifest_digest}:${record.candidate_id}:${ordinal}`;
  }

  async appendSubmission(record: SealedCandidateSubmission): Promise<void> {
    if (this.submissions.has(record.submission_id)) {
      throw new QualificationHarnessError(
        "evidence_append_conflict",
        `Submission ${record.submission_id} already exists; evidence records are append-only.`,
      );
    }
    // The metering key is unique at the store so a duplicate attempt loses
    // even under concurrent sealing.
    const meterKey = InMemoryRendererQualificationStore.meterKey(record);
    if (this.submissionMeterKeys.has(meterKey)) {
      throw new QualificationHarnessError(
        "submission_already_sealed",
        `Candidate ${record.candidate_id} already sealed a submission for ordinal ${record.remediation_cycle_ordinal} under this charter.`,
      );
    }
    this.submissionMeterKeys.set(meterKey, record.submission_id);
    this.submissions.set(record.submission_id, structuredClone(record));
  }

  async listSubmissions(
    manifestDigest?: string,
  ): Promise<SealedCandidateSubmission[]> {
    const all = Array.from(this.submissions.values(), (item) =>
      structuredClone(item),
    );
    return manifestDigest
      ? all.filter((item) => item.manifest_digest === manifestDigest)
      : all;
  }

  async appendRemediationCycle(record: RemediationCycleRecord): Promise<void> {
    if (this.cycles.has(record.cycle_id)) {
      throw new QualificationHarnessError(
        "evidence_append_conflict",
        `Remediation cycle ${record.cycle_id} already exists; evidence records are append-only.`,
      );
    }
    const meterKey = InMemoryRendererQualificationStore.meterKey(record);
    for (const existing of this.cycles.values()) {
      if (InMemoryRendererQualificationStore.meterKey(existing) === meterKey) {
        throw new QualificationHarnessError(
          "evidence_append_conflict",
          `Candidate ${record.candidate_id} already recorded remediation cycle ${record.ordinal} under this charter; ordinals never repeat.`,
        );
      }
    }
    this.cycles.set(record.cycle_id, structuredClone(record));
  }

  async listRemediationCycles(
    candidateId?: RendererCandidateId,
    manifestDigest?: string,
  ): Promise<RemediationCycleRecord[]> {
    return Array.from(this.cycles.values(), (item) => structuredClone(item))
      .filter(
        (item) =>
          candidateId === undefined || item.candidate_id === candidateId,
      )
      .filter(
        (item) =>
          manifestDigest === undefined ||
          item.manifest_digest === manifestDigest,
      );
  }
}

function requireVerifiedCharter(
  charter: FrozenRendererQualificationCharter,
): void {
  const verification = verifyRendererQualificationCharter(charter);
  if (!verification.valid) {
    throw new QualificationHarnessError(
      "charter_invalid",
      `The charter does not verify: ${verification.failures
        .map((item) => item.code)
        .join(", ")}.`,
    );
  }
}

function requireKnownCandidate(
  charter: FrozenRendererQualificationCharter,
  candidateId: string,
) {
  const candidate = charter.candidates.find(
    (item) => item.candidate_id === candidateId,
  );
  if (!candidate) {
    throw new QualificationHarnessError(
      "candidate_unknown",
      `Candidate ${candidateId} is not part of charter ${charter.charter_id}.`,
    );
  }
  return candidate;
}

async function hasSealedSubmission(
  store: InMemoryRendererQualificationStore,
  manifestDigest: string,
  candidateId: RendererCandidateId,
  ordinal: 0 | 1 | 2,
): Promise<boolean> {
  const submissions = await store.listSubmissions(manifestDigest);
  return submissions.some(
    (submission) =>
      submission.candidate_id === candidateId &&
      submission.remediation_cycle_ordinal === ordinal,
  );
}

async function requirePriorSubmissionSealed(
  store: InMemoryRendererQualificationStore,
  manifestDigest: string,
  candidateId: RendererCandidateId,
  ordinal: 1 | 2,
): Promise<void> {
  for (let priorOrdinal = 0; priorOrdinal < ordinal; priorOrdinal += 1) {
    const priorSealed = await hasSealedSubmission(
      store,
      manifestDigest,
      candidateId,
      priorOrdinal as 0 | 1,
    );
    if (!priorSealed) {
      throw new QualificationHarnessError(
        "initial_submission_missing",
        `Remediation cycle ${ordinal} requires candidate ${candidateId} to seal submission ordinal ${priorOrdinal} first.`,
      );
    }
  }
}

function parseSubmissionOrdinal(ordinal: unknown): 0 | 1 | 2 {
  if (ordinal === undefined) return 0;
  if (ordinal === 0 || ordinal === 1 || ordinal === 2) return ordinal;
  throw new QualificationHarnessError(
    "submission_invalid",
    "Submission ordinals are limited to the initial attempt and two remediation cycles.",
  );
}

/**
 * Build the packet a candidate implementer may see. Open cases arrive in
 * full; held-back cases arrive as schema/bounds only — the expected values
 * never exist inside the charter, so they cannot leak through this seam, its
 * serialization, or its errors.
 */
export function loadCandidateWorkPacket(
  charter: FrozenRendererQualificationCharter,
  candidateId: string,
  actor: string,
): CandidateWorkPacket {
  requireVerifiedCharter(charter);
  const candidate = requireKnownCandidate(charter, candidateId);
  const knownId = candidate.candidate_id;

  const permittedActors = new Set([
    charter.roles.candidate_operators[knownId],
    charter.roles.corpus_custodian,
    charter.roles.accountable_owner,
  ]);
  if (!permittedActors.has(actor)) {
    throw new QualificationHarnessError(
      "role_forbidden",
      `Actor is not the registered operator for ${knownId}; work packets are role-scoped.`,
    );
  }

  return structuredClone({
    charter_id: charter.charter_id,
    charter_version: charter.charter_version,
    manifest_digest: charter.manifest_digest,
    candidate_id: knownId,
    candidate_lock: candidate,
    open_cases: charter.open_corpus,
    held_back_case_schemas: charter.held_back_corpus.map((item) => ({
      case_id: item.case_id,
      output_profile: item.output_profile,
      bounds: item.fixture.bounds,
    })),
    operational_suites: charter.operational_suites,
    gates: charter.gates,
    budgets: charter.budgets,
    remediation_policy: charter.remediation_policy,
  });
}

export interface SealCandidateSubmissionInput {
  charter: FrozenRendererQualificationCharter;
  /** The digest the submitter believes they are sealing against. */
  expected_manifest_digest: string;
  candidate_id: string;
  actor: string;
  source_digest: string;
  output_digest: string;
  remediation_cycle_ordinal?: 0 | 1 | 2;
  store: InMemoryRendererQualificationStore;
  now?: () => Date;
  generateId?: () => string;
}

/**
 * Seal a candidate's source and output evidence against the exact charter and
 * candidate locks before any held-back evaluation may begin.
 */
export async function sealCandidateSubmission(
  input: SealCandidateSubmissionInput,
): Promise<SealedCandidateSubmission> {
  requireVerifiedCharter(input.charter);
  const candidateId = requireKnownCandidate(
    input.charter,
    input.candidate_id,
  ).candidate_id;

  if (input.expected_manifest_digest !== input.charter.manifest_digest) {
    throw new QualificationHarnessError(
      "charter_digest_mismatch",
      "The submission targets a different charter digest; candidate work is invalidated by any charter reset and must rerun.",
    );
  }
  if (input.charter.roles.candidate_operators[candidateId] !== input.actor) {
    throw new QualificationHarnessError(
      "role_forbidden",
      `Only the registered operator for ${candidateId} may seal its submission.`,
    );
  }

  const SHA256_HEX = /^[0-9a-f]{64}$/;
  if (
    !SHA256_HEX.test(input.source_digest) ||
    !SHA256_HEX.test(input.output_digest)
  ) {
    throw new QualificationHarnessError(
      "submission_invalid",
      "A sealed submission pins its exact source and output bytes with SHA-256 digests; blank or malformed digests are rejected.",
    );
  }

  const ordinal = parseSubmissionOrdinal(input.remediation_cycle_ordinal);
  if (ordinal !== 0) {
    await requirePriorSubmissionSealed(
      input.store,
      input.charter.manifest_digest,
      candidateId,
      ordinal,
    );
    const cycles = await input.store.listRemediationCycles(
      candidateId,
      input.charter.manifest_digest,
    );
    if (!cycles.some((cycle) => cycle.ordinal === ordinal)) {
      throw new QualificationHarnessError(
        "remediation_cycle_missing",
        `Submission ordinal ${ordinal} requires recorded remediation cycle ${ordinal} for ${candidateId} under this charter first.`,
      );
    }
  }

  const record: SealedCandidateSubmission = {
    submission_id: (input.generateId ?? (() => crypto.randomUUID()))(),
    charter_id: input.charter.charter_id,
    manifest_digest: input.charter.manifest_digest,
    candidate_id: candidateId,
    candidate_lock_digest: digestCandidateLock(input.charter, candidateId),
    remediation_cycle_ordinal: ordinal,
    source_digest: input.source_digest,
    output_digest: input.output_digest,
    sealed_at: (input.now ?? (() => new Date()))().toISOString(),
    sealed_by: input.actor,
  };

  await input.store.appendSubmission(record);
  return record;
}

export interface RecordRemediationCycleInput {
  charter: FrozenRendererQualificationCharter;
  candidate_id: string;
  actor: string;
  hours_spent: number;
  changes: readonly string[];
  affected_case_ids: readonly QualificationCaseId[];
  store: InMemoryRendererQualificationStore;
  now?: () => Date;
  generateId?: () => string;
}

/**
 * Meter remediation equally: each finalist gets at most two documented
 * cycles inside the frozen time budget; the control has no path to
 * eligibility and cannot record cycles at all. A remediation change names its
 * affected cases and always reruns them plus the entire held-back corpus.
 */
export async function recordRemediationCycle(
  input: RecordRemediationCycleInput,
): Promise<RemediationCycleRecord> {
  requireVerifiedCharter(input.charter);
  const candidate = requireKnownCandidate(input.charter, input.candidate_id);
  const candidateId = candidate.candidate_id;

  if (candidate.eligibility !== "finalist") {
    throw new QualificationHarnessError(
      "candidate_ineligible_for_remediation",
      "The comparison control receives no remediation path to eligibility.",
    );
  }
  if (input.charter.roles.candidate_operators[candidateId] !== input.actor) {
    throw new QualificationHarnessError(
      "role_forbidden",
      `Only the registered operator for ${candidateId} may record its remediation.`,
    );
  }
  if (input.changes.length === 0 || input.affected_case_ids.length === 0) {
    throw new QualificationHarnessError(
      "remediation_incomplete",
      "A remediation cycle documents its changes and identifies the affected cases.",
    );
  }
  const knownCaseIds = new Set<string>([
    ...OPEN_CASE_IDS,
    ...HELD_BACK_CASE_IDS,
  ]);
  for (const caseId of input.affected_case_ids) {
    if (!knownCaseIds.has(caseId)) {
      throw new QualificationHarnessError(
        "case_unknown",
        `Affected case ${caseId} is not part of the frozen corpus; remediation must identify real cases.`,
      );
    }
  }
  if (
    !Number.isFinite(input.hours_spent) ||
    input.hours_spent <= 0 ||
    input.hours_spent > input.charter.remediation_policy.max_hours_per_cycle
  ) {
    throw new QualificationHarnessError(
      "remediation_budget_exceeded",
      `A remediation cycle is bounded to ${input.charter.remediation_policy.max_hours_per_cycle} hours of documented effort.`,
    );
  }

  // Allowances are scoped to the exact charter digest: a reset contest starts
  // a fresh equal budget and prior-charter cycles never consume it.
  const prior = await input.store.listRemediationCycles(
    candidateId,
    input.charter.manifest_digest,
  );
  const ordinal = prior.length + 1;
  if (ordinal > input.charter.remediation_policy.max_cycles) {
    throw new QualificationHarnessError(
      "remediation_cycle_limit",
      "Each finalist receives at most two remediation cycles; a third is rejected.",
    );
  }
  await requirePriorSubmissionSealed(
    input.store,
    input.charter.manifest_digest,
    candidateId,
    ordinal as 1 | 2,
  );

  const rerunSet = new Set<QualificationCaseId>([
    ...input.affected_case_ids,
    ...HELD_BACK_CASE_IDS,
  ]);

  const record: RemediationCycleRecord = {
    cycle_id: (input.generateId ?? (() => crypto.randomUUID()))(),
    charter_id: input.charter.charter_id,
    manifest_digest: input.charter.manifest_digest,
    candidate_id: candidateId,
    ordinal: ordinal as 1 | 2,
    hours_spent: input.hours_spent,
    changes: [...input.changes],
    affected_case_ids: [...input.affected_case_ids].sort(),
    required_rerun_case_ids: [...rerunSet].sort(),
    evidence_digest: digestQualificationValue({
      charter: input.charter.manifest_digest,
      candidate: candidateId,
      ordinal,
      changes: input.changes,
      affected: [...input.affected_case_ids].sort(),
    }),
    recorded_at: (input.now ?? (() => new Date()))().toISOString(),
    recorded_by: input.actor,
  };

  await input.store.appendRemediationCycle(record);
  return record;
}
