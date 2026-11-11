import type { Donor } from "./donor-types";

const COLUMNS: Array<[header: string, value: (donor: Donor) => string]> = [
  ["Name", (d) => d.name],
  ["Status", (d) => d.status],
  ["Email", (d) => d.email],
  ["Phone", (d) => d.phone],
  ["Lifetime giving (USD)", (d) => dollars(d.total_given)],
  ["Last gift (USD)", (d) => dollars(d.last_gift_amount)],
  ["Last gift date", (d) => (d.last_gift_date ?? "").slice(0, 10)],
  ["Giving frequency", (d) => d.frequency],
  ["Recurring gift", (d) => (d.has_active_pledge ? "Yes" : "No")],
  ["Street", (d) => d.address?.street ?? ""],
  ["City", (d) => d.address?.city ?? ""],
  ["State", (d) => d.address?.state ?? ""],
  ["ZIP", (d) => d.address?.zip ?? ""],
  ["Tags", (d) => d.tags.join("; ")],
];

/** Partner amounts are stored in cents. */
function dollars(cents: number | null | undefined): string {
  return typeof cents === "number" ? (cents / 100).toFixed(2) : "";
}

/**
 * One CSV cell. Values a spreadsheet would run as a formula (=, @, tab,
 * carriage return, or a + or - not starting a number) get a leading
 * apostrophe, per OWASP's CSV injection guidance. Cells with commas,
 * quotes or line breaks are quoted.
 */
function cell(raw: string): string {
  let value = raw ?? "";
  if (/^[=@\t\r]/.test(value) || /^[+-](?![\d\s(])/.test(value)) {
    value = `'${value}`;
  }
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** The partners as a CSV file (RFC 4180 line endings), header first. */
export function partnersToCsv(donors: Donor[]): string {
  const lines = [
    COLUMNS.map(([header]) => cell(header)).join(","),
    ...donors.map((donor) =>
      COLUMNS.map(([, value]) => cell(value(donor))).join(","),
    ),
  ];
  return `${lines.join("\r\n")}\r\n`;
}

export function partnersCsvFilename(now: Date = new Date()): string {
  const day = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  return `partners-${day}.csv`;
}

/** Saves the CSV through the browser's normal download. */
export function downloadPartnersCsv(donors: Donor[]): void {
  // A byte-order mark so Excel reads accented names as UTF-8.
  const blob = new Blob(["﻿", partnersToCsv(donors)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = partnersCsvFilename();
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
