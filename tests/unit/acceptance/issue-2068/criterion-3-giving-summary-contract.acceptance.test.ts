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
 * Spec addendum 1 (clarifications, approved 2026-10-22 9:49 PM PT):
 * {@link https://github.com/Asymmetric-al/core/issues/2068#issuecomment-6357644196}
 * - Item 2: grouping per currency is not testable from the catalog; criterion
 *   3 asserts the two added fields are present (criterion 6 covers
 *   `period_total`).
 * - Item 3: the direct-gift fields that stay are `period_gift_dates` and
 *   `period_gift_amounts`; `tenant_display_name`, `donor_display_name`,
 *   `period_start`, `period_end` and `not_official_statement` also stay
 *   unchanged; the new `view_version` is any integer greater than 1.
 * - Item 4: `phase19_statement_seam` already exists in `PURPOSE_LAUNCH_GATES`
 *   and is only newly added to the giving entry's `launch.gates`; only the
 *   phase07/phase13/phase14 gates are new names in `PURPOSE_LAUNCH_GATES`.
 *
 * Spec addendum 2 (array order, approved 2026-10-22 10:09 PM PT):
 * {@link https://github.com/Asymmetric-al/core/issues/2068#issuecomment-6357880766}
 * Canonical serialization keeps array order, so order feeds the digest.
 * - Item 1: `approved_data_view.fields` is exactly the nine fields in order.
 * - Item 2: `launch.gates` is exactly the six gates in order.
 * - Item 3: `PURPOSE_LAUNCH_GATES` gains exactly the three new names,
 *   appended at the end in order, and existing names keep their order.
 * The field and gate order checks run by default (they are this PR's
 * content). The exact `PURPOSE_LAUNCH_GATES` check stays opt-in.
 *
 * Interpretation:
 * - "tests assert each one" = the In item 4 test files name each asserted
 *   value literally.
 * - The exact-set check on `PURPOSE_LAUNCH_GATES` is opt-in
 *   (`ACCEPTANCE_2068_SCOPE=1` or `ACCEPTANCE_2068_BASE=<ref>`), because a
 *   later PR may legitimately add gate names.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { describe, expect, it } from "vitest";

const SCOPE_ENABLED =
  process.env.ACCEPTANCE_2068_SCOPE?.trim() === "1" ||
  (process.env.ACCEPTANCE_2068_BASE?.trim() ?? "") !== "";

import {
  DOCUMENT_PURPOSE_IDS,
  getDocumentPurposeContract,
  PURPOSE_LAUNCH_GATES,
} from "../../../../packages/api/src/generated-documents/purpose-catalog";
import {
  ADDED_SECTION_FIELDS,
  AVAILABILITY_TEST_FILE,
  BASE_GIVING_FIELDS,
  BASE_GIVING_GATES,
  BASE_PURPOSE_LAUNCH_GATES,
  BASE_VIEW_VERSION,
  CATALOG_TEST_FILE,
  DIRECT_GIFT_FIELDS,
  EXPECTED_GATES,
  EXPECTED_GIVING_FIELDS,
  EXPECTED_RECIPIENT_ROLE,
  EXISTING_GATE_ADDED_TO_GIVING,
  EXPECTED_SOURCE_OWNER,
  git,
  NEW_GATES,
  PURPOSE_ID,
  readRepoFile,
  SPEC_BASE_SHA,
  UNCHANGED_FIELDS,
} from "./catalog-scan";

/** Quoted string literals in a file as it was at the spec base. */
function baseSource(relativePath: string): string {
  const shown = git(["show", `${SPEC_BASE_SHA}:${relativePath}`]);
  if (shown.status !== 0) throw new Error(`git show failed: ${relativePath}`);
  return shown.stdout;
}

const GIVING_CATALOG =
  "packages/api/src/generated-documents/purpose-catalog/catalog.ts";
const CATALOG_TYPES =
  "packages/api/src/generated-documents/purpose-catalog/types.ts";

/** The giving entry's source block at the spec base. */
function baseGivingBlock(): string {
  const source = baseSource(GIVING_CATALOG);
  const start = source.indexOf(`"${PURPOSE_ID}": {`);
  const end = source.indexOf('  "tribute.notification@1": {', start);
  if (start < 0 || end < 0) throw new Error("giving entry not found at base");
  return source.slice(start, end);
}

/** The string literals of `name: [ ... ]` within a source block. */
function arrayLiterals(block: string, name: string): string[] {
  const match = new RegExp(`\\b${name}\\b[^=:]*[=:]\\s*\\[([^\\]]*)\\]`).exec(
    block,
  );
  if (!match) throw new Error(`${name} array not found`);
  return [...(match[1] as string).matchAll(/"([^"]+)"/g)].map(
    (m) => m[1] as string,
  );
}

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
  it("criterion 3 / addendum 2 item 2: launch.gates is exactly D3, D4, phase07, phase13, phase14, phase19 in that order, and launch.state stays supported_after_gates", () => {
    expect([...contract().launch.gates]).toEqual([...EXPECTED_GATES]);
    expect(contract().launch.state).toBe("supported_after_gates");
  });

  it("criterion 3 / addendum 1 item 4: the new gate names (phase07, phase13, phase14 only) are added to PURPOSE_LAUNCH_GATES", () => {
    for (const gate of NEW_GATES) {
      expect(PURPOSE_LAUNCH_GATES as readonly string[]).toContain(gate);
    }
  });

  it("criterion 3 / addendum 1 item 4: phase19_statement_seam is an existing PURPOSE_LAUNCH_GATES name, newly added to the giving entry", () => {
    // Base facts the addendum relies on (types.ts:140 at cc568c92).
    expect(
      arrayLiterals(baseSource(CATALOG_TYPES), "PURPOSE_LAUNCH_GATES"),
    ).toEqual([...BASE_PURPOSE_LAUNCH_GATES]);
    expect(arrayLiterals(baseGivingBlock(), "gates")).toEqual([
      ...BASE_GIVING_GATES,
    ]);
    for (const gate of NEW_GATES) {
      expect(BASE_PURPOSE_LAUNCH_GATES as readonly string[]).not.toContain(
        gate,
      );
    }
    // Live: still an existing name, and now on the giving entry.
    expect(PURPOSE_LAUNCH_GATES as readonly string[]).toContain(
      EXISTING_GATE_ADDED_TO_GIVING,
    );
    expect(contract().launch.gates as readonly string[]).toContain(
      EXISTING_GATE_ADDED_TO_GIVING,
    );
  });

  it("criterion 3 / addendum 2 item 3: no existing PURPOSE_LAUNCH_GATES name is removed or renamed, and existing names keep their order", () => {
    for (const gate of BASE_PURPOSE_LAUNCH_GATES) {
      expect(PURPOSE_LAUNCH_GATES as readonly string[]).toContain(gate);
    }
    const base = BASE_PURPOSE_LAUNCH_GATES as readonly string[];
    expect(PURPOSE_LAUNCH_GATES.filter((gate) => base.includes(gate))).toEqual([
      ...BASE_PURPOSE_LAUNCH_GATES,
    ]);
  });

  // Opt-in: a later PR may legitimately add or insert more gate names.
  it.skipIf(!SCOPE_ENABLED)(
    "criterion 3 / addendum 1 item 4 + addendum 2 item 3: PURPOSE_LAUNCH_GATES is the base list in its order followed by exactly phase07, phase13, phase14 at the end (opt-in: ACCEPTANCE_2068_SCOPE=1 or ACCEPTANCE_2068_BASE=<ref>)",
    () => {
      expect([...PURPOSE_LAUNCH_GATES]).toEqual([
        ...BASE_PURPOSE_LAUNCH_GATES,
        ...NEW_GATES,
      ]);
    },
  );
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

  it("criterion 3 / addendum 1 item 3: tenant_display_name, donor_display_name, period_start, period_end and not_official_statement stay unchanged versus cc568c92", () => {
    const base = arrayLiterals(baseGivingBlock(), "fields");
    expect(base).toEqual([...BASE_GIVING_FIELDS]);
    for (const field of [...UNCHANGED_FIELDS, ...DIRECT_GIFT_FIELDS]) {
      expect(base).toContain(field);
      expect(contract().approved_data_view.fields).toContain(field);
    }
    // Every base field other than period_total is kept under its base name
    // (order is not asserted).
    const kept = base.filter((field) => field !== "period_total");
    const live = contract().approved_data_view.fields as readonly string[];
    expect(kept.filter((field) => !live.includes(field))).toEqual([]);
  });

  it("criterion 3 / addendum 2 item 1: approved_data_view.fields is exactly the nine fields in order (period_total replaced in place)", () => {
    expect([...contract().approved_data_view.fields]).toEqual([
      ...EXPECTED_GIVING_FIELDS,
    ]);
  });

  it("criterion 3 / D2a: household_support_items and daf_recommendation_items are added", () => {
    for (const field of ADDED_SECTION_FIELDS) {
      expect(contract().approved_data_view.fields).toContain(field);
    }
  });

  it("criterion 3 / D2a / addendum 1 item 3: the data view gets a new view_version (any integer > 1)", () => {
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
