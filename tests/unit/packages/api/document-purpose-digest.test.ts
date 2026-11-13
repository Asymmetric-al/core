import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  DOCUMENT_PURPOSE_CATALOG,
  DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION,
  DOCUMENT_PURPOSE_SERIALIZER_VERSION,
  buildDocumentPurposeCatalogManifest,
  canonicalizeDocumentPurposeValue,
  digestDocumentPurposeValue,
  getDocumentPurposeCatalogDigest,
  getDocumentPurposeContract,
} from "../../../../packages/api/src/generated-documents/purpose-catalog";

// Changing this pin is a reviewed, versioned contract change: any catalog value
// or serialization change must update it deliberately, with a schema version
// bump where the contract shape or meaning changes.
const PINNED_CATALOG_DIGEST =
  "45ca5f488c8de37813095c5a3fa3677989c298e4e2faa976b6f9c5a57537eeaa";

// Locale-independent code-point (UTF-16 code-unit) order. Never use
// localeCompare here: it follows the host's ICU default locale.
function compareCodePoints(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

const LOCALE_CHILD_ENV = "DOCUMENT_PURPOSE_DIGEST_LOCALE_REPORT";
const localeReportPath = process.env[LOCALE_CHILD_ENV];
// The nested locale matrix spawns one Vitest child per locale. It is skipped
// only on an explicit, named opt-out, and the reason is logged so a skipped
// matrix is never silent:
// - DOCUMENT_PURPOSE_DIGEST_SKIP_LOCALE_MATRIX=1 is this test's own opt-out.
// - ACC_2068_MUTANT_MODULE marks a #2068 mutation run. Those runs only need
//   the in-process pin to fail, and the children would not load the mutant.
const SKIP_LOCALE_MATRIX_ENV = "DOCUMENT_PURPOSE_DIGEST_SKIP_LOCALE_MATRIX";
const MUTATION_RUN_ENV = "ACC_2068_MUTANT_MODULE";
const localeMatrixSkipReason: string | undefined =
  process.env[SKIP_LOCALE_MATRIX_ENV] === "1"
    ? `${SKIP_LOCALE_MATRIX_ENV}=1`
    : process.env[MUTATION_RUN_ENV] !== undefined
      ? `${MUTATION_RUN_ENV} is set (mutation run)`
      : undefined;
if (localeReportPath === undefined && localeMatrixSkipReason !== undefined) {
  console.warn(
    `document-purpose-digest: skipping the locale matrix because ${localeMatrixSkipReason}`,
  );
}

describe("canonical serialization and the catalog digest", () => {
  it("serializes logically identical values identically regardless of key order", () => {
    const shuffled = {
      review_floor: "protected",
      lane: "official_tax",
      approved_data_view: { view_version: 1, view_key: "x", fields: ["a"] },
    };
    const ordered = {
      approved_data_view: { fields: ["a"], view_key: "x", view_version: 1 },
      lane: "official_tax",
      review_floor: "protected",
    };

    expect(canonicalizeDocumentPurposeValue(shuffled)).toBe(
      canonicalizeDocumentPurposeValue(ordered),
    );
    expect(digestDocumentPurposeValue(shuffled)).toBe(
      digestDocumentPurposeValue(ordered),
    );
  });

  it("pins the catalog digest and serialization contract to literal values", () => {
    const manifest = buildDocumentPurposeCatalogManifest();

    expect(getDocumentPurposeCatalogDigest()).toBe(PINNED_CATALOG_DIGEST);
    expect(manifest.digest).toBe(PINNED_CATALOG_DIGEST);
    expect(DOCUMENT_PURPOSE_SERIALIZER_VERSION).toBe("1");
    expect(manifest.digest_algorithm).toBe("sha256");
    expect(manifest.schema_version).toBe("2");
    expect(DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION).toBe("2");
  });

  it("keeps a stable digest across processes and repeated calls", () => {
    const digest = getDocumentPurposeCatalogDigest();
    expect(digest).toMatch(/^[0-9a-f]{64}$/);
    expect(getDocumentPurposeCatalogDigest()).toBe(digest);

    // Recomputing from a deep clone (fresh object graph, insertion order
    // re-created) must land on the same digest.
    const recomputed = digestDocumentPurposeValue({
      schema_version: DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION,
      serializer_version: "1",
      entries: Object.keys(DOCUMENT_PURPOSE_CATALOG)
        .sort(compareCodePoints)
        .map((purposeId) =>
          structuredClone(getDocumentPurposeContract(purposeId)),
        ),
    });
    expect(recomputed).toBe(digest);
  });

  it("changes the digest for any contract-semantic change", () => {
    const entries = Object.keys(DOCUMENT_PURPOSE_CATALOG)
      .sort(compareCodePoints)
      .map((purposeId) =>
        structuredClone(getDocumentPurposeContract(purposeId)),
      );
    const mutated = structuredClone(entries);
    mutated[0].review_floor = "standard";

    const base = digestDocumentPurposeValue({
      schema_version: DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION,
      serializer_version: "1",
      entries,
    });
    const changed = digestDocumentPurposeValue({
      schema_version: DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION,
      serializer_version: "1",
      entries: mutated,
    });
    expect(changed).not.toBe(base);
  });

  it("builds a manifest with schema version, sorted entries, algorithm, and digest", () => {
    const manifest = buildDocumentPurposeCatalogManifest();

    expect(manifest.schema_version).toBe(
      DOCUMENT_PURPOSE_CATALOG_SCHEMA_VERSION,
    );
    expect(manifest.digest_algorithm).toBe("sha256");
    expect(manifest.digest).toBe(getDocumentPurposeCatalogDigest());
    expect(manifest.entries).toHaveLength(11);

    const ids = manifest.entries.map(
      (entry) => `${entry.purpose_key}@${entry.purpose_version}`,
    );
    expect(ids).toEqual([...ids].sort(compareCodePoints));
  });

  it("sorts object keys in code-point order, not by the host collation", () => {
    // Expected order worked out by hand from code points: uppercase before
    // lowercase, '.' (U+002E) before '_' (U+005F), "ch" as two letters
    // (Czech collates it after "h"), vowels not first (Hawaiian collates
    // vowels first), and 'é' (U+00E9) after 'z'.
    expect(
      canonicalizeDocumentPurposeValue({
        h: 1,
        ch: { y: 1, X: 2, x_: 3, "x.": 4 },
        u: 2,
        a_b: 3,
        "a.b": 4,
        a: 5,
        B: 6,
        é: 7,
        z: 8,
        dropped: undefined,
      }),
    ).toBe(
      '{"B":6,"a":5,"a.b":4,"a_b":3,"ch":{"X":2,"x.":4,"x_":3,"y":1},"h":1,"u":2,"z":8,"é":7}',
    );
  });

  it("cannot be mutated by a consumer to change a later lookup or digest", () => {
    const digestBefore = getDocumentPurposeCatalogDigest();
    const contract = getDocumentPurposeContract("tribute.notification@1");

    expect(() => {
      (contract as { review_floor: string }).review_floor = "protected";
    }).toThrow(TypeError);
    expect(() => {
      (contract.forbidden_facts.facts as string[]).push("nothing");
    }).toThrow(TypeError);

    expect(
      getDocumentPurposeContract("tribute.notification@1").review_floor,
    ).toBe("standard");
    expect(getDocumentPurposeCatalogDigest()).toBe(digestBefore);
  });
});

// The ICU default locale is fixed at process start, so each locale runs this
// whole file again in a fresh Vitest process with LANG/LC_ALL set. The child
// writes what it observed so the parent can prove the locale really took
// effect (collator locale and two collation probes) instead of silently
// falling back to English.
const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
);
const THIS_FILE = path.relative(REPO_ROOT, fileURLToPath(import.meta.url));

interface LocaleReport {
  env: { LANG: string | null; LC_ALL: string | null };
  collatorLocale: string;
  chVsH: number;
  uVsH: number;
  digest: string;
  manifestDigest: string;
}

const LOCALE_MATRIX = [
  // Czech collates "ch" after "h"; Hawaiian collates vowels before consonants.
  { lang: "C", collatorLocale: "en-US", chVsH: -1, uVsH: 1 },
  { lang: "en_US.UTF-8", collatorLocale: "en-US", chVsH: -1, uVsH: 1 },
  { lang: "cs_CZ.UTF-8", collatorLocale: "cs-CZ", chVsH: 1, uVsH: 1 },
  { lang: "haw_US.UTF-8", collatorLocale: "haw-US", chVsH: -1, uVsH: -1 },
] as const;

function runThisFileUnder(
  lang: string,
  reportPath: string,
): Promise<{ status: number | null; output: string }> {
  const env: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (/^(VITEST|TINYPOOL|LC_|LANG)/.test(key)) continue;
    env[key] = value;
  }
  Object.assign(env, {
    LANG: lang,
    LC_ALL: lang,
    [LOCALE_CHILD_ENV]: reportPath,
    CI: "1",
    NO_COLOR: "1",
    FORCE_COLOR: "0",
  });
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        path.join(REPO_ROOT, "node_modules/vitest/vitest.mjs"),
        "run",
        "--no-fsModuleCache",
        "--config",
        path.join(REPO_ROOT, "vitest.config.mts"),
        THIS_FILE,
      ],
      { cwd: REPO_ROOT, env },
    );
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    child.on("error", reject);
    child.on("close", (status) => resolve({ status, output }));
  });
}

describe.skipIf(localeReportPath === undefined)("locale child report", () => {
  it("records the observed locale and digest", () => {
    const report: LocaleReport = {
      env: {
        LANG: process.env.LANG ?? null,
        LC_ALL: process.env.LC_ALL ?? null,
      },
      collatorLocale: new Intl.Collator().resolvedOptions().locale,
      chVsH: Math.sign("ch".localeCompare("h")),
      uVsH: Math.sign("u".localeCompare("h")),
      digest: getDocumentPurposeCatalogDigest(),
      manifestDigest: buildDocumentPurposeCatalogManifest().digest,
    };
    writeFileSync(localeReportPath as string, JSON.stringify(report));
  });
});

describe.skipIf(
  localeReportPath !== undefined || localeMatrixSkipReason !== undefined,
)("the catalog digest under several host locales", () => {
  it.each(LOCALE_MATRIX)(
    "keeps the pinned digest under $lang",
    async (expected) => {
      const scratch = mkdtempSync(path.join(tmpdir(), "purpose-digest-"));
      const reportPath = path.join(scratch, "report.json");
      try {
        const run = await runThisFileUnder(expected.lang, reportPath);
        expect(
          run.status,
          `digest tests failed under ${expected.lang}:\n${run.output}`,
        ).toBe(0);

        const report = JSON.parse(
          readFileSync(reportPath, "utf8"),
        ) as LocaleReport;
        // Proof the locale was active, so this cannot pass vacuously.
        expect(report.env).toEqual({
          LANG: expected.lang,
          LC_ALL: expected.lang,
        });
        expect(report.collatorLocale).toBe(expected.collatorLocale);
        expect(report.chVsH).toBe(expected.chVsH);
        expect(report.uVsH).toBe(expected.uVsH);

        expect(report.digest).toBe(PINNED_CATALOG_DIGEST);
        expect(report.manifestDigest).toBe(PINNED_CATALOG_DIGEST);
      } finally {
        rmSync(scratch, { recursive: true, force: true });
      }
    },
    120_000,
  );
});
