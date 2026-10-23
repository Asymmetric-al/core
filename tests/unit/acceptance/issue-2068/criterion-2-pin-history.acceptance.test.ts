/**
 * Acceptance tests for GitHub issue #2068, done criterion 2.
 * Spec (rev 1, Blake-approved 2026-10-22 9:28 PM PT, decisions D1a and D2a):
 * {@link https://github.com/Asymmetric-al/core/issues/2068#issuecomment-6357332555}
 *
 * Criterion 2: "In the PR's history, one commit pins the **pre-change** digest
 * from `cc568c92` with the tests passing. A later commit changes the catalog
 * and updates the pin. The PR body records both digests."
 *
 * Opt-in only. History and PR-body checks are one-time checks for the #2068
 * PR; on develop after merge, or on any later branch, they would fail, so they
 * are skipped unless enabled:
 * - `ACCEPTANCE_2068_HISTORY=1` walks `git rev-list --first-parent
 *   <base>..HEAD`, where the base is `ACCEPTANCE_2068_BASE` if set, else
 *   `git merge-base HEAD origin/develop`, else cc568c92.
 * - `ACCEPTANCE_2068_PR_BODY_FILE=<path>` reads the PR body from a file (for
 *   example `gh pr view <n> --json body --jq .body > body.md`).
 *
 * How "with the tests passing" is checked: the pre-change pin commit must
 * leave the whole purpose-catalog directory byte-identical to cc568c92 (same
 * git tree), so its live digest is provably {@link PRE_CHANGE_DIGEST} and the
 * pin assertion passes there. Whether the rest of the suite passes on that
 * commit is a CI fact; see runtime-checklist.md.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { getDocumentPurposeCatalogDigest } from "../../../../packages/api/src/generated-documents/purpose-catalog";
import {
  CATALOG_DIR,
  DIGEST_TEST_FILE,
  git,
  hexDigestLiterals,
  PRE_CHANGE_DIGEST,
  SPEC_BASE_SHA,
} from "./catalog-scan";

const HISTORY_ENABLED =
  process.env.ACCEPTANCE_2068_HISTORY?.trim() === "1" ||
  (process.env.ACCEPTANCE_2068_BASE?.trim() ?? "") !== "";
const PR_BODY_FILE = process.env.ACCEPTANCE_2068_PR_BODY_FILE?.trim() ?? "";

function historyBase(): string {
  const override = process.env.ACCEPTANCE_2068_BASE?.trim();
  if (override) return override;
  const mergeBase = git(["merge-base", "HEAD", "origin/develop"]);
  if (mergeBase.status === 0 && mergeBase.stdout.trim()) {
    return mergeBase.stdout.trim();
  }
  return SPEC_BASE_SHA;
}

function treeOf(commit: string, dir: string): string {
  return git(["rev-parse", `${commit}:${dir}`]).stdout.trim();
}

function pinsAt(commit: string): string[] {
  const shown = git(["show", `${commit}:${DIGEST_TEST_FILE}`]);
  return shown.status === 0 ? hexDigestLiterals(shown.stdout) : [];
}

function changedIn(commit: string): string[] {
  const diff = git([
    "diff-tree",
    "--no-commit-id",
    "--name-only",
    "-r",
    "--no-renames",
    "-m",
    "--first-parent",
    commit,
  ]);
  return diff.stdout.split("\n").filter(Boolean);
}

if (!HISTORY_ENABLED) {
  describe("issue #2068 done criterion 2: PR history (opt-in)", () => {
    it.skip("skipped: criterion 2 history is a one-time check for the #2068 PR; set ACCEPTANCE_2068_HISTORY=1 (base: git merge-base HEAD origin/develop) or ACCEPTANCE_2068_BASE=<ref|sha> to run it", () => {});
  });
}

describe.skipIf(!HISTORY_ENABLED)(
  "issue #2068 done criterion 2: PR history",
  () => {
    const commits = HISTORY_ENABLED
      ? git([
          "rev-list",
          "--reverse",
          "--first-parent",
          `${historyBase()}..HEAD`,
        ])
          .stdout.split("\n")
          .filter(Boolean)
      : [];
    const baseCatalogTree = HISTORY_ENABLED
      ? treeOf(SPEC_BASE_SHA, CATALOG_DIR)
      : "";
    const pinCommitIndex = commits.findIndex(
      (commit) =>
        pinsAt(commit).includes(PRE_CHANGE_DIGEST) &&
        treeOf(commit, CATALOG_DIR) === baseCatalogTree,
    );

    it('criterion 2: "one commit pins the **pre-change** digest from `cc568c92` with the tests passing"', () => {
      expect(
        pinCommitIndex,
        `no commit in ${historyBase()}..HEAD pins ${PRE_CHANGE_DIGEST} in ${DIGEST_TEST_FILE} while ${CATALOG_DIR} is still identical to ${SPEC_BASE_SHA}`,
      ).toBeGreaterThanOrEqual(0);
    });

    it('criterion 2: "A later commit changes the catalog and updates the pin."', () => {
      expect(pinCommitIndex).toBeGreaterThanOrEqual(0);
      const later = commits.slice(pinCommitIndex + 1).filter((commit) => {
        const changed = changedIn(commit);
        return (
          changed.some((file) => file.startsWith(`${CATALOG_DIR}/`)) &&
          changed.includes(DIGEST_TEST_FILE) &&
          !pinsAt(commit).includes(PRE_CHANGE_DIGEST)
        );
      });
      expect(
        later,
        "no later commit changes the catalog and replaces the pre-change pin in the same commit",
      ).not.toEqual([]);

      const live = getDocumentPurposeCatalogDigest();
      expect(live, "the catalog digest did not change").not.toBe(
        PRE_CHANGE_DIGEST,
      );
      expect(pinsAt("HEAD")).toContain(live);
      expect(pinsAt("HEAD")).not.toContain(PRE_CHANGE_DIGEST);
    });
  },
);

if (!PR_BODY_FILE) {
  describe("issue #2068 done criterion 2: PR body (opt-in)", () => {
    it.skip("skipped: set ACCEPTANCE_2068_PR_BODY_FILE=<path to the PR body> to check that it records both digests", () => {});
  });
}

describe.skipIf(!PR_BODY_FILE)("issue #2068 done criterion 2: PR body", () => {
  it('criterion 2: "The PR body records both digests."', () => {
    const body = readFileSync(PR_BODY_FILE, "utf8").toLowerCase();
    const live = getDocumentPurposeCatalogDigest();
    expect(live).not.toBe(PRE_CHANGE_DIGEST);
    expect(body, "PR body lacks the pre-change digest").toContain(
      PRE_CHANGE_DIGEST,
    );
    expect(body, "PR body lacks the post-change digest").toContain(live);
  });
});
