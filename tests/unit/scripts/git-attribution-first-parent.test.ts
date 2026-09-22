import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";

import { afterEach, describe, expect, it } from "vitest";

import { objectFixture } from "./git-attribution-object-fixture";

import { collectCiCommitShas } from "../../../scripts/verify/git-attribution.mjs";

const roots: string[] = [];
afterEach(() =>
  roots
    .splice(0)
    .forEach((root) => rmSync(root, { recursive: true, force: true })),
);
function fixture() {
  const f = objectFixture();
  roots.push(f.root);
  const main = f.commit("main integration", [f.base]);
  const side = f.commit("prior production is on side", [f.base]);
  const merge = f.commit("GitHub-shaped integration", [main, side]);
  const collect = (
    before: string,
    after: string,
    refName: string,
    eventName = "push",
  ) =>
    collectCiCommitShas({
      baseSha: before,
      headSha: after,
      eventName,
      refName,
      refType: "branch",
      runGit: (args: string[]) => f.git(args),
      runGitStatus: (args: string[]) =>
        spawnSync("git", args, { cwd: f.root, env: f.env }).status,
    });
  return { ...f, main, side, merge, collect };
}

describe("protected first-parent transition boundary", () => {
  it.each(["develop", "production"])(
    "rejects a %s before SHA reachable only through a side parent",
    (ref) => {
      const f = fixture();
      expect(() => f.collect(f.side, f.merge, ref)).toThrow(/first-parent/);
    },
  );
  it.each(["develop", "production"])(
    "preserves normal %s integrations on the existing first-parent spine",
    (ref) => {
      const f = fixture();
      expect(f.collect(f.main, f.merge, ref)).toEqual([f.merge]);
      const nextSide = f.commit("next reviewed side", [f.base]);
      const nextMerge = f.commit("next GitHub-shaped merge", [
        f.merge,
        nextSide,
      ]);
      expect(f.collect(f.main, nextMerge, ref)).toEqual([nextMerge, f.merge]);
    },
  );
  it.each(["develop", "production"])(
    "allows a zero-length %s transition",
    (ref) => {
      const f = fixture();
      expect(f.collect(f.merge, f.merge, ref)).toEqual([]);
    },
  );
  it("keeps full-DAG pull-request enumeration even when its base lies on a side", () => {
    const f = fixture();
    expect(f.collect(f.side, f.merge, "123/merge", "pull_request")).toEqual([
      f.merge,
      f.main,
    ]);
  });
  it("still rejects unrelated protected updates before enumerating an integration", () => {
    const f = fixture();
    const unrelated = f.commit("unrelated root");
    expect(() => f.collect(unrelated, f.merge, "production")).toThrow(
      /fast-forward/,
    );
  });
});
