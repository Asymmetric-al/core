/**
 * #2526 probe: what a unit test sees of the Git environment. Also a direct
 * in-suite check: in every run, no checkout-local Git variable may be visible
 * to tests. `inherited-git-environment.acceptance.test.ts` additionally runs it
 * in a child Vitest with every such variable set (ACC2526_PROBE=1).
 *
 * Expected names come from Git itself (githooks; `git rev-parse
 * --local-env-vars`) plus the GIT_CONFIG_KEY_<n>/GIT_CONFIG_VALUE_<n> pairs
 * that GIT_CONFIG_COUNT selects (git-config ENVIRONMENT). Owned by Acceptance.
 */
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";

import { describe, expect, it } from "vitest";

const IN_CHILD = process.env.ACC2526_PROBE === "1";

/** Asked outside any repository with no inherited Git variables. */
function gitLocalNames() {
  const r = spawnSync("git", ["rev-parse", "--local-env-vars"], {
    cwd: tmpdir(),
    encoding: "utf8",
    env: { PATH: process.env.PATH ?? "" },
  });
  const names = new Set(r.stdout.split("\n").filter(Boolean));
  if (r.status !== 0 || !names.has("GIT_DIR"))
    throw new Error(`git rev-parse --local-env-vars failed: ${r.stderr}`);
  return names;
}

describe("#2526 probe: Git environment visible to unit tests", () => {
  it("no checkout-local Git variable or GIT_CONFIG_KEY/VALUE pair reaches tests", () => {
    const local = gitLocalNames();
    const visible = Object.keys(process.env)
      .filter(
        (name) =>
          local.has(name) || /^GIT_CONFIG_(?:KEY|VALUE)_\d+$/.test(name),
      )
      .sort();
    expect(visible).toEqual([]);
  });

  it.runIf(IN_CHILD)(
    "Git variables that are not checkout-local still reach tests",
    () => {
      expect({
        GIT_AUTHOR_NAME: process.env.GIT_AUTHOR_NAME,
        GIT_TERMINAL_PROMPT: process.env.GIT_TERMINAL_PROMPT,
      }).toEqual({ GIT_AUTHOR_NAME: "acc2526 keep", GIT_TERMINAL_PROMPT: "0" });
    },
  );
});
