/** #2257 done criteria 10, 11: ADR-0001 amendment and Phase 7 notes (spec r2 In 4, 5). Owned by Acceptance. */
import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { read } from "./harness";

const ADR = "docs/adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md";
const PRD = "docs/prds/sitestacker-parity/phase-0";
const HEAD =
  "### 2026-10-24: Phase 9 re-confirm of the CRM identity-link enum extension (#569 → #2257)";
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const amendment = () => {
  const text = read(ADR);
  const at = text.indexOf("\n## Amendments\n");
  expect(at, "## Amendments section").toBeGreaterThan(
    text.indexOf("\n## Alternatives rejected\n"),
  );
  expect(text.slice(at)).toContain(`\n${HEAD}\n`);
  return text.slice(text.indexOf(HEAD));
};
/** The bullet starting with `anchor`, plus its continuation and indented sub-lines. */
const bullet = (text: string, anchor: string) => {
  const lines = text.split("\n");
  const i = lines.findIndex((l) => l.startsWith(anchor));
  expect(i, `bullet starting ${anchor}`).toBeGreaterThan(-1);
  const end = lines.findIndex(
    (l, j) => j > i && (/^(- |#)/.test(l) || l === ""),
  );
  return lines.slice(i, end < 0 ? undefined : end).join("\n");
};

describe("#2257 criterion 10: ADR-0001 Phase 9 re-confirm", () => {
  it("is additive: ADR :1-138 (incl. Status) and the phase-09 PRD body are unchanged", () => {
    expect(sha(`${read(ADR).split("\n").slice(0, 138).join("\n")}\n`)).toBe(
      "9c22b96bc08b73bdc51c9c3392c78a447be08f1d651be679bef5e277cd509174",
    );
    expect(sha(read(`${PRD}9-full-crm-depth-relationship-graph.md`))).toBe(
      "5ad79f0a72d146c98777bb5cbcbe1c8956ff9f88a7c485653276cb6548d5773b",
    );
  });
  it("records the ruling, kept values + consumer, lockstep rule and parity test", () => {
    const a = amendment();
    const needles = [
      "Samson",
      "Blake",
      "Q12",
      "#569",
      "Re-confirm at the Phase 9 grill",
      "`household`",
    ];
    needles.push(
      "`organization`",
      "#570",
      "crm_record_links",
      "crm-identity-parity.test.ts",
    );
    expect(
      needles.filter((s) => !a.includes(s)),
      "missing from amendment",
    ).toEqual([]);
    expect(a).toMatch(/lockstep/i);
  });
  it.each([
    ["`daf_sponsor`", /org_type/],
    ["`person`", /`crm_person`/],
    ["`gift_credit`", /#571/],
  ])("%s is recorded as dropped with its reason", (value, reason) => {
    const line =
      amendment()
        .split("\n")
        .find((l) => l.includes(value)) ?? "";
    expect(line).toMatch(/drop/i);
    expect(line).toMatch(reason);
  });
});

describe("#2257 criterion 11: Phase 7 PRD C4 (:278) and contract line (:330)", () => {
  it.each([
    "- **C4 — CRM identity-link enum extension",
    "- `crm_link_entity_type` + `CrmIdentityConceptId`",
  ])(
    "%s notes #2257 with two values, the ADR amendment and the parity test",
    (anchor) => {
      const b = bullet(
        read(`${PRD}7-receipt-statement-compliance-and-donor-credit.md`),
        anchor,
      );
      for (const s of [
        "#2257",
        "0001-asym-postgres-owns-crm-truth-twenty-retired.md",
        "crm-identity-parity.test.ts",
      ])
        expect(b).toContain(s);
      expect(b).toMatch(/\btwo\b/i);
      expect(b).toMatch(/amendment/i);
    },
  );
});
