/**
 * Acceptance tests for GitHub issue #2068, done criterion 3.
 * Spec (rev 1, Blake-approved 2026-10-22 9:28 PM PT, decisions D1a and D2a):
 * {@link https://github.com/Asymmetric-al/core/issues/2068#issuecomment-6357332555}
 *
 * Criterion 3: "`getDocumentPurposeContract("giving.summary.informational@1")`
 * returns the `source_owner`, `recipient_role.role`, `launch.gates` and
 * data-view fields in **In** item 3, and tests assert each one."
 *
 * Decisions applied:
 * - D1a: "the purpose ID stays `giving.summary.informational@1`".
 * - D2a: "`period_total` is dropped, the direct-gift fields stay, and
 *   `household_support_items` and `daf_recommendation_items` are added,
 *   grouped per currency, with a new `view_version`."
 *
 * Interpretation (reported as open questions):
 * - "direct-gift fields" = `period_gift_dates` and `period_gift_amounts` (the
 *   per-gift fields at cc568c92). Other base fields are not asserted.
 * - "a new `view_version`" = an integer greater than the base value 1.
 * - "grouped per currency" has no representation in a flat field-name list,
 *   so it is not asserted here.
 * - "tests assert each one" = the In item 4 test files name each asserted
 *   value literally.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { describe, expect, it } from "vitest";

import {
  DOCUMENT_PURPOSE_IDS,
  getDocumentPurposeContract,
  PURPOSE_LAUNCH_GATES,
} from "../../../../packages/api/src/generated-documents/purpose-catalog";
import {
  ADDED_SECTION_FIELDS,
  AVAILABILITY_TEST_FILE,
  BASE_VIEW_VERSION,
  CATALOG_TEST_FILE,
  DIRECT_GIFT_FIELDS,
  EXPECTED_GATES,
  EXPECTED_RECIPIENT_ROLE,
  EXPECTED_SOURCE_OWNER,
  NEW_GATES,
  PURPOSE_ID,
  readRepoFile,
} from "./catalog-scan";

const contract = () => getDocumentPurposeContract(PURPOSE_ID);

describe("issue #2068 done criterion 3: D1a identity", () => {
  it('criterion 3 / D1a: "the purpose ID stays `giving.summary.informational@1`"', () => {
    expect(contract().purpose_key).toBe("giving.summary.informational");
    expect(contract().purpose_version).toBe(1);
    expect(DOCUMENT_PURPOSE_IDS).toContain(PURPOSE_ID);
    expect(DOCUMENT_PURPOSE_IDS).not.toContain(
      "giving.summary.informational@2",
    );
  });
});

describe("issue #2068 done criterion 3: source_owner", () => {
  it("criterion 3: source_owner adds Phase 14 recognition (In item 3)", () => {
    expect(contract().source_owner).toBe(EXPECTED_SOURCE_OWNER);
  });
});

describe("issue #2068 done criterion 3: recipient_role.role", () => {
  it("criterion 3: recipient_role.role is authorized_recognition_subject (In item 3)", () => {
    expect(contract().recipient_role.role).toBe(EXPECTED_RECIPIENT_ROLE);
  });
});

describe("issue #2068 done criterion 3: launch.gates", () => {
  it("criterion 3: launch.gates is exactly D3, D4 and the Phase 7/13/14/19 gates, and launch.state stays supported_after_gates", () => {
    expect([...contract().launch.gates].sort()).toEqual(
      [...EXPECTED_GATES].sort(),
    );
    expect(contract().launch.state).toBe("supported_after_gates");
  });

  it("criterion 3: the new gate names are added to PURPOSE_LAUNCH_GATES", () => {
    for (const gate of NEW_GATES) {
      expect(PURPOSE_LAUNCH_GATES as readonly string[]).toContain(gate);
    }
  });
});

describe("issue #2068 done criterion 3: approved data view (D2a)", () => {
  it("criterion 3 / D2a: period_total is dropped", () => {
    expect(contract().approved_data_view.fields).not.toContain("period_total");
  });

  it("criterion 3 / D2a: the direct-gift fields stay", () => {
    for (const field of DIRECT_GIFT_FIELDS) {
      expect(contract().approved_data_view.fields).toContain(field);
    }
  });

  it("criterion 3 / D2a: household_support_items and daf_recommendation_items are added", () => {
    for (const field of ADDED_SECTION_FIELDS) {
      expect(contract().approved_data_view.fields).toContain(field);
    }
  });

  it("criterion 3 / D2a: the data view gets a new view_version", () => {
    const { view_version } = contract().approved_data_view;
    expect(Number.isInteger(view_version)).toBe(true);
    expect(view_version).toBeGreaterThan(BASE_VIEW_VERSION);
  });
});

describe('issue #2068 done criterion 3: "tests assert each one"', () => {
  it("criterion 3: the In item 4 tests name every new value", () => {
    const tests = [CATALOG_TEST_FILE, AVAILABILITY_TEST_FILE]
      .map(readRepoFile)
      .join("\n");
    const missing = [
      EXPECTED_SOURCE_OWNER,
      EXPECTED_RECIPIENT_ROLE,
      ...EXPECTED_GATES,
      ...ADDED_SECTION_FIELDS,
      "period_total",
    ].filter((value) => !tests.includes(value));
    expect(
      missing,
      `values not named in ${CATALOG_TEST_FILE} or ${AVAILABILITY_TEST_FILE}`,
    ).toEqual([]);
  });
});
