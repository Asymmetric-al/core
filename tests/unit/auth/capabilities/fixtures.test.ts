import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

import ts from "typescript";
import { describe, expect, it } from "vitest";

/*
 * Every `.ts` file in DIR must fail `tsc --noEmit -p DIR/tsconfig.json` exactly
 * on the lines tagged `// error TSxxxx`, and nowhere else. No workspace
 * tsconfig includes DIR, so the poison never reaches `bun run typecheck`.
 */
const DIR = "tests/fixtures/capability-registry";
const TAG = /\/\/ error TS(\d+)$/;

/** `file:line TScode` for every `// error TSxxxx` tag in the fixtures. */
function taggedErrors() {
  return readdirSync(DIR)
    .filter((file) => file.endsWith(".ts"))
    .flatMap((file) =>
      readFileSync(join(DIR, file), "utf8")
        .split("\n")
        .flatMap((line, index) => {
          const match = TAG.exec(line);
          return match ? [`${file}:${index + 1} TS${match[1]}`] : [];
        }),
    );
}

function compilerErrors() {
  const config = ts.getParsedCommandLineOfConfigFile(
    join(DIR, "tsconfig.json"),
    {},
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic() {} },
  );
  if (!config) throw new Error("fixture tsconfig did not parse");
  const program = ts.createProgram(config.fileNames, config.options);
  return ts.getPreEmitDiagnostics(program).map((diagnostic) => {
    const file = diagnostic.file;
    if (!file) return `global TS${diagnostic.code}`;
    const { line } = file.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
    return `${relative(DIR, file.fileName)}:${line + 1} TS${diagnostic.code}`;
  });
}

describe("capability registry tsc poison fixtures", () => {
  it("fail exactly on their tagged lines, and nowhere else", () => {
    const tagged = taggedErrors();
    expect(tagged.length).toBeGreaterThanOrEqual(10);
    expect(compilerErrors().sort()).toEqual(tagged.sort());
  });
});
