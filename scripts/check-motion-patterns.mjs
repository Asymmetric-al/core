#!/usr/bin/env node
/**
 * Motion contract guard.
 *
 * Flags two anti-patterns documented in `docs/ai/skills/anim/SKILL.md`
 * and the Motion section of `docs/ai/rules/frontend.md`:
 *
 *   1. `transition-all` (or `transition: all`) — should be an explicit
 *      property list (`transition-[transform,box-shadow]`, etc).
 *   2. Ungated `hover:scale-*` / `group-hover:scale-*` — must be
 *      wrapped in `@media (hover: hover) and (pointer: fine)`. Easiest
 *      path: use the shared `.hover-lift` / `.hover-scale-subtle`
 *      utilities.
 *   3. motion/react props (`initial`, `animate`, `exit`, `while*`,
 *      `variants`) that animate a layout property such as `height`,
 *      `width`, margins, padding, or offsets — including inline objects,
 *      named bindings, and ternary object literals. These re-run layout
 *      every frame. Use opacity + transform (or the `layout` prop)
 *      instead.
 *
 * Usage:
 *   node scripts/check-motion-patterns.mjs              # scan the whole repo (apps/**, packages/**)
 *   node scripts/check-motion-patterns.mjs file [...]   # scan only the given files
 *
 * Exits non-zero on violations. Skips `vendor/`, `node_modules/`,
 * `.next/`, `.next-docs/`, `.cursor/skills`, `.agents/skills`, the
 * skill source under `docs/`, and lockfiles.
 */

import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import path from "node:path";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));

const IGNORE_PREFIXES = [
  "vendor/",
  "node_modules/",
  ".next/",
  ".next-docs/",
  ".cursor/skills/",
  ".agents/skills/",
  "docs/ai/skills/",
  "docs/ai/rules/frontend.md",
  "scripts/check-motion-patterns.mjs",
];

const SCAN_EXTS = ["ts", "tsx", "js", "jsx", "mdx", "css"];
const SCAN_GLOBS = [];
for (const root of ["apps", "packages"]) {
  for (const ext of SCAN_EXTS) {
    SCAN_GLOBS.push(`${root}/**/*.${ext}`);
  }
}

const TRANSITION_ALL =
  /(?:^|[^\w-])transition-all\b|(?<![\w-])transition:\s*all\b/g;
const UNGATED_HOVER_SCALE =
  /(?<![\w[(])(?:group-)?hover:scale-(?:\[[^\]]+\]|\d+)/g;
const HOVER_GATE_LITERAL = "hover:hover";
const HOVER_GATE_REGEX =
  /@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)/;
const MOTION_PROP_ASSIGNMENT =
  /(?<![.\w])(?:initial|animate|exit|whileHover|whileTap|whileFocus|whileInView|whileDrag|variants)=\{/g;
const LAYOUT_PROPERTY =
  /(?:^|[\s,{])(height|width|minHeight|maxHeight|minWidth|maxWidth|margin(?:Top|Bottom|Left|Right)?|padding(?:Top|Bottom|Left|Right)?|top|right|bottom|left|inset)\s*:/;
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
const JS_LITERALS = new Set(["true", "false", "null", "undefined"]);

function shouldScan(rel) {
  return !IGNORE_PREFIXES.some((p) => rel.startsWith(p));
}

export function listScanTargets() {
  const out = spawnSync("git", ["ls-files", "--", ...SCAN_GLOBS], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (out.status !== 0) {
    throw new Error(out.stderr || "git ls-files failed");
  }
  return out.stdout.split("\n").filter(Boolean).filter(shouldScan);
}

function listMatchingFiles() {
  try {
    return listScanTargets();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function lineNumberFor(content, idx) {
  return content.slice(0, idx).split("\n").length;
}

async function isFile(filepath) {
  try {
    return (await stat(filepath)).isFile();
  } catch {
    return false;
  }
}

/**
 * Replace block comments (CSS / JS / MDX) and line comments (JS) with
 * spaces so line numbers stay stable but matches inside comments are
 * dropped. Also strips JSDoc-style `*` comment continuations on lines
 * that begin with whitespace + `*` (CSS multi-line comment bodies).
 */
function stripComments(text) {
  let out = text;
  // /* ... */ block comments — keep newlines so line numbers match.
  out = out.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  // // ... line comments (JS/TS only — harmless on CSS since `//` isn't valid CSS).
  out = out.replace(/\/\/[^\n]*/g, (m) => " ".repeat(m.length));
  return out;
}

function extractBalanced(text, openIndex) {
  if (text[openIndex] !== "{") return null;
  let depth = 0;
  for (let index = openIndex; index < text.length; index += 1) {
    const char = text[index];
    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return {
          end: index,
          content: text.slice(openIndex + 1, index),
        };
      }
    }
  }
  return null;
}

function findObjectLiteralContents(text) {
  const contents = [];
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] !== "{") continue;
    const extracted = extractBalanced(text, index);
    if (!extracted) break;
    contents.push(extracted.content);
  }
  return contents;
}

function findNamedBindingContents(text, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const binding = new RegExp(
    `(?:(?:const|let|var)\\s+)?\\b${escaped}\\s*=\\s*\\{`,
    "g",
  );
  const contents = [];
  let match;
  while ((match = binding.exec(text)) !== null) {
    const extracted = extractBalanced(text, match.index + match[0].length - 1);
    if (extracted) contents.push(extracted.content);
  }
  return contents;
}

function objectsForMotionExpr(text, expr) {
  const trimmed = expr.trim();
  if (trimmed.startsWith("{")) return [trimmed];
  if (IDENTIFIER.test(trimmed)) return findNamedBindingContents(text, trimmed);

  const objects = findObjectLiteralContents(trimmed);
  for (const ident of trimmed.match(/\b[A-Za-z_$][\w$]*\b/g) ?? []) {
    if (JS_LITERALS.has(ident)) continue;
    objects.push(...findNamedBindingContents(text, ident));
  }
  return objects;
}

function collectMotionLayoutViolations(rel, text) {
  const violations = [];
  if (!rel.endsWith(".tsx") && !rel.endsWith(".jsx")) return violations;

  MOTION_PROP_ASSIGNMENT.lastIndex = 0;
  let match;
  while ((match = MOTION_PROP_ASSIGNMENT.exec(text)) !== null) {
    const extracted = extractBalanced(text, match.index + match[0].length - 1);
    if (!extracted) continue;

    let layoutProperty = null;
    for (const objectText of objectsForMotionExpr(text, extracted.content)) {
      layoutProperty = objectText.match(LAYOUT_PROPERTY)?.[1] ?? null;
      if (layoutProperty) break;
    }
    if (!layoutProperty) continue;

    violations.push({
      file: rel,
      line: lineNumberFor(text, match.index),
      kind: "motion-layout-property",
      hint:
        `Animating \`${layoutProperty}\` forces layout every frame. Reveal with ` +
        "opacity + y/scale, collapse siblings with the `layout` prop, and keep " +
        'height/width sweeps to and from "auto" out of motion props.',
    });
  }

  return violations;
}

export function scanMotionSource(rel, raw) {
  const text = stripComments(raw);
  const violations = [];
  TRANSITION_ALL.lastIndex = 0;
  UNGATED_HOVER_SCALE.lastIndex = 0;
  MOTION_PROP_ASSIGNMENT.lastIndex = 0;

  // 1. transition-all
  let m;
  while ((m = TRANSITION_ALL.exec(text)) !== null) {
    violations.push({
      file: rel,
      line: lineNumberFor(text, m.index),
      kind: "transition-all",
      hint:
        "Use an explicit property list (e.g. transition-[transform,box-shadow]) " +
        "or one of the shared utilities (.press-feedback, .hover-lift, .hover-scale-subtle).",
    });
  }

  // 2. ungated hover:scale
  const fileHasHoverGate =
    HOVER_GATE_REGEX.test(text) || text.includes(HOVER_GATE_LITERAL);
  while ((m = UNGATED_HOVER_SCALE.exec(text)) !== null) {
    // Allow a class chain that contains the arbitrary variant gate
    // immediately before the (group-)hover utility, e.g.
    // [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.02]
    const before = text.slice(Math.max(0, m.index - 80), m.index);
    if (before.includes(HOVER_GATE_LITERAL)) continue;
    // Allow the file-level gate (e.g. globals.css utilities)
    if (fileHasHoverGate) continue;
    violations.push({
      file: rel,
      line: lineNumberFor(text, m.index),
      kind: "ungated-hover-scale",
      hint:
        "Wrap with @media (hover: hover) and (pointer: fine) — easiest path " +
        "is the shared .hover-scale-subtle / .hover-lift utility, or " +
        "[@media(hover:hover)_and_(pointer:fine)]: prefix on the Tailwind class.",
    });
  }

  // 3. motion props animating layout properties
  violations.push(...collectMotionLayoutViolations(rel, text));

  return violations;
}

async function scanFile(rel) {
  const abs = path.join(repoRoot, rel);
  if (!(await isFile(abs))) return [];
  const raw = await readFile(abs, "utf8");
  return scanMotionSource(rel, raw);
}

async function main() {
  const argv = process.argv.slice(2);
  let targets;
  if (argv.length > 0) {
    targets = argv
      .map((a) => path.relative(repoRoot, path.resolve(a)))
      .filter(shouldScan);
  } else {
    targets = listMatchingFiles();
  }

  const all = [];
  for (const rel of targets) {
    const v = await scanFile(rel);
    if (v.length) all.push(...v);
  }

  if (all.length === 0) {
    console.log(`motion guard: clean (${targets.length} files scanned)`);
    return;
  }

  // Group by file for readable output.
  const byFile = new Map();
  for (const v of all) {
    if (!byFile.has(v.file)) byFile.set(v.file, []);
    byFile.get(v.file).push(v);
  }

  console.error("motion guard: violations found\n");
  for (const [file, vs] of byFile) {
    console.error(`  ${file}`);
    for (const v of vs) {
      console.error(`    line ${v.line}  ${v.kind}`);
      console.error(`      ${v.hint}`);
    }
    console.error("");
  }
  console.error(
    `motion guard: ${all.length} violation(s) across ${byFile.size} file(s).`,
  );
  console.error(
    "see docs/ai/skills/anim/SKILL.md (Repo motion standard) for the contract.",
  );
  process.exit(1);
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
