/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { getQueryClient } from "../../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../../packages/database/providers/query-provider";

import type { EveApprovalBudgetAdminView } from "../../../../../packages/api/src/eve/approval-budget/types";
import type { ComponentType } from "react";

const queryKey = ["admin", "eve", "approval-budget"] as const;
let EveApprovalBudgetPanel: ComponentType;

const view: EveApprovalBudgetAdminView & { requestId: string } = {
  approvals: [],
  budgets: [
    {
      additionalInputTokens: 0,
      additionalOutputTokens: 0,
      additionalRequests: 0,
      additionalUsdMicros: 0,
      id: "budget-1",
      maxInputTokens: 1_000,
      maxOutputTokens: 1_000,
      maxRequests: 10,
      maxUsdMicros: 10_000,
      scopeId: "review",
      scopeType: "model_role",
      usedInputTokens: 0,
      usedOutputTokens: 0,
      usedRequests: 0,
      usedUsdMicros: 0,
      windowSeconds: 3_600,
    },
  ],
  catalog: [],
  decisions: [],
  policies: [],
  requestId: "request-1",
};

function response(body: EveApprovalBudgetAdminView & { requestId: string }) {
  return {
    ok: true,
    json: async () => body,
  };
}

function renderPanel() {
  return render(
    <QueryProvider>
      <EveApprovalBudgetPanel />
    </QueryProvider>,
  );
}

beforeAll(async () => {
  const module =
    await import("../../../../../apps/admin/app/(app)/admin/eve/approval-budget-panel");
  EveApprovalBudgetPanel = module.EveApprovalBudgetPanel;
});

beforeEach(() => {
  getQueryClient().clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  getQueryClient().removeQueries({ queryKey });
});

describe("Eve approval budget overrides", () => {
  it("submits the rendered budget's scope type and ID", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) => response(view),
    );
    vi.stubGlobal("fetch", fetchMock);
    renderPanel();

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Add one request for 1 hour",
      }),
    );

    await waitFor(() => {
      const post = fetchMock.mock.calls.find(
        ([, init]) => init?.method === "POST",
      );
      expect(post).toBeDefined();
      expect(JSON.parse(String(post?.[1]?.body))).toMatchObject({
        action: "override_budget",
        scopeId: "review",
        scopeType: "model_role",
      });
    });
  });
});
