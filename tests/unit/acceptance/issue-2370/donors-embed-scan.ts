/**
 * #2370: the repository-wide check for the donors-by-donor_id embed hint.
 * #2269 narrowed it to three in-scope files (ruling 6391056825); #2370 widens
 * it back to the whole repository with a file-level allow-list.
 *
 * Scope inside the root's own Git work tree: every tracked file, including
 * committed files whose path a .gitignore pattern matches, plus every untracked
 * file that is not ignored, including files in untracked nested Git work trees.
 * That is two greps, merged by file and line:
 * - a plain `git grep` (no scope flag): every tracked file's working-tree
 *   content, regardless of ignore rules. `--untracked` and `--exclude-standard`
 *   would both skip tracked files that match .gitignore;
 * - `git grep --no-index --exclude-standard`: every non-ignored file,
 *   untracked ones and nested work trees included.
 * Without Git metadata (e.g. a plain copy) only the second grep can run, and
 * nothing is "tracked", so a file whose path matches .gitignore is never
 * scanned there, even if the original repository commits it. Any grep failure
 * or unparseable output throws, so the check never passes by not running.
 *
 * Output is read machine-style: `-z -n --no-color --no-column -a`, so user
 * color/column config can't change the record shape, and binary hits use the
 * same `file NUL line NUL text LF` records as text hits.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { spawnSync } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";

/** The embed hint, built from parts so this file is not a hit itself. */
export const DONORS_EMBED = ["donors", "donor_id"].join("!");

/** The shape of the intentional reads: a select line opening `donor:<hint>(`. */
export const DONORS_EMBED_READ = `donor:${DONORS_EMBED}(`;

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

/**
 * Parses `git grep -z -n` output: each record is the file name up to NUL, the
 * line number up to NUL, then the line text up to LF. File names may contain
 * LF (never NUL), so records are not split on LF first.
 */
export function parseGrepRecords(out: string): Hit[] {
  const hits: Hit[] = [];
  let at = 0;
  while (at < out.length) {
    const fileEnd = out.indexOf("\0", at);
    const lineEnd = fileEnd < 0 ? -1 : out.indexOf("\0", fileEnd + 1);
    const textEnd = lineEnd < 0 ? -1 : out.indexOf("\n", lineEnd + 1);
    const file = out.slice(at, fileEnd);
    const line = out.slice(fileEnd + 1, lineEnd);
    if (textEnd < 0 || file === "" || !/^[1-9]\d*$/.test(line)) {
      throw new Error(
        `unparseable git grep output at offset ${at}: ${JSON.stringify(out.slice(at, at + 200))}`,
      );
    }
    hits.push({
      file,
      line: Number(line),
      text: out.slice(lineEnd + 1, textEnd),
    });
    at = textEnd + 1;
  }
  return hits;
}

function runGrep(
  root: string,
  scope: string[],
  needle: string,
  paths: string[],
): Hit[] {
  const r = spawnSync(
    "git",
    [
      "grep",
      "-n",
      "-z",
      "-a",
      "--no-color",
      "--no-column",
      ...scope,
      "-F",
      "-e",
      needle,
      "--",
      ...paths,
    ],
    { cwd: root, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 },
  );
  if (r.error) throw r.error;
  if (r.status === 1 && r.stdout === "") return [];
  if (r.status !== 0) {
    throw new Error(`git grep failed (status ${r.status}): ${r.stderr}`);
  }
  return parseGrepRecords(r.stdout);
}

/** Fixed-string grep of `root` (optionally limited to `paths`), sorted by file then line. */
export function grepRepo(
  root: string,
  needle: string,
  opts: { mode?: ScanMode; paths?: string[] } = {},
): Hit[] {
  const mode = opts.mode ?? scanMode(root);
  const paths = opts.paths ?? [];
  const found = runGrep(
    root,
    ["--no-index", "--exclude-standard"],
    needle,
    paths,
  );
  // Tracked files, ignore rules not applied: covers committed files under
  // .gitignore'd paths, which the --no-index/--exclude-standard pass skips.
  if (mode === "git") found.push(...runGrep(root, [], needle, paths));
  const byKey = new Map<string, Hit>();
  for (const h of found) byKey.set(`${h.file}\0${h.line}`, h);
  return [...byKey.values()].sort((a, b) =>
    a.file === b.file ? a.line - b.line : a.file < b.file ? -1 : 1,
  );
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
      (f) =>
        !hits.some(
          (h) =>
            h.file === f && h.text.trimStart().startsWith(DONORS_EMBED_READ),
        ),
    ),
  };
}
