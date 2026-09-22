import { execFileSync, spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

export function objectFixture() {
  const root = mkdtempSync(path.join(tmpdir(), "attribution-objects-"));
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !key.startsWith("GIT_") && !key.startsWith("ASYM_PRE_PUSH_"),
    ),
  );
  Object.assign(env, {
    GIT_AUTHOR_NAME: "Conrad O",
    GIT_AUTHOR_EMAIL: "79217644+cobmojo@users.noreply.github.com",
    GIT_COMMITTER_NAME: "Conrad O",
    GIT_COMMITTER_EMAIL: "79217644+cobmojo@users.noreply.github.com",
  });
  const git = (
    args: string[],
    input?: string,
    overrides: Record<string, string> = {},
  ) =>
    execFileSync("git", args, {
      cwd: root,
      env: { ...env, ...overrides },
      input,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  git(["init", "--quiet"]);
  git(["config", "user.name", "Conrad O"]);
  git(["config", "user.email", env.GIT_AUTHOR_EMAIL!]);
  git(["remote", "add", "origin", "https://github.com/Asymmetric-al/core.git"]);
  const tree = git(["mktree"], "");
  const commit = (
    message: string,
    parents: string[] = [],
    identity: Record<string, string> = {},
  ) =>
    git(
      ["commit-tree", tree, ...parents.flatMap((parent) => ["-p", parent])],
      message + "\n",
      identity,
    );
  const base = commit("common base");
  const baseline = commit("immutable policy baseline", [base]);
  const tooling = path.join(root, "tooling");
  for (const file of [
    "scripts/verify/git-attribution.mjs",
    "scripts/git/trusted-identities.mjs",
    "scripts/git/pre-push-guard.mjs",
  ]) {
    const target = path.join(tooling, file);
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(path.join(process.cwd(), file), target);
  }
  const registry = path.join(tooling, "scripts/git/trusted-identities.mjs");
  writeFileSync(
    registry,
    readFileSync(registry, "utf8").replace(
      /(ATTRIBUTION_BASELINE_SHA =\s*)"[0-9a-f]{40}"/,
      `$1"${baseline}"`,
    ),
  );
  const verify = (head: string, extraEnv: Record<string, string> = {}) => {
    git(["update-ref", "refs/heads/fixture", head]);
    git(["symbolic-ref", "HEAD", "refs/heads/fixture"]);
    return spawnSync(
      process.execPath,
      [path.join(tooling, "scripts/verify/git-attribution.mjs")],
      {
        cwd: root,
        env: {
          ...env,
          ASYM_PRE_PUSH_REMOTE_NAME: "origin",
          ASYM_PRE_PUSH_REPOSITORY_SLUG: "Asymmetric-al/core",
          ASYM_PRE_PUSH_UPDATES: `refs/heads/fixture ${head} refs/heads/fixture ${base}`,
          ...extraEnv,
        },
        encoding: "utf8",
      },
    );
  };
  return { root, env, git, commit, base, baseline, verify };
}
