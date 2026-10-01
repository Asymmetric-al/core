import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import ts from "typescript";
import { afterEach, describe, expect, it } from "vitest";

const root = process.cwd();
const example = "shadcn-ui/examples/data-table.tsx";
const overlay = "scripts/refresh-overlays/shadcn-ui-data-table.json";
const temporaryRoots: string[] = [];
const hash = (source: string) =>
  createHash("sha256").update(source).digest("hex");
const approvedHash =
  "93be0c64337a48e5245a4924f69890b37d4c5478a3196d2a9e8b9a8c26a2dd70";
const originalHash =
  "b83d0ab3a8f6ce1e58a8e90b68e73d68942a929ab72a7049b9ce0f6d62cd82ea";

afterEach(async () => {
  for (const directory of temporaryRoots.splice(0)) {
    await rm(directory, { recursive: true, force: true });
  }
});

function menuShape(source: string) {
  const file = ts.createSourceFile(
    example,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const problems: string[] = [];
  let labels = 0;
  let triggers = 0;
  function visit(node: ts.Node, insideGroup = false) {
    if (ts.isJsxElement(node)) {
      const name = node.openingElement.tagName.getText(file);
      if (name === "DropdownMenuLabel") {
        labels++;
        if (!insideGroup) problems.push("label outside Group");
      }
      insideGroup ||=
        name === "DropdownMenuGroup" || name === "DropdownMenuRadioGroup";
    }
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      if (node.tagName.getText(file) === "DropdownMenuTrigger") {
        triggers++;
        const attributes = node.attributes.properties
          .filter(ts.isJsxAttribute)
          .map((attribute) => attribute.name.getText(file));
        if (attributes.includes("asChild")) problems.push("obsolete asChild");
        if (!attributes.includes("render"))
          problems.push("missing render composition");
      }
    }
    ts.forEachChild(node, (child) => visit(child, insideGroup));
  }
  visit(file);
  return { labels, triggers, problems };
}

async function originalExample() {
  let source = await readFile(
    path.join(root, ".agents/skills", example),
    "utf8",
  );
  const replacements = JSON.parse(
    await readFile(path.join(root, overlay), "utf8"),
  ) as { upstream: string; core: string }[];
  for (const { upstream, core } of replacements)
    source = source.replace(core, upstream);
  expect(hash(source)).toBe(originalHash);
  return source;
}

async function fixture(source: string) {
  await mkdir(path.join(root, ".tmp"), { recursive: true });
  const directory = await mkdtemp(
    path.join(root, ".tmp", "shadcn-example-sync-"),
  );
  temporaryRoots.push(directory);
  await mkdir(path.join(directory, "scripts/refresh-overlays"), {
    recursive: true,
  });
  await cp(
    path.join(root, "scripts/sync-agent-skills.mjs"),
    path.join(directory, "scripts/sync-agent-skills.mjs"),
  );
  await cp(
    path.join(root, "scripts/lib"),
    path.join(directory, "scripts/lib"),
    { recursive: true },
  );
  await cp(path.join(root, overlay), path.join(directory, overlay));
  await mkdir(path.join(directory, "docs/ai/skills/sample"), {
    recursive: true,
  });
  await writeFile(
    path.join(directory, "docs/ai/skills/sample/SKILL.md"),
    "# Sample\n",
  );
  await mkdir(path.join(directory, ".agents/skills/shadcn-ui/examples"), {
    recursive: true,
  });
  await writeFile(
    path.join(directory, ".agents/skills/shadcn-ui/SKILL.md"),
    "# shadcn-ui\n",
  );
  await writeFile(path.join(directory, ".agents/skills", example), source);
  return directory;
}

function sync(directory: string) {
  return spawnSync(process.execPath, ["scripts/sync-agent-skills.mjs"], {
    cwd: directory,
    encoding: "utf8",
  });
}

describe("shadcn-ui ecosystem example preservation", () => {
  it("retains the reviewed menu groups and Base UI trigger composition", async () => {
    for (const runtime of [".agents", ".cursor", ".claude"]) {
      const source = await readFile(
        path.join(root, runtime, "skills", example),
        "utf8",
      );
      expect(menuShape(source)).toEqual({
        labels: 1,
        triggers: 2,
        problems: [],
      });
      expect(hash(source)).toBe(approvedHash);
    }
  });

  it("restores the reviewed correction after raw refresh and remains idempotent", async () => {
    const unrelated = "\n// Preserve unrelated upstream content.\n";
    const directory = await fixture((await originalExample()) + unrelated);
    for (let pass = 0; pass < 2; pass++) {
      const result = sync(directory);
      expect(result.status, result.stdout + result.stderr).toBe(0);
      for (const runtime of [".agents", ".cursor", ".claude"]) {
        const source = await readFile(
          path.join(directory, runtime, "skills", example),
          "utf8",
        );
        expect(source.endsWith(unrelated)).toBe(true);
        expect(hash(source.slice(0, -unrelated.length))).toBe(approvedHash);
        expect(menuShape(source)).toEqual({
          labels: 1,
          triggers: 2,
          problems: [],
        });
      }
    }
  });

  it("rejects unexpected drift without partially rewriting the ecosystem source", async () => {
    const source = (await originalExample()).replace(
      "Copy user ID",
      "Copy current ID",
    );
    const directory = await fixture(source);
    const result = sync(directory);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("review upstream drift");
    expect(
      await readFile(path.join(directory, ".agents/skills", example), "utf8"),
    ).toBe(source);
  });

  it("detects removed Groups and reintroduced asChild in the copied example", async () => {
    const source = await readFile(
      path.join(root, ".agents/skills", example),
      "utf8",
    );
    const bare = source
      .replace("<DropdownMenuGroup>", "<>")
      .replace("</DropdownMenuGroup>", "</>");
    expect(menuShape(bare).problems).toContain("label outside Group");
    const obsolete = source.replace(
      "<DropdownMenuTrigger",
      "<DropdownMenuTrigger asChild",
    );
    expect(menuShape(obsolete).problems).toContain("obsolete asChild");
  });
});
