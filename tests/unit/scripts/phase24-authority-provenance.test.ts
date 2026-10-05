import { spawnSync } from "node:child_process";
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, expect, it } from "vitest";

const repository = fileURLToPath(new URL("../../../", import.meta.url));
const runner = "scripts/cms/run-local-e2e.mjs";
const base = "docs/prds/sitestacker-parity";
const roots: string[] = [];
const env = {
  PATH: process.env.PATH,
  LANG: "C",
  TZ: "UTC",
  GIT_AUTHOR_DATE: "2000-01-01T00:00:00Z",
  GIT_COMMITTER_DATE: "2000-01-01T00:00:00Z",
};
function shellQuote(value: string) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}
function git(root: string, args: string[]) {
  const result = spawnSync(
    "git",
    ["--no-optional-locks", "-C", root, ...args],
    { env, encoding: "utf8", shell: false },
  );
  expect(result.status, result.stderr).toBe(0);
  return result.stdout;
}
function checkout() {
  const root = mkdtempSync(path.join(tmpdir(), "phase24-provenance-"));
  roots.push(root);
  const catalog = JSON.parse(
    readFileSync(
      path.join(repository, base, "phase-24-authority-contract.json"),
      "utf8",
    ),
  ) as { authorities: Record<string, string> };
  const files = new Set([
    runner,
    "scripts/cms/phase24-contract-check.mjs",
    "scripts/verify/phase24-authority.mjs",
    `${base}/phase-24-authority-contract.json`,
    "docs/ai/document-authority.md",
    ...Object.values(catalog.authorities),
  ]);
  for (const name of readdirSync(path.join(repository, base)))
    if (/^phase-24-.*\.md$/.test(name)) files.add(`${base}/${name}`);
  for (const relative of files) {
    mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    cpSync(path.join(repository, relative), path.join(root, relative));
  }
  const change = "openspec/changes/add-multi-site-management";
  mkdirSync(path.dirname(path.join(root, change)), { recursive: true });
  cpSync(path.join(repository, change), path.join(root, change), {
    recursive: true,
  });
  git(root, ["init", "--quiet", "--initial-branch=provenance-fixture"]);
  git(root, ["add", "--all"]);
  git(root, [
    "-c",
    "user.name=Phase24 provenance fixture",
    "-c",
    "user.email=phase24-provenance@example.invalid",
    "-c",
    "commit.gpgsign=false",
    "commit",
    "--quiet",
    "-m",
    "Committed proof bytes",
  ]);
  return { root, sha: git(root, ["rev-parse", "HEAD"]).trim() };
}
function run(root: string, sha: string) {
  return spawnSync(
    process.execPath,
    [
      path.join(root, runner),
      "--phase24-contract-check",
      "--candidate-sha",
      sha,
    ],
    {
      cwd: root,
      env,
      encoding: "utf8",
      shell: false,
      timeout: 20_000,
      maxBuffer: 4 * 1024 * 1024,
    },
  );
}
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});
it("accepts clean committed proof bytes without modifying the Git index", () => {
  const { root, sha } = checkout();
  const before = readFileSync(path.join(root, ".git/index"));
  const result = run(root, sha);
  expect(result.status, result.stderr || result.stdout).toBe(0);
  expect(JSON.parse(result.stdout)).toMatchObject({
    candidateSha: sha,
    outcome: "passed",
    runtimeProof: false,
  });
  expect(readFileSync(path.join(root, ".git/index"))).toEqual(before);
});
const paths = [
  runner,
  "scripts/cms/phase24-contract-check.mjs",
  "scripts/verify/phase24-authority.mjs",
  `${base}/phase-24-multi-site-management-traceability.md`,
  `${base}/phase-24-authority-contract.json`,
  "docs/ai/document-authority.md",
  "docs/adr/0030-canonical-message-document-and-presentation-dependencies.md",
  "openspec/changes/add-multi-site-management/specs/multi-site-management/spec.md",
];
const cases = ["--assume-unchanged", "--skip-worktree"].flatMap((flag) =>
  paths.map((file) => ({ flag, file, replacement: "" })),
);
cases.push({
  flag: "--assume-unchanged",
  file: "scripts/verify/phase24-authority.mjs",
  replacement: " with a Git replacement blob",
});
it.each(cases)(
  "rejects changed $file bytes hidden by $flag ($replacement) without refreshing the index",
  ({ flag, file, replacement }) => {
    const { root, sha } = checkout();
    git(root, ["update-index", flag, file]);
    const filename = path.join(root, file);
    const original = readFileSync(filename);
    writeFileSync(filename, Buffer.concat([original, Buffer.from("\n")]));
    if (replacement) {
      const committed = git(root, ["rev-parse", `${sha}:${file}`]).trim();
      const changed = git(root, ["hash-object", "-w", file]).trim();
      git(root, ["replace", committed, changed]);
    }
    expect(git(root, ["status", "--porcelain=v1"])).toBe("");
    const indexBefore = readFileSync(path.join(root, ".git/index"));
    const bytesBefore = readFileSync(filename);
    const result = run(root, sha);
    expect(result.error).toBeUndefined();
    expect(result.status, result.stdout).not.toBe(0);
    const report = JSON.parse(result.stdout) as {
      outcome: string;
      candidateSha: string;
      diagnostics: Array<{
        file: string;
        owner: string;
        token: string;
        correction: string;
      }>;
    };
    expect(report).toMatchObject({ candidateSha: sha, outcome: "failed" });
    expect(
      report.diagnostics.some(
        (d) =>
          d.file === file &&
          d.owner === file &&
          d.token === file &&
          d.correction.length > 0,
      ),
    ).toBe(true);
    expect(result.stdout).not.toContain(root);
    expect(readFileSync(path.join(root, ".git/index"))).toEqual(indexBefore);
    expect(readFileSync(filename)).toEqual(bytesBefore);
  },
);

it.skipIf(process.platform === "win32")(
  "uses Git from the supplied PATH while excluding caller Git overrides and credentials",
  () => {
    const { root, sha } = checkout();
    const actualGit = (process.env.PATH ?? "")
      .split(path.delimiter)
      .map((directory) => path.join(directory, "git"))
      .find((filename) => existsSync(filename));
    if (!actualGit)
      throw new Error("The test requires the installed Git executable.");
    const bin = mkdtempSync(path.join(tmpdir(), "phase24-git-transport ' -"));
    roots.push(bin);
    const marker = path.join(bin, "calls.jsonl");
    const executable = path.join(bin, "git");
    writeFileSync(
      executable,
      `#!/bin/sh
[ "$PATH" = ${shellQuote(bin)} ] &&
[ "\${GIT_DIR+x}" != x ] &&
[ "\${GIT_WORK_TREE+x}" != x ] &&
[ "\${STRIPE_SECRET_KEY+x}" != x ] || exit 91
printf '%s\\n' ${shellQuote(JSON.stringify({ path: bin, isolated: true }))} >> ${shellQuote(marker)} || exit 92
exec ${shellQuote(realpathSync(actualGit))} "$@"
`,
    );
    chmodSync(executable, 0o755);
    for (const retained of [
      { GIT_DIR: path.join(bin, "unused-caller-git-dir") },
      { GIT_WORK_TREE: bin },
      { STRIPE_SECRET_KEY: "synthetic-transport-only-canary" },
      { PATH: path.join(bin, "unexpected-path") },
    ]) {
      const rejected = spawnSync(executable, ["--version"], {
        env: { ...env, PATH: bin, ...retained },
        encoding: "utf8",
        shell: false,
        timeout: 20_000,
      });
      expect(rejected.status, rejected.stderr || rejected.stdout).toBe(91);
      expect(existsSync(marker)).toBe(false);
    }
    const result = spawnSync(
      process.execPath,
      [
        path.join(root, runner),
        "--phase24-contract-check",
        "--candidate-sha",
        sha,
      ],
      {
        cwd: root,
        env: {
          ...env,
          PATH: bin,
          GIT_DIR: path.join(bin, "unused-caller-git-dir"),
          GIT_WORK_TREE: bin,
          STRIPE_SECRET_KEY: "synthetic-transport-only-canary",
        },
        encoding: "utf8",
        shell: false,
        timeout: 20_000,
        maxBuffer: 4 * 1024 * 1024,
      },
    );
    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      candidateSha: sha,
      outcome: "passed",
    });
    expect(
      existsSync(marker),
      "The proof must use the Git executable selected by PATH.",
    ).toBe(true);
    const calls = readFileSync(marker, "utf8")
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line) as { path: string; isolated: boolean });
    expect(calls.length).toBeGreaterThan(0);
    expect(calls.every((call) => call.path === bin && call.isolated)).toBe(
      true,
    );
    expect(result.stdout).not.toContain("synthetic-transport-only-canary");
  },
);
