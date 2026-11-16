import { CSV_RECORD_SEPARATOR, CSV_UTF8_BOM, csvSafeCell } from "@asym/lib/csv";
import { formatCents } from "@asym/missionary/components/money-units";

import type { Donor } from "./donor-types";

const COLUMNS: Array<[header: string, value: (donor: Donor) => string]> = [
  ["Name", (d) => d.name],
  ["Status", (d) => d.status],
  ["Email", (d) => d.email],
  ["Phone", (d) => d.phone],
  [
    "Lifetime giving (currency unknown)",
    (donor) => formatCents(donor.total_given, null),
  ],
  [
    "Last gift (currency unknown)",
    (donor) => formatCents(donor.last_gift_amount, null),
  ],
  ["Last gift date", (d) => (d.last_gift_date ?? "").slice(0, 10)],
  ["Giving frequency", (d) => d.frequency],
  ["Recurring gift", (d) => (d.has_active_pledge ? "Yes" : "No")],
  ["Street", (d) => d.address?.street ?? ""],
  ["City", (d) => d.address?.city ?? ""],
  ["State", (d) => d.address?.state ?? ""],
  ["ZIP", (d) => d.address?.zip ?? ""],
  ["Tags", (d) => d.tags.join("; ")],
];

export function partnersToCsv(donors: Donor[]): string {
  const lines = [
    COLUMNS.map(([header]) => csvSafeCell(header)).join(","),
    ...donors.map((donor) =>
      COLUMNS.map(([, value]) => csvSafeCell(value(donor))).join(","),
    ),
  ];
  return `${lines.join(CSV_RECORD_SEPARATOR)}${CSV_RECORD_SEPARATOR}`;
}

export function partnersCsvFilename(now: Date = new Date()): string {
  const day = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  return `partners-${day}.csv`;
}

export function downloadPartnersCsv(donors: Donor[]): void {
  const blob = new Blob([CSV_UTF8_BOM, partnersToCsv(donors)], {
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
