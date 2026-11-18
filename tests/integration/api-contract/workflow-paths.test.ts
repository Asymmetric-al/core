/**
 * #2708: the advisory API contract workflow runs on every pull request that
 * can change its result. The inputs are derived from the repository, not
 * listed here: the files the job's steps run, the Vitest configuration chain
 * this project loads, and every workspace package the swept code depends on.
 * Pure: reads files, no stack.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const read = (file: string) =>
  readFileSync(path.join(repoRoot, file), "utf8").replace(/\r\n/g, "\n");
const WORKFLOW = ".github/workflows/api-contract.yml";

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

/** Repository files named on the workflow's `run:` lines. */
function filesTheJobRuns(workflow: string): string[] {
  const files = new Set<string>();
  for (const match of workflow.matchAll(
    /(?:^|[\s"'])((?:scripts|supabase|tests)\/[\w./-]+\.\w+)/gm,
  ))
    files.add(match[1]!);
  return [...files];
}

/** The project's Vitest config, the root config it extends, and what that loads. */
function vitestConfigChain(): string[] {
  const project = "tests/integration/api-contract/vitest.config.mts";
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

  it("covers every repository file the job's steps run", () => {
    const files = filesTheJobRuns(read(WORKFLOW));
    expect(files).toContain("scripts/api-contract/stack.mjs");
    expect(uncovered(files)).toEqual([]);
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
