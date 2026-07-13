/**
 * Guest donor matching / entity resolution — public-giving WIRING.
 *
 * Conrad 2026-07-04 §2: a guest may give without an account; the system creates
 * or matches the donor record behind the scenes, primarily by normalized email:
 *   - exact / high-confidence email  → attach to the existing CANONICAL/SURVIVING
 *                                       donor record
 *   - possible match (name/phone, different email) → a MERGE CANDIDATE for human/
 *                                       agent-assisted review (never an auto-merge)
 *   - low / none                     → create a new donor record
 *
 * This is a thin decision layer over the existing CRM entity-resolution scorer
 * (`../crm/mapping/duplicates`). It introduces NO new matching heuristics — it
 * only maps the scorer's recommendation onto a guest-checkout action, using the
 * canonical/surviving-record terminology the partner directive requires.
 */
import {
  buildIdentityFingerprint,
  scoreDuplicateCandidate,
} from "../crm/mapping/duplicates";

import type {
  CrmIdentityFingerprint,
  DuplicateScore,
} from "../crm/mapping/types";

/** The guest donor as captured at checkout. */
export interface GuestDonorInput {
  tenantId: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}

export type GuestDonorMatchAction = "attach" | "review" | "create";

export interface DonorMatchDecision {
  /**
   * attach — high-confidence: link this gift to the canonical/surviving record.
   * review — possible duplicate: create a merge candidate; do NOT auto-merge.
   * create — no meaningful overlap: create a new donor record.
   */
  action: GuestDonorMatchAction;
  /** The canonical/surviving record's entity id when attaching or under review. */
  matchedEntityId: string | null;
  /** The winning candidate's duplicate score (null when creating fresh). */
  score: DuplicateScore | null;
  /** How many tenant candidates were considered. */
  candidateCount: number;
}

/** A synthetic entity id for the not-yet-persisted guest, used only for scoring. */
const GUEST_SOURCE_ENTITY_ID = "guest-checkout";

function guestDisplayName(input: GuestDonorInput): string | null {
  const parts = [input.firstName, input.lastName]
    .map((p) => p?.trim())
    .filter((p): p is string => Boolean(p));
  return parts.length > 0 ? parts.join(" ") : null;
}

/**
 * Resolve how a guest gift should attach to the donor graph. Candidates are the
 * tenant's existing donor fingerprints (the caller loads them, PII-safely). Pure
 * and DB-free so it is unit-testable with mocked candidates.
 */
export function resolveGuestDonorMatch(
  input: GuestDonorInput,
  candidates: readonly CrmIdentityFingerprint[],
): DonorMatchDecision {
  const tenantCandidates = candidates.filter(
    (candidate) => candidate.tenantId === input.tenantId,
  );
  const source = buildIdentityFingerprint({
    tenantId: input.tenantId,
    entityType: "donor_profile",
    entityId: GUEST_SOURCE_ENTITY_ID,
    displayName: guestDisplayName(input),
    primaryEmail: input.email ?? null,
    phones: input.phone ? [input.phone] : [],
  });

  let best: {
    candidate: CrmIdentityFingerprint;
    score: DuplicateScore;
  } | null = null;
  let topScoreCount = 0; // how many candidates tie at the current best score
  let exactEmailCount = 0; // how many candidates are an exact-email match
  for (const candidate of tenantCandidates) {
    const score = scoreDuplicateCandidate(source, candidate);
    if (score.reasons.includes("email_exact")) exactEmailCount += 1;
    if (!best || score.score > best.score.score) {
      best = { candidate, score };
      topScoreCount = 1;
    } else if (score.score === best.score.score && score.score > 0) {
      topScoreCount += 1;
    }
  }

  if (!best || best.score.recommendation === "ignore") {
    return {
      action: "create",
      matchedEntityId: null,
      score: best?.score ?? null,
      candidateCount: tenantCandidates.length,
    };
  }

  // Attach ONLY when we have a single, unambiguous high-confidence identity:
  //  - an exact normalized-email match (Conrad §2.1: email is the primary,
  //    high-confidence key for guest checkout — attach even though the generic
  //    CRM scorer bands email-alone as a merge_candidate), or
  //  - the scorer's own `link_candidate` (≥90) high-confidence band.
  // Everything else that scored is a possible duplicate → surface for review;
  // NEVER an automatic merge (Conrad §2.2/§2.4).
  //
  // Ambiguity guard: if two+ records tie at the top score, or two+ records carry
  // the same exact email, there is no single canonical/surviving record to attach
  // to — route to review rather than silently attaching to an arbitrary one.
  const isExactEmailMatch = best.score.reasons.includes("email_exact");
  const isHighConfidence =
    isExactEmailMatch || best.score.recommendation === "link_candidate";
  const isAmbiguous = topScoreCount > 1 || exactEmailCount > 1;
  const action: GuestDonorMatchAction =
    isHighConfidence && !isAmbiguous ? "attach" : "review";

  return {
    action,
    matchedEntityId: best.candidate.entityId,
    score: best.score,
    candidateCount: tenantCandidates.length,
  };
}
