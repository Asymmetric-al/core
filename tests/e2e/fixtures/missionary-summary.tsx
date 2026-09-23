import * as React from "react";
import { createRoot } from "react-dom/client";

import { BalanceCard } from "../../../packages/missionary/components/balance-card";
import {
  ActivityFeedSkeleton,
  ChartSkeleton,
  MetricsSkeleton,
} from "../../../packages/missionary/components/skeletons";

function MissionarySummaryFixture() {
  return (
    <main
      className="grid grid-cols-1 gap-6 p-4"
      data-testid="missionary-summary"
    >
      {[0, -1234.56, 1234567890123.45].map((balance) => (
        <section key={balance} data-testid={`balance-${balance}`}>
          <BalanceCard currentBalance={balance} />
        </section>
      ))}
      <section data-testid="metrics">
        <MetricsSkeleton />
      </section>
      <section data-testid="chart">
        <ChartSkeleton />
      </section>
      <section data-testid="activity">
        <ActivityFeedSkeleton />
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <MissionarySummaryFixture />,
);
