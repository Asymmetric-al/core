/**
 * Acceptance tests for GitHub issue #2068, done criterion 6.
 * Spec (rev 1, Blake-approved 2026-10-22 9:28 PM PT, decisions D1a and D2a):
 * {@link https://github.com/Asymmetric-al/core/issues/2068#issuecomment-6357332555}
 *
 * Criterion 6: "The data view shows no total that `statement-operations.md`
 * forbids." Spec addendum 1 item 5 corrects the reference to
 * `openspec/contracts/statement-operations.md:627-628`
 * ({@link https://github.com/Asymmetric-al/core/issues/2068#issuecomment-6357644196}). That clause (D15) reads: "The overview
 * MUST NOT show a deductible, official, converted, blended, or direct-plus-
 * recognition total".
 *
 * D2a drops `period_total` and adds no total of any kind (keeping a direct-only
 * per-currency total was option D2b, which was not chosen). So a data-view
 * field is treated as a total when its name contains `total`, and no such
 * field may remain. The check is anchored to field names containing "total";
 * names such as `not_official_statement` are not totals and are not flagged.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { describe, expect, it } from "vitest";

import { getDocumentPurposeContract } from "../../../../packages/api/src/generated-documents/purpose-catalog";
import { PURPOSE_ID, readRepoFile } from "./catalog-scan";

const CONTRACT_FILE = "openspec/contracts/statement-operations.md";

describe("issue #2068 done criterion 6: no forbidden total", () => {
  it("criterion 6: the clause being enforced is still in the Phase 19 contract", () => {
    const text = readRepoFile(CONTRACT_FILE).replace(/\s+/g, " ");
    expect(text).toContain(
      "MUST NOT show a deductible, official, converted, blended, or direct-plus- recognition total",
    );
  });

  it("criterion 6 / D2a: no field of the giving.summary data view is a total", () => {
    const totals = getDocumentPurposeContract(
      PURPOSE_ID,
    ).approved_data_view.fields.filter((field) => /total/i.test(field));
    expect(totals).toEqual([]);
  });
});
