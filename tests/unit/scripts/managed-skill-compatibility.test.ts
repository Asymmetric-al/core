import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
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
import {
  applyManagedSkillCompatibility,
  formatManagedSkillOutput,
} from "../../../scripts/lib/managed-skill-compatibility.mjs";

const repo = process.cwd();
const fixtureRoot = path.join(repo, "tests/fixtures/managed-skill-refresh");
const roots: string[] = [];
const emil = [
  "animate",
  "animate-expo",
  "animation-vocabulary",
  "apple-design",
  "ask-sonner",
  "emil-design-eng",
  "emil-prototype",
  "improve-animations",
  "mobile-native",
  "pick-ui-library",
  "review-animations",
  "write-swift",
];
async function rawTree(name: string, target: string, relative = "") {
  await mkdir(path.join(target, relative), { recursive: true });
  for (const entry of await readdir(path.join(fixtureRoot, name, relative), {
    withFileTypes: true,
  })) {
    const from = path.join(fixtureRoot, name, relative, entry.name);
    if (entry.isDirectory())
      await rawTree(name, target, path.join(relative, entry.name));
    else
      await cp(
        from,
        path.join(target, relative, entry.name.replace(/\.raw$/u, "")),
      );
  }
}
async function fixture(names: string[]) {
  const root = await mkdtemp(path.join(repo, ".tmp/managed-refresh-test-"));
  roots.push(root);
  await mkdir(path.join(root, "scripts"), { recursive: true });
  await cp(
    path.join(repo, "scripts/refresh-upstream-skills.mjs"),
    path.join(root, "scripts/refresh-upstream-skills.mjs"),
  );
  await cp(path.join(repo, "scripts/lib"), path.join(root, "scripts/lib"), {
    recursive: true,
  });
  await cp(
    path.join(repo, "scripts/refresh-overlays"),
    path.join(root, "scripts/refresh-overlays"),
    { recursive: true },
  );
  await cp(
    path.join(repo, "skills-lock.json"),
    path.join(root, "skills-lock.json"),
  );
  for (const name of names) {
    await cp(
      path.join(repo, "docs/ai/skills", name),
      path.join(root, "docs/ai/skills", name),
      { recursive: true },
    );
    await rawTree(name, path.join(root, ".agents/skills", name));
  }
  return root;
}
function refresh(root: string, source: string) {
  return spawnSync(
    process.execPath,
    ["scripts/refresh-upstream-skills.mjs", "--only=" + source],
    { cwd: root, encoding: "utf8", timeout: 30_000 },
  );
}
afterEach(async () => {
  for (const root of roots.splice(0))
    await rm(root, { recursive: true, force: true });
});
describe("reviewed raw managed-skill restoration", () => {
  it("uses byte-exact upstream fixtures with independently recorded immutable source hashes", async () => {
    const manifest = JSON.parse(
      await readFile(path.join(fixtureRoot, "source-manifest.json"), "utf8"),
    );
    for (const [name, entry] of Object.entries(manifest.files) as Array<
      [string, { rawSkillHash: string }]
    >) {
      expect(
        createHash("sha256")
          .update(await readFile(path.join(fixtureRoot, name, "SKILL.md.raw")))
          .digest("hex"),
        name,
      ).toBe(entry.rawSkillHash);
    }
  });
  it("refreshes all twelve raw Emil trees, preserves complete animate guidance and one existing Sonner host", async () => {
    const root = await fixture(emil);
    const result = refresh(root, "emilkowalski/skills");
    expect(result.status, result.stdout + result.stderr).toBe(0);
    const read = (name: string, file = "SKILL.md") =>
      readFile(path.join(root, "docs/ai/skills", name, file), "utf8");
    const animate = await read("animate");
    expect(animate).toContain("reuse");
    expect(animate).toContain("@asym/ui");
    expect(animate).toContain("Hand-rolling those is how you end up");
    expect(animate).toContain(
      "unless the user explicitly asked which library to use",
    );
    expect(animate).not.toContain("stop and invoke");
    expect(animate).not.toContain("## Initial Response");
    expect(animate).toContain(
      "If a task or question is already present, continue its workflow immediately.",
    );
    const sonner = await read("ask-sonner");
    expect(sonner).toContain(
      'import { Toaster } from "@asym/ui/components/shadcn/sonner"',
    );
    expect(sonner).toContain("do not add another");
    expect(await read("ask-sonner", "API.md")).toContain("toast.getToasts()");
    expect(sonner).not.toContain("Mount one at the root.");
    // Compare every reviewed Markdown companion with the independently adapted
    // installed baseline, ignoring formatter whitespace only.
    const diffs: string[] = [];
    for (const name of emil) {
      for (const entry of await readdir(path.join(fixtureRoot, name))) {
        if (!entry.endsWith(".md.raw")) continue;
        const file = entry.replace(/\.raw$/u, "");
        const actual = await read(name, file);
        const expected = await readFile(
          path.join(repo, "docs/ai/skills", name, file),
          "utf8",
        );
        if (
          actual.replace(/\s+/gu, " ").trim() !==
          expected.replace(/\s+/gu, " ").trim()
        ) {
          diffs.push(name + "/" + file);
          await writeFile(
            path.join(repo, ".tmp", "managed-roundtrip-" + name + "-" + file),
            actual,
          );
        }
      }
    }
    expect(
      diffs,
      "raw refresh lost a reviewed compatibility correction; output in .tmp/managed-roundtrip-*",
    ).toEqual([]);
    const before = animate;
    const again = refresh(root, "emilkowalski/skills");
    expect(again.status, again.stdout + again.stderr).toBe(0);
    expect(await read("animate")).toBe(before);
  });
  it("refreshes the raw current router without routes to uninstalled successors or a damaged prototype detour", async () => {
    const root = await fixture(["ask-matt"]);
    const result = refresh(root, "mattpocock/skills");
    expect(result.status, result.stdout + result.stderr).toBe(0);
    const text = await readFile(
      path.join(root, "docs/ai/skills/ask-matt/SKILL.md"),
      "utf8",
    );
    for (const name of [
      "implement-spec",
      "/pr" + String.fromCharCode(96),
      "/retro",
      "to-questionnaire",
      "wait-what",
      "GLOSSARY.md",
    ])
      expect(text).not.toContain(name);
    expect(
      await readFile(
        path.join(root, "docs/ai/skills/ask-matt/references/LICENSE.md"),
        "utf8",
      ),
    ).toBe(
      await readFile(
        path.join(repo, "docs/ai/skills/ask-matt/references/LICENSE.md"),
        "utf8",
      ),
    );
    const detour = text.slice(
      text.indexOf("2. **Branch"),
      text.indexOf("3. **Branch"),
    );
    expect(detour.match(/^   - /gmu)).toHaveLength(3);
    expect(detour).not.toContain("resolving-merge-conflicts");
    expect(text.slice(text.indexOf("## Standalone"))).toContain(
      "resolving-merge-conflicts",
    );
    expect(text).toContain("CONTEXT.md");
  });
  it("accepts the folded taste v2 metadata under its stable explicit-only name and leaves the removed snapshot alone", async () => {
    const root = await fixture(["design-taste-frontend"]);
    await mkdir(path.join(root, "docs/ai/skills/redesign-existing-projects"), {
      recursive: true,
    });
    await writeFile(
      path.join(root, "docs/ai/skills/redesign-existing-projects/SKILL.md"),
      "snapshot untouched",
    );
    const result = refresh(root, "leonxlnx/taste-skill");
    expect(result.status, result.stdout + result.stderr).toBe(0);
    const text = await readFile(
      path.join(root, "docs/ai/skills/design-taste-frontend/SKILL.md"),
      "utf8",
    );
    expect(text).toContain("disable-model-invocation: true");
    expect(text).toContain("# tasteskill v2");
    expect(
      await readFile(
        path.join(root, "docs/ai/skills/redesign-existing-projects/SKILL.md"),
        "utf8",
      ),
    ).toBe("snapshot untouched");
  });
  it("restores Core TDD policy, project CONTEXT filenames, current icon tokens and authorized implementation steps", async () => {
    const root = await mkdtemp(path.join(repo, ".tmp/managed-helpers-test-"));
    roots.push(root);
    for (const name of [
      "tdd",
      "domain-modeling",
      "better-ui",
      "implement",
      "wizard",
    ]) {
      const target = path.join(root, name);
      await rawTree(name, target);
      await applyManagedSkillCompatibility(name, target);
      await applyManagedSkillCompatibility(name, target);
    }
    const read = (name: string, file = "SKILL.md") =>
      readFile(path.join(root, name, file), "utf8");
    expect(await read("tdd")).toContain(
      "Do **not** invent an artificial RED test",
    );
    expect(await read("tdd")).toContain(
      "Established seams were used without blocking on user approval",
    );
    expect(await read("domain-modeling")).toContain("CONTEXT.md");
    await expect(
      read("domain-modeling", "GLOSSARY-FORMAT.md"),
    ).rejects.toMatchObject({ code: "ENOENT" });
    expect(await read("domain-modeling", "CONTEXT-FORMAT.md")).toContain(
      "CONTEXT",
    );
    expect(await read("better-ui", "icons.md")).not.toContain("--icon-");
    expect(await read("implement")).toContain(
      "when the task authorizes committing",
    );
    expect(await read("wizard")).toContain("disable-model-invocation: true");
    expect(await read("wizard", "agents/openai.yaml")).toContain(
      "allow_implicit_invocation: false",
    );
  });
  it("keeps the native wizard policy explicit-only when raw source is restored and synced", async () => {
    const root = await mkdtemp(path.join(repo, ".tmp/managed-wizard-test-"));
    roots.push(root);
    await mkdir(path.join(root, "scripts"), { recursive: true });
    await cp(
      path.join(repo, "scripts/sync-agent-skills.mjs"),
      path.join(root, "scripts/sync-agent-skills.mjs"),
    );
    await cp(path.join(repo, "scripts/lib"), path.join(root, "scripts/lib"), {
      recursive: true,
    });
    await cp(
      path.join(repo, "scripts/refresh-overlays"),
      path.join(root, "scripts/refresh-overlays"),
      { recursive: true },
    );
    await mkdir(path.join(root, "docs/ai/skills/fixture"), { recursive: true });
    await writeFile(
      path.join(root, "docs/ai/skills/fixture/SKILL.md"),
      "---\\nname: fixture\\ndescription: Fixture\\n---\\n",
    );
    await rawTree("wizard", path.join(root, ".agents/skills/wizard"));
    const result = spawnSync(
      process.execPath,
      ["scripts/sync-agent-skills.mjs"],
      { cwd: root, encoding: "utf8" },
    );
    expect(result.status, result.stdout + result.stderr).toBe(0);
    for (const runtime of [".agents", ".cursor", ".claude"]) {
      const metadata = await readFile(
        path.join(root, runtime, "skills/wizard/agents/openai.yaml"),
        "utf8",
      );
      expect(metadata).toContain("allow_implicit_invocation: false");
    }
  });
  it("restores the current shareable prototype tree and explicit native invocation policy", async () => {
    const root = await mkdtemp(path.join(repo, ".tmp/managed-prototype-test-"));
    roots.push(root);
    await rawTree("prototype", root);
    await applyManagedSkillCompatibility("prototype", root);
    await applyManagedSkillCompatibility("prototype", root);
    const entrypoint = await readFile(path.join(root, "SKILL.md"), "utf8");
    expect(entrypoint).toContain("single shareable HTML file");
    expect(entrypoint).toContain("primary source");
    expect(entrypoint).toContain(
      "When branch and commit actions are authorized",
    );
    expect(entrypoint).toContain("disable-model-invocation: true");
    expect(entrypoint).not.toContain("tiny interactive terminal app");
    expect(await readFile(path.join(root, "LOGIC.md"), "utf8")).toContain(
      "self-contained HTML file",
    );
    expect(await readFile(path.join(root, "UI.md"), "utf8")).toContain(
      "only when a new routed surface is included",
    );
    expect(
      await readFile(path.join(root, "agents/openai.yaml"), "utf8"),
    ).toContain("allow_implicit_invocation: false");
  });
  it("does not execute a vendor-provided formatter configuration", async () => {
    const root = await mkdtemp(path.join(repo, ".tmp/managed-formatter-test-"));
    roots.push(root);
    await rawTree("tdd", root);
    const marker = path.join(root, "VENDOR_CONFIG_EXECUTED");
    await writeFile(
      path.join(root, ".prettierrc.cjs"),
      'require("node:fs").writeFileSync(' +
        JSON.stringify(marker) +
        ', "bad"); module.exports = {};',
    );
    await writeFile(
      path.join(root, "vendor-plugin.cjs"),
      'require("node:fs").writeFileSync(' +
        JSON.stringify(marker) +
        ', "bad"); module.exports = {};',
    );
    await writeFile(
      path.join(root, "package.json"),
      JSON.stringify({
        prettier: { plugins: ["./vendor-plugin.cjs"] },
        scripts: {
          preinstall: "node vendor-plugin.cjs",
          test: "node vendor-plugin.cjs",
        },
      }),
    );
    const binary = Buffer.from([0, 255, 128, 13, 10, 1]);
    await writeFile(path.join(root, "opaque.bin"), binary);
    await applyManagedSkillCompatibility("tdd", root);
    await formatManagedSkillOutput("tdd", root);
    expect(await readFile(path.join(root, "opaque.bin"))).toEqual(binary);
    await expect(readFile(marker)).rejects.toMatchObject({ code: "ENOENT" });
  });
  it("rejects mixed raw and Core copies of a reviewed instruction", async () => {
    const root = await mkdtemp(path.join(repo, ".tmp/managed-mixed-test-"));
    roots.push(root);
    await rawTree("implement", root);
    const skillPath = path.join(root, "SKILL.md");
    await writeFile(
      skillPath,
      (await readFile(skillPath, "utf8")) +
        "\\nApply Core " +
        String.fromCharCode(96) +
        "tdd" +
        String.fromCharCode(96) +
        " at an established public seam. Ask only when material behavior or the seam is ambiguous.\\n",
    );
    await expect(
      applyManagedSkillCompatibility("implement", root),
    ).rejects.toThrow("Mixed upstream/Core managed guidance");
  });
  it("rejects current-source contract drift before a canonical group publication", async () => {
    const root = await fixture(["ask-matt"]);
    const canonical = path.join(root, "docs/ai/skills/ask-matt/SKILL.md");
    const before = await readFile(canonical, "utf8");
    const source = path.join(root, ".agents/skills/ask-matt/SKILL.md");
    await writeFile(
      source,
      (await readFile(source, "utf8")).replace(
        "3. **Branch: is this a multi-session build?**",
        "3. Unexpected upstream routing contract",
      ),
    );
    const result = refresh(root, "mattpocock/skills");
    expect(result.status).not.toBe(0);
    expect(await readFile(canonical, "utf8")).toBe(before);
  });
});
