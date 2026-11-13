// Sealing, assessment and adjudication decisions for one frozen candidate.
import { createHash } from "node:crypto";

import { makeRepair, repairFingerprint } from "./repair-logic.mjs";

const BLOCKING = ["P0", "P1"];

export function sealReview(name, review, { candidate, acceptanceRevision }) {
  if (!review)
    return {
      decision: "INCONCLUSIVE",
      reason: `${name} did not complete`,
      findings: [],
      checks: [],
      limitations: [],
    };
  const sealed = (decision, reason, findings = review.findings) => ({
    decision,
    reason,
    findings,
    checks: review.checks_run,
    limitations: review.limitations,
  });
  if (
    review.candidate_sha !== candidate ||
    review.acceptance_revision !== acceptanceRevision
  )
    return sealed(
      "INCONCLUSIVE",
      `${name} reviewed ${review.candidate_sha.slice(0, 12)} / ${review.acceptance_revision.slice(0, 12)}, not the frozen candidate`,
    );
  if (review.task_status !== "DONE" && review.decision !== "INCONCLUSIVE")
    return sealed("INCONCLUSIVE", `${name} reported BLOCKED`);
  if (review.decision === "FINDINGS" && review.findings.length === 0)
    return sealed(
      "INCONCLUSIVE",
      `${name} reported findings without any detail`,
      [],
    );
  if (
    review.decision === "CLEAR" &&
    review.findings.some((finding) => BLOCKING.includes(finding.severity))
  )
    return sealed(
      "FINDINGS",
      `${name} returned CLEAR with P0/P1 findings, sealed as FINDINGS. ${review.scope}`,
    );
  return sealed(review.decision, review.scope);
}

// Any finding, even under CLEAR, goes to Samson's assessment.
export function sealDecision(reports) {
  const findings = [];
  for (const [reviewer, report] of Object.entries(reports))
    report.findings.forEach((finding, index) =>
      findings.push({
        id: `${reviewer[0].toUpperCase()}${index + 1}`,
        reviewer,
        ...finding,
      }),
    );
  const bothClear =
    reports.micaiah.decision === "CLEAR" &&
    reports.luke.decision === "CLEAR" &&
    findings.length === 0;
  return { bothClear, findings };
}

export function inconclusiveReviews(reports) {
  return Object.entries(reports ?? {})
    .filter(([, report]) => report.decision === "INCONCLUSIVE")
    .map(([name, report]) => ({ name, reason: report.reason }));
}

const blockedInconclusive = (inconclusive) => ({
  kind: "blocked",
  reason: "A review is INCONCLUSIVE without a repair plan",
  blocked: {
    code: "review-inconclusive",
    detail: inconclusive
      .map((entry) => `${entry.name}: ${entry.reason}`)
      .join("; ")
      .slice(0, 1200),
  },
});

const contentKey = (dispute) =>
  createHash("sha256")
    .update(
      JSON.stringify([
        dispute.statement,
        dispute.consequence,
        dispute.location,
        dispute.evidence,
        dispute.proposed,
      ]),
    )
    .digest("hex");

// Agabus sees D1..Dn ordered by claim content; the trusted map back to the
// reviewer's finding id stays with the factory. Samson's counter-argument is
// rewritten so it cannot name a reviewer or a reviewer-prefixed finding id.
export function anonymizeDisputes(disputes, findingIds = []) {
  const ordered = disputes
    .map((dispute) => ({ dispute, key: contentKey(dispute) }))
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
    .map(({ dispute }) => dispute);
  const ids = new Map(
    ordered.map((dispute, index) => [dispute.finding, `D${index + 1}`]),
  );
  const known = new Set(findingIds);
  const neutral = (text) =>
    String(text)
      .replace(/\b(micaiah|luke)\b/gi, "a reviewer")
      .replace(
        /\b[ML]\d+\b/g,
        (id) => ids.get(id) ?? (known.has(id) ? "another finding" : id),
      );
  return {
    claims: ordered.map((dispute) => ({
      claim: ids.get(dispute.finding),
      statement: dispute.statement,
      consequence: dispute.consequence,
      location: dispute.location,
      evidence: dispute.evidence,
      proposed: dispute.proposed,
      counter: neutral(dispute.counter),
    })),
    map: ordered.map((dispute) => ({
      claim: ids.get(dispute.finding),
      finding: dispute.finding,
      owner: dispute.owner,
      severity: dispute.severity,
      statement: dispute.statement,
      proposed: dispute.proposed,
    })),
  };
}

// `pending` holds acceptance corrections already waiting for Ezra (a context
// change recorded in a review-only round). They keep the candidate from final
// acceptance and travel with whatever repair this round produces.
export function planAssessment({
  findings,
  assess,
  reports,
  bothClear = false,
  pending = [],
}) {
  if (bothClear) {
    if (!pending.length) return { kind: "final", reason: "Both reviews CLEAR" };
    const repair = makeRepair({ acceptance: pending, source: "after-assess" });
    return {
      kind: "repair",
      reason: "Both reviews CLEAR, but Ezra must correct the acceptance first",
      repair,
      fingerprint: repairFingerprint("review", repair),
    };
  }
  if (!assess || assess.task_status !== "DONE")
    return {
      kind: "blocked",
      reason: "Samson did not complete the assessment",
      blocked: {
        code: "assess-incomplete",
        detail: "No assessment of sealed findings",
      },
    };
  const byId = new Map(assess.dispositions.map((item) => [item.finding, item]));
  const missing = findings.filter((finding) => !byId.has(finding.id));
  if (missing.length)
    return {
      kind: "blocked",
      reason: "Assessment omitted findings",
      blocked: {
        code: "assess-incomplete",
        detail: missing.map((finding) => finding.id).join(","),
      },
    };
  const implementation = [];
  const acceptance = [...pending];
  const disputes = [];
  for (const finding of findings) {
    const disposition = byId.get(finding.id);
    let action = disposition.action;
    if (action === "not-material" && BLOCKING.includes(finding.severity))
      action = "adjudicate";
    const text = `[${finding.id} ${finding.severity}] ${finding.condition} -> ${finding.consequence} at ${finding.location}. Correction: ${finding.correction}`;
    if (action === "repair-implementation") implementation.push(text);
    else if (action === "repair-acceptance") acceptance.push(text);
    else if (action === "adjudicate")
      disputes.push({
        finding: finding.id,
        severity: finding.severity,
        owner: finding.owner,
        statement: finding.condition,
        consequence: finding.consequence,
        location: finding.location,
        evidence: finding.evidence,
        proposed: finding.correction,
        counter: disposition.reason,
      });
  }
  const repairs = implementation.length > 0 || acceptance.length > 0;
  // A repair produces a new candidate with fresh reviews; without one, an
  // INCONCLUSIVE review stops the candidate before any adjudication.
  const inconclusive = inconclusiveReviews(reports);
  if (!repairs && inconclusive.length) return blockedInconclusive(inconclusive);
  if (disputes.length) {
    const { claims, map } = anonymizeDisputes(
      disputes,
      findings.map((finding) => finding.id),
    );
    return {
      kind: "adjudicate",
      reason: `${disputes.length} disputed finding(s) go to Agabus`,
      final: !repairs,
      claims,
      plan: { implementation, acceptance, disputes: map },
    };
  }
  if (repairs) {
    const repair = makeRepair({
      acceptance,
      implementation,
      source: "after-assess",
    });
    return {
      kind: "repair",
      reason: "Accepted findings return to their owners",
      repair,
      fingerprint: repairFingerprint("review", repair),
    };
  }
  return { kind: "final", reason: "Remaining findings are not material" };
}

// Samson's choices for each sealed finding. A repair costs a full round
// (build, hooked freeze, both reviews), so a finding its reviewer calls
// optional does not start one, and a repair is never a way to ask for a
// second review.
export const ASSESSMENT_CHOICES = [
  "For every finding id choose one action:",
  "- repair-implementation: a real defect Bezalel must fix;",
  "- repair-acceptance: the acceptance oracle is wrong or incomplete; Ezra must correct it;",
  "- adjudicate: the claim is genuinely disputed or uncertain; Agabus decides from evidence;",
  "- not-material: only for P2/P3 nits with a concrete reason. P0/P1 findings are never dismissed by you.",
  "A P2/P3 finding its reviewer calls optional, non-blocking or a follow-up is not-material: give that as the reason.",
  "An INCONCLUSIVE review means evidence about the candidate is missing; when a repair action is warranted, say what evidence the next round must obtain.",
  "Never choose a repair only to obtain a new review. Without a warranted repair, an INCONCLUSIVE review stops this candidate before adjudication or final acceptance, and that is the correct outcome.",
].join("\n");

// Rulings are read only through the trusted assess-plan ledger; without it,
// or with rulings on claims it does not hold, the round stops.
export function planAdjudication({ agabus, plan, plannedFinal, reports }) {
  const inconclusive = inconclusiveReviews(reports);
  const disputes = Array.isArray(plan?.disputes) ? plan.disputes : [];
  if (!agabus) {
    if (disputes.length)
      return {
        kind: "blocked",
        reason: "Disputes were planned but Agabus returned no rulings",
        blocked: {
          code: "adjudication-missing",
          detail: disputes.map((dispute) => dispute.claim).join(","),
        },
      };
    if (plannedFinal !== "yes")
      return { kind: "pass", final: false, reason: "Repairs pending" };
    if (inconclusive.length) return blockedInconclusive(inconclusive);
    return { kind: "pass", final: true, reason: "No adjudication needed" };
  }
  if (!disputes.length)
    return {
      kind: "blocked",
      reason: "Agabus ruled without the factory's adjudication plan",
      blocked: {
        code: "adjudication-plan-missing",
        detail: "The assess-plan ledger entry is missing or names no disputes",
        recovery: "Retry the round so assessment and adjudication run together",
      },
    };
  if (agabus.task_status !== "DONE")
    return {
      kind: "blocked",
      reason: "Agabus could not complete adjudication",
      blocked: {
        code: "adjudication-blocked",
        detail: agabus.limitations.join("; ").slice(0, 1200),
      },
    };
  const known = new Set(disputes.map((dispute) => dispute.claim));
  const unknown = agabus.rulings
    .map((ruling) => ruling.claim)
    .filter((claim) => !known.has(claim));
  if (unknown.length)
    return {
      kind: "blocked",
      reason: "Agabus ruled on claims that were not disputed",
      blocked: {
        code: "adjudication-mismatch",
        detail: `Unknown claim ids: ${unknown.join(", ")}`.slice(0, 1200),
      },
    };
  const rulings = new Map(
    agabus.rulings.map((ruling) => [ruling.claim, ruling]),
  );
  const implementation = [...(plan.implementation ?? [])];
  const acceptance = [...(plan.acceptance ?? [])];
  const needsEvidence = [];
  for (const dispute of disputes) {
    const ruling = rulings.get(dispute.claim);
    const label = `${dispute.finding} (${dispute.claim})`;
    if (!ruling) needsEvidence.push(`${label}: no ruling returned`);
    else if (ruling.ruling === "ACCEPT")
      (dispute.owner === "acceptance" ? acceptance : implementation).push(
        `[${dispute.finding} ${dispute.severity}] ${dispute.statement}. Correction: ${ruling.correction || dispute.proposed}`,
      );
    else if (ruling.ruling === "NEEDS_EVIDENCE")
      needsEvidence.push(`${label}: ${ruling.reason}`);
  }
  if (implementation.length || acceptance.length) {
    const repair = makeRepair({
      acceptance,
      implementation,
      source: "after-adjudicate",
    });
    return {
      kind: "repair",
      reason: "Accepted findings return to their owners",
      repair,
      fingerprint: repairFingerprint("review", repair),
    };
  }
  if (needsEvidence.length)
    return {
      kind: "blocked",
      reason: "Adjudication needs evidence the factory does not have",
      blocked: {
        code: "needs-evidence",
        detail: needsEvidence.join("; ").slice(0, 1200),
      },
    };
  if (inconclusive.length) return blockedInconclusive(inconclusive);
  return {
    kind: "final",
    reason: "Disputes rejected on the evidence",
    rejected: disputes.length,
  };
}

// Reviews whose findings were all dismissed count as cleared for this candidate.
export function clearedReviews(reviews) {
  return Object.fromEntries(
    Object.entries(reviews).map(([name, review]) => [
      name,
      {
        ...review,
        decision: review.decision === "INCONCLUSIVE" ? "INCONCLUSIVE" : "CLEAR",
        cleared: review.decision !== "CLEAR",
      },
    ]),
  );
}
