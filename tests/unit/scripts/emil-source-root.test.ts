import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmod,
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  readlink,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const roots: string[] = [];
const emilSkills = [
  "animate",
  "animate-expo",
  "animation-performance",
  "animation-vocabulary",
  "apple-design",
  "ask-sonner",
  "break-ui",
  "emil-design-eng",
  "emil-prototype",
  "improve-animations",
  "mobile-native",
  "pick-ui-library",
  "review-animations",
  "write-swift",
];
const coreOverlay =
  /<!-- CORE-OVERLAY-START -->[\s\S]*?<!-- CORE-OVERLAY-END -->/g;
const upstreamRevision = "Reviewed raw upstream revision.";
const staleRevision = "Stale installed runtime revision.";

async function setTreePermissions(root: string, readOnly: boolean) {
  if (!readOnly) await chmod(root, 0o755);
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) {
      await setTreePermissions(target, readOnly);
    } else if (entry.isFile()) {
      const executable = (await stat(target)).mode & 0o111;
      await chmod(target, (readOnly ? 0o444 : 0o644) | executable);
    }
  }
  if (readOnly) await chmod(root, 0o555);
}

async function snapshotTree(root: string) {
  const entries = new Map<string, { mode: number; contents: string }>();
  async function visit(directory: string) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      const relative = path.relative(root, target);
      const mode = (await lstat(target)).mode & 0o777;
      if (entry.isSymbolicLink()) {
        entries.set(relative, {
          mode,
          contents: `link:${await readlink(target)}`,
        });
      } else if (entry.isDirectory()) {
        entries.set(relative, { mode, contents: "directory" });
        await visit(target);
      } else {
        entries.set(relative, {
          mode,
          contents: (await readFile(target)).toString("base64"),
        });
      }
    }
  }
  await visit(root);
  return entries;
}

async function createFixture() {
  await mkdir(path.join(repoRoot, ".tmp"), { recursive: true });
  const root = await mkdtemp(path.join(repoRoot, ".tmp", "emil-source-root-"));
  roots.push(root);
  await mkdir(path.join(root, "scripts"), { recursive: true });
  await cp(
    path.join(repoRoot, "scripts/refresh-upstream-skills.mjs"),
    path.join(root, "scripts/refresh-upstream-skills.mjs"),
  );
  await cp(path.join(repoRoot, "scripts/lib"), path.join(root, "scripts/lib"), {
    recursive: true,
  });
  await cp(
    path.join(repoRoot, "skills-lock.json"),
    path.join(root, "skills-lock.json"),
  );

  const sourceRoot = path.join(root, "reviewed-upstream", "skills");
  const originals = new Map<string, string>();
  const sourceContents = new Map<string, string>();
  const installedContents = new Map<string, string>();
  for (const name of emilSkills) {
    const canonical = path.join(root, "docs/ai/skills", name);
    const installed = path.join(root, ".agents/skills", name);
    const upstreamName = name === "emil-prototype" ? "prototype" : name;
    const raw = path.join(sourceRoot, upstreamName);
    const originalTree = path.join(repoRoot, "docs/ai/skills", name);
    await cp(originalTree, canonical, { recursive: true });
    await cp(originalTree, installed, { recursive: true });
    await cp(originalTree, raw, { recursive: true });
    const original = await readFile(path.join(canonical, "SKILL.md"), "utf8");
    const stale = original + `\n${staleRevision}\n`;
    let upstream = original.replace(coreOverlay, "");
    if (name === "emil-prototype") {
      upstream = upstream.replace(
        "\nname: emil-prototype\n",
        "\nname: prototype\n",
      );
    }
    upstream += `\n${upstreamRevision}\n`;
    await writeFile(path.join(installed, "SKILL.md"), stale);
    await writeFile(path.join(raw, "SKILL.md"), upstream);
    await writeFile(
      path.join(raw, "reviewed-companion.txt"),
      `Reviewed companion for ${name}.\n`,
    );
    originals.set(name, original);
    sourceContents.set(name, upstream);
    installedContents.set(name, stale);
  }

  const unrelated = new Map<string, string>([
    [
      "docs/ai/skills/prototype/SKILL.md",
      "Matt Pocock prototype stays intact.\n",
    ],
    [".agents/skills/prototype/SKILL.md", "Installed Matt Pocock prototype.\n"],
    [
      "docs/ai/skills/find-animation-opportunities/SKILL.md",
      "Core motion adapter.\n",
    ],
    [".agents/skills/personal/SKILL.md", "Unrelated personal skill.\n"],
  ]);
  for (const [relative, contents] of unrelated) {
    const target = path.join(root, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, contents);
  }
  const adapter = path.join(
    sourceRoot,
    "find-animation-opportunities",
    "SKILL.md",
  );
  await mkdir(path.dirname(adapter), { recursive: true });
  await writeFile(
    adapter,
    "Raw upstream adapter must not replace Core's copy.\n",
  );
  const executable = path.join(
    sourceRoot,
    "animate",
    "scripts",
    "fixture-helper.sh",
  );
  await mkdir(path.dirname(executable), { recursive: true });
  await writeFile(executable, "#!/bin/sh\nexit 99\n");
  await chmod(executable, 0o755);
  await setTreePermissions(sourceRoot, true);
  return {
    root,
    sourceRoot,
    originals,
    sourceContents,
    installedContents,
    unrelated,
  };
}

function runRefresh(root: string, args: string[]) {
  const result = spawnSync(
    process.execPath,
    ["scripts/refresh-upstream-skills.mjs", ...args],
    {
      cwd: root,
      encoding: "utf8",
      timeout: 20_000,
      env: {
        ...process.env,
        HOME: root,
        TMPDIR: root,
        TEMP: root,
        TMP: root,
      },
    },
  );
  return { status: result.status, output: result.stdout + result.stderr };
}

function replaceFixtureText(
  content: string,
  search: string | RegExp,
  replacement: string,
) {
  const updated = content.replace(search, replacement);
  expect(
    updated,
    "The raw fixture must replace the existing Core adaptation",
  ).not.toBe(content);
  return updated;
}

async function useReviewedRawMarkdown(sourceRoot: string) {
  await setTreePermissions(sourceRoot, false);
  const animatePath = path.join(sourceRoot, "animate/SKILL.md");
  let animate = await readFile(animatePath, "utf8");
  animate = replaceFixtureText(
    animate,
    /^If the task needs a _component_ rather than an animation[^\n]+$/mu,
    "If the task needs a *component* rather than an animation — a toast, a drawer, a command menu, a dropdown — stop and invoke `pick-ui-library`. Hand-rolling those is how you end up with a `<div>` dropdown and no focus management.",
  );
  animate = replaceFixtureText(
    animate,
    /--ease-out-soft:\s*cubic-bezier\([^;]+\);\s*\/\* Core token; strong ease-out for UI \*\//u,
    "--ease-out: cubic-bezier(0.23, 1, 0.32, 1);        /* strong ease-out for UI */",
  );
  const rawDurations = [
    "| Element | Duration |",
    "| --- | --- |",
    "| Button press feedback | 100–160ms |",
    "| Tooltips, small popovers | 125–200ms |",
    "| Dropdowns, selects | 150–250ms |",
    "| Modals, drawers | 200–500ms |",
    "| Marketing / explanatory | Can be longer |",
  ].join("\n");
  const tables = animate.match(/(?:^\|[^\n]+\|(?:\n|$))+/gmu) ?? [];
  const durations = tables.find((table) =>
    table.includes("var(--duration-press)"),
  );
  expect(durations).toBeDefined();
  animate = replaceFixtureText(animate, durations!, rawDurations + "\n");
  animate = animate
    .replace(
      /^<motion\.div animate=\{\{ x: 100 \}\} \/>[^\n]*$/mu,
      "<motion.div animate={{ x: 100 }} />                          // drops frames under load",
    )
    .replace(
      /^<motion\.div animate=\{\{ transform: "translateX\(100px\)" \}\} \/>[^\n]*$/mu,
      '<motion.div animate={{ transform: "translateX(100px)" }} />  // hardware accelerated',
    );
  expect(animate).toContain("// drops frames under load");
  expect(animate).toContain("// hardware accelerated");
  await writeFile(animatePath, animate);

  const recipesPath = path.join(sourceRoot, "animate/RECIPES.md");
  let recipes = await readFile(recipesPath, "utf8");
  recipes = replaceFixtureText(
    recipes,
    "Curves are the Core tokens `--ease-out-soft`, `--ease-in-out-soft`, and `--ease-drawer` from `packages/ui/styles/globals.css`.",
    "Curves are the `--ease-out`, `--ease-in-out`, and `--ease-drawer` tokens defined in SKILL.md.",
  );
  recipes = recipes
    .replaceAll("var(--ease-out-soft)", "var(--ease-out)")
    .replaceAll("var(--ease-in-out-soft)", "var(--ease-in-out)");
  recipes = replaceFixtureText(
    recipes,
    "transform var(--duration-press) var(--ease-out)",
    "transform 160ms var(--ease-out)",
  );
  recipes = replaceFixtureText(
    recipes,
    "transform var(--duration-drawer) var(--ease-drawer)",
    "transform 500ms var(--ease-drawer)",
  );
  await writeFile(recipesPath, recipes);

  const sonnerPath = path.join(sourceRoot, "ask-sonner/SKILL.md");
  let sonner = await readFile(sonnerPath, "utf8");
  sonner = replaceFixtureText(
    sonner,
    /^import \{ Toaster \} from [^\n]+$/mu,
    "import { Toaster } from 'sonner'; // once, in layout",
  );
  sonner = replaceFixtureText(
    sonner,
    /^\| Toast never appears\s*\|[^\n]+$/mu,
    "| Toast never appears | No `<Toaster />` mounted, or it unmounted (conditional render, per-page placement). Mount one at the root. If calling from a server action: `toast()` is client-only — call it with the action's result on the client. |",
  );
  sonner = replaceFixtureText(
    sonner,
    /^\| Toast shows up in every toaster\s*\|[^\n]+$/mu,
    "| Toast shows up in every toaster | Multiple toasters need targeting: give each Toaster an `id` and pass `toasterId` in the `toast()` call. |",
  );
  await writeFile(sonnerPath, sonner);
  await setTreePermissions(sourceRoot, true);
}

afterEach(async () => {
  for (const root of roots.splice(0)) {
    await setTreePermissions(root, false);
    await rm(root, { recursive: true, force: true });
  }
});

describe("reviewed Emil source root", () => {
  it("accepts reviewed raw Markdown variants and adapts their guidance to Core", async () => {
    const fixture = await createFixture();
    await useReviewedRawMarkdown(fixture.sourceRoot);
    const originalRawTree = await snapshotTree(fixture.sourceRoot);
    const result = runRefresh(fixture.root, [
      "--only=emilkowalski/skills",
      `--emil-source-root=${fixture.sourceRoot}`,
    ]);
    expect(result.status, result.output).toBe(0);
    const canonicalRoot = path.join(fixture.root, "docs/ai/skills");
    const animate = await readFile(
      path.join(canonicalRoot, "animate/SKILL.md"),
      "utf8",
    );
    expect(animate).toContain("reuse `@asym/ui` and Base UI");
    expect(animate).not.toContain("stop and invoke `pick-ui-library`");
    expect(animate).toContain("--ease-out-soft:");
    expect(animate).not.toContain("--ease-out:");
    expect(animate).toContain("`var(--duration-press)` (120ms)");
    expect(animate).toContain("`var(--duration-drawer)` (320ms)");
    expect(animate).not.toContain("// drops frames under load");
    expect(animate).not.toContain("// hardware accelerated");
    const recipes = await readFile(
      path.join(canonicalRoot, "animate/RECIPES.md"),
      "utf8",
    );
    expect(recipes).toContain("var(--duration-press) var(--ease-out-soft)");
    expect(recipes).toContain("var(--duration-drawer) var(--ease-drawer)");
    expect(recipes).not.toContain("var(--ease-out)");
    const sonner = await readFile(
      path.join(canonicalRoot, "ask-sonner/SKILL.md"),
      "utf8",
    );
    expect(sonner).toContain("@asym/ui/components/shadcn/sonner");
    expect(sonner).not.toMatch(/import \{ Toaster \} from ['"]sonner['"]/u);
    expect(sonner).toContain(
      "Core has one shared toaster. Do not mount a second host.",
    );
    expect(sonner).not.toContain("Multiple toasters need targeting:");
    expect(sonner).not.toContain("Mount one at the root.");
    expect(await snapshotTree(fixture.sourceRoot)).toEqual(originalRawTree);
  });

  it.each([
    {
      name: "animation duration guidance",
      skill: "animate",
      before: "| Button press feedback | 100–160ms |",
      after: "| Button press feedback | 100–960ms |",
    },
    {
      name: "Sonner host policy",
      skill: "ask-sonner",
      before:
        "Multiple toasters need targeting: give each Toaster an `id` and pass `toasterId` in the `toast()` call.",
      after: "Mount a separate Toaster for every page.",
    },
  ])(
    "refuses unreviewed $name drift without changing canonical skills or the lock",
    async ({ skill, before, after }) => {
      const fixture = await createFixture();
      await useReviewedRawMarkdown(fixture.sourceRoot);
      await setTreePermissions(fixture.sourceRoot, false);
      const sourcePath = path.join(fixture.sourceRoot, skill, "SKILL.md");
      const original = await readFile(sourcePath, "utf8");
      await writeFile(sourcePath, replaceFixtureText(original, before, after));
      await setTreePermissions(fixture.sourceRoot, true);
      const snapshot = await snapshotTree(fixture.root);
      const result = runRefresh(fixture.root, [
        "--only=emilkowalski/skills",
        `--emil-source-root=${fixture.sourceRoot}`,
      ]);
      expect(result.status, result.output).not.toBe(0);
      expect(result.output).toContain(
        "Required Core compatibility replacement is missing",
      );
      expect(result.output).toMatch(new RegExp(`${skill}[^\\n]*SKILL\\.md`));
      expect(await snapshotTree(fixture.root)).toEqual(snapshot);
    },
  );

  it("promotes reviewed raw trees instead of stale mirrors while preserving Core ownership", async () => {
    const fixture = await createFixture();
    const originalRawTree = await snapshotTree(fixture.sourceRoot);
    const previousLock = JSON.parse(
      await readFile(path.join(fixture.root, "skills-lock.json"), "utf8"),
    );
    const result = runRefresh(fixture.root, [
      "--only=emilkowalski/skills",
      `--emil-source-root=${fixture.sourceRoot}`,
    ]);
    expect(result.status, result.output).toBe(0);
    const lock = JSON.parse(
      await readFile(path.join(fixture.root, "skills-lock.json"), "utf8"),
    );

    for (const name of emilSkills) {
      const canonical = await readFile(
        path.join(fixture.root, "docs/ai/skills", name, "SKILL.md"),
        "utf8",
      );
      expect(canonical, name).toContain(upstreamRevision);
      expect(canonical, name).not.toContain(staleRevision);
      for (const overlay of fixture.originals.get(name)!.match(coreOverlay) ??
        []) {
        expect(canonical, name).toContain(overlay);
      }
      const upstreamName = name === "emil-prototype" ? "prototype" : name;
      expect(canonical, name).toContain(`\nname: ${name}\n`);
      expect(
        await readFile(
          path.join(
            fixture.root,
            "docs/ai/skills",
            name,
            "reviewed-companion.txt",
          ),
          "utf8",
        ),
      ).toBe(`Reviewed companion for ${name}.\n`);
      expect(lock.skills[name]).toMatchObject({
        source: "emilkowalski/skills",
        sourceType: "github",
        skillPath: `skills/${upstreamName}/SKILL.md`,
        computedHash: createHash("sha256")
          .update(fixture.sourceContents.get(name)!)
          .digest("hex"),
      });
      expect(
        await readFile(
          path.join(fixture.sourceRoot, upstreamName, "SKILL.md"),
          "utf8",
        ),
      ).toBe(fixture.sourceContents.get(name));
      expect(
        await readFile(
          path.join(fixture.root, ".agents/skills", name, "SKILL.md"),
          "utf8",
        ),
      ).toBe(fixture.installedContents.get(name));
    }
    for (const [relative, contents] of fixture.unrelated) {
      expect(await readFile(path.join(fixture.root, relative), "utf8")).toBe(
        contents,
      );
    }
    expect(lock.skills.prototype).toEqual(previousLock.skills.prototype);
    expect(await snapshotTree(fixture.sourceRoot)).toEqual(originalRawTree);
    if (process.platform !== "win32") {
      expect(
        (
          await stat(
            path.join(
              fixture.root,
              "docs/ai/skills/animate/scripts/fixture-helper.sh",
            ),
          )
        ).mode & 0o111,
      ).toBe(0o111);
    }
  });

  it.each([
    {
      name: "empty source root",
      args: ["--only=emilkowalski/skills", "--emil-source-root="],
    },
    {
      name: "bare source root flag",
      args: ["--only=emilkowalski/skills", "--emil-source-root"],
    },
    {
      name: "duplicate source roots",
      args: [
        "--only=emilkowalski/skills",
        "--emil-source-root=first",
        "--emil-source-root=second",
      ],
    },
    {
      name: "source root for another group",
      args: ["--only=supabase/agent-skills", "--emil-source-root=reviewed"],
    },
  ])(
    "rejects $name before changing any skills or lock data",
    async ({ args }) => {
      const fixture = await createFixture();
      const before = await snapshotTree(fixture.root);
      const result = runRefresh(fixture.root, args);
      expect(result.status, result.output).not.toBe(0);
      expect(result.output).toContain("--emil-source-root");
      expect(await snapshotTree(fixture.root)).toEqual(before);
    },
  );

  it.each(["missing source", "malformed frontmatter", "symlinked SKILL.md"])(
    "retains canonical trees, lock data, and raw sources after a late %s",
    async (fault) => {
      const fixture = await createFixture();
      await setTreePermissions(fixture.sourceRoot, false);
      const skillPath = path.join(
        fixture.sourceRoot,
        "write-swift",
        "SKILL.md",
      );
      if (fault === "missing source") {
        await rm(path.dirname(skillPath), { recursive: true });
      } else if (fault === "malformed frontmatter") {
        await writeFile(
          skillPath,
          "---\nname: write-swift\ndescription: Missing closing delimiter\n",
        );
      } else {
        const outside = path.join(fixture.root, "external-skill.md");
        await writeFile(outside, fixture.sourceContents.get("write-swift")!);
        await rm(skillPath);
        await symlink(outside, skillPath);
      }
      await setTreePermissions(fixture.sourceRoot, true);
      const before = await snapshotTree(fixture.root);
      const result = runRefresh(fixture.root, [
        "--only=emilkowalski/skills",
        `--emil-source-root=${fixture.sourceRoot}`,
      ]);
      expect(result.status, result.output).not.toBe(0);
      expect(result.output).toContain("write-swift");
      expect(await snapshotTree(fixture.root)).toEqual(before);
    },
  );
});
