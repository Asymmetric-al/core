/**
 * The forward-migration order rule (#2406 criterion 1). #2706 removed the
 * merge-base comparison the criterion used; the rule itself is general, so it
 * covers every forward migration a pull request adds: each sorts above every
 * forward migration already on the base, because a database that has applied
 * the base would otherwise apply it out of order, or refuse it. The base is
 * the commit CI names for the run (the pull request's base, or the merge
 * queue's base); outside CI and on pushes there is none.
 *
 * Its better home is a migration verifier under `scripts/verify/`; it stays
 * in the acceptance suite until one owns it.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

export const MIGRATIONS = "supabase/migrations";
const FORWARD = /^\d{14}_.+\.sql$/;
const version = (file: string) => file.slice(0, 14);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** The base commit in the CI event payload, or undefined when the run has none. */
export function ciBaseCommit(
  env: Record<string, string | undefined> = process.env,
): string | undefined {
  const file = env.GITHUB_EVENT_PATH;
  if (!file || !existsSync(file)) return undefined;
  const event: unknown = JSON.parse(readFileSync(file, "utf8"));
  if (!isRecord(event)) return undefined;
  let sha: unknown;
  if (env.GITHUB_EVENT_NAME === "pull_request") {
    const pr = event.pull_request;
    const base = isRecord(pr) ? pr.base : undefined;
    sha = isRecord(base) ? base.sha : undefined;
  } else if (env.GITHUB_EVENT_NAME === "merge_group") {
    const group = event.merge_group;
    sha = isRecord(group) ? group.base_sha : undefined;
  }
  return typeof sha === "string" && sha !== "" ? sha : undefined;
}

/**
 * Migration file names on `commit` (in the repository at `cwd`); throws when
 * git cannot read that commit.
 */
export function migrationsAt(commit: string, cwd?: string): string[] {
  const r = spawnSync(
    "git",
    ["ls-tree", "-z", "--name-only", `${commit}:${MIGRATIONS}`],
    { cwd, encoding: "utf8" },
  );
  if (r.status !== 0) {
    throw new Error(
      `cannot list ${MIGRATIONS} at base ${commit} (the checkout needs fetch-depth: 0): ${r.stderr.trim()}`,
    );
  }
  // -z prints each name verbatim and NUL-terminated; without it git quotes a
  // name with a non-ASCII or special character, which FORWARD then rejects.
  return r.stdout.split("\0").filter(Boolean);
}

/**
 * Forward migrations in `local` that are not on the base and do not sort
 * above every forward migration in `onBase`.
 */
export function outOfOrderMigrations(
  onBase: readonly string[],
  local: readonly string[],
): string[] {
  const base = onBase.filter((f) => FORWARD.test(f));
  const newest = base.map(version).sort().at(-1);
  if (newest === undefined) return [];
  return local
    .filter((f) => FORWARD.test(f) && !base.includes(f))
    .filter((f) => version(f) <= newest)
    .sort();
}
