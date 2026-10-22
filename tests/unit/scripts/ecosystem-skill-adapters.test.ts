import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const temporaryRoots: string[] = [];
const guidancePath = "scripts/refresh-overlays/ecosystem-core-guidance.json";
const overlaysPath = "scripts/refresh-overlays/ecosystem-core-overlays.json";

async function put(root: string, relativePath: string, content: string) {
  const target = path.join(root, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content);
}

async function fixture() {
  await mkdir(path.join(repoRoot, ".tmp"), { recursive: true });
  const root = await mkdtemp(
    path.join(repoRoot, ".tmp", "ecosystem-adapters-"),
  );
  temporaryRoots.push(root);
  await mkdir(path.join(root, "scripts"));
  await cp(
    path.join(repoRoot, "scripts/sync-agent-skills.mjs"),
    path.join(root, "scripts/sync-agent-skills.mjs"),
  );
  await cp(path.join(repoRoot, "scripts/lib"), path.join(root, "scripts/lib"), {
    recursive: true,
  });
  for (const relativePath of [
    guidancePath,
    overlaysPath,
    "scripts/refresh-overlays/shadcn-ui-data-table.json",
  ]) {
    await put(
      root,
      relativePath,
      await readFile(path.join(repoRoot, relativePath), "utf8"),
    );
  }
  await put(
    root,
    "docs/ai/skills/fixture/SKILL.md",
    "---\nname: fixture\ndescription: Fixture\n---\n",
  );

  const overlays = JSON.parse(
    await readFile(path.join(root, overlaysPath), "utf8"),
  ) as {
    skills: Array<{ name: string; upstreamFrontmatter: string }>;
    prefixes: Array<{ path: string }>;
  };
  const guidance = JSON.parse(
    await readFile(path.join(root, guidancePath), "utf8"),
  ) as {
    replacements: Array<{ path: string; upstream: string; core: string }>;
  };
  for (const skill of overlays.skills) {
    await put(
      root,
      ".agents/skills/" + skill.name + "/SKILL.md",
      skill.upstreamFrontmatter + "\n\n# Reinstalled upstream skill\n",
    );
  }
  for (const replacement of guidance.replacements) {
    const relativePath = ".agents/skills/" + replacement.path;
    const target = path.join(root, relativePath);
    const original = existsSync(target) ? await readFile(target, "utf8") : "";
    if (!original.includes(replacement.upstream)) {
      await put(
        root,
        relativePath,
        original + "\n" + replacement.upstream + "\n",
      );
    }
  }
  for (const prefix of overlays.prefixes) {
    const relativePath = ".agents/skills/" + prefix.path;
    if (!existsSync(path.join(root, relativePath))) {
      await put(root, relativePath, "# Reinstalled upstream reference\n");
    }
  }

  // Exercise the existing Base UI adapter with its real reviewed example.
  let table = await readFile(
    path.join(repoRoot, ".agents/skills/shadcn-ui/examples/data-table.tsx"),
    "utf8",
  );
  const tableReplacements = JSON.parse(
    await readFile(
      path.join(root, "scripts/refresh-overlays/shadcn-ui-data-table.json"),
      "utf8",
    ),
  ) as Array<{ upstream: string; core: string }>;
  for (const replacement of tableReplacements) {
    expect(table).toContain(replacement.core);
    table = table.replace(replacement.core, replacement.upstream);
  }
  // Revert every table repair to exercise the real pinned upstream shape.
  for (const replacement of guidance.replacements.filter(
    (entry) => entry.path === "shadcn-ui/examples/data-table.tsx",
  )) {
    expect(table).toContain(replacement.core);
    table = table.replace(replacement.core, replacement.upstream);
  }
  await put(root, ".agents/skills/shadcn-ui/examples/data-table.tsx", table);

  let auth = await readFile(
    path.join(repoRoot, ".agents/skills/shadcn-ui/examples/auth-layout.tsx"),
    "utf8",
  );
  for (const replacement of guidance.replacements.filter(
    (entry) => entry.path === "shadcn-ui/examples/auth-layout.tsx",
  )) {
    expect(auth).toContain(replacement.core);
    auth = auth.replace(replacement.core, replacement.upstream);
  }
  await put(root, ".agents/skills/shadcn-ui/examples/auth-layout.tsx", auth);

  // Current official shadcn source imports cn from its package. Core owns it
  // in the existing shared UI helper, and every runtime must retain that seam.
  await put(
    root,
    ".agents/skills/shadcn/SKILL.md",
    "---\nname: shadcn\ndescription: Fixture\n---\n\n- **Toast follows the project base.** Use `toast` from the `toast` component for\n  Base UI projects. Use `toast()` from `sonner` for Radix and React Aria\n  projects.\n",
  );
  await put(
    root,
    ".agents/skills/shadcn/rules/styling.md",
    '# Styling\n\n```tsx\nimport { cn } from "cn"\n\n<div className={cn("flex", active && "bg-primary")} />\n```\n',
  );

  // Neither package lifecycle hooks nor vendor executables belong to sync.
  await put(
    root,
    ".agents/skills/api-design-principles/package.json",
    JSON.stringify({
      scripts: {
        preinstall:
          "node -e \"require('fs').writeFileSync('IMPORTED_CODE_RAN','bad')\"",
      },
    }),
  );
  await put(
    root,
    ".agents/skills/api-design-principles/vendor-check.cjs",
    "require('fs').writeFileSync('IMPORTED_CODE_RAN','bad');\n",
  );
  return { root, skills: overlays.skills };
}

function run(root: string) {
  return spawnSync(process.execPath, ["scripts/sync-agent-skills.mjs"], {
    cwd: root,
    encoding: "utf8",
  });
}

afterEach(async () => {
  for (const root of temporaryRoots.splice(0)) {
    await rm(root, { recursive: true, force: true });
  }
});

describe("ecosystem Core adapters through skills:sync", () => {
  it("restores all reviewed overlays, aliases, policies, and helper repairs after reinstall without executing vendor code", async () => {
    const { root, skills } = await fixture();
    const result = run(root);
    expect(result.status, result.stdout + result.stderr).toBe(0);

    for (const skill of skills) {
      for (const runtime of [".agents", ".cursor", ".claude"]) {
        const content = await readFile(
          path.join(root, runtime, "skills", skill.name, "SKILL.md"),
          "utf8",
        );
        expect(content, runtime + "/" + skill.name).toContain(
          "<!-- CORE-OVERLAY-START -->",
        );
        expect(content, runtime + "/" + skill.name).toContain(
          "<!-- CORE-OVERLAY-END -->",
        );
      }
    }
    const read = (relativePath: string) =>
      readFile(path.join(root, ".agents/skills", relativePath), "utf8");
    expect(await read("use-dom/SKILL.md")).toContain("\nname: use-dom\n");
    expect(await read("use-dom/agents/openai.yaml")).toContain("$use-dom");
    expect(await read("interface-design/SKILL.md")).toContain(
      "disable-model-invocation: true",
    );
    expect(await read("interface-design/agents/openai.yaml")).toContain(
      "allow_implicit_invocation: false",
    );
    expect(
      await read("api-design-principles/assets/rest-api-template.py"),
    ).toContain("detail_dict = detail if isinstance(detail, dict) else None");
    expect(
      await read("skill-creator/eval-viewer/generate_review.py"),
    ).toContain('json.dumps(embedded).replace("<", "\\\\u003c")');
    for (const runtime of [".agents", ".cursor", ".claude"]) {
      const table = await readFile(
        path.join(root, runtime, "skills/shadcn-ui/examples/data-table.tsx"),
        "utf8",
      );
      expect(table).not.toContain("asChild");
      expect(table).toContain("    type ColumnDef,");
      expect(table).toContain("    type ColumnFiltersState,");
      expect(table).toContain("    type SortingState,");
      expect(table).toContain("justify-end gap-x-2 py-4");
      const auth = await readFile(
        path.join(root, runtime, "skills/shadcn-ui/examples/auth-layout.tsx"),
        "utf8",
      );
      expect(auth).not.toContain("space-y-");
      expect(
        auth.match(/CardContent className="flex flex-col gap-4"/g),
      ).toHaveLength(2);
      expect(auth.match(/div className="flex flex-col gap-2"/g)).toHaveLength(
        6,
      );
      expect(
        auth.match(/CardFooter className="flex flex-col gap-y-4"/g),
      ).toHaveLength(2);
    }
    expect(await read("lint-and-validate/SKILL.md")).not.toContain("npm audit");
    expect(await read("lint-and-validate/SKILL.md")).not.toContain("--fix");
    expect(await read("typescript-expert/SKILL.md")).not.toContain("bundle:");
    expect(await read("typescript-expert/SKILL.md")).toContain(
      "bun run typecheck",
    );
    for (const runtime of [".agents", ".cursor", ".claude"]) {
      const styling = await readFile(
        path.join(root, runtime, "skills/shadcn/rules/styling.md"),
        "utf8",
      );
      expect(styling).toContain('import { cn } from "@asym/ui/lib/utils"');
      expect(styling).not.toContain('import { cn } from "cn"');
      expect(styling).toContain('cn("flex", active && "bg-primary")');
    }
    expect(existsSync(path.join(root, "IMPORTED_CODE_RAN"))).toBe(false);

    const first = await read("use-dom/SKILL.md");
    const again = run(root);
    expect(again.status, again.stdout + again.stderr).toBe(0);
    expect(await read("use-dom/SKILL.md")).toBe(first);
    expect(existsSync(path.join(root, "IMPORTED_CODE_RAN"))).toBe(false);
  });

  it("rejects malformed markers before publishing any planned adapter changes", async () => {
    const { root } = await fixture();
    const skillPath = ".agents/skills/api-design-principles/SKILL.md";
    const assetPath =
      ".agents/skills/api-design-principles/assets/rest-api-template.py";
    const skill = await readFile(path.join(root, skillPath), "utf8");
    const asset = await readFile(path.join(root, assetPath), "utf8");
    await put(root, skillPath, skill + "\n<!-- CORE-OVERLAY-START -->\n");
    const result = run(root);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Malformed Core overlay markers");
    expect(await readFile(path.join(root, skillPath), "utf8")).toBe(
      skill + "\n<!-- CORE-OVERLAY-START -->\n",
    );
    expect(await readFile(path.join(root, assetPath), "utf8")).toBe(asset);
  });

  it("rejects unknown required source text without partially publishing earlier fixes", async () => {
    const { root } = await fixture();
    const assetPath =
      ".agents/skills/api-design-principles/assets/rest-api-template.py";
    const asset = await readFile(path.join(root, assetPath), "utf8");
    await put(
      root,
      ".agents/skills/shadcn-ui/README.md",
      "# Unexpected upstream revision\n",
    );
    const result = run(root);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      "Core ecosystem adapter no longer matches shadcn-ui/README.md",
    );
    expect(await readFile(path.join(root, assetPath), "utf8")).toBe(asset);
  });

  it("keeps minimal sync fixtures compatible when both optional configs are absent", async () => {
    const { root } = await fixture();
    await rm(path.join(root, guidancePath));
    await rm(path.join(root, overlaysPath));
    const result = run(root);
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(
      await readFile(
        path.join(root, ".agents/skills/api-design-principles/SKILL.md"),
        "utf8",
      ),
    ).not.toContain("<!-- CORE-OVERLAY-START -->");
  });
});
