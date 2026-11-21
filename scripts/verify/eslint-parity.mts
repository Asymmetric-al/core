// The ESLint parity list (PL-0, design L5).
//
// Every ESLint config that a command runs today (a workspace `lint` script, a root script or a
// `lint-staged` entry) is resolved by ESLint itself, with `calculateConfigForFile`, over one probe path
// per file kind in each directory that command lints. Each rule at `error` is listed with its scopes and
// mapped to the Oxlint rule of the same name, to the shadcn UI bridge, or to a gap with its reason.
// `--write` refreshes the record; `--check` regenerates it in memory and exits 1 on drift. A setup
// failure exits 2.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ESLint } from "eslint";

import { lintInvocation } from "../../tooling/eslint-config/lint.mjs";
import { formatSource } from "../lib/format-source.mts";

const core = fileURLToPath(new URL("../../", import.meta.url));
export const recordFile = "tooling/quality/eslint-parity.json";
const command = "node scripts/verify/eslint-parity.mts";
const usage = `Run: ${command} --write | --check`;
const oxlintBin = path.join(core, "node_modules/oxlint/bin/oxlint");
const extensions = ["cjs", "cts", "js", "jsx", "mjs", "mts", "ts", "tsx"];
const designSystemRunner = "tooling/eslint-config/lint.mjs";
const bridge = `bun run lint:ui (${designSystemRunner})`;

// ESLint plugin prefix to the Oxlint plugin that ports it.
const oxlintPlugins = new Map([
  ["", "eslint"],
  ["@next/next", "nextjs"],
  ["@typescript-eslint", "typescript"],
  ["import", "import"],
  ["import-x", "import"],
  ["jsx-a11y", "jsx_a11y"],
  ["react", "react"],
  ["react-hooks", "react"],
]);

// The gaps design L5 expects, with the reason each one loses no enforcement.
const expectedGaps: Record<string, string> = {
  "react-hooks/config":
    "Checks the React Compiler's configuration. Core does not run the React Compiler, so there is nothing for it to check (design L5).",
  "react-hooks/gating":
    "Checks the React Compiler's gating mode. Core does not run the React Compiler, so there is nothing for it to check (design L5).",
  "react/jsx-uses-react":
    "Reports nothing: it only marks the JSX pragma variable (React) as used, for no-unused-vars under the classic JSX runtime. Without it no-unused-vars can only gain findings.",
  "react/jsx-uses-vars":
    "Reports nothing: it only marks JSX element names as used, for no-unused-vars. Oxlint's no-unused-vars counts JSX references itself; the clean control relies on that.",
};

export type Mapping =
  | {
      kind: "oxlint";
      plugin: string;
      rule: string;
      name: string;
      typeAware: boolean;
      note?: string;
    }
  | { kind: "bridge"; bridge: string }
  | { kind: "gap"; expected: boolean; reason: string };

export type ParityRule = {
  rule: string;
  scopes: Record<string, string[]>;
  options: boolean;
  mapping: Mapping;
};

export type ParitySource = {
  config: string;
  cwd: string;
  configLookup: boolean;
  commands: string[];
  scopes: string[];
  rulesAtError: number;
};

export type ParityRecord = {
  generatedBy: string;
  eslint: string;
  oxlint: string;
  counts: {
    rules: number;
    oxlint: number;
    bridge: number;
    gaps: number;
    unexpectedGaps: number;
  };
  sources: ParitySource[];
  notLinted: string[];
  rules: ParityRule[];
};

type Unit = { path: string; file: boolean; extensions: Set<string> };
type Source = {
  config: string;
  cwd: string;
  configLookup: boolean;
  commands: Set<string>;
  units: Map<string, Unit>;
};
type Runner = { runner: "eslint" | "lint.mjs"; targets: string[] };
type OxlintRule = { scope: string; value: string; typeAware: boolean };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

function readJson(file: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`Cannot read ${file}: ${errorMessage(error)}`, {
      cause: error,
    });
  }
  if (!isRecord(parsed)) throw new Error(`${file} is not a JSON object`);
  return parsed;
}

function stringEntries(value: unknown) {
  if (!isRecord(value)) return [];
  return Object.entries(value).flatMap(([key, entry]): [string, string][] => {
    if (typeof entry === "string") return [[key, entry]];
    if (Array.isArray(entry))
      return entry
        .filter((item): item is string => typeof item === "string")
        .map((item) => [key, item]);
    return [];
  });
}

const extensionOf = (file: string) => path.posix.extname(file).slice(1);
const braces = (items: string[]) =>
  items.length === 1 ? (items[0] ?? "") : `{${items.join(",")}}`;
const expandBraces = (text: string) =>
  text.startsWith("{") && text.endsWith("}")
    ? text.slice(1, -1).split(",")
    : [text];

// An ESLint command this tool can model, or undefined for a command that does not run ESLint.
function parseRunner(
  text: string,
  cwd: string,
  root: string,
): Runner | undefined {
  const words = text.trim().split(/\s+/);
  const [program, script] = words;
  let runner: Runner["runner"] | undefined;
  if (program === "eslint") runner = "eslint";
  else if (
    program === "node" &&
    script !== undefined &&
    path.resolve(root, cwd, script) === path.join(root, designSystemRunner)
  )
    runner = "lint.mjs";
  if (!runner) {
    if (
      words.includes("eslint") ||
      words.some((word) => word.endsWith(designSystemRunner))
    )
      throw new Error(`Cannot model the ESLint command "${text}" in ${cwd}`);
    return undefined;
  }
  if (/[|&;<>()$`"'\\]/.test(text))
    throw new Error(`Cannot model the shell syntax in "${text}" (${cwd})`);
  const args = words.slice(runner === "eslint" ? 1 : 2);
  // --fix changes what a run writes, not which config applies.
  const option = args.find((arg) => arg.startsWith("-") && arg !== "--fix");
  if (option)
    throw new Error(
      `Cannot model the ESLint option ${option} in "${text}" (${cwd})`,
    );
  return { runner, targets: args.filter((arg) => !arg.startsWith("-")) };
}

function trackedFiles(root: string) {
  return execFileSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  })
    .split("\0")
    .filter(Boolean);
}

function workspaces(
  root: string,
  manifest: Record<string, unknown>,
  tracked: Set<string>,
) {
  const patterns = Array.isArray(manifest.workspaces)
    ? manifest.workspaces
    : [];
  const found = new Set<string>();
  for (const pattern of patterns) {
    if (typeof pattern !== "string")
      throw new Error("Unreadable workspaces field");
    if (pattern.endsWith("/*") && !pattern.slice(0, -2).includes("*")) {
      const parent = pattern.slice(0, -1);
      for (const file of tracked) {
        const rest = file.startsWith(parent) ? file.slice(parent.length) : "";
        const [name, leaf, extra] = rest.split("/");
        if (name && leaf === "package.json" && extra === undefined)
          found.add(`${parent}${name}`);
      }
    } else if (!pattern.includes("*")) {
      if (tracked.has(`${pattern}/package.json`)) found.add(pattern);
    } else throw new Error(`Cannot expand the workspace pattern ${pattern}`);
  }
  return [...found]
    .sort()
    .filter((workspace) => existsSync(path.join(root, workspace)));
}

function oxlintRules() {
  const run = (args: string[]) => {
    const result = spawnSync(process.execPath, [oxlintBin, ...args], {
      cwd: core,
      encoding: "utf8",
      shell: false,
      maxBuffer: 64 * 1024 * 1024,
    });
    if (result.error) throw result.error;
    if (result.status !== 0)
      throw new Error(`oxlint ${args.join(" ")} failed: ${result.stderr}`);
    return result.stdout;
  };
  const version = /(\d+\.\d+\.\d+\S*)/.exec(run(["--version"]))?.[1];
  if (!version) throw new Error("Cannot read the Oxlint version");
  const listed: unknown = JSON.parse(run(["--rules", "--format", "json"]));
  if (!Array.isArray(listed)) throw new Error("Unreadable Oxlint rule list");
  const rules = new Map<string, OxlintRule>();
  for (const entry of listed) {
    if (
      !isRecord(entry) ||
      typeof entry.scope !== "string" ||
      typeof entry.value !== "string" ||
      typeof entry.type_aware !== "boolean"
    )
      throw new Error("Unreadable Oxlint rule entry");
    rules.set(`${entry.scope}/${entry.value}`, {
      scope: entry.scope,
      value: entry.value,
      typeAware: entry.type_aware,
    });
  }
  return { version, rules };
}

// The base rule a typescript-eslint extension rule replaces, read from the rule's own metadata.
function extendedBaseRule(
  plugins: Map<string, unknown>,
  plugin: string,
  name: string,
) {
  const definition = plugins.get(plugin);
  const rules = isRecord(definition) ? definition.rules : undefined;
  const rule = isRecord(rules) ? rules[name] : undefined;
  const meta = isRecord(rule) ? rule.meta : undefined;
  const docs = isRecord(meta) ? meta.docs : undefined;
  const base = isRecord(docs) ? docs.extendsBaseRule : undefined;
  return base === true ? name : typeof base === "string" ? base : undefined;
}

function mapRule(
  rule: string,
  plugins: Map<string, unknown>,
  oxlint: { version: string; rules: Map<string, OxlintRule> },
): Mapping {
  const slash = rule.lastIndexOf("/");
  const plugin = slash < 0 ? "" : rule.slice(0, slash);
  const name = rule.slice(slash + 1);
  if (plugin === "shadcn") return { kind: "bridge", bridge };
  const toMapping = (
    target: OxlintRule,
  ): Extract<Mapping, { kind: "oxlint" }> => ({
    kind: "oxlint",
    plugin: target.scope,
    rule: target.value,
    name: `${target.scope.replaceAll("_", "-")}/${target.value}`,
    typeAware: target.typeAware,
  });
  const scope = oxlintPlugins.get(plugin);
  if (scope !== undefined) {
    const direct = oxlint.rules.get(`${scope}/${name}`);
    if (direct) return toMapping(direct);
    const base = extendedBaseRule(plugins, plugin, name);
    const coreRule = base ? oxlint.rules.get(`eslint/${base}`) : undefined;
    if (coreRule)
      return {
        ...toMapping(coreRule),
        note: `typescript-eslint extends the core rule ${coreRule.value}; Oxlint has one rule for both.`,
      };
  }
  const reason = expectedGaps[rule];
  if (reason) return { kind: "gap", expected: true, reason };
  return {
    kind: "gap",
    expected: false,
    reason: `No Oxlint ${oxlint.version} rule matches${scope === undefined ? ` (no Oxlint plugin ports "${plugin}")` : ""}; design L5 does not expect this gap.`,
  };
}

const atError = (value: unknown) => {
  const level = Array.isArray(value) ? value[0] : value;
  return level === 2 || level === "error";
};

function scopeGlobs(unit: Unit, kinds: Set<string>) {
  if (unit.file) return kinds.size ? [unit.path] : [];
  const reach = [...unit.extensions].sort();
  const modules = reach.filter((extension) => kinds.has(extension));
  const tests = reach.filter((extension) => kinds.has(`test.${extension}`));
  if (modules.join() !== tests.join())
    throw new Error(
      `Test files and other files get different rules in ${unit.path}; the scope notation cannot express that`,
    );
  if (!modules.length) return [];
  return [
    modules.length === extensions.length
      ? `${unit.path}/**`
      : `${unit.path}/**/*.${braces(modules)}`,
  ];
}

const unitGlob = (unit: Unit) =>
  scopeGlobs(
    unit,
    new Set(
      [...unit.extensions].flatMap((extension) => [
        extension,
        `test.${extension}`,
      ]),
    ),
  )[0] ?? unit.path;

export async function generate({
  root = core,
}: { root?: string } = {}): Promise<ParityRecord> {
  const absolute = (file: string) => path.join(root, file);
  const repoPath = (file: string) =>
    path.relative(root, file).split(path.sep).join("/") || ".";
  const tracked = trackedFiles(root);
  const trackedSet = new Set(tracked);
  const lintable = tracked.filter((file) =>
    extensions.includes(extensionOf(file)),
  );
  const sources = new Map<string, Source>();
  const lookups = new Map<string, ESLint>();

  const unitFor = (target: string): Unit => {
    const normalized = path.posix.normalize(target).replace(/\/$/, "");
    if (trackedSet.has(normalized))
      return {
        path: normalized,
        file: true,
        extensions: new Set([extensionOf(normalized)]),
      };
    if (
      normalized === "." ||
      tracked.some((file) => file.startsWith(`${normalized}/`))
    )
      return { path: normalized, file: false, extensions: new Set(extensions) };
    throw new Error(
      `An ESLint command lints ${target}, which has no tracked files`,
    );
  };
  const addUnits = (
    config: string,
    cwd: string,
    configLookup: boolean,
    label: string,
    units: Unit[],
  ) => {
    let source = sources.get(config);
    if (!source) {
      source = {
        config,
        cwd,
        configLookup,
        commands: new Set(),
        units: new Map(),
      };
      sources.set(config, source);
    }
    if (source.cwd !== cwd || source.configLookup !== configLookup)
      throw new Error(
        `${config} is run in two ways; the record cannot express that`,
      );
    source.commands.add(label);
    for (const unit of units) {
      const known = source.units.get(unit.path);
      if (known)
        for (const extension of unit.extensions)
          known.extensions.add(extension);
      else
        source.units.set(unit.path, {
          ...unit,
          extensions: new Set(unit.extensions),
        });
    }
  };
  const addRun = async (
    label: string,
    cwd: string,
    run: Runner,
    staged?: Unit[],
  ) => {
    if (run.runner === "lint.mjs") {
      const invocation = lintInvocation({
        args: run.targets,
        cwd: absolute(cwd),
        rootDir: root,
      });
      const targets = run.targets.length
        ? run.targets.map((target) => path.posix.join(cwd, target))
        : invocation.workspace
          ? [cwd]
          : invocation.workspaces;
      addUnits(
        repoPath(invocation.configFile),
        repoPath(invocation.cwd),
        false,
        label,
        staged ?? targets.map(unitFor),
      );
      return;
    }
    let eslint = lookups.get(cwd);
    if (!eslint) {
      eslint = new ESLint({ cwd: absolute(cwd), cache: false });
      lookups.set(cwd, eslint);
    }
    for (const target of run.targets.length ? run.targets : ["."]) {
      const unit = unitFor(path.posix.join(cwd, target));
      const probe = unit.file ? unit.path : `${unit.path}/parity-probe.js`;
      const config = await eslint.findConfigFile(absolute(probe));
      if (!config) throw new Error(`No ESLint config applies to ${unit.path}`);
      addUnits(repoPath(config), cwd, true, label, [unit]);
    }
  };

  const manifest = readJson(absolute("package.json"));
  for (const [name, text] of stringEntries(manifest.scripts)) {
    const run = parseRunner(text, ".", root);
    if (run) await addRun(`bun run ${name}`, ".", run);
  }
  for (const [glob, text] of stringEntries(manifest["lint-staged"])) {
    const run = parseRunner(text, ".", root);
    if (!run) continue;
    const match = /^(\{[^{}/]+\}|[^{}/*?]+)\/\*\*\/\*\.(\{[\w,]+\}|\w+)$/.exec(
      glob,
    );
    if (!match?.[1] || !match[2])
      throw new Error(`Cannot model the lint-staged glob ${glob}`);
    const globExtensions = expandBraces(match[2]);
    const units = new Map<string, Unit>();
    for (const top of expandBraces(match[1])) {
      for (const file of lintable) {
        if (
          !file.startsWith(`${top}/`) ||
          !globExtensions.includes(extensionOf(file))
        )
          continue;
        const [, child, rest] = file.split("/");
        const unitPath = rest === undefined ? file : `${top}/${child}`;
        units.set(unitPath, {
          path: unitPath,
          file: rest === undefined,
          extensions: new Set(
            rest === undefined ? [extensionOf(file)] : globExtensions,
          ),
        });
      }
    }
    await addRun(`lint-staged ${glob}`, ".", run, [...units.values()]);
  }
  for (const workspace of workspaces(root, manifest, trackedSet)) {
    const workspaceManifest = readJson(absolute(`${workspace}/package.json`));
    const lint = stringEntries(workspaceManifest.scripts).find(
      ([name]) => name === "lint",
    )?.[1];
    const run =
      lint === undefined ? undefined : parseRunner(lint, workspace, root);
    if (run) await addRun(`${workspace}: lint`, workspace, run);
    else if (
      tracked.some(
        (file) =>
          /^eslint\.config\.[cm]?[jt]s$/.test(
            file.slice(workspace.length + 1),
          ) && file.startsWith(`${workspace}/`),
      )
    )
      throw new Error(
        `${workspace} has an ESLint config but its lint script does not run ESLint`,
      );
  }
  if (!sources.size)
    throw new Error("No command runs ESLint; nothing to compare");

  const oxlint = oxlintRules();
  const hits = new Map<string, Map<string, Map<string, Set<string>>>>();
  const withOptions = new Set<string>();
  const perSource = new Map<string, Set<string>>();
  const plugins = new Map<string, unknown>();
  for (const source of sources.values()) {
    const eslint = new ESLint({
      cwd: absolute(source.cwd),
      cache: false,
      ...(source.configLookup
        ? {}
        : { overrideConfigFile: absolute(source.config) }),
    });
    const atErrorHere = new Set<string>();
    perSource.set(source.config, atErrorHere);
    for (const unit of source.units.values()) {
      const probes = unit.file
        ? [{ file: unit.path, kind: extensionOf(unit.path) }]
        : [...unit.extensions].flatMap((extension) => [
            { file: `${unit.path}/parity-probe.${extension}`, kind: extension },
            {
              file: `${unit.path}/parity-probe.test.${extension}`,
              kind: `test.${extension}`,
            },
          ]);
      for (const probe of probes) {
        const file = absolute(probe.file);
        if (await eslint.isPathIgnored(file)) continue;
        const config: unknown = await eslint.calculateConfigForFile(file);
        if (!isRecord(config)) continue;
        if (isRecord(config.plugins))
          for (const [name, plugin] of Object.entries(config.plugins))
            if (!plugins.has(name)) plugins.set(name, plugin);
        if (!isRecord(config.rules)) continue;
        for (const [rule, value] of Object.entries(config.rules)) {
          if (!atError(value)) continue;
          atErrorHere.add(rule);
          if (Array.isArray(value) && value.length > 1) withOptions.add(rule);
          let byConfig = hits.get(rule);
          if (!byConfig) hits.set(rule, (byConfig = new Map()));
          let byUnit = byConfig.get(source.config);
          if (!byUnit) byConfig.set(source.config, (byUnit = new Map()));
          let kinds = byUnit.get(unit.path);
          if (!kinds) byUnit.set(unit.path, (kinds = new Set()));
          kinds.add(probe.kind);
        }
      }
    }
  }

  const rules = [...hits.keys()].sort().map((rule): ParityRule => {
    const scopes: Record<string, string[]> = {};
    for (const [config, byUnit] of [...(hits.get(rule) ?? [])].sort(
      ([a], [b]) => a.localeCompare(b, "en"),
    )) {
      const source = sources.get(config);
      if (!source) continue;
      const globs = [...byUnit].flatMap(([unitPath, kinds]) => {
        const unit = source.units.get(unitPath);
        return unit ? scopeGlobs(unit, kinds) : [];
      });
      if (globs.length) scopes[config] = globs.sort();
    }
    return {
      rule,
      scopes,
      options: withOptions.has(rule),
      mapping: mapRule(rule, plugins, oxlint),
    };
  });

  const reached = (file: string) =>
    [...sources.values()].some((source) =>
      [...source.units.values()].some((unit) =>
        unit.file
          ? unit.path === file
          : (unit.path === "." || file.startsWith(`${unit.path}/`)) &&
            unit.extensions.has(extensionOf(file)),
      ),
    );
  const tops = new Map<string, boolean>();
  for (const file of lintable) {
    const slash = file.indexOf("/");
    const top = slash < 0 ? file : `${file.slice(0, slash)}/**`;
    tops.set(top, (tops.get(top) ?? false) || reached(file));
  }
  const count = (kind: Mapping["kind"]) =>
    rules.filter((entry) => entry.mapping.kind === kind).length;
  return {
    generatedBy: `${command} --write`,
    eslint: ESLint.version,
    oxlint: oxlint.version,
    counts: {
      rules: rules.length,
      oxlint: count("oxlint"),
      bridge: count("bridge"),
      gaps: count("gap"),
      unexpectedGaps: rules.filter(
        (entry) => entry.mapping.kind === "gap" && !entry.mapping.expected,
      ).length,
    },
    sources: [...sources.values()]
      .sort((a, b) => a.config.localeCompare(b.config, "en"))
      .map((source) => ({
        config: source.config,
        cwd: source.cwd,
        configLookup: source.configLookup,
        commands: [...source.commands].sort(),
        scopes: [...source.units.values()].map(unitGlob).sort(),
        rulesAtError: perSource.get(source.config)?.size ?? 0,
      })),
    notLinted: [...tops]
      .filter(([, isReached]) => !isReached)
      .map(([top]) => top)
      .sort(),
    rules,
  };
}

export const render = (record: ParityRecord) =>
  formatSource(recordFile, `${JSON.stringify(record, null, 2)}\n`, "trusted");

export async function run(
  argv: string[],
  { root = core }: { root?: string } = {},
) {
  try {
    const [mode, ...extra] = argv;
    if ((mode !== "--write" && mode !== "--check") || extra.length)
      throw new Error(
        `Unknown arguments: ${argv.join(" ") || "(none)"}. ${usage}`,
      );
    const content = await render(await generate({ root }));
    const target = path.join(root, recordFile);
    if (mode === "--write") {
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, content);
      console.log(`Wrote ${recordFile}.`);
      return 0;
    }
    const current = existsSync(target)
      ? readFileSync(target, "utf8")
      : undefined;
    if (current === content) {
      console.log(`${recordFile} is current.`);
      return 0;
    }
    console.error(
      current === undefined
        ? `${recordFile} is missing. Run: ${command} --write`
        : `${recordFile} is stale: the incumbent ESLint configs, their plugins or Oxlint changed. Run: ${command} --write, and review the difference.`,
    );
    return 1;
  } catch (error) {
    console.error(`ESLint parity setup failed: ${errorMessage(error)}`);
    return 2;
  }
}

if (import.meta.main) process.exitCode = await run(process.argv.slice(2));
