/** @vitest-environment jsdom */

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { createDefaultEveModelPolicy } from "@asym/api/eve/model-policy";
import { EveModelPolicyReadiness } from "../../../../../apps/admin/app/(app)/admin/eve/model-policy-panel";
import { canAccessEveOperationsWorkspace } from "../../../../../apps/admin/app/(app)/admin/eve/workspace-access";
import {
  EveCapabilityConnectionsPanel,
  EveWorkspaceIndex,
} from "../../../../../apps/admin/app/(app)/admin/eve/workspace-shell";

import type { AuthContext } from "@asym/auth/context";
import type { EveModelPolicyAdminView } from "@asym/api/eve/model-policy/types";

const baseAuth = {
  email: "operator@example.test",
  isAuthenticated: true,
  memberships: [],
  profileId: "00000000-0000-4000-8000-000000000001",
  profileRole: "admin",
  role: "admin",
  tenantId: "00000000-0000-4000-8000-000000000002",
  userId: "verified-operator",
} satisfies AuthContext;

afterEach(cleanup);

describe("Eve operations workspace", () => {
  it("allows only verified admin roles into the workspace", () => {
    expect(canAccessEveOperationsWorkspace(baseAuth)).toBe(true);
    expect(
      canAccessEveOperationsWorkspace({
        ...baseAuth,
        profileRole: "super_admin",
        role: "super_admin",
      }),
    ).toBe(true);
    expect(
      canAccessEveOperationsWorkspace({
        ...baseAuth,
        profileRole: "donor",
        role: "donor",
      }),
    ).toBe(false);
    expect(
      canAccessEveOperationsWorkspace({
        ...baseAuth,
        isAuthenticated: false,
      }),
    ).toBe(false);
  });

  it("puts every required operations panel ahead of chat", () => {
    const view = render(<EveWorkspaceIndex />);
    const navigation = view.getByRole("navigation", {
      name: "Eve operations panels",
    });

    for (const name of [
      "Active runs",
      "Approvals",
      "Recent actions",
      "Budgets",
      "Failures",
      "GitHub activity",
      "Eval health",
      "Memory",
      "Model policy",
      "Subagents",
      "Notifications",
      "Audit",
      "Retention",
      "Emergency controls",
    ]) {
      expect(navigation.querySelector(`a[href]`)).toBeTruthy();
      expect(
        view.getByRole("link", { name: new RegExp(`^${name}`) }),
      ).toBeTruthy();
    }

    expect(view.getByText(/Governance and control come first/i)).toBeTruthy();
  });

  it("labels only unimplemented connections unavailable", () => {
    const view = render(<EveCapabilityConnectionsPanel />);

    expect(view.getByRole("heading", { name: "GitHub activity" })).toBeTruthy();
    expect(view.getByRole("heading", { name: "Notifications" })).toBeTruthy();
    expect(view.getByRole("heading", { name: "Chat runtime" })).toBeTruthy();
    expect(view.getAllByText("Unavailable")).toHaveLength(2);
    expect(view.getByText("Mounted")).toBeTruthy();
    expect(
      view.getByText(/no commits, checks, reviews, or issues/i),
    ).toBeTruthy();
    expect(view.getByText(/no fabricated channel status/i)).toBeTruthy();
    expect(view.getByText(/explicit allowlist for page context/i)).toBeTruthy();
    expect(view.queryByText(/mock activity/i)).toBeNull();
  });

  it("derives eval and subagent health from the active model policy", () => {
    const policy = createDefaultEveModelPolicy();
    policy.subagentOverrides = {
      reviewer: {
        role: "review",
        reasoning: "high",
      },
    };
    const activePolicy = {
      activatedAt: "2026-07-17T00:00:00.000Z",
      createdAt: "2026-07-17T00:00:00.000Z",
      createdByProfileId: baseAuth.profileId!,
      evaluatedAt: "2026-07-17T00:01:00.000Z",
      evalStatus: "passed",
      evalSummary: {
        checks: [{ id: "smoke", message: "Strict smoke passed", passed: true }],
        evaluatedAt: "2026-07-17T00:01:00.000Z",
        status: "passed",
      },
      id: "00000000-0000-4000-8000-000000000003",
      policy,
      policyHash: "sha256:verified",
      status: "active",
      version: 3,
    } satisfies NonNullable<EveModelPolicyAdminView["activePolicy"]>;
    const data = {
      activePolicy,
      budgetOverrides: [],
      canManage: true,
      policies: [activePolicy],
    } satisfies EveModelPolicyAdminView;
    const view = render(<EveModelPolicyReadiness data={data} />);

    expect(view.getByRole("heading", { name: "Eval health" })).toBeTruthy();
    expect(
      view.getByText("Policy v3: 1 of 1 recorded checks passed."),
    ).toBeTruthy();
    expect(view.getByRole("heading", { name: "Subagent policy" })).toBeTruthy();
    expect(view.getByText("reviewer")).toBeTruthy();
    expect(view.getByText("review")).toBeTruthy();
  });
});
