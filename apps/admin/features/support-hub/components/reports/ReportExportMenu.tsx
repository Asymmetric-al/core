"use client";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";
import { Download } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import {
  buildCsvExport,
  buildJsonExport,
  downloadReportBlob,
} from "../../lib/report-export";

import type { SupportReportSeries } from "../../types";
interface ReportExportItem {
  label: string;
  series: SupportReportSeries;
}
interface ReportExportMenuProps {
  items: ReportExportItem[];
  disabled?: boolean;
  disabledReason?: string;
}
export function ReportExportMenu({
  items,
  disabled = false,
  disabledReason = "The report is still loading.",
}: ReportExportMenuProps) {
  const reasonId = React.useId();
  const available = items.filter((item) => item.series.buckets.length > 0);
  const reason = disabled
    ? disabledReason
    : available.length === 0
      ? "No data to export for this range."
      : null;
  const handle = (series: SupportReportSeries, format: "csv" | "json") => {
    if (reason) return;
    const file =
      format === "csv" ? buildCsvExport(series) : buildJsonExport(series);
    if (downloadReportBlob(file)) toast.success(`Downloaded ${file.filename}.`);
    else toast.error("Unable to trigger download here.");
  };
  if (reason)
    return (
      <>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled
                focusableWhenDisabled
                aria-describedby={reasonId}
              >
                <Download aria-hidden="true" />
                Export
              </Button>
            }
          />
          <TooltipContent>{reason}</TooltipContent>
        </Tooltip>
        <span id={reasonId} className="sr-only">
          {reason}
        </span>
      </>
    );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button type="button" variant="outline" size="sm">
            <Download aria-hidden="true" />
            Export
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {available.flatMap((item) =>
          (["csv", "json"] as const).map((format) => (
            <DropdownMenuItem
              key={item.label + format}
              onClick={() => handle(item.series, format)}
            >
              {item.label} ({format.toUpperCase()})
            </DropdownMenuItem>
          )),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
