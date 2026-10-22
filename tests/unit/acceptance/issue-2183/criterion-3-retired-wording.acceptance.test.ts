/**
 * Acceptance test for GitHub issue #2183, done criterion 3.
 * Spec (rev 1, Blake-approved 2026-10-21 3:07 PM PT):
 * {@link https://github.com/Asymmetric-al/core/issues/2183#issuecomment-6327313476}
 *
 * Criterion 3: "No wording in the files listed under "In" calls PR-loop a
 * supported, verified, or kept path, or calls FastPR "pending migration".
 * Each place says retired, with the month."
 *
 * Interpretation (reported as open questions):
 * - A "place" is a Markdown paragraph, list item or heading (or the source
 *   comment in authorize-trigger.ts).
 * - "calls PR-loop a supported, verified, or kept path": a sentence naming
 *   PR-loop that uses supported / verified / kept / keep / preserve / accept /
 *   continue without a negation or "retired" (so "no longer a supported path"
 *   is fine). In spec.md, any scenario whose THEN accepts must not name PR-loop.
 * - The negation (or, in a scenario, "reject") must belong to the PR-loop
 *   claim itself: it has to sit in the same clause as the PR-loop mention,
 *   where a clause ends at another named path (FastPR, Eve, Cursor, Codex,
 *   Blake, Conrad), at ";", or at but / whereas / while / although / though /
 *   yet / however / except / unlike. So "PR-loop is accepted, but
 *   FastPR is retired and rejected" is still reported.
 * - "pending migration": the develop wording is "migration or retirement"
 *   (also "migration-or-retirement"); both are banned outside tasks.md.
 * - tasks.md: the spec forbids rewriting dated evidence or unticking finished
 *   tasks, so its historical lines stay. Instead, section 5 (tasks 42-44) and
 *   section 6 (evidence 53-57) must each carry a note saying FastPR and PR-loop
 *   were retired, with the month, and citing #1427.
 * - authorize-trigger.ts: the spec says the comment names only the Cursor,
 *   Codex Connector and Eve Apps, so PR-loop must simply be gone there.
 * - spec.md:36 (FastPR in the *rejected* scenario) is not required to say
 *   "retired": the spec keeps the `pr-fast` envelope rejected there.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { describe, expect, it } from "vitest";

import {
  FASTPR,
  IN_FILES,
  PR_LOOP,
  type Block,
  markdownBlocks,
  readRepoFile,
  saysRetiredWithMonth,
  sentences,
} from "./repo-scan";

const SUPPORT_WORDS =
  /\b(?:supported|support|verified|verify|kept|keep|keeps|preserv\w*|accept\w*|continu\w*)\b/i;
const NEGATION = /\b(?:retired|no longer|not|never|nor)\b/i;
const PENDING_MIGRATION = /pending migration|migration[- ]or[- ]retirement/i;
const SCENARIO_NEGATION = /\b(?:retired|no longer|not|never|nor|reject\w*)\b/i;
/** Where a PR-loop claim's clause ends: another named path, or a contrast. */
const CLAUSE_BOUNDARY =
  /\bfast[- ]?pr\b|\bpr-fast\b|\b(?:Eve|Cursor|Codex|Blake|Conrad)\b|;|\b(?:but|whereas|while|although|though|yet|however|except|unlike)\b/gi;

/** True when every PR-loop mention in `text` is negated within its own clause. */
function prLoopClaimsNegated(text: string, negation: RegExp): boolean {
  const boundaries = [...text.matchAll(CLAUSE_BOUNDARY)].map((match) => ({
    start: match.index,
    end: match.index + match[0].length,
  }));
  return [...text.matchAll(new RegExp(PR_LOOP.source, "gi"))].every((match) => {
    const before = boundaries.filter((b) => b.end <= match.index).at(-1);
    const after = boundaries.find(
      (b) => b.start >= match.index + match[0].length,
    );
    const clause = text.slice(before?.end ?? 0, after?.start ?? text.length);
    return negation.test(clause);
  });
}

const MARKDOWN_IN_FILES = [
  IN_FILES.proposal,
  IN_FILES.design,
  IN_FILES.spec,
  IN_FILES.tasks,
  IN_FILES.groundtruth,
];
/** Files where every PR-loop place must itself say retired + month. */
const PER_PLACE_FILES = [
  IN_FILES.proposal,
  IN_FILES.design,
  IN_FILES.spec,
  IN_FILES.groundtruth,
];

function blocksOf(file: string): Block[] {
  return markdownBlocks(file, readRepoFile(file));
}

function describeBlock(block: Block): string {
  return `${block.file}:${block.startLine}: ${block.text.replace(/\s+/g, " ").slice(0, 200)}`;
}

describe("issue #2183 done criterion 3", () => {
  it('criterion 3: "No wording in the files listed under "In" calls PR-loop a supported, verified, or kept path" (sentence scan of every In file)', () => {
    const offenders: string[] = [];
    for (const file of MARKDOWN_IN_FILES) {
      for (const block of blocksOf(file)) {
        for (const sentence of sentences(block.text)) {
          if (
            PR_LOOP.test(sentence) &&
            SUPPORT_WORDS.test(sentence) &&
            !prLoopClaimsNegated(sentence, NEGATION)
          ) {
            offenders.push(`${file}:${block.startLine}: ${sentence}`);
          }
        }
      }
    }
    expect(
      offenders,
      `PR-loop is still described as a supported/verified/kept path:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });

  it('criterion 3: "No wording ... calls PR-loop a supported, verified, or kept path" (spec.md: no accepting scenario names PR-loop)', () => {
    const scenarios = readRepoFile(IN_FILES.spec).split(/^(?=#### Scenario:)/m);
    const offenders = scenarios
      .filter((scenario) => scenario.startsWith("#### Scenario:"))
      .filter((scenario) => {
        const then = /\*\*THEN\*\*([\s\S]*?)(?=\n- \*\*|\n#|$)/.exec(scenario);
        return (
          then !== null &&
          /\baccept/i.test(then[1] as string) &&
          scenario
            .split(/\n- \*\*/)
            .some(
              (part) =>
                PR_LOOP.test(part) &&
                !prLoopClaimsNegated(part, SCENARIO_NEGATION),
            )
        );
      })
      .map((scenario) => (scenario.split("\n")[0] as string).trim());
    expect(
      offenders,
      `${IN_FILES.spec}: accepting scenario(s) still name PR-loop:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });

  it('criterion 3: "No wording in the files listed under "In" calls PR-loop a supported, verified, or kept path" (authorize-trigger.ts names only Cursor, Codex Connector and Eve)', () => {
    const offenders = readRepoFile(IN_FILES.authorizeTrigger)
      .split("\n")
      .map((text, index) => ({ text, line: index + 1 }))
      .filter(({ text }) => PR_LOOP.test(text));
    expect(
      offenders,
      `${IN_FILES.authorizeTrigger} still names PR Loop:\n${offenders
        .map(
          ({ text, line }) =>
            `${IN_FILES.authorizeTrigger}:${line}: ${text.trim()}`,
        )
        .join("\n")}`,
    ).toEqual([]);
  });

  it('criterion 3: "No wording ... calls FastPR "pending migration"" (proposal, design, spec, repo-groundtruth)', () => {
    const offenders = PER_PLACE_FILES.flatMap((file) =>
      blocksOf(file).filter((block) => PENDING_MIGRATION.test(block.text)),
    ).map(describeBlock);
    expect(
      offenders,
      `FastPR is still described as pending migration / migration or retirement:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });

  it('criterion 3: "Each place says retired, with the month." (every PR-loop place in proposal, design, spec, repo-groundtruth; every FastPR place in design)', () => {
    const offenders = [
      ...PER_PLACE_FILES.flatMap((file) =>
        blocksOf(file).filter((block) => PR_LOOP.test(block.text)),
      ),
      ...blocksOf(IN_FILES.design).filter((block) => FASTPR.test(block.text)),
    ]
      .filter((block) => !saysRetiredWithMonth(block.text))
      .map(describeBlock);
    expect(
      [...new Set(offenders)],
      `place(s) naming PR-loop/FastPR without "retired" and the month:\n${[...new Set(offenders)].join("\n")}`,
    ).toEqual([]);
  });

  it.each([
    ["## 5. Publish and operational proof", "tasks.md:42-44"],
    ["## 6. Evidence", "tasks.md:53-57"],
  ])(
    'criterion 3: "Each place says retired, with the month." (tasks.md section %s, for %s: a dated note that FastPR and PR-loop are retired and #1427 is closed)',
    (heading, place) => {
      const source = readRepoFile(IN_FILES.tasks);
      const start = source.indexOf(`${heading}\n`);
      expect(
        start,
        `${IN_FILES.tasks}: heading "${heading}" not found`,
      ).toBeGreaterThanOrEqual(0);
      const rest = source.slice(start + heading.length + 1);
      const nextTop = rest.search(/^## /m);
      const section = nextTop === -1 ? rest : rest.slice(0, nextTop);
      const notes = markdownBlocks(IN_FILES.tasks, section).filter(
        (block) =>
          saysRetiredWithMonth(block.text) &&
          FASTPR.test(block.text) &&
          PR_LOOP.test(block.text) &&
          /#1427\b/.test(block.text),
      );
      expect(
        notes.length,
        `${IN_FILES.tasks} section "${heading}" (${place}) has no note saying FastPR and PR-loop were retired (with the month) and citing #1427`,
      ).toBeGreaterThan(0);
    },
  );
});
