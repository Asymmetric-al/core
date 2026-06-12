import { readFileSync } from "node:fs";
import path from "node:path";

import { glob } from "glob";
import { describe, expect, it } from "vitest";

/**
 * Base UI menu items activate via `onClick`. Radix's `onSelect` prop does not
 * exist on Base UI `Menu.Item`; because `onSelect` is also a valid DOM
 * attribute, passing it type-checks silently and the handler simply never
 * fires. This guard fails the build when a Radix-era `onSelect` is attached
 * to a menu item so the regression class from the Radix → Base UI migration
 * cannot return.
 */

const MENU_ITEM_ONSELECT = new RegExp(
  "<(?:DropdownMenu|ContextMenu|Menubar)" +
    "(?:Item|CheckboxItem|RadioItem)\\b[^>]*?\\bonSelect=",
  "s",
);

const SOURCE_GLOBS = [
  "apps/*/app/**/*.tsx",
  "apps/*/features/**/*.tsx",
  "apps/*/components/**/*.tsx",
  "apps/*/src/**/*.tsx",
  "packages/*/components/**/*.tsx",
];

const repoRoot = path.resolve(__dirname, "../../../..");

describe("Base UI menu item handlers", () => {
  it("no menu item uses the Radix-era onSelect prop (use onClick)", async () => {
    const files = await glob(SOURCE_GLOBS, {
      cwd: repoRoot,
      ignore: ["**/node_modules/**"],
      absolute: true,
    });

    expect(files.length).toBeGreaterThan(0);

    const offenders: string[] = [];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      if (!source.includes("onSelect=")) {
        continue;
      }
      // Check each JSX opening tag individually so an onSelect on a sibling
      // element (e.g. cmdk CommandItem) does not false-positive.
      const tags = source.match(/<[A-Z][A-Za-z]*\b[^>]*>/gs) ?? [];
      for (const tag of tags) {
        if (MENU_ITEM_ONSELECT.test(tag)) {
          offenders.push(path.relative(repoRoot, file));
          break;
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
