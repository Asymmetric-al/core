"use client";

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
import { useSupportReportRouteState } from "../../lib/report-state";

import type { SupportReportScopeKind } from "../../types";

interface ReportFiltersProps {
  /** When set, the scope select is hidden (page has its own scope picker). */
  hideScope?: boolean;
  /** When set, the scope picker is locked to this kind. */
  lockScopeKind?: SupportReportScopeKind;
  /** Slot rendered on the right side (typically an export menu). */
  trailing?: React.ReactNode;
}

const INPUT_DATE = "YYYY-MM-DD";

/**
 * Report filter strip: date range, group-by, business-hours toggle, scope,
 * and an optional trailing slot for the export menu. Writes every value to
 * the URL via `useSupportReportRouteState` so filters survive refresh.
 */
export function ReportFilters({
  hideScope = false,
  lockScopeKind,
  trailing,
}: ReportFiltersProps) {
  const { state, setState, resetState } = useSupportReportRouteState();

  const handleDateChange = (field: "from" | "to", value: string) => {
    if (!value) return;
    const iso = new Date(`${value}T00:00:00.000Z`).toISOString();
    setState({ [field]: iso } as { from?: string; to?: string });
  };

  const fromInput = state.from.slice(0, 10);
  const toInput = state.to.slice(0, 10);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex w-40 flex-col gap-1.5">
          <Label>From</Label>
          <Input
            type="date"
            value={fromInput}
            onChange={(event) => handleDateChange("from", event.target.value)}
            className="w-full"
            aria-label={`Start date (${INPUT_DATE})`}
          />
        </div>
        <div className="flex w-40 flex-col gap-1.5">
          <Label>To</Label>
          <Input
            type="date"
            value={toInput}
            onChange={(event) => handleDateChange("to", event.target.value)}
            className="w-full"
            aria-label={`End date (${INPUT_DATE})`}
          />
        </div>
        <div className="flex w-35 flex-col gap-1.5">
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
            <SelectControlLabel>Group by</SelectControlLabel>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Business hours only</Label>
          <div className="flex h-9 items-center gap-2 px-2">
            <Switch
              checked={state.businessHoursOnly}
              onCheckedChange={(value) =>
                setState({ businessHoursOnly: value })
              }
              aria-label="Business hours only"
            />
            <span className="text-xs font-medium text-muted-foreground">
              {state.businessHoursOnly ? "On" : "Off"}
            </span>
          </div>
        </div>
        {hideScope ? null : <ReportScopeSelect lockKind={lockScopeKind} />}
        <div className="ml-auto flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={() => resetState()}>
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
          {trailing}
        </div>
      </div>
    </div>
  );
}
