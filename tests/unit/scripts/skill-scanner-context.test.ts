import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { runInNewContext } from "node:vm";

import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { afterEach, describe, expect, it } from "vitest";

const repo = process.cwd();
const load = createRequire(import.meta.url);
const roots: string[] = [];
const token = ["pass", "word"].join("");
const pragma = "pragma: allowlist secret";
const samples = {
  "jsx.tsx": `export function Example() { return (<div>\n<label htmlFor="${token}">Password</label>\n<input type="${token}" />\n</div>); }\n`,
  "continue.py": `${token} = \\\n    'demo'\nprint(${token})\n`,
  "continue.sh": `printf '%s\\n' ${token} \\\n  'second payload'\n`,
  "heredoc.sh": `cat <<'DATA'\n${token} fixture payload\nDATA\n`,
  "template.mjs": `const payload = \`start\n${token} fixture payload // ${pragma}\nend\`;\nconsole.log(JSON.stringify(payload));\n`,
  "triple.py": `payload = """start\n${token} fixture payload # ${pragma}\nend"""\nprint(repr(payload))\n`,
  "simple.py": `${token} = 'demo'\nprint(${token})\n`,
};
afterEach(async () => {
  for (const root of roots.splice(0))
    await rm(root, { recursive: true, force: true });
});
function jsxMarkup(source: string) {
  const exported: { Example?: ComponentType } = {};
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
    },
  });
  runInNewContext(compiled.outputText, { exports: exported, require: load });
  if (!exported.Example) throw new Error("Missing JSX fixture");
  return renderToStaticMarkup(createElement(exported.Example));
}
function execute(file: string) {
  const command = file.endsWith(".py")
    ? "python3"
    : file.endsWith(".sh")
      ? "bash"
      : process.execPath;
  const result = spawnSync(command, [file], { encoding: "utf8" });
  return { exit: result.status, stdout: result.stdout, stderr: result.stderr };
}

describe("skill scanner context preservation", () => {
  it.each(["sync", "refresh"])(
    "preserves execution, JSX text and literal payloads through %s",
    async (operation) => {
      await mkdir(path.join(repo, ".tmp"), { recursive: true });
      const root = await mkdtemp(path.join(repo, ".tmp", "scanner-context-"));
      roots.push(root);
      const script =
        operation === "sync"
          ? "sync-agent-skills.mjs"
          : "refresh-upstream-skills.mjs";
      await mkdir(path.join(root, "scripts"));
      await cp(
        path.join(repo, "scripts", script),
        path.join(root, "scripts", script),
      );
      await cp(path.join(repo, "scripts/lib"), path.join(root, "scripts/lib"), {
        recursive: true,
      });
      const canonical = path.join(root, "docs/ai/skills/npm-deps-cleanup");
      const ecosystem = path.join(root, ".agents/skills/npm-deps-cleanup");
      await mkdir(canonical, { recursive: true });
      await mkdir(ecosystem, { recursive: true });
      const source = operation === "sync" ? canonical : ecosystem;
      const destination = operation === "sync" ? ecosystem : canonical;
      await writeFile(path.join(canonical, "SKILL.md"), "# Fixture\n");
      await writeFile(path.join(ecosystem, "SKILL.md"), "# Fixture\n");
      for (const [file, text] of Object.entries(samples))
        await writeFile(path.join(source, file), text);
      await writeFile(
        path.join(source, "legacy-jsx.tsx"),
        samples["jsx.tsx"].replaceAll("</label>", `</label> // ${pragma}`),
      );
      const markdown =
        "# Fenced examples\n" +
        [
          ["tsx", samples["jsx.tsx"]],
          ["python", samples["continue.py"]],
          ["bash", samples["heredoc.sh"]],
          ["js", samples["template.mjs"]],
        ]
          .map(([language, text]) => `\n\`\`\`${language}\n${text}\`\`\`\n`)
          .join("");
      await writeFile(path.join(source, "examples.md"), markdown);
      const invoke = () =>
        spawnSync(
          process.execPath,
          [
            `scripts/${script}`,
            ...(operation === "refresh" ? ["--only=anthonyshew/dotfiles"] : []),
          ],
          { cwd: root, encoding: "utf8" },
        );
      const result = invoke();
      expect(result.status, result.stderr).toBe(0);
      for (const [file, original] of Object.entries(samples)) {
        const before = path.join(source, file),
          after = path.join(destination, file);
        if (file.endsWith(".tsx"))
          expect(jsxMarkup(await readFile(after, "utf8"))).toBe(
            jsxMarkup(original),
          );
        else {
          const baseline = execute(before);
          expect(baseline.exit, baseline.stderr).toBe(0);
          expect(execute(after)).toEqual(baseline);
        }
      }
      expect(
        jsxMarkup(
          await readFile(path.join(destination, "legacy-jsx.tsx"), "utf8"),
        ),
      ).toBe(jsxMarkup(samples["jsx.tsx"]));
      const transformedMarkdown = await readFile(
        path.join(destination, "examples.md"),
        "utf8",
      );
      const blocks = [
        ...transformedMarkdown.matchAll(/```[^\n]*\n([\s\S]*?)```/g),
      ];
      expect(blocks).toHaveLength(4);
      expect(jsxMarkup(blocks[0]![1]!)).toBe(jsxMarkup(samples["jsx.tsx"]));
      const pythonBlock = path.join(root, "markdown.py");
      await writeFile(pythonBlock, blocks[1]![1]!);
      expect(execute(pythonBlock)).toEqual(
        execute(path.join(source, "continue.py")),
      );
      expect(blocks[2]![1]).toBe(samples["heredoc.sh"]);
      expect(blocks[3]![1]).toBe(samples["template.mjs"]);
      expect(
        await readFile(path.join(destination, "simple.py"), "utf8"),
      ).toContain(`# ${pragma}`);
      const first = await readFile(
        path.join(destination, "examples.md"),
        "utf8",
      );
      expect(invoke().status).toBe(0);
      expect(
        await readFile(path.join(destination, "examples.md"), "utf8"),
      ).toBe(first);
    },
  );
});

const payloadCases = [
  {
    name: "operator continuation heredoc",
    extension: "sh",
    language: "bash",
    content: `cat <\\\n<END.DATA\nEND\n${token} fixture payload\nEND.DATA\n`,
  },
  {
    name: "YAML payload document marker",
    extension: "yaml",
    language: "yaml",
    content: `payload: |2\n  first\n  ---\n  ${token} fixture payload\n`,
  },
  {
    name: "dotted heredoc",
    extension: "sh",
    language: "bash",
    content: `cat <<END.DATA\nEND\n${token} fixture payload\nEND.DATA\n`,
  },
  {
    name: "slash heredoc",
    extension: "sh",
    language: "bash",
    content: `cat <<END/DATA\nEND\n${token} fixture payload\nEND/DATA\n`,
  },
  {
    name: "mixed-quoted heredoc",
    extension: "sh",
    language: "bash",
    content: `cat <<END".DATA"\nEND\n${token} fixture payload\nEND.DATA\n`,
  },
  {
    name: "escaped heredoc",
    extension: "sh",
    language: "bash",
    content: `cat <<END\\.DATA\nEND\n${token} fixture payload\nEND.DATA\n`,
  },
  {
    name: "tab-stripped heredoc",
    extension: "sh",
    language: "bash",
    content: `cat <<-END.DATA\n\tEND\n\t${token} fixture payload\n\tEND.DATA\n`,
  },
  {
    name: "multiple heredocs",
    extension: "sh",
    language: "bash",
    content: `cat <<FIRST <<END.DATA\nunused\nFIRST\nEND\n${token} fixture payload\nEND.DATA\n`,
  },
  {
    name: "continued heredoc word",
    extension: "sh",
    language: "bash",
    content: `cat <<\\\nEND.DATA\nEND\n${token} fixture payload\nEND.DATA\n`,
  },
  {
    name: "space-quoted heredoc",
    extension: "sh",
    language: "bash",
    content: `cat <<'END DATA'\n${token} fixture payload\nEND DATA\n`,
  },
  {
    name: "simple heredoc control",
    extension: "sh",
    language: "bash",
    content: `cat <<DATA\n${token} fixture payload\nDATA\n`,
  },
  {
    name: "YAML sequence literal",
    extension: "yaml",
    language: "yaml",
    content: `items:\n  - |\n    ${token} fixture payload\n`,
  },
  {
    name: "YAML explicit indent",
    extension: "yaml",
    language: "yaml",
    content: `payload: |2\n  ${token} fixture payload\n`,
  },
  {
    name: "YAML root literal",
    extension: "yaml",
    language: "yaml",
    content: `|\n  ${token} fixture payload\n`,
  },
  {
    name: "YAML root folded",
    extension: "yaml",
    language: "yaml",
    content: `>-\n  ${token} fixture payload\n  second line\n`,
  },
  {
    name: "YAML indent then chomp",
    extension: "yaml",
    language: "yaml",
    content: `payload: |2-\n  ${token} fixture payload\n`,
  },
  {
    name: "YAML chomp then indent",
    extension: "yaml",
    language: "yaml",
    content: `payload: |-2\n  ${token} fixture payload\n`,
  },
  {
    name: "YAML compact sequence map",
    extension: "yaml",
    language: "yaml",
    content: `items:\n  - payload: |2-\n      ${token} fixture payload\n`,
  },
  {
    name: "YAML tagged anchored scalar",
    extension: "yaml",
    language: "yaml",
    content: `payload: &data !!str |+\n  ${token} fixture payload\n`,
  },
  {
    name: "YAML sequence folded",
    extension: "yaml",
    language: "yaml",
    content: `- >2-\n  ${token} fixture payload\n`,
  },
  {
    name: "YAML header comment",
    extension: "yaml",
    language: "yaml",
    content: `payload: |2 # ${token} comment\n  ${token} fixture payload\n`,
  },
  {
    name: "YAML following sibling",
    extension: "yaml",
    language: "yaml",
    content: `payload: |2\n  ${token} fixture payload\nnext: unchanged\n`,
  },
];

function parseYaml(file: string) {
  const result = spawnSync(
    "bun",
    [
      "-e",
      "console.log(JSON.stringify(Bun.YAML.parse(await Bun.file(process.argv.at(-1)).text())))",
      file,
    ],
    { encoding: "utf8" },
  );
  return { exit: result.status, stdout: result.stdout, stderr: result.stderr };
}

it.each(
  payloadCases.flatMap((sample) =>
    ["sync", "refresh"].map((operation) => ({ ...sample, operation })),
  ),
)(
  "$operation preserves $name payload region",
  async ({ content, extension, language, operation }) => {
    await mkdir(path.join(repo, ".tmp"), { recursive: true });
    const root = await mkdtemp(path.join(repo, ".tmp", "scanner-payload-"));
    roots.push(root);
    const script =
      operation === "sync"
        ? "sync-agent-skills.mjs"
        : "refresh-upstream-skills.mjs";
    await mkdir(path.join(root, "scripts"));
    await cp(
      path.join(repo, "scripts", script),
      path.join(root, "scripts", script),
    );
    await cp(path.join(repo, "scripts/lib"), path.join(root, "scripts/lib"), {
      recursive: true,
    });
    const canonical = path.join(root, "docs/ai/skills/npm-deps-cleanup");
    const ecosystem = path.join(root, ".agents/skills/npm-deps-cleanup");
    for (const directory of [canonical, ecosystem]) {
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, "SKILL.md"), "# Fixture\n");
    }
    const source = operation === "sync" ? canonical : ecosystem;
    const destination = operation === "sync" ? ecosystem : canonical;
    const file = `payload.${extension}`;
    await writeFile(path.join(source, file), content);
    const markdown = `# Payload\n\n\`\`\`${language}\n${content}\`\`\`\n`;
    await writeFile(path.join(source, "payload.md"), markdown);
    if (extension === "yaml")
      await writeFile(
        path.join(source, "frontmatter.md"),
        `---\n${content}---\n\n# Payload\n`,
      );
    await writeFile(
      path.join(source, "ordinary.sh"),
      `printf '%s\\n' ${token}\n`,
    );
    await writeFile(path.join(source, "ordinary.yaml"), `${token}: demo\n`);
    const invoke = () =>
      spawnSync(
        process.execPath,
        [
          `scripts/${script}`,
          ...(operation === "refresh" ? ["--only=anthonyshew/dotfiles"] : []),
        ],
        { cwd: root, encoding: "utf8" },
      );
    const result = invoke();
    expect(result.status, result.stderr).toBe(0);
    const semantics = extension === "yaml" ? parseYaml : execute;
    const baseline = semantics(path.join(source, file));
    expect(baseline.exit, baseline.stderr).toBe(0);
    expect(baseline.stderr).toBe("");
    expect(baseline.stdout).toContain(token);
    expect(semantics(path.join(destination, file))).toEqual(baseline);
    expect(await readFile(path.join(destination, file), "utf8")).toBe(content);
    expect(await readFile(path.join(destination, "payload.md"), "utf8")).toBe(
      markdown,
    );
    if (extension === "yaml")
      expect(
        await readFile(path.join(destination, "frontmatter.md"), "utf8"),
      ).toBe(`---\n${content}---\n\n# Payload\n`);
    for (const control of ["ordinary.sh", "ordinary.yaml"]) {
      expect(await readFile(path.join(destination, control), "utf8")).toContain(
        `# ${pragma}`,
      );
      const inspect = control.endsWith(".yaml") ? parseYaml : execute;
      const ordinary = inspect(path.join(source, control));
      expect(ordinary.exit, ordinary.stderr).toBe(0);
      expect(inspect(path.join(destination, control))).toEqual(ordinary);
    }
  },
);
