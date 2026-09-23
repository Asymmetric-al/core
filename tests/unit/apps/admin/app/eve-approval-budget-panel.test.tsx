/** @vitest-environment jsdom */

import {
  act,
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
  it("keeps the initiating allowance button focusable while its disabled peer cannot activate", async () => {
    const firstBudget = view.budgets[0];
    if (!firstBudget) throw new Error("The test requires one budget");
    const twoBudgets = {
      ...view,
      budgets: [
        firstBudget,
        { ...firstBudget, id: "budget-2", scopeId: "other" },
      ],
    };
    let finishMutation:
      | ((value: ReturnType<typeof response>) => void)
      | undefined;
    const pendingResponse = new Promise<ReturnType<typeof response>>(
      (resolve) => {
        finishMutation = resolve;
      },
    );
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) =>
        init?.method === "POST" ? pendingResponse : response(twoBudgets),
    );
    vi.stubGlobal("fetch", fetchMock);
    renderPanel();
    const [initiator, peer] = await screen.findAllByRole("button", {
      name: "Add one request for 1 hour",
    });
    if (!initiator || !peer)
      throw new Error("The test requires two allowance buttons");
    initiator.focus();
    fireEvent.click(initiator);
    await waitFor(() =>
      expect(initiator.getAttribute("aria-disabled")).toBe("true"),
    );
    expect(initiator.hasAttribute("disabled")).toBe(false);
    expect(document.activeElement).toBe(initiator);
    expect(peer.hasAttribute("disabled")).toBe(true);
    fireEvent.click(initiator);
    fireEvent.click(peer);
    expect(
      fetchMock.mock.calls.filter(([, init]) => init?.method === "POST"),
    ).toHaveLength(1);
    await act(async () => finishMutation?.(response(twoBudgets)));
    await waitFor(() =>
      expect(initiator.hasAttribute("aria-disabled")).toBe(false),
    );
  });
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

it("requests approval for the selected action", async () => {
  const fetchMock = vi.fn(
    async (_input: RequestInfo | URL, _init?: RequestInit) => response(view),
  );
  vi.stubGlobal("fetch", fetchMock);
  renderPanel();
  const action = await screen.findByRole("combobox", {
    name: /Fixed app-owned action/,
  });
  expect(action.textContent).toContain("Write engineering review artifact");
  action.focus();
  fireEvent.click(action);
  expect(screen.getByRole("listbox")).toBeTruthy();
  fireEvent.pointerDown(
    screen.getByRole("option", { name: "Attempt stricter donor-data class" }),
    { pointerType: "mouse" },
  );
  fireEvent.click(
    screen.getByRole("option", { name: "Attempt stricter donor-data class" }),
  );
  await waitFor(() =>
    expect(action.textContent).toContain("Attempt stricter donor-data class"),
  );
  await waitFor(() => expect(document.activeElement).toBe(action));
  fireEvent.click(
    screen.getByRole("button", { name: "Request required approval" }),
  );
  await waitFor(() => {
    const post = fetchMock.mock.calls.find(
      ([, init]) => init?.method === "POST",
    );
    expect(JSON.parse(String(post?.[1]?.body))).toEqual({
      action: "request_approval",
      actionId: "product.donor.write",
      targetKey: "review:tracer",
    });
  });
});
