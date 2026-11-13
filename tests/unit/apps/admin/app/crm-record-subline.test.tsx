/** @vitest-environment jsdom */

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CrmRecordSubline } from "../../../../../apps/admin/app/(app)/crm/columns";

/**
 * The record subline's "·" separators sit between flex items, where a
 * leading or trailing space inside an item is dropped ("Individual·"). The
 * spacing must come from the separator's own margin, not from whitespace.
 */
function separators(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      '[data-slot="crm-subline-separator"]',
    ),
  );
}

function expectMarginSpaced(separator: HTMLElement) {
  expect(separator.textContent).toBe("·");
  expect(separator.getAttribute("aria-hidden")).toBe("true");
  expect(separator.className).toMatch(/(^|\s)mx-1(\s|$)/);
}

describe("CRM record subline separators", () => {
  afterEach(cleanup);

  it("spaces the table row's separators with margin, not whitespace", () => {
    const { container } = render(
      <CrmRecordSubline
        recordType="Individual"
        owner="Priya Nair"
        subline="High school chemistry teacher"
      />,
    );
    const found = separators(container);
    expect(found).toHaveLength(2);
    found.forEach(expectMarginSpaced);
  });

  it("spaces the phone card's separator with margin, not whitespace", () => {
    const { container } = render(
      <CrmRecordSubline
        recordType="Individual"
        owner="Priya Nair"
        subline="High school chemistry teacher"
        stacked
      />,
    );
    // The title has its own line on a card, so only type and owner share one.
    const found = separators(container);
    expect(found).toHaveLength(1);
    found.forEach(expectMarginSpaced);
  });

  it("adds no separator when only one part is present", () => {
    const { container } = render(
      <CrmRecordSubline recordType={null} owner={null} subline="Teacher" />,
    );
    expect(separators(container)).toHaveLength(0);
  });
});
