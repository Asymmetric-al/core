import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const shared = path.resolve(root, "../../packages/ui");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

function sources(directory: string): string[] {
  return readdirSync(path.join(root, directory), {
    withFileTypes: true,
  }).flatMap((entry) => {
    const file = `${directory}/${entry.name}`;
    if (entry.isDirectory()) return sources(file);
    return /\.tsx?$/.test(entry.name) ? [file] : [];
  });
}

const isFile = (file: string) =>
  statSync(file, { throwIfNoEntry: false })?.isFile() ?? false;

/** The file a module specifier names, for the shared package and inside it. */
function sharedFile(from: string, specifier: string): string | null {
  const base = /^@asym\/ui(?:\/|$)/.test(specifier)
    ? path.join(shared, specifier.slice("@asym/ui".length))
    : specifier.startsWith(".") && from.startsWith(shared)
      ? path.resolve(path.dirname(from), specifier)
      : null;
  if (!base) return null;
  return (
    [
      base,
      `${base}.tsx`,
      `${base}.ts`,
      path.join(base, "index.ts"),
      path.join(base, "index.tsx"),
    ].find(isFile) ?? null
  );
}

const specifiers = (source: string) =>
  [...source.matchAll(/\b(?:from|import)\s*\(?\s*["']([^"']+)["']/g)].flatMap(
    (match) => (match[1] ? [match[1]] : []),
  );

/**
 * Every shared `@asym/ui` module the Console loads, directly or through
 * another shared module. A specifier that names the shared package and does
 * not resolve fails here instead of being skipped.
 */
function sharedModules(entries: string[]): string[] {
  const seen = new Set<string>();
  const queue = entries.map((file) => path.join(root, file));
  for (let file = queue.pop(); file; file = queue.pop()) {
    if (!/\.tsx?$/.test(file)) continue;
    for (const specifier of specifiers(readFileSync(file, "utf8"))) {
      const target = sharedFile(file, specifier);
      if (!target) {
        if (specifier.startsWith("@asym/ui"))
          throw new Error(`${specifier} (from ${file}) did not resolve`);
        continue;
      }
      if (seen.has(target)) continue;
      seen.add(target);
      queue.push(target);
    }
  }
  return [...seen].map((file) =>
    path.relative(shared, file).replaceAll(path.sep, "/"),
  );
}

/**
 * Source contracts for the App Router shell. The rendered behavior (the icon
 * is linked and served, an unknown address shows the not-found page and leads
 * back) is exercised by tests/e2e/console.spec.ts.
 */
describe("application shell conventions", () => {
  it("provides an app icon through the App Router icon convention", () => {
    const icon = read("src/app/icon.svg");
    expect(icon).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    expect(icon).toContain("<title");
    expect(icon).toContain("Core Factory Console");
    // A static mark only: nothing a browser would fetch or run.
    expect(icon).not.toMatch(/<script|href=|url\(|<image|<foreignObject/i);
  });

  it("provides a root not-found page whose only action is a link back to the Console", () => {
    const page = read("src/app/not-found.tsx");
    expect(page).toMatch(/export default function \w+\(\)/);
    expect(page).toContain("<h1");
    expect(page).toContain("Console page not found");
    expect(page.match(/<Link\b/g)).toHaveLength(1);
    expect(page).toContain('<Link href="/">Open the Factory Console</Link>');
    // It reads nothing and runs no control: a server component with no hook,
    // fetch, button or form.
    expect(page).not.toMatch(
      /"use client"|\buse[A-Z]\w*\(|fetch\(|<Button\b|<form\b|onClick/,
    );
  });
});

/**
 * Deliberate omissions (README "Deliberate omissions"; recorded as product
 * decisions in tooling/shadscan/findings.json, which binds this file's hash).
 * These tests pin what is built, not who approved it: the README states
 * whether the owner has ratified each decision. Changing any of these is a
 * product decision: update the README and the Shadscan ledger with it.
 */
describe("deliberate omissions of the private operator Console", () => {
  const files = sources("src");
  const manifest = JSON.parse(read("package.json")) as {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  const installed = Object.keys({
    ...manifest.dependencies,
    ...manifest.devDependencies,
  });

  it("is never published: noindex metadata and no social preview", () => {
    const layout = read("src/app/layout.tsx");
    expect(layout).toMatch(
      /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/,
    );
    expect(layout).not.toMatch(/openGraph|twitter/);
    expect(
      readdirSync(path.join(root, "src/app")).filter((name) =>
        /^(?:opengraph|twitter)-image\./.test(name),
      ),
    ).toEqual([]);
  });

  it("has no toast channel: results stay inline as receipts", () => {
    expect(
      installed.filter((name) =>
        ["sonner", "react-hot-toast", "@radix-ui/react-toast"].includes(name),
      ),
    ).toEqual([]);
    for (const file of files)
      expect(read(file), file).not.toMatch(/\bToaster\b|\btoast\s*[.(]|sonner/);
    // The inline channel that replaces it: a polite live receipt.
    expect(read("src/components/controls.tsx")).toMatch(
      /export function ReceiptView[\s\S]{0,200}aria-live="polite"/,
    );
  });

  it("loads no shared component that raises a toast, so no message is dropped", () => {
    const modules = sharedModules(files);
    // The walk follows re-exports into the shared package (the theme toggle
    // is reached through its shadcn re-export) and never reaches the Toaster.
    expect(modules).toContain("components/shadcn/theme-toggle.tsx");
    expect(modules).toContain("components/primitives/theme-toggle.tsx");
    expect(modules).toContain("components/shadcn/switch.tsx");
    expect(modules).not.toContain("components/shadcn/sonner.tsx");
    expect(
      modules.filter((file) =>
        /["']sonner["']|\btoast\s*[.(]/.test(
          readFileSync(path.join(shared, file), "utf8"),
        ),
      ),
    ).toEqual([]);
  });

  it("registers no global keyboard shortcut, dark mode included, and mounts no command menu", () => {
    for (const file of files) {
      const source = read(file);
      // Window or document key listeners and hotkey libraries; a key handler
      // on one focused field would not be a global shortcut.
      expect(source, file).not.toMatch(
        /addEventListener\(\s*["']key(?:down|up|press)["']|useHotkeys|hotkeys/i,
      );
      expect(source, file).not.toMatch(/\bCommand(?:Dialog|Input|Menu)\b|cmdk/);
    }
    expect(installed.filter((name) => /cmdk|hotkeys/i.test(name))).toEqual([]);
    // Theme and sections are reached through visible, labeled controls.
    const shell = read("src/components/console.tsx");
    expect(shell).toContain("<ThemeToggle />");
    expect(shell).toContain('<TabsList aria-label="Console sections">');
  });
});
