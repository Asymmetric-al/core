/** @vitest-environment jsdom */

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-2690: Component integration tests exercise the actual admin panels.
import { EveAdminMemoryPanel } from "../../../../../apps/admin/app/(app)/admin/eve/admin-memory-panel";
// eslint-disable-next-line no-restricted-imports -- AL-2690: Component integration tests exercise the actual admin panels.
import { EveApprovalBudgetPanel } from "../../../../../apps/admin/app/(app)/admin/eve/approval-budget-panel";
// eslint-disable-next-line no-restricted-imports -- AL-2690: Component integration tests exercise the actual admin panels.
import { EveModelPolicyPanel } from "../../../../../apps/admin/app/(app)/admin/eve/model-policy-panel";
// eslint-disable-next-line no-restricted-imports -- AL-2690: Component integration tests exercise the actual admin panels.
import { EveNotificationsPanel } from "../../../../../apps/admin/app/(app)/admin/eve/notifications-panel";
// eslint-disable-next-line no-restricted-imports -- AL-2690: Component integration tests exercise the actual admin panels.
import { EveRetentionPanel } from "../../../../../apps/admin/app/(app)/admin/eve/retention-panel";
import { createDefaultEveModelPolicy } from "../../../../../packages/api/src/eve/model-policy";
import { getQueryClient } from "../../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../../packages/database/providers/query-provider";

import type { ReactElement } from "react";

const timestamp = "2026-11-01T12:00:00.000Z";

function stubJson(body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ requestId: "request-1", ...(body as object) }),
    })),
  );
}

function renderWithQuery(ui: ReactElement) {
  return render(<QueryProvider>{ui}</QueryProvider>);
}

beforeEach(() => getQueryClient().clear());

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  getQueryClient().clear();
});

describe("Eve per-row action names", () => {
  it("names approval decisions and budget allowances for their row", async () => {
    stubJson({
      approvals: [
        {
          actionId: "engineering.review_artifact.write",
          approvalLevel: "zone",
          expiresAt: timestamp,
          id: "approval-1",
          status: "pending",
          targetKey: "review:tracer",
          trustZone: "engineering",
        },
      ],
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
    });
    renderWithQuery(<EveApprovalBudgetPanel />);

    expect(
      await screen.findByRole("button", {
        name: "Approve: Write engineering review artifact on review:tracer",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: "Deny: Write engineering review artifact on review:tracer",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: "Add one request for 1 hour to model_role: review",
      }),
    ).toBeTruthy();
  });

  it("names memory category and entry actions for their row", async () => {
    stubJson({
      entries: [
        {
          category: "preference",
          content: "Use the shared design system.",
          createdAt: timestamp,
          id: "entry-1",
          isDeleted: false,
          ownerProfileId: "profile-1",
          scopeType: "admin_private",
          source: "manual",
          tenantId: "tenant-1",
          title: "Project convention",
          updatedAt: timestamp,
          version: 1,
        },
      ],
      history: [],
      settings: [
        { autoSaveEnabled: true, category: "preference", updatedAt: timestamp },
        { autoSaveEnabled: false, category: "decision", updatedAt: timestamp },
      ],
    });
    renderWithQuery(<EveAdminMemoryPanel />);

    expect(
      await screen.findByRole("button", { name: "Edit: Project convention" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Delete: Project convention" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: "Disable automatic save: Preferences",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Enable automatic save: Decisions" }),
    ).toBeTruthy();
  });

  it("labels each notification channel card and names its actions and recipients", async () => {
    stubJson({
      channels: [
        { channel: "email", enabled: true, paused: false },
        { channel: "discord", enabled: false, paused: true },
      ],
      recentNotifications: [],
      recipients: [
        {
          displayName: "Ada Owner",
          email: "ada@example.org",
          enabled: true,
          optedOut: false,
          profileId: "profile-1",
          role: "super_admin",
          tenantId: "tenant-1",
        },
        {
          email: "grace@example.org",
          enabled: false,
          optedOut: true,
          profileId: "profile-2",
          role: "super_admin",
          tenantId: "tenant-1",
        },
      ],
    });
    renderWithQuery(<EveNotificationsPanel />);

    const email = await screen.findByRole("region", { name: "email" });
    expect(
      within(email).getByRole("button", { name: "Disable: Email" }),
    ).toBeTruthy();
    expect(
      within(email).getByRole("button", { name: "Pause: Email" }),
    ).toBeTruthy();
    const discord = screen.getByRole("region", { name: "discord" });
    expect(
      within(discord).getByRole("button", { name: "Enable: Discord" }),
    ).toBeTruthy();
    expect(
      within(discord).getByRole("button", { name: "Resume: Discord" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Remove recipient: ada@example.org" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: "Enable recipient: grace@example.org",
      }),
    ).toBeTruthy();
  });

  it("names each retention hold's clear action for its hold", async () => {
    stubJson({
      artifacts: [],
      categories: [],
      holds: [
        {
          createdAt: timestamp,
          holdType: "legal",
          id: "hold-1",
          reason: "Counsel request",
          scopeType: "run",
          status: "active",
          targetId: "run-1",
        },
      ],
      lifecycle: [],
    });
    renderWithQuery(<EveRetentionPanel />);

    expect(
      await screen.findByRole("button", { name: "Clear hold: Legal · Run" }),
    ).toBeTruthy();
  });

  it("names model policy version actions for their version", async () => {
    const policy = createDefaultEveModelPolicy();
    const active = {
      createdAt: timestamp,
      createdByProfileId: "profile-1",
      evalStatus: "passed",
      id: "policy-2",
      policy,
      policyHash: "policy-hash-2",
      previousPolicyId: "policy-1",
      status: "active",
      version: 2,
    };
    const evaluated = {
      ...active,
      id: "policy-3",
      policyHash: "policy-hash-3",
      previousPolicyId: undefined,
      status: "evaluated",
      version: 3,
    };
    stubJson({
      activePolicy: active,
      budgetOverrides: [],
      canManage: true,
      policies: [evaluated, active],
    });
    renderWithQuery(<EveModelPolicyPanel />);

    expect(
      await screen.findByRole("button", { name: "Run policy eval: Policy v3" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: "Activate eval-passed policy: Policy v3",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Roll back: Policy v2" }),
    ).toBeTruthy();
  });
});
