import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { prepareCandidateView } from "../pack/.shared/candidate-view.mjs";
import { executeCandidateCheck } from "../pack/.shared/executor.mjs";

export async function qualifyCandidateViews({ root, image }) {
  assert(path.isAbsolute(root), "Explicit qualification root required");
  assert(/^sha256:[a-f0-9]{64}$/.test(image), "Inspected image ID required");
  const repositoryDirectory = path.join(root, "repository");
  const disposableRoot = path.join(root, "views");
  await mkdir(root, { mode: 0o700 });
  await mkdir(repositoryDirectory, { mode: 0o700 });
  await mkdir(disposableRoot, { mode: 0o700 });
  const git = (...args) =>
    execFileSync("/usr/bin/git", ["-C", repositoryDirectory, ...args], {
      encoding: "utf8",
      timeout: 10_000,
      maxBuffer: 65_536,
      env: {
        PATH: "/usr/bin:/bin",
        GIT_CONFIG_NOSYSTEM: "1",
        GIT_CONFIG_GLOBAL: "/dev/null",
      },
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  git("init", "--quiet");
  git("config", "user.name", "Core Qualification");
  git("config", "user.email", "qualification@example.invalid");
  await writeFile(path.join(repositoryDirectory, "source.txt"), "base\n");
  git("add", "source.txt");
  git("-c", "core.hooksPath=", "commit", "--quiet", "-m", "synthetic base");
  const baseSha = git("rev-parse", "HEAD");
  await writeFile(path.join(repositoryDirectory, "source.txt"), "candidate\n");
  git("add", "source.txt");
  git(
    "-c",
    "core.hooksPath=",
    "commit",
    "--quiet",
    "-m",
    "synthetic candidate",
  );
  const candidateSha = git("rev-parse", "HEAD");
  await writeFile(path.join(repositoryDirectory, "source.txt"), "unfinished\n");
  await writeFile(
    path.join(repositoryDirectory, ".env"),
    "synthetic-private-sentinel\n",
  );
  const input = {
    gitExecutable: "/usr/bin/git",
    repositoryDirectory,
    disposableRoot,
    baseSha,
    candidateSha,
    assignmentId: "qualification-candidate-view",
    attemptId: "qualification-first-pass",
    role: "micaiah",
  };
  const first = await prepareCandidateView(input);
  await writeFile(
    path.join(first.workspaceDirectory, "peer-report.txt"),
    "synthetic sealed report\n",
  );
  const second = await prepareCandidateView({ ...input, role: "luke" });
  assert.notEqual(first.workspaceDirectory, second.workspaceDirectory);
  assert.equal(first.contentDigest, second.contentDigest);
  const checked = await executeCandidateCheck({
    dockerExecutable: "/usr/bin/docker",
    image,
    workspaceRoot: disposableRoot,
    workspaceDirectory: second.workspaceDirectory,
    command: [
      "node",
      "-e",
      `
      const assert = require('node:assert/strict');
      const fs = require('node:fs');
      assert.equal(fs.readFileSync('/candidate/source.txt', 'utf8'), 'candidate\\n');
      for (const name of ['.env', '.git', 'peer-report.txt']) assert.equal(fs.existsSync('/candidate/' + name), false);
      assert.equal(fs.existsSync('/home/admin/.claude'), false);
      assert.equal(process.env.CLAUDE_CONFIG_DIR, undefined);
      assert.deepEqual(Object.keys(require('node:os').networkInterfaces()), ['lo']);
      console.log('EXACT_CANDIDATE_CHECKED');
    `,
    ],
    limits: { timeoutMs: 30_000 },
  });
  assert.equal(checked.status, "passed");
  assert.equal(checked.cleanupConfirmed, true);
  assert.equal(
    await readFile(path.join(repositoryDirectory, "source.txt"), "utf8"),
    "unfinished\n",
  );
  assert.equal(
    await readFile(path.join(repositoryDirectory, ".env"), "utf8"),
    "synthetic-private-sentinel\n",
  );
  const blob = git("rev-parse", `${candidateSha}:source.txt`);
  git("update-index", "--add", "--cacheinfo", `120000,${blob},escape`);
  git(
    "-c",
    "core.hooksPath=",
    "commit",
    "--quiet",
    "-m",
    "synthetic forbidden link",
  );
  await assert.rejects(
    prepareCandidateView({ ...input, candidateSha: git("rev-parse", "HEAD") }),
    /mode/,
  );
  for (const [firstPath, secondPath] of [
    ["Config/one.txt", "config/two.txt"],
    ["Config", "config/one.txt"],
  ]) {
    git("read-tree", candidateSha);
    for (const relativePath of [firstPath, secondPath])
      git(
        "update-index",
        "--add",
        "--cacheinfo",
        `100644,${blob},${relativePath}`,
      );
    const collisionSha = git(
      "commit-tree",
      git("write-tree"),
      "-p",
      candidateSha,
      "-m",
      "synthetic collision",
    );
    const before = await readdir(disposableRoot);
    await assert.rejects(
      prepareCandidateView({ ...input, candidateSha: collisionSha }),
      /colliding/,
    );
    assert.deepEqual(await readdir(disposableRoot), before);
  }
  const subdirectory = path.join(repositoryDirectory, "subdirectory");
  const nestedViews = path.join(repositoryDirectory, "views");
  await mkdir(subdirectory);
  await mkdir(nestedViews);
  await assert.rejects(
    prepareCandidateView({
      ...input,
      repositoryDirectory: subdirectory,
      disposableRoot: nestedViews,
    }),
    /top-level/,
  );
  assert.deepEqual(await readdir(nestedViews), []);
  const receipt = {
    qualification: "candidate-view-and-disposable-check",
    root,
    baseSha,
    candidateSha,
    views: [first, second],
    forbiddenLinkRejected: true,
    componentCollisionsRejected: true,
    discoveredParentCheckoutRejected: true,
    unfinishedPreserved: true,
    check: {
      status: checked.status,
      containerId: checked.containerId,
      cleanupConfirmed: checked.cleanupConfirmed,
      image: checked.image,
    },
    runtimeRoleIsolationQualified: false,
  };
  await writeFile(
    path.join(root, "qualification-receipt.json"),
    JSON.stringify(receipt, null, 2) + "\n",
    { flag: "wx", mode: 0o600 },
  );
  return receipt;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
)
  console.log(
    JSON.stringify(
      await qualifyCandidateViews({
        root: process.argv[2],
        image: process.argv[3],
      }),
    ),
  );
