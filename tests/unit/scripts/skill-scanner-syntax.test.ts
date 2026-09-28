import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const repo = process.cwd();
const roots: string[] = [];
const token = ["pass", "word"].join("");
const pragma = "pragma: allowlist secret";
const source = [
  "---",
  "name: fixture",
  `description: ${token} reset reference // ${pragma}`,
  "---",
  "# Examples",
  "```yaml",
  `TEST_${token.toUpperCase()}: value // ${pragma}`,
  "```",
  "```python",
  `${token} = 'demo' // ${pragma}`,
  "```",
  "```graphql",
  `mutation Login($${token}: String!) { login(${token}: $${token}) } // ${pragma}`,
  "```",
  "```ts",
  "const request = {",
  "  query: `",
  `    mutation Login($${token}: String!) { // ${pragma}`,
  `      login(${token}: $${token}) { token } // ${pragma}`,
  "    }",
  "  `,",
  `  variables: { ${token}: 'demo' }, // ${pragma}`,
  "};",
  "```",
  "```json",
  `{"${token}":"demo"}`,
  "```",
  "",
].join("\n");

afterEach(async () => {
  for (const root of roots.splice(0))
    await rm(root, { recursive: true, force: true });
});

describe("skill scanner example syntax", () => {
  it.each(["sync", "refresh"])(
    "repairs old annotations through the real %s CLI and stays idempotent",
    async (operation) => {
      await mkdir(path.join(repo, ".tmp"), { recursive: true });
      const root = await mkdtemp(path.join(repo, ".tmp", "scanner-syntax-"));
      roots.push(root);
      await mkdir(path.join(root, "scripts"), { recursive: true });
      const script =
        operation === "sync"
          ? "sync-agent-skills.mjs"
          : "refresh-upstream-skills.mjs";
      await cp(
        path.join(repo, "scripts", script),
        path.join(root, "scripts", script),
      );
      // Includes production dependencies once the helper is shared by both CLIs.
      if (existsSync(path.join(repo, "scripts/lib")))
        await cp(
          path.join(repo, "scripts/lib"),
          path.join(root, "scripts/lib"),
          { recursive: true },
        );
      const canonical = path.join(root, "docs/ai/skills/npm-deps-cleanup");
      const ecosystem = path.join(root, ".agents/skills/npm-deps-cleanup");
      await mkdir(canonical, { recursive: true });
      await mkdir(ecosystem, { recursive: true });
      await writeFile(
        path.join(canonical, "SKILL.md"),
        operation === "sync" ? source : "# Original\n",
      );
      await writeFile(path.join(ecosystem, "SKILL.md"), source);
      const output = path.join(
        operation === "sync" ? ecosystem : canonical,
        "SKILL.md",
      );
      const run = () =>
        spawnSync(
          process.execPath,
          [
            `scripts/${script}`,
            ...(operation === "refresh" ? ["--only=anthonyshew/dotfiles"] : []),
          ],
          { cwd: root, encoding: "utf8" },
        );
      const result = run();
      expect(result.status, result.stdout + result.stderr).toBe(0);
      const fixed = await readFile(output, "utf8");
      expect(fixed).toContain(
        `description: ${token} reset reference # ${pragma}`,
      );
      expect(fixed).toContain(`TEST_${token.toUpperCase()}: value # ${pragma}`);
      expect(fixed).toContain(`${token} = 'demo' # ${pragma}`);
      expect(fixed).toContain(
        `mutation Login($${token}: String!) { # ${pragma}`,
      );
      expect(fixed).toContain(
        `login(${token}: $${token}) { token } # ${pragma}`,
      );
      expect(fixed).toContain(`variables: { ${token}: 'demo' }, // ${pragma}`);
      const json = fixed.split("```json\n")[1]!.split("\n```")[0]!;
      expect(JSON.parse(json)).toEqual({ [token]: "demo" });
      // Parse the Python example: the old // comment is valid syntax but fails at runtime.
      const python = fixed.split("```python\n")[1]!.split("\n```")[0]!;
      const executed = spawnSync("python3", ["-c", python], {
        encoding: "utf8",
      });
      expect(executed.status, executed.stderr).toBe(0);
      const again = run();
      expect(again.status, again.stdout + again.stderr).toBe(0);
      expect(await readFile(output, "utf8")).toBe(fixed);
    },
  );
});
