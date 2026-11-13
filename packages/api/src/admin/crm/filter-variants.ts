/**
 * Stored-value spellings for exact-match database filters.
 *
 * CRM vocabulary columns (`donors.type`, `donors.status`) and donation statuses
 * were written by several writers over time: seeds use `at_risk`, the
 * missionary portal writes `At Risk`, and older imports wrote `Succeeded`.
 * PostgREST `.in()` is case- and separator-sensitive, so a filter for one
 * canonical value must list every spelling a writer may have stored, or rows
 * silently drop out of the filtered result.
 */

const SEPARATORS = ["_", " ", "-"] as const;

function capitalize(word: string): string {
  return word.length === 0 ? word : word[0]!.toUpperCase() + word.slice(1);
}

/** Splits a value on any separator into lowercase words: `At Risk` → at, risk. */
export function storedValueWords(value: string): string[] {
  return value
    .trim()
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter((word) => word.length > 0);
}

/** Canonical key for a stored value: lowercase words joined by `_`. */
export function canonicalStoredValue(value: string): string {
  return storedValueWords(value).join("_");
}

/**
 * Every spelling a stored value may carry: each separator (`_`, space, `-`)
 * crossed with lowercase, Title Case, Sentence case and UPPER CASE.
 */
export function expandStoredValueSpellings(
  values: readonly string[],
): string[] {
  const spellings = new Set<string>();

  for (const value of values) {
    const words = storedValueWords(value);
    if (words.length === 0) {
      continue;
    }

    const casings = [
      words,
      words.map(capitalize),
      [capitalize(words[0]!), ...words.slice(1)],
      words.map((word) => word.toUpperCase()),
    ];
    for (const casing of casings) {
      for (const separator of SEPARATORS) {
        spellings.add(casing.join(separator));
      }
    }
  }

  return Array.from(spellings);
}
