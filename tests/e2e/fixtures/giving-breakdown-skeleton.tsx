import * as React from "react";
import { createRoot } from "react-dom/client";

import { GivingBreakdownChart } from "../../../packages/missionary/components/giving-breakdown-chart";

createRoot(document.getElementById("root")!).render(
  <main data-testid="giving-loading" className="w-full">
    <GivingBreakdownChart missionaryId="loading-fixture" />
  </main>,
);
