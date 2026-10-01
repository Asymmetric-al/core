import { spawnSync } from "node:child_process";
import {
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  readlink,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const repo = process.cwd();
const roots: string[] = [];
async function fixture(script: string) {
  await mkdir(path.join(repo, ".tmp"), { recursive: true });
  const root = await mkdtemp(path.join(repo, ".tmp", "skill-entry-safety-"));
  roots.push(root);
  await mkdir(path.join(root, "scripts"));
  await cp(
    path.join(repo, "scripts", script),
    path.join(root, "scripts", script),
  );
  await cp(path.join(repo, "scripts/lib"), path.join(root, "scripts/lib"), {
    recursive: true,
  });
  return root;
}
async function put(root: string, file: string, text: string) {
  const target = path.join(root, file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, text);
}
function run(root: string, script: string, args: string[] = []) {
  return spawnSync(process.execPath, [`scripts/${script}`, ...args], {
    cwd: root,
    encoding: "utf8",
  });
}
afterEach(async () => {
  for (const root of roots.splice(0))
    await rm(root, { recursive: true, force: true });
});

describe("skill publication entry safety", () => {
  it("fails an occupied ecosystem mirror swap without reporting success or continuing", async () => {
    const root = await fixture("sync-agent-skills.mjs");
    await put(root, "docs/ai/skills/sample/SKILL.md", "# Sample\n");
    await put(root, ".agents/skills/ecosystem/SKILL.md", "# New ecosystem\n");
    await put(
      root,
      ".cursor/skills/ecosystem/SKILL.md",
      "# Original ecosystem\n",
    );
    await put(
      root,
      ".cursor/skills/ecosystem/recovery.txt",
      "complete original companion\n",
    );
    const script = path.join(root, "scripts/sync-agent-skills.mjs");
    let source = await readFile(script, "utf8");
    expect(source).toContain("  rename,\n");
    source = source.replace("  rename,\n", "  rename as realRename,\n");
    source += `
async function rename(from,to) {
  if (String(from).includes(".staging-") && String(to).endsWith("/.cursor/skills/ecosystem")) {
    await mkdir(to); await writeFile(path.join(to,"concurrent.txt"),"competing entry");
    console.error("REACHED_ECOSYSTEM_COLLISION");
    throw Object.assign(new Error("fixture collision"),{code:"EXDEV"});
  }
  return realRename(from,to);
}
`;
    await writeFile(script, source);
    const result = run(root, "sync-agent-skills.mjs");
    expect(result.stderr).toContain("REACHED_ECOSYSTEM_COLLISION");
    expect(result.status).not.toBe(0);
    expect(result.stdout).not.toContain("agent skill sync complete");
    expect(result.stdout).not.toContain("mirrored ecosystem -> .claude");
    expect(result.stderr).not.toContain("source unreadable");
    expect(
      await readFile(
        path.join(root, ".cursor/skills/ecosystem/concurrent.txt"),
        "utf8",
      ),
    ).toBe("competing entry");
    const backup = (await readdir(path.join(root, ".cursor/skills"))).find(
      (name) => name.startsWith(".ecosystem.backup-"),
    );
    expect(backup).toBeDefined();
    expect(
      await readFile(
        path.join(root, ".cursor/skills", backup!, "SKILL.md"),
        "utf8",
      ),
    ).toBe("# Original ecosystem\n");
    expect(
      await readFile(
        path.join(root, ".cursor/skills", backup!, "recovery.txt"),
        "utf8",
      ),
    ).toBe("complete original companion\n");
  });

  it.each(["dangling", "live"])(
    "preserves a %s canonical symlink and earlier source-group originals",
    async (kind) => {
      const root = await fixture("refresh-upstream-skills.mjs");
      for (const name of ["supabase", "supabase-postgres-best-practices"]) {
        await put(root, `.agents/skills/${name}/SKILL.md`, `# New ${name}\n`);
      }
      await put(
        root,
        "docs/ai/skills/supabase/SKILL.md",
        "# Original first skill\n",
      );
      await put(
        root,
        "docs/ai/skills/supabase/keep.txt",
        "original companion\n",
      );
      const target = path.join(
        root,
        "docs/ai/skills/supabase-postgres-best-practices",
      );
      const linked = path.join(root, "unexpected-target");
      if (kind === "live")
        await put(
          root,
          "unexpected-target/keep.txt",
          "do not follow or edit\n",
        );
      await symlink(linked, target, "dir");
      const result = run(root, "refresh-upstream-skills.mjs", [
        "--only=supabase/agent-skills",
      ]);
      expect(result.status).not.toBe(0);
      expect((await lstat(target)).isSymbolicLink()).toBe(true);
      expect(await readlink(target)).toBe(linked);
      expect(
        await readFile(
          path.join(root, "docs/ai/skills/supabase/SKILL.md"),
          "utf8",
        ),
      ).toBe("# Original first skill\n");
      expect(
        await readFile(
          path.join(root, "docs/ai/skills/supabase/keep.txt"),
          "utf8",
        ),
      ).toBe("original companion\n");
      if (kind === "live")
        expect(await readFile(path.join(linked, "keep.txt"), "utf8")).toBe(
          "do not follow or edit\n",
        );
    },
  );

  it.each(["native", "EXDEV"])(
    "preserves a competing symlink created during %s publication",
    async (fault) => {
      const root = await fixture("refresh-upstream-skills.mjs");
      for (const name of ["supabase", "supabase-postgres-best-practices"]) {
        await put(root, `.agents/skills/${name}/SKILL.md`, `# New ${name}\n`);
        await put(
          root,
          `docs/ai/skills/${name}/SKILL.md`,
          `# Original ${name}\n`,
        );
      }
      const script = path.join(root, "scripts/refresh-upstream-skills.mjs");
      let source = await readFile(script, "utf8");
      expect(source).toContain("  rename,\n");
      source = source.replace(
        "  rename,\n",
        "  rename as realRename,\n  symlink,\n",
      );
      source += `
async function rename(from,to) {
  if (String(from).includes(".refresh-staging-") && String(to).endsWith("/supabase")) {
    await symlink("missing-competing-target",to,"dir");
    console.error("REACHED_COMPETING_SYMLINK");
    ${fault === "EXDEV" ? 'throw Object.assign(new Error("fixture cross-device"),{code:"EXDEV"});' : ""}
  }
  return realRename(from,to);
}
`;
      await writeFile(script, source);
      const result = run(root, "refresh-upstream-skills.mjs", [
        "--only=supabase/agent-skills",
      ]);
      expect(result.stderr).toContain("REACHED_COMPETING_SYMLINK");
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("rollback was incomplete");
      expect(result.stderr).not.toContain("without changing canonical skills");
      const destination = path.join(root, "docs/ai/skills/supabase");
      expect((await lstat(destination)).isSymbolicLink()).toBe(true);
      expect(await readlink(destination)).toBe("missing-competing-target");
      const backup = (await readdir(path.dirname(destination))).find((name) =>
        name.startsWith(".supabase.refresh-backup-"),
      );
      expect(backup).toBeDefined();
      expect(
        await readFile(
          path.join(path.dirname(destination), backup!, "SKILL.md"),
          "utf8",
        ),
      ).toBe("# Original supabase\n");
    },
  );
});
