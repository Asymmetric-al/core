import { spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const repo = process.cwd();
const SKILL = "thermo-nuclear-code-quality-review";
const NATIVE_EXPLICIT_POLICY = "policy:\n  allow_implicit_invocation: false\n";
const OLD_CANONICAL = "# Old skill\n";
const roots: string[] = [];
const cleanEnv = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")),
);

function git(cwd: string, args: string[]) {
  const result = spawnSync("git", args, {
    cwd,
    env: cleanEnv,
    encoding: "utf8",
  });
  expect(result.status, result.stderr).toBe(0);
  return result.stdout.trim();
}

/**
 * A copy of the refresh script pointed at a local stand-in for the Cursor Team
 * Kit repository. That group is refreshed from a GitHub clone and never runs
 * the managed adapter, so it is the path most likely to lose a Core-only file.
 */
async function fixture(options: { linkedSkillDirectory?: boolean } = {}) {
  await mkdir(path.join(repo, ".tmp"), { recursive: true });
  const root = await mkdtemp(
    path.join(repo, ".tmp", "explicit-policy-github-refresh-"),
  );
  roots.push(root);
  await mkdir(path.join(root, "scripts"), { recursive: true });
  await cp(path.join(repo, "scripts/lib"), path.join(root, "scripts/lib"), {
    recursive: true,
  });

  const source = path.join(root, "upstream");
  const skillsRoot = path.join(source, "cursor-team-kit/skills");
  const realSkill = options.linkedSkillDirectory
    ? path.join(source, "elsewhere", SKILL)
    : path.join(skillsRoot, SKILL);
  await mkdir(realSkill, { recursive: true });
  await mkdir(skillsRoot, { recursive: true });
  // Upstream marks the skill explicit-only and ships no Codex metadata.
  await writeFile(
    path.join(realSkill, "SKILL.md"),
    [
      "---",
      `name: ${SKILL}`,
      "description: Fixture review skill.",
      "disable-model-invocation: true",
      "---",
      "",
      "# Fixture",
      "",
    ].join("\n"),
  );
  if (options.linkedSkillDirectory)
    await symlink(
      path.join("..", "..", "elsewhere", SKILL),
      path.join(skillsRoot, SKILL),
      "dir",
    );
  await mkdir(path.join(source, "cursor-team-kit/agents"), { recursive: true });
  for (const agent of ["ci-watcher.md", `${SKILL}.md`])
    await cp(
      path.join(repo, ".cursor/agents", agent),
      path.join(source, "cursor-team-kit/agents", agent),
    );
  git(source, ["init", "-b", "main"]);
  git(source, ["add", "."]);
  git(source, [
    "-c",
    "user.name=Fixture",
    "-c",
    "user.email=fixture@example.invalid",
    "-c",
    "commit.gpgsign=false",
    "commit",
    "-m",
    "Synthetic upstream",
  ]);

  const upstreamUrl = 'repo: "https://github.com/cursor/plugins.git"';
  const script = await readFile(
    path.join(repo, "scripts/refresh-upstream-skills.mjs"),
    "utf8",
  );
  expect(script).toContain(upstreamUrl);
  await writeFile(
    path.join(root, "scripts/refresh-upstream-skills.mjs"),
    script.replace(upstreamUrl, "repo: " + JSON.stringify(source)),
  );

  const canonical = path.join(root, "docs/ai/skills", SKILL);
  await mkdir(canonical, { recursive: true });
  await writeFile(path.join(canonical, "SKILL.md"), OLD_CANONICAL);
  await writeFile(
    path.join(root, "skills-lock.json"),
    JSON.stringify({
      version: 1,
      skills: { [SKILL]: { source: "cursor/plugins", computedHash: "old" } },
    }) + "\n",
  );
  return { root, canonical, realSkill };
}

function refresh(root: string) {
  return spawnSync(
    process.execPath,
    ["scripts/refresh-upstream-skills.mjs", "--only=cursor/plugins"],
    { cwd: root, env: cleanEnv, encoding: "utf8", timeout: 60_000 },
  );
}

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

// Git on Windows checks a committed link out as a plain file unless the
// machine opts in, so the linked-directory case cannot be set up there. CI
// runs on Linux.
describe.skipIf(process.platform === "win32")(
  "explicit-only policy through a GitHub-path refresh",
  () => {
    it("writes the native policy when upstream ships no Codex metadata", async () => {
      const { root, canonical } = await fixture();

      const result = refresh(root);

      expect(result.status, result.stdout + result.stderr).toBe(0);
      expect(
        await readFile(path.join(canonical, "SKILL.md"), "utf8"),
      ).toContain("disable-model-invocation: true");
      expect(
        await readFile(path.join(canonical, "agents/openai.yaml"), "utf8"),
      ).toBe(NATIVE_EXPLICIT_POLICY);
    });

    it("refuses an upstream skill directory that is a link", async () => {
      const { root, canonical, realSkill } = await fixture({
        linkedSkillDirectory: true,
      });

      const result = refresh(root);

      expect(result.status, result.stdout + result.stderr).not.toBe(0);
      expect(result.stdout + result.stderr).toContain(
        "Upstream skill source must be a real directory",
      );
      // Nothing was published, and nothing was written through the link.
      expect(await readFile(path.join(canonical, "SKILL.md"), "utf8")).toBe(
        OLD_CANONICAL,
      );
      await expect(
        readFile(path.join(canonical, "agents/openai.yaml"), "utf8"),
      ).rejects.toMatchObject({ code: "ENOENT" });
      await expect(
        readFile(path.join(realSkill, "agents/openai.yaml"), "utf8"),
      ).rejects.toMatchObject({ code: "ENOENT" });
    });
  },
);
