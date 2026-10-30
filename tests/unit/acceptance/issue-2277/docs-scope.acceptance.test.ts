/**
 * #2277 done criteria 11-12, plus opt-in diff checks for 9 (edited files), 10,
 * 13 (`ACCEPTANCE_2277_SCOPE=1` or `ACCEPTANCE_2277_BASE=<ref>`) and 15
 * (`ACCEPTANCE_2277_PR_BODY_FILE=<path>`); opt-in because they would fail
 * every later PR. Spec r1 plus addendum 1:
 * {@link https://github.com/Asymmetric-al/core/issues/2277#issuecomment-6386065652}
 * Criterion 14 and the "suites still pass" parts are in runtime-checklist.md.
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { read, REPO_ROOT, SPEC_BASE_SHA } from "./harness";

const LABEL_CREATE =
  'gh label create release-blocker --repo Asymmetric-al/core --color B60205 --description "Open issue blocks bun run release:production until closed"';

/** Text from `heading` (exact line) up to the next heading of that level. */
function section(doc: string, heading: string): string {
  const lines = doc.split("\n");
  const start = lines.indexOf(heading);
  expect(start, `heading "${heading}"`).toBeGreaterThan(-1);
  const level = /^#+ /u.exec(heading)![0];
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => /^#+ /u.test(l) && l.startsWith(level));
  return rest.slice(0, end === -1 ? undefined : end).join("\n");
}

/** Paragraphs and list items, with wrapped lines joined. */
const chunks = (text: string) =>
  text
    .split(/\n\s*\n|\n(?=\s*(?:[-*]|\d+\.)\s)/u)
    .map((c) => c.replace(/\s*\n\s*/gu, " "));

describe("issue #2277 criterion 11: docs/ops/production-release.md", () => {
  const doc = read("docs/ops/production-release.md");

  it("the enforced list has a release-blocker bullet", () => {
    const enforced = section(doc, "## What the release command enforces");
    expect(enforced).toMatch(/^\s*[-*] .*release-blocker(?!s)/mu);
  });

  it("## Release blockers covers the command, auth, dry run, override, bypass", () => {
    const body = section(doc, "## Release blockers");
    const parts = chunks(body);
    expect(body).toContain(LABEL_CREATE);
    expect(body).toContain("gh auth status");
    expect(
      parts.some(
        (c) =>
          c.includes("--dry-run") &&
          /\b(gated|enforce[sd]?|refuses?|blocked|applies)\b/iu.test(c),
      ),
      "a statement that --dry-run is gated",
    ).toBe(true);
    expect(
      parts.some((c) => /\bno override\b|\bcannot be overridden\b/iu.test(c)),
      "a statement that there is no override",
    ).toBe(true);
    expect(
      parts.some(
        (c) =>
          c.includes("ASYM_PRODUCTION_PUSH_BYPASS_REASON") &&
          /\bnot gated\b|\bisn't gated\b|\bskips?\b|\bnot checked\b|\bdoes not (check|run)\b/iu.test(
            c,
          ),
      ),
      "a statement that ASYM_PRODUCTION_PUSH_BYPASS_REASON pushes are not gated",
    ).toBe(true);
  });
});

describe("issue #2277 criterion 12: label docs", () => {
  it("general.md Label taxonomy has a `release-blocker` bullet", () => {
    const taxonomy = section(
      read("docs/ai/rules/general.md"),
      "### Label taxonomy (required for every issue)",
    );
    expect(taxonomy).toMatch(/^\s*- .*`release-blocker`/mu);
  });

  it("triage-labels.md has ## Release labels after Factory labels", () => {
    const doc = read("docs/agents/triage-labels.md");
    expect(section(doc, "## Release labels")).toContain("`release-blocker`");
    expect(doc.indexOf("\n## Factory labels\n")).toBeGreaterThan(-1);
    expect(doc.indexOf("\n## Release labels\n")).toBeGreaterThan(
      doc.indexOf("\n## Factory labels\n"),
    );
  });

  it("repo-groundtruth.md release-controls bullet names release-blocker", () => {
    const doc = read("docs/ai/repo-groundtruth.md");
    const bullet =
      /^- Release controls:[^\n]*(?:\n(?![ \t]*(?:-|$))[^\n]*)*/mu.exec(doc);
    expect(bullet, "- Release controls: bullet").not.toBeNull();
    // The label itself, not just the `release-blockers.mjs` file name.
    expect(bullet![0]).toMatch(/release-blocker(?!s)/u);
  });
});

// --- Opt-in diff checks --------------------------------------------------

const BASE_ENV = process.env.ACCEPTANCE_2277_BASE?.trim() ?? "";
const SCOPE_ENABLED =
  process.env.ACCEPTANCE_2277_SCOPE?.trim() === "1" || BASE_ENV !== "";

function git(...args: string[]) {
  const r = spawnSync("git", args, { cwd: REPO_ROOT, encoding: "utf8" });
  return { status: r.status ?? 1, stdout: r.stdout ?? "" };
}

function changedFiles() {
  let base = BASE_ENV;
  if (!base) {
    const mb = git("merge-base", "HEAD", "origin/develop");
    base = mb.status === 0 ? mb.stdout.trim() : SPEC_BASE_SHA;
  }
  expect(git("cat-file", "-e", `${base}^{commit}`).status, base).toBe(0);
  const files = [
    ...git("diff", "--name-only", "--no-renames", base).stdout.split("\n"),
    ...git("ls-files", "--others", "--exclude-standard").stdout.split("\n"),
  ].filter(Boolean);
  return { base, files: [...new Set(files)] };
}

/** §6 declared edits, and the criterion 10 pins. */
const ALLOWED = (
  "scripts/release/release-blockers.mjs scripts/release/production.mjs " +
  "tests/unit/scripts/release-blockers.test.ts docs/ops/production-release.md " +
  "docs/ai/rules/general.md docs/agents/triage-labels.md docs/ai/repo-groundtruth.md"
).split(" ");
const PINNED = (
  "package.json docs/ci.md tooling/shadscan/findings.json " +
  "scripts/git/pre-push-guard.mjs .husky/pre-push " +
  "tests/unit/scripts/production-release.test.ts tests/unit/scripts/production-source.test.ts " +
  "tests/unit/scripts/attribution-retirement.contract.test.ts tests/unit/scripts/pre-push-guard.test.ts"
).split(" ");

describe("issue #2277 criteria 9, 10, 13: diff against the merge base", () => {
  it.skipIf(!SCOPE_ENABLED)(
    "criterion 13: only §6 files change (opt-in: ACCEPTANCE_2277_SCOPE=1 or ACCEPTANCE_2277_BASE=<ref>)",
    () => {
      const { base, files } = changedFiles();
      const outside = files.filter(
        (f) =>
          !ALLOWED.includes(f) &&
          !f.startsWith("tests/unit/acceptance/issue-2277/"),
      );
      expect(outside, `outside §6 vs ${base}`).toEqual([]);
    },
  );

  it.skipIf(!SCOPE_ENABLED)(
    "criterion 10: pinned files and .github/workflows/** are byte-identical (opt-in)",
    () => {
      const { base, files } = changedFiles();
      for (const pinned of PINNED) {
        expect(existsSync(`${REPO_ROOT}/${pinned}`), pinned).toBe(true);
        const r = git("diff", "--quiet", base, "--", pinned);
        expect(r.status, `${pinned} changed vs ${base}`).toBe(0);
      }
      expect(files.filter((f) => f.startsWith(".github/workflows/"))).toEqual(
        [],
      );
    },
  );

  it.skipIf(!SCOPE_ENABLED)(
    "criterion 9: no added or edited file has a token-shaped literal (opt-in)",
    () => {
      const tokenRe =
        /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}\b|\bgithub_pat_[A-Za-z0-9_]{22,}\b/u;
      for (const file of changedFiles().files) {
        if (!existsSync(`${REPO_ROOT}/${file}`)) continue;
        expect(read(file), file).not.toMatch(tokenRe);
      }
    },
  );
});

const BODY_FILE = process.env.ACCEPTANCE_2277_PR_BODY_FILE?.trim() ?? "";

describe("issue #2277 criterion 15: PR body", () => {
  it.skipIf(!BODY_FILE)(
    "has Closes #2277, the production-path flag and the label command marked before merge (opt-in: ACCEPTANCE_2277_PR_BODY_FILE=<path>)",
    () => {
      expect(existsSync(BODY_FILE), BODY_FILE).toBe(true);
      const body = readFileSync(BODY_FILE, "utf8");
      expect(body).toMatch(/\bCloses #2277\b/u);
      expect(body).toMatch(/production[- ](?:release )?path/iu);
      expect(body).toMatch(/\bBlake\b/u);
      expect(body).toContain(LABEL_CREATE);
      expect(body).toMatch(/before merg(?:e|ing)/iu);
    },
  );
});
