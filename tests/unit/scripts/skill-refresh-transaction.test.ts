import { spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const roots: string[] = [];
const emilSkills = [
  "animate",
  "animate-expo",
  "animation-vocabulary",
  "apple-design",
  "ask-sonner",
  "emil-design-eng",
  "emil-prototype",
  "improve-animations",
  "mobile-native",
  "pick-ui-library",
  "review-animations",
  "write-swift",
];

async function createFixture(emil = false) {
  await mkdir(path.join(repoRoot, ".tmp"), { recursive: true });
  const root = await mkdtemp(path.join(repoRoot, ".tmp", "skill-transaction-"));
  roots.push(root);
  await mkdir(path.join(root, "scripts"), { recursive: true });
  await cp(
    process.env.CORE_SKILL_REFRESH_TEST_SOURCE ??
      path.join(repoRoot, "scripts/refresh-upstream-skills.mjs"),
    path.join(root, "scripts/refresh-upstream-skills.mjs"),
  );
  await cp(path.join(repoRoot, "scripts/lib"), path.join(root, "scripts/lib"), {
    recursive: true,
  });
  const names = emil
    ? emilSkills
    : ["supabase", "supabase-postgres-best-practices"];
  for (const name of names) {
    const canonical = path.join(root, "docs/ai/skills", name);
    const source = path.join(root, ".agents/skills", name);
    await mkdir(canonical, { recursive: true });
    await mkdir(source, { recursive: true });
    if (emil) {
      await cp(path.join(repoRoot, "docs/ai/skills", name), canonical, {
        recursive: true,
      });
      await cp(canonical, source, { recursive: true });
      const current = await readFile(path.join(source, "SKILL.md"), "utf8");
      await writeFile(
        path.join(source, "SKILL.md"),
        current.replace(
          /<!-- CORE-OVERLAY-START -->[\s\S]*?<!-- CORE-OVERLAY-END -->/g,
          "",
        ) + "\nFixture upstream revision.\n",
      );
    } else {
      await writeFile(path.join(canonical, "SKILL.md"), `# old ${name}\n`);
      await writeFile(path.join(source, "SKILL.md"), `# new ${name}\n`);
    }
  }
  if (emil)
    await cp(
      path.join(repoRoot, "skills-lock.json"),
      path.join(root, "skills-lock.json"),
    );
  return root;
}

async function createGithubFixture() {
  const root = await createFixture();
  const upstream = path.join(root, "upstream");
  const skill = "cursor-team-kit/skills/weekly-review/SKILL.md";
  const companions = ["ci-watcher.md", "thermo-nuclear-code-quality-review.md"];
  await mkdir(path.dirname(path.join(upstream, skill)), { recursive: true });
  await writeFile(
    path.join(upstream, skill),
    "---\nname: weekly-review\ndescription: Fixture\n---\n\n# New weekly review\n",
  );
  await mkdir(path.join(upstream, "cursor-team-kit/agents"), {
    recursive: true,
  });
  await mkdir(path.join(root, ".cursor/agents"), { recursive: true });
  for (const name of companions) {
    await writeFile(
      path.join(upstream, "cursor-team-kit/agents", name),
      `new ${name}\n`,
    );
    await writeFile(path.join(root, ".cursor/agents", name), `old ${name}\n`);
  }
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")),
  );
  for (const args of [
    ["init", "-b", "main"],
    ["add", "."],
    [
      "-c",
      "user.name=Fixture",
      "-c",
      "user.email=fixture@example.invalid",
      "commit",
      "-m",
      "Synthetic upstream fixture",
    ],
  ]) {
    const result = spawnSync("git", args, {
      cwd: upstream,
      encoding: "utf8",
      env,
    });
    expect(result.status, result.stderr).toBe(0);
  }
  const file = path.join(root, "scripts/refresh-upstream-skills.mjs");
  const script = await readFile(file, "utf8");
  const marker = 'repo: "https://github.com/cursor/plugins.git"';
  expect(script).toContain(marker);
  await writeFile(
    file,
    script.replace(marker, `repo: ${JSON.stringify(upstream)}`),
  );
  await mkdir(path.join(root, "docs/ai/skills/weekly-review"), {
    recursive: true,
  });
  await writeFile(
    path.join(root, "docs/ai/skills/weekly-review/SKILL.md"),
    "# Old weekly review\n",
  );
  await writeFile(
    path.join(root, "skills-lock.json"),
    '{"version":1,"skills":{"weekly-review":{"source":"cursor/plugins","computedHash":"old"}}}\n',
  );
  return root;
}

// Inject filesystem faults at the public CLI's I/O boundary. Every test asserts
// its named fault was reached, so an earlier compatibility error cannot pass.
async function injectFault(root: string, fault: string) {
  const file = path.join(root, "scripts/refresh-upstream-skills.mjs");
  let source = await readFile(file, "utf8");
  for (const name of ["rename", "rm", "writeFile"]) {
    const needle = `  ${name},\n`;
    expect(source).toContain(needle);
    source = source.replace(needle, `  ${name} as real_${name},\n`);
  }
  source += `
async function rename(from, to) {
  if (process.env.TEST_FAULT === "occupied" && String(from).includes(".refresh-staging-")) {
    await mkdir(to, { recursive: true });
    await real_writeFile(path.join(to, "unrelated.txt"), "keep occupied destination");
    console.error("REACHED_OCCUPIED_DESTINATION");
    throw Object.assign(new Error("occupied destination"), { code: "EXDEV" });
  }
  const result = await real_rename(from, to);
  if (process.env.TEST_FAULT === "file-cleanup" && String(from).includes(".ci-watcher.md.refresh-file-")) globalThis.fixtureFilePublished = true;
  return result;
}
let removedOnce = false;
async function rm(target, options) {
  if (process.env.TEST_FAULT === "companion-rollback-clone-cleanup" && globalThis.fixtureCompanionRestoreFailed && path.basename(String(target)).startsWith("core-skill-upstream-")) {
    console.error("REACHED_GITHUB_CLONE_CLEANUP_FAILURE");
    throw Object.assign(new Error("GitHub clone cleanup failed"), { code: "EACCES" });
  }
  if ((process.env.TEST_FAULT === "file-cleanup" && globalThis.fixtureFilePublished && String(target).includes(".ci-watcher.md.refresh-file-")) || (process.env.TEST_FAULT === "partial-lock-cleanup" && globalThis.fixtureLockWriteFailed && String(target).includes(".skills-lock.json.refresh-file-"))) {
    console.error("REACHED_FILE_STAGING_CLEANUP_FAILURE");
    throw Object.assign(new Error("file staging cleanup failed"), { code: "EIO" });
  }
  if (process.env.TEST_FAULT === "rollback-cleanup" && globalThis.fixtureSwapFailed && String(target).includes(".refresh-staging-")) {
    console.error("REACHED_STAGING_CLEANUP_FAILURE");
    throw Object.assign(new Error("staging cleanup failed"), { code: "EIO" });
  }
  if (process.env.TEST_FAULT === "partial-backup" && !removedOnce && String(target).endsWith("/docs/ai/skills/supabase")) {
    removedOnce = true;
    await real_rm(path.join(target, "SKILL.md"), { force: true });
    console.error("REACHED_PARTIAL_CANONICAL_REMOVAL");
    throw Object.assign(new Error("partial canonical removal"), { code: "EIO" });
  }
  return real_rm(target, options);
}
async function writeFile(target, content, ...options) {
  if (["partial-companion", "companion-rollback", "companion-rollback-clone-cleanup"].includes(process.env.TEST_FAULT) && String(target).includes("thermo-nuclear-code-quality-review.md") && String(content).startsWith("new ")) {
    await real_writeFile(target, "partial companion");
    console.error("REACHED_PARTIAL_COMPANION_WRITE");
    throw Object.assign(new Error("partial companion write"), { code: "EIO" });
  }
  if (["companion-rollback", "companion-rollback-clone-cleanup"].includes(process.env.TEST_FAULT) && String(target).includes("ci-watcher.md") && !String(target).includes("refresh-backup") && String(content).startsWith("old ")) {
    console.error("REACHED_COMPANION_RESTORE_FAILURE");
    globalThis.fixtureCompanionRestoreFailed = true;
    throw Object.assign(new Error("companion restore failed"), { code: "EIO" });
  }
  if (["partial-lock", "partial-lock-cleanup"].includes(process.env.TEST_FAULT) && String(target).includes("skills-lock.json") && !String(target).includes("refresh-backup")) {
    await real_writeFile(target, String(content).slice(0, 16));
    console.error("REACHED_PARTIAL_LOCK_WRITE");
    globalThis.fixtureLockWriteFailed = true;
    throw Object.assign(new Error("partial lock write"), { code: "EIO" });
  }
  return real_writeFile(target, content, ...options);
}
`;
  if (["rollback", "rollback-cleanup"].includes(fault)) {
    const needle =
      "async function updateEmilCloneSkillLockHashes(preparedRefreshes) {\n";
    expect(source).toContain(needle);
    source = source.replace(
      needle,
      needle +
        '  console.error("REACHED_POST_SWAP_FAILURE");\n  globalThis.fixtureSwapFailed = true;\n  throw new Error("post-swap failure");\n',
    );
    const restore = "async function rollbackSwappedRefresh(swappedRefresh) {\n";
    expect(source).toContain(restore);
    source = source.replace(
      restore,
      restore +
        '  if (swappedRefresh.skillName === "supabase-postgres-best-practices") { console.error("REACHED_ONE_RESTORE_FAILURE"); throw new Error("restore failure"); }\n',
    );
  }
  if (fault === "companion-rollback-clone-cleanup") {
    const groupEntry = "async function refreshGithubGroup(group, lockfile) {\n";
    expect(source).toContain(groupEntry);
    source = source.replace(
      groupEntry,
      groupEntry +
        '  if (group.source !== "cursor/plugins") { console.error("REACHED_LATER_GITHUB_GROUP"); return 0; }\n',
    );
  }
  await writeFile(file, source);
}

function run(
  root: string,
  fault: string,
  group = "supabase/agent-skills",
  focused = true,
) {
  const result = spawnSync(
    process.execPath,
    [
      "scripts/refresh-upstream-skills.mjs",
      ...(focused ? [`--only=${group}`] : []),
    ],
    {
      cwd: root,
      encoding: "utf8",
      env: {
        ...process.env,
        HOME: root,
        TMPDIR: root,
        TEMP: root,
        TMP: root,
        TEST_FAULT: fault,
        ...(fault === "partial-backup"
          ? { CORE_SKILLS_SIMULATE_RENAME_EXDEV: "1" }
          : {}),
      },
      timeout: 20_000,
    },
  );
  return { status: result.status, output: result.stdout + result.stderr };
}

afterEach(async () => {
  for (const root of roots.splice(0))
    await rm(root, { recursive: true, force: true });
});

describe("skill refresh transaction", () => {
  it("restores the original skill after source removal fails during an EXDEV backup", async () => {
    const root = await createFixture();
    await injectFault(root, "partial-backup");
    const result = run(root, "partial-backup");
    expect(result.output).toContain("REACHED_PARTIAL_CANONICAL_REMOVAL");
    expect(result.status).not.toBe(0);
    await expect(
      readFile(path.join(root, "docs/ai/skills/supabase/SKILL.md"), "utf8"),
    ).resolves.toBe("# old supabase\n");
  });

  it("keeps an occupied destination and recoverable backup when an EXDEV move collides", async () => {
    const root = await createFixture();
    await injectFault(root, "occupied");
    const result = run(root, "occupied");
    expect(result.output).toContain("REACHED_OCCUPIED_DESTINATION");
    expect(result.status).not.toBe(0);
    await expect(
      readFile(
        path.join(root, "docs/ai/skills/supabase/unrelated.txt"),
        "utf8",
      ),
    ).resolves.toBe("keep occupied destination");
    const backups = (await readdir(path.join(root, "docs/ai/skills"))).filter(
      (name) => name.startsWith(".supabase.refresh-backup-"),
    );
    expect(backups).toHaveLength(1);
    await expect(
      readFile(
        path.join(root, "docs/ai/skills", backups[0], "SKILL.md"),
        "utf8",
      ),
    ).resolves.toBe("# old supabase\n");
    expect(result.output).toContain("rollback was incomplete");
  });

  it.each([true, false])(
    "continues all restores and fails when rollback is incomplete (focused=%s)",
    async (focused) => {
      const root = await createFixture();
      await injectFault(root, "rollback");
      const result = run(root, "rollback", "supabase/agent-skills", focused);
      expect(result.output).toContain("REACHED_POST_SWAP_FAILURE");
      expect(result.output).toContain("REACHED_ONE_RESTORE_FAILURE");
      expect(result.status).not.toBe(0);
      expect(result.output).not.toContain("upstream skill refresh complete");
      await expect(
        readFile(path.join(root, "docs/ai/skills/supabase/SKILL.md"), "utf8"),
      ).resolves.toBe("# old supabase\n");
    },
  );

  it("keeps the prior lockfile and all canonical skills after a partial lock write", async () => {
    const root = await createFixture(true);
    const lockPath = path.join(root, "skills-lock.json");
    const originalLock = await readFile(lockPath, "utf8");
    const originals = new Map(
      await Promise.all(
        emilSkills.map(
          async (name) =>
            [
              name,
              await readFile(
                path.join(root, "docs/ai/skills", name, "SKILL.md"),
                "utf8",
              ),
            ] as const,
        ),
      ),
    );
    await injectFault(root, "partial-lock");
    const result = run(root, "partial-lock", "emilkowalski/skills");
    expect(result.output).toContain("REACHED_PARTIAL_LOCK_WRITE");
    expect(result.status).not.toBe(0);
    await expect(readFile(lockPath, "utf8")).resolves.toBe(originalLock);
    for (const [name, original] of originals)
      await expect(
        readFile(path.join(root, "docs/ai/skills", name, "SKILL.md"), "utf8"),
      ).resolves.toBe(original);
  });

  it("successfully refreshes both skills without leaving transaction artifacts", async () => {
    const root = await createFixture();
    const result = run(root, "none");
    expect(result.status, result.output).toBe(0);
    for (const name of ["supabase", "supabase-postgres-best-practices"])
      await expect(
        readFile(path.join(root, "docs/ai/skills", name, "SKILL.md"), "utf8"),
      ).resolves.toBe(`# new ${name}\n`);
    expect(
      (await readdir(path.join(root, "docs/ai/skills"))).filter((name) =>
        name.startsWith("."),
      ),
    ).toEqual([]);
  });

  it.each(["partial-companion", "partial-lock"])(
    "restores GitHub skills, companions and lockfile after %s",
    async (fault) => {
      const root = await createGithubFixture();
      const lockPath = path.join(root, "skills-lock.json");
      const originalLock = await readFile(lockPath, "utf8");
      await injectFault(root, fault);
      const result = run(root, fault, "cursor/plugins");
      expect(result.output).toContain(
        fault === "partial-lock"
          ? "REACHED_PARTIAL_LOCK_WRITE"
          : "REACHED_PARTIAL_COMPANION_WRITE",
      );
      expect(result.status).not.toBe(0);
      await expect(readFile(lockPath, "utf8")).resolves.toBe(originalLock);
      await expect(
        readFile(
          path.join(root, "docs/ai/skills/weekly-review/SKILL.md"),
          "utf8",
        ),
      ).resolves.toBe("# Old weekly review\n");
      for (const name of [
        "ci-watcher.md",
        "thermo-nuclear-code-quality-review.md",
      ])
        await expect(
          readFile(path.join(root, ".cursor/agents", name), "utf8"),
        ).resolves.toBe(`old ${name}\n`);
    },
  );

  it("retains exact companion recovery data when the file rollback itself fails", async () => {
    const root = await createGithubFixture();
    await injectFault(root, "companion-rollback");
    const result = run(root, "companion-rollback", "cursor/plugins");
    expect(result.output).toContain("REACHED_PARTIAL_COMPANION_WRITE");
    expect(result.output).toContain("REACHED_COMPANION_RESTORE_FAILURE");
    expect(result.status).not.toBe(0);
    expect(result.output).toContain("rollback was incomplete");
    const folder = path.join(root, ".cursor/agents");
    const backups = (await readdir(folder)).filter((name) =>
      name.startsWith(".ci-watcher.md.refresh-backup-"),
    );
    expect(backups).toHaveLength(1);
    await expect(readFile(path.join(folder, backups[0]), "utf8")).resolves.toBe(
      "old ci-watcher.md\n",
    );
    await expect(
      readFile(
        path.join(root, "docs/ai/skills/weekly-review/SKILL.md"),
        "utf8",
      ),
    ).resolves.toBe("# Old weekly review\n");
  });

  it.each([true, false])(
    "preserves incomplete GitHub rollback when clone cleanup fails (focused=%s)",
    async (focused) => {
      const root = await createGithubFixture();
      const originalLock = await readFile(
        path.join(root, "skills-lock.json"),
        "utf8",
      );
      await injectFault(root, "companion-rollback-clone-cleanup");
      const result = run(
        root,
        "companion-rollback-clone-cleanup",
        "cursor/plugins",
        focused,
      );
      expect(result.output).toContain("REACHED_PARTIAL_COMPANION_WRITE");
      expect(result.output).toContain("REACHED_COMPANION_RESTORE_FAILURE");
      expect(result.output).toContain("REACHED_GITHUB_CLONE_CLEANUP_FAILURE");
      expect(result.status, result.output).not.toBe(0);
      expect(result.output).toContain("Skill refresh rollback failed");
      if (focused) expect(result.output).toContain("rollback was incomplete");
      expect(result.output).not.toContain("REACHED_LATER_GITHUB_GROUP");
      expect(result.output).not.toContain("without changing canonical skills");
      expect(result.output).not.toContain("upstream skill refresh complete");

      const folder = path.join(root, ".cursor/agents");
      for (const name of [
        "ci-watcher.md",
        "thermo-nuclear-code-quality-review.md",
      ]) {
        const backups = (await readdir(folder)).filter((entry) =>
          entry.startsWith(`.${name}.refresh-backup-`),
        );
        expect(backups, name).toHaveLength(1);
        expect(await readFile(path.join(folder, backups[0]!), "utf8")).toBe(
          `old ${name}\n`,
        );
      }
      // The failed rollback leaves this new companion live; its old bytes must
      // remain in the backup above rather than being falsely reported restored.
      expect(await readFile(path.join(folder, "ci-watcher.md"), "utf8")).toBe(
        "new ci-watcher.md\n",
      );
      expect(
        await readFile(
          path.join(folder, "thermo-nuclear-code-quality-review.md"),
          "utf8",
        ),
      ).toBe("old thermo-nuclear-code-quality-review.md\n");
      expect(
        await readFile(
          path.join(root, "docs/ai/skills/weekly-review/SKILL.md"),
          "utf8",
        ),
      ).toBe("# Old weekly review\n");
      expect(await readFile(path.join(root, "skills-lock.json"), "utf8")).toBe(
        originalLock,
      );
    },
  );

  it("does not let staging cleanup mask an incomplete rollback in a broad refresh", async () => {
    const root = await createFixture();
    await injectFault(root, "rollback-cleanup");
    const result = run(
      root,
      "rollback-cleanup",
      "supabase/agent-skills",
      false,
    );
    expect(result.output).toContain("REACHED_ONE_RESTORE_FAILURE");
    expect(result.output).toContain("REACHED_STAGING_CLEANUP_FAILURE");
    expect(result.status).not.toBe(0);
    expect(result.output).not.toContain("upstream skill refresh complete");
    expect(result.output).toContain("Skill refresh rollback failed");
  });

  it("finishes a consistent GitHub refresh when cleanup fails after a file rename", async () => {
    const root = await createGithubFixture();
    await injectFault(root, "file-cleanup");
    const result = run(root, "file-cleanup", "cursor/plugins");
    expect(result.output).toContain("REACHED_FILE_STAGING_CLEANUP_FAILURE");
    expect(result.status, result.output).toBe(0);
    await expect(
      readFile(
        path.join(root, "docs/ai/skills/weekly-review/SKILL.md"),
        "utf8",
      ),
    ).resolves.toContain("# New weekly review");
    for (const name of [
      "ci-watcher.md",
      "thermo-nuclear-code-quality-review.md",
    ])
      await expect(
        readFile(path.join(root, ".cursor/agents", name), "utf8"),
      ).resolves.toBe(`new ${name}\n`);
    const lock = JSON.parse(
      await readFile(path.join(root, "skills-lock.json"), "utf8"),
    );
    expect(lock.skills["weekly-review"].computedHash).not.toBe("old");
  });

  it("preserves the write error and old state when file cleanup also fails", async () => {
    const root = await createGithubFixture();
    const lockPath = path.join(root, "skills-lock.json");
    const oldLock = await readFile(lockPath, "utf8");
    await injectFault(root, "partial-lock-cleanup");
    const result = run(root, "partial-lock-cleanup", "cursor/plugins");
    expect(result.output).toContain("REACHED_PARTIAL_LOCK_WRITE");
    expect(result.output).toContain("REACHED_FILE_STAGING_CLEANUP_FAILURE");
    expect(result.status).not.toBe(0);
    expect(result.output.split("refresh-upstream-skills failed")[1]).toContain(
      "partial lock write",
    );
    await expect(readFile(lockPath, "utf8")).resolves.toBe(oldLock);
    await expect(
      readFile(
        path.join(root, "docs/ai/skills/weekly-review/SKILL.md"),
        "utf8",
      ),
    ).resolves.toBe("# Old weekly review\n");
    for (const name of [
      "ci-watcher.md",
      "thermo-nuclear-code-quality-review.md",
    ])
      await expect(
        readFile(path.join(root, ".cursor/agents", name), "utf8"),
      ).resolves.toBe(`old ${name}\n`);
  });
});
