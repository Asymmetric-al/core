import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, expect, it } from "vitest";

import { prepareCandidateView } from "../../../scripts/archon-factory/pack/.shared/candidate-view.mjs";

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

function fixture() {
  const root = realpathSync(mkdtempSync(path.join(os.tmpdir(), "core-view-")));
  roots.push(root);
  const repositoryDirectory = path.join(root, "repository");
  const disposableRoot = path.join(root, "views");
  mkdirSync(repositoryDirectory);
  mkdirSync(disposableRoot);
  const gitExecutable =
    process.platform === "win32"
      ? execFileSync("where.exe", ["git.exe"], { encoding: "utf8" })
          .trim()
          .split(/\r?\n/)[0]
      : execFileSync("which", ["git"], { encoding: "utf8" }).trim();
  const git = (...args: string[]) =>
    execFileSync(gitExecutable, ["-C", repositoryDirectory, ...args], {
      encoding: "utf8",
    }).trim();
  git("init", "--quiet");
  git("config", "user.name", "Fixture");
  git("config", "user.email", "fixture@example.invalid");
  git("config", "core.autocrlf", "false");
  writeFileSync(path.join(repositoryDirectory, "source.txt"), "base\n");
  git("add", "source.txt");
  git("-c", "core.hooksPath=", "commit", "--quiet", "-m", "base");
  const baseSha = git("rev-parse", "HEAD");
  writeFileSync(path.join(repositoryDirectory, "source.txt"), "candidate\n");
  git("add", "source.txt");
  git("-c", "core.hooksPath=", "commit", "--quiet", "-m", "candidate");
  const candidateSha = git("rev-parse", "HEAD");
  writeFileSync(path.join(repositoryDirectory, "source.txt"), "unfinished\n");
  writeFileSync(path.join(repositoryDirectory, ".env"), "private-fixture\n");
  return {
    input: {
      gitExecutable,
      repositoryDirectory,
      disposableRoot,
      baseSha,
      candidateSha,
      role: "micaiah",
      assignmentId: "qualification-1",
      attemptId: "review-1",
    },
    git,
  };
}

it("materializes the exact committed candidate without dirty files, credentials or Git metadata", async () => {
  const { input } = fixture();
  const view = await prepareCandidateView(input);
  expect(
    readFileSync(path.join(view.workspaceDirectory, "source.txt"), "utf8"),
  ).toBe("candidate\n");
  expect(existsSync(path.join(view.workspaceDirectory, ".env"))).toBe(false);
  expect(existsSync(path.join(view.workspaceDirectory, ".git"))).toBe(false);
  expect(
    readFileSync(path.join(input.repositoryDirectory, "source.txt"), "utf8"),
  ).toBe("unfinished\n");
  expect(view).toMatchObject({
    candidateSha: input.candidateSha,
    baseSha: input.baseSha,
    role: "micaiah",
    fileCount: 1,
  });
  expect(view.contentDigest).toMatch(/^[a-f0-9]{64}$/);
});

it("creates independent first-pass views without peer artifacts", async () => {
  const { input } = fixture();
  const first = await prepareCandidateView(input);
  writeFileSync(
    path.join(first.workspaceDirectory, "peer-report.txt"),
    "sealed",
  );
  const second = await prepareCandidateView({ ...input, role: "luke" });
  expect(second.workspaceDirectory).not.toBe(first.workspaceDirectory);
  expect(
    existsSync(path.join(second.workspaceDirectory, "peer-report.txt")),
  ).toBe(false);
  expect(second.contentDigest).toBe(first.contentDigest);
});

it("rejects refs, unrelated bases and unrecognized roles before materializing", async () => {
  const { input, git } = fixture();
  await expect(
    prepareCandidateView({ ...input, candidateSha: "HEAD" }),
  ).rejects.toThrow();
  await expect(
    prepareCandidateView({ ...input, role: "publisher" }),
  ).rejects.toThrow();
  git("checkout", "--orphan", "unrelated");
  git("add", "source.txt");
  git("-c", "core.hooksPath=", "commit", "--quiet", "-m", "unrelated");
  await expect(
    prepareCandidateView({ ...input, baseSha: git("rev-parse", "HEAD") }),
  ).rejects.toThrow(/ancestor/);
});

it("rejects tracked symlinks rather than following them outside the candidate", async () => {
  const { input, git } = fixture();
  const objectId = git("rev-parse", `${input.candidateSha}:source.txt`);
  git("update-index", "--add", "--cacheinfo", `120000,${objectId},escape`);
  git("-c", "core.hooksPath=", "commit", "--quiet", "-m", "link fixture");
  await expect(
    prepareCandidateView({ ...input, candidateSha: git("rev-parse", "HEAD") }),
  ).rejects.toThrow(/mode/);
});

it("rejects gitlinks and case-colliding paths rather than making ambiguous views", async () => {
  const { input, git } = fixture();
  git("update-index", "--add", "--cacheinfo", `160000,${input.baseSha},module`);
  git("-c", "core.hooksPath=", "commit", "--quiet", "-m", "gitlink");
  await expect(
    prepareCandidateView({ ...input, candidateSha: git("rev-parse", "HEAD") }),
  ).rejects.toThrow(/mode/);
  git("update-index", "--force-remove", "module");
  const objectId = git("rev-parse", `${input.candidateSha}:source.txt`);
  git("update-index", "--add", "--cacheinfo", `100644,${objectId},SOURCE.txt`);
  git("-c", "core.hooksPath=", "commit", "--quiet", "-m", "collision");
  await expect(
    prepareCandidateView({ ...input, candidateSha: git("rev-parse", "HEAD") }),
  ).rejects.toThrow(/colliding/);
});

it("rejects output inside source and source inside output", async () => {
  const { input } = fixture();
  const nested = path.join(input.repositoryDirectory, "views");
  mkdirSync(nested);
  await expect(
    prepareCandidateView({ ...input, disposableRoot: nested }),
  ).rejects.toThrow(/disjoint/);
  await expect(
    prepareCandidateView({
      ...input,
      disposableRoot: path.dirname(input.repositoryDirectory),
    }),
  ).rejects.toThrow(/disjoint/);
});

it.each([
  ["Config/one.txt", "config/two.txt"],
  ["Config", "config/one.txt"],
])(
  "rejects component collisions %s and %s before creating a view",
  async (first, second) => {
    const { input, git } = fixture();
    const objectId = git("rev-parse", `${input.candidateSha}:source.txt`);
    for (const relativePath of [first, second])
      git(
        "update-index",
        "--add",
        "--cacheinfo",
        `100644,${objectId},${relativePath}`,
      );
    const tree = git("write-tree");
    const candidateSha = git(
      "commit-tree",
      tree,
      "-p",
      input.candidateSha,
      "-m",
      "component collision",
    );
    await expect(
      prepareCandidateView({ ...input, candidateSha }),
    ).rejects.toThrow(/colliding/);
    expect(readdirSync(input.disposableRoot)).toEqual([]);
  },
);

it("does not run candidate smudge filters or checkout hooks", async () => {
  const { input, git } = fixture();
  writeFileSync(
    path.join(input.repositoryDirectory, ".gitattributes"),
    "source.txt filter=forbidden\n",
  );
  git("add", ".gitattributes");
  git("-c", "core.hooksPath=", "commit", "--quiet", "-m", "filter");
  git("config", "filter.forbidden.smudge", "this-command-must-not-exist");
  git("config", "filter.forbidden.required", "true");
  const view = await prepareCandidateView({
    ...input,
    candidateSha: git("rev-parse", "HEAD"),
  });
  expect(
    readFileSync(path.join(view.workspaceDirectory, "source.txt"), "utf8"),
  ).toBe("candidate\n");
  expect(view.isolationQualified).toBe(false);
});

it("rejects a source subdirectory before writing inside the actual checkout", async () => {
  const { input } = fixture();
  const subdirectory = path.join(input.repositoryDirectory, "subdirectory");
  const nestedViews = path.join(input.repositoryDirectory, "views");
  mkdirSync(subdirectory);
  mkdirSync(nestedViews);
  await expect(
    prepareCandidateView({
      ...input,
      repositoryDirectory: subdirectory,
      disposableRoot: nestedViews,
    }),
  ).rejects.toThrow(/top-level/);
  expect(readdirSync(nestedViews)).toEqual([]);
});

// Observed on VM 100 (run 5cee51bf, 12 November 2026): Core's tree is 23,812
// files and 405 MB, past the one buffer every blob used to be read through, so
// freeze failed with "Candidate object read failed".
function commitFiles(
  { input, git }: ReturnType<typeof fixture>,
  files: Record<string, Buffer | string>,
) {
  for (const [relativePath, bytes] of Object.entries(files)) {
    const target = path.join(input.repositoryDirectory, relativePath);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, bytes);
  }
  git("config", "core.compression", "0");
  git("add", "--", ...Object.keys(files));
  git("-c", "core.hooksPath=", "commit", "--quiet", "-m", "files");
  return git("rev-parse", "HEAD");
}

it("materializes a candidate larger than one object read", async () => {
  const made = fixture();
  const megabyte = Buffer.alloc(1_048_576, "core factory view\n");
  const names = Array.from(
    { length: 272 },
    (_, index) => `bulk/part-${String(index).padStart(3, "0")}.bin`,
  );
  const candidateSha = commitFiles(
    made,
    Object.fromEntries(names.map((name) => [name, megabyte])),
  );
  const view = await prepareCandidateView({ ...made.input, candidateSha });
  expect(view.fileCount).toBe(273);
  for (const name of [names[0], names[135], names[271]])
    expect(
      readFileSync(path.join(view.workspaceDirectory, name)).equals(megabyte),
    ).toBe(true);
  expect(readdirSync(path.join(view.workspaceDirectory, "bulk"))).toHaveLength(
    272,
  );
}, 120_000);

it("reads objects in bounded batches and still writes every file exactly", async () => {
  const made = fixture();
  const files = {
    "a/one.txt": "one\n",
    "a/two.txt": "two two\n",
    "b/empty.txt": "",
    "b/three.bin": Buffer.from([0, 10, 13, 255, 10]),
  };
  const candidateSha = commitFiles(made, files);
  const input = { ...made.input, candidateSha };
  const whole = await prepareCandidateView(input);
  const batched = await prepareCandidateView(
    { ...input, role: "luke" },
    { batchBytes: 4 },
  );
  expect(batched.contentDigest).toBe(whole.contentDigest);
  expect(batched.fileCount).toBe(5);
  for (const [relativePath, bytes] of Object.entries(files))
    expect(
      readFileSync(path.join(batched.workspaceDirectory, relativePath)).equals(
        Buffer.from(bytes),
      ),
    ).toBe(true);
});

it.each([
  ["one file", { maxFileBytes: 8 }],
  ["the whole view", { maxViewBytes: 16 }],
])(
  "refuses a candidate past the limit for %s before creating a view",
  async (_label, limits) => {
    const made = fixture();
    const candidateSha = commitFiles(made, {
      "a/one.txt": "123456789\n",
      "a/two.txt": "123456789\n",
    });
    await expect(
      prepareCandidateView({ ...made.input, candidateSha }, limits),
    ).rejects.toThrow(/limit exceeded/);
    expect(readdirSync(made.input.disposableRoot)).toEqual([]);
  },
);

it.each([{ batchBytes: 0 }, { maxFileBytes: 1.5 }, { maxViewBytes: -1 }])(
  "rejects an invalid limit %o",
  async (limits) => {
    const { input } = fixture();
    await expect(prepareCandidateView(input, limits)).rejects.toThrow(/limit/);
    expect(readdirSync(input.disposableRoot)).toEqual([]);
  },
);
