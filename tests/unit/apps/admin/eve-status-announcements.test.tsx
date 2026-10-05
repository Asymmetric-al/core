/** @vitest-environment jsdom */

import { cleanup, render } from "@testing-library/react";
import { QueryProvider } from "@asym/database/providers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EveApprovalBudgetPanel } from "../../../../apps/admin/app/(app)/admin/eve/approval-budget-panel";
import { EveEngineeringMonitorsPanel } from "../../../../apps/admin/app/(app)/admin/eve/engineering-monitors-panel";
import { EveNotificationsPanel } from "../../../../apps/admin/app/(app)/admin/eve/notifications-panel";
import { EveModelPolicyPanel } from "../../../../apps/admin/app/(app)/admin/eve/model-policy-panel";
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
