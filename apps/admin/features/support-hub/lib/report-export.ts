import type { SupportReportSeries } from "../types";

/**
 * Render a `SupportReportSeries` into a CSV string. Safe against commas,
 * quotes, and newlines inside bucket labels. The caller is responsible for
 * triggering a browser download (see `downloadReportBlob`).
 */
export function toReportCsv(series: SupportReportSeries): string {
  const header = ["key", "label", "value", "secondary"].join(",");
  const rows = series.buckets.map((bucket) =>
    [
      csvCell(bucket.key),
      csvCell(bucket.label),
      csvCell(String(bucket.value)),
      csvCell(
        bucket.secondaryValue === null ? "" : String(bucket.secondaryValue),
      ),
    ].join(","),
  );
  return [header, ...rows].join("\r\n");
}

/**
 * Render a `SupportReportSeries` into a formatted JSON string suitable for
 * downloading.
 */
export function toReportJson(series: SupportReportSeries): string {
  return JSON.stringify(series, null, 2);
}

export interface ReportExportFile {
  filename: string;
  mimeType: "text/csv" | "application/json";
  contents: string;
}

export function buildCsvExport(series: SupportReportSeries): ReportExportFile {
  return {
    filename: `${series.slice}-${series.generatedAt.slice(0, 10)}.csv`,
    mimeType: "text/csv",
    contents: toReportCsv(series),
  };
}

export function buildJsonExport(series: SupportReportSeries): ReportExportFile {
  return {
    filename: `${series.slice}-${series.generatedAt.slice(0, 10)}.json`,
    mimeType: "application/json",
    contents: toReportJson(series),
  };
}

/**
 * Triggers a browser download via `Blob` + `URL.createObjectURL`. No network
 * round trip. When the environment is not a browser (SSR / tests) the
 * function becomes a no-op so callers don't have to wrap it in try/catch.
 */
export function downloadReportBlob(file: ReportExportFile): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }
  const blob = new Blob([file.contents], { type: file.mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Give Safari a tick before revoking the URL — keeps the download reliable.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

function csvCell(value: string): string {
  if (value === "") return "";
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
