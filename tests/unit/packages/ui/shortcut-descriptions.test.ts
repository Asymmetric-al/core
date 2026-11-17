import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../../../..");

/** Product files that call the shared shortcut owner. */
function callers() {
  const output = execFileSync(
    "git",
    [
      "grep",
      "-l",
      "--untracked",
      "useShortcut(",
      "--",
      "apps",
      "packages",
      ":!*.test.*",
      ":!packages/ui/components/primitives/shortcut.tsx",
    ],
    { cwd: root, encoding: "utf8" },
  );
  return output.split("\n").filter(Boolean);
}

/** The text of each `useShortcut(...)` call, found by balancing brackets. */
function calls(source: string) {
  const found: string[] = [];
  let from = source.indexOf("useShortcut(");
  while (from !== -1) {
    let depth = 0;
    let end = from + "useShortcut".length;
    for (; end < source.length; end++) {
      const char = source[end];
      if (char === "(" || char === "{" || char === "[") depth++;
      if (char === ")" || char === "}" || char === "]") depth--;
      if (depth === 0) break;
    }
    found.push(source.slice(from, end + 1));
    from = source.indexOf("useShortcut(", end);
  }
  return found;
}

// Matches the whole source, so `\s` crosses the line breaks Prettier adds
// when it wraps a call's arguments.
const KEY_LISTENER =
  /addEventListener\(\s*["'`]key(?:down|up|press)["'`]|\.onkey(?:down|up|press)\s*=(?!=)/g;

/**
 * Each key listener a source adds, by its starting line. The code runs from
 * that line to the end of the call (or of the event's line when an argument
 * opens a block), on one line, so a wrapped call reads as it would unwrapped.
 */
function keyListenersIn(source: string) {
  return [...source.matchAll(KEY_LISTENER)].map((match) => {
    const start = source.lastIndexOf("\n", match.index) + 1;
    let end = match.index + match[0].length;
    if (match[0].startsWith("addEventListener")) {
      const open = source.indexOf("(", match.index);
      let depth = 0;
      for (let at = open; at < source.length; at++) {
        if (source[at] === "(") depth++;
        if (source[at] === ")" && --depth === 0) {
          if (!source.slice(open, at).includes("{")) end = at;
          break;
        }
      }
    }
    const lineEnd = source.indexOf("\n", end);
    const code = source
      .slice(start, lineEnd === -1 ? undefined : lineEnd)
      .replace(/\(\s+/g, "(")
      .replace(/,\s*\)/g, ")")
      .replace(/\s+/g, " ")
      .trim();
    return { line: source.slice(0, start).split("\n").length, code };
  });
}

/**
 * Every key listener in product source, as "file: listener":
 * `addEventListener("keydown" | "keyup" | "keypress", …)`, wrapped or not,
 * and `.onkeydown =` / `.onkeyup =` / `.onkeypress =`. A shortcut registers
 * through `useShortcut`, never its own key listener; the three below are not
 * shortcuts.
 *
 * React `onKeyDown` props (and an editor's `handleDOMEvents`) are out of scope:
 * a scan cannot tell a widget's own keys (a field's Enter, a grid's arrows)
 * from a region shortcut written as a prop. A page or region shortcut written
 * that way is not caught here, so review has to catch it.
 */
function keyListeners() {
  const files = execFileSync(
    "git",
    [
      "grep",
      "-l",
      "--untracked",
      "-E",
      "key(down|up|press)",
      "--",
      "apps",
      "packages",
      ":!*.test.*",
      ":!**/node_modules/**",
    ],
    { cwd: root, encoding: "utf8" },
  )
    .split("\n")
    .filter(Boolean);
  return files.flatMap((file) =>
    keyListenersIn(readFileSync(path.join(root, file), "utf8")).map((hit) => ({
      file,
      ...hit,
    })),
  );
}

const ALLOWED_KEY_LISTENERS = [
  // The shortcut owner: takes repeats of a held shortcut from the browser.
  'packages/ui/components/primitives/shortcut.tsx: if (!held.size) document.addEventListener("keydown", takeHeldKey);',
  // Enter and Space on a map marker the map library renders, which has no
  // React props: the marker's own button activation, not a shortcut.
  'packages/ui/components/primitives/map.tsx: markerElement.addEventListener("keydown", handleKeyDown);',
  // Stops following a confirmation's focus target once the person presses
  // any key; it never handles a key.
  'apps/admin/features/support-hub/components/workspace/confirm-provider.tsx: document.addEventListener("keydown", stop, true);',
].sort();

describe("shortcut descriptions", () => {
  it("adds no key listener for a shortcut outside the shared owner", () => {
    const found = keyListeners();
    expect(
      found.map(({ file, code }) => `${file}: ${code}`).sort(),
      found.map(({ file, line }) => `${file}:${line}`).join(", "),
    ).toEqual(ALLOWED_KEY_LISTENERS);
  });

  it("finds wrapped, keypress and onkeyup listeners, not an onKeyDown prop", () => {
    const source = [
      "useEffect(() => {",
      "  window.addEventListener(",
      '    "keydown",',
      "    handleMissionControlShortcutKeydown,",
      "    true,",
      "  );",
      "  document.addEventListener('keypress', onKey);",
      "  window.onkeyup = handleKeyUp;",
      "}, []);",
      'const field = <input onKeyDown={(event) => event.key === "Enter"} />;',
    ].join("\n");
    expect(keyListenersIn(source)).toEqual([
      {
        line: 2,
        code: 'window.addEventListener("keydown", handleMissionControlShortcutKeydown, true);',
      },
      { line: 7, code: "document.addEventListener('keypress', onKey);" },
      { line: 8, code: "window.onkeyup = handleKeyUp;" },
    ]);
  });

  it("finds the product shortcut callers", () => {
    expect(callers().length).toBeGreaterThan(5);
  });

  it("describes every product shortcut, so the Shift+? help lists it", () => {
    const undescribed = callers().flatMap((file) =>
      calls(readFileSync(path.join(root, file), "utf8"))
        .filter((call) => !/\bdescription\b/.test(call))
        .map((call) => `${file}: ${call.split("\n")[0]}`),
    );
    expect(undescribed).toEqual([]);
  });
});
