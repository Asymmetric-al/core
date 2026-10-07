"use client";

import { cn } from "@asym/ui/lib/utils";

import type { SupportReportSeries } from "../../types";

interface ReportTableProps {
  series: SupportReportSeries;
  className?: string;
}

/**
 * Tabular fallback for each chart. Always rendered alongside the chart so
 * screen reader users can navigate the same values without interacting with
 * Recharts SVG internals.
 */
export function ReportTable({ series, className }: ReportTableProps) {
  if (series.buckets.length === 0) {
    return null;
  }
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      <table className="w-full text-left text-xs">
        <caption className="sr-only">{series.slice} breakdown</caption>
        <thead className="bg-muted/60 text-sm font-medium text-muted-foreground">
          <tr>
            <th className="px-4 py-2">Label</th>
            <th className="px-4 py-2 text-right">Value</th>
          </tr>
        </thead>
        <tbody>
          {series.buckets.map((bucket) => (
            <tr key={bucket.key} className="border-t border-border">
              <td className="px-4 py-2 text-foreground">{bucket.label}</td>
              <td className="px-4 py-2 text-right font-mono tabular-nums text-foreground">
                {bucket.value.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
