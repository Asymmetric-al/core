/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it } from "vitest";

import { FundingProgress } from "../../../packages/missionary/components/funding-progress";

afterEach(cleanup);
describe("funding progress presentation", () => {
  it("formats checked minor units and compares matching known currencies", () => {
    render(
      <FundingProgress
        monthlySupport={750000}
        supportCurrency="USD"
        monthlyGoal={500000}
        goalCurrency="USD"
      />,
    );
    expect(screen.getByText("$7,500.00", { exact: true })).toBeTruthy();
    expect(screen.getByText("of $5,000.00", { exact: true })).toBeTruthy();
    expect(screen.getByText("$0.00", { exact: true })).toBeTruthy();
    const progress = screen.getByRole("progressbar", {
      name: "Monthly support funded",
    });
    expect(progress.getAttribute("aria-valuenow")).toBe("100");
    expect(screen.queryByText("+12%")).toBeNull();
  });

  it("does not compare different currencies", () => {
    render(
      <FundingProgress
        monthlySupport={1000}
        supportCurrency="JPY"
        monthlyGoal={500000}
        goalCurrency="USD"
      />,
    );
    expect(screen.getByText("¥1,000", { exact: true })).toBeTruthy();
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.getByText(/currencies are mixed or unknown/)).toBeTruthy();
  });

  it("does not invent currency or percentage for unknown funding", () => {
    render(
      <FundingProgress
        monthlySupport={1000}
        supportCurrency={null}
        monthlyGoal={500000}
        goalCurrency={null}
      />,
    );
    expect(screen.queryByText(/\$/)).toBeNull();
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.getByText(/currencies are mixed or unknown/)).toBeTruthy();
  });
});
