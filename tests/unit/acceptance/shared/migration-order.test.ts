/**
 * The forward-migration order rule (#2406 criterion 1, kept general after
 * #2706 removed the merge-base comparison) and the CI base commit it reads.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import {
  ciBaseCommit,
  migrationsAt,
  outOfOrderMigrations,
} from "./migration-order";

const BASE = [
  "20261027100000_profiles_bucket_owner_folders.sql",
  "rollback_20261027100000_profiles_bucket_owner_folders.sql",
  "20261111164500_post_autosave_preconditions.sql",
];

describe("outOfOrderMigrations", () => {
  it("accepts a new forward migration above the newest one on the base", () => {
    expect(
      outOfOrderMigrations(BASE, [...BASE, "20261118090000_new_thing.sql"]),
    ).toEqual([]);
  });

  it.each([
    ["below the newest", "20261101000000_late_branch.sql"],
    ["equal to the newest", "20261111164500_same_version.sql"],
  ])("rejects a new forward migration %s", (_label, added) => {
    expect(outOfOrderMigrations(BASE, [...BASE, added])).toEqual([added]);
  });

  it("ignores rollbacks, other files, and migrations already on the base", () => {
    expect(
      outOfOrderMigrations(BASE, [
        ...BASE,
        "rollback_20261101000000_late_branch.sql",
        "README.md",
      ]),
    ).toEqual([]);
  });

  it("accepts anything when the base has no forward migration", () => {
    expect(outOfOrderMigrations([], ["20200101000000_first.sql"])).toEqual([]);
  });
});

describe("ciBaseCommit", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "migration-order-"));
  afterAll(() => rmSync(dir, { recursive: true, force: true }));
  const eventFile = (name: string, payload: unknown) => {
    const file = path.join(dir, `${name}.json`);
    writeFileSync(file, JSON.stringify(payload));
    return file;
  };

  it("reads the pull request's base commit", () => {
    const GITHUB_EVENT_PATH = eventFile("pr", {
      pull_request: { base: { sha: "a".repeat(40) } },
    });
    expect(
      ciBaseCommit({ GITHUB_EVENT_NAME: "pull_request", GITHUB_EVENT_PATH }),
    ).toBe("a".repeat(40));
  });

  it("reads the merge queue's base commit", () => {
    const GITHUB_EVENT_PATH = eventFile("mg", {
      merge_group: { base_sha: "b".repeat(40) },
    });
    expect(
      ciBaseCommit({ GITHUB_EVENT_NAME: "merge_group", GITHUB_EVENT_PATH }),
    ).toBe("b".repeat(40));
  });

  it.each<[string, Record<string, string | undefined>]>([
    ["outside CI", {}],
    [
      "on a push",
      {
        GITHUB_EVENT_NAME: "push",
        GITHUB_EVENT_PATH: eventFile("push", { before: "c".repeat(40) }),
      },
    ],
    [
      "when the payload has no base",
      {
        GITHUB_EVENT_NAME: "pull_request",
        GITHUB_EVENT_PATH: eventFile("bad", { pull_request: {} }),
      },
    ],
  ])("knows no base %s", (_label, env) => {
    expect(ciBaseCommit(env)).toBeUndefined();
  });
});

// #2716 review round 2: git quotes a non-ASCII name unless it prints with -z.
describe("migrationsAt", () => {
  const repo = mkdtempSync(path.join(tmpdir(), "migration-order-git-"));
  afterAll(() => rmSync(repo, { recursive: true, force: true }));
  const git = (args: string[], input?: string) => {
    const r = spawnSync("git", args, { cwd: repo, encoding: "utf8", input });
    expect(r.status, r.stderr).toBe(0);
    return r.stdout.trim();
  };
  const NEWEST = "20261118100000_café.sql";

  it("lists a non-ASCII base migration verbatim, so it still sets the newest version", () => {
    git(["init", "-q"]);
    const blob = git(["hash-object", "-w", "--stdin"], "select 1;\n");
    const migrations = git(
      ["mktree"],
      `100644 blob ${blob}\t20261118090000_plain.sql\n100644 blob ${blob}\t${NEWEST}\n`,
    );
    const supabase = git(["mktree"], `040000 tree ${migrations}\tmigrations\n`);
    const root = git(["mktree"], `040000 tree ${supabase}\tsupabase\n`);
    const onBase = migrationsAt(root, repo);
    expect(onBase).toEqual(["20261118090000_plain.sql", NEWEST]);
    expect(
      outOfOrderMigrations(onBase, [...onBase, "20261118095000_late.sql"]),
    ).toEqual(["20261118095000_late.sql"]);
  });
});
