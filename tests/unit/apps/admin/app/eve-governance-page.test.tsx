/** @vitest-environment jsdom */

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import type { EveAuditEventRecord } from "@asym/api/eve/audit/types";
import {
  createClearedEveKillSwitchState,
  type EveGovernanceAdminView,
  type EveKillSwitchKey,
} from "@asym/api/eve/governance/types";
import type { ComponentType } from "react";

type EveGovernanceViewComponent = ComponentType<{
  data?: EveGovernanceAdminView & { auditHistory: EveAuditEventRecord[] };
  errorMessage?: string;
  isError: boolean;
  isLoading: boolean;
  mutationError?: string;
  mutationPendingKey?: EveKillSwitchKey;
  onSetKillSwitch?: (switchKey: EveKillSwitchKey, enabled: boolean) => void;
}>;

let EveGovernanceView: EveGovernanceViewComponent;

describe("Eve governance admin view", () => {
  beforeAll(async () => {
    const pageClient =
      await import("../../../../../apps/admin/app/(app)/admin/eve/page-client");
    EveGovernanceView = pageClient.EveGovernanceView;
  });

  afterEach(cleanup);

  it("makes disabled, emergency, and policy status visible", () => {
    const view = render(
      <EveGovernanceView
        data={{
          system: {
            source: "persisted",
            releaseEnabled: false,
            emergencyOff: false,
            killSwitchState: createClearedEveKillSwitchState(),
            policyStatus: "not_configured",
            stateVersion: 1,
            updatedAt: "2026-07-17T00:00:00.000Z",
          },
          auditHistory: [],
          recentRuns: [],
        }}
        isError={false}
        isLoading={false}
      />,
    );

    expect(view.getByText("Disabled")).toBeTruthy();
    expect(view.getByText("Emergency clear")).toBeTruthy();
    expect(view.getByText("Not configured")).toBeTruthy();
    expect(
      view.getByText(/Eve cannot perform autonomous actions/i),
    ).toBeTruthy();
  });

  it("does not present a release-switch mutation control", () => {
    const view = render(
      <EveGovernanceView
        data={{
          system: {
            source: "persisted",
            releaseEnabled: false,
            emergencyOff: false,
            killSwitchState: createClearedEveKillSwitchState(),
            policyStatus: "not_configured",
            stateVersion: 1,
            updatedAt: "2026-07-17T00:00:00.000Z",
          },
          auditHistory: [],
          recentRuns: [],
        }}
        isError={false}
        isLoading={false}
      />,
    );

    expect(view.queryByRole("button", { name: /enable eve/i })).toBeNull();
    expect(view.queryByRole("switch")).toBeNull();
  });

  it("identifies a missing governance row as fail-closed", () => {
    const view = render(
      <EveGovernanceView
        data={{
          system: {
            source: "missing",
            releaseEnabled: false,
            emergencyOff: false,
            killSwitchState: createClearedEveKillSwitchState(),
            policyStatus: "not_configured",
            stateVersion: 1,
            updatedAt: "1970-01-01T00:00:00.000Z",
          },
          auditHistory: [],
          recentRuns: [],
        }}
        isError={false}
        isLoading={false}
      />,
    );

    expect(view.getByText("Governance state is missing")).toBeTruthy();
    expect(view.getByText(/kernel is fail-closed/i)).toBeTruthy();
  });

  it("shows redacted audit history and a decision summary", () => {
    const view = render(
      <EveGovernanceView
        data={{
          system: {
            source: "persisted",
            releaseEnabled: false,
            emergencyOff: false,
            killSwitchState: createClearedEveKillSwitchState(),
            policyStatus: "not_configured",
            stateVersion: 1,
            updatedAt: "2026-07-17T00:00:00.000Z",
          },
          recentRuns: [],
          auditHistory: [
            {
              id: "00000000-0000-4000-8000-000000000001",
              actorId: "verified-admin",
              actorProfileId: "00000000-0000-4000-8000-000000000002",
              actorRole: "admin",
              tenantId: "00000000-0000-4000-8000-000000000003",
              identityMode: "admin",
              initiatorType: "authenticated_admin",
              initiatorId: "verified-admin",
              policyId: "eve-governance-kernel",
              policyStatus: "not_configured",
              governanceStateVersion: 1,
              action: "governance.inspect",
              target: "eve:global",
              result: "succeeded",
              modelRole: "not_used",
              evidenceSummary: '{"releaseEnabled":false}',
              changeSummary: '{"stateChanged":false}',
              decisionSummary:
                "governance.inspect succeeded. Rationale: Authorized inspection.",
              debugMetadata: { requestId: "request-1" },
              redactionVersion: "eve-audit-v1",
              createdAt: "2026-07-17T00:00:00.000Z",
            },
          ],
        }}
        isError={false}
        isLoading={false}
      />,
    );

    expect(view.getByText("Audit history")).toBeTruthy();
    expect(view.getByText("governance.inspect")).toBeTruthy();
    expect(view.getAllByText(/verified-admin/)).toHaveLength(2);
    expect(view.queryByText(/raw model reasoning contents/i)).toBeNull();
  });

  it("shows every required kill switch and requires confirmation", () => {
    const onSetKillSwitch = vi.fn();
    const view = render(
      <EveGovernanceView
        data={{
          system: {
            source: "persisted",
            releaseEnabled: false,
            emergencyOff: false,
            killSwitchState: createClearedEveKillSwitchState(),
            policyStatus: "not_configured",
            stateVersion: 1,
            updatedAt: "2026-07-17T00:00:00.000Z",
          },
          auditHistory: [],
          recentRuns: [],
        }}
        isError={false}
        isLoading={false}
        onSetKillSwitch={onSetKillSwitch}
      />,
    );

    for (const label of [
      "All automation",
      "Active runs",
      "GitHub actions",
      "Production writes",
      "Sandbox networking",
      "Dynamic workflows",
      "Model-policy changes",
      "Force approval",
    ]) {
      expect(view.getByText(label)).toBeTruthy();
    }

    fireEvent.click(view.getAllByRole("button", { name: "Engage" })[2]!);
    expect(onSetKillSwitch).not.toHaveBeenCalled();
    fireEvent.click(view.getByRole("button", { name: "Confirm engage" }));
    expect(onSetKillSwitch).toHaveBeenCalledWith("github_actions", true);
  });

  it("shows failure summaries from real governed runs", () => {
    const view = render(
      <EveGovernanceView
        data={{
          system: {
            source: "persisted",
            releaseEnabled: false,
            emergencyOff: false,
            killSwitchState: createClearedEveKillSwitchState(),
            policyStatus: "ready",
            stateVersion: 2,
            updatedAt: "2026-07-17T00:00:00.000Z",
          },
          auditHistory: [],
          recentRuns: [
            {
              id: "00000000-0000-4000-8000-000000000004",
              action: "engineering.health.inspect",
              decision: "allowed",
              reason: "governance_allowed",
              status: "failed",
              target: "ci:develop",
              updatedAt: "2026-07-17T00:02:00.000Z",
            },
          ],
        }}
        isError={false}
        isLoading={false}
      />,
    );

    expect(
      view.getByRole("heading", { name: "Governed failures" }),
    ).toBeTruthy();
    expect(view.getAllByText("engineering.health.inspect")).toHaveLength(2);
    expect(view.getByText(/Target: ci:develop/)).toBeTruthy();
    expect(view.getByText("Failed")).toBeTruthy();
  });

  it("keeps the newest failures when truncating across runs and audits", () => {
    const failedRuns = Array.from({ length: 10 }, (_, index) => ({
      id: `00000000-0000-4000-8000-00000000010${index}`,
      action: `run.action.${index}`,
      decision: "allowed" as const,
      reason: "governance_allowed",
      status: "failed" as const,
      target: "ci:develop",
      updatedAt: `2026-07-17T00:0${Math.min(index, 9)}:00.000Z`,
    }));
    const newerAuditFailure: EveAuditEventRecord = {
      id: "00000000-0000-4000-8000-000000000200",
      actorId: "eve",
      identityMode: "service",
      initiatorType: "system",
      initiatorId: "eve-kernel",
      policyId: "eve-governance-kernel",
      policyStatus: "ready",
      action: "audit.failure.latest",
      result: "failed",
      modelRole: "orchestrator",
      evidenceSummary: "Redacted evidence.",
      changeSummary: "No change applied.",
      decisionSummary: "Newest audited failure.",
      debugMetadata: {},
      redactionVersion: "eve-audit-v1",
      createdAt: "2026-07-17T01:00:00.000Z",
    };
    const view = render(
      <EveGovernanceView
        data={{
          system: {
            source: "persisted",
            releaseEnabled: false,
            emergencyOff: false,
            killSwitchState: createClearedEveKillSwitchState(),
            policyStatus: "ready",
            stateVersion: 2,
            updatedAt: "2026-07-17T00:00:00.000Z",
          },
          auditHistory: [newerAuditFailure],
          recentRuns: failedRuns,
        }}
        isError={false}
        isLoading={false}
      />,
    );

    const failuresCard = view.container.querySelector("#eve-failures");
    expect(failuresCard).toBeTruthy();
    const summaries = Array.from(
      failuresCard!.querySelectorAll("li p.text-sm.font-medium"),
    ).map((node) => node.textContent);

    expect(summaries).toHaveLength(10);
    expect(summaries[0]).toBe("audit.failure.latest");
    expect(summaries).not.toContain("run.action.0");
  });
});
