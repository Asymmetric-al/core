/**
 * Acceptance tests for GitHub issue #2206, criteria C1–C3.
 * Issue: {@link https://github.com/Asymmetric-al/core/issues/2206}
 *
 * "the catalog digest depends on the host locale. It comes out differently
 * under `cs_CZ.UTF-8` or `haw_US.UTF-8`. Hosts with different locales could
 * therefore stamp different `catalog_digest` values at admission ... Fix:
 * switch to a code-point comparator. This keeps today's digest (45ca5f48…eeaa
 * under en/C locales). Add a test that runs the digest under several locales."
 *
 * How it is checked: for each locale a fresh Vitest process is started with
 * LANG and LC_ALL set (the ICU default locale is fixed at process start). It
 * reports what the public seams return. Before any digest claim, the test
 * proves the locale took effect: ICU's resolved default and two collation
 * probes ("ch" vs "h" for Czech, "u" vs "h" for Hawaiian) must match that
 * locale. If the host cannot honour a locale, the proof test fails instead of
 * the digest tests passing vacuously.
 *
 * - C1: `getDocumentPurposeCatalogDigest()`, the manifest digest and the
 *   admission `catalog_digest` all equal the pinned literal in every locale.
 * - C2: manifest entries and canonical object keys come out in code-point
 *   order in every locale.
 * - C3: digest algorithm, schema version and serializer version stay
 *   "sha256", "2" and "1" in every locale.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { beforeAll, describe, expect, it } from "vitest";

import {
  CANONICAL_SAMPLE_EXPECTED,
  CODE_POINT_PURPOSE_ORDER,
  LOCALE_CASES,
  PINNED_CATALOG_DIGEST,
  probeLocale,
} from "./oracle";

import type { ChildRun, LocaleProbeReport } from "./oracle";

describe.each(LOCALE_CASES)("issue #2206 under $lang", (locale) => {
  let run: ChildRun;
  let report: LocaleProbeReport | null = null;

  beforeAll(async () => {
    ({ run, report } = await probeLocale(locale.lang));
  }, 180_000);

  function probed(): LocaleProbeReport {
    expect(
      report,
      `the locale probe under ${locale.lang} produced no report (exit ${run.status}):\n${run.output}`,
    ).not.toBeNull();
    return report as LocaleProbeReport;
  }

  it(`precondition: the child process really ran under ${locale.lang}`, () => {
    const facts = probed();
    expect(
      {
        env: facts.env,
        collatorLocale: facts.collatorLocale,
        chVsH: facts.chVsH,
        uVsH: facts.uVsH,
      },
      `ICU did not adopt ${locale.lang} in the child; this host cannot demonstrate the locale, so the digest results below prove nothing for it`,
    ).toEqual({
      env: { LANG: locale.lang, LC_ALL: locale.lang },
      collatorLocale: locale.collatorLocale,
      chVsH: locale.chVsH,
      uVsH: locale.uVsH,
    });
  });

  it(`C1: getDocumentPurposeCatalogDigest() is the pinned digest under ${locale.lang}`, () => {
    expect(probed().digest).toBe(PINNED_CATALOG_DIGEST);
  });

  it(`C1: buildDocumentPurposeCatalogManifest().digest is the pinned digest under ${locale.lang}`, () => {
    expect(probed().manifestDigest).toBe(PINNED_CATALOG_DIGEST);
  });

  it(`C1: admission stamps the pinned catalog_digest under ${locale.lang}`, () => {
    expect(probed().admissionDigest).toBe(PINNED_CATALOG_DIGEST);
  });

  it(`C2: manifest entries come out in code-point order under ${locale.lang}`, () => {
    expect(probed().manifestPurposeIds).toEqual([...CODE_POINT_PURPOSE_ORDER]);
  });

  it(`C2: canonical serialization orders object keys by code point under ${locale.lang}`, () => {
    expect(probed().canonicalSample).toBe(CANONICAL_SAMPLE_EXPECTED);
  });

  it(`C3: the manifest stays sha256, schema "2", serializer "1" under ${locale.lang}`, () => {
    const facts = probed();
    expect({
      algorithm: facts.manifestAlgorithm,
      schema: facts.manifestSchemaVersion,
      serializer: facts.serializerVersion,
    }).toEqual({ algorithm: "sha256", schema: "2", serializer: "1" });
  });
});

describe("issue #2206 locale matrix is not vacuous", () => {
  let report: LocaleProbeReport | null = null;
  let run: ChildRun;

  beforeAll(async () => {
    ({ run, report } = await probeLocale("haw_US.UTF-8"));
  }, 180_000);

  it("precondition: under haw_US.UTF-8 a localeCompare sort of the catalog's own purpose ids differs from code-point order", () => {
    expect(
      report,
      `the locale probe under haw_US.UTF-8 produced no report (exit ${run.status}):\n${run.output}`,
    ).not.toBeNull();
    expect((report as LocaleProbeReport).localeSortedPurposeIds).not.toEqual([
      ...CODE_POINT_PURPOSE_ORDER,
    ]);
  });
});
