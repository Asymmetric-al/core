/**
 * #2526 probe. `inherited-git-environment.acceptance.test.ts` runs this file in
 * a child Vitest whose environment carries a pre-push hook's checkout-local Git
 * variables. It exercises the unedited #2253 harness `tempRepo()`, which runs
 * `git init` and `git add -A` with the inherited environment.
 *
 * Harmless in the normal suite: it builds one throwaway repo under
 * os.tmpdir() and removes it. Owned by Acceptance.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { removeTempDirs, tempRepo } from "../issue-2253/harness";

afterAll(removeTempDirs);

describe("#2526 probe: the #2253 harness inside the unit suite", () => {
  it("tempRepo() initialises and indexes its own repository at the temp root", () => {
    const root = tempRepo([], { "acc2526-fixture.txt": "fixture\n" });
    const listed = spawnSync("git", ["ls-files"], {
      cwd: root,
      encoding: "utf8",
    });
    expect({
      ownGitDir: existsSync(path.join(root, ".git", "HEAD")),
      indexed: listed.stdout.split("\n").filter(Boolean).sort(),
    }).toEqual({
      ownGitDir: true,
      indexed: [".gitignore", "acc2526-fixture.txt"],
    });
  });
});
