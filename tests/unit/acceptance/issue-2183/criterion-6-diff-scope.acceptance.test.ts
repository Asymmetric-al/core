/**
 * Acceptance test for GitHub issue #2183, done criterion 6.
 * Spec (rev 1, Blake-approved 2026-10-21 3:07 PM PT):
 * {@link https://github.com/Asymmetric-al/core/issues/2183#issuecomment-6327313476}
 *
 * "The PR diff" is computed as every path changed between the merge base with
 * develop and the working tree (committed, staged, unstaged and untracked).
 * The base is `ACCEPTANCE_2183_BASE` if set, else `git merge-base HEAD
 * origin/develop`, else the develop tip the spec was checked against
 * (c4fd85dd). Merging develop into the PR branch moves the merge base, so
 * develop's own changes are not counted.
 *
 * Open question: this Acceptance directory is committed on the PR branch
 * before any code, so it is necessarily in the PR diff and is allowed here.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { describe, expect, it } from "vitest";

import {
  ACCEPTANCE_DIR,
  CRITERION_2_TEST_FILE,
  IN_FILES,
  SPEC_BASE_SHA,
  git,
} from "./repo-scan";

const ALLOWED = new Set<string>([
  ...Object.values(IN_FILES),
  CRITERION_2_TEST_FILE,
]);

function diffBase(): string {
  const override = process.env.ACCEPTANCE_2183_BASE?.trim();
  if (override) return override;
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

describe("issue #2183 done criterion 6", () => {
  it('criterion 6: "The PR diff touches only the files listed under "In", plus the test file from criterion 2."', () => {
    const base = diffBase();
    const outside = changedPaths(base).filter(
      (file) => !ALLOWED.has(file) && !file.startsWith(ACCEPTANCE_DIR),
    );
    expect(
      outside,
      `the diff against ${base} touches files outside the spec's "In" list and ${CRITERION_2_TEST_FILE}:\n${outside.join("\n")}`,
    ).toEqual([]);
  });
});
