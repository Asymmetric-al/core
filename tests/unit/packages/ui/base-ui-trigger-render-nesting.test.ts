import { readFileSync } from "node:fs";
import path from "node:path";

import { glob } from "glob";
import { describe, expect, it } from "vitest";

/**
 * Base UI trigger components use the `render` prop to supply the clickable
 * element. Content placed as JSX children between opening/closing trigger tags
 * is ignored at runtime, so icons and labels silently disappear after the Radix
 * → Base UI migration. Triggers with `render=` must self-close.
 */

const TRIGGER_NAMES = [
  "DropdownMenuTrigger",
  "ContextMenuTrigger",
  "MenubarTrigger",
  "PopoverTrigger",
  "TooltipTrigger",
  "SheetTrigger",
  "DialogTrigger",
  "AlertDialogTrigger",
  "HoverCardTrigger",
  "NavigationMenuTrigger",
  "CollapsibleTrigger",
  "AccordionTrigger",
  "DrawerTrigger",
] as const;

const SOURCE_GLOBS = [
  "apps/*/app/**/*.tsx",
  "apps/*/features/**/*.tsx",
  "apps/*/components/**/*.tsx",
  "apps/*/src/**/*.tsx",
  "packages/*/components/**/*.tsx",
];

const repoRoot = path.resolve(__dirname, "../../../..");

function stripRenderProp(block: string): string {
  const renderIndex = block.search(/\brender\s*=/);
  if (renderIndex === -1) {
    return block;
  }

  const afterRender = block.slice(renderIndex);
  const valueStart = afterRender.indexOf("=") + 1;
  const trimmed = afterRender.slice(valueStart).trimStart();

  if (trimmed.startsWith("{")) {
    let depth = 0;
    for (let index = 0; index < trimmed.length; index += 1) {
      const char = trimmed[index];
      if (char === "{") {
        depth += 1;
      } else if (char === "}") {
        depth -= 1;
        if (depth === 0) {
          return (
            block.slice(0, renderIndex) + trimmed.slice(index + 1).trimStart()
          );
        }
      }
    }
    return block;
  }

  const selfClosingElement = trimmed.match(/^<[^>]+\/>/);
  if (selfClosingElement) {
    return (
      block.slice(0, renderIndex) + trimmed.slice(selfClosingElement[0].length)
    );
  }

  return block;
}

function hasTriggerRenderNestingBug(
  source: string,
  triggerName: (typeof TRIGGER_NAMES)[number],
): boolean {
  const closeTag = `</${triggerName}>`;
  if (!source.includes(closeTag)) {
    return false;
  }

  let searchFrom = 0;
  while (searchFrom < source.length) {
    const closeIndex = source.indexOf(closeTag, searchFrom);
    if (closeIndex === -1) {
      break;
    }

    const openIndex = source.lastIndexOf(`<${triggerName}`, closeIndex);
    if (openIndex === -1) {
      break;
    }

    const block = source.slice(openIndex, closeIndex + closeTag.length);
    if (!/\brender\s*=/.test(block)) {
      searchFrom = closeIndex + closeTag.length;
      continue;
    }

    const withoutRender = stripRenderProp(block);
    const childContent = withoutRender.match(
      new RegExp(`^<${triggerName}\\b[^>]*>([\\s\\S]*)<\\/${triggerName}>$`),
    )?.[1];

    if (childContent?.trim()) {
      return true;
    }

    searchFrom = closeIndex + closeTag.length;
  }

  return false;
}

describe("Base UI trigger render nesting", () => {
  it("no trigger with render= leaves content outside the render element", async () => {
    const files = await glob(SOURCE_GLOBS, {
      cwd: repoRoot,
      ignore: ["**/node_modules/**"],
      absolute: true,
    });

    expect(files.length).toBeGreaterThan(0);

    const offenders: string[] = [];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      if (!source.includes("render=") || !source.includes("Trigger")) {
        continue;
      }

      for (const triggerName of TRIGGER_NAMES) {
        if (hasTriggerRenderNestingBug(source, triggerName)) {
          offenders.push(`${path.relative(repoRoot, file)} (${triggerName})`);
          break;
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
