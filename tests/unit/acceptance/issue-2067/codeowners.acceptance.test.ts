/**
 * Acceptance tests for GitHub issue #2067 — CODEOWNERS (DC12, as reworded by
 * the addendum).
 * Spec (rev 2, Blake-approved): {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306182453}
 * Addendum: {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6306190263}
 *
 * `.github/CODEOWNERS` has a path-specific entry for
 * docs/ops/document-cutover/allowlist.json owned by `@II-ricky-bobby-II
 * @cobmojo`, and a path-specific entry for docs/ops/document-cutover/proofs/
 * owned by `@II-ricky-bobby-II`, and those are the effective owners (GitHub
 * semantics: last matching pattern wins).
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  ALLOWLIST_REL,
  PROOFS_DIR_REL,
  REPO_ROOT,
  codeownersPatternMatches,
  effectiveOwners,
  parseCodeowners,
} from "./command-harness";

const CODEOWNERS_PATH = path.join(REPO_ROOT, ".github/CODEOWNERS");
const rules = () => parseCodeowners(readFileSync(CODEOWNERS_PATH, "utf8"));

const normalize = (pattern: string) => pattern.replace(/^\//, "");

describe("issue #2067 — DC12 .github/CODEOWNERS", () => {
  it("harness self-check: pattern matching follows CODEOWNERS semantics", () => {
    expect(codeownersPatternMatches("*", "docs/a/b.json")).toBe(true);
    expect(codeownersPatternMatches("/docs/a/", "docs/a/b.json")).toBe(true);
    expect(codeownersPatternMatches("docs/a/", "docs/ab/c.json")).toBe(false);
    expect(codeownersPatternMatches("/docs/a/b.json", "docs/a/b.json")).toBe(
      true,
    );
  });

  it(`DC12: has a path-specific entry for ${ALLOWLIST_REL} owned by @II-ricky-bobby-II @cobmojo`, () => {
    const entries = rules().filter(
      (rule) => normalize(rule.pattern) === ALLOWLIST_REL,
    );
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect([...entry.owners].sort()).toEqual(
        ["@II-ricky-bobby-II", "@cobmojo"].sort(),
      );
    }
    expect([...(effectiveOwners(rules(), ALLOWLIST_REL) ?? [])].sort()).toEqual(
      ["@II-ricky-bobby-II", "@cobmojo"].sort(),
    );
  });

  it(`DC12: has a path-specific entry for ${PROOFS_DIR_REL}/ owned by @II-ricky-bobby-II only`, () => {
    const entries = rules().filter((rule) =>
      [
        `${PROOFS_DIR_REL}/`,
        `${PROOFS_DIR_REL}/**`,
        `${PROOFS_DIR_REL}/*`,
      ].includes(normalize(rule.pattern)),
    );
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(entry.owners).toEqual(["@II-ricky-bobby-II"]);
    }
    expect(
      effectiveOwners(
        rules(),
        `${PROOFS_DIR_REL}/2026-10-20T19-00-00.000Z-acceptance.json`,
      ),
    ).toEqual(["@II-ricky-bobby-II"]);
  });
});
