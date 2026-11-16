const NUMBER_FORMATTER_1 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
/**
 * Formats a major-unit (dollar) amount as en-US USD. Always USD and never
 * divides by 100, so it is wrong for cents or other currencies.
 *
 * @example
 * formatCurrency(1234.5) // "$1,234.50"
 */
export function formatCurrency(amount: number): string {
  return NUMBER_FORMATTER_1.format(amount);
}

/**
 * Extracts up to two initials from a name: the first and last word.
 *
 * @example
 * getInitials('John Doe') // "JD"
 * getInitials('Mary Ann Smith') // "MS"
 * getInitials('Jane') // "J"
 */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}
