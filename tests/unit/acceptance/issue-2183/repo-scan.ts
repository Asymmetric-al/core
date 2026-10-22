/**
 * Shared repo-scan helpers for the GitHub issue #2183 acceptance tests.
 * Spec (rev 1, Blake-approved 2026-10-21 3:07 PM PT):
 * {@link https://github.com/Asymmetric-al/core/issues/2183#issuecomment-6327313476}
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
);

/** develop tip the spec and these tests were written against. */
export const SPEC_BASE_SHA = "c4fd85dd0201d3d0e2d0406c3a0524c239f47f5c";

/** This directory (Acceptance-owned; quotes the patterns it scans for). */
export const ACCEPTANCE_DIR = "tests/unit/acceptance/issue-2183/";

/** The test file named by done criterion 2. */
export const CRITERION_2_TEST_FILE =
  "tests/unit/eve-github-trigger-authorization.test.ts";

const CHANGE = "openspec/changes/enable-team-developer-workflow";

/** The files listed under "In" in spec rev 1. */
export const IN_FILES = {
  authorizeTrigger: "packages/eve-runtime/src/github/authorize-trigger.ts",
  proposal: `${CHANGE}/proposal.md`,
  design: `${CHANGE}/design.md`,
  spec: `${CHANGE}/specs/repository-contribution-workflow/spec.md`,
  tasks: `${CHANGE}/tasks.md`,
  groundtruth: "docs/ai/repo-groundtruth.md",
} as const;

export function git(args: string[]): { status: number; stdout: string } {
  const result = spawnSync("git", args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  return { status: result.status ?? 1, stdout: result.stdout };
}

export interface GrepHit {
  file: string;
  line: number;
  text: string;
}

/**
 * `git grep` over tracked files in the working tree (the "tracked files" of
 * criterion 1; same regex semantics as `rg` for these patterns, case-sensitive).
 */
export function grepTracked(pattern: string): GrepHit[] {
  const result = git(["grep", "-n", "-I", "-E", "-e", pattern]);
  if (result.status === 1) return [];
  if (result.status !== 0) throw new Error(`git grep failed for ${pattern}`);
  return result.stdout
    .split("\n")
    .filter(Boolean)
    .map((raw) => {
      const match = /^(.*?):(\d+):(.*)$/.exec(raw);
      if (!match) throw new Error(`unparseable git grep line: ${raw}`);
      return {
        file: match[1] as string,
        line: Number(match[2]),
        text: match[3] as string,
      };
    });
}

export function readRepoFile(relative: string): string {
  const absolute = path.join(REPO_ROOT, relative);
  if (!existsSync(absolute)) {
    throw new Error(`${relative} does not exist`);
  }
  return readFileSync(absolute, "utf8");
}

export function formatHits(hits: GrepHit[]): string {
  return hits
    .map((hit) => `${hit.file}:${hit.line}: ${hit.text.trim()}`)
    .join("\n");
}

const MONTHS =
  "Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?";

/** An ISO date (2026-10-21) or a month with a year ("Oct 2026", "October 2026"). */
export const DATE_PATTERN = new RegExp(
  `\\b20\\d{2}-\\d{2}(?:-\\d{2})?\\b|\\b(?:${MONTHS})\\.?,? (?:\\d{1,2},? )?20\\d{2}\\b`,
);

/** "retired" plus a month (criterion 3: "Each place says retired, with the month"). */
export function saysRetiredWithMonth(text: string): boolean {
  return /\bretired\b/i.test(text) && DATE_PATTERN.test(text);
}

export const PR_LOOP = /\bPR[- ]?loop\b/i;
export const FASTPR = /\bfast[- ]?pr\b|\bpr-fast\b/i;

export interface Block {
  file: string;
  startLine: number;
  text: string;
}

/**
 * Split a Markdown file into "places": paragraphs, list items and headings.
 * A list item runs until the next list item, heading or blank line.
 */
export function markdownBlocks(file: string, source: string): Block[] {
  const blocks: Block[] = [];
  let current: Block | undefined;
  source.split("\n").forEach((line, index) => {
    const startsItem = /^\s*(?:[-*+]|\d+\.)\s/.test(line);
    const heading = /^#{1,6}\s/.test(line);
    if (line.trim() === "" || startsItem || heading) {
      if (current) blocks.push(current);
      current = undefined;
    }
    if (line.trim() === "") return;
    if (heading) {
      blocks.push({ file, startLine: index + 1, text: line });
      return;
    }
    if (!current) current = { file, startLine: index + 1, text: line };
    else current.text += `\n${line}`;
  });
  if (current) blocks.push(current);
  return blocks;
}

/** Sentences of a block (split on . ; ! ? followed by whitespace). */
export function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.;!?])\s+/)
    .filter(Boolean);
}

/** Markdown sections keyed by heading line, each with its body. */
export function markdownSections(
  source: string,
): { heading: string; startLine: number; body: string }[] {
  const sections: { heading: string; startLine: number; body: string }[] = [];
  source.split("\n").forEach((line, index) => {
    if (/^#{1,6}\s/.test(line)) {
      sections.push({ heading: line, startLine: index + 1, body: "" });
    } else if (sections.length > 0) {
      (sections.at(-1) as { body: string }).body += `${line}\n`;
    }
  });
  return sections;
}
