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

const IS_BLANK_OR_COMMENT = /^[ \t]*(?:#.*)?$/;

/**
 * Whether `policy.allow_implicit_invocation` is `false` as a direct child of
 * the top-level `policy:` mapping. The refresh step keeps a trailing comment on
 * the `policy:` line. A key nested deeper does not set the policy, and a deeper
 * line after the value continues it into a string.
 */
function hasNativeFalsePolicy(metadata: string): boolean {
  const lines = metadata.split(/\r?\n/);
  const start = lines.findIndex((line) => /^policy:[ \t]*(?:#.*)?$/.test(line));
  if (start < 0) return false;
  const children: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (/^[^\s#]/.test(line)) break;
    if (!IS_BLANK_OR_COMMENT.test(line)) children.push(line);
  }
  const indentOf = (line: string) => /^[ \t]*/.exec(line)![0].length;
  const indent = children.length > 0 ? indentOf(children[0]) : 0;
  return children.some(
    (line, index) =>
      indentOf(line) === indent &&
      /^[ \t]+allow_implicit_invocation:[ \t]*false[ \t]*$/.test(line) &&
      (index + 1 === children.length ||
        indentOf(children[index + 1]) <= indent),
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

  it("accepts the native policy after another direct child", () => {
    expect(
      hasNativeFalsePolicy(
        "policy:\n  other_setting: true\n\n  allow_implicit_invocation: false\n",
      ),
    ).toBe(true);
  });

  it.each([
    "policy:\n  allow_implicit_invocation: true\n",
    "interface:\n  display_name: Fixture\n",
    // Nested one level deeper, the key does not set the policy itself.
    "policy:\n  nested:\n    allow_implicit_invocation: false\n",
    // A continuation line turns the value into the string "false true".
    "policy:\n  allow_implicit_invocation: false\n    true\n",
  ])("rejects metadata without the false policy", (metadata) => {
    expect(hasNativeFalsePolicy(metadata)).toBe(false);
  });
});
