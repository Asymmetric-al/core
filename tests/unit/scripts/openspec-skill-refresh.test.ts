import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const roots: string[] = [];
const names = [
  "openspec",
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
      name === "openspec"
        ? `---
name: openspec
description: Starting point for OpenSpec fixture
allowed-tools: Bash(openspec:*), Bash(other:*)
license: MIT
---

Upstream workflow prose without a title.

Keep the upstream workflow body.

- If the skill for the row is not installed, say so, then read \`references/without-skills.md\` and follow the section for that skill. Tell the user they can install it with \`openspec config profile\`, then \`openspec update\`.

**If this project does not use OpenSpec**

If you picked this skill yourself and \`openspec list --json\` reports \`"root": null\`, set OpenSpec aside and answer the request normally. If the user asked for OpenSpec, offer to set it up with \`openspec init\`.
`
        : `---
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

${name === "openspec-update-change" ? 'Revise existing artifacts. If an artifact is missing, identify it and show the next ready artifact from `openspec status --change "<name>" --json`.\n\n- If the request changes the change\'s _intent_ rather than refining it, ask for a distinct unused name and recommend `openspec new change "<new-change-name>"`.\n- Everything done and implemented -> suggest archiving with `openspec archive "<name>"`.\n' : ""}
${name === "openspec-apply-change" ? "- If `missingArtifacts` is non-empty: show the missing artifacts and the recovery step from the CLI’s `instruction` field. Keep the selected store on any follow-up command.\n" : ""}

\`\`\`markdown
# Example spec title
\`\`\`
`,
    );
    if (name === "openspec") {
      await mkdir(path.join(source, "references"), { recursive: true });
      await writeFile(
        path.join(source, "references", "answers.md"),
        `# Answers to common questions

Check help (\`openspec <command> --help\`).

## Where things live

- \`openspec/config.yaml\`: the project's schema, \`context\` lines every agent reads, and per-artifact \`rules\`.

## Checking things

- What is in progress: \`openspec list\`.

## Setting things up

- Set up a project, or add an agent to it: \`openspec init\`.
- Refresh the skills after upgrading OpenSpec: \`openspec update\`.

## Stores

Run \`openspec store --help\` and pass \`--store <id>\`.

## Something is wrong

- Run \`openspec doctor\` and read what it reports.
- To tell the maintainers, use \`openspec feedback "<message>"\`.
`,
      );
      await writeFile(
        path.join(source, "references", "where-things-stand.md"),
        `# Where things stand

- \`openspec list --json\` lists the changes in progress.
- If the user names a store, add \`--store <id>\` to each of these. \`openspec store list --json\` lists the stores.

Say where things stand in a sentence or two, name the next step and the skill that does it, and offer to do it. Do not start it until they say so.
`,
      );
      await writeFile(
        path.join(source, "references", "without-skills.md"),
        `# Doing a step without its skill

Use this when the skill for a step is not installed. The user can install the skill instead with \`openspec config profile\`, then \`openspec update\`.

## openspec-propose, openspec-new-change, openspec-continue-change, openspec-ff-change

1. Start the change: \`openspec new change "<name>"\`, using a short kebab-case name.
2. Run \`openspec status --change "<name>" --json\` to see which artifacts are ready.

## openspec-update-change

Run \`openspec validate "<name>"\`.

## openspec-archive-change, openspec-bulk-archive-change

Run \`openspec archive "<name>" --yes\`.

## openspec-onboard

Walk the user through one small change.
`,
      );
    }
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
      if (name === "openspec") {
        expect(content).toContain("resume or update it rather than recreating");
        expect(content).not.toContain(
          "install it with `openspec config profile`",
        );
        expect(content).not.toContain(
          "offer to set it up with `openspec init`",
        );
        for (const refName of [
          "answers.md",
          "where-things-stand.md",
          "without-skills.md",
        ]) {
          const refContent = await readFile(
            path.join(root, "docs/ai/skills/openspec/references", refName),
            "utf8",
          );
          expect(refContent, refName).toContain("bun run openspec --");
          expect(refContent, refName).not.toContain("--store");
          expect(refContent, refName).not.toContain("openspec store list");
        }
      } else {
        expect(content).toContain("Core checkout containing its local");
      }
      if (name === "openspec-update-change") {
        const description = content.match(/^description: (.+)$/m)?.[1];
        expect(description).not.toContain("run that command instead");
        expect(description).toContain("repository-safe");
        // 2.1 gives the recovery commands itself, so Core keeps them as is.
        expect(content).toContain('openspec status --change "<name>" --json');
        expect(content).toContain(
          'recommend `openspec new change "<new-change-name>"`',
        );
        // Core archives only merged, accepted work, through its workflow.
        expect(content).toContain(
          "merged and accepted -> suggest the `openspec-archive-change` workflow",
        );
        expect(content).not.toContain(
          "suggest archiving with `openspec archive",
        );
      }
      if (name === "openspec-apply-change") {
        expect(content).toContain(
          "show the missing artifacts and the recovery step from the CLI’s `instruction` field.",
        );
        expect(content).not.toContain("selected store");
      }
      expect(content).not.toMatch(/\/openspec-(?:continue|new)-change/);
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
