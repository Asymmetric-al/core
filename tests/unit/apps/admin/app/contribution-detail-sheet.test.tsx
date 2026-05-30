/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContributionDetailSheet } from "../../../../../apps/admin/app/contributions/contribution-detail-sheet";
import { boneyardContributionsFixture } from "../../../../../apps/admin/app/contributions/data";

afterEach(() => {
  cleanup();
});

describe("ContributionDetailSheet a11y", () => {
  it("exposes an accessible name on the close button and calls onClose", () => {
    const onClose = vi.fn();
    const contribution = boneyardContributionsFixture[0]!;

    render(
      <ContributionDetailSheet contribution={contribution} onClose={onClose} />,
    );

    const closeButton = screen.getByRole("button", {
      name: /close contribution details/i,
    });
    expect(closeButton).toBeTruthy();

    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
