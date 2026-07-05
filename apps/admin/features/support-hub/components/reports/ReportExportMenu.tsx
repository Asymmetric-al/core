"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Download } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import {
  buildCsvExport,
  buildJsonExport,
  downloadReportBlob,
} from "../../lib/report-export";

import type { SupportReportSeries } from "../../types";

interface ReportExportMenuProps {
  series: SupportReportSeries;
  disabled?: boolean;
}

export function ReportExportMenu({ series, disabled }: ReportExportMenuProps) {
  const handle = (format: "csv" | "json") => {
    const file =
      format === "csv" ? buildCsvExport(series) : buildJsonExport(series);
    const ok = downloadReportBlob(file);
    if (ok) {
      toast.success(`Downloaded ${file.filename}.`);
    } else {
      toast.error("Unable to trigger download here.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || series.buckets.length === 0}
            className="h-9 gap-1.5 rounded-lg px-3 text-[11px] font-bold uppercase tracking-wider"
          >
            <Download className="size-3.5" />
            Export
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => handle("csv")}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handle("json")}>
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
