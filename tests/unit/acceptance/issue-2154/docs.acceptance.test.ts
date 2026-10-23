/**
 * Acceptance tests for GitHub issue #2154 (docs-only), done criteria 1-6.
 * Spec (rev 1, Blake-approved 2026-10-22 9:28 PM PT, decisions D1a and D2a):
 * {@link https://github.com/Asymmetric-al/core/issues/2154#issuecomment-6357332711}
 * Approval and decision text:
 * {@link https://github.com/Asymmetric-al/core/issues/2154#issuecomment-6357392859}
 *
 * Kept deliberately light: focused doc-content and structure checks, one
 * describe block per done criterion. Criterion 7 (CI green) is in
 * runtime-checklist.md.
 *
 * Decisions applied:
 * - D1a (triage mapping): `needs-triage` gets no readiness label; `needs-info`
 *   gets a triage-notes comment and no `Ready`; `ready-for-agent` becomes
 *   `Ready`; `ready-for-human` gets no `Ready` and a human assignee; `wontfix`
 *   means closing the issue with a comment; `status:needs-review` becomes
 *   `factory:ready-to-merge`; only the factory applies `factory:*` labels, and
 *   only to in-flight work.
 * - D2a: the OpenSpec scenario stays out of this PR (tracked in #2199), so it
 *   is not checked here.
 *
 * Interpretation (reported as open questions):
 * - Criterion 1, "historical or compatibility references": a hit passes when
 *   its line or an adjacent line names the replacement (`Ready` in backticks or
 *   a `factory:` label) or carries an explicit marker (historical, legacy,
 *   retired, compatibility, formerly, deprecated, replaced, superseded). The PR
 *   body part is opt-in via `ACCEPTANCE_2154_PR_BODY_FILE=<path>`: every file
 *   with a remaining hit must be named in the body.
 * - Criterion 2: the spec lists photo credits and font names as the only
 *   non-role mentions, so every `David` outside those two data files counts.
 * - Criterion 4: the D1a mapping is checked in the two mapping tables
 *   (`docs/agents/triage-labels.md` and the setup skill's default mapping),
 *   one table row per role.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
);
const SPEC_BASE_SHA = "cc568c92c1cd283d82a4ef9c6d4be7dabe4efee4";
const ACCEPTANCE_DIR = "tests/unit/acceptance/issue-2154/";
const MIRRORS = [".agents", ".claude", ".cursor"];

const SAMSON_SKILL = "docs/ai/skills/samson-factory/SKILL.md";
const SAMSON_PROTOCOL = "docs/ai/skills/samson-factory/references/protocol.md";
const REPO_MAPPING = "docs/agents/triage-labels.md";
const SETUP_MAPPING =
  "docs/ai/skills/setup-matt-pocock-skills/triage-labels.md";
const ISSUE_TRACKER = "docs/agents/issue-tracker.md";
const TRIAGE_DOCS = [
  "docs/ai/skills/triage/SKILL.md",
  "docs/ai/skills/triage/AGENT-BRIEF.md",
  "docs/ai/skills/triage/OUT-OF-SCOPE.md",
];
const STATE_DOCS = [
  ...TRIAGE_DOCS,
  REPO_MAPPING,
  ISSUE_TRACKER,
  SETUP_MAPPING,
  "docs/ai/skills/setup-matt-pocock-skills/SKILL.md",
  "docs/ai/rules/general.md",
];

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  return {
    status: result.status ?? 1,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

function read(relativePath: string): string {
  return readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
}

interface Hit {
  file: string;
  line: number;
  text: string;
}

/** `git grep` over tracked files (same semantics as the spec's `rg` here). */
function grep(args: string[], pathspecs: string[]): Hit[] {
  const result = run("git", ["grep", "-n", "-I", ...args, "--", ...pathspecs]);
  if (result.status === 1) return [];
  if (result.status !== 0) throw new Error(`git grep failed: ${args}`);
  return result.stdout
    .split("\n")
    .filter(Boolean)
    .map((raw) => {
      const match = /^(.*?):(\d+):(.*)$/.exec(raw) as RegExpExecArray;
      return {
        file: match[1] as string,
        line: Number(match[2]),
        text: match[3] as string,
      };
    })
    .filter((hit) => !hit.file.startsWith(ACCEPTANCE_DIR));
}

const show = (hits: Hit[]) =>
  hits.map((hit) => `${hit.file}:${hit.line}: ${hit.text.trim()}`).join("\n");

/** Blank-line or list-item separated blocks of a Markdown file. */
function blocks(text: string): string[] {
  return text
    .split(/\n\s*\n|\n(?=\s*(?:\d+\.|[-*])\s)/)
    .map((block) => block.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/** The table row or list item whose first backticked token is `role`. */
function roleRow(text: string, role: string): string | undefined {
  return text
    .split("\n")
    .find((line) => new RegExp(`^\\s*(?:\\||[-*])\\s*\`${role}\``).test(line));
}

// --- Criterion 1 -----------------------------------------------------------

const RETIRED = "ready-for-agent|status:(ready|blocked|todo|needs-review)";
const REPLACEMENT_OR_MARKER =
  /`Ready`|`factory:|\b(historical|legacy|retired|compatib\w*|formerly|deprecated|replac\w*|superseded)\b/i;

function retiredHits(): Hit[] {
  return grep(["-E", "-e", RETIRED], ["docs/ai", "docs/agents", ...MIRRORS]);
}

function unexplained(hits: Hit[]): Hit[] {
  const cache = new Map<string, string[]>();
  return hits.filter((hit) => {
    const lines = cache.get(hit.file) ?? read(hit.file).split("\n");
    cache.set(hit.file, lines);
    const window = lines.slice(Math.max(0, hit.line - 2), hit.line + 1);
    return !window.some((line) => REPLACEMENT_OR_MARKER.test(line));
  });
}

describe("issue #2154 done criterion 1: retired readiness/status labels", () => {
  it('criterion 1: `rg -n "ready-for-agent|status:(ready|blocked|todo|needs-review)"` returns only historical or compatibility references', () => {
    const hits = unexplained(retiredHits());
    expect(
      hits,
      `retired labels still used as live instructions:\n${show(hits)}`,
    ).toEqual([]);
  });

  const bodyFile = process.env.ACCEPTANCE_2154_PR_BODY_FILE?.trim() ?? "";
  it.skipIf(!bodyFile)(
    "criterion 1: the PR body explains each remaining reference (opt-in: ACCEPTANCE_2154_PR_BODY_FILE=<path>)",
    () => {
      const body = readFileSync(bodyFile, "utf8");
      const files = [...new Set(retiredHits().map((hit) => hit.file))];
      const missing = files.filter(
        (file) =>
          !body.includes(file) &&
          !MIRRORS.some(
            (mirror) =>
              file.startsWith(`${mirror}/skills/`) &&
              body.includes(
                file.replace(`${mirror}/skills/`, "docs/ai/skills/"),
              ),
          ),
      );
      expect(
        missing,
        "files with remaining hits not named in the PR body",
      ).toEqual([]);
    },
  );
});

// --- Criterion 2 -----------------------------------------------------------

const NON_ROLE_DAVID = [
  /(^|\/)design-taste-frontend\/library\/photos\.json$/,
  /(^|\/)impeccable\/scripts\/data\/font-index\.json$/,
];

describe("issue #2154 done criterion 2: no David merger/coordinator role", () => {
  it("criterion 2: `rg -nw David` finds only photo credits and font names", () => {
    const hits = grep(
      ["-w", "-e", "David"],
      ["docs/ai/skills", "docs/agents", ...MIRRORS],
    ).filter(
      (hit) => !NON_ROLE_DAVID.some((allowed) => allowed.test(hit.file)),
    );
    expect(
      hits,
      `David still named outside credits/fonts:\n${show(hits)}`,
    ).toEqual([]);
  });
});

// --- Criterion 3 -----------------------------------------------------------

describe("issue #2154 done criterion 3: Samson merges under Blake's authorization", () => {
  it.each([SAMSON_SKILL, SAMSON_PROTOCOL])(
    "criterion 3: %s names Samson as the merger acting under Blake's authorization",
    (file) => {
      const merger = blocks(read(file)).filter(
        (block) =>
          /\bSamson\b/.test(block) &&
          /\bmerge/i.test(block) &&
          /\bBlake'?s?\b/.test(block) &&
          /authori[sz]/i.test(block),
      );
      expect(
        merger,
        `${file}: no block names Samson + merge + Blake's authorization`,
      ).not.toEqual([]);
    },
  );

  it.each([SAMSON_SKILL, SAMSON_PROTOCOL])(
    "criterion 3: %s has workers return DELIVERY_READY to Samson and stop before merge",
    (file) => {
      const handoff = blocks(read(file)).filter(
        (block) =>
          /DELIVERY_READY/.test(block) &&
          /\bSamson\b/.test(block) &&
          /stop before merge/i.test(block),
      );
      expect(handoff).not.toEqual([]);
    },
  );

  it("criterion 3: samson-factory still requires human approval, branch protection, an expected-head merge and merge readback", () => {
    const text = [SAMSON_SKILL, SAMSON_PROTOCOL]
      .map(read)
      .join("\n")
      .replace(/\s+/g, " ");
    expect(text).toMatch(/human approval/i);
    expect(text).toMatch(/protections?\b/i);
    expect(text).toMatch(/never bypass protection/i);
    expect(text).toMatch(/expected-head merge/i);
    expect(text).toMatch(
      /verif\w* merged state|merge readback|read\w* back the merge/i,
    );
  });
});

// --- Criterion 4 -----------------------------------------------------------

const NEGATED_READY = /\b(no|without|not)\b[^|]*(`Ready`|readiness)/i;

describe("issue #2154 done criterion 4: D1a triage mapping", () => {
  it.each([REPO_MAPPING, SETUP_MAPPING])(
    "criterion 4 / D1a: %s maps every triage role per D1a",
    (file) => {
      const text = read(file);
      const row = (role: string) => roleRow(text, role) ?? "";
      const problems: string[] = [];
      const needsTriage = row("needs-triage");
      if (!NEGATED_READY.test(needsTriage) || /status:/.test(needsTriage))
        problems.push(`needs-triage (no readiness label): ${needsTriage}`);
      const needsInfo = row("needs-info");
      if (
        !NEGATED_READY.test(needsInfo) ||
        !/triage[- ]notes/i.test(needsInfo) ||
        /factory:blocked|status:/.test(needsInfo)
      )
        problems.push(`needs-info (triage notes, no Ready): ${needsInfo}`);
      const forAgent = row("ready-for-agent");
      if (
        !/`Ready`/.test(forAgent) ||
        NEGATED_READY.test(forAgent) ||
        /status:/.test(forAgent)
      )
        problems.push(`ready-for-agent (Ready): ${forAgent}`);
      const forHuman = row("ready-for-human");
      if (
        !NEGATED_READY.test(forHuman) ||
        !/assign/i.test(forHuman) ||
        !/human/i.test(forHuman) ||
        /status:/.test(forHuman)
      )
        problems.push(
          `ready-for-human (no Ready, human assignee): ${forHuman}`,
        );
      const wontfix = row("wontfix");
      if (!/\bclos/i.test(wontfix) || !/comment/i.test(wontfix))
        problems.push(`wontfix (close with a comment): ${wontfix}`);
      expect(problems, `${file} rows not on the D1a mapping`).toEqual([]);
    },
  );

  it("criterion 4 / D1a: status:needs-review maps to factory:ready-to-merge, and only the factory applies factory:* to in-flight work", () => {
    const lines = [REPO_MAPPING, ISSUE_TRACKER].flatMap((file) =>
      read(file).split("\n"),
    );
    expect(
      lines.some(
        (line) =>
          /needs-review/.test(line) && /`factory:ready-to-merge`/.test(line),
      ),
    ).toBe(true);
    expect(
      lines.some(
        (line) =>
          /`factory:/.test(line) &&
          /\bonly\b/i.test(line) &&
          /in-flight/i.test(line),
      ),
    ).toBe(true);
  });

  it("criterion 4: no state doc still requires exactly one `status:*` label", () => {
    const hits = grep(
      ["-n", "-i", "-E", "-e", "\\bone\\s+`?status:"],
      STATE_DOCS,
    );
    expect(hits, show(hits)).toEqual([]);
    expect(read("docs/ai/rules/general.md")).not.toMatch(/^\s*-\s*Status:/m);
  });

  it("criterion 4 / D1a: triage instructions close wontfix with a comment and apply no `wontfix` label", () => {
    // AGENT-BRIEF.md is excluded: its `wontfix` label text is an example brief.
    const hits = grep(
      [
        "-n",
        "-i",
        "-E",
        "-e",
        "\\b(with|apply|applies|add|adds)\\b( the| a)? `wontfix` label",
      ],
      [
        "docs/ai/skills/triage/SKILL.md",
        "docs/ai/skills/triage/OUT-OF-SCOPE.md",
      ],
    );
    expect(hits, show(hits)).toEqual([]);
  });
});

// --- Criterion 5 -----------------------------------------------------------

describe("issue #2154 done criterion 5: skill mirrors", () => {
  it("criterion 5: `bun run skills:verify` exits 0", () => {
    const result = run(process.execPath, ["scripts/verify-skills-sync.mjs"]);
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  }, 120_000);

  // Opt-in: skills:sync writes the mirror folders.
  it.skipIf(process.env.ACCEPTANCE_2154_SYNC?.trim() !== "1")(
    "criterion 5: a second `bun run skills:sync` produces no diff (opt-in: ACCEPTANCE_2154_SYNC=1)",
    () => {
      const state = () =>
        run("git", ["status", "--porcelain", "--", ...MIRRORS]).stdout +
        run("git", ["diff", "--", ...MIRRORS]).stdout;
      expect(
        run(process.execPath, ["scripts/sync-agent-skills.mjs"]).status,
      ).toBe(0);
      const afterFirst = state();
      expect(
        run(process.execPath, ["scripts/sync-agent-skills.mjs"]).status,
      ).toBe(0);
      expect(state()).toBe(afterFirst);
    },
    120_000,
  );
});

// --- Criterion 6 -----------------------------------------------------------

const SCOPE_BASE = process.env.ACCEPTANCE_2154_BASE?.trim() ?? "";
const SCOPE_ENABLED =
  process.env.ACCEPTANCE_2154_SCOPE?.trim() === "1" || SCOPE_BASE !== "";

describe("issue #2154 done criterion 6: diff scope", () => {
  // Opt-in: in the normal suite this would fail every later PR.
  it.skipIf(!SCOPE_ENABLED)(
    "criterion 6: the diff touches only docs/ai/**, docs/agents/** and the three mirror folders (opt-in: ACCEPTANCE_2154_SCOPE=1 or ACCEPTANCE_2154_BASE=<ref>)",
    () => {
      let base = SCOPE_BASE;
      if (!base) {
        const mergeBase = run("git", ["merge-base", "HEAD", "origin/develop"]);
        base = mergeBase.status === 0 ? mergeBase.stdout.trim() : SPEC_BASE_SHA;
      }
      const changed = [
        ...run("git", [
          "diff",
          "--name-only",
          "--no-renames",
          base,
        ]).stdout.split("\n"),
        ...run("git", [
          "ls-files",
          "--others",
          "--exclude-standard",
        ]).stdout.split("\n"),
      ].filter(Boolean);
      const allowed = [
        "docs/ai/",
        "docs/agents/",
        ...MIRRORS.map((m) => `${m}/`),
        ACCEPTANCE_DIR,
      ];
      const outside = [...new Set(changed)].filter(
        (file) => !allowed.some((prefix) => file.startsWith(prefix)),
      );
      expect(outside, `outside scope vs ${base}`).toEqual([]);
    },
  );
});
