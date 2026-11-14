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
      return buildVolumeSeries(request, inRangeConversations, groupBy, now);
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
        scopedConversations,
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
    case "team-mix":
      return buildOwnerMixSeries(request, inRangeConversations, now, "team");
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

/** The viewer's calendar day of `date`, as "YYYY-MM-DD". */
export function localDateKey(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Local midnight at the start of a "YYYY-MM-DD" day, or null if invalid. */
function startOfLocalDay(key: string, addDays = 0): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]) + addDays,
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Report periods are the viewer's calendar days, weeks (from Monday) and
 * months, the same days the date inputs show, not UTC ones.
 */
function groupKey(iso: string, groupBy: SupportReportGroupBy): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "unknown";
  switch (groupBy) {
    case "week": {
      const monday = new Date(date);
      const dayIndex = (monday.getDay() + 6) % 7;
      monday.setDate(monday.getDate() - dayIndex);
      return localDateKey(monday);
    }
    case "month":
      return localDateKey(date).slice(0, 7);
    case "day":
    default:
      return localDateKey(date);
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

/** Most periods one axis fills, so an odd range cannot build a huge axis. */
const MAX_PERIODS = 400;

/** The next period's key after `key` ("2026-04-14", week start, "2026-04"). */
function nextPeriodKey(key: string, groupBy: SupportReportGroupBy): string {
  const cursor = new Date(
    groupBy === "month" ? `${key}-01T00:00:00.000Z` : `${key}T00:00:00.000Z`,
  );
  if (groupBy === "month") {
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    return cursor.toISOString().slice(0, 7);
  }
  cursor.setUTCDate(cursor.getUTCDate() + (groupBy === "week" ? 7 : 1));
  return cursor.toISOString().slice(0, 10);
}

/** Every period key from `first` to `last`, or null past MAX_PERIODS. */
function periodSpan(
  first: string,
  last: string,
  groupBy: SupportReportGroupBy,
): string[] | null {
  const keys: string[] = [];
  for (let key = first; key <= last; key = nextPeriodKey(key, groupBy)) {
    if (keys.length === MAX_PERIODS) return null;
    keys.push(key);
  }
  return keys;
}

/**
 * The periods a time series lists: every period of the selected range, quiet
 * ones at zero, so a chart never draws a line across days, weeks or months
 * that had nothing. When the range holds more periods than MAX_PERIODS,
 * every period with data is still listed (never a truncated axis): the
 * buckets always add up to the series total.
 */
function periodKeys(
  map: Map<string, number>,
  groupBy: SupportReportGroupBy,
  range: SupportReportRange,
): string[] {
  const populated = [...map.keys()].filter((key) => key !== "unknown").sort();
  const unknown = map.has("unknown") ? ["unknown"] : [];
  // The server renders before the viewer's calendar is known, with an
  // empty range: there is no axis to fill then, only populated periods.
  const rangeEndTime = new Date(range.to).getTime() - 1;
  const rangeEnd = Number.isFinite(rangeEndTime)
    ? new Date(rangeEndTime).toISOString()
    : null;
  const first = groupKey(range.from, groupBy);
  const last = rangeEnd ? groupKey(rangeEnd, groupBy) : "unknown";
  const fromRange =
    first !== "unknown" && last !== "unknown"
      ? periodSpan(first, last, groupBy)
      : null;
  if (fromRange) {
    // Data outside the range never reaches here (filtered on the way in),
    // but keep it rather than drop it if it ever does.
    const listed = new Set(fromRange);
    return [
      ...[...fromRange, ...populated.filter((key) => !listed.has(key))].sort(),
      ...unknown,
    ];
  }
  const between =
    populated.length >= 2
      ? periodSpan(populated[0]!, populated[populated.length - 1]!, groupBy)
      : null;
  return [...(between ?? populated), ...unknown];
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
  const keys = periodKeys(counts, groupBy, request.range);
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
  const keys = periodKeys(counts, groupBy, request.range);
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
  const keys = periodKeys(counts, groupBy, request.range);
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
        key: "responded",
        label: "Responded count",
        value: minutes.length,
        secondaryValue: null,
      },
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
  return buildOwnerMixSeries(request, conversations, now, "assignee");
}

function buildOwnerMixSeries(
  request: SupportReportRequest,
  conversations: SupportConversation[],
  now: Date | string,
  owner: "assignee" | "team",
): SupportReportSeries {
  const counts = new Map<string, { name: string; count: number }>();
  for (const conversation of conversations) {
    const assignee = conversation[owner];
    const key = assignee?.id ?? (owner === "team" ? "none" : "unassigned");
    const name =
      assignee?.name ?? (owner === "team" ? "No team" : "Unassigned");
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
    slice: request.slice,
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

/**
 * The default report window: today and the `days` days before it, in the
 * viewer's calendar. `from` is the local midnight that starts the first day
 * and `to` the one that ends today (exclusive), so the "To" input reads
 * today whatever the viewer's offset from UTC.
 */
export function defaultReportRange(
  days = 30,
  now: Date = new Date(),
): SupportReportRange {
  const today = localDateKey(now);
  return {
    from: reportRangeBoundary("from", today, -days) ?? now.toISOString(),
    to: reportRangeBoundary("to", today) ?? now.toISOString(),
  };
}

/**
 * The instant a picked date stands for: the start of a "From" day, or the
 * end of a "To" day (the next local midnight), so the To day is included.
 * Null for an empty or malformed value.
 */
export function reportRangeBoundary(
  field: "from" | "to",
  value: string,
  offsetDays = 0,
): string | null {
  const start = startOfLocalDay(value, offsetDays + (field === "to" ? 1 : 0));
  return start ? start.toISOString() : null;
}

/** The local days a range covers, for the "From" and "To" date inputs. */
export function reportRangeInputValues(range: SupportReportRange): {
  from: string;
  to: string;
} {
  const from = new Date(range.from);
  // `to` is exclusive: its input shows the last day the range includes.
  const lastInstant = new Date(new Date(range.to).getTime() - 1);
  return {
    from: Number.isNaN(from.getTime()) ? "" : localDateKey(from),
    to: Number.isNaN(lastInstant.getTime()) ? "" : localDateKey(lastInstant),
  };
}

void DAY_MS;
void WEEK_MS;
