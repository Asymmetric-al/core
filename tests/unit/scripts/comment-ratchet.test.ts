import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  compareToBaseline,
  measureComments,
  parseNameStatus,
  runCommentRatchet,
} from "../../../scripts/verify/comment-ratchet.mjs";
import { commentBaselineFile } from "../../../tooling/eslint-config/no-comments.mjs";

const COMMENTED = "// one\nexport const a = 1;\n// two\nexport const b = 2;\n";
const repositories: string[] = [];

function git(root: string, ...args: string[]) {
  return execFileSync(
    "git",
    [
      "-c",
      "user.name=Comment Ratchet",
      "-c",
      "user.email=comment-ratchet@example.org",
      "-c",
      "commit.gpgsign=false",
      "-c",
      "core.autocrlf=false",
      ...args,
    ],
    { cwd: root, encoding: "utf8" },
  );
}

function write(root: string, file: string, text: string) {
  mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  writeFileSync(path.join(root, file), text);
}

function repository(files: Record<string, string>) {
  const root = mkdtempSync(path.join(tmpdir(), "comment-ratchet-"));
  repositories.push(root);
  git(root, "init", "--quiet", "--initial-branch=develop");
  for (const [file, text] of Object.entries(files)) write(root, file, text);
  git(root, "add", "--all");
  git(root, "commit", "--quiet", "--message=base");
  return root;
}

function run(root: string, ...args: string[]) {
  const output: string[] = [];
  const status = runCommentRatchet({
    root,
    args: ["--base", "develop", ...args],
    env: {},
    log: (line: string) => output.push(line),
    error: (line: string) => output.push(line),
  });
  return { status, output: output.join("\n") };
}

const baselineOf = (root: string): Record<string, number> =>
  JSON.parse(readFileSync(path.join(root, commentBaselineFile), "utf8"));

afterEach(() => {
  for (const root of repositories.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("measureComments", () => {
  it("counts banned comments and the lines that hold nothing else", () => {
    expect(
      measureComments(
        "/**\n * Explains.\n */\nexport const a = 1; // trailing\n// prettier-ignore\nexport const b = 2;\n",
        "packages/api/src/a.ts",
      ),
    ).toEqual({ count: 2, lines: 3 });
  });

  it("counts a JSX comment line with its braces", () => {
    expect(
      measureComments(
        "export const A = () => (\n  <div>\n    {/* note */}\n  </div>\n);\n",
        "apps/admin/a.tsx",
      ),
    ).toEqual({ count: 1, lines: 1 });
  });

  it("does not take a URL or a shebang for a comment", () => {
    expect(
      measureComments(
        '#!/usr/bin/env node\nexport const url = "https://example.org/a";\n',
        "scripts/a.mjs",
      ),
    ).toEqual({ count: 0, lines: 0 });
  });
});

describe("compareToBaseline", () => {
  it("lists every file whose count differs from its record", () => {
    expect(
      compareToBaseline(
        { "a.ts": 1, "b.ts": 2, "d.ts": 4 },
        { "a.ts": 1, "b.ts": 3, "c.ts": 1 },
      ),
    ).toEqual([
      { file: "b.ts", count: 2, recorded: 3 },
      { file: "c.ts", count: 0, recorded: 1 },
      { file: "d.ts", count: 4, recorded: 0 },
    ]);
  });
});

describe("parseNameStatus", () => {
  it("reads changes and renames from NUL-separated output", () => {
    expect(
      parseNameStatus("M\0a.ts\0R087\0old.ts\0new.ts\0A\0c.ts\0D\0d.ts\0"),
    ).toEqual([
      { status: "M", file: "a.ts" },
      { status: "R", from: "old.ts", file: "new.ts" },
      { status: "A", file: "c.ts" },
      { status: "D", file: "d.ts" },
    ]);
  });
});

describe("the comment ratchet", () => {
  it("writes a baseline that mirrors the tree, then passes", () => {
    const root = repository({
      "packages/api/src/a.ts": COMMENTED,
      "packages/api/src/clean.ts": "export const c = 3;\n",
      "docs/tools/render.mjs": "// outside the banned trees\n",
      "tests/fixtures/input.ts": "// fixture data\n",
    });

    expect(run(root).status).toBe(1);
    expect(run(root, "--write").status).toBe(0);
    expect(baselineOf(root)).toEqual({ "packages/api/src/a.ts": 2 });
    expect(run(root)).toEqual({
      status: 0,
      output: "comment ratchet: 1 files, 2 comments, none new.",
    });
  });

  it("refuses a new comment in a file that already has some", () => {
    const root = repository({ "packages/api/src/a.ts": COMMENTED });
    run(root, "--write");
    write(root, "packages/api/src/a.ts", `${COMMENTED}// three\n`);

    const result = run(root);
    expect(result.status).toBe(1);
    expect(result.output).toContain("packages/api/src/a.ts: 2 -> 3");
  });

  it("refuses a comment in a new file", () => {
    const root = repository({ "packages/api/src/a.ts": COMMENTED });
    run(root, "--write");
    write(root, "scripts/new.mjs", "// new\nexport const n = 1;\n");
    git(root, "add", "--all");

    const result = run(root);
    expect(result.status).toBe(1);
    expect(result.output).toContain("scripts/new.mjs: 0 -> 1");
  });

  it("does not let a hand-edited baseline hide a new comment", () => {
    const root = repository({ "packages/api/src/a.ts": COMMENTED });
    run(root, "--write");
    write(root, "packages/api/src/a.ts", `${COMMENTED}// three\n`);
    write(
      root,
      commentBaselineFile,
      `${JSON.stringify({ "packages/api/src/a.ts": 3 }, null, 2)}\n`,
    );

    expect(run(root).status).toBe(1);
  });

  it("does not write a baseline over a new comment", () => {
    const root = repository({ "packages/api/src/a.ts": COMMENTED });
    run(root, "--write");
    write(root, "packages/api/src/a.ts", `${COMMENTED}// three\n`);

    expect(run(root, "--write").status).toBe(1);
    expect(baselineOf(root)).toEqual({ "packages/api/src/a.ts": 2 });
  });

  it("asks for a rewrite after a deletion, and the rewrite lowers the record", () => {
    const root = repository({
      "packages/api/src/a.ts": COMMENTED,
      "packages/api/src/b.ts": "// only\nexport const b = 1;\n",
    });
    run(root, "--write");
    write(root, "packages/api/src/a.ts", "// one\nexport const a = 1;\n");
    write(root, "packages/api/src/b.ts", "export const b = 1;\n");

    const stale = run(root);
    expect(stale.status).toBe(1);
    expect(stale.output).toContain("packages/api/src/a.ts: baseline 2, now 1");
    expect(stale.output).toContain("packages/api/src/b.ts: baseline 1, now 0");
    expect(stale.output).toContain("bun run verify:comments -- --write");

    expect(run(root, "--write").status).toBe(0);
    expect(baselineOf(root)).toEqual({ "packages/api/src/a.ts": 1 });
    expect(run(root).status).toBe(0);
  });

  it("lets a renamed file keep its comments", () => {
    const root = repository({ "packages/api/src/a.ts": COMMENTED });
    run(root, "--write");
    git(root, "mv", "packages/api/src/a.ts", "packages/api/src/renamed.ts");

    expect(run(root, "--write").status).toBe(0);
    expect(baselineOf(root)).toEqual({ "packages/api/src/renamed.ts": 2 });
    expect(run(root).status).toBe(0);
  });

  it("counts comments that committed work added since the base", () => {
    const root = repository({ "packages/api/src/a.ts": COMMENTED });
    run(root, "--write");
    git(root, "add", "--all");
    git(root, "commit", "--quiet", "--message=baseline");
    git(root, "switch", "--quiet", "--create", "feature");
    write(root, "packages/api/src/a.ts", `${COMMENTED}// three\n`);
    git(root, "commit", "--quiet", "--all", "--message=more");

    const result = run(root);
    expect(result.status).toBe(1);
    expect(result.output).toContain("packages/api/src/a.ts: 2 -> 3");
  });

  it("reports comments and comment-only lines by area", () => {
    const root = repository({
      "packages/api/src/a.ts": COMMENTED,
      "scripts/tool.mjs": "export const t = 1; // trailing\n",
    });

    const result = run(root, "--report");
    expect(result.status).toBe(0);
    expect(result.output).toMatch(/packages\/api\s+1\s+1\s+2\s+2/);
    expect(result.output).toMatch(/scripts\s+1\s+1\s+1\s+0/);
    expect(result.output).toMatch(/total\s+2\s+2\s+3\s+2/);
  });

  it("names a base it cannot find", () => {
    const root = repository({ "packages/api/src/a.ts": COMMENTED });

    expect(() =>
      runCommentRatchet({
        root,
        args: ["--base", "missing-branch"],
        env: {},
        log: () => {},
        error: () => {},
      }),
    ).toThrow(/missing-branch/);
  });

  it("checks the mirror alone when the default base is absent", () => {
    const root = repository({ "packages/api/src/a.ts": COMMENTED });
    const output: string[] = [];
    const options = {
      root,
      env: {},
      log: (line: string) => output.push(line),
      error: (line: string) => output.push(line),
    };

    expect(runCommentRatchet({ ...options, args: ["--write"] })).toBe(0);
    expect(runCommentRatchet({ ...options, args: [] })).toBe(0);
    expect(output.join("\n")).toContain("origin/develop is not available");
  });
});
