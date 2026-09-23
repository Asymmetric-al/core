import * as React from "react";
import { createRoot } from "react-dom/client";

import { GivingBreakdownChart } from "../../../packages/missionary/components/giving-breakdown-chart";
import { MetricTiles } from "../../../packages/missionary/components/metric-tiles";
createRoot(document.getElementById("root")!).render(
  <main className="p-4 bg-background text-foreground">
    <MetricTiles missionaryId="local-chart-fixture" />
    <div data-testid="breakdown">
      <GivingBreakdownChart missionaryId="local-chart-fixture" />
    </div>
  </main>,
);
