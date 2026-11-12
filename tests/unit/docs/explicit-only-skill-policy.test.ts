import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const REPO_ROOT = fileURLToPath(new URL("../../../", import.meta.url));

/**
 * `disable-model-invocation: true` is read by Claude Code and Cursor. Codex
 * ignores that frontmatter key and allows implicit invocation unless
 * `agents/openai.yaml` sets `policy.allow_implicit_invocation: false`. A skill
 * that is explicit-only in one client must be explicit-only in all of them.
 */
const SKILL_ROOTS = ["docs/ai/skills", ".agents/skills"] as const;

function frontmatter(source: string): string {
  return /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)?.[1] ?? "";
}

// A quoted key or a trailing YAML comment still leaves the key active.
function isExplicitOnly(source: string): boolean {
  return /^(["']?)disable-model-invocation\1:\s*true(?:\s+#.*)?\s*$/m.test(
    frontmatter(source),
  );
}

// The refresh step keeps a trailing comment on the `policy:` line.
function hasNativeFalsePolicy(metadata: string): boolean {
  return /^policy:[ \t]*(?:#.*)?\r?\n(?:[ \t]+.*\r?\n)*?[ \t]+allow_implicit_invocation:\s*false\s*$/m.test(
    metadata,
  );
}

function explicitOnlySkills(root: string): string[] {
  const absoluteRoot = join(REPO_ROOT, root);
  return readdirSync(absoluteRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => {
      const entrypoint = join(absoluteRoot, name, "SKILL.md");
      return (
        existsSync(entrypoint) &&
        isExplicitOnly(readFileSync(entrypoint, "utf8"))
      );
    })
    .sort();
}

describe("explicit-only skill policy", () => {
  it.each(SKILL_ROOTS)(
    "gives every explicit-only skill in %s the native Codex policy",
    (root) => {
      const skills = explicitOnlySkills(root);
      // Guards against a vacuous pass if discovery ever stops finding skills.
      expect(skills.length).toBeGreaterThan(50);

      const missing = skills.filter((name) => {
        const metadataPath = join(REPO_ROOT, root, name, "agents/openai.yaml");
        return (
          !existsSync(metadataPath) ||
          !hasNativeFalsePolicy(readFileSync(metadataPath, "utf8"))
        );
      });

      expect(
        missing,
        `Add "policy:\\n  allow_implicit_invocation: false" to agents/openai.yaml ` +
          `for each listed skill under ${root}`,
      ).toEqual([]);
    },
  );

  // The catalog uses one spelling today. These pin the spellings the refresh
  // step also accepts, so the two cannot drift apart.
  it.each([
    "disable-model-invocation: true",
    "disable-model-invocation: true # explicit request only",
    '"disable-model-invocation": true',
    "'disable-model-invocation': true",
  ])("reads `%s` as explicit-only", (flag) => {
    expect(isExplicitOnly(`---\nname: fixture\n${flag}\n---\n`)).toBe(true);
  });

  it.each([
    "# disable-model-invocation: true",
    "disable-model-invocation: false",
  ])("does not read `%s` as explicit-only", (flag) => {
    expect(isExplicitOnly(`---\nname: fixture\n${flag}\n---\n`)).toBe(false);
  });

  it("accepts the native policy with a trailing comment on its mapping", () => {
    expect(
      hasNativeFalsePolicy(
        "policy: # reviewed\n  allow_implicit_invocation: false\n",
      ),
    ).toBe(true);
  });

  it.each([
    "policy:\n  allow_implicit_invocation: true\n",
    "interface:\n  display_name: Fixture\n",
  ])("rejects metadata without the false policy", (metadata) => {
    expect(hasNativeFalsePolicy(metadata)).toBe(false);
  });
});
