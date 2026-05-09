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
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            From
          </Label>
          <Input
            type="date"
            value={fromInput}
            onChange={(event) => handleDateChange("from", event.target.value)}
            className="h-9 w-[160px] font-mono text-[12px]"
            aria-label={`Start date (${INPUT_DATE})`}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            To
          </Label>
          <Input
            type="date"
            value={toInput}
            onChange={(event) => handleDateChange("to", event.target.value)}
            className="h-9 w-[160px] font-mono text-[12px]"
            aria-label={`End date (${INPUT_DATE})`}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            Group by
          </Label>
          <Select
            value={state.groupBy}
            onValueChange={(value) =>
              setState({ groupBy: value as typeof state.groupBy })
            }
          >
            <SelectTrigger className="h-9 w-[140px] text-[12px]">
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
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            Business hours only
          </Label>
          <div className="flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2">
            <Switch
              checked={state.businessHoursOnly}
              onCheckedChange={(value) =>
                setState({ businessHoursOnly: value })
              }
              aria-label="Business hours only"
            />
            <span className="text-[11px] font-medium text-zinc-600">
              {state.businessHoursOnly ? "On" : "Off"}
            </span>
          </div>
        </div>
        {hideScope ? null : <ReportScopeSelect lockKind={lockScopeKind} />}
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => resetState()}
            className="h-9 gap-1.5 rounded-lg px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
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
