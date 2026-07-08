/**
 * Donor matching / entity resolution (pure, no I/O).
 * Source: Conrad blocker answers §2 (2026-07-04) — guest checkout, donor
 * matching, duplicate detection, dedupe, merge candidates.
 *
 * Product rules encoded here:
 *   §2.1 Exact / high-confidence match on NORMALIZED EMAIL within the same
 *        tenant  → ATTACH the gift to that existing donor.
 *   §2.2 Possible match (same name/address, different email; similar household)
 *        → do NOT auto-merge; create a MERGE CANDIDATE for human/agent review.
 *   §2.4 Low-confidence → merge candidate, never an auto-merge.
 *   (none) → create a new donor record.
 *
 * Kept pure so entity-resolution is fully unit-testable without a live DB. The
 * caller (route / DB layer) resolves the tenant server-side and supplies the
 * in-tenant candidate set; this function never performs cross-tenant matching.
 */

export type DonorMatchConfidence =
  | "exact"
  | "high"
  | "possible"
  | "low"
  | "none";

export type DonorMatchDecision =
  | "attach" // §2.1 exact/high — attach gift to the existing canonical donor
  | "create_merge_candidate" // §2.2/§2.4 possible/low — human/agent review, never auto-merge
  | "create_new"; // no signal — brand-new donor

export type DonorMatchSignal =
  | "normalized_email_exact"
  | "name_exact"
  | "name_similar"
  | "address_similar"
  | "household_similar"
  | "phone_exact";

export interface NormalizedAddress {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

export interface IncomingDonorIdentity {
  normalizedEmail: string;
  firstName: string;
  lastName: string;
  address?: NormalizedAddress | null;
  phone?: string | null;
}

/** An existing in-tenant donor record considered for a match (admin/finance identity). */
export interface DonorMatchCandidate {
  donorId: string;
  tenantId: string;
  normalizedEmail: string | null;
  /** Creation time, when available, used to prefer the oldest canonical donor. */
  createdAt?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  address?: NormalizedAddress | null;
  phone?: string | null;
}

export interface DonorMatchResult {
  decision: DonorMatchDecision;
  confidence: DonorMatchConfidence;
  signals: DonorMatchSignal[];
  /** Set only when decision === "attach": the surviving/canonical donor to attach to. */
  canonicalDonorId: string | null;
  /** Set when decision === "create_merge_candidate" (and for surfaced same-email dups): donors to review. */
  mergeCandidateDonorIds: string[];
}

function norm(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function sameName(a: IncomingDonorIdentity, c: DonorMatchCandidate): boolean {
  const firstName = norm(a.firstName);
  const lastName = norm(a.lastName);
  return (
    firstName !== "" &&
    lastName !== "" &&
    firstName === norm(c.firstName) &&
    lastName === norm(c.lastName)
  );
}

/** Address overlap heuristic: same line1 + (postalCode or city). Deliberately conservative. */
function addressSimilar(
  a: NormalizedAddress | null | undefined,
  b: NormalizedAddress | null | undefined,
): boolean {
  if (!a || !b) return false;
  if (norm(a.line1) === "" || norm(a.line1) !== norm(b.line1)) return false;
  return (
    (norm(a.postalCode) !== "" && norm(a.postalCode) === norm(b.postalCode)) ||
    (norm(a.city) !== "" && norm(a.city) === norm(b.city))
  );
}

function phoneExact(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const da = (a ?? "").replace(/\D/g, "");
  const db = (b ?? "").replace(/\D/g, "");
  return da.length >= 7 && da === db;
}

function createdAtTime(candidate: DonorMatchCandidate): number | null {
  if (!candidate.createdAt) return null;
  const time = Date.parse(candidate.createdAt);
  return Number.isFinite(time) ? time : null;
}

function orderByUniqueOldestCreatedAt(
  candidates: DonorMatchCandidate[],
): DonorMatchCandidate[] | null {
  const comparable: Array<{ candidate: DonorMatchCandidate; time: number }> =
    [];

  for (const candidate of candidates) {
    const time = createdAtTime(candidate);
    if (time === null) return null;
    comparable.push({ candidate, time });
  }

  comparable.sort((a, b) => a.time - b.time);

  if (comparable.length > 1 && comparable[0]!.time === comparable[1]!.time) {
    return null;
  }

  return comparable.map(({ candidate }) => candidate);
}

/** Signals for a single incoming↔candidate pair (email match handled separately). */
function pairSignals(
  incoming: IncomingDonorIdentity,
  c: DonorMatchCandidate,
): DonorMatchSignal[] {
  const signals: DonorMatchSignal[] = [];
  if (sameName(incoming, c)) signals.push("name_exact");
  if (addressSimilar(incoming.address, c.address)) {
    signals.push("address_similar");
    signals.push("household_similar");
  }
  if (phoneExact(incoming.phone, c.phone)) signals.push("phone_exact");
  return signals;
}

/**
 * Confidence from a non-email signal set:
 *   name_exact + address/household  → possible (§2.2)
 *   any single weaker signal        → low (§2.4)
 *   nothing                         → none
 */
function confidenceFromSignals(
  signals: DonorMatchSignal[],
): DonorMatchConfidence {
  const hasName = signals.includes("name_exact");
  const hasAddress =
    signals.includes("address_similar") ||
    signals.includes("household_similar");
  if (hasName && hasAddress) return "possible";
  if (signals.length > 0) return "low";
  return "none";
}

export function resolveDonorMatch(input: {
  tenantId: string;
  incoming: IncomingDonorIdentity;
  candidates: DonorMatchCandidate[];
}): DonorMatchResult {
  // Tenant isolation is structural: only ever consider same-tenant candidates.
  const candidates = input.candidates.filter(
    (c) => c.tenantId === input.tenantId,
  );
  const email = norm(input.incoming.normalizedEmail);

  // §2.1 — exact / high-confidence normalized-email match → attach.
  if (email !== "") {
    const emailMatches = candidates.filter(
      (c) => norm(c.normalizedEmail) === email,
    );
    if (emailMatches.length > 0) {
      if (emailMatches.length === 1) {
        return {
          decision: "attach",
          confidence: "exact",
          signals: ["normalized_email_exact"],
          canonicalDonorId: emailMatches[0]!.donorId,
          mergeCandidateDonorIds: [],
        };
      }

      const orderedEmailMatches = orderByUniqueOldestCreatedAt(emailMatches);
      if (!orderedEmailMatches) {
        return {
          decision: "create_merge_candidate",
          confidence: "possible",
          signals: ["normalized_email_exact"],
          canonicalDonorId: null,
          mergeCandidateDonorIds: emailMatches.map((c) => c.donorId),
        };
      }

      const canonical = orderedEmailMatches[0]!;
      const rest = orderedEmailMatches.slice(1);
      return {
        decision: "attach",
        confidence: "exact",
        signals: ["normalized_email_exact"],
        canonicalDonorId: canonical.donorId,
        // A second same-email record is a pre-existing duplicate: surface it for
        // review (dedupe), but never auto-merge it here.
        mergeCandidateDonorIds: rest.map((c) => c.donorId),
      };
    }
  }

  // §2.2 / §2.4 — no email match: evaluate possible/low signals per candidate.
  const scored = candidates
    .map((c) => ({ c, signals: pairSignals(input.incoming, c) }))
    .filter((s) => s.signals.length > 0);

  if (scored.length === 0) {
    return {
      decision: "create_new",
      confidence: "none",
      signals: [],
      canonicalDonorId: null,
      mergeCandidateDonorIds: [],
    };
  }

  // Rank possible above low; the overall confidence is the strongest pair.
  const anyPossible = scored.some(
    (s) => confidenceFromSignals(s.signals) === "possible",
  );
  const confidence: DonorMatchConfidence = anyPossible ? "possible" : "low";
  const unionSignals = Array.from(new Set(scored.flatMap((s) => s.signals)));

  return {
    // NEVER auto-merge on possible/low — always a reviewable candidate (§2.2/§2.4).
    decision: "create_merge_candidate",
    confidence,
    signals: unionSignals,
    canonicalDonorId: null,
    mergeCandidateDonorIds: scored.map((s) => s.c.donorId),
  };
}
