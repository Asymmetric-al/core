/**
 * #2370: the repository-wide check for the donors-by-donor_id embed hint.
 * #2269 narrowed it to three in-scope files (ruling 6391056825); #2370 widens
 * it back to the whole repository with a file-level allow-list.
 *
 * Scope: every file under the root, tracked or untracked, minus files ignored
 * by .gitignore. Inside the root's own Git work tree this is
 * `git grep --untracked`; without Git metadata (e.g. a plain copy) it is
 * `git grep --no-index --exclude-standard`, which has the same scope. Any grep
 * failure throws, so the check never passes by not running.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { spawnSync } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";

/** The embed hint, built from parts so this file is not a hit itself. */
export const DONORS_EMBED = ["donors", "donor_id"].join("!");

/** Files allowed to contain the hint: repo-relative path -> one-line reason. */
export const DONORS_EMBED_ALLOW_LIST: Readonly<Record<string, string>> = {
  "packages/api/src/follower-requests/index.ts":
    "Follower-requests list read embeds the requesting donor via follower_requests.donor_id on purpose (#2269 ruling 6391056825).",
  "packages/api/src/follower-requests/request.ts":
    "Follower-request update read-back embeds the requesting donor via follower_requests.donor_id on purpose (#2269 ruling 6391056825).",
  "tests/unit/acceptance/issue-2269/donations-embed.realstack.acceptance.test.ts":
    "The #2269 acceptance test names the string in its C1 check; it is not a read.",
};

/** The intentional reads. Each must still hit, so the allow-list can't go stale unnoticed. */
export const DONORS_EMBED_REQUIRED_SITES: readonly string[] = [
  "packages/api/src/follower-requests/index.ts",
  "packages/api/src/follower-requests/request.ts",
];

export type Hit = { file: string; line: number; text: string };
export type ScanMode = "git" | "no-index";

/** "git" only when `root` is the top level of its own Git work tree. */
export function scanMode(root: string): ScanMode {
  if (!existsSync(root)) throw new Error(`scan root does not exist: ${root}`);
  const r = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: root,
    encoding: "utf8",
  });
  if (r.error) throw r.error;
  return r.status === 0 && realpathSync(r.stdout.trim()) === realpathSync(root)
    ? "git"
    : "no-index";
}

/** Fixed-string grep of `root` (optionally limited to `paths`). */
export function grepRepo(
  root: string,
  needle: string,
  opts: { mode?: ScanMode; paths?: string[] } = {},
): Hit[] {
  const mode = opts.mode ?? scanMode(root);
  const scope =
    mode === "git" ? ["--untracked"] : ["--no-index", "--exclude-standard"];
  const r = spawnSync(
    "git",
    [
      "grep",
      "-n",
      "-z",
      ...scope,
      "-F",
      "-e",
      needle,
      "--",
      ...(opts.paths ?? []),
    ],
    { cwd: root, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 },
  );
  if (r.error) throw r.error;
  if (r.status === 1 && r.stdout === "") return [];
  if (r.status !== 0) {
    throw new Error(`git grep failed (status ${r.status}): ${r.stderr}`);
  }
  return r.stdout
    .split("\n")
    .filter((l) => l !== "")
    .map((l) => {
      const [file = "", line = "", ...text] = l.split("\0");
      const binary = /^Binary file (.+) matches$/.exec(l);
      if (binary && text.length === 0) {
        return { file: binary[1]!, line: 0, text: "" };
      }
      return { file, line: Number(line), text: text.join("\0") };
    });
}

/** The #2370 check: repo-wide hits, those outside the allow-list, and stale allow-list sites. */
export function checkDonorsEmbed(
  root: string = process.cwd(),
  mode: ScanMode = scanMode(root),
) {
  const hits = grepRepo(root, DONORS_EMBED, { mode });
  return {
    hits,
    violations: hits.filter(
      (h) => !Object.hasOwn(DONORS_EMBED_ALLOW_LIST, h.file),
    ),
    missing: DONORS_EMBED_REQUIRED_SITES.filter(
      (f) => !hits.some((h) => h.file === f),
    ),
  };
}
