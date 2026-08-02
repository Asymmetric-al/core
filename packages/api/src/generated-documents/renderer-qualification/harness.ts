import { digestQualificationValue } from "./canonical";
import { digestCandidateLock } from "./charter";
import {
  HELD_BACK_CASE_IDS,
  OPEN_CASE_IDS,
  RENDERER_CANDIDATE_IDS,
} from "./types";
import { verifyRendererQualificationCharter } from "./verify";

import type {
  CandidateWorkPacket,
  FrozenRendererQualificationCharter,
  HeldBackEvaluationAccessRecord,
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
  | "charter_identity_conflict"
  | "charter_invalid"
  | "evidence_append_conflict"
  | "held_back_access_invalid"
  | "held_back_access_not_ready"
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

interface RendererQualificationStoreState {
  readonly charterManifestDigests: Map<string, string>;
  readonly submissions: Map<string, SealedCandidateSubmission>;
  readonly submissionMeterKeys: Map<string, string>;
  readonly cycles: Map<string, RemediationCycleRecord>;
  readonly cycleOperationKeys: Map<string, string>;
  readonly heldBackAccesses: Map<string, HeldBackEvaluationAccessRecord>;
  readonly heldBackAccessOperationKeys: Map<string, string>;
}

interface RemediationCycleRequest {
  readonly manifest_digest: string;
  readonly candidate_id: RendererCandidateId;
  readonly operation_key: string;
  readonly hours_spent: number;
  readonly changes: readonly string[];
  readonly affected_case_ids: readonly QualificationCaseId[];
  readonly recorded_by: string;
}

interface HeldBackEvaluationAccessRequest {
  readonly operation_key: string;
  readonly charter_id: string;
  readonly manifest_digest: string;
  readonly sealed_expectations_digest: string;
  readonly candidate_id: RendererCandidateId;
  readonly submission_id: string;
  readonly candidate_lock_digest: string;
  readonly remediation_cycle_ordinal: 0 | 1 | 2;
  readonly initial_submission_ids: Readonly<
    Record<RendererCandidateId, string>
  >;
  readonly accessed_by: string;
}

const storeStates = new WeakMap<
  InMemoryRendererQualificationStore,
  RendererQualificationStoreState
>();

function storeState(
  store: InMemoryRendererQualificationStore,
): RendererQualificationStoreState {
  const state = storeStates.get(store);
  if (!state) {
    throw new Error("Renderer qualification store is not initialized.");
  }
  return state;
}

function meterKey(record: {
  manifest_digest: string;
  candidate_id: RendererCandidateId;
  remediation_cycle_ordinal?: number;
  ordinal?: number;
}): string {
  const ordinal = record.remediation_cycle_ordinal ?? record.ordinal ?? 0;
  return `${record.manifest_digest}:${record.candidate_id}:${ordinal}`;
}

function cycleOperationKey(record: {
  manifest_digest: string;
  candidate_id: RendererCandidateId;
  operation_key: string;
}): string {
  return `${record.manifest_digest}:${record.candidate_id}:${record.operation_key}`;
}

function heldBackAccessOperationKey(record: {
  manifest_digest: string;
  operation_key: string;
}): string {
  return `${record.manifest_digest}:${record.operation_key}`;
}

function charterIdentityKey(
  charter: Pick<
    FrozenRendererQualificationCharter,
    "charter_id" | "charter_version"
  >,
): string {
  return JSON.stringify([charter.charter_id, charter.charter_version]);
}

function requireCompatibleCharterIdentity(
  state: RendererQualificationStoreState,
  charter: FrozenRendererQualificationCharter,
): string {
  const identityKey = charterIdentityKey(charter);
  const boundManifestDigest = state.charterManifestDigests.get(identityKey);
  if (
    boundManifestDigest !== undefined &&
    boundManifestDigest !== charter.manifest_digest
  ) {
    throw new QualificationHarnessError(
      "charter_identity_conflict",
      `Charter ${charter.charter_id}@${charter.charter_version} is already bound to a different manifest digest; frozen-field changes require a new charter version.`,
    );
  }
  return identityKey;
}

function sameStringSequence(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function matchesRemediationRequest(
  record: RemediationCycleRecord,
  request: RemediationCycleRequest,
): boolean {
  return (
    record.manifest_digest === request.manifest_digest &&
    record.candidate_id === request.candidate_id &&
    record.operation_key === request.operation_key &&
    record.hours_spent === request.hours_spent &&
    sameStringSequence(record.changes, request.changes) &&
    sameStringSequence(record.affected_case_ids, request.affected_case_ids) &&
    record.recorded_by === request.recorded_by
  );
}

function matchesHeldBackAccessRequest(
  record: HeldBackEvaluationAccessRecord,
  request: HeldBackEvaluationAccessRequest,
): boolean {
  return (
    record.operation_key === request.operation_key &&
    record.charter_id === request.charter_id &&
    record.manifest_digest === request.manifest_digest &&
    record.sealed_expectations_digest === request.sealed_expectations_digest &&
    record.candidate_id === request.candidate_id &&
    record.submission_id === request.submission_id &&
    record.candidate_lock_digest === request.candidate_lock_digest &&
    record.remediation_cycle_ordinal === request.remediation_cycle_ordinal &&
    RENDERER_CANDIDATE_IDS.every(
      (candidateId) =>
        record.initial_submission_ids[candidateId] ===
        request.initial_submission_ids[candidateId],
    ) &&
    record.accessed_by === request.accessed_by
  );
}

function listStoredSubmissions(
  store: InMemoryRendererQualificationStore,
  manifestDigest?: string,
): SealedCandidateSubmission[] {
  const all = Array.from(storeState(store).submissions.values(), (item) =>
    structuredClone(item),
  );
  return manifestDigest
    ? all.filter((item) => item.manifest_digest === manifestDigest)
    : all;
}

function listStoredRemediationCycles(
  store: InMemoryRendererQualificationStore,
  candidateId?: RendererCandidateId,
  manifestDigest?: string,
): RemediationCycleRecord[] {
  return Array.from(storeState(store).cycles.values(), (item) =>
    structuredClone(item),
  )
    .filter(
      (item) => candidateId === undefined || item.candidate_id === candidateId,
    )
    .filter(
      (item) =>
        manifestDigest === undefined || item.manifest_digest === manifestDigest,
    );
}

async function appendSubmission(
  store: InMemoryRendererQualificationStore,
  charter: FrozenRendererQualificationCharter,
  record: SealedCandidateSubmission,
): Promise<void> {
  const state = storeState(store);
  if (state.submissions.has(record.submission_id)) {
    throw new QualificationHarnessError(
      "evidence_append_conflict",
      `Submission ${record.submission_id} already exists; evidence records are append-only.`,
    );
  }
  // The metering key is unique at the store so a duplicate attempt loses
  // even under concurrent sealing.
  const recordMeterKey = meterKey(record);
  if (state.submissionMeterKeys.has(recordMeterKey)) {
    throw new QualificationHarnessError(
      "submission_already_sealed",
      `Candidate ${record.candidate_id} already sealed a submission for ordinal ${record.remediation_cycle_ordinal} under this charter.`,
    );
  }

  // Bind only after every append conflict check so a rejected request cannot
  // reserve an identity. These writes stay in one synchronous critical section.
  const identityKey = requireCompatibleCharterIdentity(state, charter);
  if (!state.charterManifestDigests.has(identityKey)) {
    state.charterManifestDigests.set(identityKey, charter.manifest_digest);
  }
  state.submissionMeterKeys.set(recordMeterKey, record.submission_id);
  state.submissions.set(record.submission_id, structuredClone(record));
}

async function appendRemediationCycle(
  store: InMemoryRendererQualificationStore,
  record: RemediationCycleRecord,
  request: RemediationCycleRequest,
): Promise<RemediationCycleRecord> {
  const state = storeState(store);
  const operationScope = cycleOperationKey(record);
  const existingCycleId = state.cycleOperationKeys.get(operationScope);
  if (existingCycleId) {
    const existing = state.cycles.get(existingCycleId);
    if (existing && matchesRemediationRequest(existing, request)) {
      return structuredClone(existing);
    }
    throw new QualificationHarnessError(
      "evidence_append_conflict",
      `Remediation operation ${record.operation_key} was already used with different evidence for ${record.candidate_id} under this charter.`,
    );
  }
  if (state.cycles.has(record.cycle_id)) {
    throw new QualificationHarnessError(
      "evidence_append_conflict",
      `Remediation cycle ${record.cycle_id} already exists; evidence records are append-only.`,
    );
  }
  const recordMeterKey = meterKey(record);
  for (const existing of state.cycles.values()) {
    if (meterKey(existing) === recordMeterKey) {
      throw new QualificationHarnessError(
        "evidence_append_conflict",
        `Candidate ${record.candidate_id} already recorded remediation cycle ${record.ordinal} under this charter; ordinals never repeat.`,
      );
    }
  }
  state.cycleOperationKeys.set(operationScope, record.cycle_id);
  state.cycles.set(record.cycle_id, structuredClone(record));
  return structuredClone(record);
}

async function appendHeldBackEvaluationAccess(
  store: InMemoryRendererQualificationStore,
  record: HeldBackEvaluationAccessRecord,
  request: HeldBackEvaluationAccessRequest,
): Promise<HeldBackEvaluationAccessRecord> {
  const state = storeState(store);
  const operationScope = heldBackAccessOperationKey(record);
  const existingAccessId =
    state.heldBackAccessOperationKeys.get(operationScope);
  if (existingAccessId) {
    const existing = state.heldBackAccesses.get(existingAccessId);
    if (existing && matchesHeldBackAccessRequest(existing, request)) {
      return structuredClone(existing);
    }
    throw new QualificationHarnessError(
      "evidence_append_conflict",
      `Held-back access operation ${record.operation_key} was already used with different evidence under this charter.`,
    );
  }
  if (state.heldBackAccesses.has(record.access_id)) {
    throw new QualificationHarnessError(
      "evidence_append_conflict",
      `Held-back access ${record.access_id} already exists; evidence records are append-only.`,
    );
  }

  state.heldBackAccessOperationKeys.set(operationScope, record.access_id);
  state.heldBackAccesses.set(record.access_id, structuredClone(record));
  return structuredClone(record);
}

/**
 * Read-only evidence store for sealed submissions, held-back accesses, and
 * remediation cycles.
 * The first successful initial seal also binds one charter ID/version to its
 * manifest digest for the lifetime of the store.
 * Validated harness operations append records through module-private helpers;
 * consumers cannot write unchecked evidence directly.
 */
export class InMemoryRendererQualificationStore {
  constructor() {
    storeStates.set(this, {
      charterManifestDigests: new Map(),
      submissions: new Map(),
      submissionMeterKeys: new Map(),
      cycles: new Map(),
      cycleOperationKeys: new Map(),
      heldBackAccesses: new Map(),
      heldBackAccessOperationKeys: new Map(),
    });
  }

  async listSubmissions(
    manifestDigest?: string,
  ): Promise<SealedCandidateSubmission[]> {
    return listStoredSubmissions(this, manifestDigest);
  }

  async listRemediationCycles(
    candidateId?: RendererCandidateId,
    manifestDigest?: string,
  ): Promise<RemediationCycleRecord[]> {
    return listStoredRemediationCycles(this, candidateId, manifestDigest);
  }

  async listHeldBackEvaluationAccesses(
    manifestDigest?: string,
    candidateId?: RendererCandidateId,
  ): Promise<HeldBackEvaluationAccessRecord[]> {
    return Array.from(storeState(this).heldBackAccesses.values(), (item) =>
      structuredClone(item),
    )
      .filter(
        (item) =>
          manifestDigest === undefined ||
          item.manifest_digest === manifestDigest,
      )
      .filter(
        (item) =>
          candidateId === undefined || item.candidate_id === candidateId,
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

async function requirePriorSubmissionSealed(
  store: InMemoryRendererQualificationStore,
  manifestDigest: string,
  candidateId: RendererCandidateId,
  ordinal: 1 | 2,
): Promise<SealedCandidateSubmission> {
  const submissions = listStoredSubmissions(store, manifestDigest);
  let immediatePrior: SealedCandidateSubmission | undefined;
  for (let priorOrdinal = 0; priorOrdinal < ordinal; priorOrdinal += 1) {
    const priorSubmission = submissions.find(
      (submission) =>
        submission.candidate_id === candidateId &&
        submission.remediation_cycle_ordinal === priorOrdinal,
    );
    if (!priorSubmission) {
      throw new QualificationHarnessError(
        "initial_submission_missing",
        `Remediation cycle ${ordinal} requires candidate ${candidateId} to seal submission ordinal ${priorOrdinal} first.`,
      );
    }
    immediatePrior = priorSubmission;
  }
  if (!immediatePrior) {
    throw new QualificationHarnessError(
      "initial_submission_missing",
      `Remediation cycle ${ordinal} requires a prior sealed submission for ${candidateId}.`,
    );
  }
  return immediatePrior;
}

/**
 * Evidence records are keyed by this id, so a blank one collapses the
 * append-only guarantee: the store rejects repeats, but the first blank id is
 * stored and returned as if it identified something.
 */
function requireGeneratedId(
  id: string,
  kind: string,
  errorCode: QualificationHarnessErrorCode = "submission_invalid",
): string {
  if (!id.trim()) {
    throw new QualificationHarnessError(
      errorCode,
      `The injected id generator returned a blank ${kind} id; evidence records must be identifiable.`,
    );
  }
  return id;
}

const REMEDIATION_OPERATION_KEY = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/;

function requireRemediationOperationKey(operationKey: unknown): string {
  if (
    typeof operationKey !== "string" ||
    !REMEDIATION_OPERATION_KEY.test(operationKey)
  ) {
    throw new QualificationHarnessError(
      "remediation_incomplete",
      "A remediation cycle requires a caller-stable operation key using 1-128 letters, numbers, dots, underscores, colons, slashes, or hyphens.",
    );
  }
  return operationKey;
}

function requireHeldBackAccessOperationKey(operationKey: unknown): string {
  if (
    typeof operationKey !== "string" ||
    !REMEDIATION_OPERATION_KEY.test(operationKey)
  ) {
    throw new QualificationHarnessError(
      "held_back_access_invalid",
      "A held-back access requires a caller-stable operation key using 1-128 letters, numbers, dots, underscores, colons, slashes, or hyphens.",
    );
  }
  return operationKey;
}

function replayedRemediationCycle(
  store: InMemoryRendererQualificationStore,
  request: RemediationCycleRequest,
): RemediationCycleRecord | undefined {
  const state = storeState(store);
  const existingCycleId = state.cycleOperationKeys.get(
    cycleOperationKey(request),
  );
  if (!existingCycleId) return undefined;

  const existing = state.cycles.get(existingCycleId);
  if (existing && matchesRemediationRequest(existing, request)) {
    return structuredClone(existing);
  }
  throw new QualificationHarnessError(
    "evidence_append_conflict",
    `Remediation operation ${request.operation_key} was already used with different evidence for ${request.candidate_id} under this charter.`,
  );
}

function parseSubmissionOrdinal(ordinal: unknown): 0 | 1 | 2 {
  if (ordinal === undefined) return 0;
  if (ordinal === 0 || ordinal === 1 || ordinal === 2) return ordinal;
  throw new QualificationHarnessError(
    "submission_invalid",
    "Submission ordinals are limited to the initial attempt and two remediation cycles.",
  );
}

const HELD_BACK_CANDIDATE_SAFE_BOUNDS =
  "Shared input schema and frozen charter-wide admission, page/content, and resource bounds; exact fixture identity and variation withheld until candidate outputs and sources are sealed.";

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
      bounds: HELD_BACK_CANDIDATE_SAFE_BOUNDS,
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
  let requiredCycle: RemediationCycleRecord | undefined;
  if (ordinal !== 0) {
    requireCompatibleCharterIdentity(storeState(input.store), input.charter);
    await requirePriorSubmissionSealed(
      input.store,
      input.charter.manifest_digest,
      candidateId,
      ordinal,
    );
    const cycles = listStoredRemediationCycles(
      input.store,
      candidateId,
      input.charter.manifest_digest,
    );
    requiredCycle = cycles.find((cycle) => cycle.ordinal === ordinal);
    if (!requiredCycle) {
      throw new QualificationHarnessError(
        "remediation_cycle_missing",
        `Submission ordinal ${ordinal} requires recorded remediation cycle ${ordinal} for ${candidateId} under this charter first.`,
      );
    }

    // A remediation cycle spends part of the equal budget, so its submission
    // has to carry a changed candidate source. Permitted changes are
    // adapter/translation source only, so an unchanged source digest means the
    // cycle bought nothing and the budget was consumed for free.
    //
    // Deliberately NOT requiring output_digest to differ: an isolation or
    // sandbox fix can legitimately leave the rendered bytes identical.
    const priorSubmissions = listStoredSubmissions(
      input.store,
      input.charter.manifest_digest,
    );
    const prior = priorSubmissions.find(
      (submission) =>
        submission.candidate_id === candidateId &&
        submission.remediation_cycle_ordinal === ordinal - 1,
    );
    if (prior && prior.source_digest === input.source_digest) {
      throw new QualificationHarnessError(
        "remediation_incomplete",
        `Remediation ordinal ${ordinal} for ${candidateId} carries the same source digest as ordinal ${ordinal - 1}; a cycle must change the candidate source.`,
      );
    }
  }

  // Evidence cannot predate the charter that governs it. Without this a skewed
  // or injected clock seals a submission dated before the contest existed, and
  // the ordering is what makes the evidence package auditable.
  const sealedAt = (input.now ?? (() => new Date()))();
  if (sealedAt.getTime() < Date.parse(input.charter.frozen_at)) {
    throw new QualificationHarnessError(
      "submission_invalid",
      `Submission cannot be sealed at ${sealedAt.toISOString()}, before the charter froze at ${input.charter.frozen_at}.`,
    );
  }
  if (
    requiredCycle &&
    sealedAt.getTime() < Date.parse(requiredCycle.recorded_at)
  ) {
    throw new QualificationHarnessError(
      "submission_invalid",
      `Submission ordinal ${ordinal} cannot be sealed at ${sealedAt.toISOString()}, before its remediation cycle was recorded at ${requiredCycle.recorded_at}.`,
    );
  }

  const record: SealedCandidateSubmission = {
    submission_id: requireGeneratedId(
      (input.generateId ?? (() => crypto.randomUUID()))(),
      "submission",
    ),
    charter_id: input.charter.charter_id,
    manifest_digest: input.charter.manifest_digest,
    candidate_id: candidateId,
    candidate_lock_digest: digestCandidateLock(input.charter, candidateId),
    remediation_cycle_ordinal: ordinal,
    source_digest: input.source_digest,
    output_digest: input.output_digest,
    sealed_at: sealedAt.toISOString(),
    sealed_by: input.actor,
  };

  await appendSubmission(input.store, input.charter, record);
  return record;
}

export interface RecordHeldBackEvaluationAccessInput {
  charter: FrozenRendererQualificationCharter;
  /** The digest the custodian believes governs this disclosure. */
  expected_manifest_digest: string;
  candidate_id: string;
  submission_id: string;
  actor: string;
  operation_key: string;
  store: InMemoryRendererQualificationStore;
  now?: () => Date;
  generateId?: () => string;
}

/**
 * Gate and retain a custodian's post-seal access to the shared held-back
 * expectations. This returns evidence only; it never returns hidden corpus
 * data and never mutates the frozen charter.
 */
export async function recordHeldBackEvaluationAccess(
  input: RecordHeldBackEvaluationAccessInput,
): Promise<HeldBackEvaluationAccessRecord> {
  requireVerifiedCharter(input.charter);
  const candidate = requireKnownCandidate(input.charter, input.candidate_id);
  const candidateId = candidate.candidate_id;

  if (input.expected_manifest_digest !== input.charter.manifest_digest) {
    throw new QualificationHarnessError(
      "charter_digest_mismatch",
      "Held-back access targets a different charter digest; disclosure is forbidden after any charter reset until the new candidates seal again.",
    );
  }
  requireCompatibleCharterIdentity(storeState(input.store), input.charter);
  if (input.charter.roles.corpus_custodian !== input.actor) {
    throw new QualificationHarnessError(
      "role_forbidden",
      "Only the registered corpus custodian may open held-back expectations for evaluation.",
    );
  }

  const operationKey = requireHeldBackAccessOperationKey(input.operation_key);
  const submissions = listStoredSubmissions(
    input.store,
    input.charter.manifest_digest,
  );
  const initialSubmissions: SealedCandidateSubmission[] = [];
  for (const registeredId of RENDERER_CANDIDATE_IDS) {
    const submission = submissions.find(
      (submission) =>
        submission.candidate_id === registeredId &&
        submission.remediation_cycle_ordinal === 0,
    );
    if (!submission) {
      throw new QualificationHarnessError(
        "held_back_access_not_ready",
        "The shared held-back corpus remains closed until both finalists and the comparison control have sealed their initial source and output evidence.",
      );
    }
    initialSubmissions.push(submission);
  }

  const targetSubmission = submissions.find(
    (submission) => submission.submission_id === input.submission_id,
  );
  if (!targetSubmission) {
    throw new QualificationHarnessError(
      "held_back_access_not_ready",
      `Submission ${input.submission_id} is not sealed under this charter; held-back evaluation cannot begin for it.`,
    );
  }
  if (targetSubmission.candidate_id !== candidateId) {
    throw new QualificationHarnessError(
      "held_back_access_invalid",
      `Submission ${input.submission_id} does not belong to candidate ${candidateId}.`,
    );
  }

  const expectedCandidateLockDigest = digestCandidateLock(
    input.charter,
    candidateId,
  );
  if (targetSubmission.candidate_lock_digest !== expectedCandidateLockDigest) {
    throw new QualificationHarnessError(
      "held_back_access_invalid",
      `Submission ${input.submission_id} is not bound to the current candidate lock for ${candidateId}.`,
    );
  }

  const [princeInitial, typstInitial, controlInitial] = initialSubmissions;
  if (!princeInitial || !typstInitial || !controlInitial) {
    throw new QualificationHarnessError(
      "held_back_access_not_ready",
      "Every registered candidate must have one initial seal before held-back evaluation begins.",
    );
  }
  const completeInitialSubmissions = [
    princeInitial,
    typstInitial,
    controlInitial,
  ] as const;
  const initialSubmissionIds = Object.fromEntries(
    completeInitialSubmissions.map((submission) => [
      submission.candidate_id,
      submission.submission_id,
    ]),
  ) as Record<RendererCandidateId, string>;
  const request: HeldBackEvaluationAccessRequest = {
    operation_key: operationKey,
    charter_id: input.charter.charter_id,
    manifest_digest: input.charter.manifest_digest,
    sealed_expectations_digest:
      input.charter.held_back_seal.sealed_expectations_digest,
    candidate_id: candidateId,
    submission_id: targetSubmission.submission_id,
    candidate_lock_digest: targetSubmission.candidate_lock_digest,
    remediation_cycle_ordinal: targetSubmission.remediation_cycle_ordinal,
    initial_submission_ids: initialSubmissionIds,
    accessed_by: input.actor,
  };

  const state = storeState(input.store);
  const existingAccessId = state.heldBackAccessOperationKeys.get(
    heldBackAccessOperationKey(request),
  );
  if (existingAccessId) {
    const existing = state.heldBackAccesses.get(existingAccessId);
    if (existing && matchesHeldBackAccessRequest(existing, request)) {
      return structuredClone(existing);
    }
    throw new QualificationHarnessError(
      "evidence_append_conflict",
      `Held-back access operation ${operationKey} was already used with different evidence under this charter.`,
    );
  }

  const accessedAt = (input.now ?? (() => new Date()))();
  const accessedAtMs = accessedAt.getTime();
  if (!Number.isFinite(accessedAtMs)) {
    throw new QualificationHarnessError(
      "held_back_access_invalid",
      "Held-back access requires a valid disclosure timestamp.",
    );
  }
  const prerequisiteSealTime = Math.max(
    targetSubmission.sealed_at ? Date.parse(targetSubmission.sealed_at) : 0,
    ...completeInitialSubmissions.map((submission) =>
      Date.parse(submission.sealed_at),
    ),
  );
  if (accessedAtMs < prerequisiteSealTime) {
    throw new QualificationHarnessError(
      "held_back_access_invalid",
      "Held-back access cannot predate the target submission or any required initial candidate seal.",
    );
  }

  const payload = {
    access_id: requireGeneratedId(
      (input.generateId ?? (() => crypto.randomUUID()))(),
      "held-back access",
      "held_back_access_invalid",
    ),
    ...request,
    reason: "evaluate_sealed_candidate_submission" as const,
    accessed_at: accessedAt.toISOString(),
  };
  const record: HeldBackEvaluationAccessRecord = {
    ...payload,
    evidence_digest: digestQualificationValue(payload),
  };

  return appendHeldBackEvaluationAccess(input.store, record, request);
}

export interface RecordRemediationCycleInput {
  charter: FrozenRendererQualificationCharter;
  candidate_id: string;
  actor: string;
  operation_key: string;
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
  if (
    input.changes.length === 0 ||
    input.changes.some(
      (change) => typeof change !== "string" || !change.trim(),
    ) ||
    input.affected_case_ids.length === 0
  ) {
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

  const affectedCaseIds = [
    ...new Set<QualificationCaseId>(input.affected_case_ids),
  ].sort();
  const request: RemediationCycleRequest = {
    manifest_digest: input.charter.manifest_digest,
    candidate_id: candidateId,
    operation_key: requireRemediationOperationKey(input.operation_key),
    hours_spent: input.hours_spent,
    changes: [...input.changes],
    affected_case_ids: affectedCaseIds,
    recorded_by: input.actor,
  };
  requireCompatibleCharterIdentity(storeState(input.store), input.charter);
  const replay = replayedRemediationCycle(input.store, request);
  if (replay) return replay;

  // Allowances are scoped to the exact charter digest: a reset contest starts
  // a fresh equal budget and prior-charter cycles never consume it.
  const prior = listStoredRemediationCycles(
    input.store,
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
  const prerequisiteSubmission = await requirePriorSubmissionSealed(
    input.store,
    input.charter.manifest_digest,
    candidateId,
    ordinal as 1 | 2,
  );

  const rerunSet = new Set<QualificationCaseId>([
    ...affectedCaseIds,
    ...HELD_BACK_CASE_IDS,
  ]);

  // Same clock ordering as sealCandidateSubmission: a remediation cycle cannot
  // predate the charter that meters it.
  const recordedAt = (input.now ?? (() => new Date()))();
  if (recordedAt.getTime() < Date.parse(input.charter.frozen_at)) {
    throw new QualificationHarnessError(
      "remediation_incomplete",
      `Remediation cycle cannot be recorded at ${recordedAt.toISOString()}, before the charter froze at ${input.charter.frozen_at}.`,
    );
  }
  if (recordedAt.getTime() < Date.parse(prerequisiteSubmission.sealed_at)) {
    throw new QualificationHarnessError(
      "remediation_incomplete",
      `Remediation cycle ${ordinal} cannot be recorded at ${recordedAt.toISOString()}, before prerequisite submission ${ordinal - 1} was sealed at ${prerequisiteSubmission.sealed_at}.`,
    );
  }

  // Everything the record asserts is digested, not just the change set.
  // `hours_spent` meters the equal remediation budget and `recorded_by` /
  // `recorded_at` carry attribution, so leaving them outside the digest would
  // let an exported record be edited without breaking its own seal.
  const payload = {
    cycle_id: requireGeneratedId(
      (input.generateId ?? (() => crypto.randomUUID()))(),
      "remediation cycle",
    ),
    operation_key: request.operation_key,
    charter_id: input.charter.charter_id,
    manifest_digest: input.charter.manifest_digest,
    candidate_id: candidateId,
    ordinal: ordinal as 1 | 2,
    hours_spent: input.hours_spent,
    changes: [...request.changes],
    affected_case_ids: [...request.affected_case_ids],
    required_rerun_case_ids: [...rerunSet].sort(),
    recorded_at: recordedAt.toISOString(),
    recorded_by: input.actor,
  };

  const record: RemediationCycleRecord = {
    ...payload,
    evidence_digest: digestQualificationValue(payload),
  };

  return appendRemediationCycle(input.store, record, request);
}
