/**
 * Acceptance tests for #2153: the three prose requirements that the other
 * issue-2153 files left unasserted (mutation gaps found at PR #2232/#2236):
 * the #2156 pointer in .github/CODEOWNERS (OQ-5), the docs/ci.md bullet after
 * the ci-gate bullet (§8 `:16-18`), and the full fail-closed list in the
 * `### acceptance-tests` subsection (§1.1, done criterion 3).
 * Owned by Acceptance; implementers must not edit this file to satisfy their PR.
 * Spec: https://github.com/Asymmetric-al/core/issues/2153#issuecomment-6367102223
 */
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const text = (f: string) => readFileSync(f, "utf8");
const flat = (s: string) => s.replace(/\s+/g, " ");
const md = () => text("docs/ci.md");
/** Body of a heading's section up to the next heading of the same or higher level. */
const section = (doc: string, heading: RegExp) => {
  const lines = doc.split("\n");
  const at = lines.findIndex((l) => heading.test(l));
  if (at < 0) return "";
  const level = /^#+/.exec(lines[at]!)![0].length;
  const end = lines.findIndex(
    (l, i) => i > at && (/^#+ /.exec(l)?.[0].trim().length ?? 99) <= level,
  );
  return flat(lines.slice(at, end < 0 ? undefined : end).join("\n"));
};

describe("#2153 OQ-5: CODEOWNERS comments point to #2156", () => {
  it("a comment line references #2156 for per-role (App) identities", () => {
    const notes = flat(
      text(".github/CODEOWNERS")
        .split("\n")
        .filter((l) => /^\s*#/.test(l))
        .join(" "),
    );
    expect(notes).toMatch(/#2156\b/);
    expect(notes).toMatch(
      /(per-role|identit|roles?)[^#]{0,120}#2156\b|#2156\b[^#]{0,120}(per-role|identit|roles?)/i,
    );
  });
});

describe("#2153 §8 docs/ci.md:16-18: bullet after the ci-gate bullet", () => {
  const bullets = () => md().split("\n");
  it("the bullet right after the ci-gate bullet is about acceptance-tests and the fold", () => {
    const lines = bullets();
    const gate = lines.findIndex((l) => l.startsWith("- `ci-gate`"));
    expect(gate, "no top-level `ci-gate` bullet").toBeGreaterThanOrEqual(0);
    const next = lines.slice(gate + 1).find((l) => l.startsWith("- "));
    expect(next).toBeDefined();
    expect(next!).toMatch(/^- `acceptance-tests`/);
    expect(next!).toContain("test:acceptance");
    expect(next!).toMatch(/GitHub-hosted|ubuntu-latest/i);
    expect(next!).toMatch(/skip/i);
    expect(next!).toContain("`ci-gate`");
  });
});

describe("#2153 §1.1 / criterion 3: docs list every fail-closed case", () => {
  const sub = () => section(md(), /^###\s+`?acceptance-tests`?\s*$/);
  it.each([
    ["Vitest missing", /Vitest[^.;]{0,20}\bmissing\b/i],
    ["spawn failure", /\bspawn/i],
    ["non-zero exit", /non-?zero/i],
    [
      "missing or unreadable summary",
      /summary[^.;]{0,20}\b(missing|unreadable|corrupt)/i,
    ],
    ["zero test files", /zero[^.;]{0,30}\btest files?\b/i],
    ["zero executed tests", /zero tests?[^.;]{0,10}\bexecut/i],
    [
      "skipped/todo do not count",
      /skipped[^.;]{0,20}\btodo\b[^.;]{0,30}\bnot count/i,
    ],
    ["any failed test", /\bany test[^.;]{0,10}\bfail/i],
  ])("the acceptance-tests subsection names: %s", (_name, re) => {
    expect(sub()).toMatch(re);
  });
});
