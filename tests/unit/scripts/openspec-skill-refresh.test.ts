import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const roots: string[] = [];
const names = [
  "openspec-explore",
  "openspec-propose",
  "openspec-update-change",
  "openspec-apply-change",
  "openspec-verify-change",
  "openspec-sync-specs",
  "openspec-archive-change",
];

function git(cwd: string, args: string[]) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    env: Object.fromEntries(
      Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")),
    ),
  });
  expect(result.status, result.stderr).toBe(0);
}

async function fixture() {
  const temporaryRoot = path.join(repoRoot, ".tmp");
  await mkdir(temporaryRoot, { recursive: true });
  const root = await mkdtemp(path.join(temporaryRoot, "openspec-refresh-"));
  roots.push(root);
  const upstream = path.join(root, "upstream");
  await mkdir(path.join(root, "scripts"), { recursive: true });
  await cp(
    path.join(repoRoot, "scripts/refresh-upstream-skills.mjs"),
    path.join(root, "scripts/refresh-upstream-skills.mjs"),
  );
  await cp(path.join(repoRoot, "scripts/lib"), path.join(root, "scripts/lib"), {
    recursive: true,
  });
  const manifest = JSON.parse(
    await readFile(path.join(repoRoot, "package.json"), "utf8"),
  );
  const version = manifest.devDependencies["@fission-ai/openspec"];
  const entries: Record<string, object> = {};
  for (const name of names) {
    const source = path.join(upstream, "skills", name);
    const canonical = path.join(root, "docs/ai/skills", name);
    await mkdir(source, { recursive: true });
    await mkdir(canonical, { recursive: true });
    await writeFile(
      path.join(source, "SKILL.md"),
      `---
name: ${name}
description: ${name === "openspec-update-change" ? "Update planning artifacts. If the user means the openspec update CLI command, which refreshes generated files, run that command instead. Never edits code." : "Refresh permission regression fixture"}
allowed-tools: Bash(openspec:*), Bash(other:*)
license: MIT
---

Upstream workflow prose without a title.

Keep the upstream workflow body.

**Store selection:** Discover a named store with \`openspec store list --json\` and keep \`--store <id>\` on commands.

**Project check:** Run \`openspec list --json\` with the selected store before writing. If no root exists, offer \`openspec init\` or an external store.

In both branches, never create the root as a side effect: do not run \`openspec init\` until the user asks for it, do not hand-create \`openspec/\` files, and do not let a command create it.

**Input**: A change name.

\`\`\`markdown
# Example spec title
\`\`\`
`,
    );
    await writeFile(
      path.join(canonical, "SKILL.md"),
      `---
name: ${name}
allowed-tools: Bash(openspec:*), Bash(bun:*)
---

# Core workflow

<!-- CORE-OVERLAY-START -->

Use the repository's bun run openspec wrapper.

<!-- CORE-OVERLAY-END -->
`,
    );
    entries[name] = { source: "Fission-AI/OpenSpec", computedHash: "old" };
  }
  await writeFile(path.join(upstream, "LICENSE"), "MIT fixture license\n");
  git(upstream, ["init", "-b", "main"]);
  git(upstream, ["add", "."]);
  git(upstream, [
    "-c",
    "user.name=Fixture",
    "-c",
    "user.email=fixture@example.invalid",
    "-c",
    "commit.gpgsign=false",
    "commit",
    "-m",
    "Synthetic upstream fixture",
  ]);
  git(upstream, ["tag", `v${version}`]);
  const scriptPath = path.join(root, "scripts/refresh-upstream-skills.mjs");
  const script = await readFile(scriptPath, "utf8");
  const sourceRepo = 'repo: "https://github.com/Fission-AI/OpenSpec.git"';
  expect(script).toContain(sourceRepo);
  await writeFile(
    scriptPath,
    script.replace(sourceRepo, `repo: ${JSON.stringify(upstream)}`),
  );
  await writeFile(
    path.join(root, "skills-lock.json"),
    JSON.stringify({ version: 1, skills: entries }),
  );
  return root;
}

function refresh(root: string) {
  const result = spawnSync(
    process.execPath,
    ["scripts/refresh-upstream-skills.mjs", "--only=Fission-AI/OpenSpec"],
    {
      cwd: root,
      encoding: "utf8",
      timeout: 30_000,
      env: Object.fromEntries(
        Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")),
      ),
    },
  );
  expect(result.status, result.stdout + result.stderr).toBe(0);
}

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("OpenSpec skill refresh", () => {
  it("retains Core wrapper permission, upstream permissions, overlays and final-byte hashes on repeated refresh", async () => {
    const root = await fixture();
    refresh(root);
    const first: string[] = [];
    const lock = JSON.parse(
      await readFile(path.join(root, "skills-lock.json"), "utf8"),
    );
    for (const name of names) {
      const content = await readFile(
        path.join(root, "docs/ai/skills", name, "SKILL.md"),
        "utf8",
      );
      first.push(content);
      const allowed = content.match(/^allowed-tools:\s*(.+)$/m)?.[1];
      expect(allowed).toContain("Bash(bun:*)");
      expect(allowed).toContain("Bash(openspec:*)");
      expect(allowed).toContain("Bash(other:*)");
      expect(content).toContain(
        "Use the repository's bun run openspec wrapper.",
      );
      expect(content).toContain("Keep the upstream workflow body.");
      expect(content).not.toContain("--store");
      expect(content).not.toContain("openspec store list");
      expect(content).toContain("local Core");
      if (name === "openspec-update-change") {
        const description = content.match(/^description: (.+)$/m)?.[1];
        expect(description).not.toContain("run that command instead");
        expect(description).toContain("repository-safe");
      }
      const endOfFrontmatter = content.indexOf("\n---\n", 4) + 5;
      expect(content.indexOf("<!-- CORE-OVERLAY-START -->")).toBeLessThan(
        content.indexOf("Upstream workflow prose"),
      );
      expect(
        content
          .slice(endOfFrontmatter)
          .trimStart()
          .startsWith("<!-- CORE-OVERLAY-START -->"),
      ).toBe(true);
      expect(lock.skills[name].computedHash).toBe(
        createHash("sha256").update(content).digest("hex"),
      );
    }
    refresh(root);
    const second = await Promise.all(
      names.map((name) =>
        readFile(path.join(root, "docs/ai/skills", name, "SKILL.md"), "utf8"),
      ),
    );
    expect(second).toEqual(first);
  }, 90_000);
});
