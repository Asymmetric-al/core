"use client";

import {
  parseAsBoolean,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from "nuqs";
import * as React from "react";

import { defaultReportRange } from "./report-aggregations";

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

const DEFAULT_RANGE = defaultReportRange(30);

export interface SupportReportRouteState {
  from: string;
  to: string;
  groupBy: SupportReportGroupBy;
  businessHoursOnly: boolean;
  scopeKind: SupportReportScopeKind;
  scopeId: string;
}

const reportParsers = {
  from: parseAsString.withDefault(DEFAULT_RANGE.from),
  to: parseAsString.withDefault(DEFAULT_RANGE.to),
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
  const [state, setStateRaw] = useQueryStates(reportParsers);

  const setState = React.useCallback(
    (next: Partial<SupportReportRouteState>) => {
      void setStateRaw(next);
    },
    [setStateRaw],
  );

  const resetState = React.useCallback(() => {
    void setStateRaw({
      from: DEFAULT_RANGE.from,
      to: DEFAULT_RANGE.to,
      groupBy: "day",
      businessHoursOnly: false,
      scopeKind: "all",
      scopeId: "",
    });
  }, [setStateRaw]);

  const range = React.useMemo<SupportReportRange>(
    () => ({ from: state.from, to: state.to }),
    [state.from, state.to],
  );

  const scope = React.useMemo<SupportReportScope>(
    () => ({
      kind: state.scopeKind,
      id: state.scopeKind === "all" ? null : state.scopeId || null,
    }),
    [state.scopeKind, state.scopeId],
  );

  const request = React.useCallback(
    (slice: SupportReportSlice): SupportReportRequest => ({
      slice,
      scope,
      range,
      groupBy: state.groupBy,
      businessHoursOnly: state.businessHoursOnly,
    }),
    [scope, range, state.groupBy, state.businessHoursOnly],
  );

  return {
    state: state as SupportReportRouteState,
    setState,
    resetState,
    range,
    scope,
    request,
  };
}
