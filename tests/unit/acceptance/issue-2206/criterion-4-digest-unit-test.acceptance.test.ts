/**
 * Acceptance tests for GitHub issue #2206, criterion C4.
 * Issue: {@link https://github.com/Asymmetric-al/core/issues/2206}
 *
 * The issue asks for "a test that runs the digest under several locales" and
 * keeps today's digest. The coordinator brief adds that
 * `tests/unit/packages/api/document-purpose-digest.test.ts` keeps a quoted
 * literal pin equal to the live digest, still calls both
 * `getDocumentPurposeCatalogDigest(` and `buildDocumentPurposeCatalogManifest(`
 * (the #2068 criterion-1 acceptance tests depend on both), and that its own
 * helper sorts use the same locale-independent order as the module.
 *
 * How it is checked: the pin is read from the file, and the whole file is run
 * in a fresh Vitest process under each locale. A helper that still sorts with
 * `localeCompare` recomputes a different digest or ordering under
 * haw_US.UTF-8 and fails there. The locale proof for these children lives in
 * the criterion-1 file, which uses the same environment setup.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { describe, expect, it } from "vitest";

import {
  DIGEST_UNIT_TEST_FILE,
  LOCALE_CASES,
  PINNED_CATALOG_DIGEST,
  readRepoFile,
  runDigestUnitTestUnder,
} from "./oracle";

describe("issue #2206 C4: the digest unit test", () => {
  it(`C4: ${DIGEST_UNIT_TEST_FILE} keeps the quoted literal pin ${PINNED_CATALOG_DIGEST}`, () => {
    const literals = [
      ...readRepoFile(DIGEST_UNIT_TEST_FILE).matchAll(
        /["'`]([0-9a-fA-F]{64})["'`]/g,
      ),
    ].map((match) => (match[1] as string).toLowerCase());
    expect(literals).toContain(PINNED_CATALOG_DIGEST);
  });

  it(`C4: ${DIGEST_UNIT_TEST_FILE} still calls both public digest seams`, () => {
    const source = readRepoFile(DIGEST_UNIT_TEST_FILE);
    expect({
      digest: /\bgetDocumentPurposeCatalogDigest\s*\(/.test(source),
      manifest: /\bbuildDocumentPurposeCatalogManifest\s*\(/.test(source),
    }).toEqual({ digest: true, manifest: true });
  });

  it.each(LOCALE_CASES)(
    `C4: ${DIGEST_UNIT_TEST_FILE} passes in a fresh process under $lang`,
    async ({ lang }) => {
      const run = await runDigestUnitTestUnder(lang);
      expect(
        run.status,
        `${DIGEST_UNIT_TEST_FILE} failed under ${lang}:\n${run.output}`,
      ).toBe(0);
    },
    180_000,
  );
});
