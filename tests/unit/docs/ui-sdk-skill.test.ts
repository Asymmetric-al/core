import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const skillDir = "docs/ai/skills/ui-sdk";
const read = (file: string) =>
  readFileSync(path.join(repoRoot, file), "utf8").replace(/\r\n/g, "\n");

// The SDK installs only for packages/ui (Bun isolated linker), so its bundled
// docs and skill resolve from there, not from the repository root.
const uiRequire = createRequire(
  path.join(repoRoot, "packages/ui/package.json"),
);
const installedCore = path.dirname(
  uiRequire.resolve("@ui-sdk/core/package.json"),
);
const installedReact = path.dirname(
  uiRequire.resolve("@ui-sdk/react/package.json"),
);
const bundledSkill = path.join(installedCore, "skills/ui-sdk");

const scannerMarker = "<!-- pragma: allowlist secret -->";
const changeNotice = /\n\n<!-- Modified by Asymmetric-al\/core: [^\n]*-->\n$/;

function overlayOf(skill: string) {
  const start = skill.indexOf("<!-- CORE-OVERLAY-START -->");
  const end = skill.indexOf("<!-- CORE-OVERLAY-END -->");
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  return skill.slice(start, end);
}

describe("ui-sdk agent skill", () => {
  const skill = read(`${skillDir}/SKILL.md`);
  const overlay = overlayOf(skill);

  it("routes Core UI work to UI SDK only for gaps Base UI leaves", () => {
    const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(skill)?.[1] ?? "";
    expect(frontmatter).toMatch(/^name: ui-sdk$/m);
    const description = /^description: (.+)$/m.exec(frontmatter)?.[1] ?? "";
    expect(description).toMatch(/Base UI/);
    expect(description).toMatch(/@asym\/ui/);
    expect(description).toMatch(/@ui-sdk\/\*/);
    expect(description.length).toBeLessThan(1024);
    expect(frontmatter).not.toMatch(/disable-model-invocation/);

    expect(skill).toContain(
      "[This repository](#this-repository-asymmetric-alcore)",
    );
    expect(overlay).toContain("## This repository (Asymmetric-al/core)");
    expect(overlay).toMatch(
      /Apache-2\.0\)\. Modified by\s+Asymmetric-al\/core/,
    );
    expect(overlay).toContain("does not override these components");
    expect(overlay).toContain("Combobox (including multi-select tag chips)");
    expect(overlay).toMatch(/never mix Base UI and\s+UI SDK/);
  });

  it("points agents at the installed-version docs and the bundled skill", () => {
    // The path agents read is the package link, not Bun's store realpath.
    const llms = "packages/ui/node_modules/@ui-sdk/react/docs/llms.txt";
    expect(existsSync(path.join(repoRoot, llms))).toBe(true);
    expect(readFileSync(path.join(repoRoot, llms), "utf8")).toBe(
      readFileSync(path.join(installedReact, "docs/llms.txt"), "utf8"),
    );
    expect(overlay).toContain(
      "`packages/ui/node_modules/@ui-sdk/react/docs/llms.txt`",
    );
    expect(overlay).toContain(
      "`packages/ui/node_modules/@ui-sdk/core/skills/ui-sdk/`",
    );
    for (const doc of ["core.md", "rendering.md", "server-rendering.md"]) {
      expect(existsSync(path.join(installedReact, "docs", doc)), doc).toBe(
        true,
      );
      expect(overlay).toContain(`docs/${doc}`);
    }
  });

  it("states Core's boundaries over the upstream defaults", () => {
    expect(overlay).toContain("`@ui-sdk/core/web.css`");
    expect(overlay).toContain("`@layer ui-sdk;`");
    expect(overlay).toContain("`packages/ui/components/primitives/<name>.tsx`");
    expect(overlay).toMatch(/never declare or import\s+`@ui-sdk\/\*`/);
    expect(overlay).toMatch(/Never mark a\s+failing test `test\.fails`/);
    expect(overlay).toMatch(/`createAgent`/);
    expect(overlay).toContain("unless the user asks for agent integration");
    expect(overlay).toContain("Never bump it as a side effect");
  });

  it("names a reference implementation and commands that exist", () => {
    const repoPaths = [
      // `docs/<page>.md` without `ai/` names the SDK package's own docs folder.
      ...overlay.matchAll(
        /`((?:packages\/ui|tests|docs\/ai|apps)\/[^`<>*\s]+)`/g,
      ),
    ]
      .map((match) => match[1]!.replace(/\/$/, ""))
      .filter((repoPath) => !repoPath.includes("..."));
    expect(repoPaths).toEqual(
      expect.arrayContaining([
        "packages/ui/components/primitives/rating.tsx",
        "tests/unit/packages/ui/components/primitives/rating.test.tsx",
        "tests/e2e/ui-sdk-rating.spec.ts",
        "tests/e2e/fixtures/ui-sdk-rating.tsx",
      ]),
    );
    for (const repoPath of repoPaths) {
      expect(existsSync(path.join(repoRoot, repoPath)), repoPath).toBe(true);
    }
    const isolated = read("tests/e2e/playwright-isolated.config.ts");
    expect(isolated).toContain('"ui-sdk-rating.spec.ts"');
    expect(read("package.json")).toContain("tests/e2e/ui-sdk-rating.spec.ts");
  });

  it("resolves every relative link in the skill", () => {
    for (const [, target] of skill.matchAll(/\]\(((?!https?:|#)[^)\s]+)\)/g)) {
      const file = target!.split("#")[0]!;
      expect(existsSync(path.join(repoRoot, skillDir, file)), target).toBe(
        true,
      );
    }
  });

  it("matches the skill bundled in the installed @ui-sdk/core release", () => {
    const pins = JSON.parse(read("packages/ui/package.json")).dependencies;
    const provenance = read(`${skillDir}/references/upstream.md`);
    const installedVersion = JSON.parse(
      readFileSync(path.join(installedCore, "package.json"), "utf8"),
    ).version;
    expect(provenance).toContain(
      `npm_package: "@ui-sdk/core@${installedVersion}"`,
    );
    expect(pins["@ui-sdk/core"]).toBe(installedVersion);
    expect(pins["@ui-sdk/react"]).toBe(installedVersion);

    // SKILL.md keeps the upstream body between Core's note and overlay.
    const bundledEntry = readFileSync(
      path.join(bundledSkill, "SKILL.md"),
      "utf8",
    );
    const upstreamBody = bundledEntry.replace(/^---\n[\s\S]*?\n---\n/, "");
    const coreBody = skill
      .slice(0, skill.indexOf("<!-- CORE-OVERLAY-START -->"))
      .replace(/^---\n[\s\S]*?\n---\n/, "")
      .replace(/> \*\*Core:\*\*[^\n]*\n\n/, "")
      .replace(/\n+$/, "\n");
    expect(coreBody).toBe(upstreamBody);

    const bundledReferences = readdirSync(
      path.join(bundledSkill, "references"),
    );
    const vendoredReferences = readdirSync(
      path.join(repoRoot, skillDir, "references"),
    ).filter((file) => file !== "upstream.md");
    expect(vendoredReferences.sort()).toEqual(bundledReferences.sort());
    for (const file of bundledReferences) {
      const vendored = read(`${skillDir}/references/${file}`);
      const modified = vendored.includes(scannerMarker);
      expect(changeNotice.test(vendored), file).toBe(modified);
      const vendoredLines = vendored.replace(changeNotice, "\n").split("\n");
      const upstreamLines = readFileSync(
        path.join(bundledSkill, "references", file),
        "utf8",
      ).split("\n");
      expect(vendoredLines.length, file).toBe(upstreamLines.length);
      vendoredLines.forEach((line, index) => {
        if (!line.includes(scannerMarker)) {
          expect(line, `${file}:${index + 1}`).toBe(upstreamLines[index]);
          return;
        }
        // The scanner trims table padding before the closing pipe.
        const words = (text: string) =>
          text.replace(scannerMarker, "").replace(/\s+/g, " ").trim();
        expect(words(line), `${file}:${index + 1}`).toBe(
          words(upstreamLines[index]!),
        );
      });
    }
    expect(read(`${skillDir}/LICENSE`)).toBe(
      readFileSync(path.join(installedCore, "LICENSE"), "utf8"),
    );
  });

  it("is reachable from the shared UI instructions, rulebook and catalog", () => {
    const sharedUi = read("packages/ui/AGENTS.md");
    expect(sharedUi).toContain("`docs/ai/skills/ui-sdk/SKILL.md`");
    expect(sharedUi).toContain(
      "`packages/ui/node_modules/@ui-sdk/react/docs/llms.txt`",
    );
    expect(read("docs/ai/rules/frontend.md")).toContain("UI SDK");
    expect(read("docs/ai/rules/agent-skill-routing.md")).toContain(
      "`docs/ai/skills/ui-sdk/SKILL.md`",
    );
  });
});
