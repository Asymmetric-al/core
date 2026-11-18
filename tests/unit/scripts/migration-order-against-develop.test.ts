/**
 * The order of migration dates is the order of merge (council round 2 on
 * WP2a, R7). The release job stops on a pending migration dated at or before
 * the database's head (`checkMigrationOrder` in
 * scripts/release/migration-heads.mjs; plan 12, WP1: "a release that carries
 * an out-of-order migration stops before it deploys"). From an empty database
 * every chain applies in file order, so no other gate sees it; on a database
 * that already holds develop's chain, a branch migration dated before
 * develop's newest is refused.
 *
 * This guard fails on any migration in the working tree that origin/develop
 * does not have and that is dated at or before origin/develop's newest
 * migration. It reads origin/develop with git, as the acceptance suites do
 * (tests/unit/acceptance/issue-2364/static.acceptance.test.ts). A checkout
 * without origin/develop skips, as tests/unit/acceptance/issue-2406 and
 * issue-2407 do, except in CI, where the jobs check out with fetch-depth 0
 * and the ref must be there.
 */
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

const MIGRATIONS = "supabase/migrations";
const DEVELOP = "origin/develop";
/** The forward-migration filter of scripts/release/migration-heads.mjs. */
const FORWARD = /^(\d{14})_.+\.sql$/;

const version = (name: string) => FORWARD.exec(name)?.[1] ?? null;

/** Migrations of `tree` that `develop` lacks, dated at or before develop's newest. */
function outOfOrderAgainst(
  develop: readonly string[],
  tree: readonly string[],
): string[] {
  const known = new Set(develop);
  const newest = develop
    .map(version)
    .filter((v): v is string => v !== null)
    .sort()
    .at(-1);
  if (!newest) return [];
  return tree
    .filter((name) => {
      const v = version(name);
      return v !== null && !known.has(name) && v <= newest;
    })
    .sort();
}

/** origin/develop's migration file names, or null when the ref is absent. */
function developMigrations(): string[] | null {
  const r = spawnSync(
    "git",
    ["ls-tree", "--name-only", `${DEVELOP}:${MIGRATIONS}`],
    { encoding: "utf8" },
  );
  if (r.error || r.status !== 0) return null;
  return r.stdout.split("\n").filter((name) => FORWARD.test(name));
}

const treeMigrations = () =>
  readdirSync(MIGRATIONS).filter((name) => FORWARD.test(name));

describe("migration dates follow develop's chain (council round 2 on WP2a, R7)", () => {
  it("adds no migration dated at or before origin/develop's newest", (ctx) => {
    const develop = developMigrations();
    if (!develop) {
      expect(
        process.env.GITHUB_ACTIONS,
        "CI checks out with fetch-depth 0, so origin/develop must be present",
      ).not.toBe("true");
      ctx.skip(`no ${DEVELOP} in this checkout`);
      return;
    }
    expect(develop.length).toBeGreaterThan(0);
    expect(outOfOrderAgainst(develop, treeMigrations())).toEqual([]);
  });

  it("names a planted migration dated before develop's newest, and only that one", () => {
    const develop = ["20261001000000_first.sql", "20261028100000_newest.sql"];
    expect(
      outOfOrderAgainst(develop, [
        ...develop,
        "20261027235959_planted_before_the_head.sql",
        "20261028100000_planted_at_the_head.sql",
        "20261117160000_after_the_head.sql",
        "rollback_20261001000000_first.sql",
      ]),
    ).toEqual([
      "20261027235959_planted_before_the_head.sql",
      "20261028100000_planted_at_the_head.sql",
    ]);
    expect(outOfOrderAgainst([], ["20261027235959_any.sql"])).toEqual([]);
  });

  it("names a planted migration against the real develop chain and working tree", (ctx) => {
    const develop = developMigrations();
    if (!develop) {
      ctx.skip(`no ${DEVELOP} in this checkout`);
      return;
    }
    const newest = develop.map(version).sort().at(-1)!;
    const planted = `${String(BigInt(newest) - 1n)}_planted.sql`;
    expect(outOfOrderAgainst(develop, [...treeMigrations(), planted])).toEqual([
      planted,
    ]);
  });
});
