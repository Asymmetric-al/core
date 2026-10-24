/**
 * #2180 done criteria 8-10 (docs), by regex, plus the §8 doc regions.
 * Owned by Acceptance; implementers must not edit.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { DOC } from "./guard-harness";

const read = (file: string) =>
  existsSync(file) ? readFileSync(file, "utf8") : "";
const sha = (text: string) => createHash("sha256").update(text).digest("hex");
const runbook = () => {
  const text = read(DOC);
  expect(text, `${DOC} must exist (spec §1.3, I4)`).not.toBe("");
  return text;
};

/** `id` leads a heading, list item or table row (not a passing mention). */
const LEAD = (id: string) =>
  new RegExp(
    `^(?:#{2,4} [^\\n]*|\\s*(?:[-*]|\\d+\\.)(?: \\[[ x]\\])? *\\**|\\| *\\**)\\b${id}\\b`,
    "m",
  );

describe("#2180 criterion 8: docs/ops/self-hosted-runners.md", () => {
  it("threat table T1-T11 with control, owner and repo-vs-settings columns", () => {
    const lines = runbook().split("\n");
    for (let n = 1; n <= 11; n++) {
      const row = lines.find((l) => new RegExp(`^\\|\\s*\\**T${n}\\b`).test(l));
      expect(row, `table row for T${n}`).toBeDefined();
      expect(
        row!.split("|").filter((c) => c.trim()).length,
      ).toBeGreaterThanOrEqual(4);
      let i = lines.indexOf(row!);
      while (i > 0 && lines[i - 1]!.startsWith("|")) i--;
      const header = lines[i]!;
      expect(header, `T${n} table header`).toMatch(/control/i);
      expect(header, `T${n} table header`).toMatch(/owner/i);
      expect(header, `T${n} table header`).toMatch(/repo|setting/i);
    }
  });
  it("maintainer rule: never Approve and run; push reviewed code to a same-repo branch", () => {
    const text = runbook();
    expect(text).toMatch(/never\b[^\n]{0,40}["“]?Approve and run["”]?/i);
    expect(text).toMatch(/same-repo(?:sitory)? branch/i);
  });
  it("D-2 decision record with the 2026-10-23 readback and a #1906 link", () => {
    const text = runbook();
    expect(text, "a D-2 heading or item").toMatch(LEAD("D-2"));
    expect(text).toContain("2026-10-23");
    expect(text).toMatch(
      /\[#1906\]\([^)]*\/issues\/1906\)|https:\/\/github\.com\/Asymmetric-al\/core\/issues\/1906/,
    );
    expect(text).toContain("pull_request_creation_policy");
    expect(text).toContain("collaborators_only");
  });
  it("admin checklist A1-A7 with read-only readback commands", () => {
    const text = runbook();
    for (let n = 1; n <= 7; n++)
      expect(text, `an A${n} checklist item`).toMatch(LEAD(`A${n}`));
    expect(text).toMatch(/`gh api [^`]+`|```(?:bash|sh)?\n[^`]*gh api /);
    expect(text).toMatch(/gh api [^\n`]*interaction-limits/);
    expect(text).not.toMatch(
      /gh api[^\n`]*(?:-X|--method)\s*(?:PUT|POST|PATCH|DELETE)/i,
    );
  });
  it("D-1 follow-up", () => {
    expect(runbook(), "a D-1 heading or item").toMatch(LEAD("D-1"));
  });
  it("contains no secret values", () => {
    const text = runbook();
    const SECRET = [
      /\bgh[pousr]_[A-Za-z0-9]{20,}/,
      /\bgithub_pat_[A-Za-z0-9_]{20,}/,
      /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
      /\bAKIA[0-9A-Z]{16}\b/,
      /\bxox[abprs]-[A-Za-z0-9-]{10,}/,
      /\b[sr]k_(?:live|test)_[A-Za-z0-9]{10,}/,
      /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\./,
    ];
    for (const re of SECRET) expect(text).not.toMatch(re);
  });
});

const ACCESS = "docs/ops/github-access.md";
describe("#2180 criterion 9: docs/ops/github-access.md (:39-63 only)", () => {
  const section = () => {
    const text = read(ACCESS);
    const start = text.indexOf("## Native restrictions and renewal");
    const end = text.indexOf("GitHub's documented interaction limit covers");
    expect(start, "section heading").toBeGreaterThan(0);
    expect(end, "unchanged tail paragraph").toBeGreaterThan(start);
    return text.slice(start, end);
  };
  it("states the permanent pull_request_creation_policy", () => {
    const s = section();
    expect(s).toContain("pull_request_creation_policy");
    expect(s).toMatch(/permanent|does not expire|non-expiring|never expires/i);
  });
  it("says runner safety does not depend on the interaction limit", () => {
    expect(section().replace(/\s+/g, " ")).toMatch(
      /runner safety does not depend on the interaction limit|interaction limit (?:is not|isn't) a (?:self-hosted )?runner control/i,
    );
  });
  it("edit stays inside :39-63, keeps #1906 and links the new runbook", () => {
    const text = read(ACCESS);
    const head = text.slice(
      0,
      text.indexOf("## Native restrictions and renewal"),
    );
    const tail = text.slice(
      text.indexOf("GitHub's documented interaction limit covers"),
    );
    expect(sha(head)).toBe(
      "2c4506844efb39fedda58847e4f394279ce8858f730dea41b707c6191e00a7e9",
    );
    expect(sha(tail)).toBe(
      "ff72b118bffb4f2fbbcbb530648365a338bf43a039d4a332b5b953bdd6266f79",
    );
    const s = section();
    expect(s).toContain("#1906");
    expect(s).toMatch(/\]\((?:\.\/)?self-hosted-runners\.md(?:#[^)]*)?\)/);
  });
});

/**
 * Accepted docs/ci.md prefixes (ruling 2, #2180 issuecomment-6371787636):
 * develop at a200250f (459 lines, after #2153/#2155/#2223), which the single
 * merge-only sync brings in, and develop at ac69ef6f (431 lines; the spec's
 * ":410" predates #2155), which the unsynced PR head still carries. The file
 * must start with exactly one of these byte prefixes; only the EOF append
 * follows it.
 */
const CI_BASES = [
  {
    ref: "a200250f",
    bytes: 37848,
    sha256: "0560ae8fd108720b4d741be8e6dcbc389039e7a6b8eaa3b0273b762943672ddc",
  },
  {
    ref: "ac69ef6f",
    bytes: 35265,
    sha256: "b546066ff785ea4243ee657cc8fb403a2b28124eaf2c2982bbeb19a87efa6d21",
  },
] as const;
const HEADING = /^#{2,3} Self-hosted runner security\s*$/m;
describe("#2180 criterion 10: docs/ci.md EOF pointer", () => {
  const appended = () => {
    const bytes = readFileSync("docs/ci.md");
    const base = CI_BASES.find(
      (b) => sha(bytes.subarray(0, b.bytes).toString("utf8")) === b.sha256,
    );
    expect(
      base?.ref,
      `existing docs/ci.md bytes unchanged (prefix of develop ${CI_BASES.map((b) => b.ref).join(" or ")})`,
    ).toBeDefined();
    return bytes.subarray(base!.bytes).toString("utf8");
  };
  it("appends only a 'Self-hosted runner security' section of <= 8 lines", () => {
    const added = appended();
    expect(added.replace(/^\n+/, "")).toMatch(
      /^#{2,3} Self-hosted runner security\s*\n/,
    );
    expect(added.match(/^#/gm), "one heading only").toHaveLength(1);
    expect(added.trim().split("\n").length).toBeLessThanOrEqual(8);
  });
  it("points to the runbook and to R1-R3", () => {
    const added = appended();
    expect(added).toMatch(HEADING);
    expect(added).toMatch(
      /\]\((?:\.\/)?ops\/self-hosted-runners\.md(?:#[^)]*)?\)/,
    );
    expect(added).toMatch(/R1\s*(?:[–-]|to)\s*R3|R1\b[\s\S]*R2\b[\s\S]*R3\b/);
    expect(added).not.toContain("@fission-ai/openspec@latest");
  });
});
