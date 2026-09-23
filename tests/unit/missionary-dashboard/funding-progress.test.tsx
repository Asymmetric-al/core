/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it } from "vitest";

import { FundingProgress } from "../../../packages/missionary/components/funding-progress";

afterEach(cleanup);
describe("funding progress presentation", () => {
  it("preserves provided amounts and signed remaining value for overfunding", () => {
    render(
      <FundingProgress
        monthlySupport={7500}
        monthlyGoal={5000}
        percentFunded={150}
      />,
    );
    expect(screen.getByText("$7,500", { exact: true })).toBeTruthy();
    expect(screen.getByText("of $5,000", { exact: true })).toBeTruthy();
    expect(screen.getByText("$-2,500", { exact: true })).toBeTruthy();
    expect(screen.getByText("150%", { exact: true })).toBeTruthy();
  });
  it("exposes a bounded progress value while retaining the supplied funding percentage", () => {
    render(
      <FundingProgress
        monthlySupport={7500}
        monthlyGoal={5000}
        percentFunded={150}
      />,
    );
    const progress = screen.getByRole("progressbar", {
      name: "Monthly support funded",
      exact: true,
    });
    expect(progress.getAttribute("aria-valuenow")).toBe("100");
    expect(progress.getAttribute("aria-valuemax")).toBe("100");
    expect(progress.getAttribute("aria-valuetext")).toBe("150% funded");
  });
  it("bounds negative progress announcements while retaining signed values", () => {
    render(
      <FundingProgress
        monthlySupport={-1250}
        monthlyGoal={5000}
        percentFunded={-25}
      />,
    );
    const progress = screen.getByRole("progressbar", {
      name: "Monthly support funded",
      exact: true,
    });
    expect(progress.getAttribute("aria-valuenow")).toBe("0");
    expect(progress.getAttribute("aria-valuetext")).toBe("-25% funded");
    expect(screen.getByText("$-1,250", { exact: true })).toBeTruthy();
    expect(screen.getByText("$6,250", { exact: true })).toBeTruthy();
  });
});
