import { formatCurrency } from "@asym/lib/utils";

import type { MonthlyGivingPoint } from "./monthly-giving-chart";

/**
 * The monthly chart's numbers for screen readers: one row per month with the
 * exact amount paid. The plotted chart beside it is hidden from assistive
 * tech, so this table is what they read instead.
 */
export function MonthlyGivingTable({
  caption,
  year,
  data,
}: {
  /** Names the chart and its period, e.g. "Paid gifts by month in 2026". */
  caption: string;
  year: string;
  data: MonthlyGivingPoint[];
}) {
  return (
    // A table grows to fit its content whatever its width, so the hidden
    // wrapper does the clipping; sr-only on the table could widen the page.
    <div className="sr-only">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Paid</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={2}>{`No gifts in ${year}.`}</td>
            </tr>
          ) : null}
          {data.map((point, monthIndex) => (
            <tr key={point.month}>
              <th scope="row">
                {new Date(Number(year), monthIndex, 1).toLocaleString("en-US", {
                  month: "long",
                })}
              </th>
              <td>{formatCurrency(point.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
