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
  assertRegularSkillEntrypoint,
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

  it("refuses a skill root that is itself a link", async () => {
    const real = await skillTree(explicitOnly);
    const linkedRoot = real + "-link";
    roots.push(linkedRoot);
    try {
      await symlink(real, linkedRoot, "dir");
    } catch (error) {
      // Windows without Developer Mode cannot create links; Linux CI can.
      if ((error as NodeJS.ErrnoException).code === "EPERM") return;
      throw error;
    }

    await expect(ensureExplicitOnlyNativePolicy(linkedRoot)).rejects.toThrow(
      /must be a real directory/i,
    );
    await expect(metadata(real)).rejects.toMatchObject({ code: "ENOENT" });
  });

  // A quoted or repeated key is still the policy to a YAML loader. Appending a
  // second block would leave it to the loader which one wins.
  it.each([
    ["a single-quoted key", "'policy':\n  allow_implicit_invocation: true\n"],
    ["a double-quoted key", '"policy":\n  allow_implicit_invocation: true\n'],
    [
      "two policy mappings",
      "policy:\n  allow_implicit_invocation: true\npolicy:\n  other: 1\n",
    ],
    [
      "a repeated policy child",
      "policy:\n  allow_implicit_invocation: true\n  'allow_implicit_invocation': true\n",
    ],
  ])("rejects metadata with %s", async (_label, upstream) => {
    const root = await skillTree(explicitOnly, upstream);

    await expect(ensureExplicitOnlyNativePolicy(root)).rejects.toThrow(
      /review it by hand/i,
    );
    expect(await metadata(root)).toBe(upstream);
  });

  // Only a single-line Boolean scalar is rewritten in place. Any other value
  // shape leaves text behind that a YAML loader would join to the new value.
  it.each([
    [
      "a value on a continuation line",
      "policy:\n  allow_implicit_invocation:\n    true\n",
    ],
    [
      "a plain scalar that continues on the next line",
      "policy:\n  allow_implicit_invocation: true\n    still\n",
    ],
    ["a tagged value", "policy:\n  allow_implicit_invocation: !!bool true\n"],
    ["an anchored value", "policy:\n  allow_implicit_invocation: &open true\n"],
    [
      "a block scalar value",
      "policy:\n  allow_implicit_invocation: |\n    true\n",
    ],
    [
      "a compact sequence under the policy key",
      "policy:\n- allow_implicit_invocation: true\n",
    ],
    [
      "an indented sequence under the policy key",
      "policy:\n  - allow_implicit_invocation: true\n",
    ],
    // Appending after a document end marker writes outside the document.
    ["a document end marker", "interface:\n  display_name: Fixture\n...\n"],
    [
      "a second document",
      "interface:\n  display_name: Fixture\n---\nother: 1\n",
    ],
  ])("refuses a policy edit on metadata with %s", async (_label, upstream) => {
    const root = await skillTree(explicitOnly, upstream);

    await expect(ensureExplicitOnlyNativePolicy(root)).rejects.toThrow(
      /review it by hand/i,
    );
    expect(await metadata(root)).toBe(upstream);
  });

  it("appends the policy to metadata that opens with a document start marker", async () => {
    const root = await skillTree(
      explicitOnly,
      "---\ninterface:\n  display_name: Fixture\n",
    );

    await ensureExplicitOnlyNativePolicy(root);

    expect(await metadata(root)).toBe(
      "---\ninterface:\n  display_name: Fixture\n\n" + NATIVE_EXPLICIT_POLICY,
    );
  });

  // The final frontmatter decides. Upstream metadata that keeps Codex
  // explicit-only for a model-invocable skill would split the clients.
  it.each([
    ["no flag", "name: fixture\ndescription: Fixture."],
    [
      "a false flag",
      "name: fixture\ndescription: Fixture.\ndisable-model-invocation: false",
    ],
  ])(
    "refuses a stale false policy on a model-invocable skill with %s",
    async (_label, frontmatter) => {
      const upstream =
        "interface:\n  display_name: Fixture\npolicy:\n  allow_implicit_invocation: false\n";
      const root = await skillTree(frontmatter, upstream);

      await expect(ensureExplicitOnlyNativePolicy(root)).rejects.toThrow(
        /review it by hand/i,
      );
      expect(await metadata(root)).toBe(upstream);
    },
  );

  it("leaves other policy metadata on a model-invocable skill untouched", async () => {
    const upstream =
      "interface:\n  display_name: Fixture\npolicy:\n  allow_implicit_invocation: true\n";
    const root = await skillTree(
      "name: fixture\ndescription: Fixture.",
      upstream,
    );

    expect(await ensureExplicitOnlyNativePolicy(root)).toBe(false);
    expect(await metadata(root)).toBe(upstream);
  });

  it("rewrites a quoted policy child instead of adding a second key", async () => {
    const root = await skillTree(
      explicitOnly,
      'policy: # reviewed\n  "allow_implicit_invocation": true\n',
    );

    await ensureExplicitOnlyNativePolicy(root);

    expect(await metadata(root)).toBe(
      "policy: # reviewed\n  allow_implicit_invocation: false\n",
    );
  });

  it.each([
    '"disable-model-invocation": true',
    "'disable-model-invocation': true",
  ])("treats the quoted frontmatter flag %s as explicit-only", async (flag) => {
    const root = await skillTree(
      "name: fixture\ndescription: Fixture.\n" + flag,
    );

    expect(await ensureExplicitOnlyNativePolicy(root)).toBe(true);
    expect(await metadata(root)).toBe(NATIVE_EXPLICIT_POLICY);
  });

  // Core's pipeline writes exactly `true`. Another spelling may still mean
  // explicit-only to a YAML loader, so the refresh stops instead of guessing.
  it.each([
    ["an unrecognized value", "disable-model-invocation: yes"],
    [
      "a repeated flag",
      'disable-model-invocation: false\n"disable-model-invocation": true',
    ],
  ])("refuses a frontmatter flag with %s", async (_label, flag) => {
    const root = await skillTree(
      "name: fixture\ndescription: Fixture.\n" + flag,
    );

    await expect(ensureExplicitOnlyNativePolicy(root)).rejects.toThrow(
      /review it by hand/i,
    );
    await expect(metadata(root)).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("leaves a skill whose flag is false model-invocable", async () => {
    const root = await skillTree(
      "name: fixture\ndescription: Fixture.\ndisable-model-invocation: false",
    );

    expect(await ensureExplicitOnlyNativePolicy(root)).toBe(false);
    await expect(metadata(root)).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("treats a trailing comment on the frontmatter flag as explicit-only", async () => {
    const root = await skillTree(
      "name: fixture\ndescription: Fixture.\ndisable-model-invocation: true # explicit request only",
    );

    expect(await ensureExplicitOnlyNativePolicy(root)).toBe(true);
    expect(await metadata(root)).toBe(NATIVE_EXPLICIT_POLICY);
  });

  it("does not treat a commented-out frontmatter flag as explicit-only", async () => {
    const root = await skillTree(
      "name: fixture\ndescription: Fixture.\n# disable-model-invocation: true",
    );

    expect(await ensureExplicitOnlyNativePolicy(root)).toBe(false);
    await expect(metadata(root)).rejects.toMatchObject({ code: "ENOENT" });
  });

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

// `cp` keeps a linked SKILL.md as a link. Formatting, the Core overlay and the
// reviewed replacements all read and write SKILL.md, so the GitHub refresh
// path has to reject a linked entrypoint before any of them run.
describe("staged skill entrypoint", () => {
  it("accepts a regular SKILL.md", async () => {
    const root = await skillTree("name: fixture\ndescription: Fixture.");

    await expect(assertRegularSkillEntrypoint(root)).resolves.toBeUndefined();
  });

  it("rejects a missing SKILL.md", async () => {
    const root = await skillTree("name: fixture\ndescription: Fixture.");
    await rm(path.join(root, "SKILL.md"));

    await expect(assertRegularSkillEntrypoint(root)).rejects.toThrow(
      /must be a regular file/i,
    );
  });

  it("rejects a linked SKILL.md without touching its target", async () => {
    const root = await skillTree("name: fixture\ndescription: Fixture.");
    const outside = await mkdtemp(
      path.join(repo, ".tmp/explicit-policy-outside-"),
    );
    roots.push(outside);
    const outsideFile = path.join(outside, "SKILL.md");
    await writeFile(outsideFile, "owner: someone-else\n");
    await rm(path.join(root, "SKILL.md"));
    try {
      await symlink(outsideFile, path.join(root, "SKILL.md"), "file");
    } catch (error) {
      // Windows without Developer Mode cannot create links; Linux CI can.
      if ((error as NodeJS.ErrnoException).code === "EPERM") return;
      throw error;
    }

    await expect(assertRegularSkillEntrypoint(root)).rejects.toThrow(
      /must be a regular file/i,
    );
    expect(await readFile(outsideFile, "utf8")).toBe("owner: someone-else\n");
  });

  it("checks the GitHub staging copy before any transform touches it", async () => {
    const source = await readFile(
      path.join(repo, "scripts/refresh-upstream-skills.mjs"),
      "utf8",
    );
    const start = source.indexOf("async function prepareGithubSkillRefresh(");
    expect(start).toBeGreaterThanOrEqual(0);
    const body = source.slice(start, source.indexOf("\n}\n", start));
    const at = (needle: string) => {
      const index = body.indexOf(needle);
      expect(index, needle).toBeGreaterThanOrEqual(0);
      return index;
    };

    const copy = at("await cp(upstreamSkillDir, staging");
    const check = at("await assertRegularSkillEntrypoint(staging)");
    expect(check).toBeGreaterThan(copy);
    for (const transform of [
      "await copySkillExtraFiles(",
      "await formatSkillTarget(staging)",
      "await restoreCoreOverlay(staging",
      "await applyPostRefreshReplacements(skillName, staging)",
    ])
      expect(check, transform).toBeLessThan(at(transform));
  });
});
