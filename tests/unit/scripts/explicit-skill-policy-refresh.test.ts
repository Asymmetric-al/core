import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  applyManagedSkillCompatibility,
  ensureExplicitOnlyNativePolicy,
} from "../../../scripts/lib/managed-skill-compatibility.mjs";

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

async function skillTree(frontmatter: string, openaiYaml?: string) {
  await mkdir(path.join(repo, ".tmp"), { recursive: true });
  const root = await mkdtemp(path.join(repo, ".tmp/explicit-policy-test-"));
  roots.push(root);
  await writeFile(
    path.join(root, "SKILL.md"),
    `---
${frontmatter}
---

# Fixture
`,
  );
  if (openaiYaml !== undefined) {
    await mkdir(path.join(root, "agents"), { recursive: true });
    await writeFile(path.join(root, "agents/openai.yaml"), openaiYaml);
  }
  return root;
}

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

// Both refresh paths call this once the final SKILL.md is settled, including
// the GitHub clone path that never runs the managed adapter.
describe("native policy derived from the final frontmatter", () => {
  const explicitOnly =
    "name: fixture\ndescription: Fixture.\ndisable-model-invocation: true";

  it("creates the policy for an explicit-only skill without metadata", async () => {
    const root = await skillTree(explicitOnly);

    expect(await ensureExplicitOnlyNativePolicy(root)).toBe(true);
    expect(await metadata(root)).toBe(NATIVE_EXPLICIT_POLICY);
  });

  it("leaves a model-invocable skill without native policy", async () => {
    const root = await skillTree("name: fixture\ndescription: Fixture.");

    expect(await ensureExplicitOnlyNativePolicy(root)).toBe(false);
    await expect(metadata(root)).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("turns an active true policy off and keeps its indentation", async () => {
    const root = await skillTree(
      explicitOnly,
      'interface:\n  display_name: "Fixture"\npolicy:\n    allow_implicit_invocation: true\n',
    );

    await ensureExplicitOnlyNativePolicy(root);

    expect(await metadata(root)).toBe(
      'interface:\n  display_name: "Fixture"\npolicy:\n    allow_implicit_invocation: false\n',
    );
  });

  it("does not mistake a commented-out key for an active policy", async () => {
    const root = await skillTree(
      explicitOnly,
      'interface:\n  display_name: "Fixture"\n# allow_implicit_invocation: false\n',
    );

    await ensureExplicitOnlyNativePolicy(root);

    expect(await metadata(root)).toBe(
      'interface:\n  display_name: "Fixture"\n# allow_implicit_invocation: false\n\n' +
        NATIVE_EXPLICIT_POLICY,
    );
  });

  it("ignores the key text inside another field's block scalar", async () => {
    const upstream =
      "interface:\n  short_description: |\n    allow_implicit_invocation: true\n";
    const root = await skillTree(explicitOnly, upstream);

    await ensureExplicitOnlyNativePolicy(root);

    expect(await metadata(root)).toBe(upstream + "\n" + NATIVE_EXPLICIT_POLICY);
  });

  it("adds the key to an existing policy mapping with that mapping's indentation", async () => {
    const root = await skillTree(
      explicitOnly,
      "policy:\n    other_setting: true\ninterface:\n  display_name: Fixture\n",
    );

    await ensureExplicitOnlyNativePolicy(root);

    expect(await metadata(root)).toBe(
      "policy:\n    allow_implicit_invocation: false\n    other_setting: true\ninterface:\n  display_name: Fixture\n",
    );
  });

  it("rejects an inline policy mapping instead of writing a second policy key", async () => {
    const upstream = "policy: { allow_implicit_invocation: true }\n";
    const root = await skillTree(explicitOnly, upstream);

    await expect(ensureExplicitOnlyNativePolicy(root)).rejects.toThrow(
      /inline policy/i,
    );
    expect(await metadata(root)).toBe(upstream);
  });

  // A refreshed tree is upstream content. The GitHub refresh path copies
  // links as links, so the policy write must never follow one out of the tree.
  it.each(["agents/openai.yaml", "agents"])(
    "refuses to write through a symlinked %s",
    async (linked) => {
      const root = await skillTree(explicitOnly);
      const outside = await mkdtemp(
        path.join(repo, ".tmp/explicit-policy-outside-"),
      );
      roots.push(outside);
      const outsideFile = path.join(outside, "openai.yaml");
      await writeFile(outsideFile, "owner: someone-else\n");
      const isDirectoryLink = linked === "agents";
      if (!isDirectoryLink) await mkdir(path.join(root, "agents"));
      try {
        await symlink(
          isDirectoryLink ? outside : outsideFile,
          path.join(root, linked),
          isDirectoryLink ? "dir" : "file",
        );
      } catch (error) {
        // Windows without Developer Mode cannot create links; Linux CI can.
        if ((error as NodeJS.ErrnoException).code === "EPERM") return;
        throw error;
      }

      await expect(ensureExplicitOnlyNativePolicy(root)).rejects.toThrow(
        /must be a regular/i,
      );
      expect(await readFile(outsideFile, "utf8")).toBe("owner: someone-else\n");
    },
  );

  it("is idempotent and reports a tree without an entrypoint", async () => {
    const root = await skillTree(explicitOnly);
    await ensureExplicitOnlyNativePolicy(root);
    const first = await metadata(root);
    await ensureExplicitOnlyNativePolicy(root);
    expect(await metadata(root)).toBe(first);

    await rm(path.join(root, "SKILL.md"));
    expect(await ensureExplicitOnlyNativePolicy(root)).toBe(false);
  });
});
