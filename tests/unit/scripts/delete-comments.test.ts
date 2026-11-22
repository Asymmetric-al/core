import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  listComments,
  runDeleteComments,
  sameProgram,
  stripComments,
} from "../../../scripts/delete-comments.mjs";

const repositories: string[] = [];

function repository(files: Record<string, string>) {
  const root = mkdtempSync(path.join(tmpdir(), "delete-comments-"));
  repositories.push(root);
  execFileSync("git", ["init", "--quiet"], { cwd: root });
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), text);
  }
  execFileSync("git", ["-c", "core.autocrlf=false", "add", "--all"], {
    cwd: root,
  });
  return root;
}

async function run(root: string, ...args: string[]) {
  const output: string[] = [];
  const status = await runDeleteComments({
    root,
    args,
    log: (line: string) => output.push(line),
    error: (line: string) => output.push(line),
  });
  return { status, output: output.join("\n") };
}

const read = (root: string, file: string) =>
  readFileSync(path.join(root, file), "utf8");

afterEach(() => {
  for (const root of repositories.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("stripComments", () => {
  it("removes whole-line, trailing and block comments and keeps the code", () => {
    expect(
      stripComments(
        [
          "/**",
          " * Explains the module.",
          " */",
          "export const a = 1; // trailing",
          "",
          "// above b",
          "export const b = /* inline */ 2;",
          "",
        ].join("\n"),
        "packages/api/src/a.ts",
      ),
    ).toEqual({
      removed: 4,
      text: "export const a = 1;\n\nexport const b =  2;\n",
    });
  });

  it("keeps machine-read comments", () => {
    const text =
      "// eslint-disable-next-line no-console -- TODO(AL-1): use the logger\nconsole.log(1);\n// prettier-ignore\nexport const m = [1,0];\n";
    expect(stripComments(text, "packages/api/src/a.ts")).toEqual({
      removed: 0,
      text,
    });
  });

  it("removes a JSX comment with its braces", () => {
    expect(
      stripComments(
        "export const A = () => (\n  <div>\n    {/* note */}\n    <span />\n  </div>\n);\n",
        "apps/admin/a.tsx",
      ),
    ).toEqual({
      removed: 1,
      text: "export const A = () => (\n  <div>\n    <span />\n  </div>\n);\n",
    });
  });

  it("keeps the braces of a JSX expression that holds code", () => {
    expect(
      stripComments(
        "export const A = ({ a }: { a: string }) => <div>{a /* note */}</div>;\n",
        "apps/admin/a.tsx",
      ).text,
    ).toBe("export const A = ({ a }: { a: string }) => <div>{a }</div>;\n");
  });

  it("keeps two tokens apart when a comment was all that separated them", () => {
    expect(
      stripComments(
        "export const n = 1/* note */.toString();\n",
        "packages/api/src/a.ts",
      ),
    ).toEqual({ removed: 1, text: "export const n = 1 .toString();\n" });
  });

  it("keeps a JSDoc modifier that TypeScript reads in a JavaScript file", () => {
    const text =
      "export class A {\n  /** @readonly */\n  name = 1;\n  /** @arg {string} value */\n  set(value) {}\n}\n";
    expect(stripComments(text, "scripts/a.mjs")).toEqual({ removed: 0, text });
  });

  it("leaves text that only looks like a comment", () => {
    const text =
      'export const url = "https://example.org/a"; export const re = /\\/\\*/;\n';
    expect(stripComments(text, "packages/api/src/a.ts")).toEqual({
      removed: 0,
      text,
    });
  });
});

describe("sameProgram", () => {
  it("accepts layout changes and removed JSX comments", () => {
    expect(
      sameProgram(
        "export const a = [\n  // first\n  1,\n];\nexport const A = () => (\n  <div>\n    {/* note */}\n    <span />\n  </div>\n);\n",
        "export const a = [1];\nexport const A = () => (\n  <div>\n    <span />\n  </div>\n);\n",
        "apps/admin/a.tsx",
      ),
    ).toBe(true);
  });

  it("rejects a change to the code", () => {
    expect(
      sameProgram(
        "export const a = 1; // one\n",
        "export const a = 2;\n",
        "packages/api/src/a.ts",
      ),
    ).toBe(false);
  });

  it("rejects JSX text that a removed comment used to split", () => {
    expect(
      sameProgram(
        "export const A = () => <p>a {/* note */} b</p>;\n",
        "export const A = () => <p>a  b</p>;\n",
        "apps/admin/a.tsx",
      ),
    ).toBe(false);
  });
});

describe("listComments", () => {
  it("lists banned comments with their place and text", () => {
    expect(
      listComments(
        "// prettier-ignore\nexport const a = 1; // why\n/** Doc. */\nexport const b = 2;\n",
        "packages/api/src/a.ts",
      ),
    ).toEqual([
      {
        file: "packages/api/src/a.ts",
        line: 2,
        endLine: 2,
        kind: "Line",
        text: " why",
      },
      {
        file: "packages/api/src/a.ts",
        line: 3,
        endLine: 3,
        kind: "JSDoc",
        text: "* Doc. ",
      },
    ]);
  });
});

describe("the delete-comments command", () => {
  it("lists the comments under a path as JSON", async () => {
    const root = repository({
      "packages/api/src/a.ts": "// one\nexport const a = 1;\n",
      "packages/ui/b.ts": "// other\nexport const b = 1;\n",
      "tests/fixtures/c.ts": "// fixture\nexport const c = 1;\n",
    });

    const result = await run(root, "list", "packages/api", "tests");
    expect(result.status).toBe(0);
    expect(JSON.parse(result.output)).toEqual([
      {
        file: "packages/api/src/a.ts",
        line: 1,
        endLine: 1,
        kind: "Line",
        text: " one",
      },
    ]);
  });

  it("strips and formats the files under a path, and no others", async () => {
    const root = repository({
      "packages/api/src/a.ts":
        "export const a = [\n  // first\n  1,\n];\n\n\n// gone\nexport const b = 2;\n",
      "packages/ui/b.ts": "// stays\nexport const b = 1;\n",
    });

    const result = await run(root, "strip", "packages/api");
    expect(result.status).toBe(0);
    expect(result.output).toContain("2 comments from 1 file");
    expect(read(root, "packages/api/src/a.ts")).toBe(
      "export const a = [1];\n\nexport const b = 2;\n",
    );
    expect(read(root, "packages/ui/b.ts")).toBe(
      "// stays\nexport const b = 1;\n",
    );
  });

  it("leaves a file alone when its code would change", async () => {
    const source = "export const A = () => <p>a {/* note */} b</p>;\n";
    const root = repository({ "apps/admin/a.tsx": source });

    const result = await run(root, "strip", "apps/admin");
    expect(result.status).toBe(1);
    expect(result.output).toContain("apps/admin/a.tsx");
    expect(read(root, "apps/admin/a.tsx")).toBe(source);
  });

  it("writes a file whose tokens a comment kept apart", async () => {
    const root = repository({
      "packages/api/src/a.ts": "export const n = 1/* note */.toString();\n",
    });

    expect((await run(root, "strip", "packages/api")).status).toBe(0);
    expect(read(root, "packages/api/src/a.ts")).toBe(
      "export const n = (1).toString();\n",
    );
  });

  it("names a file it cannot parse and still strips the others", async () => {
    const broken = "// note\nexport const = ;\n";
    const root = repository({
      "packages/api/src/a.ts": broken,
      "packages/api/src/b.ts": "// gone\nexport const b = 2;\n",
    });

    const result = await run(root, "strip", "packages/api");
    expect(result.status).toBe(1);
    expect(result.output).toContain("packages/api/src/a.ts");
    expect(read(root, "packages/api/src/a.ts")).toBe(broken);
    expect(read(root, "packages/api/src/b.ts")).toBe("export const b = 2;\n");
  });

  it("refuses a path that matches no source file", async () => {
    const root = repository({ "packages/api/src/a.ts": "export {};\n" });

    await expect(run(root, "strip", "packages/missing")).rejects.toThrow(
      /packages\/missing/,
    );
  });
});
