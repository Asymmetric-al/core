/**
 * The forward-migration order rule (#2406 criterion 1, kept general after
 * #2706 removed the merge-base comparison) and the CI base commit it reads.
 */
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { ciBaseCommit, outOfOrderMigrations } from "./migration-order";

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
