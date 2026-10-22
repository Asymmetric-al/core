import { spawnSync } from "node:child_process";
import {
  chmod,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const roots: string[] = [];
const isolatedEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")),
);
async function fixture() {
  await mkdir(path.join(repoRoot, ".tmp"), { recursive: true });
  const root = await mkdtemp(path.join(repoRoot, ".tmp/skill-file-modes-"));
  roots.push(root);
  await mkdir(path.join(root, "scripts"));
  for (const script of ["sync-agent-skills.mjs", "verify-skills-sync.mjs"]) {
    await cp(
      path.join(repoRoot, "scripts", script),
      path.join(root, "scripts", script),
    );
  }
  await cp(path.join(repoRoot, "scripts/lib"), path.join(root, "scripts/lib"), {
    recursive: true,
  });
  const canonical = path.join(root, "docs/ai/skills/impeccable");
  await mkdir(path.join(canonical, "scripts"), { recursive: true });
  await writeFile(
    path.join(canonical, "SKILL.md"),
    "---\nname: impeccable\ndescription: Fixture\n---\n",
  );
  const launcher = path.join(canonical, "scripts/impeccable");
  await writeFile(
    launcher,
    "#!/bin/sh\nprintf imported > IMPORTED_CODE_EXECUTED\n",
  );
  await chmod(launcher, 0o755);
  // Shebangs do not grant execution permission to unrelated imported assets.
  await writeFile(
    path.join(canonical, "scripts/ordinary.sh"),
    "#!/bin/sh\nexit 0\n",
  );
  await chmod(path.join(canonical, "scripts/ordinary.sh"), 0o644);
  return { root, canonical, launcher };
}
function run(
  root: string,
  script: string,
  environment: Record<string, string> = {},
  restrictedUmask = false,
) {
  return spawnSync(
    process.execPath,
    restrictedUmask
      ? [
          "--input-type=module",
          "--eval",
          'process.umask(0o077); await import("./scripts/' + script + '");',
        ]
      : ["scripts/" + script],
    {
      cwd: root,
      encoding: "utf8",
      env: { ...isolatedEnvironment, ...environment },
    },
  );
}
afterEach(async () => {
  for (const root of roots.splice(0))
    await rm(root, { recursive: true, force: true });
});

describe.skipIf(process.platform === "win32")(
  "POSIX skill support-file modes",
  () => {
    it.each([0o644, 0o001])(
      "rejects a reviewed launcher without owner execution before changing any mirror (mode=%s)",
      async (mode) => {
        const { root, launcher } = await fixture();
        await chmod(launcher, mode);
        const sentinel = path.join(root, ".agents/skills/impeccable/SKILL.md");
        await mkdir(path.dirname(sentinel), { recursive: true });
        await writeFile(sentinel, "Keep existing runtime bytes.\n");
        const result = run(root, "sync-agent-skills.mjs");
        expect(result.status).not.toBe(0);
        expect(result.stderr).toContain(
          "Reviewed support file must remain executable",
        );
        expect(await readFile(sentinel, "utf8")).toBe(
          "Keep existing runtime bytes.\n",
        );
        expect((await stat(launcher)).mode & 0o777).toBe(mode);
      },
    );
    it.each([false, true])(
      "preserves executable and ordinary source modes through publication with restricted umask (EXDEV=%s)",
      async (exdev) => {
        const { root, launcher } = await fixture();
        const result = run(
          root,
          "sync-agent-skills.mjs",
          exdev ? { CORE_SKILLS_SIMULATE_RENAME_EXDEV: "1" } : {},
          true,
        );
        expect(result.status, result.stdout + result.stderr).toBe(0);
        for (const runtime of [".agents", ".cursor", ".claude"]) {
          const scripts = path.join(root, runtime, "skills/impeccable/scripts");
          expect(
            (await stat(path.join(scripts, "impeccable"))).mode & 0o777,
          ).toBe((await stat(launcher)).mode & 0o777);
          expect(
            (await stat(path.join(scripts, "ordinary.sh"))).mode & 0o777,
          ).toBe(0o644);
        }
        await expect(
          readFile(path.join(root, "IMPORTED_CODE_EXECUTED")),
        ).rejects.toMatchObject({ code: "ENOENT" });
      },
    );
    it.each([0o644, 0o754])(
      "reports the full executable-mask drift without repairing the live tree (mode=%s)",
      async (mode) => {
        const { root, launcher } = await fixture();
        const initialized = spawnSync(
          "git",
          [
            "-c",
            "core.hooksPath=" + path.join(root, "disabled-hooks"),
            "init",
            "-b",
            "main",
          ],
          { cwd: root, encoding: "utf8", env: isolatedEnvironment },
        );
        expect(initialized.status, initialized.stderr).toBe(0);
        const synced = run(root, "sync-agent-skills.mjs");
        expect(synced.status, synced.stdout + synced.stderr).toBe(0);
        const mirror = path.join(
          root,
          ".cursor/skills/impeccable/scripts/impeccable",
        );
        const content = await readFile(mirror);
        await chmod(mirror, mode);
        const result = run(root, "verify-skills-sync.mjs");
        expect(result.status).not.toBe(0);
        expect(result.stderr).toContain(
          ".cursor/skills/impeccable/scripts/impeccable (executable mode changed)",
        );
        expect(await readFile(mirror)).toEqual(content);
        expect((await stat(mirror)).mode & 0o777).toBe(mode);
        expect((await stat(launcher)).mode & 0o777).toBe(0o755);
      },
    );
  },
);
