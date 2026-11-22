// PL-0 (design L5): the ESLint parity list is current, and every rule it maps to Oxlint fires on a seeded
// violation through the pinned Oxlint binary. Each seed is also linted by the incumbent ESLint config that
// enforces the rule, so a seed shaped to Oxlint's behavior alone cannot pass.
import { execFileSync, spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, sep } from "node:path";

import { ESLint } from "eslint";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  removeFixture,
  root,
  timeout,
} from "../../fixtures/quality/launcher.ts";
import {
  type ParityRecord,
  generate,
  recordFile,
  render,
  run,
} from "../../../scripts/verify/eslint-parity.mts";

const fixtures = join(root, "tests/fixtures/quality/eslint-parity");
const oxlint = join(root, "node_modules/oxlint/bin/oxlint");
const seedRoot = join(fixtures, "seeds");
const posix = (file: string) => file.split(sep).join("/");

function filesUnder(directory: string): string[] {
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      posix(relative(directory, join(entry.parentPath, entry.name))),
    )
    .sort();
}

// Seeds live at seeds/<plugin>/<rule>/<path>.txt so the root lint and typecheck never read them.
const seeds = readdirSync(seedRoot)
  .flatMap((plugin) =>
    readdirSync(join(seedRoot, plugin)).map((rule) => `${plugin}/${rule}`),
  )
  .sort();

// Options a rule needs before it can report at all. They copy the incumbent's option shape.
const ruleOptions: Record<string, unknown[]> = {
  "eslint/no-restricted-imports": [
    {
      patterns: [
        {
          group: ["motion/react", "framer-motion"],
          message: "Import motion APIs from @asym/lib/motion.",
        },
      ],
    },
  ],
};

// Finding PL-0-F2: seeds that fire in neither engine. Each is a violation in the shape the incumbent rule
// describes, yet ESLint's rule reports nothing on it in lint mode, and neither does Oxlint's port. The tests
// pin that both stay silent, so a change in either engine fails here and the seed gets reviewed.
const silentSeeds: Record<string, string> = {
  "react/preserve-manual-memoization":
    "a dependency that is changed after the memoized call ('This dependency may be modified later')",
};

// The unit run reads the committed record. Other work adds and re-scopes ESLint rules while this migration is in
// flight, and that must not fail an unrelated pull request. Drift is checked on request: run
// `node scripts/verify/eslint-parity.mts --check`, or this file with CORE_ESLINT_PARITY=live. LC-1 does both
// before ESLint is retired.
const live = process.env.CORE_ESLINT_PARITY === "live";
let record: ParityRecord;
beforeAll(async () => {
  const committed: ParityRecord = JSON.parse(
    readFileSync(join(root, recordFile), "utf8"),
  );
  record = live ? await generate() : committed;
}, timeout);

describe("the ESLint parity list", () => {
  it.runIf(live)("matches the committed record", { timeout }, async () => {
    expect(
      readFileSync(join(root, recordFile), "utf8"),
      "Run `node scripts/verify/eslint-parity.mts --write` and review the difference",
    ).toBe(await render(record));
  });

  it("maps every rule at error to Oxlint, the UI bridge or a stated gap", () => {
    expect(record.rules.length).toBeGreaterThan(0);
    for (const entry of record.rules) {
      expect(Object.keys(entry.scopes).length, entry.rule).toBeGreaterThan(0);
      if (entry.mapping.kind === "gap")
        expect(entry.mapping.reason.length, entry.rule).toBeGreaterThan(20);
    }
    const bridged = record.rules
      .filter((entry) => entry.mapping.kind === "bridge")
      .map((entry) => entry.rule);
    expect(bridged).toEqual([
      "shadcn/no-arbitrary-values",
      "shadcn/no-inline-styles",
      "shadcn/no-raw-colors",
      "shadcn/no-restyle",
      "shadcn/no-unknown-classes",
      "shadcn/require-static-classes",
    ]);
    const gaps = record.rules.flatMap((entry) =>
      entry.mapping.kind === "gap"
        ? [{ rule: entry.rule, expected: entry.mapping.expected }]
        : [],
    );
    // The plan expects the two React Compiler setup rules and two rules that never report.
    expect(gaps.filter((gap) => gap.expected).map((gap) => gap.rule)).toEqual([
      "react-hooks/config",
      "react-hooks/gating",
      "react/jsx-uses-react",
      "react/jsx-uses-vars",
    ]);
    // Enforced rules with no Oxlint counterpart, each to be decided before the cutover (LC-1). PL-0-F1:
    // `react/no-deprecated`. E82: Core's own three tenant rules, which arrived from develop and must stay
    // enforced (design L10). A regenerated record with another unexpected gap fails here until it is listed.
    expect(gaps.filter((gap) => !gap.expected).map((gap) => gap.rule)).toEqual([
      "own-api/no-direct-call",
      "react/no-deprecated",
      "tenant-navigation/no-prefixless-navigation",
      "tenant-navigation/no-tenantless-cache",
    ]);
  });

  it("has exactly one seed directory per Oxlint rule it maps to", () => {
    const mapped = new Set<string>();
    for (const entry of record.rules)
      if (entry.mapping.kind === "oxlint") mapped.add(entry.mapping.name);
    expect(seeds).toEqual([...mapped].sort());
  });

  it("maps no rule to a typed Oxlint rule, so one untyped run covers every seed", () => {
    // A typed rule here needs a second run with --type-aware through the TSRS backend, set up as
    // tooling/quality/lint.mts does it; until then its seed would never fire.
    expect(
      record.rules.filter(
        (entry) => entry.mapping.kind === "oxlint" && entry.mapping.typeAware,
      ),
    ).toEqual([]);
  });
});

describe("the parity command", () => {
  let repo: string;
  const write = (file: string, content: string) => {
    mkdirSync(dirname(join(repo, file)), { recursive: true });
    writeFileSync(join(repo, file), content);
  };
  const manifest = (lint: string) =>
    write(
      "packages/sample/package.json",
      JSON.stringify({ name: "sample", scripts: { lint } }),
    );
  beforeAll(() => {
    repo = mkdtempSync(join(tmpdir(), "quality-eslint-parity-"));
    execFileSync("git", ["init", "--quiet"], { cwd: repo });
    write("package.json", JSON.stringify({ workspaces: ["packages/*"] }));
    write(
      "packages/sample/eslint.config.mjs",
      'export default [{ files: ["**/*.js"], rules: { "no-var": "error", "prefer-const": "warn" } }, { files: ["**/*.ts"], plugins: { local: { rules: { rule: { create: () => ({}) } } } }, rules: { "local/rule": 2 } }];\n',
    );
    write("packages/sample/index.js", "export const value = 1;\n");
    manifest("eslint .");
    execFileSync("git", ["add", "."], { cwd: repo });
  });
  afterAll(() => removeFixture(tmpdir(), repo));

  it("writes, checks and detects drift", { timeout }, async () => {
    const options = { root: repo };
    expect(await run(["--check"], options)).toBe(1);
    expect(await run(["--write"], options)).toBe(0);
    const written = readFileSync(join(repo, recordFile), "utf8");
    const generated = await generate(options);
    expect(generated.rules).toEqual([
      expect.objectContaining({
        rule: "local/rule",
        scopes: {
          "packages/sample/eslint.config.mjs": ["packages/sample/**/*.ts"],
        },
        mapping: expect.objectContaining({ kind: "gap", expected: false }),
      }),
      expect.objectContaining({
        rule: "no-var",
        scopes: {
          "packages/sample/eslint.config.mjs": ["packages/sample/**/*.js"],
        },
        mapping: {
          kind: "oxlint",
          plugin: "eslint",
          rule: "no-var",
          name: "eslint/no-var",
          typeAware: false,
        },
      }),
    ]);
    expect(await run(["--check"], options)).toBe(0);
    writeFileSync(
      join(repo, recordFile),
      written.replace('"no-var"', '"no-let"'),
    );
    expect(await run(["--check"], options)).toBe(1);
  });

  it.each([
    ["an unknown argument", ["--fix"], "eslint ."],
    ["no mode", [], "eslint ."],
    [
      "an ESLint option it cannot model",
      ["--check"],
      "eslint --max-warnings 0 .",
    ],
    ["a shell pipeline", ["--check"], "eslint . && echo done"],
  ])("exits 2 on %s", { timeout }, async (_name, argv, lint) => {
    manifest(lint);
    try {
      expect(await run(argv, { root: repo })).toBe(2);
    } finally {
      manifest("eslint .");
    }
  });

  it("exits 2 when an ESLint config fails to load", { timeout }, async () => {
    write(
      "packages/sample/eslint.config.mjs",
      "export default [{ rules: { 'x/y': 'error' } }];\nthrow new Error('broken config');\n",
    );
    expect(await run(["--check"], { root: repo })).toBe(2);
  });
});

describe("seeded violations", () => {
  type Finding = { file: string; seed: string | undefined; rule: string };
  let directory: string;
  let findings: Finding[];
  let rulesRun: number;
  let enabled: string[];

  beforeAll(() => {
    directory = mkdtempSync(join(tmpdir(), "quality-eslint-parity-seeds-"));
    for (const file of filesUnder(fixtures))
      cpSync(join(fixtures, file), join(directory, file.replace(/\.txt$/, "")));
    enabled = [...new Set(seeds)];
    const plugins = [
      ...new Set(enabled.map((name) => name.split("/")[0] ?? "")),
    ].filter((plugin) => plugin !== "eslint");
    const config = {
      plugins,
      categories: Object.fromEntries(
        [
          "correctness",
          "nursery",
          "pedantic",
          "perf",
          "restriction",
          "style",
          "suspicious",
        ].map((category) => [category, "off"]),
      ),
      rules: Object.fromEntries(
        enabled.map((name) => [name, ["error", ...(ruleOptions[name] ?? [])]]),
      ),
      settings: {
        next: { rootDir: "seeds/nextjs/no-html-link-for-pages" },
      },
    };
    writeFileSync(join(directory, ".oxlintrc.json"), JSON.stringify(config));
    // The flags the launcher passes. The launcher itself always loads the root config, so the seeds
    // run through the pinned binary with this single-purpose config instead.
    const result = spawnSync(
      process.execPath,
      [
        oxlint,
        "-c",
        ".oxlintrc.json",
        "--disable-nested-config",
        "--deny-warnings",
        "--format",
        "json",
        ".",
      ],
      {
        cwd: directory,
        encoding: "utf8",
        shell: false,
        timeout: timeout - 10_000,
      },
    );
    if (result.error) throw result.error;
    if (result.status !== 0 && result.status !== 1)
      throw new Error(`Oxlint failed (${result.status}): ${result.stderr}`);
    const report: {
      diagnostics: { filename: string; url?: string; code: string }[];
      number_of_rules: number;
    } = JSON.parse(result.stdout);
    rulesRun = report.number_of_rules;
    findings = report.diagnostics.map((diagnostic) => {
      const name = /\/rules\/([\w-]+)\/([\w-]+)\.html$/.exec(
        diagnostic.url ?? "",
      );
      if (!name)
        throw new Error(`Unmapped Oxlint diagnostic: ${diagnostic.code}`);
      const file = posix(diagnostic.filename);
      const seed = /^seeds\/([\w-]+\/[\w-]+)\//.exec(file)?.[1];
      // Oxlint's URLs name the plugin as it lists it (jsx_a11y); config names use a dash.
      return {
        file,
        seed,
        rule: `${name[1]?.replaceAll("_", "-")}/${name[2]}`,
      };
    });
  }, timeout);
  afterAll(() => removeFixture(tmpdir(), directory));

  it("runs exactly the mapped rules", () => {
    expect(rulesRun).toBe(enabled.length);
  });

  it.each(seeds)("%s fires on its seed and on nothing else there", (seed) => {
    const fired = findings.filter((finding) => finding.seed === seed);
    if (silentSeeds[seed]) {
      expect(fired, seed).toEqual([]);
      return;
    }
    expect(fired.length, seed).toBeGreaterThan(0);
    expect(new Set(fired.map((finding) => finding.rule))).toEqual(
      new Set([seed]),
    );
  });

  it("reports nothing on the clean control", () => {
    expect(filesUnder(join(fixtures, "clean")).length).toBeGreaterThan(0);
    expect(findings.filter((finding) => finding.seed === undefined)).toEqual(
      [],
    );
  });

  describe("through the incumbent ESLint rule", () => {
    const engines = new Map<string, ESLint>();
    const engine = (config: string, cwd: string, lookup: boolean) => {
      const key = `${config}\0${cwd}`;
      let eslint = engines.get(key);
      if (!eslint) {
        eslint = new ESLint({
          cwd: join(root, cwd),
          cache: false,
          ...(lookup ? {} : { overrideConfigFile: join(root, config) }),
          overrideConfig: [
            {
              files: ["**/*.{ts,tsx,mts,cts}"],
              languageOptions: { parserOptions: { projectService: false } },
            },
            {
              settings: {
                next: {
                  rootDir: join(
                    directory,
                    "seeds/nextjs/no-html-link-for-pages",
                  ),
                },
              },
            },
          ],
        });
        engines.set(key, eslint);
      }
      return eslint;
    };

    it.each(seeds)(
      "%s's seed violates the rule it maps from",
      { timeout },
      async (seed) => {
        const incumbents = record.rules.filter(
          (entry) =>
            entry.mapping.kind === "oxlint" && entry.mapping.name === seed,
        );
        expect(incumbents.length).toBeGreaterThan(0);
        for (const incumbent of incumbents) {
          const [config, scopes] =
            Object.entries(incumbent.scopes)
              .flatMap(([source, globs]) =>
                globs
                  .filter((glob) => glob.includes("/**"))
                  .map((glob): [string, string] => [source, glob]),
              )
              .sort(
                ([, a], [, b]) =>
                  Number(!a.endsWith("/**")) - Number(!b.endsWith("/**")),
              )[0] ?? [];
          expect(config, incumbent.rule).toBeDefined();
          if (!config || !scopes) continue;
          const source = record.sources.find(
            (entry) => entry.config === config,
          );
          expect(source, config).toBeDefined();
          if (!source) continue;
          const eslint = engine(config, source.cwd, source.configLookup);
          const scope = scopes.slice(0, scopes.indexOf("/**"));
          const reported: string[] = [];
          for (const file of filesUnder(join(seedRoot, seed))) {
            const filePath = join(
              root,
              scope,
              "eslint-parity-seed",
              file.replace(/\.txt$/, ""),
            );
            const [result] = await eslint.lintText(
              readFileSync(join(seedRoot, seed, file), "utf8"),
              { filePath },
            );
            for (const message of result?.messages ?? [])
              if (message.ruleId) reported.push(message.ruleId);
            expect(result?.fatalErrorCount, `${seed}/${file}`).toBe(0);
          }
          if (silentSeeds[seed])
            expect(reported, `${incumbent.rule} via ${config}`).not.toContain(
              incumbent.rule,
            );
          else
            expect(reported, `${incumbent.rule} via ${config}`).toContain(
              incumbent.rule,
            );
        }
      },
    );
  });
});
