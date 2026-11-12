const NUMBER_FORMATTER_1 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
/**
 * Formats a number as USD currency.
 *
 * @param amount - The numeric amount to format
 * @returns Formatted currency string (e.g., "$1,234.56")
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
