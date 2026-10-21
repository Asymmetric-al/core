/**
 * Contract parity for GitHub issue #2067 addendum 4 (engineering ruling 2,
 * Samson, 2026-10-20 11:03 PM PT, and the 2026-10-21 ruling that production
 * code may not import Acceptance's test contract).
 * Addendum 4: {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6308840307}
 *
 * (a) The production contract module exports the same `document_cutover`
 *     functions as ./document-cutover-contract.ts: names, arguments (names and
 *     types, in order) and result columns (names and types, in order).
 * (b) No non-test source under scripts/ or packages/ (tracked, or untracked
 *     and not ignored) imports from tests/.
 * (c) Neither the production contract module nor the gate entry point
 *     imports the test contract (directly or through relative imports).
 * Also: the package index re-exports the very same objects, and the schema
 * and reader-role constants carry the same values as ours.
 *
 * Normalization in (a), and nothing else:
 * - identifiers and type names are trimmed and lower-cased (Postgres folds
 *   unquoted identifiers), and runs of whitespace collapse to one space;
 * - type aliases int8 -> bigint, int4 / int -> integer, int2 -> smallint;
 * - the production export may be an array of `{ name, args, columns }` or an
 *   object keyed by function name (the key is used when `name` is absent);
 * - functions are compared as a set (sorted by name); their order is not
 *   part of the contract. Argument and column order are;
 * - fields other than name / args / columns (our `route`, `reads`, or any
 *   production-only metadata) are ignored.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import { REPO_ROOT } from "./command-harness";
import {
  DOCUMENT_CUTOVER_FUNCTIONS,
  DOCUMENT_CUTOVER_SCHEMA,
  READER_ROLE,
} from "./document-cutover-contract";

/** Production contract module, repo-relative (Samson, 2026-10-21 12:38 AM PT). */
const PROD_CONTRACT_MODULE =
  "packages/api/src/document-cutover/database-contract.ts";
/** The package entry that must re-export the same objects. */
const PROD_CONTRACT_INDEX = "packages/api/src/document-cutover/index.ts";
/** The export holding the function list. */
const PROD_CONTRACT_EXPORT = "DOCUMENT_CUTOVER_FUNCTIONS";
/** Production names for the schema and reader-role constants (ours: DOCUMENT_CUTOVER_SCHEMA, READER_ROLE). */
const PROD_SCHEMA_EXPORT = "DOCUMENT_CUTOVER_SCHEMA";
const PROD_READER_ROLE_EXPORT = "DOCUMENT_CUTOVER_READER_ROLE";
/** The gate entry point; (c) also covers it. */
const GATE_ENTRY = "scripts/document-cutover/assess-document-cutover.ts";
/** Production roots scanned by (b). */
const PRODUCTION_ROOTS = ["scripts", "packages"];

const TESTS_DIR = path.join(REPO_ROOT, "tests");
const SOURCE_EXT = /\.(?:[cm]?[jt]sx?)$/;
const RESOLVE_EXTS = [
  "",
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".mjs",
  ".cjs",
  "/index.ts",
  "/index.tsx",
  "/index.js",
];

interface NormalizedFunction {
  name: string;
  args: Array<{ name: string; type: string }>;
  columns: Array<{ name: string; type: string }>;
}

const TYPE_ALIASES: Record<string, string> = {
  int8: "bigint",
  int4: "integer",
  int: "integer",
  int2: "smallint",
};

const ident = (value: unknown) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
const typeName = (value: unknown) => {
  const type = ident(value);
  return TYPE_ALIASES[type] ?? type;
};

function normalize(raw: unknown): NormalizedFunction[] {
  const entries: Array<[string | undefined, unknown]> = Array.isArray(raw)
    ? raw.map((fn) => [undefined, fn])
    : raw && typeof raw === "object"
      ? Object.entries(raw as Record<string, unknown>)
      : [];
  return entries
    .map(([key, fn]) => {
      const record = (fn ?? {}) as Record<string, unknown>;
      const list = (value: unknown) =>
        (Array.isArray(value) ? value : []).map((item) => {
          const entry = (item ?? {}) as Record<string, unknown>;
          return { name: ident(entry.name), type: typeName(entry.type) };
        });
      return {
        name: ident(record.name ?? key),
        args: list(record.args),
        columns: list(record.columns),
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

/** import / export-from / dynamic import / require specifiers. */
function specifiers(source: string): string[] {
  const out: string[] = [];
  const patterns = [
    /\b(?:import|export)\s+(?:type\s+)?(?:[^'"`;]*?\sfrom\s+)?["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
    /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
    /\bvi\.mock\s*\(\s*["']([^"']+)["']/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) out.push(match[1] as string);
  }
  return out;
}

/** Absolute target of a specifier when it is repo-local, else undefined. */
function resolveLocal(fromFile: string, specifier: string): string | undefined {
  if (specifier.startsWith(".")) {
    return path.resolve(path.dirname(fromFile), specifier);
  }
  // Root-anchored forms (`tests/...`, `/tests/...`, `@/tests/...`, `~/tests/...`).
  const rooted = /^(?:@\/|~\/|\/)?(tests\/.*)$/.exec(specifier);
  return rooted ? path.join(REPO_ROOT, rooted[1] as string) : undefined;
}

const intoTests = (target: string) =>
  target === TESTS_DIR || target.startsWith(`${TESTS_DIR}${path.sep}`);

function isTestSource(relative: string): boolean {
  return (
    /\.(test|spec)\.[cm]?[jt]sx?$/.test(relative) ||
    /(^|\/)(tests?|__tests__|__mocks__|__fixtures__|fixtures)\//.test(
      relative,
    ) ||
    /(^|\/)(node_modules|dist|build|\.next|\.turbo|coverage)\//.test(relative)
  );
}

function productionSources(): string[] {
  return execFileSync(
    "git",
    [
      "ls-files",
      "-z",
      "--cached",
      "--others",
      "--exclude-standard",
      "--",
      ...PRODUCTION_ROOTS,
    ],
    {
      cwd: REPO_ROOT,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    },
  )
    .split("\0")
    .filter(
      (file) =>
        file &&
        SOURCE_EXT.test(file) &&
        !isTestSource(file) &&
        existsSync(path.join(REPO_ROOT, file)),
    );
}

function importsIntoTests(relative: string): string[] {
  const file = path.join(REPO_ROOT, relative);
  return specifiers(readFileSync(file, "utf8"))
    .filter((specifier) => {
      const target = resolveLocal(file, specifier);
      return target !== undefined && intoTests(target);
    })
    .map((specifier) => `${relative} -> ${specifier}`);
}

function resolveFile(target: string): string | undefined {
  for (const ext of RESOLVE_EXTS) {
    const candidate = `${target}${ext}`;
    if (existsSync(candidate) && SOURCE_EXT.test(candidate)) return candidate;
  }
  // `./x.js` written for a `./x.ts` source.
  const swapped = target.replace(/\.[cm]?js$/, ".ts");
  return swapped !== target && existsSync(swapped) ? swapped : undefined;
}

/** Repo-local files reachable from `entry` through relative / rooted imports that land in tests/. */
function transitiveTestImports(entry: string): string[] {
  const seen = new Set<string>();
  const hits: string[] = [];
  const queue = [path.join(REPO_ROOT, entry)];
  while (queue.length > 0) {
    const file = queue.shift() as string;
    if (seen.has(file)) continue;
    seen.add(file);
    for (const specifier of specifiers(readFileSync(file, "utf8"))) {
      const target = resolveLocal(file, specifier);
      if (target === undefined) continue;
      if (intoTests(target)) {
        hits.push(`${path.relative(REPO_ROOT, file)} -> ${specifier}`);
        continue;
      }
      const resolved = resolveFile(target);
      if (
        resolved &&
        !resolved.includes(`${path.sep}node_modules${path.sep}`)
      ) {
        queue.push(resolved);
      }
    }
  }
  return hits;
}

describe("issue #2067 addendum 4 — production contract parity", () => {
  it(`(a) ${PROD_CONTRACT_MODULE} exports ${PROD_CONTRACT_EXPORT} with the same function names, arguments and result columns as the Acceptance contract`, async () => {
    const modulePath = path.join(REPO_ROOT, PROD_CONTRACT_MODULE);
    expect(
      existsSync(modulePath),
      `production contract module ${PROD_CONTRACT_MODULE} is missing`,
    ).toBe(true);
    const module = (await import(
      /* @vite-ignore */ pathToFileURL(modulePath).href
    )) as Record<string, unknown>;
    expect(
      module[PROD_CONTRACT_EXPORT],
      `${PROD_CONTRACT_MODULE} does not export ${PROD_CONTRACT_EXPORT}`,
    ).toBeDefined();
    expect(normalize(module[PROD_CONTRACT_EXPORT])).toEqual(
      normalize(DOCUMENT_CUTOVER_FUNCTIONS),
    );
  });

  it(`(a) ${PROD_CONTRACT_INDEX} re-exports the same ${PROD_CONTRACT_EXPORT}, ${PROD_SCHEMA_EXPORT} and ${PROD_READER_ROLE_EXPORT} objects, with the Acceptance schema and reader-role values`, async () => {
    const load = async (relative: string) =>
      (await import(
        /* @vite-ignore */ pathToFileURL(path.join(REPO_ROOT, relative)).href
      )) as Record<string, unknown>;
    const module = await load(PROD_CONTRACT_MODULE);
    const index = await load(PROD_CONTRACT_INDEX);
    for (const name of [
      PROD_CONTRACT_EXPORT,
      PROD_SCHEMA_EXPORT,
      PROD_READER_ROLE_EXPORT,
    ]) {
      expect(
        module[name],
        `${PROD_CONTRACT_MODULE} exports ${name}`,
      ).toBeDefined();
      expect(index[name], `${PROD_CONTRACT_INDEX} re-exports ${name}`).toBe(
        module[name],
      );
    }
    expect(module[PROD_SCHEMA_EXPORT]).toBe(DOCUMENT_CUTOVER_SCHEMA);
    expect(module[PROD_READER_ROLE_EXPORT]).toBe(READER_ROLE);
  });

  it("(b) no non-test source under scripts/ or packages/ imports from tests/", () => {
    const sources = productionSources();
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.flatMap(importsIntoTests)).toEqual([]);
  });

  it.each([PROD_CONTRACT_MODULE, GATE_ENTRY])(
    "(c) %s does not import the test contract or anything under tests/ (transitively through repo-local imports)",
    (entry) => {
      expect(
        existsSync(path.join(REPO_ROOT, entry)),
        `${entry} is missing`,
      ).toBe(true);
      expect(transitiveTestImports(entry)).toEqual([]);
    },
  );

  it("self-check: the scanner sees a relative import into tests/ and ignores packages and in-package test files", () => {
    const fake = path.join(REPO_ROOT, "scripts", "x", "y.ts");
    const source = [
      'import { a } from "../../tests/unit/acceptance/issue-2067/document-cutover-contract";',
      'import type { B } from "pg";',
      'export * from "./local";',
      'const c = await import("../../tests/z");',
      'const d = require("tests/w");',
    ].join("\n");
    const hits = specifiers(source).filter((specifier) => {
      const target = resolveLocal(fake, specifier);
      return target !== undefined && intoTests(target);
    });
    expect(hits).toEqual([
      "../../tests/unit/acceptance/issue-2067/document-cutover-contract",
      "../../tests/z",
      "tests/w",
    ]);
    expect(isTestSource("packages/api/tests/verify.mjs")).toBe(true);
    expect(isTestSource("packages/api/src/x.test.ts")).toBe(true);
    expect(isTestSource("scripts/document-cutover/contract.ts")).toBe(false);
  });
});
