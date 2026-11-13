"use client";

import {
  parseAsBoolean,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from "nuqs";
import * as React from "react";

import { defaultReportRange, localDateKey } from "./report-aggregations";

import type {
  SupportReportGroupBy,
  SupportReportRange,
  SupportReportRequest,
  SupportReportScope,
  SupportReportScopeKind,
  SupportReportSlice,
} from "../types";

const REPORT_GROUP_BY_OPTIONS = ["day", "week", "month"] as const;
const REPORT_SCOPE_KIND_OPTIONS: SupportReportScopeKind[] = [
  "all",
  "inbox",
  "agent",
  "team",
  "label",
];

const DEFAULT_RANGE_DAYS = 30;
const EMPTY_RANGE: SupportReportRange = { from: "", to: "" };

/** Re-reads the viewer's day each minute, so the default window rolls over. */
function subscribeToToday(onChange: () => void) {
  const handle = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(handle);
}

function readToday() {
  return localDateKey(new Date());
}

/**
 * The server has no viewer clock or time zone: it renders an empty window
 * and the browser fills in the viewer's own days once hydrated, so the
 * default "To" is the viewer's today and both renders match.
 */
function readServerToday() {
  return "";
}

function rangeEndingOn(today: string): SupportReportRange {
  const [year, month, day] = today.split("-").map(Number);
  return defaultReportRange(
    DEFAULT_RANGE_DAYS,
    new Date(year!, month! - 1, day!),
  );
}

export interface SupportReportRouteState {
  from: string;
  to: string;
  groupBy: SupportReportGroupBy;
  businessHoursOnly: boolean;
  scopeKind: SupportReportScopeKind;
  scopeId: string;
}

const reportParsers = {
  // Absent means the default window, worked out in the viewer's calendar.
  from: parseAsString,
  to: parseAsString,
  groupBy: parseAsStringEnum<SupportReportGroupBy>([
    ...REPORT_GROUP_BY_OPTIONS,
  ]).withDefault("day"),
  businessHoursOnly: parseAsBoolean.withDefault(false),
  scopeKind: parseAsStringEnum<SupportReportScopeKind>(
    REPORT_SCOPE_KIND_OPTIONS,
  ).withDefault("all"),
  scopeId: parseAsString.withDefault(""),
} as const;

/**
 * Shared route-state hook for every `/support/reports/*` surface. Keeps the
 * filter in the URL so agents can deep-link to a date window + scope +
 * group-by + business-hours pass.
 */
export function useSupportReportRouteState(): {
  state: SupportReportRouteState;
  setState: (next: Partial<SupportReportRouteState>) => void;
  resetState: () => void;
  range: SupportReportRange;
  scope: SupportReportScope;
  request: (slice: SupportReportSlice) => SupportReportRequest;
} {
  const [query, setStateRaw] = useQueryStates(reportParsers);
  const today = React.useSyncExternalStore(
    subscribeToToday,
    readToday,
    readServerToday,
  );

  const range = React.useMemo<SupportReportRange>(() => {
    if (!today) return EMPTY_RANGE;
    const defaults = rangeEndingOn(today);
    return {
      from: query.from ?? defaults.from,
      to: query.to ?? defaults.to,
    };
  }, [query.from, query.to, today]);

  const state = React.useMemo<SupportReportRouteState>(
    () => ({ ...query, from: range.from, to: range.to }),
    [query, range],
  );

  const setState = React.useCallback(
    (next: Partial<SupportReportRouteState>) => {
      void setStateRaw(next);
    },
    [setStateRaw],
  );

  const resetState = React.useCallback(() => {
    void setStateRaw({
      from: null,
      to: null,
      groupBy: "day",
      businessHoursOnly: false,
      scopeKind: "all",
      scopeId: "",
    });
  }, [setStateRaw]);

  const scope = React.useMemo<SupportReportScope>(
    () => ({
      kind: state.scopeKind,
      id: state.scopeKind === "all" ? null : state.scopeId || null,
    }),
    [state.scopeKind, state.scopeId],
  );

  /**
   * Phase 7 perf: build a stable per-slice request map keyed on the
   * underlying state hash. The map regenerates only when the state actually
   * changes, so consumers calling `request("volume")` twice in the same
   * render tree get the same object reference. Without this, every render
   * handed `useSupportReport` a fresh object and forced
   * `buildReportSeries` to re-aggregate on every keystroke.
   */
  const sliceRequests = React.useMemo(() => {
    const cache = new Map<SupportReportSlice, SupportReportRequest>();
    const slices: SupportReportSlice[] = [
      "volume",
      "first-response",
      "resolution",
      "label-mix",
      "agent-mix",
      "team-mix",
      "messages-received",
      "messages-sent",
      "customer-waiting",
      "resolution-count",
      "open-count",
      "snoozed-count",
    ];
    for (const slice of slices) {
      cache.set(slice, {
        slice,
        scope,
        range,
        groupBy: state.groupBy,
        businessHoursOnly: state.businessHoursOnly,
      });
    }
    return cache;
  }, [scope, range, state.groupBy, state.businessHoursOnly]);

  const request = React.useCallback(
    (slice: SupportReportSlice): SupportReportRequest => {
      const cached = sliceRequests.get(slice);
      if (cached) return cached;
      return {
        slice,
        scope,
        range,
        groupBy: state.groupBy,
        businessHoursOnly: state.businessHoursOnly,
      };
    },
    [sliceRequests, scope, range, state.groupBy, state.businessHoursOnly],
  );

  return {
    state,
    setState,
    resetState,
    range,
    scope,
    request,
  };
}
