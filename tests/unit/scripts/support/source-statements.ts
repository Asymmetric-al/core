// Source-text checks describe statements, not Prettier's line breaks. This
// joins every line break that falls inside parentheses or square brackets, so
// a call or array reads as the one-line form the checks are written against:
//   run(cmd, [\n  "a",\n  "b",\n])  ->  run(cmd, ["a", "b"])
// Strings, template literals and comments are copied through untouched.
export function joinWrappedStatements(source: string): string {
  let out = "";
  let depth = 0;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (char === '"' || char === "'" || char === "`") {
      let end = index + 1;
      while (end < source.length && source[end] !== char)
        end += source[end] === "\\" ? 2 : 1;
      out += source.slice(index, end + 1);
      index = end;
      continue;
    }
    if (char === "/" && next === "/") {
      const end = source.indexOf("\n", index);
      const stop = end === -1 ? source.length : end;
      out += source.slice(index, stop);
      index = stop - 1;
      continue;
    }
    if (char === "/" && next === "*") {
      const end = source.indexOf("*/", index + 2);
      const stop = end === -1 ? source.length : end + 2;
      out += source.slice(index, stop);
      index = stop - 1;
      continue;
    }
    // A regular expression literal: "/" where an operand is expected.
    if (char === "/" && /[(,=:[!&|?{};]\s*$|^\s*$/.test(out.slice(-40))) {
      let end = index + 1;
      let inClass = false;
      while (end < source.length && (inClass || source[end] !== "/")) {
        if (source[end] === "\\") end += 1;
        else if (source[end] === "[") inClass = true;
        else if (source[end] === "]") inClass = false;
        else if (source[end] === "\n") break;
        end += 1;
      }
      out += source.slice(index, end + 1);
      index = end;
      continue;
    }
    if (char === "(" || char === "[") depth += 1;
    if (char === ")" || char === "]") depth = Math.max(0, depth - 1);
    if (char === "\n" && depth > 0) {
      while (/[ \t\n]/.test(source[index + 1] ?? "")) index += 1;
      out += " ";
      continue;
    }
    out += char;
  }
  return out
    .replace(/([([]) /g, "$1")
    .replace(/,? ([)\]])/g, "$1")
    .replace(/, \}/g, " }");
}
