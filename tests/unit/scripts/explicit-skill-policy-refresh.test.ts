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

import { applyManagedSkillCompatibility } from "../../../scripts/lib/managed-skill-compatibility.mjs";

const repo = process.cwd();
const fixtureRoot = path.join(repo, "tests/fixtures/managed-skill-refresh");
const NATIVE_EXPLICIT_POLICY = "policy:\n  allow_implicit_invocation: false\n";
const roots: string[] = [];

async function rawTree(name: string, target: string, relative = "") {
  await mkdir(path.join(target, relative), { recursive: true });
  for (const entry of await readdir(path.join(fixtureRoot, name, relative), {
    withFileTypes: true,
  })) {
    if (entry.isDirectory()) {
      await rawTree(name, target, path.join(relative, entry.name));
      continue;
    }
    await cp(
      path.join(fixtureRoot, name, relative, entry.name),
      path.join(target, relative, entry.name.replace(/\.raw$/u, "")),
    );
  }
}

async function restoredSkill(name: string) {
  await mkdir(path.join(repo, ".tmp"), { recursive: true });
  const root = await mkdtemp(path.join(repo, ".tmp/explicit-policy-test-"));
  roots.push(root);
  await rawTree(name, root);
  return root;
}

const metadata = (root: string) =>
  readFile(path.join(root, "agents/openai.yaml"), "utf8");

afterEach(async () => {
  for (const root of roots.splice(0))
    await rm(root, { recursive: true, force: true });
});

// A refresh replaces the canonical tree with upstream content. Core's
// frontmatter makes these skills explicit-only for Claude Code and Cursor;
// Codex needs the same decision in `agents/openai.yaml`, which upstream does
// not ship. The adapter has to restore it, or a refresh silently reopens
// implicit invocation in one client.
describe("explicit-only policy after an upstream refresh", () => {
  it("creates native Codex metadata when upstream ships none", async () => {
    const root = await restoredSkill("animate");

    await applyManagedSkillCompatibility("animate", root);

    expect(await readFile(path.join(root, "SKILL.md"), "utf8")).toContain(
      "disable-model-invocation: true",
    );
    expect(await metadata(root)).toBe(NATIVE_EXPLICIT_POLICY);
  });

  it("adds the policy to upstream metadata without dropping its interface", async () => {
    const root = await restoredSkill("better-ui");
    await mkdir(path.join(root, "agents"), { recursive: true });
    await writeFile(
      path.join(root, "agents/openai.yaml"),
      'interface:\n  display_name: "Better UI"\n  short_description: "Design engineering details for polished interfaces"\n',
    );

    await applyManagedSkillCompatibility("better-ui", root);

    expect(await metadata(root)).toBe(
      await readFile(
        path.join(repo, "docs/ai/skills/better-ui/agents/openai.yaml"),
        "utf8",
      ).then((text) => text.replaceAll("\r\n", "\n")),
    );
  });

  it("produces the committed canonical metadata and is idempotent", async () => {
    const root = await restoredSkill("animate");

    await applyManagedSkillCompatibility("animate", root);
    const first = await metadata(root);
    await applyManagedSkillCompatibility("animate", root);

    expect(await metadata(root)).toBe(first);
    expect(first).toBe(
      await readFile(
        path.join(repo, "docs/ai/skills/animate/agents/openai.yaml"),
        "utf8",
      ).then((text) => text.replaceAll("\r\n", "\n")),
    );
  });

  it("does not add native policy to a model-invocable managed skill", async () => {
    const root = await restoredSkill("tdd");

    await applyManagedSkillCompatibility("tdd", root);

    expect(await readFile(path.join(root, "SKILL.md"), "utf8")).not.toContain(
      "disable-model-invocation: true",
    );
    await expect(metadata(root)).rejects.toMatchObject({ code: "ENOENT" });
  });
});
