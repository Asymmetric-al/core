/** @vitest-environment jsdom */

import { cleanup, render } from "@testing-library/react";
import { QueryProvider } from "@asym/database/providers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EveApprovalBudgetPanel } from "../../../../apps/admin/app/(app)/admin/eve/approval-budget-panel";
import { EveEngineeringMonitorsPanel } from "../../../../apps/admin/app/(app)/admin/eve/engineering-monitors-panel";
import { EveNotificationsPanel } from "../../../../apps/admin/app/(app)/admin/eve/notifications-panel";
import { EveModelPolicyPanel } from "../../../../apps/admin/app/(app)/admin/eve/model-policy-panel";
import { EveRetentionPanel } from "../../../../apps/admin/app/(app)/admin/eve/retention-panel";
import { EveAdminMemoryPanel } from "../../../../apps/admin/app/(app)/admin/eve/admin-memory-panel";
import { getQueryClient } from "../../../../packages/database/providers/query-client";

beforeEach(() => {
  getQueryClient().clear();
  vi.stubGlobal("fetch", () => new Promise(() => {}));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  getQueryClient().clear();
});

describe("Eve asynchronous status feedback", () => {
  it.each([
    [
      EveEngineeringMonitorsPanel,
      /No engineering-health findings/,
      "Read unavailable",
    ],
    [
      EveNotificationsPanel,
      /No eligible platform-owner|No notification delivery/,
      "Could not load Eve notifications.",
    ],
    [
      EveRetentionPanel,
      /No replay artifacts|No retention holds/,
      "Could not load Eve retention state.",
    ],
    [
      EveAdminMemoryPanel,
      /No matching private memory|No memory history/,
      "Read unavailable",
    ],
  ] as const)(
    "does not show successful emptiness when a panel read fails (%#)",
    async (Panel, emptyCopy, errorCopy) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          json: async () => ({ error: "Read unavailable" }),
        }),
      );
      const view = render(
        <QueryProvider>
          <Panel />
        </QueryProvider>,
      );
      await view.findByText(errorCopy);
      expect(view.queryAllByText(emptyCopy)).toHaveLength(0);
    },
  );
  it.each([
    ["Loading engineering monitors…", EveEngineeringMonitorsPanel],
    ["Loading notification controls…", EveNotificationsPanel],
    ["Loading model policy…", EveModelPolicyPanel],
  ] as const)("announces %s while its read is pending", (label, Panel) => {
    const view = render(
      <QueryProvider>
        <Panel />
      </QueryProvider>,
    );
    expect(view.getByRole("status").textContent).toContain(label);
  });

  it("announces pending approval and budget policy loading", () => {
    const view = render(
      <QueryProvider>
        <EveApprovalBudgetPanel />
      </QueryProvider>,
    );
    expect(view.getByRole("status").textContent).toContain(
      "Loading approval and budget policy…",
    );
  });
});
