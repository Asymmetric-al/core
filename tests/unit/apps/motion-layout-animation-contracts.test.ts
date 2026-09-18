import { readFileSync } from "node:fs";

import { globSync } from "glob";
import { describe, expect, it } from "vitest";

const root = new URL("../../../", import.meta.url);

/**
 * Motion props whose object literals are animated by motion/react. Animating
 * a layout property here forces the browser to re-run layout every frame
 * (`docs/ai/skills/anim/SKILL.md` rules 15-16, `docs/ai/rules/frontend.md`
 * Motion rules). Reveal/collapse UI must use opacity + transform (or the
 * `layout` prop) instead of `height`/`width` sweeps to and from `"auto"`.
 */
const MOTION_PROP_PATTERN =
  /\b(?:initial|animate|exit|whileHover|whileTap|whileFocus|whileInView|variants)=\{\{([\s\S]*?)\}\}/g;

const LAYOUT_PROPERTY_PATTERN =
  /(?:^|[\s,{])(height|width|minHeight|maxHeight|minWidth|maxWidth|margin(?:Top|Bottom|Left|Right)?|padding(?:Top|Bottom|Left|Right)?|top|right|bottom|left|inset)\s*:/;

function componentFiles() {
  return globSync("{apps,packages}/**/*.tsx", {
    cwd: root,
    nodir: true,
    windowsPathsNoEscape: true,
    ignore: [
      "**/.next/**",
      "**/coverage/**",
      "**/dist/**",
      "**/node_modules/**",
    ],
  })
    .map((path) => path.replaceAll("\\", "/"))
    .sort();
}

function findLayoutPropertyAnimations(path: string): string[] {
  const source = readFileSync(new URL(path, root), "utf8");
  const findings: string[] = [];

  for (const match of source.matchAll(MOTION_PROP_PATTERN)) {
    const layoutProperty = match[1]?.match(LAYOUT_PROPERTY_PATTERN)?.[1];
    if (!layoutProperty) continue;
    const line = source.slice(0, match.index).split("\n").length;
    findings.push(`${path}:${line} animates ${layoutProperty}`);
  }

  return findings;
}

describe("motion layout-property animation contract", () => {
  it("does not animate layout properties through motion/react props in first-party UI", () => {
    const findings = componentFiles().flatMap(findLayoutPropertyAnimations);

    expect(findings).toEqual([]);
  });
});
