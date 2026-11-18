/**
 * #2708: the advisory API contract workflow runs on every pull request that
 * can change its result. The inputs are derived from the repository, not
 * listed here:
 *
 * - the repository files the workflow names (the scripts its steps run) and
 *   the test files its Vitest project includes;
 * - from those, transitively: relative imports (static, dynamic, `require`),
 *   repository paths their code names in string literals or as literal
 *   `path.join` segments (scripts they spawn, files they read; a named
 *   directory stands for every file under it), and repository paths shell
 *   scripts name. Paths built at run time (from JSON, for example) are not
 *   derived. Files under packages/ are recorded but not followed: the filter
 *   covers packages/** whole, and the workspace-package check below derives
 *   which packages the swept code needs;
 * - the Vitest configuration chain this project loads;
 * - every workspace package the swept code depends on.
 *
 * Pure: reads files, no stack.
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";

import ts from "typescript";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const read = (file: string) =>
  readFileSync(path.join(repoRoot, file), "utf8").replace(/\r\n/g, "\n");
const WORKFLOW = ".github/workflows/api-contract.yml";
const PROJECT_CONFIG = "tests/integration/api-contract/vitest.config.mts";

/** The `on.pull_request.paths` list of a workflow, read line by line. */
export function pullRequestPaths(workflow: string): string[] {
  const lines = workflow.split("\n");
  const start = lines.findIndex((line) => /^ {2}pull_request:\s*$/.test(line));
  if (start < 0) return [];
  const paths: string[] = [];
  let inPaths = false;
  for (const line of lines.slice(start + 1)) {
    if (/^ {0,3}\S/.test(line)) break;
    if (/^ {4}paths:\s*$/.test(line)) {
      inPaths = true;
      continue;
    }
    if (/^ {4}\S/.test(line)) inPaths = false;
    const item = /^ {6}- (.+?)\s*(#.*)?$/.exec(line);
    if (inPaths && item) paths.push(item[1]!.replace(/^["']|["']$/g, ""));
  }
  return paths;
}

/** Repository files the workflow names (its steps' scripts among them). */
function filesTheWorkflowNames(workflow: string): string[] {
  const files = new Set<string>();
  for (const match of workflow.matchAll(
    /(?:^|[\s"'])((?:scripts|supabase|tests)\/[\w./-]+\.\w+)/gm,
  ))
    files.add(match[1]!);
  return [...files];
}

const stat = (file: string) =>
  statSync(path.join(repoRoot, file), { throwIfNoEntry: false });
const isFile = (file: string) => stat(file)?.isFile() ?? false;

/** Every file under a repository directory, outside node_modules. */
function filesUnder(dir: string): string[] {
  return readdirSync(path.join(repoRoot, dir), {
    recursive: true,
    withFileTypes: true,
  })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      path.posix.join(
        dir,
        path
          .relative(path.join(repoRoot, dir), entry.parentPath)
          .split(path.sep)
          .join("/"),
        entry.name,
      ),
    )
    .filter((file) => !file.split("/").includes("node_modules"));
}

/** The test files the project's Vitest `include` globs select. */
function projectTestFiles(): string[] {
  const config = read(PROJECT_CONFIG);
  const include = /include:\s*\[([^\]]*)\]/.exec(config)?.[1] ?? "";
  const globs = [...include.matchAll(/"([^"]+)"/g)].map((m) => m[1]!);
  return globs.flatMap((glob) => {
    const base = glob.slice(0, glob.indexOf("*")).replace(/\/$/, "");
    if (!stat(base)?.isDirectory()) return [];
    return filesUnder(base).filter((file) =>
      path.posix.matchesGlob(file, glob),
    );
  });
}

/** A path relative to the repository root, as the code names it. */
const REPO_PATH =
  /^(?:\.github|apps|docs|packages|scripts|supabase|tests|tooling)\/[\w.@/-]+$/;
const CODE = /\.(?:[cm]?[jt]s|tsx)$/;
const RESOLVE = ["", ".ts", ".tsx", ".mts", ".mjs", ".js", "/index.ts"];

/** Relative imports and repository paths named in a code file. */
function referencesInCode(file: string): {
  imports: string[];
  named: string[];
} {
  const source = ts.createSourceFile(
    file,
    read(file),
    ts.ScriptTarget.Latest,
    true,
  );
  const dir = path.posix.dirname(file);
  const imports: string[] = [];
  const named: string[] = [];
  const relative = (specifier: string) => {
    if (!/^\.{1,2}\//.test(specifier)) return;
    const base = path.posix.normalize(path.posix.join(dir, specifier));
    const hit = RESOLVE.map((ext) => `${base}${ext}`).find(isFile);
    if (hit) imports.push(hit);
  };
  const visit = (node: ts.Node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    )
      relative(node.moduleSpecifier.text);
    else if (ts.isCallExpression(node)) {
      const [first] = node.arguments;
      const loads =
        node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === "require");
      if (loads && first && ts.isStringLiteralLike(first)) relative(first.text);
      // path.join(root, "scripts", "sql", "file.sql"): the literal segments.
      const segments = node.arguments
        .filter(ts.isStringLiteralLike)
        .map((arg) => arg.text);
      if (segments.length > 1) named.push(path.posix.join(...segments));
    } else if (ts.isStringLiteralLike(node)) named.push(node.text);
    ts.forEachChild(node, visit);
  };
  visit(source);
  return { imports, named };
}

/** Repository paths a shell script names outside comments. */
function referencesInShell(file: string): string[] {
  return read(file)
    .split("\n")
    .filter((line) => !line.trim().startsWith("#"))
    .flatMap((line) => line.match(/[\w.@/-]+/g) ?? []);
}

/**
 * The files the job runs or loads, followed transitively from the files the
 * workflow names and the project's test files.
 */
function jobInputs(workflow: string): string[] {
  const inputs = new Set<string>();
  const queue: string[] = [];
  const add = (candidate: string) => {
    const file = path.posix.normalize(candidate);
    if (!REPO_PATH.test(file) || file.split("/").includes("node_modules"))
      return;
    const found = stat(file);
    if (!found) return;
    // packages/** is covered whole and derived by package below.
    if (file.startsWith("packages/")) {
      inputs.add(file);
      return;
    }
    for (const each of found.isDirectory() ? filesUnder(file) : [file])
      if (!inputs.has(each)) {
        inputs.add(each);
        queue.push(each);
      }
  };
  for (const file of [
    ...filesTheWorkflowNames(workflow),
    ...projectTestFiles(),
  ])
    add(file);
  for (let file = queue.shift(); file; file = queue.shift()) {
    if (CODE.test(file)) {
      const { imports, named } = referencesInCode(file);
      for (const each of [...imports, ...named]) add(each);
    } else if (file.endsWith(".sh"))
      for (const each of referencesInShell(file)) add(each);
  }
  return [...inputs].sort();
}

/** The project's Vitest config, the root config it extends, and what that loads. */
function vitestConfigChain(): string[] {
  const project = PROJECT_CONFIG;
  const files = new Set<string>([project]);
  const queue = [project];
  for (let file = queue.shift(); file; file = queue.shift()) {
    const text = read(file);
    const dir = path.posix.dirname(file);
    for (const match of text.matchAll(/from "(\.{1,2}\/[^"]+)"/g)) {
      const target = path.posix.normalize(path.posix.join(dir, match[1]!));
      if (!files.has(target) && existsSync(path.join(repoRoot, target))) {
        files.add(target);
        queue.push(target);
      }
    }
    // setupFiles entries and aliases pinned to repository test files.
    for (const match of text.matchAll(/"(?:\.\/)?(tests\/[^"]+\.\w+)"/g))
      if (existsSync(path.join(repoRoot, match[1]!))) files.add(match[1]!);
  }
  return [...files];
}

/** packages/api and every workspace package it depends on, transitively. */
function workspacePackagesOfApi(): string[] {
  const byName = new Map<string, string>();
  for (const dir of readdirSync(path.join(repoRoot, "packages"))) {
    const manifest = path.join(repoRoot, "packages", dir, "package.json");
    if (existsSync(manifest))
      byName.set(
        (JSON.parse(readFileSync(manifest, "utf8")) as { name: string }).name,
        `packages/${dir}`,
      );
  }
  const seen = new Set<string>(["packages/api"]);
  const queue = ["packages/api"];
  for (let dir = queue.shift(); dir; dir = queue.shift()) {
    const manifest = JSON.parse(read(`${dir}/package.json`)) as Record<
      string,
      Record<string, string> | undefined
    >;
    for (const field of ["dependencies", "devDependencies", "peerDependencies"])
      for (const [name, version] of Object.entries(manifest[field] ?? {}))
        if (version.startsWith("workspace:") && byName.has(name)) {
          const target = byName.get(name)!;
          if (!seen.has(target)) {
            seen.add(target);
            queue.push(target);
          }
        }
  }
  return [...seen];
}

describe("api-contract workflow pull-request filter", () => {
  const paths = pullRequestPaths(read(WORKFLOW));
  const uncovered = (files: string[]) =>
    files.filter(
      (file) => !paths.some((glob) => path.posix.matchesGlob(file, glob)),
    );

  it("reads the filter", () => {
    expect(paths).toContain(WORKFLOW);
  });

  it("covers every file the job runs, and what those files import, spawn or read by name", () => {
    const inputs = jobInputs(read(WORKFLOW));
    // The derivation reaches each kind of input it claims to follow.
    expect(inputs).toEqual(
      expect.arrayContaining([
        // named on a run: line
        "scripts/api-contract/stack.mjs",
        "scripts/verify/supabase-migrations.mjs",
        // a run file's relative import
        "scripts/verify/tenant-rls-catalog.mjs",
        // a script spawned by its literal path
        "scripts/verify/field-policy-census.mjs",
        // a file read by its literal path
        "scripts/sql/postgres17-upgrade-readiness.sql",
        // a script a shell script runs
        "scripts/github/prepare-apt.sh",
        // a test file the project includes, and a helper it imports
        "tests/integration/api-contract/select-sweep.live.test.ts",
        "tests/integration/api-contract/live-stack.ts",
      ]),
    );
    const outsidePackages = inputs.filter(
      (file) =>
        !file.startsWith("packages/") &&
        !file.startsWith("supabase/migrations/"),
    );
    console.info(
      `API contract workflow inputs: ${inputs.length} derived (packages/ and supabase/migrations/ not listed):\n  ${outsidePackages.join("\n  ")}`,
    );
    expect(uncovered(inputs)).toEqual([]);
  });

  it("covers the Vitest configuration chain the tests load", () => {
    const files = vitestConfigChain();
    expect(files).toContain("vitest.config.mts");
    expect(uncovered(files)).toEqual([]);
  });

  it("covers every workspace package the swept code depends on", () => {
    const packages = workspacePackagesOfApi();
    expect(packages).toEqual(
      expect.arrayContaining(["packages/api", "packages/database"]),
    );
    expect(uncovered(packages.map((dir) => `${dir}/src/index.ts`))).toEqual([]);
    expect(uncovered(packages.map((dir) => `${dir}/package.json`))).toEqual([]);
  });

  it("covers the dependency manifests and the schema chain", () => {
    expect(
      uncovered([
        "package.json",
        "bun.lock",
        "supabase/migrations/20990101000000_example.sql",
        "supabase/config.toml",
        "scripts/sql/supabase-compat-bootstrap.sql",
      ]),
    ).toEqual([]);
  });
});
