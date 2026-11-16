// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StatsStrip } from "../../../../../../../apps/admin/features/support-hub/components/stats/StatsStrip";
import { ViewTabs } from "../../../../../../../apps/admin/features/support-hub/components/tabs/ViewTabs";

const state = vi.hoisted(() => ({ isError: true, isLoading: false }));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-conversations",
  () => ({ useSupportConversations: () => ({ data: [], ...state }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-stats",
  () => ({
    useSupportInboxStats: () => ({
      ...state,
      data: {
        buckets: [],
        resolvedTodayCount: 0,
        pastDueCount: 0,
        averageFirstResponseMinutes: 0,
      },
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/current-agent",
  () => ({ useCurrentSupportAgentId: () => null }),
);
afterEach(cleanup);
describe("unknown inbox counts", () => {
  it.each([false, true])(
    "does not display fabricated zeros while loading=%s",
    (isLoading) => {
      Object.assign(state, { isLoading, isError: !isLoading });
      const view = render(
        <>
          <StatsStrip />
          <ViewTabs value="all" onValueChange={vi.fn()} />
        </>,
      );
      expect(view.container.textContent).not.toContain("(0)");
      expect(view.container.textContent).not.toContain("0 resolved today");
      expect(screen.queryAllByText("0")).toHaveLength(0);
      expect(
        screen.getAllByText(isLoading ? "Loading" : "Not available").length,
      ).toBeGreaterThan(0);
    },
  );
});
