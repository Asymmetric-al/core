/**
 * #2370 acceptance: the donors-by-donor_id embed check (C1 in the #2269
 * acceptance test) scans the whole repository, and only the allow-listed
 * files may contain the hint. The fixture cases run that same check against
 * throwaway trees under os.tmpdir(), never the real worktree, both inside a
 * Git work tree and in a plain copy without Git metadata.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { afterAll, describe, expect, it, vi } from "vitest";

import {
  DONORS_EMBED,
  DONORS_EMBED_ALLOW_LIST,
  checkDonorsEmbed,
  grepRepo,
  scanMode,
  type ScanMode,
} from "./donors-embed-scan";

const FR_INDEX = "packages/api/src/follower-requests/index.ts";
const FR_REQUEST = "packages/api/src/follower-requests/request.ts";
const T2269 =
  "tests/unit/acceptance/issue-2269/donations-embed.realstack.acceptance.test.ts";
/** The #2269 narrowed scope that #2370 replaces. */
const NARROWED = [
  "packages/api/src/donations/index.ts",
  "packages/graphql/handler.ts",
  "packages/api/src/donations/select.ts",
];
const EMBED = `const q = db.from("x").select("id, donor:${DONORS_EMBED}(id, name)");\n`;
/** Shaped like the real follower-requests reads: the embed opens its own select line. */
const READ = [
  'const { data } = await db.from("follower_requests").select(',
  "  `",
  "  id,",
  `  donor:${DONORS_EMBED}(`,
  "    id,",
  "    name",
  "  )",
  "`,",
  ");",
  "",
].join("\n");
/** A tree shaped like base: only the two follower-requests reads embed it. */
const BASE: Record<string, string> = {
  [FR_INDEX]: READ,
  [FR_REQUEST]: READ,
  "README.md": "fixture\n",
};
/** Runs `git` in `cwd`; throws on failure. */
function git(cwd: string, ...args: string[]) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args[0]}: ${r.stderr}`);
  return r.stdout;
}

const roots: string[] = [];
afterAll(() => {
  for (const r of roots) rmSync(r, { recursive: true, force: true });
});

function write(root: string, files: Record<string, string>) {
  for (const [f, body] of Object.entries(files)) {
    mkdirSync(dirname(join(root, f)), { recursive: true });
    writeFileSync(join(root, f), body);
  }
}
/** A temp tree; in "git" mode `files` are staged and `untracked` are not. */
function tree(
  mode: ScanMode,
  files: Record<string, string>,
  untracked: Record<string, string> = {},
) {
  const root = mkdtempSync(join(tmpdir(), "acc2370-"));
  roots.push(root);
  write(root, files);
  if (mode === "git") {
    git(root, "init", "-q");
    git(root, "add", "-A");
  }
  write(root, untracked);
  return root;
}
/** The check's verdict: hits outside the allow-list, and allow-listed reads no longer present. */
function verdict(root: string) {
  const r = checkDonorsEmbed(root);
  return {
    violations: r.violations.map((h) => `${h.file}:${h.line}`),
    missing: r.missing,
  };
}
const PASS = { violations: [], missing: [] };

describe("#2370 allow-list", () => {
  it("C2: allow-lists exactly the two follower-requests reads and the #2269 acceptance test", () =>
    expect(Object.keys(DONORS_EMBED_ALLOW_LIST).sort()).toEqual(
      [FR_INDEX, FR_REQUEST, T2269].sort(),
    ));
  it("C2: each allow-list entry has a one-line reason", () =>
    expect(
      Object.values(DONORS_EMBED_ALLOW_LIST).filter(
        (why) => why.trim().length < 10 || why.includes("\n"),
      ),
    ).toEqual([]));
});

describe.each(["git", "no-index"] as const)(
  "#2370 fixture trees (%s mode)",
  (mode) => {
    it("C3: the fixture is scanned in this mode", () =>
      expect(scanMode(tree(mode, BASE))).toBe(mode));

    it("C3: a tree whose only hits are the follower-requests reads passes", () =>
      expect(verdict(tree(mode, BASE))).toEqual(PASS));

    it.each([
      "packages/api/src/donations/other.ts",
      "packages/graphql/resolvers/donors.ts",
      "apps/donor/lib/donations.ts",
      "docs/notes.md",
      "scripts/report.mjs",
      "root.ts",
      "tests/unit/acceptance/issue-2370/new.test.ts",
      "packages/api/src/follower-requests/extra.ts",
      `vendor/copy/${FR_INDEX}`,
    ])("C4: an embed added at %s fails the check", (path) =>
      expect(verdict(tree(mode, { ...BASE, [path]: `\n${EMBED}` }))).toEqual({
        violations: [`${path}:2`],
        missing: [],
      }),
    );

    it("C4: the narrowed #2269 scope let an outside embed through; the repo-wide check catches it", () => {
      const root = tree(mode, {
        ...BASE,
        "packages/api/src/donors/list.ts": EMBED,
      });
      expect({
        narrowed: grepRepo(root, DONORS_EMBED, { paths: NARROWED }),
        widened: verdict(root).violations,
      }).toEqual({
        narrowed: [],
        widened: ["packages/api/src/donors/list.ts:1"],
      });
    });

    it.each([FR_INDEX, FR_REQUEST, T2269])(
      "C5: the same embed added at allow-listed %s passes",
      (path) =>
        expect(
          verdict(
            tree(mode, { ...BASE, [path]: `${BASE[path] ?? ""}${EMBED}` }),
          ),
        ).toEqual(PASS),
    );

    it("C6: a tree missing one follower-requests read reports it as stale", () => {
      const { [FR_REQUEST]: _gone, ...rest } = BASE;
      expect(verdict(tree(mode, rest))).toEqual({
        violations: [],
        missing: [FR_REQUEST],
      });
    });

    it("C6: a follower-requests read replaced by a comment naming the hint reports it as stale", () =>
      expect(
        verdict(
          tree(mode, {
            ...BASE,
            [FR_REQUEST]: `// The read-back no longer selects donor:${DONORS_EMBED}(id, name).\n`,
          }),
        ),
      ).toEqual({ violations: [], missing: [FR_REQUEST] }));

    it("C8: user color and column config does not change the verdict", () => {
      const root = tree(mode, { ...BASE, "docs/notes.md": `\n${EMBED}` });
      const config = {
        "color.ui": "always",
        "color.grep": "always",
        "grep.column": "true",
      };
      vi.stubEnv("GIT_CONFIG_COUNT", String(Object.keys(config).length));
      Object.entries(config).forEach(([k, v], i) => {
        vi.stubEnv(`GIT_CONFIG_KEY_${i}`, k);
        vi.stubEnv(`GIT_CONFIG_VALUE_${i}`, v);
      });
      try {
        const plain = spawnSync(
          "git",
          [
            "grep",
            "-n",
            "-z",
            ...(mode === "git" ? ["--untracked"] : ["--no-index"]),
            "-F",
            "-e",
            DONORS_EMBED,
          ],
          { cwd: root, encoding: "utf8" },
        ).stdout;
        expect({
          configColorsPlainGrep: plain.includes("\u001b["),
          verdict: verdict(root),
        }).toEqual({
          configColorsPlainGrep: true,
          verdict: { violations: ["docs/notes.md:2"], missing: [] },
        });
      } finally {
        vi.unstubAllEnvs();
      }
    });

    it("C8: a file name containing a newline is one hit, not a forged allow-listed one", () => {
      const path = `${T2269}\n${FR_INDEX}`;
      expect(verdict(tree(mode, { ...BASE, [path]: EMBED }))).toEqual({
        violations: [`${path}:1`],
        missing: [],
      });
    });

    it("C7: an embed in an untracked .gitignore'd file is not scanned", () =>
      expect(
        verdict(
          tree(mode, {
            ...BASE,
            ".gitignore": "generated/\n",
            "generated/types.ts": EMBED,
          }),
        ),
      ).toEqual(PASS));
  },
);

describe("#2370 scan scope and failure handling", () => {
  it("C7: an untracked file outside the allow-list fails the check (git mode)", () =>
    expect(
      verdict(tree("git", BASE, { "packages/api/src/scratch.ts": EMBED })),
    ).toEqual({ violations: ["packages/api/src/scratch.ts:1"], missing: [] }));

  it("C7: an embed in an untracked nested Git work tree fails the check (git mode)", () => {
    const root = tree("git", BASE, { "vendor/nested/lib.ts": EMBED });
    git(join(root, "vendor/nested"), "init", "-q");
    expect({
      untrackedOnlyGrep: spawnSync(
        "git",
        ["grep", "-l", "--untracked", "-F", "-e", DONORS_EMBED, "--", "vendor"],
        { cwd: root, encoding: "utf8" },
      ).stdout,
      verdict: verdict(root),
    }).toEqual({
      untrackedOnlyGrep: "",
      verdict: { violations: ["vendor/nested/lib.ts:1"], missing: [] },
    });
  });

  it.each([
    { pattern: "gen/", path: "gen/x.ts" },
    { pattern: ".env*", path: ".env.example" },
  ])(
    "C7: a committed embed at $path, which .gitignore pattern $pattern matches, fails the check (git mode)",
    ({ pattern, path }) => {
      const root = tree("git", {
        ...BASE,
        ".gitignore": `${pattern}\n`,
        [path]: EMBED,
      });
      git(root, "add", "-f", "--", path);
      // Neither of the previous scan's greps lists a tracked file whose path is ignored.
      const previousScanListsIt = [
        "--untracked",
        "--no-index --exclude-standard",
      ].map((scope) => {
        const r = spawnSync(
          "git",
          ["grep", "-l", ...scope.split(" "), "-F", "-e", DONORS_EMBED],
          { cwd: root, encoding: "utf8" },
        );
        // Status 0: the grep ran and found the follower-requests reads.
        return { status: r.status, lists: r.stdout.split("\n").includes(path) };
      });
      expect({
        trackedAndIgnored: git(
          root,
          "ls-files",
          "-c",
          "-i",
          "--exclude-standard",
        ),
        previousScanListsIt,
        verdict: verdict(root),
      }).toEqual({
        trackedAndIgnored: `${path}\n`,
        previousScanListsIt: [
          { status: 0, lists: false },
          { status: 0, lists: false },
        ],
        verdict: { violations: [`${path}:1`], missing: [] },
      });
    },
  );

  it("C8: a scan root that does not exist throws instead of passing", () =>
    expect(() =>
      checkDonorsEmbed(join(tmpdir(), `acc2370-missing-${randomUUID()}`)),
    ).toThrow());

  it.runIf(scanMode(process.cwd()) === "git")(
    "C8: the repository gives the same hits with and without Git metadata",
    () => {
      const key = (r: ReturnType<typeof checkDonorsEmbed>) =>
        r.hits.map((h) => `${h.file}:${h.line}`).sort();
      expect(key(checkDonorsEmbed(process.cwd(), "no-index"))).toEqual(
        key(checkDonorsEmbed(process.cwd(), "git")),
      );
    },
  );
});
