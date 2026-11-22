// Inventory of authored TypeScript by actual program membership (TS-3, design L9).
//
// Every tracked tsconfig is either a program listed here or named as a non-program. Membership comes
// from the native compiler (`tsc --listFilesOnly`); include roots come from the classic API's config
// parser. Each tracked `.ts`, `.tsx`, `.mts` or `.cts` file is then classed by the programs it is
// actually in, or by a named reason when it is in none. Run with `--write` to refresh the committed
// inventory and with `--check` to compare it with the tree.
import { execFileSync, spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

export const root = fileURLToPath(new URL("../../", import.meta.url));
export const inventoryFile =
  "openspec/changes/adopt-ultracite-quality-toolchain/program-inventory.json";
const nativeCompiler = path.join(
  root,
  "node_modules/@typescript/native/lib/tsc.js",
);
const followUp = "#2732 (Central test compiler coverage)";

export type Role =
  "typecheck" | "other-gate" | "negative-fixture" | "evidence" | "lint-context";

export type Program = {
  config: string;
  role: Role;
  gate: string;
  reason: string;
};

export type Class =
  | "compiled"
  | "compiled-elsewhere"
  | "negative-fixture"
  | "evidence"
  | "lint-context"
  | "none";

type NoProgramRule = { prefix: string; kind: string; reason: string };

const lintOnly = `Lint context only (L9): typed lint checks it strictly; it is not compiled as a gate until ${followUp}.`;

// Programs that are neither a workspace `typecheck` nor part of `typecheck:programs`.
export const listedPrograms: readonly Program[] = [
  {
    config: "tests/fixtures/base-ui-compliance/tsconfig.json",
    role: "other-gate",
    gate: "bun run test:e2e:base-ui",
    reason: "Base UI browser fixture, compiled before its Playwright run.",
  },
  {
    config: "tests/fixtures/capability-registry/tsconfig.json",
    role: "negative-fixture",
    gate: "tests/unit/auth/capabilities/fixtures.test.ts",
    reason:
      "Intentional compile failures; the test asserts the exact native diagnostics.",
  },
  {
    config: "docs/qa/admin-workspaces-hillclimb/fixtures/tsconfig.json",
    role: "evidence",
    gate: "none",
    reason: "Review evidence fixtures under docs/; no gate compiles them.",
  },
  {
    config: "tests/tsconfig.json",
    role: "lint-context",
    gate: "typed lint",
    reason: `Central tests that need no workspace alias (E40), with allowJs so imported scripts keep inferred types. ${lintOnly}`,
  },
  {
    config: "tests/unit/apps/admin/tsconfig.json",
    role: "lint-context",
    gate: "typed lint",
    reason: `Admin tests: Admin's options, @/ and @payload-config (E40, E45). ${lintOnly}`,
  },
  {
    config: "tests/unit/apps/donor/tsconfig.json",
    role: "lint-context",
    gate: "typed lint",
    reason: `Donor tests: Donor's options and @/ (E40). ${lintOnly}`,
  },
  {
    config: "tests/unit/apps/missionary/tsconfig.json",
    role: "lint-context",
    gate: "typed lint",
    reason: `Missionary tests: Missionary's options and @/ (E40). ${lintOnly}`,
  },
  {
    config: "tests/unit/acceptance/issue-2364/tsconfig.json",
    role: "lint-context",
    gate: "typed lint",
    reason: `Donor acceptance tests outside the Donor partition: Donor's options and @/ (E40). ${lintOnly}`,
  },
  {
    config: "tests/unit/packages/ui/tsconfig.json",
    role: "lint-context",
    gate: "typed lint",
    reason: `Shared UI tests: the UI package's options and @/ (E40). ${lintOnly}`,
  },
  {
    config: "tests/unit/cms/tsconfig.json",
    role: "lint-context",
    gate: "typed lint",
    reason: `CMS tests: @payload-config only (E45). ${lintOnly}`,
  },
  {
    config: "tests/unit/packages/api/principal/tsconfig.json",
    role: "lint-context",
    gate: "typed lint",
    reason: `Existing Principal program, kept as it is (L9). ${lintOnly}`,
  },
  {
    config: "tests/unit/packages/api/projection/tsconfig.json",
    role: "lint-context",
    gate: "typed lint",
    reason: `Existing Projection program, kept as it is (L9). ${lintOnly}`,
  },
];

// Tracked tsconfig-named files that are not programs.
export const nonPrograms: readonly { pattern: RegExp; reason: string }[] = [
  {
    pattern:
      /^\.(?:agents|claude|cursor)\/skills\/typescript-expert\/references\/tsconfig-strict\.json$/,
    reason: "Skill reference document",
  },
];

// Why a tracked TypeScript file belongs to no program. First matching prefix wins.
export const noProgramRules: readonly NoProgramRule[] = [
  {
    prefix: "scripts/archon-factory/pack/",
    kind: "factory-release",
    reason:
      "The factory's Archon pack: a changed pack is a new release under its own review (scripts/AGENTS.md, L2), so scripts/tsconfig.json excludes it and this change does not edit it.",
  },
  {
    prefix: ".agents/",
    kind: "managed-copy",
    reason: "Installed and mirrored agent skills.",
  },
  {
    prefix: ".claude/",
    kind: "managed-copy",
    reason: "Installed and mirrored agent skills.",
  },
  {
    prefix: ".cursor/",
    kind: "managed-copy",
    reason: "Installed and mirrored agent skills.",
  },
  {
    prefix: "docs/",
    kind: "evidence",
    reason: "Documentation evidence and source probes, kept as recorded.",
  },
  {
    prefix: "vendor/",
    kind: "vendored",
    reason: "Unpacked third-party distributions.",
  },
  {
    prefix: "tests/fixtures/base-ui-compliance/",
    kind: "fixture",
    reason:
      "Base UI browser fixtures outside that program's fixed include list (L9 keeps the program as it is). workspace-main.tsx needs Missionary's @/, which conflicts with the directory's @/ for the UI package (E40).",
  },
];

// Tracked generated sources, with their producer.
export const generatedSources: readonly {
  pattern: RegExp;
  producer: string;
}[] = [
  {
    pattern: /^apps\/[^/]+\/bones\/registry\.ts$/,
    producer: "npx boneyard-js build",
  },
  {
    pattern: /^packages\/database\/types\/currency-foundation\.generated\.ts$/,
    producer: "scripts/generate-currency-foundation-types.mjs",
  },
];

const typeScriptFile = /\.(?:ts|tsx|mts|cts)$/;

function git(args: string[]) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  })
    .split("\n")
    .filter(Boolean);
}

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(path.join(root, file), "utf8"));
}

/** A manifest's `scripts`, keeping only string values. */
function scriptsOf(manifest: unknown): Record<string, string> {
  if (
    typeof manifest !== "object" ||
    manifest === null ||
    !("scripts" in manifest) ||
    typeof manifest.scripts !== "object" ||
    manifest.scripts === null
  )
    return {};
  return Object.fromEntries(
    Object.entries(manifest.scripts).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

/** The configs a `typecheck:programs` script compiles, in order. */
export function programsScriptConfigs(script: string) {
  const configs = [...script.matchAll(/(?:^|&&\s*)tsc -p (\S+)/g)].map(
    (match) => match[1] ?? "",
  );
  if (!configs.length || script.split("&&").length !== configs.length)
    throw new Error(`Unexpected typecheck:programs script: ${script}`);
  return configs;
}

/** Every program: workspace typechecks, the root programs, then the listed ones. */
export function discoverPrograms(): Program[] {
  const scripts = scriptsOf(readJson("package.json"));
  const workspaces = git([
    "ls-files",
    "--cached",
    "--others",
    "--exclude-standard",
    "--",
    "*package.json",
  ])
    .filter((file) =>
      /^(?:apps|packages|tooling)\/[^/]+\/package\.json$/.test(file),
    )
    .flatMap((file): Program[] => {
      const typecheck = scriptsOf(readJson(file)).typecheck;
      if (typecheck === undefined) return [];
      if (!/(?:^|&& )tsc --noEmit$/.test(typecheck))
        throw new Error(`${file}: unexpected typecheck script ${typecheck}`);
      const directory = path.posix.dirname(file);
      return [
        {
          config: `${directory}/tsconfig.json`,
          role: "typecheck",
          gate: `bun run typecheck (${directory})`,
          reason: "Workspace program.",
        },
      ];
    });
  const rootPrograms = programsScriptConfigs(
    scripts["typecheck:programs"] ?? "",
  ).map((config): Program => ({
    config,
    role: "typecheck",
    gate: "bun run typecheck (typecheck:programs)",
    reason: "Root configuration, scripts or tooling program (L9).",
  }));
  return [...workspaces, ...rootPrograms, ...listedPrograms];
}

/** Fails unless every tracked tsconfig is exactly one program or a named non-program. */
export function checkProgramCoverage(
  programs: readonly Program[],
  trackedConfigs: readonly string[],
) {
  const configs = programs.map((program) => program.config);
  const duplicates = configs.filter(
    (config, index) => configs.indexOf(config) !== index,
  );
  if (duplicates.length)
    throw new Error(`Programs listed twice: ${duplicates.join(", ")}`);
  const known = new Set(configs);
  const unclassified = trackedConfigs.filter(
    (config) =>
      !known.has(config) &&
      !nonPrograms.some(({ pattern }) => pattern.test(config)),
  );
  if (unclassified.length)
    throw new Error(
      `Unclassified tsconfig files (add them to listedPrograms or nonPrograms): ${unclassified.join(", ")}`,
    );
  const tracked = new Set(trackedConfigs);
  const missing = configs.filter((config) => !tracked.has(config));
  if (missing.length)
    throw new Error(`Programs without a tracked config: ${missing.join(", ")}`);
}

function toRepoPath(file: string) {
  const relative = path.relative(root, path.resolve(root, file.trim()));
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative))
    return null;
  const posix = relative.split(path.sep).join("/");
  return posix.split("/").includes("node_modules") ? null : posix;
}

/** The repository files the native compiler puts in a program. */
export function listMembers(config: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [nativeCompiler, "-p", config, "--listFilesOnly"],
      { cwd: root, shell: false },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.setEncoding("utf8").on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `tsc --listFilesOnly -p ${config} exited ${code}: ${stdout}${stderr}`,
          ),
        );
        return;
      }
      resolve(
        stdout
          .split(/\r?\n/)
          .filter(Boolean)
          .map(toRepoPath)
          .filter((file): file is string => file !== null),
      );
    });
  });
}

/** The files a config's include and exclude select, by the classic API's parser. */
export function listRoots(config: string): string[] {
  const parsed = ts.getParsedCommandLineOfConfigFile(
    path.join(root, config),
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic(diagnostic) {
        throw new Error(
          `${config}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`,
        );
      },
    },
  );
  if (!parsed) throw new Error(`${config}: unreadable config`);
  return parsed.fileNames
    .map(toRepoPath)
    .filter((file): file is string => file !== null);
}

async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  work: (item: T) => Promise<R>,
) {
  const results: R[] = [];
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next;
      next += 1;
      const item = items[index];
      if (item !== undefined) results[index] = await work(item);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}

const classOrder: readonly Class[] = [
  "compiled",
  "compiled-elsewhere",
  "negative-fixture",
  "evidence",
  "lint-context",
];
const classOfRole: Record<Role, Class> = {
  typecheck: "compiled",
  "other-gate": "compiled-elsewhere",
  "negative-fixture": "negative-fixture",
  evidence: "evidence",
  "lint-context": "lint-context",
};

/** The strongest class among the programs a file is actually in. */
export function classify(roles: readonly Role[]): Class {
  const classes = new Set(roles.map((role) => classOfRole[role]));
  return classOrder.find((value) => classes.has(value)) ?? "none";
}

export type FileEntry = {
  file: string;
  class: Class;
  roots: string;
  kind: string;
};

export type Scope = {
  path: string;
  files: number;
  class: Class;
  roots: string;
  kind: string;
};

function append<T>(map: Map<string, T[]>, key: string, value: T) {
  const list = map.get(key);
  if (list) list.push(value);
  else map.set(key, [value]);
}

const signature = (entry: FileEntry | Scope) =>
  JSON.stringify([entry.class, entry.roots, entry.kind]);

const isWithin = (directory: string, home: string) =>
  home === "" || directory === home || directory.startsWith(`${home}/`);

/**
 * The scope a directory states: the most common signature among files rooted only in programs at or
 * above the directory, else the most common signature of files rooted in no program. Ties go to the
 * signature text. A directory with neither states nothing and keeps its parent's scope.
 */
function directoryDefault(directory: string, members: readonly FileEntry[]) {
  const counts = new Map<string, { entry: FileEntry; count: number }>();
  for (const entry of members) {
    const key = signature(entry);
    const known = counts.get(key);
    if (known) known.count += 1;
    else counts.set(key, { entry, count: 1 });
  }
  const best = (candidates: { entry: FileEntry; count: number }[]) =>
    candidates.sort(
      (left, right) =>
        right.count - left.count ||
        signature(left.entry).localeCompare(signature(right.entry)),
    )[0]?.entry;
  const values = [...counts.values()];
  return (
    best(
      values.filter(
        ({ entry }) =>
          entry.roots !== "" &&
          entry.roots
            .split(", ")
            .every((config) =>
              isWithin(
                directory,
                path.posix.dirname(config) === "."
                  ? ""
                  : path.posix.dirname(config),
              ),
            ),
      ),
    ) ?? best(values.filter(({ entry }) => entry.roots === ""))
  );
}

/**
 * Rolls files up by directory. A file is described by the most specific scope that matches it: its
 * own path, else the nearest `dir/**`. A directory states its default (see `directoryDefault`) when
 * it differs from its parent's, and only the files that differ are listed below it. `files` counts
 * the files each scope describes.
 */
export function rollUp(entries: readonly FileEntry[]): Scope[] {
  const scopes: Scope[] = [];
  const visit = (
    directory: string,
    members: readonly FileEntry[],
    inherited: Scope | undefined,
  ) => {
    let current = inherited;
    const head = directoryDefault(directory, members);
    if (head && (!current || signature(current) !== signature(head))) {
      current = {
        path: directory ? `${directory}/**` : "**",
        files: 0,
        class: head.class,
        roots: head.roots,
        kind: head.kind,
      };
      scopes.push(current);
    }
    const prefix = directory ? `${directory}/` : "";
    const children = new Map<string, FileEntry[]>();
    for (const entry of members) {
      const rest = entry.file.slice(prefix.length);
      const slash = rest.indexOf("/");
      if (slash >= 0) append(children, prefix + rest.slice(0, slash), entry);
      else if (current && signature(entry) === signature(current))
        current.files += 1;
      else
        scopes.push({
          path: entry.file,
          files: 1,
          class: entry.class,
          roots: entry.roots,
          kind: entry.kind,
        });
    }
    for (const [child, childMembers] of [...children].sort(([a], [b]) =>
      a.localeCompare(b),
    ))
      visit(child, childMembers, current);
  };
  visit(
    "",
    [...entries].sort((a, b) => a.file.localeCompare(b.file)),
    undefined,
  );
  // A default that every file below overrides describes nothing.
  return scopes.filter((scope) => scope.files > 0);
}

/** Builds the inventory from the tree. */
export async function buildInventory() {
  const programs = discoverPrograms();
  checkProgramCoverage(
    programs,
    git([
      "ls-files",
      "--cached",
      "--others",
      "--exclude-standard",
      "--",
      "*tsconfig*.json",
    ]).filter((file) => /(?:^|\/)tsconfig[^/]*\.json$/.test(file)),
  );
  const tracked = git([
    "ls-files",
    "--cached",
    "--others",
    "--exclude-standard",
  ]).filter((file) => typeScriptFile.test(file));
  const trackedSet = new Set(tracked);
  const members = await mapLimit(programs, 4, (program) =>
    listMembers(program.config),
  );
  const programsOf = new Map<string, Program[]>();
  const rootsOf = new Map<string, string[]>();
  const programSummaries = programs.map((program, index) => {
    const authored = (members[index] ?? []).filter((file) =>
      trackedSet.has(file),
    );
    for (const file of authored) append(programsOf, file, program);
    const roots = listRoots(program.config).filter((file) =>
      trackedSet.has(file),
    );
    for (const file of roots) append(rootsOf, file, program.config);
    const rootSet = new Set(roots);
    return {
      config: program.config,
      role: program.role,
      gate: program.gate,
      trackedMembers: authored.length,
      importedOnly: authored.filter((file) => !rootSet.has(file)).length,
      reason: program.reason,
    };
  });
  const unclassified: string[] = [];
  const entries = tracked.map((file): FileEntry => {
    const inPrograms = programsOf.get(file) ?? [];
    const fileClass = classify(inPrograms.map((program) => program.role));
    let kind = "";
    if (fileClass === "none") {
      const rule = noProgramRules.find(({ prefix }) => file.startsWith(prefix));
      if (rule) kind = rule.kind;
      else unclassified.push(file);
    }
    return {
      file,
      class: fileClass,
      roots: (rootsOf.get(file) ?? []).sort().join(", "),
      kind,
    };
  });
  if (unclassified.length)
    throw new Error(
      `Tracked TypeScript in no program and no named reason: ${unclassified.join(", ")}`,
    );
  const counts = Object.fromEntries(
    [...classOrder, "none"].map((value) => [
      value,
      entries.filter((entry) => entry.class === value).length,
    ]),
  );
  const generated = tracked.flatMap((file) => {
    const source = generatedSources.find(({ pattern }) => pattern.test(file));
    if (!source) return [];
    const entry = entries.find((candidate) => candidate.file === file);
    return [
      {
        file,
        producer: source.producer,
        class: entry?.class ?? "none",
      },
    ];
  });
  return {
    description:
      "Tracked TypeScript by actual program membership (TS-3, design L9). A file is described by the most specific scope matching it: its own path, else the nearest dir/**. Regenerate with `node scripts/verify/typescript-programs.mts --write`; check with `--check`.",
    classes: {
      compiled: "In a program that `bun run typecheck` compiles.",
      "compiled-elsewhere": "In a program another gate compiles.",
      "negative-fixture": "In a program that is meant to fail.",
      evidence: "In a documentation evidence program no gate compiles.",
      "lint-context": `Only in central-test lint-context programs; compiling them is ${followUp}.`,
      none: "In no program; `kind` names why.",
    },
    kinds: Object.fromEntries(
      noProgramRules.map(({ kind, reason }) => [kind, reason]),
    ),
    trackedFiles: tracked.length,
    counts,
    programs: programSummaries,
    generated,
    scopes: rollUp(entries),
  };
}

export function serialize(inventory: unknown) {
  return `${JSON.stringify(inventory, null, 2)}\n`;
}

async function main(argv: readonly string[]) {
  const mode = argv[0];
  if (argv.length !== 1 || (mode !== "--write" && mode !== "--check"))
    throw new Error(
      "Run: node scripts/verify/typescript-programs.mts --write | --check",
    );
  const text = serialize(await buildInventory());
  const target = path.join(root, inventoryFile);
  if (mode === "--write") {
    writeFileSync(target, text);
    console.log(`Wrote ${inventoryFile}`);
    return 0;
  }
  if (readFileSync(target, "utf8").replaceAll("\r\n", "\n") === text) {
    console.log(`${inventoryFile} matches the tree`);
    return 0;
  }
  console.error(
    `${inventoryFile} is stale: run node scripts/verify/typescript-programs.mts --write`,
  );
  return 1;
}

if (import.meta.main) {
  main(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 2;
    },
  );
}
