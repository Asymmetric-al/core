import { isSupportedCurrency } from "../money";

export function knownCurrency(
  currency: string | null | undefined,
): string | null {
  return currency && isSupportedCurrency(currency)
    ? currency.trim().toUpperCase()
    : null;
}

export function commonMoneyCurrency(
  rows: readonly { amount: number | null; currency?: string | null }[],
): string | null {
  const currency = knownCurrency(rows[0]?.currency);
  if (!currency) return null;
  let total = 0;
  for (const row of rows) {
    if (
      knownCurrency(row.currency) !== currency ||
      row.amount == null ||
      !Number.isSafeInteger(row.amount) ||
      row.amount < 0
    )
      return null;
    total += row.amount;
    if (!Number.isSafeInteger(total)) return null;
  }
  return currency;
}
