// Performance read model: comparable verified deliveries, cycle time, time
// waiting between rounds and rework, each with its sample size. Every number
// comes from the work items' own records (admission time, round history and
// the evidence bound to the published candidate). Below the minimum sample a
// statistic says there is not enough history instead of estimating, and
// nothing is ranked by lines, tokens or any invented score.
import { measure, type Span } from "./timing";

import type { WorkItem } from "./factory";

export const MIN_SAMPLE = 5;
const OUTCOMES = ["PR_READY", "MERGED"] as const;
type Outcome = (typeof OUTCOMES)[number];
const REWORK_ROUTES = new Set(["repair", "oracle", "review"]);
const REVIEWERS = [
  ["micaiah", "Micaiah"],
  ["luke", "Luke"],
] as const;

export const WAIT_UNAVAILABLE =
  "Rounds do not record when they started, so time spent waiting cannot be measured across issues.";

export type Delivery = {
  issue: number;
  owner: string;
  outcome: Outcome;
  endState: string;
  assignedAt: string;
  at: string | null;
  cycleMs: number | null;
  /** Time between rounds; null when a round's start is not recorded. */
  waitMs: number | null;
  repairRounds: number;
  rounds: number;
  verified: boolean;
  /** Why the delivery is not verified; null when it is. */
  reason: string | null;
  mergedOutside: boolean | null;
  pr: { number: number; url: string } | null;
};

export type Statistic = {
  n: number;
  enough: boolean;
  median: number | null;
  /** The middle half of the sample (25th to 75th percentile). */
  low: number | null;
  high: number | null;
  /** The most recent delivery in the sample: its freshness. */
  latestAt: string | null;
};

export type PerformanceView = {
  observedAt: string;
  minSample: number;
  totals: {
    delivered: number;
    verified: number;
    unverified: number;
    blocked: number;
  };
  cycle: Record<Outcome, Statistic>;
  wait: Statistic & { unavailable: string | null };
  rework: {
    n: number;
    reworked: number;
    enough: boolean;
    /** Share of verified deliveries that needed a repair round. */
    share: number | null;
  };
  owners: {
    owner: string;
    verified: number;
    delivered: number;
    medianCycleMs: number | null;
    reworked: number;
  }[];
  deliveries: Delivery[];
};

function time(value: string | null | undefined) {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

/** Linear interpolation between closest ranks of a sorted sample. */
function quantile(sorted: readonly number[], fraction: number) {
  const position = (sorted.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

export function statistic(
  sample: readonly { value: number; at: string | null }[],
  minSample = MIN_SAMPLE,
): Statistic {
  const values = sample.map((entry) => entry.value).sort((a, b) => a - b);
  const latest = sample.reduce<string | null>(
    (current, entry) =>
      entry.at && (!current || (time(entry.at) ?? 0) > (time(current) ?? 0))
        ? entry.at
        : current,
    null,
  );
  const enough = values.length >= minSample;
  return {
    n: values.length,
    enough,
    median: enough ? quantile(values, 0.5) : null,
    low: enough ? quantile(values, 0.25) : null,
    high: enough ? quantile(values, 0.75) : null,
    latestAt: latest,
  };
}

/**
 * Why a PR_READY or MERGED work item is not a verified delivery, or null when
 * the published head carries CLEAR reviews from both reviewers and a PASS
 * final acceptance for the current acceptance revision.
 */
export function unverifiedReason(item: WorkItem): string | null {
  const pr = item.pr;
  if (!pr) return "No pull request is recorded";
  const published = pr.head ?? item.head ?? null;
  if (!published) return "The published head is not recorded";
  const final = item.final;
  if (!final) return "No final acceptance is recorded";
  if (final.decision !== "PASS")
    return `Final acceptance is ${final.decision}, not PASS`;
  if (final.candidate !== published)
    return "Final acceptance is for a different candidate than the published head";
  const revision = item.acceptance?.revision ?? null;
  if (!revision) return "No acceptance record is stored";
  if (final.acceptanceRevision !== revision)
    return "Final acceptance is for an earlier acceptance revision";
  for (const [key, name] of REVIEWERS) {
    const review = item.reviews?.[key];
    if (!review) return `${name}'s review is not recorded`;
    if (review.decision !== "CLEAR")
      return `${name}'s review is ${review.decision}, not CLEAR`;
    if (review.candidate !== published)
      return `${name}'s review is for a different candidate than the published head`;
    if (review.acceptance && review.acceptance !== revision)
      return `${name}'s review is for an earlier acceptance revision`;
  }
  if (item.status === "MERGED" && !(pr.mergedAt && pr.mergeCommit))
    return "The merge is not recorded with its time and merge commit";
  return null;
}

function finishedRecord(item: WorkItem) {
  return (
    [...item.history]
      .reverse()
      .find((entry) => entry.outcome === item.status) ?? null
  );
}

/**
 * Waiting between rounds: the cycle minus the union of round spans. Only
 * measurable when every round of the issue is still in its history and each
 * records its start.
 */
function waitOf(item: WorkItem, start: number, end: number): number | null {
  if (!item.history.length || item.history.length < item.round) return null;
  const spans: Span[] = [];
  for (const entry of item.history) {
    const from = time(entry.startedAt);
    const to = time(entry.at);
    if (from === null || to === null) return null;
    spans.push({ start: Math.max(start, from), end: Math.min(end, to) });
  }
  return Math.max(0, end - start - measure(spans));
}

export function delivery(
  item: WorkItem,
  mergedOutside: boolean | null,
): Delivery | null {
  if (item.status !== "PR_READY" && item.status !== "MERGED") return null;
  const record = finishedRecord(item);
  const at = record?.at ?? item.pr?.mergedAt ?? item.updatedAt ?? null;
  const start = time(item.assignment.assignedAt);
  const end = time(at);
  const cycle = start !== null && end !== null && end >= start;
  const reason = unverifiedReason(item);
  return {
    issue: item.issue,
    owner: item.assignment.owner,
    outcome: item.status,
    endState: item.assignment.endState,
    assignedAt: item.assignment.assignedAt,
    at,
    cycleMs: cycle ? end - start : null,
    waitMs: cycle ? waitOf(item, start, end) : null,
    repairRounds: item.history.filter((entry) =>
      REWORK_ROUTES.has(entry.route ?? ""),
    ).length,
    rounds: item.round,
    verified: reason === null,
    reason,
    mergedOutside,
    pr: item.pr ? { number: item.pr.number, url: item.pr.url } : null,
  };
}

export function performanceView(
  items: readonly WorkItem[],
  {
    observedAt,
    mergedOutside,
    minSample = MIN_SAMPLE,
  }: {
    observedAt: string;
    mergedOutside: (item: WorkItem) => boolean | null;
    minSample?: number;
  },
): PerformanceView {
  const deliveries = items
    .map((item) => delivery(item, mergedOutside(item)))
    .filter((entry): entry is Delivery => entry !== null)
    .sort(
      (left, right) =>
        (time(right.at) ?? 0) - (time(left.at) ?? 0) ||
        left.issue - right.issue,
    );
  const verified = deliveries.filter((entry) => entry.verified);
  const sample = (
    rows: readonly Delivery[],
    pick: (row: Delivery) => number | null,
  ) =>
    rows.flatMap((row) => {
      const value = pick(row);
      return value === null ? [] : [{ value, at: row.at }];
    });
  const cycle = Object.fromEntries(
    OUTCOMES.map((outcome) => [
      outcome,
      statistic(
        sample(
          verified.filter((row) => row.outcome === outcome),
          (row) => row.cycleMs,
        ),
        minSample,
      ),
    ]),
  ) as Record<Outcome, Statistic>;
  const waits = sample(verified, (row) => row.waitMs);
  const reworked = verified.filter((row) => row.repairRounds > 0).length;
  const owners = new Map<string, Delivery[]>();
  for (const row of deliveries)
    owners.set(row.owner, [...(owners.get(row.owner) ?? []), row]);
  return {
    observedAt,
    minSample,
    totals: {
      delivered: deliveries.length,
      verified: verified.length,
      unverified: deliveries.length - verified.length,
      blocked: items.filter((item) => item.status === "BLOCKED").length,
    },
    cycle,
    wait: {
      ...statistic(waits, minSample),
      unavailable: waits.length ? null : WAIT_UNAVAILABLE,
    },
    rework: {
      n: verified.length,
      reworked,
      enough: verified.length >= minSample,
      share: verified.length >= minSample ? reworked / verified.length : null,
    },
    owners: [...owners.entries()]
      .map(([owner, rows]) => {
        const good = rows.filter((row) => row.verified);
        return {
          owner,
          verified: good.length,
          delivered: rows.length,
          medianCycleMs: statistic(
            sample(good, (row) => row.cycleMs),
            minSample,
          ).median,
          reworked: good.filter((row) => row.repairRounds > 0).length,
        };
      })
      .sort(
        (left, right) =>
          right.verified - left.verified ||
          left.owner.localeCompare(right.owner),
      ),
    deliveries,
  };
}
