/**
 * Acceptance tests for GitHub issue #2068, done criterion 1.
 * Spec (rev 1, Blake-approved 2026-10-22 9:28 PM PT, decisions D1a and D2a):
 * {@link https://github.com/Asymmetric-al/core/issues/2068#issuecomment-6357332555}
 *
 * Criterion 1: "The new test asserts a literal 64-character hex digest at both
 * seams, plus serializer "1", "sha256" and the schema version. Changing any
 * one field of any entry, or the serializer, makes it fail."
 *
 * How it is checked:
 * - The pin: `tests/unit/packages/api/document-purpose-digest.test.ts` (In
 *   item 1) contains a quoted 64-character hex literal equal to the live
 *   digest from both seams, and names both seams. This holds on both commits
 *   of criterion 2's flow (pre-change pin, then updated pin), because it reads
 *   whatever the current pin is.
 * - "Changing any one field of any entry": every primitive leaf of every
 *   catalog entry is changed in turn (module mock of `./catalog`), and the
 *   public seam's digest must then differ from the pinned literal.
 * - "makes it fail": that test file is run in a child Vitest with a mutated
 *   catalog leaf or a mutated serializer and must fail with an assertion
 *   error; a control run with no mutation must pass. The serializer cases are
 *   described in `mutation/serialization-mutant.ts`.
 *
 * Interpretation (reported as open questions):
 * - "pins the serializer version" is read as asserting the exported
 *   `DOCUMENT_PURPOSE_SERIALIZER_VERSION` is "1"; "the algorithm" as
 *   `manifest.digest_algorithm` is "sha256"; "the catalog schema version" as
 *   `manifest.schema_version`.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { spawn } from "node:child_process";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildDocumentPurposeCatalogManifest,
  DOCUMENT_PURPOSE_CATALOG,
  getDocumentPurposeCatalogDigest,
} from "../../../../packages/api/src/generated-documents/purpose-catalog";
import {
  CATALOG_DIR,
  DIGEST_TEST_FILE,
  hexDigestLiterals,
  leafPaths,
  mutatedLeaf,
  PURPOSE_ID,
  readRepoFile,
  REPO_ROOT,
  withLeaf,
} from "./catalog-scan";

const CATALOG_MODULE = path.join(REPO_ROOT, CATALOG_DIR, "catalog.ts");
const SERIALIZATION_MODULE = path.join(
  REPO_ROOT,
  CATALOG_DIR,
  "serialization.ts",
);
const MUTATION_CONFIG = path.join(
  REPO_ROOT,
  "tests/unit/acceptance/issue-2068/mutation/vitest.mutation.config.mts",
);
const VITEST_CLI = path.join(REPO_ROOT, "node_modules/vitest/vitest.mjs");

function pinnedLiterals(): string[] {
  return [...new Set(hexDigestLiterals(readRepoFile(DIGEST_TEST_FILE)))];
}

function livePin(): string | undefined {
  const live = getDocumentPurposeCatalogDigest();
  return pinnedLiterals().find((literal) => literal === live);
}

interface ChildRun {
  status: number | null;
  output: string;
}

function runDigestTest(env: Record<string, string>): Promise<ChildRun> {
  const childEnv: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (!/^(VITEST|TINYPOOL)/.test(key)) childEnv[key] = value;
  }
  Object.assign(childEnv, env, { CI: "1", FORCE_COLOR: "0", NO_COLOR: "1" });
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        VITEST_CLI,
        "run",
        "--config",
        MUTATION_CONFIG,
        "--no-fsModuleCache",
        DIGEST_TEST_FILE,
      ],
      { cwd: REPO_ROOT, env: childEnv },
    );
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    child.on("error", reject);
    child.on("close", (status) => resolve({ status, output }));
  });
}

function expectAssertionFailure(run: ChildRun, label: string) {
  expect(
    run.status,
    `${DIGEST_TEST_FILE} still passes under mutation "${label}", so the pin does not catch it`,
  ).not.toBe(0);
  expect(
    run.output,
    `${DIGEST_TEST_FILE} failed under "${label}" but not with an assertion failure:\n${run.output}`,
  ).toMatch(/AssertionError/);
}

describe("issue #2068 done criterion 1: the literal pin", () => {
  it('criterion 1: "The new test asserts a literal 64-character hex digest" equal to the live digest at both seams', () => {
    const live = getDocumentPurposeCatalogDigest();
    expect(live).toMatch(/^[0-9a-f]{64}$/);
    expect(buildDocumentPurposeCatalogManifest().digest).toBe(live);
    expect(
      pinnedLiterals(),
      `${DIGEST_TEST_FILE} has no quoted 64-character hex literal equal to the live catalog digest ${live}`,
    ).toContain(live);
  });

  it('criterion 1: the pin is asserted "at both seams" (the test names getDocumentPurposeCatalogDigest and buildDocumentPurposeCatalogManifest)', () => {
    const source = readRepoFile(DIGEST_TEST_FILE);
    expect(source).toMatch(/\bgetDocumentPurposeCatalogDigest\s*\(/);
    expect(source).toMatch(/\bbuildDocumentPurposeCatalogManifest\s*\(/);
    expect(livePin(), "no live digest pin found").toBeDefined();
  });
});

describe('issue #2068 done criterion 1: "Changing any one field of any entry ... makes it fail"', () => {
  afterEach(() => {
    vi.doUnmock(CATALOG_MODULE);
    vi.resetModules();
  });

  it("criterion 1: every one-leaf mutation of every entry moves the public-seam digest away from the pinned literal", async () => {
    const pin = livePin();
    expect(
      pin,
      `${DIGEST_TEST_FILE} has no literal pin equal to the live digest`,
    ).toBeDefined();

    const catalog = DOCUMENT_PURPOSE_CATALOG as Record<string, unknown>;
    const survivors: string[] = [];
    let checked = 0;
    for (const purposeId of Object.keys(catalog)) {
      for (const leaf of leafPaths(catalog[purposeId])) {
        const mutated = {
          ...catalog,
          [purposeId]: withLeaf(
            catalog[purposeId],
            leaf.path,
            mutatedLeaf(leaf.value),
          ),
        };
        vi.resetModules();
        vi.doMock(CATALOG_MODULE, async (importOriginal) => ({
          ...(await importOriginal<object>()),
          DOCUMENT_PURPOSE_CATALOG: mutated,
        }));
        const serialization = (await import(
          SERIALIZATION_MODULE
        )) as typeof import("../../../../packages/api/src/generated-documents/purpose-catalog/serialization");
        const digest = serialization.getDocumentPurposeCatalogDigest();
        const manifestDigest =
          serialization.buildDocumentPurposeCatalogManifest().digest;
        if (digest === pin || manifestDigest === pin) {
          survivors.push(`${purposeId} ${leaf.path.join(".")}`);
        }
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThan(100);
    expect(
      survivors,
      `one-field mutations that keep the pinned digest:\n${survivors.join("\n")}`,
    ).toEqual([]);
  }, 120_000);
});

describe('issue #2068 done criterion 1: the pinned test "fail[s]" on a one-field or serializer change', () => {
  const catalogLeaves: { label: string; purpose: string; leaf: string[] }[] = [
    {
      label: `${PURPOSE_ID} approved_data_view.view_version`,
      purpose: PURPOSE_ID,
      leaf: ["approved_data_view", "view_version"],
    },
    {
      label: "us.qcd.acknowledgment@1 forbidden_facts.deny_set_version",
      purpose: "us.qcd.acknowledgment@1",
      leaf: ["forbidden_facts", "deny_set_version"],
    },
    {
      label: "custom.business_document@1 access_policy.portal",
      purpose: "custom.business_document@1",
      leaf: ["access_policy", "portal"],
    },
  ];
  const serializerMutations = [
    "canonical_order",
    "serializer_version_bump",
    "serializer_version_export",
    "manifest_schema_version",
    "manifest_algorithm",
  ];

  it("control: the pinned digest test passes with no mutation", async () => {
    const run = await runDigestTest({});
    expect(run.status, run.output).toBe(0);
  }, 120_000);

  it.each(catalogLeaves)(
    "criterion 1: changing one field ($label) makes the pinned digest test fail",
    async ({ label, purpose, leaf }) => {
      const run = await runDigestTest({
        ACC_2068_MUTANT_MODULE: "./catalog",
        ACC_2068_MUTANT_PURPOSE: purpose,
        ACC_2068_MUTANT_PATH: JSON.stringify(leaf),
      });
      expectAssertionFailure(run, label);
    },
    120_000,
  );

  it.each(serializerMutations)(
    "criterion 1: changing the serializer (%s) makes the pinned digest test fail",
    async (mutation) => {
      const run = await runDigestTest({
        ACC_2068_MUTANT_MODULE: "./serialization",
        ACC_2068_SERIALIZER_MUTATION: mutation,
      });
      expectAssertionFailure(run, mutation);
    },
    120_000,
  );
});
