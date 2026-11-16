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
  onRetry?: () => void;
}>;

let EveGovernanceView: EveGovernanceViewComponent;

describe("Eve governance admin view", () => {
  beforeAll(async () => {
    const pageClient =
      await import("../../../../../apps/admin/app/(app)/admin/eve/page-client");
    EveGovernanceView = pageClient.EveGovernanceView;
  });

  afterEach(cleanup);

  it("announces loading governance state", () => {
    const view = render(<EveGovernanceView isError={false} isLoading />);
    expect(view.getByRole("status").textContent).toContain(
      "Loading Eve governance state…",
    );
  });

  it.each([true, false])(
    "keeps every governance anchor while loading=%s and offers retry on failure",
    (isLoading) => {
      const onRetry = vi.fn();
      const view = render(
        <EveGovernanceView
          isLoading={isLoading}
          isError={!isLoading}
          onRetry={onRetry}
        />,
      );
      for (const section of [
        "eve-emergency-controls",
        "eve-active-runs",
        "eve-failures",
        "eve-audit",
      ]) {
        expect(document.getElementById(section)).not.toBeNull();
      }
      expect(
        view.getByRole("heading", { name: "Kill-switch controls" }),
      ).toBeTruthy();
      expect(view.getByRole("heading", { name: "Audit history" })).toBeTruthy();
      if (!isLoading) {
        fireEvent.click(view.getByRole("button", { name: "Try again" }));
        expect(onRetry).toHaveBeenCalledOnce();
      }
    },
  );

  it("announces an in-flight kill-switch change while every control is disabled", () => {
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
        mutationPendingKey="all_automation"
      />,
    );
    expect(view.getByRole("status").textContent).toContain(
      "Updating All automation…",
    );
    for (const control of view.getAllByRole("button"))
      expect(control).toHaveProperty("disabled", true);
  });

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

    expect(view.queryByText("Normal")).toBeNull();
    expect(view.getByRole("region", { name: "Eve status" })).toBeTruthy();
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
    expect(
      view.getByText(/Eve stays switched off until they are restored/i),
    ).toBeTruthy();
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

    expect(
      view.getByRole("heading", { name: "Audit history", level: 2 }),
    ).toBeTruthy();
    expect(view.getByText("governance.inspect")).toBeTruthy();
    expect(view.getAllByText(/verified-admin/)).toHaveLength(2);
    expect(view.getByText(/verified-admin · Administrator/)).toBeTruthy();
    expect(view.getByText("Authenticated admin: verified-admin")).toBeTruthy();
    expect(view.getByText("Not used")).toBeTruthy();
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

  it("describes runs, failures and history in plain words", () => {
    const view = render(
      <EveGovernanceView
        data={{
          system: {
            source: "persisted",
            releaseEnabled: false,
            emergencyOff: false,
            killSwitchState: createClearedEveKillSwitchState(),
            policyStatus: "ready",
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
    const text = view.container.textContent ?? "";
    expect(text).not.toMatch(/governance kernel/i);
    expect(text).not.toMatch(/app-owned/i);
    expect(text).not.toMatch(/replay metadata/i);
  });

  it("gives status pills tones that match what they mean", () => {
    const killSwitchState = createClearedEveKillSwitchState();
    const firstSwitch = Object.keys(killSwitchState)[0] as EveKillSwitchKey;
    const view = render(
      <EveGovernanceView
        data={{
          system: {
            source: "persisted",
            releaseEnabled: false,
            emergencyOff: true,
            killSwitchState: { ...killSwitchState, [firstSwitch]: true },
            policyStatus: "ready",
            stateVersion: 1,
            updatedAt: "2026-07-17T00:00:00.000Z",
          },
          recentRuns: [
            {
              id: "run-ok",
              action: "crm.lookup",
              decision: "allowed",
              reason: "governance_allowed",
              status: "completed",
              updatedAt: "2026-07-17T00:00:00.000Z",
            },
            {
              id: "run-blocked",
              action: "crm.write",
              decision: "blocked",
              reason: "release_disabled",
              status: "stopped",
              updatedAt: "2026-07-17T00:00:00.000Z",
            },
          ],
          auditHistory: [],
        }}
        isError={false}
        isLoading={false}
      />,
    );
    const tone = (text: string) =>
      view
        .getAllByText(text)
        .find((node) => node.getAttribute("data-slot") === "badge")
        ?.getAttribute("data-variant");

    // Status cards: a problem reads as a warning, a normal state as success.
    expect(tone("Needs attention")).toBe("warning");
    expect(view.queryByText("Normal")).toBeNull();
    // Kill switches: engaged is a warning, clear is success.
    expect(tone("Engaged")).toBe("warning");
    expect(
      view
        .getAllByText("Clear", { selector: "[data-slot=badge]" })[0]
        ?.getAttribute("data-variant"),
    ).toBe("success");
    // Runs read in words, with a tone for the outcome.
    expect(tone("Completed: governance allowed")).toBe("success");
    expect(tone("Stopped: release disabled")).toBe("warning");
  });
});
