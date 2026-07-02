// @vitest-environment jsdom

import { cleanup, render, waitFor } from "@testing-library/react";
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
        scopeKind: "inbox" as const,
        scopeId: "",
      },
    },
    setStateMock: vi.fn(),
  }));

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({
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

import { ReportScopeSelect } from "../../../../../../../apps/admin/features/support-hub/components/reports/ReportScopeSelect";

describe("ReportScopeSelect", () => {
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
});
