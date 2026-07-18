/** @vitest-environment jsdom */

import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import type { EveGovernanceAdminView } from "@asym/api/eve/governance/types";
import type { ComponentType } from "react";

type EveGovernanceViewComponent = ComponentType<{
  data?: EveGovernanceAdminView;
  errorMessage?: string;
  isError: boolean;
  isLoading: boolean;
}>;

let EveGovernanceView: EveGovernanceViewComponent;

describe("Eve governance admin view", () => {
  beforeAll(async () => {
    const pageClient =
      await import("../../../../../apps/admin/app/admin/eve/page-client");
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
            killSwitchState: {},
            policyStatus: "not_configured",
            stateVersion: 1,
            updatedAt: "2026-07-17T00:00:00.000Z",
          },
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
            killSwitchState: {},
            policyStatus: "not_configured",
            stateVersion: 1,
            updatedAt: "2026-07-17T00:00:00.000Z",
          },
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
            killSwitchState: {},
            policyStatus: "not_configured",
            stateVersion: 1,
            updatedAt: "1970-01-01T00:00:00.000Z",
          },
          recentRuns: [],
        }}
        isError={false}
        isLoading={false}
      />,
    );

    expect(view.getByText("Governance state is missing")).toBeTruthy();
    expect(view.getByText(/kernel is fail-closed/i)).toBeTruthy();
  });
});
