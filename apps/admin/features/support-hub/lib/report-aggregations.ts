import { isWithinBusinessHours } from "./business-hours";
import { minutesBetween, toDate } from "./time";

import type {
  SupportBusinessHours,
  SupportConversation,
  SupportLabel,
  SupportMessage,
  SupportReportBucket,
  SupportReportGroupBy,
  SupportReportRange,
  SupportReportRequest,
  SupportReportScope,
  SupportReportSeries,
  SupportReportSlice,
} from "../types";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

interface AggregationInput {
  conversations: SupportConversation[];
  messages: SupportMessage[];
  labels: SupportLabel[];
  businessHours?: SupportBusinessHours | null;
  now?: Date | string;
}

/**
 * Builds a `SupportReportSeries` for the given report request. Filters by
 * range + scope + business-hours, then routes to the metric-specific
 * aggregator. Pure: same inputs always produce the same output.
 */
export function buildReportSeries(
  request: SupportReportRequest,
  input: AggregationInput,
): SupportReportSeries {
  const { range, scope, slice, groupBy, businessHoursOnly } = request;
  const businessHours = businessHoursOnly
    ? (input.businessHours ?? null)
    : null;

  const scopedConversations = filterConversationsByScope(
    input.conversations,
    scope,
  );
  const inRangeConversations = scopedConversations.filter((conversation) =>
    isIsoWithinRange(conversation.createdAt, range),
  );

  const relevantConversationIds = new Set(scopedConversations.map((c) => c.id));
  const inRangeMessages = input.messages.filter(
    (message) =>
      relevantConversationIds.has(message.conversationId) &&
      isIsoWithinRange(message.postedAt, range) &&
      (!businessHours ||
        isWithinBusinessHours(businessHours, message.postedAt)),
  );

  const now = input.now ?? new Date();

  switch (slice) {
    case "volume":
      return buildVolumeSeries(request, scopedConversations, groupBy, now);
    case "messages-received":
      return buildMessageDirectionSeries(
        request,
        inRangeMessages,
        "inbound",
        groupBy,
        now,
      );
    case "messages-sent":
      return buildMessageDirectionSeries(
        request,
        inRangeMessages,
        "outbound",
        groupBy,
        now,
      );
    case "customer-waiting":
      return buildCustomerWaitingSeries(
        request,
        inRangeConversations,
        inRangeMessages,
        businessHours,
        now,
      );
    case "resolution-count":
      return buildResolutionCountSeries(
        request,
        scopedConversations,
        range,
        groupBy,
        now,
      );
    case "open-count":
      return buildOpenCountSeries(request, scopedConversations, now);
    case "snoozed-count":
      return buildSnoozedCountSeries(request, scopedConversations, now);
    case "first-response":
      return buildFirstResponseSeries(
        request,
        inRangeConversations,
        businessHours,
        now,
      );
    case "resolution":
      return buildResolutionSeries(
        request,
        inRangeConversations,
        businessHours,
        now,
      );
    case "label-mix":
      return buildLabelMixSeries(
        request,
        inRangeConversations,
        input.labels,
        now,
      );
    case "agent-mix":
      return buildAgentMixSeries(request, inRangeConversations, now);
    default: {
      const _exhaustive: never = slice;
      void _exhaustive;
      return emptySeries(request, "count", now);
    }
  }
}

export function filterConversationsByScope(
  conversations: SupportConversation[],
  scope: SupportReportScope,
): SupportConversation[] {
  if (scope.kind === "all" || !scope.id) return conversations;
  switch (scope.kind) {
    case "inbox":
      return conversations.filter((c) => c.inboxId === scope.id);
    case "agent":
      return conversations.filter((c) => c.assignee?.id === scope.id);
    case "team":
      return conversations.filter((c) => c.team?.id === scope.id);
    case "label":
      return conversations.filter((c) =>
        c.labels.some((label) => label.id === scope.id),
      );
    default:
      return conversations;
  }
}

export function isIsoWithinRange(
  iso: string | null | undefined,
  range: SupportReportRange,
): boolean {
  if (!iso) return false;
  const value = new Date(iso).getTime();
  if (Number.isNaN(value)) return false;
  const from = new Date(range.from).getTime();
  const to = new Date(range.to).getTime();
  return value >= from && value < to;
}

function groupKey(iso: string, groupBy: SupportReportGroupBy): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "unknown";
  switch (groupBy) {
    case "day":
      return date.toISOString().slice(0, 10);
    case "week": {
      const monday = new Date(date);
      const dayIndex = (monday.getUTCDay() + 6) % 7;
      monday.setUTCDate(monday.getUTCDate() - dayIndex);
      return monday.toISOString().slice(0, 10);
    }
    case "month":
      return date.toISOString().slice(0, 7);
    default:
      return date.toISOString().slice(0, 10);
  }
}

function groupLabel(key: string, groupBy: SupportReportGroupBy): string {
  switch (groupBy) {
    case "day":
      return key;
    case "week":
      return `Week of ${key}`;
    case "month":
      return key;
    default:
      return key;
  }
}

function makeBuckets(
  keys: string[],
  counts: Map<string, number>,
  groupBy: SupportReportGroupBy,
): SupportReportBucket[] {
  return keys.map((key) => ({
    key,
    label: groupLabel(key, groupBy),
    value: counts.get(key) ?? 0,
    secondaryValue: null,
  }));
}

function sortedKeysFromMap(map: Map<string, number>): string[] {
  return [...map.keys()].sort();
}

function buildVolumeSeries(
  request: SupportReportRequest,
  conversations: SupportConversation[],
  groupBy: SupportReportGroupBy,
  now: Date | string,
): SupportReportSeries {
  const counts = new Map<string, number>();
  for (const conversation of conversations) {
    const key = groupKey(conversation.createdAt, groupBy);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const keys = sortedKeysFromMap(counts);
  return {
    slice: "volume",
    generatedAt: toDate(now).toISOString(),
    unit: "count",
    total: conversations.length,
    buckets: makeBuckets(keys, counts, groupBy),
    request,
  };
}

function buildMessageDirectionSeries(
  request: SupportReportRequest,
  messages: SupportMessage[],
  direction: "inbound" | "outbound",
  groupBy: SupportReportGroupBy,
  now: Date | string,
): SupportReportSeries {
  const filtered = messages.filter(
    (message) => message.direction === direction && message.type === "email",
  );
  const counts = new Map<string, number>();
  for (const message of filtered) {
    const key = groupKey(message.postedAt, groupBy);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const keys = sortedKeysFromMap(counts);
  return {
    slice: direction === "inbound" ? "messages-received" : "messages-sent",
    generatedAt: toDate(now).toISOString(),
    unit: "count",
    total: filtered.length,
    buckets: makeBuckets(keys, counts, groupBy),
    request,
  };
}

function buildCustomerWaitingSeries(
  request: SupportReportRequest,
  conversations: SupportConversation[],
  _messages: SupportMessage[],
  _businessHours: SupportBusinessHours | null,
  now: Date | string,
): SupportReportSeries {
  const waiting = conversations.filter(
    (conversation) =>
      conversation.lastMessageDirection === "inbound" &&
      conversation.status !== "resolved",
  );
  const nowIso = toDate(now).toISOString();
  const waitMinutes = waiting
    .map((conversation) =>
      minutesBetween(
        conversation.lastCustomerMessageAt ?? conversation.lastMessageAt,
        nowIso,
      ),
    )
    .filter((value): value is number => value !== null);
  const avg =
    waitMinutes.length === 0
      ? 0
      : Math.round(
          waitMinutes.reduce((sum, value) => sum + value, 0) /
            waitMinutes.length,
        );
  return {
    slice: "customer-waiting",
    generatedAt: toDate(now).toISOString(),
    unit: "minutes",
    total: avg,
    buckets: [
      {
        key: "conversations-waiting",
        label: "Conversations waiting",
        value: waiting.length,
        secondaryValue: null,
      },
      {
        key: "average-wait",
        label: "Average wait (min)",
        value: avg,
        secondaryValue: null,
      },
      {
        key: "longest-wait",
        label: "Longest wait (min)",
        value: waitMinutes.length ? Math.max(...waitMinutes) : 0,
        secondaryValue: null,
      },
    ],
    request,
  };
}

function buildResolutionCountSeries(
  request: SupportReportRequest,
  conversations: SupportConversation[],
  range: SupportReportRange,
  groupBy: SupportReportGroupBy,
  now: Date | string,
): SupportReportSeries {
  const counts = new Map<string, number>();
  let total = 0;
  for (const conversation of conversations) {
    if (!conversation.resolvedAt) continue;
    if (!isIsoWithinRange(conversation.resolvedAt, range)) continue;
    total += 1;
    const key = groupKey(conversation.resolvedAt, groupBy);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const keys = sortedKeysFromMap(counts);
  return {
    slice: "resolution-count",
    generatedAt: toDate(now).toISOString(),
    unit: "count",
    total,
    buckets: makeBuckets(keys, counts, groupBy),
    request,
  };
}

function buildOpenCountSeries(
  request: SupportReportRequest,
  conversations: SupportConversation[],
  now: Date | string,
): SupportReportSeries {
  const open = conversations.filter((c) => c.status === "open").length;
  const pending = conversations.filter((c) => c.status === "pending").length;
  const total = open + pending;
  return {
    slice: "open-count",
    generatedAt: toDate(now).toISOString(),
    unit: "count",
    total,
    buckets: [
      {
        key: "open",
        label: "Open",
        value: open,
        secondaryValue: null,
      },
      {
        key: "pending",
        label: "Pending",
        value: pending,
        secondaryValue: null,
      },
    ],
    request,
  };
}

function buildSnoozedCountSeries(
  request: SupportReportRequest,
  conversations: SupportConversation[],
  now: Date | string,
): SupportReportSeries {
  const nowMs = toDate(now).getTime();
  const snoozed = conversations.filter(
    (c) =>
      c.status === "snoozed" &&
      (c.snoozedUntil ? new Date(c.snoozedUntil).getTime() > nowMs : true),
  );
  const waking = conversations.filter(
    (c) =>
      c.status === "snoozed" &&
      c.snoozedUntil !== null &&
      new Date(c.snoozedUntil).getTime() <= nowMs,
  );
  return {
    slice: "snoozed-count",
    generatedAt: toDate(now).toISOString(),
    unit: "count",
    total: snoozed.length + waking.length,
    buckets: [
      {
        key: "snoozed",
        label: "Currently snoozed",
        value: snoozed.length,
        secondaryValue: null,
      },
      {
        key: "ready-to-wake",
        label: "Ready to wake",
        value: waking.length,
        secondaryValue: null,
      },
    ],
    request,
  };
}

function buildFirstResponseSeries(
  request: SupportReportRequest,
  conversations: SupportConversation[],
  businessHours: SupportBusinessHours | null,
  now: Date | string,
): SupportReportSeries {
  const responded = conversations.filter((c) => c.firstRespondedAt !== null);
  const minutes = responded
    .map((c) => {
      if (!c.firstRespondedAt) return null;
      if (businessHours) {
        return minutesBetween(c.firstMessageAt, c.firstRespondedAt);
      }
      return minutesBetween(c.firstMessageAt, c.firstRespondedAt);
    })
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
    request,
  };
}

function buildResolutionSeries(
  request: SupportReportRequest,
  conversations: SupportConversation[],
  _businessHours: SupportBusinessHours | null,
  now: Date | string,
): SupportReportSeries {
  const resolved = conversations.filter((c) => c.resolvedAt !== null);
  const minutes = resolved
    .map((c) => minutesBetween(c.firstMessageAt, c.resolvedAt))
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
    request,
  };
}

function buildLabelMixSeries(
  request: SupportReportRequest,
  conversations: SupportConversation[],
  labels: SupportLabel[],
  now: Date | string,
): SupportReportSeries {
  const labelById = new Map(labels.map((label) => [label.id, label] as const));
  const counts = new Map<string, number>();
  for (const conversation of conversations) {
    for (const label of conversation.labels) {
      counts.set(label.id, (counts.get(label.id) ?? 0) + 1);
    }
  }
  const buckets: SupportReportBucket[] = [...counts.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([id, value]) => ({
      key: id,
      label: labelById.get(id)?.name ?? id,
      value,
      secondaryValue: null,
    }));
  return {
    slice: "label-mix",
    generatedAt: toDate(now).toISOString(),
    unit: "count",
    total: conversations.length,
    buckets,
    request,
  };
}

function buildAgentMixSeries(
  request: SupportReportRequest,
  conversations: SupportConversation[],
  now: Date | string,
): SupportReportSeries {
  const counts = new Map<string, { name: string; count: number }>();
  for (const conversation of conversations) {
    const assignee = conversation.assignee;
    const key = assignee?.id ?? "unassigned";
    const name = assignee?.name ?? "Unassigned";
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { name, count: 1 });
    }
  }
  const buckets: SupportReportBucket[] = [...counts.entries()]
    .sort(([, a], [, b]) => b.count - a.count)
    .map(([id, entry]) => ({
      key: id,
      label: entry.name,
      value: entry.count,
      secondaryValue: null,
    }));
  return {
    slice: "agent-mix",
    generatedAt: toDate(now).toISOString(),
    unit: "count",
    total: conversations.length,
    buckets,
    request,
  };
}

function emptySeries(
  request: SupportReportRequest,
  unit: SupportReportSeries["unit"],
  now: Date | string,
): SupportReportSeries {
  return {
    slice: request.slice,
    generatedAt: toDate(now).toISOString(),
    unit,
    total: 0,
    buckets: [],
    request,
  };
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = Array.from(values).sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1]! + sorted[mid]!) / 2)
    : Math.round(sorted[mid]!);
}

export function defaultReportRange(days = 30): SupportReportRange {
  const to = new Date();
  const from = new Date(to.getTime() - days * DAY_MS);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function weekRange(): SupportReportRange {
  const to = new Date();
  const from = new Date(to.getTime() - WEEK_MS);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function formatReportRangeLabel(range: SupportReportRange): string {
  return `${range.from.slice(0, 10)} → ${range.to.slice(0, 10)}`;
}

export function defaultSliceFor(slice: SupportReportSlice): SupportReportSlice {
  return slice;
}

void DAY_MS;
void WEEK_MS;
