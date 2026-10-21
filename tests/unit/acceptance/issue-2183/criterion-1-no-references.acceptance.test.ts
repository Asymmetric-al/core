/**
 * Acceptance test for GitHub issue #2183, done criterion 1.
 * Spec (rev 1, Blake-approved 2026-10-21 3:07 PM PT):
 * {@link https://github.com/Asymmetric-al/core/issues/2183#issuecomment-6327313476}
 *
 * Interpretation (reported as open questions):
 * - "tracked files" = `git grep` over the working tree's tracked files.
 * - "dated evidence lines" = a line that itself carries a date (ISO
 *   `2026-08-25`, or a month with a year like `Oct 2026`), or a line inside a
 *   Markdown section whose heading says "evidence" and carries a date.
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

function inDatedEvidenceSection(hit: GrepHit): boolean {
  if (!hit.file.endsWith(".md")) return false;
  const section = markdownSections(readRepoFile(hit.file))
    .filter((candidate) => candidate.startLine <= hit.line)
    .at(-1);
  return (
    section !== undefined &&
    /evidence/i.test(section.heading) &&
    DATE_PATTERN.test(section.heading)
  );
}

function offending(pattern: string, extraExcluded: string[] = []): GrepHit[] {
  return grepTracked(pattern).filter(
    (hit) =>
      !hit.file.startsWith(ARCHIVE) &&
      !hit.file.startsWith(ACCEPTANCE_DIR) &&
      !extraExcluded.includes(hit.file) &&
      !DATE_PATTERN.test(hit.text) &&
      !inDatedEvidenceSection(hit),
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
