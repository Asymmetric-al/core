import { spawnSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { objectFixture } from "./git-attribution-object-fixture";
import {
  isHistoricalCommit,
  validateDevelopMergeProvenance,
} from "../../../scripts/verify/git-attribution.mjs";

const roots: string[] = [];
afterEach(() =>
  roots
    .splice(0)
    .forEach((root) => rmSync(root, { recursive: true, force: true })),
);
const forbidden = {
  GIT_AUTHOR_EMAIL: "codex@example.com",
  GIT_COMMITTER_EMAIL: "codex@example.com",
};
function fixture() {
  const f = objectFixture();
  roots.push(f.root);
  return f;
}

describe("immutable Git object attribution", () => {
  it.each(["repository", "environment"])(
    "ignores %s grafts that would make a novel commit historical",
    (location) => {
      const f = fixture();
      const novel = f.commit("novel forbidden", [f.base], forbidden);
      const graftPath = path.join(
        f.root,
        location === "repository" ? ".git/info/grafts" : "custom-grafts",
      );
      writeFileSync(graftPath, `${f.baseline} ${novel}\n`);
      const result = f.verify(
        novel,
        location === "environment" ? { GIT_GRAFT_FILE: graftPath } : {},
      );
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("codex@example.com");
    },
  );

  it("rejects a novel forbidden commit despite a replacement baseline that inherits it", () => {
    const f = fixture();
    const novel = f.commit("novel forbidden", [f.base], forbidden);
    const fakeBaseline = f.commit("replacement baseline", [novel]);
    f.git(["replace", f.baseline, fakeBaseline]);
    const runGitStatus = (args: string[]) =>
      spawnSync("git", args, { cwd: f.root, env: f.env }).status;
    expect(
      isHistoricalCommit({ sha: novel, baselineSha: f.baseline, runGitStatus }),
    ).toBe(false);
    const result = f.verify(novel);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("codex@example.com");
  });
  it("reads the real forbidden metadata instead of an allowed replacement commit", () => {
    const f = fixture();
    const novel = f.commit("novel forbidden", [f.base], forbidden);
    const substituted = f.commit("allowed replacement", [f.base]);
    f.git(["replace", novel, substituted]);
    const result = f.verify(novel);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("codex@example.com");
  });
  it("does not let a replacement head hide a forbidden outgoing parent", () => {
    const f = fixture();
    const hidden = f.commit("forbidden outgoing parent", [f.base], forbidden);
    const head = f.commit("allowed outgoing head", [hidden]);
    const substituted = f.commit("replacement skips parent", [f.base]);
    f.git(["replace", head, substituted]);
    const result = f.verify(head);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("codex@example.com");
  });
  it("does not fabricate merged-PR base ancestry using replacement objects", () => {
    const f = fixture();
    const unrelated = f.commit("unrelated base");
    const baseParent = f.commit("true first parent", [f.base]);
    const side = f.commit("side", [f.base]);
    const merge = f.commit("merge", [baseParent, side]);
    const substituted = f.commit("replacement first parent", [unrelated]);
    f.git(["replace", baseParent, substituted]);
    const errors = validateDevelopMergeProvenance({
      metadata: { sha: merge, parentShas: [baseParent, side] },
      pullRequests: [
        {
          state: "closed",
          merged_at: "2026-09-22T00:00:00Z",
          merge_commit_sha: merge,
          base: {
            sha: unrelated,
            ref: "develop",
            repo: { full_name: "Asymmetric-al/core" },
          },
          head: { sha: side },
        },
      ],
      runGitStatus: (args: string[]) =>
        spawnSync("git", args, { cwd: f.root, env: f.env }).status,
    });
    expect(errors).toHaveLength(1);
  });
  it("preserves valid novel commits and ordinary historical ancestors", () => {
    const f = fixture();
    expect(
      isHistoricalCommit({
        sha: f.base,
        baselineSha: f.baseline,
        runGitStatus: (args: string[]) =>
          spawnSync("git", args, { cwd: f.root, env: f.env }).status,
      }),
    ).toBe(true);
    expect(f.verify(f.commit("valid novel", [f.base])).status).toBe(0);
  });
});
