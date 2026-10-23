/**
 * Acceptance tests for #2153 done criteria 7-9: `.github/CODEOWNERS` is the
 * single source, covers the protected paths with Blake/Conrad, keeps the #2067
 * owners, and docs/ci.md documents the check and the ownership rules. Uses the
 * same CODEOWNERS semantics (last match wins) as issue-2067's harness.
 * Owned by Acceptance; implementers must not edit this file to satisfy their PR.
 * Spec: https://github.com/Asymmetric-al/core/issues/2153#issuecomment-6367102223
 * Addendum 1 A3 (S-1 dropped: no promise it becomes required):
 * https://github.com/Asymmetric-al/core/issues/2153#issuecomment-6367610407
 */
import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  type CodeownersRule,
  effectiveOwners,
  parseCodeowners,
} from "../issue-2067/command-harness";

const FILE = ".github/CODEOWNERS";
const BLAKE = "@II-ricky-bobby-II";
const CONRAD = "@cobmojo";
const BOTH = [BLAKE, CONRAD].sort();
const text = (f: string) => readFileSync(f, "utf8");
const rules = (): CodeownersRule[] => parseCodeowners(text(FILE));
/** Last matching rule (GitHub semantics), so `*` alone cannot satisfy coverage. */
const lastRule = (file: string) => {
  const all = rules();
  const hit = all.filter((r) => effectiveOwners([r], file) !== undefined);
  return hit.at(-1);
};
const PROTECTED = [
  ".github/workflows/ci.yml",
  ".github/workflows/ci-integration.yml",
  ".github/workflows/nested/new.yml",
  ".github/CODEOWNERS",
  "docs/ai/skills/samson-factory/SKILL.md",
  "docs/ai/skills/brand-new-skill/SKILL.md",
  "docs/ai/skills/a/b/reference.md",
  "supabase/migrations/20260101000000_example.sql",
  "apps/admin/src/migrations/20260101_000000.ts",
  "apps/admin/src/migrations/index.ts",
];
const GITHUB_2067: [string, string[]][] = [
  ["docs/ops/document-cutover/allowlist.json", BOTH],
  ["docs/ops/document-cutover/proofs/2026-10-23T00-00-00.000Z-x.json", [BLAKE]],
];
const flat = (s: string) => s.replace(/\s+/g, " ");
const section = (md: string, heading: RegExp) => {
  const lines = md.split("\n");
  const at = lines.findIndex((l) => heading.test(l));
  if (at < 0) return "";
  const level = /^#+/.exec(lines[at]!)![0].length;
  const end = lines.findIndex(
    (l, i) => i > at && (/^#+ /.exec(l)?.[0].trim().length ?? 99) <= level,
  );
  return flat(lines.slice(at, end < 0 ? undefined : end).join("\n"));
};

describe("#2153 criterion 7: .github/CODEOWNERS effective owners", () => {
  it("the * default stays the first rule, owned by Blake and Conrad", () => {
    expect(rules()[0]).toStrictEqual({ pattern: "*", owners: [BLAKE, CONRAD] });
  });
  it.each(PROTECTED)(
    "%s: explicit (non-*) entry, effective owners Blake + Conrad",
    (f) => {
      const rule = lastRule(f);
      expect(rule?.pattern, `only * covers ${f}`).not.toBe("*");
      expect([...(effectiveOwners(rules(), f) ?? [])].sort()).toEqual(BOTH);
    },
  );
  it.each(GITHUB_2067)("#2067 owners for %s are unchanged", (f, owners) => {
    expect([...(effectiveOwners(rules(), f) ?? [])].sort()).toEqual(owners);
  });
  it("every new protected-path entry sits after * and before the #2067 entries", () => {
    const all = rules();
    const first2067 = all.findIndex((r) => /document-cutover/.test(r.pattern));
    const new2153 = [/workflows/, /CODEOWNERS/, /skills/, /migrations/];
    for (const p of new2153) {
      const hits = all.flatMap((r, i) => (p.test(r.pattern) ? [i] : []));
      expect(hits.length, String(p)).toBeGreaterThan(0);
      for (const i of hits) {
        expect(i, String(p)).toBeGreaterThan(0);
        expect(i, String(p)).toBeLessThan(first2067);
      }
    }
  });
  it("only Blake and Conrad own anything (no teams, Apps, bots or typos)", () => {
    const owners = new Set(rules().flatMap((r) => r.owners));
    expect([...owners].sort()).toEqual(BOTH);
    for (const r of rules()) {
      expect(r.owners.length, r.pattern).toBeGreaterThan(0);
      expect(r.pattern, "GitHub rejects !, [ ] and \\").toMatch(/^[^![\]\\]+$/);
    }
  });
  it("comments map Blake and Conrad to their handles and say Apps cannot own", () => {
    const lines = text(FILE).split("\n");
    const notes = flat(lines.filter((l) => /^\s*#/.test(l)).join(" "));
    const near = (a: string, b: string) =>
      `${a}[^.]{0,40}${b}|${b}[^.]{0,40}${a}`;
    expect(notes).toMatch(new RegExp(near("Blake", BLAKE)));
    expect(notes).toMatch(new RegExp(near("Conrad", CONRAD)));
    expect(notes).toMatch(new RegExp(near("Apps?", "cannot"), "i"));
  });
});

describe("#2153 criterion 8: root CODEOWNERS is gone and no live doc calls it a mirror", () => {
  it("only .github/CODEOWNERS exists (GitHub would read it first anyway)", () => {
    expect(existsSync("CODEOWNERS")).toBe(false);
    expect(existsSync("docs/CODEOWNERS")).toBe(false);
    expect(existsSync(FILE)).toBe(true);
  });
  it.each([
    "CONTRIBUTING.md",
    "docs/guides/development/code-review-and-ownership.md",
    "docs/ai/protected-paths.md",
    "docs/ci.md",
  ])("%s has no root-CODEOWNERS mirror/sync reference", (f) => {
    const body = flat(text(f));
    expect(body).not.toMatch(/`\/CODEOWNERS`|root `?CODEOWNERS/i);
    expect(body).not.toMatch(
      /CODEOWNERS[^.|]{0,60}\b(mirror|in sync)|\bmirror[^.|]{0,60}CODEOWNERS/i,
    );
  });
});

describe("#2153 criterion 9: docs/ci.md documents the check, the fold and ownership", () => {
  const md = () => text("docs/ci.md");
  it("the ci.yml overview row lists acceptance-tests among the jobs", () => {
    const rows = md()
      .split("\n")
      .filter((l) => l.startsWith("|"));
    const row = rows.find((l) => l.includes("`.github/workflows/ci.yml`"));
    expect(row).toContain("`acceptance-tests`");
  });
  it("an acceptance-tests subsection covers command, fail-closed rules, runner, never-skip and the fold", () => {
    const s = section(md(), /^###\s+`?acceptance-tests`?\s*$/);
    expect(s).toContain("test:acceptance");
    expect(s).toMatch(/zero/i);
    expect(s).toMatch(/ubuntu-latest|GitHub-hosted/i);
    expect(s).toMatch(/skip/i);
    expect(s).toContain("ci-gate");
  });
  it("branch protection says acceptance-tests is not itself a required context", () => {
    const s = section(md(), /^## Branch protection/);
    expect(s).toMatch(
      /acceptance-tests`?[^.]{0,160}\bnot\b[^.]{0,80}required/i,
    );
  });
  it("A3: no sentence about acceptance-tests promises it will become required", () => {
    const sentences = flat(md()).split(/(?<=[.;])\s/);
    const future =
      /\b(not yet|yet to|will|eventually|later|once|until|soon|planned|follow-?up|S-1)\b[^.]{0,120}\brequired\b|\brequired\b[^.]{0,60}\b(later|soon|eventually|follow-?up)\b/i;
    for (const s of sentences.filter((x) => x.includes("acceptance-tests")))
      expect(s).not.toMatch(future);
  });
  it("a Code ownership subsection states the single source and the owners", () => {
    const s = section(md(), /^###\s+Code ownership/i);
    expect(s).toContain(".github/CODEOWNERS");
    expect(s).toContain(BLAKE);
    expect(s).toContain(CONRAD);
  });
});
