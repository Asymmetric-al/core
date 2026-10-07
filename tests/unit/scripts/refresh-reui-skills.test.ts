import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const roots: string[] = [];
const scriptName = "refresh-reui-skills.mjs";
const begin = "<!-- BEGIN:core-reui-overlay -->";
const end = "<!-- END:core-reui-overlay -->";
const originalSkill = `---
name: reui
description: Core-specific routing description.
user-invocable: false
---

${begin}
## Core guidance
Keep base-maia and Base UI.
${end}

# Old upstream skill
`;
const originalRule = `# Old workflow

${begin}
Use the shared UI package.
${end}

Old upstream rule.
`;

function bundle() {
  return {
    version: "abcdef1234",
    files: [
      {
        path: "SKILL.md",
        content:
          '---\nname: reui\ndescription: Upstream routing.\nmetadata:\n  user-invocable: "false"\n---\n\n# Fresh upstream skill\n',
      },
      {
        path: "rules/workflow.md",
        content: "# Fresh workflow\n\nFresh upstream rule.\n",
      },
      { path: "tools.md", content: "# Fresh tool guidance\n" },
    ],
  };
}

async function fixture() {
  const root = await mkdtemp(
    path.join(await realpath(os.tmpdir()), "reui-refresh-test-"),
  );
  roots.push(root);
  await mkdir(path.join(root, "scripts"));
  const source = path.join(process.cwd(), "scripts", scriptName);
  if (existsSync(source))
    await cp(source, path.join(root, "scripts", scriptName));
  const canonical = path.join(root, "docs/ai/skills/reui");
  await mkdir(path.join(canonical, "rules"), { recursive: true });
  await mkdir(path.join(canonical, "references"));
  await writeFile(path.join(canonical, "SKILL.md"), originalSkill);
  await writeFile(path.join(canonical, "rules/workflow.md"), originalRule);
  await writeFile(
    path.join(canonical, "references/docs.md"),
    "Core documentation map.\n",
  );
  await writeFile(
    path.join(canonical, "references/upstream.md"),
    `---
source: https://reui.io/docs/agent-skills
bundle_url: https://mcp.reui.io/api/skills/download
upstream_version: old-version
bundle_sha256: old-hash
last_refreshed: 2026-01-01
---

Retain the manual review instructions.\n`,
  );
  await writeFile(
    path.join(canonical, "references/upstream-manifest.json"),
    JSON.stringify({
      source: "https://mcp.reui.io/api/skills/download",
      version: "old-version",
      reviewedAt: "2026-01-01",
      bundleSha256: "old-hash",
      installerUrl: "https://mcp.reui.io/install.cjs",
      installerSha256: "reviewed-installer-hash",
      files: { "SKILL.md": {}, "rules/workflow.md": {} },
    }),
  );
  await writeFile(
    path.join(root, ".mcp.json"),
    "Existing MCP configuration.\n",
  );
  await mkdir(path.join(root, ".agents/skills/reui"), { recursive: true });
  await writeFile(
    path.join(root, ".agents/skills/reui/SKILL.md"),
    "Existing generated mirror.\n",
  );
  const payload = JSON.stringify(bundle());
  const bundlePath = path.join(root, "bundle.json");
  await writeFile(bundlePath, payload);
  return {
    root,
    canonical,
    bundlePath,
    payload,
    output: path.join(root, "review-stage"),
  };
}

function run(root: string, args: string[], extraEnv: NodeJS.ProcessEnv = {}) {
  const result = spawnSync(
    process.execPath,
    [path.join(root, "scripts", scriptName), ...args],
    {
      cwd: root,
      encoding: "utf8",
      timeout: 10_000,
      env: { ...process.env, ...extraEnv },
    },
  );
  return { status: result.status, output: result.stdout + result.stderr };
}

afterEach(async () => {
  for (const root of roots.splice(0))
    await rm(root, { recursive: true, force: true });
});

describe("ReUI skill refresh staging", () => {
  it("uses the physical default temporary directory when the platform temp path is a symlink", async () => {
    const f = await fixture();
    const physicalTemp = path.join(f.root, "physical-temp");
    const aliasTemp = path.join(f.root, "alias-temp");
    await mkdir(physicalTemp);
    await symlink(physicalTemp, aliasTemp, "junction");
    const result = run(f.root, [`--bundle=${f.bundlePath}`], {
      TMPDIR: aliasTemp,
      TEMP: aliasTemp,
      TMP: aliasTemp,
    });
    expect(result.status, result.output).toBe(0);
    const stagedDirectories = await readdir(physicalTemp);
    expect(stagedDirectories).toHaveLength(1);
    expect(result.output).toContain(
      path.join(physicalTemp, stagedDirectories[0]!),
    );
    expect(await readFile(path.join(f.canonical, "SKILL.md"), "utf8")).toBe(
      originalSkill,
    );
  });
  it("stages a complete fresh bundle with Core overlays and provenance without changing canonical skills or MCP", async () => {
    const f = await fixture();
    const result = run(f.root, [
      `--bundle=${f.bundlePath}`,
      `--output=${f.output}`,
    ]);
    expect(result.status, result.output).toBe(0);
    expect(result.output).toContain(f.output);
    const stagedSkill = await readFile(path.join(f.output, "SKILL.md"), "utf8");
    expect(stagedSkill).toContain(
      "description: Core-specific routing description.",
    );
    expect(stagedSkill).toContain("user-invocable: false");
    expect(stagedSkill).toContain(
      `${begin}\n## Core guidance\nKeep base-maia and Base UI.\n${end}`,
    );
    expect(stagedSkill).toContain("# Fresh upstream skill");
    expect(stagedSkill).not.toContain("Old upstream");
    const stagedRule = await readFile(
      path.join(f.output, "rules/workflow.md"),
      "utf8",
    );
    expect(stagedRule).toContain(
      `${begin}\nUse the shared UI package.\n${end}`,
    );
    expect(stagedRule).toContain("Fresh upstream rule.");
    expect(await readFile(path.join(f.output, "tools.md"), "utf8")).toBe(
      "# Fresh tool guidance\n",
    );
    expect(
      await readFile(path.join(f.output, "references/docs.md"), "utf8"),
    ).toBe("Core documentation map.\n");
    const manifest = JSON.parse(
      await readFile(
        path.join(f.output, "references/upstream-manifest.json"),
        "utf8",
      ),
    );
    expect(manifest.version).toBe("abcdef1234");
    expect(manifest.bundleSha256).toBe(
      createHash("sha256").update(f.payload).digest("hex"),
    );
    expect(Object.keys(manifest.files)).toEqual([
      "SKILL.md",
      "rules/workflow.md",
      "tools.md",
    ]);
    expect(manifest.files["tools.md"]).toEqual({
      sha256:
        "94d0382ca6156d4f2fc16bd68f797a7e0219eb38fe8641a12c4c5815a7e73556",
      bytes: 22,
    });
    expect(manifest.reviewedAt).toBeUndefined();
    const upstream = await readFile(
      path.join(f.output, "references/upstream.md"),
      "utf8",
    );
    expect(upstream).toContain("upstream_version: abcdef1234");
    expect(upstream).toContain("Retain the manual review instructions.");
    expect(await readFile(path.join(f.canonical, "SKILL.md"), "utf8")).toBe(
      originalSkill,
    );
    expect(
      await readFile(path.join(f.canonical, "rules/workflow.md"), "utf8"),
    ).toBe(originalRule);
    expect(await readFile(path.join(f.root, ".mcp.json"), "utf8")).toBe(
      "Existing MCP configuration.\n",
    );
    expect(
      await readFile(path.join(f.root, ".agents/skills/reui/SKILL.md"), "utf8"),
    ).toBe("Existing generated mirror.\n");
    expect((await readdir(f.canonical)).sort()).toEqual([
      "SKILL.md",
      "references",
      "rules",
    ]);
  });

  it.each([
    "../escape.md",
    "/escape.md",
    "C:/escape.md",
    "rules\\escape.md",
    "rules//escape.md",
    "rules/./escape.md",
    "rules/CON.md",
    "rules./escape.md",
  ])(
    "rejects non-portable or escaping path %s before creating a stage",
    async (filePath) => {
      const f = await fixture();
      const payload = bundle();
      payload.files.push({ path: filePath, content: "unsafe" });
      await writeFile(f.bundlePath, JSON.stringify(payload));
      const result = run(f.root, [
        `--bundle=${f.bundlePath}`,
        `--output=${f.output}`,
      ]);
      expect(result.status, result.output).not.toBe(0);
      expect(result.output).toContain("unsafe file path");
      expect(existsSync(f.output)).toBe(false);
      expect(await readFile(path.join(f.canonical, "SKILL.md"), "utf8")).toBe(
        originalSkill,
      );
    },
  );

  it.each([
    "docs/ai/skills",
    ".agents/skills",
    ".claude/skills",
    ".cursor/skills",
  ])("refuses to create a review stage inside %s", async (protectedTree) => {
    const f = await fixture();
    const protectedOutput = path.join(
      f.root,
      protectedTree,
      "reui/review-stage",
    );
    const result = run(f.root, [
      `--bundle=${f.bundlePath}`,
      `--output=${protectedOutput}`,
    ]);
    expect(result.status, result.output).not.toBe(0);
    expect(result.output).toContain("protected skill tree");
    expect(existsSync(protectedOutput)).toBe(false);
  });

  it.each(["SKILL.md", "skill.md"])(
    "rejects duplicate paths (%s) without touching an occupied output",
    async (filePath) => {
      const f = await fixture();
      const payload = bundle();
      payload.files.push({ path: filePath, content: "duplicate" });
      await writeFile(f.bundlePath, JSON.stringify(payload));
      await mkdir(f.output);
      await writeFile(path.join(f.output, "keep.txt"), "Existing user file.\n");
      const result = run(f.root, [
        `--bundle=${f.bundlePath}`,
        `--output=${f.output}`,
      ]);
      expect(result.status, result.output).not.toBe(0);
      expect(result.output).toContain("duplicate file paths");
      expect(await readdir(f.output)).toEqual(["keep.txt"]);
      expect(await readFile(path.join(f.output, "keep.txt"), "utf8")).toBe(
        "Existing user file.\n",
      );
    },
  );

  it("refuses an occupied output for an otherwise valid bundle", async () => {
    const f = await fixture();
    await mkdir(f.output);
    await writeFile(path.join(f.output, "keep.txt"), "Existing user file.\n");
    const result = run(f.root, [
      `--bundle=${f.bundlePath}`,
      `--output=${f.output}`,
    ]);
    expect(result.status, result.output).not.toBe(0);
    expect(await readdir(f.output)).toEqual(["keep.txt"]);
    expect(await readFile(path.join(f.output, "keep.txt"), "utf8")).toBe(
      "Existing user file.\n",
    );
  });

  it.each([
    ["references/upstream.md", "reserved file path"],
    ["references/docs.md", "collides with a Core-owned local reference"],
    ["rules.md/child.md", "conflicting file and directory paths"],
  ])("rejects upstream collision at %s", async (filePath, message) => {
    const f = await fixture();
    const payload = bundle();
    payload.files.push({ path: filePath, content: "collision" });
    if (filePath.startsWith("rules.md/"))
      payload.files.push({
        path: "rules.md",
        content: "a file cannot also be a directory",
      });
    await writeFile(f.bundlePath, JSON.stringify(payload));
    const result = run(f.root, [
      `--bundle=${f.bundlePath}`,
      `--output=${f.output}`,
    ]);
    expect(result.status, result.output).not.toBe(0);
    expect(result.output).toContain(message);
    expect(existsSync(f.output)).toBe(false);
  });

  it("rejects a remote symlink entry", async () => {
    const f = await fixture();
    const payload = bundle();
    await writeFile(
      f.bundlePath,
      JSON.stringify({
        ...payload,
        files: [
          ...payload.files,
          {
            path: "rules/link.md",
            content: "",
            type: "symlink",
            target: "../../outside.md",
          },
        ],
      }),
    );
    const result = run(f.root, [
      `--bundle=${f.bundlePath}`,
      `--output=${f.output}`,
    ]);
    expect(result.status, result.output).not.toBe(0);
    expect(result.output).toContain("regular text files");
    expect(existsSync(f.output)).toBe(false);
  });

  it("requires manual reconciliation when upstream removes a Core overlay file", async () => {
    const f = await fixture();
    const payload = bundle();
    payload.files = payload.files.filter(
      (file) => file.path !== "rules/workflow.md",
    );
    await writeFile(f.bundlePath, JSON.stringify(payload));
    const result = run(f.root, [
      `--bundle=${f.bundlePath}`,
      `--output=${f.output}`,
    ]);
    expect(result.status, result.output).not.toBe(0);
    expect(result.output).toContain("Core overlay was removed");
    expect(existsSync(f.output)).toBe(false);
    expect(
      await readFile(path.join(f.canonical, "rules/workflow.md"), "utf8"),
    ).toBe(originalRule);
  });

  it("drops obsolete upstream files with no local overlay from the fresh stage", async () => {
    const f = await fixture();
    await writeFile(
      path.join(f.canonical, "rules/obsolete.md"),
      "Old upstream reference.\n",
    );
    const manifestFile = path.join(
      f.canonical,
      "references/upstream-manifest.json",
    );
    const previous = JSON.parse(await readFile(manifestFile, "utf8"));
    previous.files["rules/obsolete.md"] = {};
    await writeFile(manifestFile, JSON.stringify(previous));
    const result = run(f.root, [
      `--bundle=${f.bundlePath}`,
      `--output=${f.output}`,
    ]);
    expect(result.status, result.output).toBe(0);
    expect(existsSync(path.join(f.output, "rules/obsolete.md"))).toBe(false);
    expect(
      await readFile(path.join(f.canonical, "rules/obsolete.md"), "utf8"),
    ).toBe("Old upstream reference.\n");
  });

  it("rejects malformed overlay markers before staging", async () => {
    const f = await fixture();
    await writeFile(
      path.join(f.canonical, "rules/workflow.md"),
      originalRule.replace(end, ""),
    );
    const result = run(f.root, [
      `--bundle=${f.bundlePath}`,
      `--output=${f.output}`,
    ]);
    expect(result.status, result.output).not.toBe(0);
    expect(result.output).toContain("markers are malformed");
    expect(existsSync(f.output)).toBe(false);
  });

  it.each(["canonical-directory", "canonical-file", "output-parent"])(
    "refuses symlinks in %s without touching the target",
    async (location) => {
      const f = await fixture();
      const linked = path.join(f.root, "linked-target");
      await mkdir(linked);
      await writeFile(path.join(linked, "keep.txt"), "Keep target content.\n");
      if (location === "canonical-directory") {
        await rm(path.join(f.canonical, "rules"), { recursive: true });
        await symlink(linked, path.join(f.canonical, "rules"), "junction");
      } else if (location === "canonical-file") {
        await rm(path.join(f.canonical, "references/docs.md"));
        await symlink(
          path.join(linked, "keep.txt"),
          path.join(f.canonical, "references/docs.md"),
          "file",
        );
      } else {
        await symlink(linked, path.join(f.root, "linked-output"), "junction");
        f.output = path.join(f.root, "linked-output/stage");
      }
      const result = run(f.root, [
        `--bundle=${f.bundlePath}`,
        `--output=${f.output}`,
      ]);
      expect(result.status, result.output).not.toBe(0);
      expect(result.output).toContain("symlink");
      expect(existsSync(f.output)).toBe(false);
      expect(await readdir(linked)).toEqual(["keep.txt"]);
      expect(await readFile(path.join(linked, "keep.txt"), "utf8")).toBe(
        "Keep target content.\n",
      );
    },
  );
});
