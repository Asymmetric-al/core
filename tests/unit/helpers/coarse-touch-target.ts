import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { compile } from "tailwindcss";

interface CssNode {
  type: string;
  selector?: string;
  name?: string;
  params?: string;
  prop?: string;
  value?: string;
  parent?: CssNode;
  walkDecls(callback: (decl: CssNode) => void): void;
}

export interface TouchTargetSizes {
  minWidth: number;
  minHeight: number;
}

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const rootRequire = createRequire(path.join(repoRoot, "package.json"));
const postcss = createRequire(rootRequire.resolve("@tailwindcss/postcss"))(
  "postcss",
) as { parse(css: string): CssNode };
const globals = postcss.parse(
  readFileSync(path.join(repoRoot, "packages/ui/styles/globals.css"), "utf8"),
);

let compiler: ReturnType<typeof compile> | undefined;

function tailwind() {
  compiler ??= compile('@import "tailwindcss";', {
    base: repoRoot,
    loadStylesheet: async (id, base) => {
      const file = id.startsWith(".")
        ? path.resolve(base, id)
        : rootRequire.resolve(
            id === "tailwindcss" ? "tailwindcss/index.css" : id,
          );
      return {
        path: file,
        base: path.dirname(file),
        content: readFileSync(file, "utf8"),
      };
    },
  });
  return compiler;
}

function context(decl: CssNode) {
  const media: string[] = [];
  const selectors: string[] = [];
  for (let node = decl.parent; node && node.type !== "root";) {
    if (node.type === "atrule" && node.name === "media")
      media.push(node.params ?? "");
    if (node.type === "rule") selectors.unshift(node.selector ?? "");
    node = node.parent;
  }
  let selector = "";
  for (const part of selectors)
    selector = !selector
      ? part
      : part.includes("&")
        ? part.replaceAll("&", `:is(${selector})`)
        : `${selector} ${part}`;
  return { selector, coarse: media.some((m) => m.includes("pointer: coarse")) };
}

function matches(element: Element, selector: string) {
  try {
    return element.matches(selector);
  } catch {
    // Pseudo-element selectors (scrollbars, file buttons) never match an element.
    return false;
  }
}

/**
 * The largest min-width and min-height declared for `target` by the shared
 * stylesheet and the Tailwind classes on it and its ancestors (up to
 * `scope`): `coarse` counts rules inside a `pointer: coarse` query, `fine`
 * every other rule. It does not model the cascade, so a later, smaller
 * declaration is not seen; the Base UI compliance suite measures the real box.
 */
export async function touchTargetSizes(
  target: Element,
  scope: Element,
): Promise<{ coarse: TouchTargetSizes; fine: TouchTargetSizes }> {
  const classes = new Set<string>();
  for (let node: Element | null = target; node; node = node.parentElement) {
    node.classList.forEach((name) => classes.add(name));
    if (node === scope) break;
  }
  const utilities = postcss.parse((await tailwind()).build([...classes]));
  const tokens = new Map<string, string>();
  for (const sheet of [globals, utilities])
    sheet.walkDecls((decl) => {
      if (decl.prop?.startsWith("--")) tokens.set(decl.prop, decl.value ?? "");
    });
  const toPx = (raw: string): number => {
    const value = raw.trim();
    const token = /^var\((--[\w-]+)\)$/.exec(value);
    if (token) return toPx(tokens.get(token[1]!) ?? "");
    const spacing = /^calc\(var\(--spacing\) \* ([\d.]+)\)$/.exec(value);
    if (spacing)
      return toPx(tokens.get("--spacing") ?? "") * Number(spacing[1]);
    const length = /^([\d.]+)(px|rem)$/.exec(value);
    if (length) return Number(length[1]) * (length[2] === "rem" ? 16 : 1);
    if (value === "0") return 0;
    throw new Error(`Unsupported length: "${raw}"`);
  };

  const sizes = {
    coarse: { minWidth: 0, minHeight: 0 },
    fine: { minWidth: 0, minHeight: 0 },
  };
  for (const sheet of [globals, utilities])
    sheet.walkDecls((decl) => {
      const key =
        decl.prop === "min-width"
          ? "minWidth"
          : decl.prop === "min-height"
            ? "minHeight"
            : null;
      if (!key) return;
      const { selector, coarse } = context(decl);
      if (!selector || !matches(target, selector)) return;
      const bucket = coarse ? sizes.coarse : sizes.fine;
      bucket[key] = Math.max(bucket[key], toPx(decl.value ?? ""));
    });
  return sizes;
}
