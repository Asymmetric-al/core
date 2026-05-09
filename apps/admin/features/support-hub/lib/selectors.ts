import { SUPPORT_CONVERSATION_STATUSES } from "../types";
import { isPastDue, minutesBetween, toDate } from "./time";

import type {
  SupportConversation,
  SupportConversationStatus,
  SupportInboxStats,
  SupportInboxStatusBucket,
  SupportInboxView,
  SupportLabel,
  SupportReportBucket,
  SupportReportSeries,
  SupportReportSlice,
  SupportSlaPolicy,
} from "../types";

const ACTIVE_STATUSES: SupportConversationStatus[] = ["open", "pending"];

function isActiveStatus(status: SupportConversationStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export function selectByStatus(
  rows: SupportConversation[],
  status: SupportConversationStatus | "all",
): SupportConversation[] {
  if (status === "all") return rows;
  return rows.filter((row) => row.status === status);
}

export function selectMine(
  rows: SupportConversation[],
  agentId: string | null | undefined,
): SupportConversation[] {
  if (!agentId) return [];
  return rows.filter((row) => row.assignee?.id === agentId);
}

export function selectUnassigned(
  rows: SupportConversation[],
): SupportConversation[] {
  return rows.filter(
    (row) => row.assignee === null && isActiveStatus(row.status),
  );
}

export function selectPastDue(
  rows: SupportConversation[],
  now: Date | string = new Date(),
): SupportConversation[] {
  return rows.filter((row) => {
    if (!isActiveStatus(row.status)) return false;
    if (row.firstRespondedAt === null) {
      return isPastDue(row.firstResponseDueAt, now);
    }
    return isPastDue(row.nextResponseDueAt, now);
  });
}

export function selectEscalated(
  rows: SupportConversation[],
): SupportConversation[] {
  return rows.filter(
    (row) => row.escalatedAt !== null && isActiveStatus(row.status),
  );
}

export function selectWaitingOnAgent(
  rows: SupportConversation[],
): SupportConversation[] {
  return rows.filter(
    (row) =>
      isActiveStatus(row.status) && row.lastMessageDirection === "inbound",
  );
}

export function selectWaitingOnDonor(
  rows: SupportConversation[],
): SupportConversation[] {
  return rows.filter(
    (row) =>
      isActiveStatus(row.status) && row.lastMessageDirection === "outbound",
  );
}

export function selectSlaAtRisk(
  rows: SupportConversation[],
  slaPolicies: SupportSlaPolicy[],
  now: Date | string = new Date(),
  thresholdMinutes = 30,
): SupportConversation[] {
  const policiesById = new Map(
    slaPolicies.map((policy) => [policy.id, policy] as const),
  );
  const nowDate = toDate(now);
  return rows.filter((row) => {
    if (!isActiveStatus(row.status)) return false;
    const policy = row.slaPolicyId ? policiesById.get(row.slaPolicyId) : null;
    if (!policy) return false;
    const due =
      row.firstRespondedAt === null
        ? row.firstResponseDueAt
        : row.nextResponseDueAt;
    if (!due) return false;
    const diffMs = toDate(due).getTime() - nowDate.getTime();
    const minutesUntilDue = diffMs / 60_000;
    return minutesUntilDue >= 0 && minutesUntilDue <= thresholdMinutes;
  });
}

/**
 * Drives the `?view=` toggle in the inbox toolbar. Falls through to the input
 * rows when `view === "all"` so consumers can use this as the single entry
 * point without branching.
 */
export function selectByView(
  rows: SupportConversation[],
  view: SupportInboxView,
  agentId: string | null | undefined,
  now: Date | string = new Date(),
): SupportConversation[] {
  switch (view) {
    case "all":
      return rows;
    case "mine":
      return selectMine(rows, agentId);
    case "unassigned":
      return selectUnassigned(rows);
    case "past-due":
      return selectPastDue(rows, now);
    case "escalated":
      return selectEscalated(rows);
    default: {
      const _exhaustive: never = view;
      void _exhaustive;
      return rows;
    }
  }
}

/**
 * Compose route-state filters into a single predicate over conversations.
 * Used by the list / board / table views and by reports.
 */
export interface SupportConversationFilter {
  view: SupportInboxView;
  status: SupportConversationStatus | "all";
  q: string;
  labelSlugs: string[];
  assignee: string;
  agentId: string | null;
  now?: Date | string;
}

export function selectConversations(
  rows: SupportConversation[],
  filter: SupportConversationFilter,
): SupportConversation[] {
  const now = filter.now ?? new Date();
  const byView = selectByView(rows, filter.view, filter.agentId, now);
  const byStatus = selectByStatus(byView, filter.status);
  const byAssignee = filterByAssignee(
    byStatus,
    filter.assignee,
    filter.agentId,
  );
  const byLabel = filterByLabelSlugs(byAssignee, filter.labelSlugs);
  return filterByQuery(byLabel, filter.q);
}

function filterByAssignee(
  rows: SupportConversation[],
  assignee: string,
  agentId: string | null,
): SupportConversation[] {
  if (assignee.length === 0) return rows;
  if (assignee === "unassigned") {
    return rows.filter((row) => row.assignee === null);
  }
  if (assignee === "me") {
    if (!agentId) return [];
    return rows.filter((row) => row.assignee?.id === agentId);
  }
  return rows.filter((row) => row.assignee?.id === assignee);
}

function filterByLabelSlugs(
  rows: SupportConversation[],
  labelSlugs: string[],
): SupportConversation[] {
  if (labelSlugs.length === 0) return rows;
  const wanted = new Set(labelSlugs);
  return rows.filter((row) =>
    row.labels.some((label) => wanted.has(label.slug)),
  );
}

function filterByQuery(
  rows: SupportConversation[],
  q: string,
): SupportConversation[] {
  const term = q.trim().toLowerCase();
  if (term.length === 0) return rows;
  return rows.filter((row) => {
    const haystack = [
      row.subject,
      row.externalContactEmail,
      row.externalContactName ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  });
}

/**
 * Counts per status with mocked WoW deltas. Real metrics ship in Phase 4.
 * Deltas are deterministic functions of the bucket count so the UI does not
 * jitter between renders.
 */
export function computeInboxStats(
  rows: SupportConversation[],
  now: Date | string = new Date(),
  inboxId: string | null = null,
): SupportInboxStats {
  const filteredRows = inboxId
    ? rows.filter((row) => row.inboxId === inboxId)
    : rows;
  const buckets: SupportInboxStatusBucket[] = SUPPORT_CONVERSATION_STATUSES.map(
    (status) => {
      const count = filteredRows.filter((row) => row.status === status).length;
      return {
        status,
        count,
        deltaPercent: deterministicDelta(status, count),
      };
    },
  );

  const generatedAt = toDate(now);
  const startOfDay = new Date(
    generatedAt.getFullYear(),
    generatedAt.getMonth(),
    generatedAt.getDate(),
  ).toISOString();

  return {
    inboxId,
    generatedAt: generatedAt.toISOString(),
    total: filteredRows.length,
    totalDelta: deterministicDelta("__total__", filteredRows.length),
    buckets,
    pastDueCount: selectPastDue(filteredRows, now).length,
    escalatedCount: selectEscalated(filteredRows).length,
    waitingOnAgentCount: selectWaitingOnAgent(filteredRows).length,
    waitingOnDonorCount: selectWaitingOnDonor(filteredRows).length,
    averageFirstResponseMinutes:
      computeAverageFirstResponseMinutes(filteredRows),
    resolvedTodayCount: countResolvedSince(filteredRows, startOfDay),
  };
}

/**
 * Average wall-clock minutes between the first inbound message and the first
 * agent reply across the conversations that have been responded to. Returns 0
 * when no row qualifies so the stat-card never renders `NaN`.
 */
export function computeAverageFirstResponseMinutes(
  rows: SupportConversation[],
): number {
  const minutes: number[] = [];
  for (const row of rows) {
    if (row.firstRespondedAt === null) continue;
    const delta = minutesBetween(row.firstMessageAt, row.firstRespondedAt);
    if (delta === null) continue;
    if (!Number.isFinite(delta) || delta < 0) continue;
    minutes.push(delta);
  }
  if (minutes.length === 0) return 0;
  const sum = minutes.reduce((acc, value) => acc + value, 0);
  return Math.round(sum / minutes.length);
}

/**
 * Count of conversations whose `resolvedAt` is on or after `sinceIso`.
 * The stat-card uses local-midnight as the cutoff for "resolved today".
 */
export function countResolvedSince(
  rows: SupportConversation[],
  sinceIso: string,
): number {
  const cutoff = toDate(sinceIso).getTime();
  let count = 0;
  for (const row of rows) {
    if (row.resolvedAt === null) continue;
    if (toDate(row.resolvedAt).getTime() >= cutoff) count += 1;
  }
  return count;
}

function deterministicDelta(seed: string, count: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const base = ((hash % 11) + 11) % 11; // 0..10
  const sign = count % 2 === 0 ? 1 : -1;
  return sign * base;
}

/**
 * Compute a single report slice over a conversation set. Stats are kept
 * deterministic so the future Phase 4 charts can render without fixtures.
 */
export function computeReportSlice(
  rows: SupportConversation[],
  slice: SupportReportSlice,
  options: {
    inboxId?: string | null;
    now?: Date | string;
    labels?: SupportLabel[];
  } = {},
): SupportReportSeries {
  const inboxId = options.inboxId ?? null;
  const now = options.now ?? new Date();
  const labels = options.labels ?? [];

  const scoped = inboxId ? rows.filter((row) => row.inboxId === inboxId) : rows;

  switch (slice) {
    case "volume":
      return buildVolumeSlice(scoped, now);
    case "first-response":
      return buildFirstResponseSlice(scoped, now);
    case "resolution":
      return buildResolutionSlice(scoped, now);
    case "label-mix":
      return buildLabelMixSlice(scoped, labels, now);
    case "agent-mix":
      return buildAgentMixSlice(scoped, now);
    case "messages-received":
    case "messages-sent":
    case "customer-waiting":
    case "resolution-count":
    case "open-count":
    case "snoozed-count":
      /**
       * Phase 6 introduced richer report slices that require the full message
       * + business-hours collection. Those aggregations live in
       * `lib/report-aggregations.ts` (`buildReportSeries`) because they need
       * more than the conversation row alone. The light-weight
       * `computeReportSlice` entry-point stays backwards-compatible for the
       * Phase 3 stats strip by returning an empty series for the heavy
       * slices — callers that need real data should use `buildReportSeries`.
       */
      return {
        slice,
        generatedAt: toDate(now).toISOString(),
        unit: slice === "customer-waiting" ? "minutes" : "count",
        total: 0,
        buckets: [],
      };
    default: {
      const _exhaustive: never = slice;
      void _exhaustive;
      return buildVolumeSlice(scoped, now);
    }
  }
}

function buildVolumeSlice(
  rows: SupportConversation[],
  now: Date | string,
): SupportReportSeries {
  const buckets: SupportReportBucket[] = SUPPORT_CONVERSATION_STATUSES.map(
    (status) => {
      const count = rows.filter((row) => row.status === status).length;
      return {
        key: status,
        label: status,
        value: count,
        secondaryValue: null,
      };
    },
  );

  return {
    slice: "volume",
    generatedAt: toDate(now).toISOString(),
    unit: "count",
    total: rows.length,
    buckets,
  };
}

function buildFirstResponseSlice(
  rows: SupportConversation[],
  now: Date | string,
): SupportReportSeries {
  const responded = rows.filter((row) => row.firstRespondedAt !== null);
  const minutes = responded
    .map((row) => minutesBetween(row.firstMessageAt, row.firstRespondedAt))
    .filter((value): value is number => value !== null);
  const avg =
    minutes.length === 0
      ? 0
      : Math.round(
          minutes.reduce((sum, value) => sum + value, 0) / minutes.length,
        );

  return {
    slice: "first-response",
    generatedAt: toDate(now).toISOString(),
    unit: "minutes",
    total: avg,
    buckets: [
      {
        key: "average",
        label: "Average minutes",
        value: avg,
        secondaryValue: null,
      },
      {
        key: "median",
        label: "Median minutes",
        value: median(minutes),
        secondaryValue: null,
      },
    ],
  };
}

function buildResolutionSlice(
  rows: SupportConversation[],
  now: Date | string,
): SupportReportSeries {
  const resolved = rows.filter((row) => row.resolvedAt !== null);
  const minutes = resolved
    .map((row) => minutesBetween(row.firstMessageAt, row.resolvedAt))
    .filter((value): value is number => value !== null);
  const avg =
    minutes.length === 0
      ? 0
      : Math.round(
          minutes.reduce((sum, value) => sum + value, 0) / minutes.length,
        );

  return {
    slice: "resolution",
    generatedAt: toDate(now).toISOString(),
    unit: "minutes",
    total: avg,
    buckets: [
      {
        key: "average",
        label: "Average minutes",
        value: avg,
        secondaryValue: null,
      },
      {
        key: "resolved",
        label: "Resolved count",
        value: resolved.length,
        secondaryValue: null,
      },
    ],
  };
}

function buildLabelMixSlice(
  rows: SupportConversation[],
  labels: SupportLabel[],
  now: Date | string,
): SupportReportSeries {
  const labelById = new Map(labels.map((label) => [label.id, label] as const));
  const counts = new Map<string, number>();
  for (const row of rows) {
    for (const label of row.labels) {
      counts.set(label.id, (counts.get(label.id) ?? 0) + 1);
    }
  }
  const buckets: SupportReportBucket[] = Array.from(counts.entries()).map(
    ([id, value]) => ({
      key: id,
      label: labelById.get(id)?.name ?? id,
      value,
      secondaryValue: null,
    }),
  );
  buckets.sort((a, b) => b.value - a.value);

  return {
    slice: "label-mix",
    generatedAt: toDate(now).toISOString(),
    unit: "count",
    total: rows.length,
    buckets,
  };
}

function buildAgentMixSlice(
  rows: SupportConversation[],
  now: Date | string,
): SupportReportSeries {
  const counts = new Map<string, { name: string; value: number }>();
  for (const row of rows) {
    if (!row.assignee) continue;
    const existing = counts.get(row.assignee.id);
    if (existing) {
      existing.value += 1;
    } else {
      counts.set(row.assignee.id, { name: row.assignee.name, value: 1 });
    }
  }
  const buckets: SupportReportBucket[] = Array.from(counts.entries()).map(
    ([id, entry]) => ({
      key: id,
      label: entry.name,
      value: entry.value,
      secondaryValue: null,
    }),
  );
  buckets.sort((a, b) => b.value - a.value);

  return {
    slice: "agent-mix",
    generatedAt: toDate(now).toISOString(),
    unit: "count",
    total: rows.length,
    buckets,
  };
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    const left = sorted[mid - 1] ?? 0;
    const right = sorted[mid] ?? 0;
    return Math.round((left + right) / 2);
  }
  return Math.round(sorted[mid] ?? 0);
}
