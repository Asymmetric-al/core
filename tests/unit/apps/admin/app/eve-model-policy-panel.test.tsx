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

import { createDefaultEveModelPolicy } from "../../../../../packages/api/src/eve/model-policy";
import { getQueryClient } from "../../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../../packages/database/providers/query-provider";

import type {
  EveModelPolicyAdminView,
  EveModelPolicyRecord,
} from "../../../../../packages/api/src/eve/model-policy/types";
import type { ComponentType } from "react";

let EveModelPolicyPanel: ComponentType;
const activePolicy: EveModelPolicyRecord = {
  id: "policy-1",
  policy: createDefaultEveModelPolicy(),
  policyHash: "policy-hash",
  createdAt: "2026-09-23T00:00:00.000Z",
  createdByProfileId: "profile-1",
  evalStatus: "passed",
  status: "active",
  version: 1,
};
const view: EveModelPolicyAdminView = {
  activePolicy,
  budgetOverrides: [],
  canManage: true,
  policies: [activePolicy],
};

beforeAll(async () => {
  const module =
    await import("../../../../../apps/admin/app/(app)/admin/eve/model-policy-panel");
  EveModelPolicyPanel = module.EveModelPolicyPanel;
});
beforeEach(() => getQueryClient().clear());
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  getQueryClient().clear();
});
function renderPanel() {
  return render(
    <QueryProvider>
      <EveModelPolicyPanel />
    </QueryProvider>,
  );
}
function response(data: EveModelPolicyAdminView) {
  return { ok: true, json: async () => ({ ...data, requestId: "request-1" }) };
}

describe("Eve model-policy scope control", () => {
  it("confirms the selected subagent scope in the bounded override payload", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) => response(view),
    );
    vi.stubGlobal("fetch", fetchMock);
    renderPanel();
    const scope = await screen.findByRole("combobox", { name: /Scope type/ });
    expect(scope.textContent).toContain("Role");
    fireEvent.click(scope);
    expect(screen.getByRole("listbox")).toBeTruthy();
    fireEvent.pointerDown(screen.getByRole("option", { name: "Subagent" }), {
      pointerType: "mouse",
    });
    fireEvent.click(screen.getByRole("option", { name: "Subagent" }));
    await waitFor(() => expect(document.activeElement).toBe(scope));
    fireEvent.change(screen.getByLabelText("Scope identifier"), {
      target: { value: "reviewer" },
    });
    fireEvent.change(screen.getByLabelText("Reason"), {
      target: { value: "Bounded review allowance" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Review emergency override" }),
    );
    expect(await screen.findByRole("alertdialog")).toBeTruthy();
    expect(
      screen.getByText(/This applies only to subagent reviewer/),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Confirm bounded override" }),
    );
    await waitFor(() => {
      const patch = fetchMock.mock.calls.find(
        ([, init]) => init?.method === "PATCH",
      );
      expect(JSON.parse(String(patch?.[1]?.body))).toMatchObject({
        action: "override_budget",
        policyId: "policy-1",
        scopeType: "subagent",
        scopeId: "reviewer",
        reason: "Bounded review allowance",
        additionalRequests: 10,
      });
    });
  });

  it("does not expose scope editing without management permission", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => response({ ...view, canManage: false })),
    );
    renderPanel();
    expect(await screen.findByText("Read only")).toBeTruthy();
    expect(screen.queryByRole("combobox", { name: /Scope type/ })).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Review emergency override" }),
    ).toBeNull();
  });
});
