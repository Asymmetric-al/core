/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EveApprovalBudgetPanel } from "../../../../../apps/admin/app/(app)/admin/eve/approval-budget-panel";
import { getQueryClient } from "../../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../../packages/database/providers/query-provider";

afterEach(() => {
  cleanup();
  getQueryClient().clear();
  vi.unstubAllGlobals();
});

describe("Eve approval policy loading feedback", () => {
  it("announces the shared query while the approval queue is pending", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise<Response>(() => {})),
    );
    render(
      <QueryProvider>
        <EveApprovalBudgetPanel />
      </QueryProvider>,
    );
    expect(screen.getByRole("status").textContent).toContain(
      "Loading approval and budget policy",
    );
    expect(screen.getByLabelText("Loading approval requests")).toBeTruthy();
    expect(screen.queryByText("No approval requests.")).toBeNull();
  });
});
