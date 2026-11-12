/**
 * Shared oracle and child-process helpers for the GitHub issue #2206
 * acceptance tests.
 * Issue: {@link https://github.com/Asymmetric-al/core/issues/2206}
 *
 * "`serialization.ts:27,44` sorts with `localeCompare`, so the catalog digest
 * depends on the host locale ... Fix: switch to a code-point comparator. This
 * keeps today's digest (45ca5f48…eeaa under en/C locales). Add a test that
 * runs the digest under several locales."
 *
 * Every expected value here is an independent literal: the pinned digest from
 * the issue and the base commit's own pin, and orderings worked out by hand in
 * UTF-16 code-unit order (identical to code-point order for these BMP-only
 * strings).
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
);

/** The digest the issue says must be kept (full value from the base pin). */
export const PINNED_CATALOG_DIGEST =
  "45ca5f488c8de37813095c5a3fa3677989c298e4e2faa976b6f9c5a57537eeaa";

/** The unit test file the coordinator names for the implementer's pin. */
export const DIGEST_UNIT_TEST_FILE =
  "tests/unit/packages/api/document-purpose-digest.test.ts";

/**
 * The 11 catalog purpose ids (`purpose_key@purpose_version`) in code-point
 * order, worked out by hand:
 * - "ca." < "custom" ('a' U+0061 < 'u' U+0075)
 * - advantage < cumulative < individual < non (a < c < i < n)
 * - c < g < p < t < u for the remaining first letters
 * - "us.contribution…" < "us.qcd…" (c < q); annual < single (a < s)
 */
export const CODE_POINT_PURPOSE_ORDER = [
  "ca.official_receipt.advantage_split@1",
  "ca.official_receipt.cumulative_cash@1",
  "ca.official_receipt.individual_cash@1",
  "ca.official_receipt.non_cash@1",
  "custom.business_document@1",
  "giving.summary.informational@1",
  "pledge.statement@1",
  "tribute.notification@1",
  "us.contribution_acknowledgment.annual@1",
  "us.contribution_acknowledgment.single@1",
  "us.qcd.acknowledgment@1",
] as const;

/**
 * A value whose keys order differently under code-point order than under any
 * ICU collation: uppercase before lowercase, '.' (U+002E) before '_' (U+005F),
 * "ch" as two letters (Czech treats it as one letter after "h"), vowels not
 * first (Hawaiian sorts vowels first), and 'é' (U+00E9) after 'z'. No key is
 * an array index, so JavaScript's own integer-key ordering does not interfere.
 * The `omitted` key is undefined and must be dropped; array order is kept.
 */
export function canonicalSampleInput(): Record<string, unknown> {
  return {
    h: 1,
    ch: { y: 1, X: 2, x_: 3, "x.": 4 },
    u: ["h", "ch", "a"],
    p: 4,
    g: 5,
    B: 6,
    a: 7,
    a_b: 8,
    "a.b": 9,
    é: 10,
    z: 11,
    Z9: 12,
    omitted: undefined,
  };
}

/** {@link canonicalSampleInput} with keys in code-point order, by hand. */
export const CANONICAL_SAMPLE_EXPECTED =
  '{"B":6,"Z9":12,"a":7,"a.b":9,"a_b":8,"ch":{"X":2,"x.":4,"x_":3,"y":1},"g":5,"h":1,"p":4,"u":["h","ch","a"],"z":11,"é":10}';

/**
 * Locales the digest must be computed under. `collatorLocale` is what ICU
 * resolves the process default to; `chVsH` and `uVsH` are the signs of
 * `"ch".localeCompare("h")` and `"u".localeCompare("h")` under that default.
 * Czech treats "ch" as a letter after "h"; Hawaiian sorts vowels before
 * consonants. The two signs together tell the locales apart, so a child whose
 * locale silently fell back to English cannot pass as cs_CZ or haw_US.
 */
export interface LocaleCase {
  lang: string;
  collatorLocale: string;
  chVsH: -1 | 1;
  uVsH: -1 | 1;
}

export const LOCALE_CASES: readonly LocaleCase[] = [
  { lang: "C", collatorLocale: "en-US", chVsH: -1, uVsH: 1 },
  { lang: "en_US.UTF-8", collatorLocale: "en-US", chVsH: -1, uVsH: 1 },
  { lang: "cs_CZ.UTF-8", collatorLocale: "cs-CZ", chVsH: 1, uVsH: 1 },
  { lang: "haw_US.UTF-8", collatorLocale: "haw-US", chVsH: -1, uVsH: -1 },
];

/** What `probe/locale-probe.probe.ts` reports from inside one locale. */
export interface LocaleProbeReport {
  env: { LANG: string | null; LC_ALL: string | null };
  collatorLocale: string;
  chVsH: number;
  uVsH: number;
  localeSortedPurposeIds: string[];
  digest: string;
  manifestDigest: string;
  manifestAlgorithm: string;
  manifestSchemaVersion: string;
  serializerVersion: string;
  manifestPurposeIds: string[];
  canonicalSample: string;
  admissionDigest: string | null;
}

export interface ChildRun {
  status: number | null;
  output: string;
}

const VITEST_CLI = path.join(REPO_ROOT, "node_modules/vitest/vitest.mjs");
const ROOT_CONFIG = path.join(REPO_ROOT, "vitest.config.mts");
const PROBE_CONFIG = path.join(
  REPO_ROOT,
  "tests/unit/acceptance/issue-2206/probe/vitest.locale.config.mts",
);
const PROBE_FILE =
  "tests/unit/acceptance/issue-2206/probe/locale-probe.probe.ts";

/**
 * Environment for a child started under `lang`. The ICU default locale is
 * fixed at process start, so the locale must be set before the child starts.
 * LC_ALL overrides every LC_* category; LANGUAGE is dropped so it cannot win.
 */
function localeEnv(
  lang: string,
  extra: Record<string, string>,
): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (/^(VITEST|TINYPOOL|LC_|LANG)/.test(key)) continue;
    env[key] = value;
  }
  return {
    ...env,
    ...extra,
    LANG: lang,
    LC_ALL: lang,
    CI: "1",
    FORCE_COLOR: "0",
    NO_COLOR: "1",
  };
}

function runVitest(args: string[], env: NodeJS.ProcessEnv): Promise<ChildRun> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [VITEST_CLI, "run", "--no-fsModuleCache", ...args],
      { cwd: REPO_ROOT, env },
    );
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    child.on("error", reject);
    child.on("close", (status) => resolve({ status, output }));
  });
}

/** Runs the probe in a fresh Vitest process started under `lang`. */
export async function probeLocale(
  lang: string,
): Promise<{ run: ChildRun; report: LocaleProbeReport | null }> {
  const scratch = mkdtempSync(path.join(tmpdir(), "acc-2206-"));
  const outFile = path.join(scratch, "report.json");
  try {
    const run = await runVitest(
      ["--config", PROBE_CONFIG, PROBE_FILE],
      localeEnv(lang, { ACC_2206_PROBE_OUT: outFile }),
    );
    let report: LocaleProbeReport | null = null;
    try {
      report = JSON.parse(readFileSync(outFile, "utf8")) as LocaleProbeReport;
    } catch {
      report = null;
    }
    return { run, report };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

/** Runs the implementer's digest unit test in a fresh process under `lang`. */
export function runDigestUnitTestUnder(lang: string): Promise<ChildRun> {
  return runVitest(
    ["--config", ROOT_CONFIG, DIGEST_UNIT_TEST_FILE],
    localeEnv(lang, {}),
  );
}

export function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
}
