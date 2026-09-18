import { readFileSync } from "node:fs";

import { globSync } from "glob";
import {
  ScriptKind,
  ScriptTarget,
  createSourceFile,
  forEachChild,
  isCallExpression,
  isIdentifier,
  isPropertyAccessExpression,
  isStringLiteralLike,
} from "typescript";
import { describe, expect, it } from "vitest";

import type { Node } from "typescript";

const root = new URL("../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

function sourceFiles() {
  return globSync("{apps,packages}/**/*.{ts,tsx}", {
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

function sourceComponentFiles() {
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

function blankWindowOpenCalls() {
  const calls: Array<{
    features: string | null;
    line: number;
    path: string;
  }> = [];

  for (const path of sourceFiles()) {
    const source = readRepoFile(path);
    const sourceFile = createSourceFile(
      path,
      source,
      ScriptTarget.Latest,
      true,
      path.endsWith(".tsx") ? ScriptKind.TSX : ScriptKind.TS,
    );

    const visit = (node: Node) => {
      if (
        isCallExpression(node) &&
        isPropertyAccessExpression(node.expression) &&
        isIdentifier(node.expression.expression) &&
        node.expression.expression.text === "window" &&
        node.expression.name.text === "open"
      ) {
        const [, target, features] = node.arguments;

        if (target && isStringLiteralLike(target) && target.text === "_blank") {
          const { line } = sourceFile.getLineAndCharacterOfPosition(
            node.getStart(sourceFile),
          );
          calls.push({
            features:
              features && isStringLiteralLike(features) ? features.text : null,
            line: line + 1,
            path,
          });
        }
      }

      forEachChild(node, visit);
    };

    visit(sourceFile);
  }

  return calls;
}

describe("React Doctor config contracts", () => {
  it("does not keep react/no-danger globally ignored when first-party source has no runtime dangerous HTML assignments", () => {
    const config = JSON.parse(readRepoFile("doctor.config.json")) as {
      ignore?: { rules?: string[] };
    };

    const dangerousHtmlAssignments = sourceFiles().filter((path) => {
      const source = readRepoFile(path);
      return /dangerouslySetInnerHTML\s*=/.test(source);
    });

    expect(dangerousHtmlAssignments).toEqual([]);
    expect(config.ignore?.rules ?? []).not.toContain("react/no-danger");
  });

  it("keeps the only raw img usage limited to the documented Tiptap NodeView exception", () => {
    const rawImgFiles = sourceComponentFiles().filter((path) => {
      const source = readRepoFile(path);
      return /<img\b/.test(source);
    });

    expect(rawImgFiles).toEqual([
      "packages/ui/components/shadcn/rich-text-editor/image-view.tsx",
    ]);

    const imageViewSource = readRepoFile(rawImgFiles[0]);
    expect(imageViewSource).toContain(
      "Intentional raw img: TipTap needs a DOM ref",
    );
  });

  it("protects every first-party _blank window.open from opener access", () => {
    const calls = blankWindowOpenCalls();
    const unprotectedCalls = calls.filter(({ features }) => {
      const featureSet = new Set(
        (features ?? "").split(",").map((feature) => feature.trim()),
      );
      return !featureSet.has("noopener") || !featureSet.has("noreferrer");
    });

    expect(calls.length).toBeGreaterThan(0);
    expect(unprotectedCalls).toEqual([]);
  });
});
