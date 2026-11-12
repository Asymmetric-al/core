// Publication decisions: Ezra's final result as the factory records it, and
// the evidence a candidate needs before it is pushed.
import { ezraCorrections, makeRepair } from "./repair-logic.mjs";

export function finalDecision(final, acceptance) {
  const ids = new Set(acceptance.criteria.map((criterion) => criterion.id));
  const results = new Map(
    final.criteria.map((criterion) => [criterion.id, criterion]),
  );
  const unmapped = [...ids].filter((id) => !results.has(id));
  const notes = [];
  let decision = final.decision;
  if (final.task_status !== "DONE") {
    decision = "INCONCLUSIVE";
    notes.push(`Ezra reported ${final.task_status} with ${final.decision}`);
  } else if (
    decision === "FAIL" &&
    !final.criteria.some((criterion) => criterion.result === "FAIL")
  ) {
    decision = "INCONCLUSIVE";
    notes.push("FAIL without any failing criterion");
  } else if (
    decision === "PASS" &&
    (unmapped.length ||
      final.criteria.some((criterion) => criterion.result !== "PASS"))
  )
    decision = "INCONCLUSIVE";
  return { decision, unmapped, notes };
}

// I9: Ezra names each criterion's owner. Only "acceptance" goes to Ezra; a
// missing or unknown owner counts as "implementation", so a final FAIL fails
// closed toward Bezalel.
export const criterionOwner = (criterion) =>
  criterion?.owner === "acceptance" ? "acceptance" : "implementation";

// A failing criterion goes to its owner: Ezra when the criterion or its test
// is wrong, otherwise Bezalel.
export function failRepair(final) {
  const failed = final.criteria.filter(
    (criterion) => criterion.result === "FAIL",
  );
  const text = (criterion) =>
    `[${criterion.id}] ${criterion.evidence} Correction: ${criterion.correction}`;
  const acceptanceOwned = (criterion) =>
    criterionOwner(criterion) === "acceptance";
  return {
    repair: makeRepair({
      acceptance: failed.filter(acceptanceOwned).map(text),
      implementation: failed
        .filter((criterion) => !acceptanceOwned(criterion))
        .map(text),
      source: "publish",
    }),
    fingerprint: `final:${failed.map((criterion) => criterion.id).join(",")}`,
  };
}

// Both first-pass reviews CLEAR and Ezra's DONE PASS, all for this candidate
// and the current acceptance revision, with no acceptance correction still
// pending. Returns what is missing.
export function publicationGate({ value, candidate }) {
  const revision = value.acceptance?.revision;
  const problems = [];
  for (const name of ["micaiah", "luke"]) {
    const review = value.reviews?.[name];
    if (!review) problems.push(`${name}: no sealed review`);
    else if (review.decision !== "CLEAR")
      problems.push(`${name}: review is ${review.decision}`);
    else if (review.candidate !== candidate || review.acceptance !== revision)
      problems.push(
        `${name}: review is bound to ${review.candidate} / ${review.acceptance}`,
      );
  }
  const pending = ezraCorrections(value.brief?.repair);
  if (pending.length)
    problems.push(
      `acceptance: ${pending.length} acceptance correction(s) still pending for Ezra`,
    );
  const final = value.final;
  if (!final) problems.push("final: no final acceptance");
  else if (final.decision !== "PASS" || final.taskStatus !== "DONE")
    problems.push(`final: ${final.decision} (${final.taskStatus})`);
  else if (
    final.candidate !== candidate ||
    final.acceptanceRevision !== revision
  )
    problems.push(
      `final: bound to ${final.candidate} / ${final.acceptanceRevision}`,
    );
  return problems;
}

// The PR body's review line. A review is called clear only when the reviewer
// sealed it clear. Findings that Samson assessed as not material, or that
// Agabus rejected, are named as findings that were not upheld: `cleared` marks
// a review whose own verdict was not clear (clearedReviews in review-logic).
function reviewText(review) {
  if (!review?.decision) return "not recorded";
  const count = Number.isSafeInteger(review.findings) ? review.findings : 0;
  const findings = `${count} finding${count === 1 ? "" : "s"}`;
  if (review.decision !== "CLEAR") return review.decision.toLowerCase();
  if (review.cleared)
    return `raised ${count ? findings : "findings"}, not upheld after assessment`;
  return count
    ? `clear, with ${count} optional note${count === 1 ? "" : "s"}`
    : "clear";
}

export function reviewsLine(reviews) {
  return `- Independent reviews: Micaiah ${reviewText(reviews?.micaiah)}; Luke ${reviewText(reviews?.luke)}.`;
}

// The coordinator brief as the PR body shows it: whole, or cut at a line end
// with a note, never in the middle of a sentence.
export function briefText(summary, limit = 4000) {
  const text = String(summary ?? "");
  if (text.length <= limit) return text;
  const head = text.slice(0, limit);
  const end = head.lastIndexOf("\n");
  return `${(end > 0 ? head.slice(0, end) : head).trimEnd()}\n\n_(The coordinator brief is shortened here.)_`;
}

// The PR body's hook line, built only from receipts: freeze records one
// pre-commit receipt per hooked commit (or "earlier-round" when a review round
// re-froze a head committed before), publication records the pre-push proof.
export function hooksLine(freezeHooks, publicationHooks) {
  const preCommit = freezeHooks?.preCommit;
  const committed =
    Array.isArray(preCommit) &&
    preCommit.length > 0 &&
    preCommit.every(
      (receipt) => receipt?.ran === true && receipt.status === "passed",
    )
      ? "Pre-commit hook (lint-staged) ran and passed in this round"
      : preCommit === "earlier-round"
        ? "Pre-commit hook (lint-staged) passed when this candidate was committed in an earlier round"
        : "Pre-commit hook (lint-staged): no pre-commit receipt was recorded for this candidate";
  const pushed =
    publicationHooks?.prePush === true
      ? "pre-push hook ran ci:preflight to '==> PASS ci:preflight' (verified)"
      : "pre-push hook not verified";
  return `- ${committed}; ${pushed}.`;
}
