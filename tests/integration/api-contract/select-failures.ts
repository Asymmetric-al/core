/**
 * #2708: sorts the select sweep's failures against known-defects.ts. Pure, so
 * the matching rules are unit-tested without a stack.
 */
import type { KnownSelectDefect } from "./known-defects";
import type { SelectSite } from "./select-inventory";

/** One distinct select (all its call sites) that PostgREST refused. */
export type SelectFailure = {
  sites: SelectSite[];
  code: string;
  message: string;
  details: string;
};

export type FailureTriage = {
  /** Failures no entry explains: the sweep fails on these. */
  unexpected: SelectFailure[];
  /** Failures explained by exactly one entry: reported, not failed. */
  known: { entry: KnownSelectDefect; failure: SelectFailure }[];
  /** Entries no failure matches any more: their fix landed; delete them. */
  stale: KnownSelectDefect[];
  /** Entries matching more than one distinct select: too broad, a failure. */
  ambiguous: { entry: KnownSelectDefect; failures: SelectFailure[] }[];
};

export const compactSelect = (select: string) =>
  select.replace(/\s+/g, " ").trim();

/**
 * An entry explains a failure when the file, table and PostgREST code agree
 * and its `match` text occurs in that select string or in PostgREST's message,
 * so a second, different select in the same file is never covered by it.
 */
function matches(entry: KnownSelectDefect, failure: SelectFailure): boolean {
  if (entry.code !== failure.code) return false;
  if (entry.match.trim() === "") return false;
  const site = failure.sites.find(
    (candidate) =>
      candidate.file === entry.file && candidate.table === entry.table,
  );
  if (!site) return false;
  return (
    compactSelect(site.select ?? "").includes(entry.match) ||
    failure.message.includes(entry.match)
  );
}

export function triageFailures(
  failures: readonly SelectFailure[],
  entries: readonly KnownSelectDefect[],
): FailureTriage {
  const triage: FailureTriage = {
    unexpected: [],
    known: [],
    stale: [],
    ambiguous: [],
  };
  const tooBroad = new Set<KnownSelectDefect>();
  for (const entry of entries) {
    const matched = failures.filter((failure) => matches(entry, failure));
    if (matched.length === 0) triage.stale.push(entry);
    if (matched.length > 1) {
      tooBroad.add(entry);
      triage.ambiguous.push({ entry, failures: matched });
    }
  }
  for (const failure of failures) {
    const explaining = entries.filter((entry) => matches(entry, failure));
    if (explaining.some((entry) => tooBroad.has(entry))) continue;
    if (explaining.length === 1)
      triage.known.push({ entry: explaining[0]!, failure });
    else triage.unexpected.push(failure);
  }
  return triage;
}
