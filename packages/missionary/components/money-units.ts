import { formatMoney, isSupportedCurrency } from "@asym/api/money";

export const MONEY_UNAVAILABLE =
  "Money totals and comparisons are unavailable when currencies are mixed or unknown.";

export function moneyCurrency(
  currency: string | null | undefined,
): string | null {
  return currency && isSupportedCurrency(currency)
    ? currency.trim().toUpperCase()
    : null;
}

export function summarizeMoney(
  rows: readonly { amountCents: number | null; currency?: string | null }[],
) {
  const currency = moneyCurrency(rows[0]?.currency);
  const unavailable = { total: null, currency: null };
  if (!currency) return unavailable;
  let total = 0;
  for (const row of rows) {
    if (
      row.amountCents == null ||
      !Number.isSafeInteger(row.amountCents) ||
      row.amountCents < 0 ||
      moneyCurrency(row.currency) !== currency
    )
      return unavailable;
    total += row.amountCents;
    if (!Number.isSafeInteger(total)) return unavailable;
  }
  return { total, currency };
}

export function moneyProgress(
  committed: number | null | undefined,
  committedCurrency: string | null | undefined,
  goal: number | null | undefined,
  goalCurrency: string | null | undefined,
) {
  const currency = moneyCurrency(committedCurrency);
  if (
    !currency ||
    currency !== moneyCurrency(goalCurrency) ||
    committed == null ||
    goal == null ||
    !Number.isSafeInteger(committed) ||
    !Number.isSafeInteger(goal) ||
    committed < 0 ||
    goal <= 0
  )
    return null;
  const covered = Math.min(committed, goal);
  return {
    covered,
    remaining: Math.max(0, goal - committed),
    percent: Math.round((covered / goal) * 100),
  };
}

export function formatCents(
  minorUnits: number | null | undefined,
  currency: string | null | undefined,
): string {
  if (
    minorUnits == null ||
    !Number.isSafeInteger(minorUnits) ||
    !currency ||
    !isSupportedCurrency(currency)
  ) {
    return "Unavailable";
  }
  return formatMoney(minorUnits, currency, "en-US");
}

export function formatCurrencyFromCents(
  minorUnits: number | null | undefined,
  currency: string | null | undefined,
): string {
  const exact = formatCents(minorUnits, currency);
  if (exact === "Unavailable" || minorUnits == null) return exact;
  if (currency?.trim().toUpperCase() === "USD" && minorUnits >= 100000) {
    const thousands = minorUnits / 100000;
    return `$${thousands.toFixed(Number.isInteger(thousands) ? 0 : 1)}k`;
  }
  return exact;
}
