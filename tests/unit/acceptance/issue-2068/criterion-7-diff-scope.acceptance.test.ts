/**
 * Acceptance test for GitHub issue #2068, done criterion 7.
 * Spec (rev 1, Blake-approved 2026-10-22 9:28 PM PT, decisions D1a and D2a):
 * {@link https://github.com/Asymmetric-al/core/issues/2068#issuecomment-6357332555}
 *
 * Criterion 7: "The diff touches only
 * `packages/api/src/generated-documents/purpose-catalog/` and
 * `tests/unit/packages/api/document-purpose-*.test.ts`."
 *
 * Opt-in only. This is a one-time scope check for the #2068 PR. In the normal
 * unit suite it would fail every later PR that touches other files, so it is
 * skipped unless `ACCEPTANCE_2068_SCOPE=1` or `ACCEPTANCE_2068_BASE=<ref|sha>`
 * is set. The diff is every path changed between the base (the override, else
 * `git merge-base HEAD origin/develop`, else cc568c92) and the working tree,
 * including untracked files.
 *
 * Open question: this Acceptance directory is committed on the PR branch
 * before any code, so it is necessarily in the diff and is allowed here.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { describe, expect, it } from "vitest";

import {
  ACCEPTANCE_DIR,
  CATALOG_DIR,
  SPEC_BASE_SHA,
  git,
} from "./catalog-scan";

const BASE_OVERRIDE = process.env.ACCEPTANCE_2068_BASE?.trim() ?? "";
const ENABLED =
  process.env.ACCEPTANCE_2068_SCOPE?.trim() === "1" || BASE_OVERRIDE !== "";

const ALLOWED = [
  (file: string) => file.startsWith(`${CATALOG_DIR}/`),
  (file: string) =>
    /^tests\/unit\/packages\/api\/document-purpose-[^/]+\.test\.ts$/.test(file),
  (file: string) => file.startsWith(ACCEPTANCE_DIR),
];

function diffBase(): string {
  if (BASE_OVERRIDE) return BASE_OVERRIDE;
  const mergeBase = git(["merge-base", "HEAD", "origin/develop"]);
  if (mergeBase.status === 0 && mergeBase.stdout.trim()) {
    return mergeBase.stdout.trim();
  }
  return SPEC_BASE_SHA;
}

function changedPaths(base: string): string[] {
  const diff = git(["diff", "--name-only", "--no-renames", base]);
  if (diff.status !== 0) throw new Error(`git diff against ${base} failed`);
  const untracked = git(["ls-files", "--others", "--exclude-standard"]);
  return [
    ...new Set(
      [...diff.stdout.split("\n"), ...untracked.stdout.split("\n")].filter(
        Boolean,
      ),
    ),
  ].sort();
}

if (!ENABLED) {
  describe("issue #2068 done criterion 7 (opt-in)", () => {
    it.skip("skipped: criterion 7 is a one-time scope check for the #2068 PR and would fail every later PR that touches other files; set ACCEPTANCE_2068_SCOPE=1 (diff against git merge-base HEAD origin/develop) or ACCEPTANCE_2068_BASE=<ref|sha> to run it", () => {});
  });
}

describe.skipIf(!ENABLED)("issue #2068 done criterion 7", () => {
  it('criterion 7: "The diff touches only `packages/api/src/generated-documents/purpose-catalog/` and `tests/unit/packages/api/document-purpose-*.test.ts`."', () => {
    const base = diffBase();
    const outside = changedPaths(base).filter(
      (file) => !ALLOWED.some((allowed) => allowed(file)),
    );
    expect(
      outside,
      `the diff against ${base} touches files outside the allowed scope:\n${outside.join("\n")}`,
    ).toEqual([]);
  });
});
