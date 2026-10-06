import { isPastDue, minutesBetween, toDate } from "./time";
import { SUPPORT_CONVERSATION_STATUSES } from "../types/conversation";

import type {
  SupportConversation,
  SupportConversationStatus,
  SupportInboxStats,
  SupportInboxStatusBucket,
  SupportInboxView,
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
