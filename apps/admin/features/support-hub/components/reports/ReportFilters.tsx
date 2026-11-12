"use client";

import { useIsHydrated } from "@asym/lib/hooks/use-locale-format";
import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectControlLabel,
} from "@asym/ui/components/shadcn/select";
import { Switch } from "@asym/ui/components/shadcn/switch";
import { RotateCcw } from "lucide-react";
import * as React from "react";

import { ReportScopeSelect } from "./ReportScopeSelect";
import {
  reportRangeBoundary,
  reportRangeInputValues,
} from "../../lib/report-aggregations";
import { useSupportReportRouteState } from "../../lib/report-state";

import type { SupportReportScopeKind } from "../../types";

interface ReportFiltersProps {
  /** When set, the scope select is hidden (page has its own scope picker). */
  hideScope?: boolean;
  kinds?: SupportReportScopeKind[];
  /** When set, the scope picker is locked to this kind. */
  lockScopeKind?: SupportReportScopeKind;
  /**
   * Hides Group by, for a report with no periods (a mix across agents or
   * labels): a control the report ignores would only mislead.
   */
  hideGroupBy?: boolean;
  /** Hides Business hours only, for a report that does not apply it. */
  hideBusinessHours?: boolean;
  /** Slot rendered on the right side (typically an export menu). */
  trailing?: React.ReactNode;
}

/**
 * Report filter strip: date range, group-by, business-hours toggle, scope,
 * and an optional trailing slot for the export menu. Writes every value to
 * the URL via `useSupportReportRouteState` so filters survive refresh.
 */
export function ReportFilters({
  hideScope = false,
  kinds,
  lockScopeKind,
  hideGroupBy = false,
  hideBusinessHours = false,
  trailing,
}: ReportFiltersProps) {
  const { state, setState, resetState } = useSupportReportRouteState();
  const id = React.useId();
  const hydrated = useIsHydrated();

  // The inputs are the viewer's calendar days; "To" includes its whole day.
  const handleDateChange = (field: "from" | "to", value: string) => {
    const iso = reportRangeBoundary(field, value);
    if (!iso) return;
    setState({ [field]: iso } as { from?: string; to?: string });
  };

  const { from: fromInput, to: toInput } = reportRangeInputValues({
    from: state.from,
    to: state.to,
  });

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor={id + "-from"}
            className="text-sm font-medium text-muted-foreground"
          >
            From
          </Label>
          <Input
            type="date"
            id={id + "-from"}
            value={hydrated ? fromInput : ""}
            max={toInput || undefined}
            onChange={(event) => handleDateChange("from", event.target.value)}
            className="w-40 font-mono"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor={id + "-to"}
            className="text-sm font-medium text-muted-foreground"
          >
            To
          </Label>
          <Input
            type="date"
            id={id + "-to"}
            value={hydrated ? toInput : ""}
            min={fromInput || undefined}
            onChange={(event) => handleDateChange("to", event.target.value)}
            className="w-40 font-mono"
          />
        </div>
        {hideGroupBy ? null : (
          <div className="flex flex-col gap-1.5">
            <Select<typeof state.groupBy>
              items={[
                { value: "day", label: "Day" },
                { value: "week", label: "Week" },
                { value: "month", label: "Month" },
              ]}
              value={state.groupBy}
              onValueChange={(value) => {
                if (value !== null) setState({ groupBy: value });
              }}
            >
              <SelectControlLabel className="text-sm font-medium text-muted-foreground">
                Group by
              </SelectControlLabel>
              <SelectTrigger className="h-9 w-35">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {hideBusinessHours ? null : (
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor={id + "-business-hours"}
              className="text-sm font-medium text-muted-foreground"
            >
              Business hours only
            </Label>
            <div className="flex h-9 items-center gap-2 px-2">
              <Switch
                id={id + "-business-hours"}
                checked={state.businessHoursOnly}
                onCheckedChange={(value) =>
                  setState({ businessHoursOnly: value })
                }
              />
              <span className="text-xs font-medium text-muted-foreground">
                {state.businessHoursOnly ? "On" : "Off"}
              </span>
            </div>
          </div>
        )}
        {hideScope ? null : (
          <ReportScopeSelect lockKind={lockScopeKind} kinds={kinds} />
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => resetState()}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
          {trailing}
        </div>
      </div>
    </div>
  );
}
