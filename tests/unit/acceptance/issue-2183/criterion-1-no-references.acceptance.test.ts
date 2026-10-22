/**
 * Acceptance test for GitHub issue #2183, done criterion 1.
 * Spec (rev 1, Blake-approved 2026-10-21 3:07 PM PT):
 * {@link https://github.com/Asymmetric-al/core/issues/2183#issuecomment-6327313476}
 *
 * Interpretation (reported as open questions):
 * - "tracked files" = `git grep` over the working tree's tracked files.
 * - "dated evidence lines" = a line in a Markdown evidence section (the
 *   nearest heading or one of its parent headings says "evidence") that either
 *   carries a date itself (ISO `2026-08-25`, or a month with a year like
 *   `Oct 2026`) or sits under an evidence heading that carries a date. A date
 *   alone does not make a line evidence: a dated line outside an evidence
 *   section (e.g. "PR Loop remains approved (Oct 2026)" in a README, or a dated
 *   code comment) is still reported.
 * - Criterion 2 requires `301_899_336` in its test file, so that file is
 *   excluded from the ID scan, and this Acceptance directory (which has to
 *   quote both patterns) is excluded from both scans.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { describe, expect, it } from "vitest";

import {
  ACCEPTANCE_DIR,
  CRITERION_2_TEST_FILE,
  DATE_PATTERN,
  type GrepHit,
  formatHits,
  grepTracked,
  markdownSections,
  readRepoFile,
} from "./repo-scan";

const ARCHIVE = "openspec/changes/archive/";

/** The hit's enclosing Markdown headings: the nearest one and its parents. */
function headingChain(hit: GrepHit): string[] {
  const chain: { level: number; heading: string }[] = [];
  for (const section of markdownSections(readRepoFile(hit.file))) {
    if (section.startLine > hit.line) break;
    const level = (/^#+/.exec(section.heading) as RegExpExecArray)[0].length;
    while (
      chain.length > 0 &&
      (chain.at(-1) as { level: number }).level >= level
    ) {
      chain.pop();
    }
    chain.push({ level, heading: section.heading });
  }
  return chain.map((entry) => entry.heading);
}

function isDatedEvidenceLine(hit: GrepHit): boolean {
  if (!hit.file.endsWith(".md")) return false;
  const evidenceHeadings = headingChain(hit).filter((heading) =>
    /evidence/i.test(heading),
  );
  if (evidenceHeadings.length === 0) return false;
  return (
    DATE_PATTERN.test(hit.text) ||
    evidenceHeadings.some((heading) => DATE_PATTERN.test(heading))
  );
}

function offending(pattern: string, extraExcluded: string[] = []): GrepHit[] {
  return grepTracked(pattern).filter(
    (hit) =>
      !hit.file.startsWith(ARCHIVE) &&
      !hit.file.startsWith(ACCEPTANCE_DIR) &&
      !extraExcluded.includes(hit.file) &&
      !isDatedEvidenceLine(hit),
  );
}

describe("issue #2183 done criterion 1", () => {
  it('criterion 1: "In tracked files, `rg "301_?899_?336"` ... return[s] nothing outside `openspec/changes/archive/` and dated evidence lines."', () => {
    const hits = offending("301_?899_?336", [CRITERION_2_TEST_FILE]);
    expect(
      hits,
      `retired Core PR Loop bot ID 301_899_336 is still referenced:\n${formatHits(hits)}`,
    ).toEqual([]);
  });

  it('criterion 1: "In tracked files, ... `rg "PR Loop"` return[s] nothing outside `openspec/changes/archive/` and dated evidence lines."', () => {
    const hits = offending("PR Loop");
    expect(
      hits,
      `"PR Loop" wording is still present:\n${formatHits(hits)}`,
    ).toEqual([]);
  });
});
