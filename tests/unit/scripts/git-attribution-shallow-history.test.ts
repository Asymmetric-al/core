import { execFileSync, spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { collectOutgoingCommitShas } from "../../../scripts/verify/git-attribution.mjs";

const fixturePaths: string[] = [];
afterEach(() => {
  for (const fixture of fixturePaths.splice(0)) {
    rmSync(fixture, { recursive: true, force: true });
  }
});

function shallowFixture(shallowRemote = false, cli = false) {
  const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
  const fixture = mkdtempSync(path.join(tmpdir(), "attribution-shallow-"));
  fixturePaths.push(fixture);
  const source = path.join(fixture, "source.git");
  const checkout = path.join(fixture, "checkout");
  const {
    ASYM_PRE_PUSH_UPDATES: _prePushUpdates,
    GIT_DIR: _gitDir,
    GIT_COMMON_DIR: _gitCommonDir,
    GIT_WORK_TREE: _gitWorkTree,
    GIT_INDEX_FILE: _gitIndexFile,
    GIT_OBJECT_DIRECTORY: _gitObjectDirectory,
    GIT_ALTERNATE_OBJECT_DIRECTORIES: _gitAlternates,
    ...parentEnv
  } = process.env;
  const env = {
    ...parentEnv,
    GIT_AUTHOR_NAME: "Conrad O",
    GIT_AUTHOR_EMAIL: "79217644+cobmojo@users.noreply.github.com",
    GIT_COMMITTER_NAME: "Conrad O",
    GIT_COMMITTER_EMAIL: "79217644+cobmojo@users.noreply.github.com",
  };
  const git = (cwd: string, args: string[], input?: string) =>
    execFileSync("git", args, {
      cwd,
      env,
      input,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  git(fixture, ["init", "--bare", "--quiet", source]);
  const tree = git(source, ["mktree"], "");
  const root = git(source, ["commit-tree", tree], "base\n");
  const hidden = execFileSync("git", ["commit-tree", tree, "-p", root], {
    cwd: source,
    env: {
      ...env,
      GIT_AUTHOR_EMAIL: "codex@example.com",
      GIT_COMMITTER_EMAIL: "codex@example.com",
    },
    input: "must inspect this outgoing commit\n",
    encoding: "utf8",
  }).trim();
  const head = git(
    source,
    ["commit-tree", tree, "-p", hidden],
    "visible outgoing tip\n",
  );
  git(source, ["update-ref", "refs/heads/main", head]);
  git(source, ["update-ref", "refs/heads/base", root]);
  git(source, ["symbolic-ref", "HEAD", "refs/heads/main"]);
  git(fixture, [
    "clone",
    "--quiet",
    "--no-local",
    "--depth=1",
    "--branch=main",
    pathToFileURL(source).href,
    checkout,
  ]);
  git(checkout, ["fetch", "--quiet", "--depth=1", "origin", "refs/heads/base"]);
  if (shallowRemote) {
    const shallowSource = path.join(fixture, "shallow-source.git");
    git(fixture, [
      "clone",
      "--quiet",
      "--bare",
      "--no-local",
      "--depth=1",
      "--branch=main",
      pathToFileURL(source).href,
      shallowSource,
    ]);
    git(checkout, [
      "remote",
      "set-url",
      "origin",
      pathToFileURL(shallowSource).href,
    ]);
  }
  // Execute the production CLI unchanged in an isolated repository. Only its
  // immutable policy baseline is bound to this fixture's root, keeping the test
  // independent of checkout depth and avoiding provider/network dependencies.
  const toolingRoot = path.join(fixture, "tooling");
  for (const file of [
    "scripts/verify/git-attribution.mjs",
    "scripts/git/trusted-identities.mjs",
    "scripts/git/pre-push-guard.mjs",
  ]) {
    const target = path.join(toolingRoot, file);
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(path.join(repoRoot, file), target);
  }
  const registryPath = path.join(
    toolingRoot,
    "scripts/git/trusted-identities.mjs",
  );
  writeFileSync(
    registryPath,
    readFileSync(registryPath, "utf8").replace(
      /(ATTRIBUTION_BASELINE_SHA =\s*)"[0-9a-f]{40}"/,
      `$1"${root}"`,
    ),
  );
  if (cli) {
    git(checkout, ["config", "user.name", "Conrad O"]);
    git(checkout, ["config", "user.email", env.GIT_AUTHOR_EMAIL]);
    git(checkout, [
      "config",
      `url.${pathToFileURL(source).href}.insteadOf`,
      "https://github.com/Asymmetric-al/core.git",
    ]);
    git(checkout, [
      "remote",
      "set-url",
      "origin",
      "https://github.com/Asymmetric-al/core.git",
    ]);
    git(checkout, ["update-ref", "-d", "refs/remotes/origin/HEAD"]);
    git(checkout, ["update-ref", "-d", "refs/remotes/origin/main"]);
    git(checkout, ["update-ref", "refs/remotes/origin/base", root]);
  }
  return {
    root,
    hidden,
    head,
    checkout,
    source,
    env,
    verifier: path.join(
      toolingRoot,
      "scripts",
      "verify",
      "git-attribution.mjs",
    ),
    runGit: (args: string[]) => git(checkout, args),
    runGitStatus: (args: string[]) =>
      spawnSync("git", args, { cwd: checkout, env, encoding: "utf8" }).status ??
      128,
    updates: [
      {
        localRef: "refs/heads/main",
        localSha: head,
        remoteRef: "refs/heads/main",
        remoteSha: root,
      },
    ],
  };
}

describe("outgoing attribution in a shallow checkout", () => {
  it("fetches complete history before selecting an existing-ref range", () => {
    const fixture = shallowFixture();
    expect(fixture.runGit(["rev-parse", "--is-shallow-repository"])).toBe(
      "true",
    );
    expect(
      fixture.runGit(["rev-list", `${fixture.root}..${fixture.head}`]),
    ).toBe(fixture.head);

    const commits = collectOutgoingCommitShas({
      ...fixture,
      remoteName: "origin",
    });

    expect(commits).toEqual([fixture.head, fixture.hidden]);
    expect(fixture.runGit(["rev-parse", "--is-shallow-repository"])).toBe(
      "false",
    );
  });

  it("rejects the push before enumeration when complete history is unavailable", () => {
    const fixture = shallowFixture();
    const calls: string[][] = [];
    expect(() =>
      collectOutgoingCommitShas({
        ...fixture,
        remoteName: "origin",
        runGit: (args: string[]) => {
          calls.push(args);
          if (args[0] === "fetch")
            throw new Error("complete history unavailable");
          return fixture.runGit(args);
        },
      }),
    ).toThrow("complete history unavailable");
    expect(calls.some((args) => args[0] === "rev-list")).toBe(false);
  });
});

it("rejects history that remains shallow after fetching from a shallow source", () => {
  const fixture = shallowFixture(true);
  const calls: string[][] = [];
  expect(() =>
    collectOutgoingCommitShas({
      ...fixture,
      remoteName: "origin",
      runGit: (args: string[]) => {
        calls.push(args);
        return fixture.runGit(args);
      },
    }),
  ).toThrow(/shallow/);
  expect(calls.some((args) => args[0] === "rev-list")).toBe(false);
});

it.each(["pre-push", "local"])(
  "the actual %s CLI finds forbidden commits behind a shallow boundary",
  (mode) => {
    const fixture = shallowFixture(false, true);
    const result = spawnSync(process.execPath, [fixture.verifier], {
      cwd: fixture.checkout,
      env: {
        ...fixture.env,
        ASYM_PRE_PUSH_REMOTE_NAME: "origin",
        ASYM_PRE_PUSH_REPOSITORY_SLUG: "Asymmetric-al/core",
        ...(mode === "pre-push"
          ? {
              ASYM_PRE_PUSH_UPDATES: `refs/heads/main ${fixture.head} refs/heads/main ${fixture.root}\n`,
            }
          : {}),
      },
      encoding: "utf8",
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      `${fixture.hidden}: commit author email codex@example.com is forbidden`,
    );
    expect(fixture.runGit(["rev-parse", "--is-shallow-repository"])).toBe(
      "false",
    );
  },
);

it("the complete-history pre-push CLI does not fetch before checking its range", () => {
  const fixture = shallowFixture(false, true);
  fixture.runGit(["fetch", "--quiet", "--unshallow", "origin"]);
  fixture.runGit([
    "config",
    "--unset-all",
    `url.${pathToFileURL(fixture.source).href}.insteadOf`,
  ]);
  fixture.runGit([
    "config",
    `url.${pathToFileURL(path.join(fixture.checkout, "missing-remote")).href}.insteadOf`,
    "https://github.com/Asymmetric-al/core.git",
  ]);
  const result = spawnSync(process.execPath, [fixture.verifier], {
    cwd: fixture.checkout,
    env: {
      ...fixture.env,
      ASYM_PRE_PUSH_REMOTE_NAME: "origin",
      ASYM_PRE_PUSH_REPOSITORY_SLUG: "Asymmetric-al/core",
      ASYM_PRE_PUSH_UPDATES: `refs/heads/main ${fixture.head} refs/heads/main ${fixture.root}\n`,
    },
    encoding: "utf8",
  });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain(
    `${fixture.hidden}: commit author email codex@example.com is forbidden`,
  );
  expect(result.stderr).not.toContain("fetch");
});

it("the new-ref CLI completes shallow history before subtracting existing remote tips", () => {
  const fixture = shallowFixture(false, true);
  const result = spawnSync(process.execPath, [fixture.verifier], {
    cwd: fixture.checkout,
    env: {
      ...fixture.env,
      ASYM_PRE_PUSH_REMOTE_NAME: "origin",
      ASYM_PRE_PUSH_REPOSITORY_SLUG: "Asymmetric-al/core",
      ASYM_PRE_PUSH_UPDATES: `refs/heads/main ${fixture.head} refs/heads/new ${"0".repeat(40)}\n`,
    },
    encoding: "utf8",
  });
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("Commits checked: 0");
  expect(fixture.runGit(["rev-parse", "--is-shallow-repository"])).toBe(
    "false",
  );
});
