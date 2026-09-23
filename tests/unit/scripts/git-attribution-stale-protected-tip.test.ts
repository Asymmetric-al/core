import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { createCanonicalHistoryVerifier } from "../../../scripts/verify/git-attribution.mjs";

const roots: string[] = [];
const canonical = "https://github.com/Asymmetric-al/core.git";
afterEach(() =>
  roots
    .splice(0)
    .forEach((root) => rmSync(root, { recursive: true, force: true })),
);

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), "core-stale-protected-tip-"));
  roots.push(root);
  const seed = path.join(root, "seed");
  const bare = path.join(root, "origin.git");
  const clone = path.join(root, "clone");
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")),
  );
  function git(cwd: string, args: string[]) {
    return spawnSync("git", args, { cwd, env, encoding: "utf8" });
  }
  function requireGit(cwd: string, args: string[]) {
    const result = git(cwd, args);
    expect(result.status, result.stderr).toBe(0);
    return result.stdout.trim();
  }
  requireGit(root, ["init", "-q", "-b", "develop", seed]);
  const commit = (message: string) => {
    requireGit(seed, [
      "-c",
      "user.name=External Fixture",
      "-c",
      "user.email=external@example.invalid",
      "commit",
      "--allow-empty",
      "-qm",
      message,
    ]);
    return requireGit(seed, ["rev-parse", "HEAD"]);
  };
  const inherited = commit("inherited external contribution");
  requireGit(root, ["clone", "-q", "--bare", seed, bare]);
  requireGit(root, ["clone", "-q", "--no-local", bare, clone]);
  const tip = commit("canonical protected history advanced after cloning");
  requireGit(seed, ["tag", "new-protected-tag", tip]);
  requireGit(seed, ["push", "-q", "--tags", bare, "HEAD:refs/heads/develop"]);
  const metadata = {
    sha: inherited,
    authorName: "External Fixture",
    authorEmail: "external@example.invalid",
    committerName: "External Fixture",
    committerEmail: "external@example.invalid",
  };
  const calls: { command: string; args: string[]; timeoutMs?: number }[] = [];
  const fetch = (
    command: string,
    args: string[],
    options: { timeoutMs?: number } = {},
  ) => {
    calls.push({ command, args, ...options });
    expect(command).toBe("git");
    expect(args).toContain(canonical);
    expect(options.timeoutMs).toBeGreaterThan(0);
    expect(options.timeoutMs).toBeLessThanOrEqual(60_000);
    // The production destination stays fixed; only this test transport maps
    // its exact URL to an isolated local bare provider with real Git objects.
    const result = git(
      clone,
      args.map((arg) => (arg === canonical ? bare : arg)),
    );
    return {
      ok: result.status === 0,
      stdout: result.stdout,
      stderr: result.stderr,
      status: result.status,
    };
  };
  const state = () => ({
    refs: requireGit(clone, [
      "for-each-ref",
      "--format=%(refname) %(objectname)",
    ]),
    head: requireGit(clone, ["rev-parse", "HEAD"]),
    fetchHead: readFileSync(path.join(clone, ".git/FETCH_HEAD"), "utf8"),
    config: readFileSync(path.join(clone, ".git/config"), "utf8"),
  });
  writeFileSync(
    path.join(clone, ".git/FETCH_HEAD"),
    "existing fetch evidence must survive\n",
  );
  const makeVerifier = (
    options: {
      tip?: string;
      unavailable?: boolean;
      status?: (args: string[]) => number;
      fetch?: typeof fetch;
    } = {},
  ) =>
    createCanonicalHistoryVerifier({
      repository: "Asymmetric-al/core",
      runGitHubApi: (args: string[]) => {
        expect(args).toContain("--hostname");
        expect(args).toContain("github.com");
        const branch = args.at(-1)!.split("/").at(-1)!;
        return {
          ok: !options.unavailable,
          stdout: JSON.stringify({
            name: branch,
            protected: branch === "develop",
            commit: { sha: options.tip ?? tip },
          }),
        };
      },
      runGitStatus:
        options.status ?? ((args: string[]) => git(clone, args).status ?? 128),
      runCommand: options.fetch ?? fetch,
    });
  return {
    clone,
    bare,
    tip,
    inherited,
    metadata,
    calls,
    git,
    requireGit,
    fetch,
    makeVerifier,
    state,
  };
}

describe("authenticated protected-tip object availability", () => {
  it("fetches only the exact missing authenticated tip in a stale full clone without changing refs or FETCH_HEAD", () => {
    const f = fixture();
    expect(
      f.requireGit(f.clone, ["rev-parse", "--is-shallow-repository"]),
    ).toBe("false");
    expect(
      f.git(f.clone, ["cat-file", "-e", `${f.tip}^{commit}`]).status,
    ).not.toBe(0);
    const before = f.state();
    const verify = f.makeVerifier();
    expect(verify(f.metadata)).toEqual({ branch: "develop", tip: f.tip });
    expect(verify(f.metadata)).toEqual({ branch: "develop", tip: f.tip });
    expect(f.calls).toHaveLength(1);
    expect(f.calls[0]!.args).toEqual([
      "fetch",
      "--quiet",
      "--no-tags",
      "--no-prune",
      "--no-write-fetch-head",
      "--no-recurse-submodules",
      "--no-auto-maintenance",
      "--refmap=",
      canonical,
      f.tip,
    ]);
    expect(f.state()).toEqual(before);
    expect(f.git(f.clone, ["cat-file", "-e", `${f.tip}^{commit}`]).status).toBe(
      0,
    );
  });

  it("uses already-present tips without a fetch", () => {
    const f = fixture();
    expect(f.makeVerifier({ tip: f.inherited })(f.metadata)).toEqual({
      branch: "develop",
      tip: f.inherited,
    });
    expect(f.calls).toHaveLength(0);
  });

  it("fails closed without fetching when ancestry errors even though the tip object exists", () => {
    const f = fixture();
    const verify = f.makeVerifier({
      tip: f.inherited,
      status: (args) =>
        args.includes("merge-base")
          ? 128
          : (f.git(f.clone, args).status ?? 128),
    });
    expect(() => verify(f.metadata)).toThrow(/ancestry unavailable/);
    expect(f.calls).toHaveLength(0);
  });

  it("does not retry a failed fetch or alter local refs", () => {
    const f = fixture();
    const before = f.state();
    const fetch = vi.fn(() => ({
      ok: false,
      stdout: "",
      stderr: "provider fetch unavailable",
      status: 128,
    }));
    const verify = f.makeVerifier({ fetch });
    expect(() => verify(f.metadata)).toThrow(/protected tip.*fetch/i);
    expect(() => verify(f.metadata)).toThrow(
      /protected tip.*fetch|ancestry unavailable/i,
    );
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(f.state()).toEqual(before);
  });

  it("rechecks the exact commit after a reported successful fetch", () => {
    const f = fixture();
    const fetch = vi.fn(() => ({
      ok: true,
      stdout: "",
      stderr: "",
      status: 0,
    }));
    expect(() => f.makeVerifier({ fetch })(f.metadata)).toThrow(
      /protected tip.*unavailable/i,
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("rejects an authenticated but nonexistent tip instead of substituting another remote ref", () => {
    const f = fixture();
    const before = f.state();
    expect(() => f.makeVerifier({ tip: "f".repeat(40) })(f.metadata)).toThrow(
      /protected tip.*fetch/i,
    );
    expect(f.calls).toHaveLength(1);
    expect(f.state()).toEqual(before);
  });

  it("does not fetch when authenticated provider proof is unavailable", () => {
    const f = fixture();
    expect(() => f.makeVerifier({ unavailable: true })(f.metadata)).toThrow(
      /protected branch proof unavailable/,
    );
    expect(f.calls).toHaveLength(0);
  });

  it("does not fetch for an unrelated object-database error", () => {
    const f = fixture();
    expect(() => f.makeVerifier({ status: () => 128 })(f.metadata)).toThrow(
      /ancestry unavailable/,
    );
    expect(f.calls).toHaveLength(0);
  });
});
