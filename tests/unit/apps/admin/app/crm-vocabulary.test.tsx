/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import type { ComponentType } from "react";

type Option = { label: string; value: string };

let normalizeCrmVocabulary: (value: string | null | undefined) => string | null;
let CRM_RECORD_TYPE_OPTIONS: Option[];
let CRM_STATUS_OPTIONS: Option[];
let CrmStatusBadge: ComponentType<{ status: string | null | undefined }>;

/**
 * Records were written with several spellings (`at_risk` by the seed, `At
 * Risk` by the missionary portal, `Church` and `church`). The filters,
 * badges and board lanes share one vocabulary so each value reads, filters
 * and groups the same whatever its spelling.
 */
describe("CRM vocabulary", () => {
  beforeAll(async () => {
    ({
      CRM_RECORD_TYPE_OPTIONS,
      CRM_STATUS_OPTIONS,
      CrmStatusBadge,
      normalizeCrmVocabulary,
    } = await import("../../../../../apps/admin/app/(app)/crm/crm-display"));
  }, 120_000);

  afterEach(cleanup);

  it("reduces every spelling of a value to one key", () => {
    expect(normalizeCrmVocabulary("At Risk")).toBe("at_risk");
    expect(normalizeCrmVocabulary("at-risk")).toBe("at_risk");
    expect(normalizeCrmVocabulary("at_risk")).toBe("at_risk");
    expect(normalizeCrmVocabulary("Church")).toBe("church");
    expect(normalizeCrmVocabulary("  ")).toBeNull();
    expect(normalizeCrmVocabulary(null)).toBeNull();
  });

  it("offers the record types and statuses records actually carry", () => {
    expect(CRM_RECORD_TYPE_OPTIONS).toEqual([
      { label: "Individual", value: "individual" },
      { label: "Church", value: "church" },
      { label: "Foundation", value: "foundation" },
      { label: "Organization", value: "organization" },
    ]);
    expect(CRM_STATUS_OPTIONS).toEqual([
      { label: "Active", value: "active" },
      { label: "New", value: "new" },
      { label: "At risk", value: "at_risk" },
      { label: "Lapsed", value: "lapsed" },
      { label: "Inactive", value: "inactive" },
    ]);
  });

  it("labels and colors a status the same whatever its spelling", () => {
    render(
      <>
        <CrmStatusBadge status="At Risk" />
        <CrmStatusBadge status="at_risk" />
      </>,
    );
    const badges = screen.getAllByText("At risk");
    expect(badges).toHaveLength(2);
    expect(badges[0]!.className).toBe(badges[1]!.className);
    expect(badges[0]!.getAttribute("data-variant")).toBe("warning");
  });
});
