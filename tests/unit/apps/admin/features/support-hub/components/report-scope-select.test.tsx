// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { agentsMock, inboxesMock, labelsMock, routeStateMock, setStateMock } =
  vi.hoisted(() => ({
    agentsMock: { current: [] as Array<{ id: string; name: string }> },
    inboxesMock: { current: [] as Array<{ id: string; name: string }> },
    labelsMock: { current: [] as Array<{ id: string; name: string }> },
    routeStateMock: {
      current: {
        from: "2026-04-01T00:00:00.000Z",
        to: "2026-05-01T00:00:00.000Z",
        groupBy: "day" as const,
        businessHoursOnly: false,
        scopeKind: "inbox" as "inbox" | "team",
        scopeId: "",
      },
    },
    setStateMock: vi.fn(),
  }));

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({
    useSupportTeams: () => ({
      data: [{ id: "team-1", name: "Care team" }],
      isReady: true,
      isLoading: false,
      isError: false,
    }),
    useSupportAgents: () => ({
      data: agentsMock.current,
      isError: false,
      isLoading: false,
      isReady: true,
    }),
  }),
);

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-inbox-settings",
  () => ({
    useSupportInboxes: () => ({
      data: inboxesMock.current,
      isError: false,
      isLoading: false,
      isReady: true,
    }),
  }),
);

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-labels",
  () => ({
    useSupportLabels: () => ({
      data: labelsMock.current,
      isError: false,
      isLoading: false,
      isReady: true,
    }),
  }),
);

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/report-state",
  () => ({
    useSupportReportRouteState: () => ({
      state: routeStateMock.current,
      setState: setStateMock,
      resetState: vi.fn(),
      range: {
        from: routeStateMock.current.from,
        to: routeStateMock.current.to,
      },
      scope: {
        kind: routeStateMock.current.scopeKind,
        id: routeStateMock.current.scopeId || null,
      },
      request: vi.fn(),
    }),
  }),
);

// eslint-disable-next-line no-restricted-imports -- AL-1894: Integration test exercises the app's actual selector and route-state contract.
import { ReportScopeSelect } from "../../../../../../../apps/admin/features/support-hub/components/reports/ReportScopeSelect";

describe("ReportScopeSelect", () => {
  it("keeps supported linked scopes and their target", () => {
    routeStateMock.current.scopeKind = "team";
    routeStateMock.current.scopeId = "team-1";
    render(<ReportScopeSelect kinds={["all", "team"]} />);
    expect(
      screen.getByRole("combobox", { name: "Team", exact: true }),
    ).toBeTruthy();
    expect(setStateMock).not.toHaveBeenCalled();
  });

  it("persists All when a linked scope is unsupported by the report", async () => {
    routeStateMock.current.scopeKind = "team";
    routeStateMock.current.scopeId = "team-1";
    render(<ReportScopeSelect kinds={["all", "inbox", "agent"]} />);
    await waitFor(() =>
      expect(setStateMock).toHaveBeenCalledWith({
        scopeKind: "all",
        scopeId: "",
      }),
    );
    expect(
      screen.queryByRole("combobox", { name: "Team", exact: true }),
    ).toBeNull();
  });

  it("offers actual teams rather than silently using all conversations", () => {
    routeStateMock.current.scopeKind = "team";
    render(<ReportScopeSelect />);
    expect(
      screen.getByRole("combobox", { name: "Team", exact: true }),
    ).toBeTruthy();
    expect(screen.getByText("Care team")).toBeTruthy();
  });
  beforeEach(() => {
    inboxesMock.current = [{ id: "inbox-1", name: "General Inbox" }];
    agentsMock.current = [];
    labelsMock.current = [];
    routeStateMock.current = {
      from: "2026-04-01T00:00:00.000Z",
      to: "2026-05-01T00:00:00.000Z",
      groupBy: "day",
      businessHoursOnly: false,
      scopeKind: "inbox",
      scopeId: "",
    };
    setStateMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("persists the visible fallback scope when route state has no scope id", async () => {
    render(<ReportScopeSelect />);

    await waitFor(() => {
      expect(setStateMock).toHaveBeenCalledWith({ scopeId: "inbox-1" });
    });
  });

  it("names the scope controls and shows the display label before opening the popup", () => {
    render(<ReportScopeSelect />);
    expect(
      screen.getByRole("combobox", { name: "Scope" }).textContent,
    ).toContain("Inbox");
    expect(
      screen.getByRole("combobox", { name: "Inbox" }).textContent,
    ).toContain("General Inbox");
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});
