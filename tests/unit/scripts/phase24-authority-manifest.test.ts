import { execFile, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const repository = fileURLToPath(new URL("../../../", import.meta.url));
const runner = "scripts/cms/run-local-e2e.mjs";
const validator = "scripts/verify/phase24-authority.mjs";
const base = "docs/prds/sitestacker-parity";
const matrix = `${base}/phase-24-multi-site-management-traceability.md`;
const roots: string[] = [];
const env = { PATH: process.env.PATH, LANG: "C", TZ: "UTC" };

type Result = {
  schemaVersion: number;
  inputIdentity: string;
  outcome: "valid" | "invalid";
  diagnostics: Array<{ owner: string; token: string; code: string }>;
};
type Manifest = {
  schemaVersion: number;
  acceptanceRevision: string;
  mode: string;
  candidateSha: string;
  inputIdentity: string;
  runtimeProof: boolean;
  outcome: "passed" | "failed";
  evidence: {
    favorable: Result;
    adverse: Result;
    retry: { first: Result; second: Result };
    recovery: Result;
  };
  diagnostics?: Array<{ owner: string; token: string; code: string }>;
};

function git(root: string, args: string[]) {
  const result = spawnSync("git", args, {
    cwd: root,
    env: {
      ...env,
      GIT_AUTHOR_DATE: "2000-01-01T00:00:00Z",
      GIT_COMMITTER_DATE: "2000-01-01T00:00:00Z",
    },
    encoding: "utf8",
    shell: false,
  });
  expect(result.status, result.stderr).toBe(0);
  return result.stdout.trim();
}

function commit(root: string) {
  git(root, ["add", "--all"]);
  git(root, [
    "-c",
    "user.name=Phase24 acceptance fixture",
    "-c",
    "user.email=phase24-fixture@example.invalid",
    "-c",
    "commit.gpgsign=false",
    "commit",
    "--quiet",
    "-m",
    "Proof fixture",
  ]);
  return git(root, ["rev-parse", "HEAD"]);
}

function checkout() {
  const root = mkdtempSync(path.join(tmpdir(), "phase24-manifest-"));
  roots.push(root);
  const catalogPath = `${base}/phase-24-authority-contract.json`;
  const catalog = JSON.parse(
    readFileSync(path.join(repository, catalogPath), "utf8"),
  ) as {
    authorities: Record<string, string>;
  };
  const files = [
    catalogPath,
    "docs/ai/document-authority.md",
    ...Object.values(catalog.authorities),
  ];
  for (const name of readdirSync(path.join(repository, base))) {
    if (/^phase-24-.*\.md$/.test(name)) files.push(`${base}/${name}`);
  }
  for (const relative of files) {
    mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    cpSync(path.join(repository, relative), path.join(root, relative));
  }
  for (const relative of [
    "scripts/cms",
    "scripts/verify",
    "openspec/changes/add-multi-site-management",
  ]) {
    mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    cpSync(path.join(repository, relative), path.join(root, relative), {
      recursive: true,
    });
  }
  // No node_modules, runtime applications, DB or env file exists in this
  // checkout. Success therefore proves the mode precedes runtime imports.
  git(root, ["init", "--quiet", "--initial-branch=acceptance-fixture"]);
  return { root, sha: commit(root) };
}

function run(root: string, sha: string, script = path.join(root, runner)) {
  return spawnSync(
    process.execPath,
    [script, "--phase24-contract-check", "--candidate-sha", sha],
    {
      cwd: root,
      env,
      encoding: "utf8",
      timeout: 20_000,
      maxBuffer: 4 * 1024 * 1024,
      shell: false,
    },
  );
}

function runConcurrent(root: string, sha: string) {
  return new Promise<string>((resolve, reject) => {
    execFile(
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
        timeout: 20_000,
        maxBuffer: 4 * 1024 * 1024,
        shell: false,
      },
      (error, stdout) => (error ? reject(error) : resolve(stdout)),
    );
  });
}

function identity(root: string) {
  const files: string[] = [];
  function visit(relative: string) {
    for (const name of readdirSync(path.join(root, relative)).sort()) {
      if (!relative && name === ".git") continue;
      const next = path.join(relative, name);
      const absolute = path.join(root, next);
      if (lstatSync(absolute).isDirectory()) visit(next);
      else
        files.push(
          `${next}:${createHash("sha256").update(readFileSync(absolute)).digest("hex")}`,
        );
    }
  }
  visit("");
  return files;
}

function failure(root: string, sha: string, token: string, script?: string) {
  const result = run(root, sha, script);
  expect(result.error).toBeUndefined();
  expect(result.status).not.toBe(0);
  const report = JSON.parse(result.stdout) as Manifest;
  expect(report.schemaVersion).toBe(1);
  expect(report.outcome).toBe("failed");
  expect(JSON.stringify(report.diagnostics)).toContain(token);
  expect(result.stdout).not.toContain(root);
  return report;
}

afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe("P24-01 approved repository-only proof through the existing runner", () => {
  it("proves four real contract outcomes without runtime dependencies and binds executed HEAD", () => {
    const { root, sha } = checkout();
    const before = identity(root);
    const result = run(root, sha);
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr || result.stdout).toBe(0);
    const report = JSON.parse(result.stdout) as Manifest;
    expect(report).toMatchObject({
      schemaVersion: 1,
      acceptanceRevision: "p24-01-v2",
      mode: "phase24-contract-check",
      candidateSha: sha,
      runtimeProof: false,
      outcome: "passed",
    });
    const source = spawnSync(
      process.execPath,
      [path.join(root, validator), "--json"],
      { cwd: root, env, encoding: "utf8", shell: false },
    );
    expect(source.status).toBe(0);
    const sourceResult = JSON.parse(source.stdout) as Result;
    expect(report.inputIdentity).toBe(sourceResult.inputIdentity);
    expect(report.evidence.favorable).toEqual(sourceResult);
    expect(report.evidence.adverse.outcome).toBe("invalid");
    expect(report.evidence.adverse.inputIdentity).not.toBe(
      report.inputIdentity,
    );
    expect(
      report.evidence.adverse.diagnostics.some(
        (diagnostic) =>
          diagnostic.owner === "US24-119" && /scenario/.test(diagnostic.code),
      ),
    ).toBe(true);
    expect(report.evidence.retry.first).toEqual(report.evidence.adverse);
    expect(report.evidence.retry.second).toEqual(report.evidence.adverse);
    expect(report.evidence.recovery).toEqual(sourceResult);
    expect(result.stdout).not.toContain(root);
    expect(identity(root)).toEqual(before);
    expect(git(root, ["status", "--porcelain=v1"])).toBe("");
  });

  it("produces identical manifests repeatedly and concurrently without source writes", async () => {
    const { root, sha } = checkout();
    const before = identity(root);
    const first = run(root, sha);
    const second = run(root, sha);
    expect(first.status, first.stderr).toBe(0);
    expect(second.status, second.stderr).toBe(0);
    expect(second.stdout).toBe(first.stdout);
    for (const stdout of await Promise.all([
      runConcurrent(root, sha),
      runConcurrent(root, sha),
    ]))
      expect(stdout).toBe(first.stdout);
    expect(identity(root)).toEqual(before);
    expect(git(root, ["status", "--porcelain=v1"])).toBe("");
  });

  it("rejects an asserted SHA that does not identify the executed checkout", () => {
    const { root } = checkout();
    failure(root, "0".repeat(40), "0".repeat(40));
  });

  it.each([matrix, runner, validator])(
    "rejects dirty proof input or executed code %s",
    (relative) => {
      const { root, sha } = checkout();
      const absolute = path.join(root, relative);
      writeFileSync(
        absolute,
        `${readFileSync(absolute, "utf8")}\n${relative.endsWith(".mjs") ? "//" : "<!--"} dirty acceptance fixture ${relative.endsWith(".mjs") ? "" : "-->"}\n`,
      );
      failure(root, sha, relative);
    },
  );

  it("fails meaningful favorable validation for committed invalid source bytes", () => {
    const { root } = checkout();
    const filename = path.join(root, matrix);
    let count = 0;
    const changed = readFileSync(filename, "utf8")
      .split("\n")
      .map((line) => {
        if (!/^\|\s*US24-119\s*\|/.test(line)) return line;
        count++;
        const cells = line.split("|");
        cells[6] = " An unresolvable P24-01 fixture scenario ";
        return cells.join("|");
      })
      .join("\n");
    expect(count).toBe(1);
    writeFileSync(filename, changed);
    const sha = commit(root);
    const report = failure(root, sha, "US24-119");
    expect(JSON.stringify(report.diagnostics)).toContain(
      "An unresolvable P24-01 fixture scenario",
    );
  });

  it("cannot label another checkout's runner code with a fixture commit", () => {
    const { root, sha } = checkout();
    const foreign = checkout();
    writeFileSync(
      path.join(foreign.root, "fixture-provenance.txt"),
      "A separately committed fixture checkout.\n",
    );
    const foreignSha = commit(foreign.root);
    expect(foreignSha).not.toBe(sha);
    failure(root, sha, sha, path.join(foreign.root, runner));
  });
});
