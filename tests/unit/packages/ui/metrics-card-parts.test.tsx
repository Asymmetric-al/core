/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it } from "vitest";

import {
  MetricHighlightPair,
  MetricTileGrid,
} from "../../../../packages/ui/components/shadcn-studio/blocks/metrics-card-parts";

describe("metrics card parts", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders each metric tile with its value", () => {
    render(
      <MetricTileGrid
        metrics={[
          { title: "Monthly giving", value: "$12,400", icons: <span>G</span> },
          { title: "Active donors", value: "48", icons: <span>D</span> },
        ]}
      />,
    );

    expect(screen.getByText("Monthly giving")).toBeTruthy();
    expect(screen.getByText("$12,400")).toBeTruthy();
    expect(screen.getByText("Active donors")).toBeTruthy();
    expect(screen.getByText("48")).toBeTruthy();
  });

  it("renders both highlight labels", () => {
    render(
      <MetricHighlightPair
        highlights={[
          { icon: <span>T</span>, label: "Support Trends" },
          { icon: <span>R</span>, label: "Donor Retention" },
        ]}
      />,
    );

    expect(screen.getByText("Support Trends")).toBeTruthy();
    expect(screen.getByText("Donor Retention")).toBeTruthy();
  });
});
