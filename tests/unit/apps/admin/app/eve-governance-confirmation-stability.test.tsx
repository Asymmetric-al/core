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

interface KillSwitchConfirmationRequest {
  switchKey: EveKillSwitchKey;
  enabled: boolean;
  expectedStateVersion: number;
}

type EveGovernanceViewComponent = ComponentType<{
  data?: EveGovernanceAdminView & { auditHistory: EveAuditEventRecord[] };
  isError: boolean;
  isLoading: boolean;
  onConfirmKillSwitch?: (request: KillSwitchConfirmationRequest) => void;
  onSetKillSwitch?: (switchKey: EveKillSwitchKey, enabled: boolean) => void;
}>;

let EveGovernanceView: EveGovernanceViewComponent;

function createGovernanceView({
  allAutomationEnabled,
  stateVersion,
}: {
  allAutomationEnabled: boolean;
  stateVersion: number;
}): EveGovernanceAdminView & { auditHistory: EveAuditEventRecord[] } {
  return {
    system: {
      source: "persisted",
      releaseEnabled: false,
      emergencyOff: false,
      killSwitchState: {
        ...createClearedEveKillSwitchState(),
        all_automation: allAutomationEnabled,
      },
      policyStatus: "not_configured",
      stateVersion,
      updatedAt: "2026-07-17T00:00:00.000Z",
    },
    auditHistory: [],
    recentRuns: [],
  };
}

describe("Eve governance confirmation stability", () => {
  beforeAll(async () => {
    const pageClient =
      await import("../../../../../apps/admin/app/(app)/admin/eve/page-client");
    EveGovernanceView = pageClient.EveGovernanceView;
  });

  afterEach(cleanup);

  it("keeps the compatibility callback action stable after a rerender", () => {
    const onSetKillSwitch = vi.fn();
    const initialData = createGovernanceView({
      allAutomationEnabled: false,
      stateVersion: 1,
    });
    const latestData = createGovernanceView({
      allAutomationEnabled: true,
      stateVersion: 2,
    });
    const view = render(
      <EveGovernanceView
        data={initialData}
        isError={false}
        isLoading={false}
        onSetKillSwitch={onSetKillSwitch}
      />,
    );

    fireEvent.click(view.getAllByRole("button", { name: "Engage" })[0]!);
    view.rerender(
      <EveGovernanceView
        data={latestData}
        isError={false}
        isLoading={false}
        onSetKillSwitch={onSetKillSwitch}
      />,
    );

    expect(view.getByText("Engage All automation?")).toBeTruthy();
    fireEvent.click(view.getByRole("button", { name: "Confirm engage" }));

    expect(onSetKillSwitch).toHaveBeenCalledTimes(1);
    expect(onSetKillSwitch).toHaveBeenCalledWith("all_automation", true);
  });

  it("submits the action and state version captured when the dialog opened", () => {
    const onConfirmKillSwitch = vi.fn();
    const initialData = createGovernanceView({
      allAutomationEnabled: false,
      stateVersion: 1,
    });
    const latestData = createGovernanceView({
      allAutomationEnabled: true,
      stateVersion: 2,
    });
    const view = render(
      <EveGovernanceView
        data={initialData}
        isError={false}
        isLoading={false}
        onConfirmKillSwitch={onConfirmKillSwitch}
      />,
    );

    fireEvent.click(view.getAllByRole("button", { name: "Engage" })[0]!);
    view.rerender(
      <EveGovernanceView
        data={latestData}
        isError={false}
        isLoading={false}
        onConfirmKillSwitch={onConfirmKillSwitch}
      />,
    );

    expect(view.getByText("Engage All automation?")).toBeTruthy();
    fireEvent.click(view.getByRole("button", { name: "Confirm engage" }));

    expect(onConfirmKillSwitch).toHaveBeenCalledTimes(1);
    expect(onConfirmKillSwitch).toHaveBeenCalledWith({
      switchKey: "all_automation",
      enabled: true,
      expectedStateVersion: 1,
    });
  });

  it("captures the latest action and state version after closing and reopening", () => {
    const onConfirmKillSwitch = vi.fn();
    const initialData = createGovernanceView({
      allAutomationEnabled: false,
      stateVersion: 1,
    });
    const latestData = createGovernanceView({
      allAutomationEnabled: true,
      stateVersion: 2,
    });
    const view = render(
      <EveGovernanceView
        data={initialData}
        isError={false}
        isLoading={false}
        onConfirmKillSwitch={onConfirmKillSwitch}
      />,
    );

    fireEvent.click(view.getAllByRole("button", { name: "Engage" })[0]!);
    view.rerender(
      <EveGovernanceView
        data={latestData}
        isError={false}
        isLoading={false}
        onConfirmKillSwitch={onConfirmKillSwitch}
      />,
    );
    fireEvent.click(view.getByRole("button", { name: "Cancel" }));

    expect(onConfirmKillSwitch).not.toHaveBeenCalled();

    fireEvent.click(view.getByRole("button", { name: "Clear" }));

    expect(view.getByText("Clear All automation?")).toBeTruthy();
    fireEvent.click(view.getByRole("button", { name: "Confirm clear" }));

    expect(onConfirmKillSwitch).toHaveBeenCalledTimes(1);
    expect(onConfirmKillSwitch).toHaveBeenCalledWith({
      switchKey: "all_automation",
      enabled: false,
      expectedStateVersion: 2,
    });
  });
});
