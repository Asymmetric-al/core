import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import ts from "typescript";
import { describe, expect, it } from "vitest";

const sourceRoot = process.cwd();
function parse(file: string) {
  return ts.createSourceFile(
    file,
    readFileSync(resolve(sourceRoot, file), "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
}
function walkFiles(directory: string): string[] {
  return readdirSync(resolve(sourceRoot, directory), {
    withFileTypes: true,
  }).flatMap((entry) => {
    if (entry.name.startsWith(".") || entry.name === "node_modules") return [];
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory()
      ? walkFiles(path)
      : path.endsWith(".tsx")
        ? [path]
        : [];
  });
}

describe("Base UI overlay consumer semantics", () => {
  it("keeps every dropdown label in the group that owns its section", () => {
    const invalid: string[] = [];
    for (const file of [...walkFiles("apps"), ...walkFiles("packages")]) {
      if (file.endsWith("/menubar.tsx")) continue;
      const source = parse(file);
      function visit(node: ts.Node) {
        if (
          (ts.isJsxElement(node) &&
            node.openingElement.tagName.getText(source) ===
              "DropdownMenuLabel") ||
          (ts.isJsxSelfClosingElement(node) &&
            node.tagName.getText(source) === "DropdownMenuLabel")
        ) {
          let parent: ts.Node | undefined = node.parent;
          while (
            parent &&
            !(
              ts.isJsxElement(parent) &&
              ["DropdownMenuGroup", "DropdownMenuRadioGroup"].includes(
                parent.openingElement.tagName.getText(source),
              )
            )
          )
            parent = parent.parent;
          if (
            !parent ||
            !/<DropdownMenu(?:Item|CheckboxItem|RadioItem|SubTrigger)\b/.test(
              parent.getText(source),
            )
          )
            invalid.push(
              `${file}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1}`,
            );
        }
        ts.forEachChild(node, visit);
      }
      visit(source);
    }
    expect(invalid).toEqual([]);
  });

  it("names icon-only popup triggers throughout product sources", () => {
    const invalid: string[] = [];
    for (const file of [...walkFiles("apps"), ...walkFiles("packages")]) {
      const source = parse(file);
      function visit(node: ts.Node) {
        const opening = ts.isJsxElement(node)
          ? node.openingElement
          : ts.isJsxSelfClosingElement(node)
            ? node
            : null;
        if (
          opening &&
          /^(DropdownMenu|Dialog|Sheet|Popover|Drawer|Tooltip)Trigger$/.test(
            opening.tagName.getText(source),
          )
        ) {
          const render = opening.attributes.properties.find(
            (attribute): attribute is ts.JsxAttribute =>
              ts.isJsxAttribute(attribute) &&
              attribute.name.getText(source) === "render",
          );
          const target =
            render?.initializer && ts.isJsxExpression(render.initializer)
              ? render.initializer.expression
              : null;
          if (target && ts.isJsxElement(target)) {
            const children = target.children.filter(
              (child) => !ts.isJsxText(child) || child.text.trim(),
            );
            if (
              ((children.length === 1 &&
                ts.isJsxSelfClosingElement(children[0]!) &&
                /^(MoreHorizontal(?:Icon)?|ArrowDownUp|Filter)$/.test(
                  children[0]!.tagName.getText(source),
                )) ||
                target
                  .getText(source)
                  .includes('className="hidden sm:inline capitalize"')) &&
              !/aria-label(?:ledby)?=/.test(opening.getText(source))
            )
              invalid.push(
                `${file}:${source.getLineAndCharacterOfPosition(opening.getStart()).line + 1}`,
              );
          }
        }
        ts.forEachChild(node, visit);
      }
      visit(source);
    }
    expect(invalid).toEqual([]);
  });

  it.each([
    "apps/admin/app/(app)/pdf/page-client.tsx",
    "apps/admin/app/(app)/feed/content-moderation-sections.tsx",
    "apps/missionary/app/profile/profile-primitives.tsx",
    "packages/ui/components/shadcn-studio/blocks/hero-section-09/hero-section-09.tsx",
  ])("names tooltip controls independently of visual hints in %s", (file) => {
    const source = parse(file);
    const unnamed: number[] = [];
    function visit(node: ts.Node) {
      const opening = ts.isJsxElement(node)
        ? node.openingElement
        : ts.isJsxSelfClosingElement(node)
          ? node
          : null;
      if (
        opening?.tagName.getText(source) === "TooltipTrigger" &&
        !/aria-label(?:ledby)?=/.test(opening.getText(source))
      )
        unnamed.push(
          source.getLineAndCharacterOfPosition(opening.getStart()).line + 1,
        );
      ts.forEachChild(node, visit);
    }
    visit(source);
    expect(unnamed).toEqual([]);
  });
});
